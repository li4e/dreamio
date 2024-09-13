import { onInit } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'
import secretsList, { secrets } from './config/secrets' // secrets
import { initializeAdminSDK } from './integrations/firebase'
import { handleGenerationRequest } from './functions/handleGenerationRequest'

onInit(async () => {
  process.env.POSTGRESS_CONNECTION_URL = secrets.pgConenctionUrl.value()
  initializeAdminSDK()
})

const api = onRequest({ secrets: secretsList }, app)

export default { api, handleGenerationRequest }
