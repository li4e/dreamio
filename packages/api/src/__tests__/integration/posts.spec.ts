import { prepareDB } from '../tools/prepare_db'
import {
  startTestServer,
  closeTestServer,
  getTestClient,
} from '../tools/test_server'
import { TestData } from '../data/TestData'
import { isAxiosError } from 'axios'
import { IPost } from '@choco/api-client'

beforeEach(async () => {
  await prepareDB()
})

beforeAll(async () => {
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /posts', () => {
  it('should successfully create a post', async () => {
    const imgGenId = await new TestData('1')
      .createGeneration()
      .then((gen) => gen.images?.[0].id)

    if (!imgGenId) {
      throw new Error('imgGenId is null')
    }

    const createPostRes = await getTestClient('1').createPost({
      imageGenerationId: imgGenId,
    })

    expect(createPostRes.data.post).toBeDefined()
  })

  it(`should not create a post using imgGenId from another user's generation`, async () => {
    const imgGenId = await new TestData('2')
      .createGeneration()
      .then((gen) => gen.images?.[0].id)

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
    const post = await new TestData().createPost()

    for (let i = 0; i < 3; i++) {
      await getTestClient('1').likePost(post.id)
    }

    expect(
      await getTestClient()
        .getPost(post.id)
        .then((res) => res.data.post.likesCount)
    ).toBe(1)

    await getTestClient('1').unlikePost(post.id)

    expect(
      await getTestClient()
        .getPost(post.id)
        .then((res) => res.data.post.likesCount)
    ).toBe(0)

    await getTestClient('1').likePost(post.id)
    await getTestClient('2').likePost(post.id)
    await getTestClient('3').likePost(post.id)

    const lastPostVersion = await getTestClient()
      .getPost(post.id)
      .then((res) => res.data.post)

    expect(lastPostVersion.likesCount).toBe(3)

    expect(lastPostVersion.createdAt).toBe(lastPostVersion.updatedAt)
  })

  it('Should be deleted correctly', async () => {
    const post = await new TestData('4').createPost()

    await getTestClient('4').deletePost(post.id)

    try {
      await getTestClient('4')
        .getPost(post.id)
        .then((res) => res.data.post)
      expect(true).toBe(false)
    } catch (error) {
      if (isAxiosError(error)) {
        expect(error.response?.status).toBe(404)
      } else {
        throw new Error('Instace of error is not an Axios')
      }
    }
  })

  it('Should not be deleted by another user', async () => {
    const post = await new TestData('5').createPost()

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

  it('Should be sorted correctly by updatedAt', async () => {
    const posts: IPost[] = []

    for (let i = 0; i < 10; i++) {
      posts.push(await new TestData(String(i + 5)).createPost())
    }

    const apiClient = getTestClient('5')

    let apiPosts = await apiClient
      .getPosts('updatedAt', 5)
      .then((res) => res.data.posts)

    let fisrtSeen = apiPosts[0]
    const lastSeen = apiPosts[apiPosts.length - 1]
    expect(apiPosts[0].id).toBe(posts[posts.length - 1].id)

    apiPosts = await apiClient
      .getPosts('updatedAt', 5, undefined, lastSeen.updatedAt, lastSeen.id)
      .then((res) => res.data.posts)

    fisrtSeen = apiPosts[0]
    expect(fisrtSeen.id).not.toBe(lastSeen.id)
    expect(new Date(fisrtSeen.updatedAt).getTime()).toBeLessThanOrEqual(
      new Date(lastSeen.updatedAt).getTime()
    )
  })

  it('Should be sorted correctly by likes with limit', async () => {
    const posts: IPost[] = []

    for (let i = 0; i < 10; i++) {
      posts.push(await new TestData(String(i)).createPost())
    }

    await getTestClient('1').likePost(posts[4].id)
    await getTestClient('2').likePost(posts[4].id)
    await getTestClient('3').likePost(posts[4].id)

    await getTestClient('1').likePost(posts[6].id)
    await getTestClient('2').likePost(posts[6].id)

    let apiPosts = await getTestClient('1')
      .getPosts('likes', 3)
      .then((res) => res.data.posts)

    expect(apiPosts[0].id).toBe(posts[4].id)
    expect(apiPosts[1].id).toBe(posts[6].id)
    expect(apiPosts[2].id).toBe(posts[9].id)

    apiPosts = await getTestClient('1')
      .getPosts('likes', 3, apiPosts[2].likesCount, undefined, apiPosts[2].id)
      .then((res) => res.data.posts)

    expect(apiPosts[0].id).toBe(posts[8].id)
    expect(apiPosts[1].id).toBe(posts[7].id)
    expect(apiPosts[2].id).toBe(posts[5].id)

    apiPosts = await getTestClient('1')
      .getPosts('likes', 3, apiPosts[2].likesCount, undefined, apiPosts[2].id)
      .then((res) => res.data.posts)

    expect(apiPosts[0].id).toBe(posts[3].id)
    expect(apiPosts[1].id).toBe(posts[2].id)
    expect(apiPosts[2].id).toBe(posts[1].id)
  })

  it('Should be sorted correctly by updatedAt after deletion', async () => {
    const posts: IPost[] = []

    for (let i = 0; i < 10; i++) {
      posts.push(await new TestData(String(i)).createPost())
    }

    await getTestClient('9').deletePost(posts[posts.length - 1].id)

    const apiPosts = await getTestClient('4')
      .getPosts('updatedAt', 3)
      .then((res) => res.data.posts)

    expect(apiPosts[0].id).toBe(posts[posts.length - 2].id)
  })
})
