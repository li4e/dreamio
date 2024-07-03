import { IPost, StartGenerationBody } from '@choco/api-client'
import { GenerationTestUtils } from './generation'
import { getTestClient } from '../tools/test_server'

export class PostTestUtils {
  static async create(
    fbIdToken?: string,
    data?: StartGenerationBody
  ): Promise<IPost> {
    const generation = await GenerationTestUtils.create(fbIdToken, data)
    if (!generation.images) {
      throw new Error('generation.images is null')
    }

    const postRes = await getTestClient(fbIdToken).createPost({
      imageGenerationId: generation.images[0].id,
    })

    return postRes.data.post
  }
}
