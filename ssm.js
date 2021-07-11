const { SSM } = require('aws-sdk')
const { configWithLocal } = require('./amplify')
const ssmClient = new SSM(configWithLocal())

const getAllSSMParametersByPath = async (path, NextToken, parameters = {}) => {
  return new Promise((resolve, reject) => {
    const queryOpts = {
      Path: path,
      Recursive: false,
      WithDecryption: true,
    }
    let request = ssmClient.getParametersByPath(
      NextToken ? Object.assign({}, queryOpts, { NextToken }) : queryOpts,
      function (err, response) {
        if (err) {
          reject(err)
        } else {
          for (let i = 0; i < response.Parameters.length; i++) {
            let item = response.Parameters[i]
            const parameterNameSplit = item.Name.split('/')
            const envVarName = parameterNameSplit[parameterNameSplit.length - 1]
            parameters[envVarName] = item.Value
            if (process.env[envVarName]) {
              console.debug(
                `ENV ${envVarName} already exists, skipping SSM value`,
              )
            } else {
              console.debug(`Setting ENV ${envVarName} var from SSM`)
              process.env[envVarName] = item.Value
            }
          }
          if (response.NextToken) {
            getAllSSMParametersByPath(path, response.NextToken, parameters)
              .then(resolve)
              .catch(reject)
          } else {
            resolve(parameters)
          }
        }
      },
    )
  })
}

let ssmParameters = null
const loadSSMParameters = async () => {
  if (ssmParameters) {
    return Promise.resolve(ssmParameters)
  } else {
    try {
      const ssmPath = `/sprocs/${process.env.APP}/${
        !process.env.ENV || process.env.ENV === 'NONE' ? 'dev' : process.env.ENV
      }`
      console.debug('Loading SSM parameters for', ssmPath)
      ssmParameters = await getAllSSMParametersByPath(ssmPath)
      return Promise.resolve(ssmParameters)
    } catch (err) {
      console.error(err)
      return Promise.reject('Error getting to SSM parameters')
    }
  }
}

module.exports = {
  loadSSMParameters,
  getAllSSMParametersByPath,
}
