import { DefaultApi, Configuration } from '@choco/api-client'
import axios from 'axios'
import { Server } from 'http'
import { app } from '../../app'

let server: Server

export async function startTestServer() {
  server = await app.listen(4009)
}

export async function closeTestServer() {
  if (server) {
    await server.close()
  }
}

export function getTestClient(fbToken?: string) {
  const axiosInstance = axios.create({
    headers: { 'firebase-token': fbToken },
  })

  return new DefaultApi(
    new Configuration(),
    'http://localhost:4009',
    axiosInstance
  )
}

export const testApiClient = getTestClient('valid')
export const testApiClientNoAuth = getTestClient()
