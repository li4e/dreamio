import { defineSecret } from 'firebase-functions/params'

export const postgressConnectionURL = defineSecret('POSTGRESS_CONNECTION_URL')
export const openaiToken = defineSecret('OPEN_AI_TOKEN')
export const openaiOrganization = defineSecret('OPEN_AI_ORG')

export default [postgressConnectionURL]
