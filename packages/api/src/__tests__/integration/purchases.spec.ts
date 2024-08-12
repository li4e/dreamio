import supertest from 'supertest'
import { app } from '../../app'
import { prepareDB } from '../tools/prepare_db'
import { UserSettings } from '../../config/settings'

beforeAll(async () => {
  await prepareDB()
})

describe('Integration test /api/v1/purchases', () => {
  it('purchases should be restore correctly', async () => {
    const result = await supertest(app)
      .get('/api/v1/purchases/restore')
      .set('firebase-token', 'valid')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(result.body.data.hasPremium).toBe(true)
    expect(result.body.data.credits).toBe(100 + UserSettings.initialfreeCredits)
  })
})
