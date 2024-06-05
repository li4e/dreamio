import supertest from 'supertest'
import { app } from '../../app'
import { prepareDB } from '../tools/prepare_db'

beforeAll(async () => {
  await prepareDB()
})

describe('Integration test /purchases', () => {
  it('purchases should be restore correctly', async () => {
    const result = await supertest(app)
      .get('/purchases/restore')
      .set('firebase-token', 'valid')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(result.body.data.hasPremium).toBe(true)
    expect(result.body.data.credits).toBe(101)
  })
})
