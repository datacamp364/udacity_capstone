/**
 * AWS-SPECIFIC! This code is very AWS / vendor specific and contatins code to directly
 * connect to a DynamoDB database (which is AWS specific)
 */
import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { CAPSTONEUpdate } from '../models/CAPSTONEUpdate'
import { CAPSTONEItem } from '../models/CAPSTONEItem'
import { createLogger } from '../utils/logger'
import { getUserIdFromJWT } from '../lambda/utils'

const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const myLogger = createLogger("CAPSTONEAccess")

export class CAPSTONEAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly CAPSTONETable = process.env.CAPSTONE_TABLE) {
    }

    /**
     *  ##################### NOW THE CRUD OPERATIONS FOLLOW #####################
     */



    /**
     * Creates a new CAPSTONE item 
     * @param CAPSTONEItem item that has to be created 
     * @returns newly created item 
     */
    async createCAPSTONEItem(CAPSTONEItem: CAPSTONEItem): Promise<CAPSTONEItem> {
        await this.docClient.put({
            TableName: this.CAPSTONETable,
            Item: CAPSTONEItem
        }).promise()

        return CAPSTONEItem
    }

    /**
     * Returns all CAPSTONE items for a specific user 
     * @returns 
     */
    async getAllCAPSTONEItems(jwtToken: string): Promise<CAPSTONEItem[]> {
        myLogger.info('Getting all CAPSTONE items')

        const userId = getUserIdFromJWT(jwtToken)

        const result = await this.docClient.query({
            TableName: this.CAPSTONETable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as CAPSTONEItem[]
    }

    /**
     * Deletes a CAPSTONE item
     * @param CAPSTONEId 
     * @param userId 
     * @returns 
     */
    async deleteCAPSTONEItem(CAPSTONEId: string, userId: string) {
        await this.docClient.delete({
            TableName: this.CAPSTONETable,
            Key: {
                "CAPSTONEId": CAPSTONEId,
                "userId": userId
            }
        }).promise()
    }

    /**
     * Updates a specific CAPSTONE item 
     * @param CAPSTONEId 
     * @param userId 
     * @param updatedCAPSTONE 
     * @returns 
     */
    async updateCAPSTONEItem(CAPSTONEId: string, userId: string, newCAPSTONE: CAPSTONEUpdate): Promise<CAPSTONEUpdate> {
        await this.docClient.update({
            TableName: this.CAPSTONETable,
            Key: {
                "CAPSTONEId": CAPSTONEId,
                "userId": userId
            },
            UpdateExpression: "set #n=:name, dueDate=:duedate, done=:done",
            ExpressionAttributeValues: {
                ":name": newCAPSTONE.name,
                ":duedate": newCAPSTONE.dueDate,
                ":done": newCAPSTONE.done
            },
            ExpressionAttributeNames: {
                "#n": "name"
            }
        }).promise()

        return newCAPSTONE
    }
}

/**
 * Creates a DynamoDB client in a way that supports local deployment 
 * @returns DynamoDB client
 */
function createDynamoDBClient() {
    console.log('Creating a local DynamoDB instance')

    if (process.env.IS_OFFLINE) {
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
