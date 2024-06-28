import supertest from 'supertest'
import { app } from '../../app'
import { prepareDB } from '../tools/prepare_db'
import { StartGenerationBody } from '../../types/controllers/generation'

beforeAll(async () => {
  await prepareDB()
})

describe('Integration test /generations', () => {
  const request: StartGenerationBody = {
    prompt: 'very pretty kitty on Taipei streets',
    enhancer: false,
    style: 'photorealistic',
  }
  let generationId: number | null = null

  it('Valid create generation', async () => {
    const result = await supertest(app)
      .post('/generations')
      .set('firebase-token', 'valid')
      .send(request)
      .expect(201)
      .expect('Content-Type', /json/)

    generationId = result.body.data.generation.id
    expect(result.body.data.generation).toBeDefined()
    expect(result.body.data.userData.credits).toBe(0)
  }, 60000)

  it('No credits generation', async () => {
    const result = await supertest(app)
      .post('/generations')
      .set('firebase-token', 'valid')
      .send(request)
      .expect(206)
      .expect('Content-Type', /json/)

    expect(result.body.data.generation).toBeNull()
    expect(result.body.data.userData.credits).toBe(0)
  })

  it('save generation', async () => {
    if (generationId === null) {
      throw new Error('generationId is null')
    }

    const result = await supertest(app)
      .get('/generations/' + generationId)
      .set('firebase-token', 'valid')
      .send(request)
      .expect(200)
      .expect('Content-Type', /json/)

    expect(result.body.data.status).toBe('completed')
  })
})
