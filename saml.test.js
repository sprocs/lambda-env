describe('env vars', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('admin group matching', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_GROUP = 'USER_GROUP'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP', 'ADMIN_GROUP'],
      }),
    ).toBe('ADMIN_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP', 'ADMIN_GROUP', 'USER_GROUP'],
      }),
    ).toBe('ADMIN_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: 'ADMIN_GROUP',
      }),
    ).toBe('ADMIN_ARN')
  })

  test('admin group no match', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_GROUP = 'USER_GROUP'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({
        groups: 'OTHER_GROUP',
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({}),
    ).toBeFalsy()
  })

  test('user group matching', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_GROUP = 'USER_GROUP'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP', 'USER_GROUP'],
      }),
    ).toBe('USER_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: 'USER_GROUP',
      }),
    ).toBe('USER_ARN')
  })

  test('user group no match', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_GROUP = 'USER_GROUP'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({
        groups: 'OTHER_GROUP',
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({}),
    ).toBeFalsy()
  })

  test('admin attribute match', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_ADMIN_BOOLEAN_ATTRIBUTE = 'isAdmin'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: 'true'
      }),
    ).toBe('ADMIN_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: true
      }),
    ).toBe('ADMIN_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: 'false'
      }),
    ).toBeFalsy()
  })

  test('user attribute match', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_ADMIN_BOOLEAN_ATTRIBUTE = 'isAdmin'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_BOOLEAN_ATTRIBUTE = 'isUser'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: 'false',
        isUser: 'true'
      }),
    ).toBe('USER_ARN')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isUser: 'false'
      }),
    ).toBeFalsy()

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
      }),
    ).toBeFalsy()
  })

  test('default access user', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_ADMIN_BOOLEAN_ATTRIBUTE = 'isAdmin'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_BOOLEAN_ATTRIBUTE = 'isUser'
    process.env.SAML_DEFAULT_ACCESS = 'USER'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: 'false',
        isUser: 'false'
      }),
    ).toBe('USER_ARN')
  })

  test('default access admin', () => {
    process.env.SAML_ADMIN_ROLE_ARN = 'ADMIN_ARN'
    process.env.SAML_ADMIN_GROUP = 'ADMIN_GROUP'
    process.env.SAML_ADMIN_BOOLEAN_ATTRIBUTE = 'isAdmin'
    process.env.SAML_USER_ROLE_ARN = 'USER_ARN'
    process.env.SAML_USER_BOOLEAN_ATTRIBUTE = 'isUser'
    process.env.SAML_DEFAULT_ACCESS = 'ADMIN'

    const { getRoleFromUserAttributes } = require('./saml')

    expect(
      getRoleFromUserAttributes({
        groups: ['OTHER_GROUP'],
        isAdmin: 'false',
        isUser: 'false'
      }),
    ).toBe('ADMIN_ARN')
  })
})
