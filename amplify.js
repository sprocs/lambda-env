const { SharedIniFileCredentials, SSM } = require('aws-sdk')
const crypto = require('crypto')

const configWithLocal = () => {
  if (process.env.REGION && process.env.REGION.match(/fake/)) {
    // Config for testing locally with amplify mock
    const credentials = new SharedIniFileCredentials({
      profile: process.env.AWS_PROFILE || 'sprocs-amplify',
    })
    return {
      credentials,
      region: 'us-east-2',
    }
  } else {
    return {}
  }
}

// Use dev env when using local mocking
const envWithLocal = () =>
  process.env.ENV === 'NONE' ? 'dev' : process.env.ENV

const dynamoDBConfigWithLocal = () => {
  if (process.env.REGION && process.env.REGION.match(/fake/)) {
    return {
      endpoint: 'http://localhost:62224',
      region: 'us-fake-1',
      accessKeyId: 'fake',
      secretAccessKey: 'fake',
    }
  } else {
    return {}
  }
}

// get tables in AppSync table name format
const envTableName = (tableName) => {
  if (process.env.ENV && process.env.ENV === 'NONE') {
    return `${tableName}Table`
  } else {
    return `${tableName}-${
      process.env[`API_${process.env.APP}_GQL_GRAPHQLAPIIDOUTPUT`]
    }-${process.env.ENV}`
  }
}

const jwtSecretKey = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set')
  }
  return crypto.createSecretKey(
    Buffer.from(process.env.JWT_SECRET.substring(0, 64), 'hex'),
  )
}

const isTestEnv = () => {
  return !process.env.ENV || process.env.ENV === 'NONE'
}

module.exports = {
  configWithLocal,
  envWithLocal,
  dynamoDBConfigWithLocal,
  envTableName,
  jwtSecretKey,
  isTestEnv,
}
