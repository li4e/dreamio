import { isAxiosError } from 'axios'
import { prepareDB } from '../tools/prepare_db'

import {
  startTestServer,
  closeTestServer,
  testApiClient,
  testApiClientNoAuth,
} from '../tools/test_server'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /users', () => {
  describe('Valid GET user test', () => {
    it('user should be returned without error', async () => {
      const getUserRes = await testApiClient.getUser(2)

      expect(getUserRes.data.profile.userId).toBe(1)
      expect(getUserRes.data.profile.userIdFromPath).toBe(2)
    })

    it('401 should be returned with error', async () => {
      try {
        await testApiClientNoAuth.getUser(2)
        expect(true).toBe(false)
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).toBe(401)
        } else {
          throw error
        }
      }
    })
  })
})
