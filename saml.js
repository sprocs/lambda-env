const passport = require('passport')
const passportSaml = require('passport-saml')
const createError = require('http-errors')
const { safeCompare } = require('./helpers')
const aws4 = require('aws4')
const awscred = require('awscred')
const queryString = require('query-string')

let _passportStrategy = null
const getPassportStrategy = () => {
  if (_passportStrategy) {
    return _passportStrategy
  }

  _passportStrategy = createPassportStrategy()
  return _passportStrategy
}

const createPassportStrategy = () => {
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })

  // Subject = ${user:email} = emailAddress
  // email = ${user:email} = basic
  // givenName = ${user:givenName} = basic
  // familyName = ${user:familyName} = basic
  // groups = ${user:groups} = unspecified

  const strategy = new passportSaml.Strategy(
    {
      path: '/public/auth/saml_callback',
      cert: process.env.SAML_CERT,
      entryPoint: process.env.SAML_ENTRYPOINT,
      issuer: process.env.SAML_ISSUER,
      audience: process.env.SAML_AUDIENCE,
    },
    (user, done) => {
      if (!(user.email || '').match(/^\S+@\S+$/)) {
        return done(
          createError(403, 'SAML user does not contain a valid email'),
        )
      }
      if ((user.nameID || '').length === 0) {
        return done(
          createError(403, 'SAML user does not contain a valid nameID'),
        )
      }
      done(null, user)
    },
  )

  passport.use(strategy)

  return passport
}

const handlePassportCallback = (req, res, next) => {
  return async (err, user, info) => {
    if (err) {
      console.error('SAML ERROR', err)
      if (err.code === 'ERR_OSSL_ASN1_WRONG_TAG') {
        return next(createError(500, 'SAML certificate error'))
      }
      return next(createError(403, 'Could not validate your SAML request'))
    }

    if (!user) {
      // Verify user
      return next(createError(403, 'Invalid SAML user'))
    }

    console.log(user)
    console.log('got SAML user', user.nameID, user.email, user.groups)
    console.log('got RelayState', req.body.RelayState)

    const userRole = getRoleFromUserAttributes(user)
    if (!userRole) {
      return next(
        createError(
          403,
          'SAML user is not entitled to access this application',
        ),
      )
    }

    awscred.load(async (err, data) => {
      if (err) {
        console.error('Could not load AWS credentials.')
        throw err
      }

      const queryStringStr = queryString.stringify({
        Version: '2011-06-15',
        Action: 'AssumeRole',
        RoleArn: userRole,
        RoleSessionName: cleanAssumeRoleString(user.email),
        SourceIdentity: cleanAssumeRoleString(user.nameID),
        DurationSeconds:
          parseInt(process.env.SAML_SESSION_DURATION_SECONDS, 10) || 28800, // 8 hours default
        'Tags.member.1.Key': 'nameID',
        'Tags.member.1.Value': user.nameID,
        'Tags.member.2.Key': 'email',
        'Tags.member.2.Value': user.email,
        'Tags.member.3.Key': 'source',
        'Tags.member.3.Value': 'SAML',
      })

      // STS urls are default valid for 15 minutes
      const { host, path } = aws4.sign(
        {
          host: `sts.${data.region}.amazonaws.com`,
          path: `/?` + queryStringStr,
          region: data.region,
          service: 'sts',
          signQuery: true,
        },
        data.credentials,
      )
      const signedStsUrl = `https://${host}${path}`
      const stsB64 = Buffer.from(signedStsUrl).toString('base64')

      let parsedRedirectDomain = null
      const relayStateDomain = req.body.RelayState
      if (relayStateDomain) {
        try {
          parsedRedirectDomain = new URL(relayStateDomain)
          console.debug('parsed RelayState domain', relayStateDomain)
        } catch (e) {
          console.error('failed to parse RelayState, skipping', e)
        }
      }

      if (!parsedRedirectDomain && process.env.APP_DOMAIN) {
        try {
          parsedRedirectDomain = new URL(process.env.APP_DOMAIN)
          console.debug('parsed APP_DOMAIN', process.env.APP_DOMAIN)
        } catch (e) {
          console.error('failed to parse APP_DOMAIN, skipping', e)
        }
      }

      let appSpawnPath = null
      if (parsedRedirectDomain) {
        appSpawnPath = `https://${parsedRedirectDomain.host}`
        console.log('redirecting to', appSpawnPath)
        res.redirect(`${appSpawnPath}?spawnStsUrl=${stsB64}`)
      } else if (process.env.AMPLIFY_APP_ID) {
        appSpawnPath = `https://${process.env.AWS_BRANCH || process.env.ENV}.${
          process.env.AMPLIFY_APP_ID
        }.amplifyapps.com/spawn`
        console.log(
          'redirecting to AMPLIFY_APP_ID with most recent AWS_BRANCH or default ENV',
          appSpawnPath,
        )
        res.redirect(`${appSpawnPath}?spawnStsUrl=${stsB64}`)
      } else {
        res.json({
          stsUrl: signedStsUrl,
        })
      }
    })
  }
}

// Strip AWS API unsupported characters
const cleanAssumeRoleString = (str) =>
  str.replace(/[^\w+=,.@-]/g, '_').replace(/[_]+/g, '_')

const appUserRoleArn = () =>
  process.env.SAML_USER_ROLE_ARN ||
  `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${process.env.APP}UserRole-${process.env.ENV}`

const appAdminRoleArn = () =>
  process.env.SAML_ADMIN_ROLE_ARN ||
  `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${process.env.APP}AdminRole-${process.env.ENV}`

const getRoleFromUserAttributes = (user) => {
  const _groups = user.groups ? [user.groups].flat() : []

  const adminGroupId = _groups.find((userGroupId) => {
    return safeCompare(userGroupId, process.env.SAML_ADMIN_GROUP)
  })

  if (adminGroupId) {
    console.log('Matched admin role', adminGroupId)
    return appAdminRoleArn()
  } else if (
    safeCompare(
      (user[process.env.SAML_ADMIN_BOOLEAN_ATTRIBUTE] || '')
        .toString()
        .toLowerCase(),
      'true',
    )
  ) {
    console.log('Matched admin boolean attribute')
    return appAdminRoleArn()
  }
  const userGroupId = _groups.find((userGroupId) => {
    return safeCompare(userGroupId, process.env.SAML_USER_GROUP)
  })

  if (userGroupId) {
    console.log('Matched user role', userGroupId)
    return appUserRoleArn()
  } else if (
    safeCompare(
      (user[process.env.SAML_USER_BOOLEAN_ATTRIBUTE] || '')
        .toString()
        .toLowerCase(),
      'true',
    )
  ) {
    console.log('Matched user boolean attribute')
    return appUserRoleArn()
  }

  if (safeCompare(process.env.SAML_DEFAULT_ACCESS, 'ADMIN')) {
    console.log('Default access is admin role')
    return appAdminRoleArn()
  } else if (safeCompare(process.env.SAML_DEFAULT_ACCESS, 'USER')) {
    console.log('Default access is user role')
    return appUserRoleArn()
  }

  return null
}

const isSAMLSetup = () => {
  return (
    process.env.SAML_CERT &&
    process.env.SAML_ENTRYPOINT &&
    process.env.SAML_ISSUER &&
    process.env.SAML_AUDIENCE &&
    process.env.ENV &&
    process.env.APP &&
    process.env.ACCOUNT_ID
  )
}

module.exports = {
  getPassportStrategy,
  createPassportStrategy,
  handlePassportCallback,
  appUserRoleArn,
  appAdminRoleArn,
  getRoleFromUserAttributes,
  isSAMLSetup,
}
