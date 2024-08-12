import { api } from 'shared/lib/api'
import { CreateGenerationRequest, GenerationEntity } from './GenerationEntity'
import { GenerationStore } from './GenerationStore'
import {
  mapCreateGenerationRequestToDto,
  mapGenerationDtoToEntity,
} from './mapper'

export class GenerationRepository {
  constructor(private store: GenerationStore) {}

  getGeneration(id: number): Promise<GenerationEntity> {
    return api.getGeneration(id).then((res) => {
      const generation = mapGenerationDtoToEntity(res.data.generation)
      this.store.setItem(generation)
      return generation
    })
  }

  createGeneration(
    data: CreateGenerationRequest
  ): Promise<GenerationEntity | null> {
    return api
      .createGeneration(mapCreateGenerationRequestToDto(data))
      .then((res) => {
        const { generation } = res.data
        // TODO: Update user balance somehow

        if (generation) {
          const entity = mapGenerationDtoToEntity(generation)
          this.store.setItem(entity)
          return entity
        }
        return null
      })
  }
}
