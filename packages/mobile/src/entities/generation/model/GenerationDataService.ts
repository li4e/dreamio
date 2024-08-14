import { AccountStore } from 'shared/auth/AccountStore'
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
    private db: GenerationRepository,
    private accountStore: AccountStore
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
        const { generation, userData } = res.data
        this.accountStore.updateMembership(userData)

        if (generation) {
          const entity = mapGenerationDtoToEntity(generation)
          await this.setItem(entity)
          return entity
        }
        return null
      })
  }

  async restoreAll() {
    const entities = await this.db.find()
    this.store.setItems(entities)
  }

  private async setItem(generation: GenerationEntity) {
    this.store.setItem(generation)
    await this.db.save(generation)
  }
}
