const {
  envTableName,
  dynamoDBConfigWithLocal,
  configWithLocal,
} = require('./amplifyConfig')
const AWS = require('aws-sdk')

const documentClient = new AWS.DynamoDB.DocumentClient(
  Object.assign({ convertEmptyValues: true }, dynamoDBConfigWithLocal()),
)

AWS.config.logger = console

const ddbAll = async (
  operation,
  queryOpts,
  ExclusiveStartKey,
  results = [],
) => {
  return new Promise((resolve, reject) => {
    let request = documentClient[operation](
      ExclusiveStartKey
        ? Object.assign({}, queryOpts, { ExclusiveStartKey })
        : queryOpts,
      function (err, response) {
        if (err) {
          reject(err)
        } else {
          if (response.LastEvaluatedKey) {
            ddbAll(
              operation,
              queryOpts,
              response.LastEvaluatedKey,
              results.concat(response.Items),
            )
              .then(resolve)
              .catch(reject)
          } else {
            resolve(results.concat(response.Items))
          }
        }
      },
    )
  })
}

module.exports = {
  ddbAll,
  documentClient,
}
