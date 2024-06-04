import supertest from 'supertest'
import { app } from '../../app'

describe('Integration test /users', () => {
  describe('Valid GET user test', () => {
    it('user should be returned without error', async () => {
      const result = await supertest(app)
        .get('/users/2')
        .set('content-type', 'application/json')
        .set('firebase-token', 'valid')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(result.body.data.userId).toBe(1)
    })

    it('401 should be returned with error', async () => {
      await supertest(app)
        .get('/users/2')
        .set('content-type', 'application/json')
        .expect(401)
        .expect('Content-Type', /json/)
    })
  })
})
