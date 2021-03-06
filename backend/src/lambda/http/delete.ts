import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteCAPSTONE } from '../../businessLogic/items'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'

const myLogger = createLogger("deleteCAPSTONE")

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  myLogger.info("Incoming event: ", event)

  const CAPSTONEId = event.pathParameters.CAPSTONEId

  if (!CAPSTONEId) {
    myLogger.error("No ID was provided")
    throw new Error("No ID was provided")
  }

  await deleteCAPSTONE(CAPSTONEId, getJwtToken(event))

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null
  };

}
