import supertest from 'supertest'
import { app } from '../../app'
import mockedAdaptyData from '../__mocks__/data/adapty'
import { dbClient } from '@choco/db'
import { prepareDB } from '../tools/prepare_db'

beforeAll(async () => {
  await prepareDB()
})

describe('Integration test /adapty_webhook', () => {
  it('connection should be returned correctly', async () => {
    const result = await supertest(app)
      .post('/adapty_webhook')
      .set('Authorization', '123')
      .send({ adapty_check: 'check' })
      .expect(200)
      .expect('Content-Type', /json/)

    expect(result.body.adapty_check_response).toBe('check')
  })

  it('webhook should be handled correctly', async () => {
    const event = mockedAdaptyData.webhookEvent

    const result = await supertest(app)
      .post('/adapty_webhook')
      .set('Authorization', '123')
      .send({ ...event, customAdd: 's' })
      .expect(200)
      .expect('Content-Type', /json/)

    expect(result.body.success).toBe(true)

    const savedSubscription = await dbClient.subscription.findUnique({
      where: {
        store_original_transaction_id: {
          store: event.event_properties.store,
          original_transaction_id:
            event.event_properties.original_transaction_id,
        },
      },
    })

    expect(savedSubscription?.credits).toBeGreaterThan(0)
  })
})
