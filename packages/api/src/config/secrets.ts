import { defineSecret } from 'firebase-functions/params'

export const postgressConnectionURL = defineSecret('POSTGRESS_CONNECTION_URL')
export const openaiOrganization = defineSecret('OPEN_AI_ORG')
export const openaiApiKey = defineSecret('OPEN_AI_API_KEY')
export const adaptyApiKey = defineSecret('ADAPTY_API_KEY')

export default [postgressConnectionURL]
