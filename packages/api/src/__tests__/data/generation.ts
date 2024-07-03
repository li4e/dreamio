import { IGeneration, StartGenerationBody } from '@choco/api-client'
import { getTestClient } from '../tools/test_server'

export class GenerationTestUtils {
  static async create(
    fbIdToken?: string,
    data?: StartGenerationBody
  ): Promise<IGeneration> {
    const apiClient = getTestClient(fbIdToken)

    const genId = await apiClient
      .createGeneration(
        data || {
          prompt: 'Super image',
          enhancer: false,
        }
      )
      .then((res) => res.data.generation?.id)

    if (!genId) {
      throw new Error('genId is null')
    }

    const generation = await apiClient
      .getGeneration(genId)
      .then((res) => res.data.generation)

    return generation
  }
}
