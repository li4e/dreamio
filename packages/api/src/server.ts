import { onInit } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'
import secretsList, { secrets } from './config/secrets' // secrets
import { initializeAdminSDK } from './integrations/firebase'

onInit(async () => {
  process.env.POSTGRESS_CONNECTION_URL = secrets.pgConenctionUrl.value()
  initializeAdminSDK()
})

export const api = onRequest(
  { secrets: secretsList, memory: '512MiB', timeoutSeconds: 540 },
  app
)
export { handleGenerationRequest } from './functions/handleGenerationRequest'
