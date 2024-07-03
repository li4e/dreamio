import { prepareDB } from '../tools/prepare_db'
import {
  startTestServer,
  closeTestServer,
  testApiClient,
  getTestClient,
} from '../tools/test_server'
import { GenerationTestUtils } from '../data/generation'
import { PostTestUtils } from '../data/post'
import { isAxiosError } from 'axios'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /posts', () => {
  it('should successfully create a post', async () => {
    const imgGenId = await GenerationTestUtils.create('1').then(
      (data) => data.images?.[0].id
    )

    if (!imgGenId) {
      throw new Error('imgGenId is null')
    }

    const createPostRes = await getTestClient('1').createPost({
      imageGenerationId: imgGenId,
    })

    expect(createPostRes.data.post).toBeDefined()
  })

  it(`should not create a post using imgGenId from another user's generation`, async () => {
    const imgGenId = await GenerationTestUtils.create('2').then(
      (data) => data.images?.[0].id
    )

    if (!imgGenId) {
      throw new Error('imgGenId is null')
    }

    try {
      await getTestClient('1').createPost({
        imageGenerationId: imgGenId,
      })
      fail('Expected error not thrown')
    } catch (error) {
      if (isAxiosError(error)) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400)
      } else {
        throw new Error('Error instance is not Axios')
      }
    }
  })

  it('should be liked/unliked correctly', async () => {
    const post = await PostTestUtils.create('3')

    for (let i = 0; i < 3; i++) {
      await getTestClient('1').likePost(post.id)
    }

    expect(
      await testApiClient
        .getPost(post.id)
        .then((res) => res.data.post.likesCount)
    ).toBe(1)

    await getTestClient('1').unlikePost(post.id)

    expect(
      await testApiClient
        .getPost(post.id)
        .then((res) => res.data.post.likesCount)
    ).toBe(0)

    await getTestClient('1').likePost(post.id)
    await getTestClient('2').likePost(post.id)
    await getTestClient('3').likePost(post.id)

    const lastPostVersion = await testApiClient
      .getPost(post.id)
      .then((res) => res.data.post)

    expect(lastPostVersion.likesCount).toBe(3)

    expect(lastPostVersion.createdAt).toBe(lastPostVersion.updatedAt)
  })

  it('Should be deleted correctly', async () => {
    const post = await PostTestUtils.create('4')

    await getTestClient('4').deletePost(post.id)

    const lastPostVersion = await getTestClient('4')
      .getPost(post.id)
      .then((res) => res.data.post)

    expect(post.createdAt).not.toBe(lastPostVersion.updatedAt)
    expect(Object.keys(lastPostVersion).length).toBe(3)
  })

  it('Should not be deleted by another user', async () => {
    const post = await PostTestUtils.create('5')

    try {
      await getTestClient('3').deletePost(post.id)
      expect(true).toBe(false)
    } catch (error) {
      if (isAxiosError(error)) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400)
      } else {
        throw new Error('Instace of error is not an Axios')
      }
    }
  })
})
