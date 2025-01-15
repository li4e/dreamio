import { api } from '../api'
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
      const generation = mapGenerationDtoToEntity(res.generation)
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
        const { generation } = res

        if (generation) {
          const entity = mapGenerationDtoToEntity(generation)
          await this.setItem(entity)
          return entity
        }
        return null
      })
  }

  async removeGeneration(entity: GenerationEntity) {
    await this.removeItem(entity)

    return async () => {
      await this.setItem(entity)
    }
  }

  async clear() {
    await this.db.clear()
    this.store.clear()
  }

  async restoreAll() {
    const entities = await this.db.find()
    this.store.setItems(entities)
  }

  private async removeItem(generation: GenerationEntity) {
    this.store.removeItem(generation.id)
    await this.db.remove([{ ...generation }])
  }

  private async setItem(generation: GenerationEntity) {
    this.store.setItem(generation)
    await this.db.save(generation)
  }
}
