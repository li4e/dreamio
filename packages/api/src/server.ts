import { onInit } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { app } from './app'
import secrets, { postgressConnectionURL } from './config/secrets'

onInit(() => {
  process.env.POSTGRESS_CONNECTION_URL = postgressConnectionURL.value()
})

export const api = onRequest({ secrets }, app)
