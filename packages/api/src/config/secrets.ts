import { defineSecret } from 'firebase-functions/params'

export const postgressConnectionURL = defineSecret('POSTGRESS_CONNECTION_URL')

export default [postgressConnectionURL]
