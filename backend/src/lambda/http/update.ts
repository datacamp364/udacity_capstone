import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateCAPSTONERequest } from '../../requests/UpdateCAPSTONERequest'
import { updateCAPSTONE } from '../../businessLogic/items'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'

const myLogger = createLogger("updateCAPSTONE")

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  myLogger.info("Incoming event: ", event)

  const CAPSTONEId = event.pathParameters.CAPSTONEId
  const newCAPSTONE: UpdateCAPSTONERequest = JSON.parse(event.body)

  if (!CAPSTONEId) {
    myLogger.error("No ID was provided")
    throw new Error("No ID was provided")
  }

  if (!newCAPSTONE) {
    myLogger.error("No information to update provided")
    throw new Error("No information to update provided")
  }

  // CAPSTONE: Update a CAPSTONE item with the provided id using values in the "newCAPSTONE" object
  const updatedCAPSTONE = await updateCAPSTONE(CAPSTONEId, newCAPSTONE, getJwtToken(event))

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      updatedCAPSTONE
    })
  }


}
