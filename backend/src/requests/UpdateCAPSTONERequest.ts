/**
 * Fields in a request to update a single CAPSTONE item.
 */
export interface UpdateCAPSTONERequest {
  name: string
  dueDate: string
  done: boolean
}