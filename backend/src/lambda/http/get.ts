import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { getCAPSTONEPerUser } from '../../businessLogic/items'

const myLogger = createLogger("getCAPSTONE")

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  myLogger.info("Incoming event: ", event)

  // First check if valid token is present 
  try {
    const jwttoken = getJwtToken(event)

    const listOfCAPSTONE = await getCAPSTONEPerUser(jwttoken)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: listOfCAPSTONE
      })
    }

  }
  catch (e) {

    myLogger.error("Invalid token provided")

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Invalid token provided'
      })
    }
  }
}
