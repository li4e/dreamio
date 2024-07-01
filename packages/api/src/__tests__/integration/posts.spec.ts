import supertest from 'supertest'
import { app } from '../../app'
import { prepareDB } from '../tools/prepare_db'
import { Server } from 'http'
import { DefaultApi, Configuration } from '@choco/api-client'
import axios from 'axios'

let server: Server

beforeAll(async () => {
  await prepareDB()
  server = await app.listen(4009)
})

afterAll(async () => {
  if (server) {
    await server.close()
  }
})

describe('Integration test /posts', () => {
  const axiosInstance = axios.create({ headers: { 'firebase-token': 'valid' } })
  const apiClient = new DefaultApi(
    new Configuration(),
    'http://localhost:4009',
    axiosInstance
  )

  describe('Valid GET user test', () => {
    it('user should be returned without error', async () => {
      const generation = await apiClient
        .createGeneration({
          prompt: 'Super image',
          enhancer: false,
        })
        .then((res) => res.data.data.generation)

      if (!generation) {
        throw new Error('Generation is null')
      }

      expect(generation).not.toBeNull()
    })

    it('401 should be returned with error', async () => {
      await supertest(app)
        .get('/users/2')
        .set('content-type', 'application/json')
        .expect(401)
        .expect('Content-Type', /json/)
    })
  })
})
