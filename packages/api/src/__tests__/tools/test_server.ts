import { DefaultApi, Configuration } from '@choco/api-client'
import axios from 'axios'
import { Server } from 'http'
import { app } from '../../app'
import { randomUUID } from 'crypto'

let server: Server

export async function startTestServer() {
  server = await app.listen(4009)
}

export async function closeTestServer() {
  if (server) {
    await server.close()
  }
}

export function getTestClient(fbToken?: string | null) {
  let token = fbToken

  if (token === undefined) {
    token = randomUUID()
  }

  const axiosInstance = axios.create(
    token !== null
      ? {
          headers: { 'firebase-token': token },
        }
      : undefined
  )

  return new DefaultApi(
    new Configuration(),
    'http://localhost:4009',
    axiosInstance
  )
}
