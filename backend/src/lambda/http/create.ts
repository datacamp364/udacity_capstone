import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateCAPSTONERequest } from '../../requests/CreateCAPSTONERequest'
import { createCAPSTONE } from '../../businessLogic/items'
import { createLogger } from '../../utils/logger'
//import { getJwtToken } from '../utils'

const myLogger = createLogger("createCAPSTONE")

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  myLogger.info('Processing event: ', event)
  const newCAPSTONE: CreateCAPSTONERequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  if (!newCAPSTONE.name) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: "Name of a task could not be empty" })
    }
  }

  const newItem = await createCAPSTONE(newCAPSTONE, jwtToken)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }

}
