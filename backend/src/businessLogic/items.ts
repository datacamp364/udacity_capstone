/**
 * Contains the business logic for handling CAPSTONE 
 * 
 * In theory this whole logic can be moved to another vendor if needed, because nothing AWS
 * specific is used here 
 */

// external dependencies 
import * as uuid from 'uuid'

// internal dependencies 
import { CAPSTONEItem } from "../models/CAPSTONEItem"
import { CAPSTONEUpdate } from "../models/CAPSTONEUpdate"
import { CreateCAPSTONERequest } from "../requests/CreateCAPSTONERequest"
import { parseUserId } from "../auth/utils"
import { UpdateCAPSTONERequest } from "../requests/UpdateCAPSTONERequest"
import { CAPSTONEAccess } from "../dataLayer/CAPSTONEAccess"

const accessClass = new CAPSTONEAccess()
import { getUploadUrl } from "../dataLayer/attachmentUtils"

const bucketName = process.env.ATTACHEMENT_S3_BUCKET;

/**
 * Getting CAPSTONE items per user (from JWT Token)
 * @param jwtToken used token to identify the user 
 * @returns list of CAPSTONE items 
 */
export async function getCAPSTONEPerUser(jwtToken: string): Promise<CAPSTONEItem[]> {
    return accessClass.getAllCAPSTONEItems(jwtToken)
}

/**
 * Creates a new CAPSTONE item in the databases and generates a new unique ID with UUID 
 * @param createCAPSTONERequest DTO that contains information provided by UI for a new CAPSTONE item 
 * @param jwtToken token to identify the user 
 * @returns When successful then the newely created CAPSTONE item as JSON 
 */
export async function createCAPSTONE(
    createCAPSTONERequest: CreateCAPSTONERequest,
    jwtToken: string
): Promise<CAPSTONEItem> {
    const new_CAPSTONE_id = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await accessClass.createCAPSTONEItem({
        CAPSTONEId: new_CAPSTONE_id,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: createCAPSTONERequest.name,
        dueDate: createCAPSTONERequest.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${new_CAPSTONE_id}`
    })
}

/**
 * Updates an existing CAPSTONE item in database 
 * @param CAPSTONEId Existing CAPSTONE items id that has to be updated 
 * @param updatedCAPSTONE DTO that contains the changes to update 
 * @param jwtToken token to identify the user 
 * @returns When successful then the updated CAPSTONE item as JSON
 */
export async function updateCAPSTONE(
    CAPSTONEId: string,
    updatedCAPSTONE: UpdateCAPSTONERequest,
    jwtToken: string
): Promise<CAPSTONEUpdate> {
    const userId = parseUserId(jwtToken)

    return await accessClass.updateCAPSTONEItem(CAPSTONEId, userId, updatedCAPSTONE)
}

/**
 * Deletes existing CAPSTONE item with provided ID 
 * @param CAPSTONEId ID of CAPSTONE item that has to be deleted 
 * @param jwtToken token to identify the user 
 * @returns When successful then the updated CAPSTONE item as JSON
 */
export async function deleteCAPSTONE(CAPSTONEId: string, jwtToken: string) {
    const userId = parseUserId(jwtToken)
    return await accessClass.deleteCAPSTONEItem(CAPSTONEId, userId)
}

/**
 * Returns back the signed attachement URL by using another component 
 * @param CAPSTONEId ID of the affacted CAPSTONE item 
 * @returns signed S3 URL 
 */
export function generateUploadUrl(CAPSTONEId: string): string {
    return getUploadUrl(CAPSTONEId)
}