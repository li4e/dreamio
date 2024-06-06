import supertest from 'supertest'
import { app } from '../../app'
import { prepareDB } from '../tools/prepare_db'

beforeAll(async () => {
  await prepareDB()
})

describe('Integration test /generations', () => {
  it('Valid create generation', async () => {
    const result = await supertest(app)
      .post('/generations')
      .set('firebase-token', 'valid')
      .send({ prompt: 'best image ever' })
      .expect(201)
      .expect('Content-Type', /json/)

    console.log(result.body)

    expect(result.body.data.url).toBeDefined()
    expect(result.body.data.userData.credits).toBe(0)
  })

  it('No credits generation', async () => {
    const result = await supertest(app)
      .post('/generations')
      .set('firebase-token', 'valid')
      .send({ prompt: 'best image ever' })
      .expect(206)
      .expect('Content-Type', /json/)

    console.log(result.body)

    expect(result.body.data.url).toBeNull()
    expect(result.body.data.userData.credits).toBe(0)
  })
})
