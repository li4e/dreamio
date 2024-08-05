import { prepareDB } from '../tools/prepare_db'
import { CreditManager } from '../../managers/credit'
import { UserService } from '../../services/user'
import { UserModel } from '../../models/UserModel'
import { app } from '../../app'
import supertest from 'supertest'

beforeAll(async () => {
  await prepareDB()
})

describe('CreditManager Test', () => {
  it('FreeCredits should be consumed and reverted back correctly', async () => {
    const userId = await UserService.getUserIdByFirebaseId('super')
    const populatedUser = await new UserService(userId).getPopulated()
    const creditManager = new CreditManager(populatedUser)

    let user = new UserModel(await new UserService(userId).getPopulated())
    async function refreshUser() {
      user = new UserModel(await new UserService(userId).getPopulated())
    }

    expect(user.data.credits).toBe(1)

    await creditManager.consume()

    await refreshUser()

    expect(user.data.credits).toBe(0)

    await creditManager.revertBack()

    await refreshUser()

    expect(user.data.credits).toBe(1)
  })

  it('subscription credits should be consumed and reverted back correctly', async () => {
    await supertest(app)
      .get('/purchases/restore')
      .set('firebase-token', 'valid')
      .expect(200)
      .expect('Content-Type', /json/)

    const userId = await UserService.getUserIdByFirebaseId(
      'firebase_user_id_valid'
    )

    const populatedUser = await new UserService(userId).getPopulated()
    const creditManager = new CreditManager(populatedUser)

    let user = new UserModel(await new UserService(userId).getPopulated())
    async function refreshUser() {
      user = new UserModel(await new UserService(userId).getPopulated())
    }

    expect(user.data.credits).toBe(101)

    await creditManager.consume()

    await refreshUser()

    expect(user.data.credits).toBe(100)

    await creditManager.revertBack()

    await refreshUser()

    expect(user.data.credits).toBe(101)

    await creditManager.consume()
    await creditManager.consume()
    await creditManager.consume()

    await refreshUser()

    expect(user.data.credits).toBe(98)
  })
})
