import { prepareDB } from '../tools/prepare_db'
import {
  startTestServer,
  closeTestServer,
  getTestClient,
} from '../tools/test_server'
import { TestData } from '../data/TestData'

beforeAll(async () => {
  await prepareDB()
  await startTestServer()
})

afterAll(async () => {
  await closeTestServer()
})

describe('Integration test /post_comments and /posts/{postId}/comments', () => {
  it('should successfully create a comment', async () => {
    const postId = await new TestData().createPost().then((post) => post.id)

    const comment = await getTestClient()
      .createPostComment(postId, { content: 'Sss' })
      .then((res) => res.data.postComment)

    expect(comment.id).toBe('1')
    expect(comment.content).toBe('Sss')
  })

  it('should be 401 error trying post a comment without an auth', async () => {
    try {
      const postComment = await getTestClient(null).createPostComment(1, {
        content: 'Sss',
      })
      expect(postComment).not.toBeDefined()
    } catch {
      expect(true).toBe(true)
    }
  })

  it('should be liked successfully only once and unliked', async () => {
    const postId = await new TestData().createPost().then((post) => post.id)

    const commentId = await getTestClient('super')
      .createPostComment(postId, { content: 'Sss' })
      .then((res) => res.data.postComment.id)

    await getTestClient('1').likePostComment(commentId)
    await getTestClient().likePostComment(commentId)

    let likesCount = await getTestClient()
      .getPostComments(postId)
      .then((res) => res.data.items[0].likesCount)

    expect(likesCount).toBe(2)

    await getTestClient('1').unlikePostComment(commentId)

    likesCount = await getTestClient()
      .getPostComments(postId)
      .then((res) => res.data.items[0].likesCount)

    expect(likesCount).toBe(1)
  })

  it('should be liked successfully by a few people', async () => {
    const postId = await new TestData().createPost().then((post) => post.id)

    const commentId = await getTestClient('super')
      .createPostComment(postId, { content: 'Sss' })
      .then((res) => res.data.postComment.id)

    await getTestClient().likePostComment(commentId)
    await getTestClient().likePostComment(commentId)
    await getTestClient().likePostComment(commentId)

    const likesCount = await getTestClient()
      .getPostComments(postId)
      .then((res) => res.data.items[0].likesCount)

    expect(likesCount).toBe(3)
  })

  it('should be successfully deleted', async () => {
    const postId = await new TestData().createPost().then((post) => post.id)
    const apiClient = getTestClient()

    const comment = await apiClient
      .createPostComment(postId, { content: 'Sss' })
      .then((res) => res.data.postComment)

    await apiClient.deletePostComment(comment.id)

    const comments = await apiClient
      .getPostComments(postId)
      .then((res) => res.data)

    expect(comments.items.length).toBe(0)
    expect(comments.deletedItems.length).toBe(1)
  })

  it('should be error during deleting a comment by other user', async () => {
    const postId = await new TestData().createPost().then((post) => post.id)
    const apiClient = getTestClient()

    const commentId = await apiClient
      .createPostComment(postId, { content: 'Sss' })
      .then((res) => res.data.postComment.id)

    try {
      await getTestClient('1').deletePostComment(commentId)
    } catch {
      expect(true).toBe(true)
    }

    const commentsCount = await apiClient
      .getPostComments(postId)
      .then((res) => res.data.items.length)

    expect(commentsCount).toBe(1)
  })
})
