const {
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb,
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

module.exports = {
  // apiGateway
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb,
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
}
