import {
  DefaultApi,
  IGeneration,
  IPost,
  StartGenerationBody,
} from '@choco/api-client'
import { randomUUID } from 'crypto'
import { getTestClient } from '../tools/test_server'

export class TestData {
  readonly fbIdToken: string
  readonly apiClient: DefaultApi

  constructor(fbIdToken?: string) {
    this.fbIdToken = fbIdToken || randomUUID()
    this.apiClient = getTestClient(this.fbIdToken)
  }

  async createGeneration(data?: StartGenerationBody): Promise<IGeneration> {
    const genId = await this.apiClient
      .createGeneration(
        data || {
          prompt: 'Super image',
        }
      )
      .then((res) => res.data.generation?.id)

    if (!genId) {
      throw new Error(
        `Test User can't to create the generation due an issuficent of coins`
      )
    }

    const generation = await this.apiClient
      .getGeneration(genId)
      .then((res) => res.data.generation)

    return generation
  }

  async createPost(data?: StartGenerationBody): Promise<IPost> {
    const generation = await this.createGeneration(data)

    if (!generation.images) {
      throw new Error('generation.images is null')
    }

    const postRes = await this.apiClient.createPost({
      imageGenerationId: generation.images[0].id,
    })

    return postRes.data.post
  }

  async createPostWithComments(
    data?: StartGenerationBody
  ): Promise<{ postId: number }> {
    const post = await this.createPost(data)

    for (let i = 0; i < 12; i++) {
      await this.apiClient.createPostComment(post.id, {
        content: 'Super comment!!!',
      })
    }

    return { postId: post.id }
  }
}
