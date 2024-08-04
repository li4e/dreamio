import { isAxiosError } from 'axios'
import { prepareDB } from '../tools/prepare_db'

import {
  startTestServer,
  closeTestServer,
  getTestClient,
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
      const getUserRes = await getTestClient().getUser(2)

      expect(getUserRes.data.profile.userId).toBe(1)
      expect(getUserRes.data.profile.userIdFromPath).toBe(2)
    })

    it('401 should be returned with error', async () => {
      try {
        await getTestClient(null).getUser(2)
        expect(true).toBe(false)
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).toBe(401)
        } else {
          throw error
        }
      }
    })

    it('current user should be returned without error', async () => {
      const user = await getTestClient()
        .getCurrentUser()
        .then((res) => res.data.user)

      expect(user.id).toBeDefined()
      expect(user.userName.length).toBeGreaterThanOrEqual(3)
      expect(user.userName.length).toBeLessThanOrEqual(20)
    })
  })
})
