import supertest from 'supertest'
import { app } from '../../app'

describe('Integration test /users', () => {
  describe('Valid GET user test', () => {
    it('user should be returned without error', async () => {
      await supertest(app)
        .get('/users/2')
        .set('content-type', 'applucation/json')
        .set('firebaseIdToken', 'valid')
        .expect(200)
        .expect('Content-Type', /json/)
    })
  })
})
