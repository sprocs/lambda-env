const {
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb,
  handleApiError,
} = require('./apiGateway')

const {
  configWithLocal,
  envWithLocal,
  dynamoDBConfigWithLocal,
  envTableName,
  jwtSecretKey,
  isTestEnv,
} = require('./amplify')

const { loadSSMParameters, getAllSSMParametersByPath } = require('./ssm')

const {
  ddbAll,
  ddbUpdateExpression,
  ddbUpdateAttributeValues,
  documentClient,
} = require('./dynamodb')

const {
  formatE164,
  parsePhoneNumber,
  isValidPhoneNumber,
} = require('./phone')

const {
  safeCompare,
  generateUUID,
  parseExtensionFromFilename,
  isBlank,
  objectSubset,
  isValidId,
} = require('./helpers')

const {
  getPassportStrategy,
  createPassportStrategy,
  handlePassportCallback,
  appUserRoleArn,
  appAdminRoleArn,
  getRoleFromUserGroups,
  isSAMLSetup,
} = require('./saml')

module.exports = {
  // apiGateway
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb,
  handleApiError,
  // amplify
  configWithLocal,
  envWithLocal,
  dynamoDBConfigWithLocal,
  envTableName,
  jwtSecretKey,
  isTestEnv,
  // ssm
  loadSSMParameters,
  getAllSSMParametersByPath,
  // dynamodb
  ddbAll,
  ddbUpdateExpression,
  ddbUpdateAttributeValues,
  documentClient,
  // helpers
  safeCompare,
  generateUUID,
  parseExtensionFromFilename,
  isBlank,
  objectSubset,
  isValidId,
  // SAML
  isSAMLSetup,
  getPassportStrategy,
  createPassportStrategy,
  handlePassportCallback,
  appUserRoleArn,
  appAdminRoleArn,
  getRoleFromUserGroups,
  // phone
  formatE164,
  parsePhoneNumber,
  isValidPhoneNumber,
}
