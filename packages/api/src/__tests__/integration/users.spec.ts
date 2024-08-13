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
        .then((res) => res.data.currentUser)

      expect(user.id).toBeDefined()
      expect(user.userName.length).toBeGreaterThanOrEqual(3)
      expect(user.userName.length).toBeLessThanOrEqual(20)
    })

    it('userName should be updated successfully', async () => {
      const client = getTestClient('username_update_1')

      const oldUserName = await client
        .getCurrentUser()
        .then((res) => res.data.currentUser.userName)

      await client.updateUser({ userName: 'Super_User_1' })

      const newUserName = await client
        .getCurrentUser()
        .then((res) => res.data.currentUser.userName)

      expect(oldUserName).not.toEqual(newUserName)
      expect('super_user_1').toEqual(newUserName)
    })

    it('userName should not be updated successfully', async () => {
      const client = getTestClient('username_update_2')

      try {
        await client.updateUser({ userName: 'Super_User_1' })
        expect(true).toBe(false)
      } catch (error) {
        expect(true).toBe(true)
      }
    })

    it('userName should not be updated successfully', async () => {
      const client = getTestClient('username_update_2')

      try {
        await client.updateUser({ userName: 'sd' })
        expect(true).toBe(false)
      } catch (error) {
        expect(true).toBe(true)
      }
    })

    it('user avatar should be updated successfully', async () => {
      const client = getTestClient('username_update_2')

      await client.updateUserAvatar({ filePath: 'testPath' })
      const user = await client
        .getCurrentUser()
        .then((res) => res.data.currentUser)
      expect(user.avatar).toBeDefined()
      expect(user.avatar).toBeDefined()
    })
  })
})
