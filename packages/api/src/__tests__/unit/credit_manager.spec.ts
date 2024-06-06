import { prepareDB } from '../tools/prepare_db'
import { CreditManager } from '../../services/credit_manager'
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
    const creditManager = new CreditManager(userId)

    let userData = new UserModel(await new UserService(userId).getPopulated())
    async function refreshUser() {
      userData = new UserModel(await new UserService(userId).getPopulated())
    }

    expect(userData.credits).toBe(1)

    await creditManager.consume()

    await refreshUser()

    expect(userData.credits).toBe(0)

    await creditManager.revertBack()

    await refreshUser()

    expect(userData.credits).toBe(1)
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

    const creditManager = new CreditManager(userId)

    let userData = new UserModel(await new UserService(userId).getPopulated())
    async function refreshUser() {
      userData = new UserModel(await new UserService(userId).getPopulated())
    }

    expect(userData.credits).toBe(101)

    await creditManager.consume()

    await refreshUser()

    expect(userData.credits).toBe(100)

    await creditManager.revertBack()

    await refreshUser()

    expect(userData.credits).toBe(101)

    await creditManager.consume()
    await creditManager.consume()
    await creditManager.consume()

    await refreshUser()

    expect(userData.credits).toBe(98)
  })
})
