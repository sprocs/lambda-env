const getMethodBasedOnRecordEventName = ({ record }) => {
  const { eventName } = record
  switch (eventName) {
    case 'INSERT':
      return 'post'
    case 'MODIFY':
      return 'put'
    case 'REMOVE':
      return 'delete'
  }
}

const getPath = ({ method, record }) => {
  switch (method) {
    case 'post':
      return '/dynamodb'
    default:
      return `/dynamodb/${record.dynamodb.NewImage.id.S}`
  }
}

const mapDynamoDbEventToHttpRequest = ({ event }) => {
  const record = event.Records[0]
  const method = getMethodBasedOnRecordEventName({ record })
  const path = getPath({ method, record })

  return {
    method,
    path,
    headers: {},
  }
}

const mapResponseToDynamoDb = ({
  statusCode,
  body,
  headers,
  isBase64Encoded,
}) => {
  return {
    statusCode,
    body,
    headers,
    isBase64Encoded,
  }
}

const handleApiError = (err, res) => {
  const { statusCode, code, status, message, inner } = err
  let serverStatus = statusCode || status
  if (serverStatus) {
    res.status(serverStatus).json({
      error: true,
      statusCode: serverStatus,
      message: message || inner?.message,
    })
  } else {
    // Unhandled error
    res.status(500).json({
      error: true,
      statusCode: 500,
      message: 'API exception',
    })
  }
}

module.exports = {
  mapDynamoDbEventToHttpRequest,
  mapResponseToDynamoDb,
  handleApiError,
}
