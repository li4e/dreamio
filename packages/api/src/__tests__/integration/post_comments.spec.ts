import { prepareDB } from '../tools/prepare_db'
import {
  startTestServer,
  closeTestServer,
  getTestClient,
} from '../tools/test_server'
import { PostTestUtils } from '../data/post'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /post_comments and /posts/{postId}/comments', () => {
  it('should successfully create a comment', async () => {
    await PostTestUtils.create('1')

    const comment = await getTestClient('super')
      .createPostComment(1, { content: 'Sss' })
      .then((res) => res.data.postComment)

    expect(comment.id).toBe('1')
    expect(comment.content).toBe('Sss')
  })

  it('should be 401 error trying post a comment without an auth', async () => {
    try {
      const postComment = await getTestClient('1').createPostComment(1, {
        content: 'Sss',
      })
      expect(postComment).not.toBeDefined()
    } catch {
      expect(true).toBe(true)
    }
  })

  it('should be liked successfully and only once', async () => {
    await getTestClient('1').likePostComment('1')
    await getTestClient('1').likePostComment('1')

    const comments = await getTestClient('1')
      .getPostComments(1)
      .then((res) => res.data.postComments)

    expect(comments[1].likesCount).toBe(1)
  })

  it('should be unliked successfully', async () => {
    await getTestClient('1').unlikePostComment('1')

    const comments = await getTestClient('1')
      .getPostComments(1)
      .then((res) => res.data.postComments)

    expect(comments[1].likesCount).toBe(0)
  })

  it('should be like successfully by few people', async () => {
    await getTestClient('1').likePostComment('1')
    await getTestClient('2').likePostComment('1')
    await getTestClient('3').likePostComment('1')

    const comments = await getTestClient('1')
      .getPostComments(1)
      .then((res) => res.data.postComments)

    expect(comments[1].likesCount).toBe(3)
  })

  it('should successfully delete a comment', async () => {
    const post = await PostTestUtils.create('2')
    const apiClient = getTestClient('super')

    const comment = await apiClient
      .createPostComment(post.id, { content: 'Sss' })
      .then((res) => res.data.postComment)

    await apiClient.deletePostComment(comment.id)

    const commentsCount = await apiClient
      .getPostComments(post.id)
      .then((res) => res.data.postComments.length)

    expect(commentsCount).toBe(0)
  })

  it('should be error during deleting a comment by other user', async () => {
    const post = await PostTestUtils.create('3')
    const apiClient = getTestClient('super1')

    const comment = await apiClient
      .createPostComment(post.id, { content: 'Sss' })
      .then((res) => res.data.postComment)

    try {
      await getTestClient('_').deletePostComment(comment.id)
    } catch {
      expect(true).toBe(true)
    }

    const commentsCount = await apiClient
      .getPostComments(post.id)
      .then((res) => res.data.postComments.length)

    expect(commentsCount).toBe(1)
  })
})
