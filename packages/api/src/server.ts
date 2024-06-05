import { onInit } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'
import secretsList, { secrets } from './config/secrets'

onInit(() => {
  process.env.POSTGRESS_CONNECTION_URL = secrets.pgConenctionUrl.value()
})

export const api = onRequest({ secrets: secretsList }, app)
