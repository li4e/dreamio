import { api } from 'shared/lib/api'
import { GenerationRepository } from './db/GenerationRepository'
import { CreateGenerationRequest, GenerationEntity } from './GenerationEntity'
import { GenerationStore } from './GenerationStore'
import {
  mapCreateGenerationRequestToDto,
  mapGenerationDtoToEntity,
} from './mapper'

export class GenerationDataService {
  constructor(
    private store: GenerationStore,
    private db: GenerationRepository
  ) {}

  getGeneration(id: number): Promise<GenerationEntity> {
    return api.getGeneration(id).then(async (res) => {
      const generation = mapGenerationDtoToEntity(res.data.generation)
      await this.setItem(generation)
      return generation
    })
  }

  createGeneration(
    data: CreateGenerationRequest
  ): Promise<GenerationEntity | null> {
    return api
      .createGeneration(mapCreateGenerationRequestToDto(data))
      .then(async (res) => {
        const { generation } = res.data
        // TODO: Update user balance somehow

        if (generation) {
          const entity = mapGenerationDtoToEntity(generation)
          await this.setItem(entity)
          return entity
        }
        return null
      })
  }

  private async setItem(generation: GenerationEntity) {
    this.store.setItem(generation)
    await this.db.save(generation)
  }
}
