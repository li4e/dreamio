import { UserController } from '../controllers/user'

describe('Test /users/1', () => {
  describe('GET user test', () => {
    it('user should be returned', async () => {
      const controller = new UserController()

      const actualResult = await controller.getUser('valid', {
        user: { id: 1, freeCredits: 0 },
      })

      expect(actualResult).toEqual({ data: { id: 1, freeCredits: 0 } })
    })
  })
})
