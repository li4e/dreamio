import { prepareDB } from '../tools/prepare_db'
import {
  startTestServer,
  closeTestServer,
  testApiClient,
} from '../tools/test_server'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /posts', () => {
  it('post should be created succeessfully', async () => {
    const genId = await testApiClient
      .createGeneration({
        prompt: 'Super image',
        enhancer: false,
      })
      .then((res) => res.data.generation?.id)

    if (!genId) {
      throw new Error('genId is null')
    }

    const imgGenId = await testApiClient
      .getGeneration(genId)
      .then((res) => res.data.generation.images?.[0].id)

    if (!imgGenId) {
      throw new Error('imgGenId is null')
    }

    const creatPostRes = await testApiClient.createPost({
      imageGenerationId: imgGenId,
    })

    expect(creatPostRes.data.post).toBeDefined()

    await testApiClient.likePost(creatPostRes.data.post.id)
    await testApiClient.likePost(creatPostRes.data.post.id)
    await testApiClient.likePost(creatPostRes.data.post.id)

    let getPostRes = await testApiClient.getPost(creatPostRes.data.post.id)

    expect(getPostRes.data.post.likes).toBe(1)

    await testApiClient.unlikePost(creatPostRes.data.post.id)

    getPostRes = await testApiClient.getPost(creatPostRes.data.post.id)

    expect(getPostRes.data.post.likes).toBe(0)
  })
})
