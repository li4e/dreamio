import { prepareDB } from '../tools/prepare_db'
import { StartGenerationBody } from '../../types/controllers/generation'
import {
  startTestServer,
  closeTestServer,
  getTestClient,
} from '../tools/test_server'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /generations', () => {
  const request: StartGenerationBody = {
    prompt: 'very pretty kitty on Taipei streets',
    style: 'photorealistic',
  }

  let generationId: number | null = null

  it('Valid create generation', async () => {
    const createGenRes = await getTestClient().createGeneration(request)

    if (!createGenRes.data.generation) {
      throw new Error('Generation is null')
    }

    generationId = createGenRes.data.generation.id

    expect(createGenRes.data.generation).toBeDefined()
    expect(createGenRes.data.userData.credits).toBe(0)
  })

  it('No credits generation', async () => {
    const client = getTestClient()
    await client.createGeneration(request)

    const createGenRes = await client.createGeneration(request)
    expect(createGenRes.data.generation).toBeNull()
    expect(createGenRes.data.userData.credits).toBe(0)
  })

  it('save generation', async () => {
    const client = getTestClient()

    const genId = await client
      .createGeneration({
        prompt: 'Hay',
      })
      .then((res) => res.data.generation?.id)

    if (!genId) {
      throw new Error('genId is null')
    }

    const genRes = await client.getGeneration(genId)

    expect(genRes.data.generation.status).toBe('completed')
    expect(genRes.data.generation.images).toHaveLength(1)
  }, 60000)
})
