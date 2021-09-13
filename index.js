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

const { documentClient, ddbAll } = require('./dynamodb')

const { safeCompare } = require('./helpers')

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
  documentClient,
  ddbAll,
  // helpers
  safeCompare,
  // SAML
  isSAMLSetup,
  getPassportStrategy,
  createPassportStrategy,
  handlePassportCallback,
  appUserRoleArn,
  appAdminRoleArn,
  getRoleFromUserGroups,
}
