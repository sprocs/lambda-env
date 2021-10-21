const {
  envTableName,
  dynamoDBConfigWithLocal,
  configWithLocal,
} = require('./amplify')
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

const ddbUpdateExpression = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((k) => `${k} = :${k}`).join(', ')
  } else {
    return Object.keys(obj)
      .map((k) => `${k} = :${k}`)
      .join(', ')
  }
}

const ddbUpdateAttributeValues = (obj, keys) => {
  let attrValues = {}
  if (keys) {
    keys.forEach((k) => {
      attrValues[`:${k}`] = (obj[k] === undefined || obj[k] === null) ? '' : obj[k]
    })
  } else {
    Object.entries(obj).forEach(([k, v]) => {
      attrValues[`:${k}`] = (v === undefined || v === null) ? '' : v
    })
  }
  return attrValues
}


module.exports = {
  ddbAll,
  ddbUpdateExpression,
  ddbUpdateAttributeValues,
  documentClient,
}
