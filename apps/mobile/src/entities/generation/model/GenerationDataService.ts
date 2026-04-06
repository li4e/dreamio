import { api } from '../api'
import { GenerationRepository } from './db/GenerationRepository'
import {
  CreateGenerationRequest,
  GenerationEntity,
  GenerationEntityStatus,
} from './GenerationEntity'
import { GenerationStore } from './GenerationStore'
import {
  mapCreateGenerationRequestToDto,
  mapGenerationDtoToEntity,
  mapGenerationEntityToDTO,
} from './mapper'
import { Image } from 'expo-image'

export class GenerationDataService {
  constructor(
    private store: GenerationStore,
    private db: GenerationRepository
  ) {}

  async cancelGeneration(entity: GenerationEntity) {
    if (entity.remoteId) {
      await api.cancelGeneration(entity.remoteId)
    }
  }

  getGeneration(
    generation: GenerationEntity,
    signal: AbortSignal
  ): Promise<GenerationEntity> {
    return api
      .getGeneration(mapGenerationEntityToDTO(generation), signal)
      .then(async (res) => {
        
        const generation = mapGenerationDtoToEntity(res.generation)
        await this.setItem(generation)
        return generation
      })
      .catch((error) => {
        console.log(error)
        throw error
      })
  }

  createGeneration(
    data: CreateGenerationRequest,
    signal: AbortSignal
  ): Promise<GenerationEntity> {
    return api
      .createGeneration(mapCreateGenerationRequestToDto(data), signal)
      .then(async (res) => {
        const { generation } = res

        const entity = mapGenerationDtoToEntity(generation)
        return entity
      })
  }

  async removeGeneration(entity: GenerationEntity) {
    await this.removeItem(entity)

    return async () => {
      await this.setItem(entity)
    }
  }

  async removeGeneratios(ids: number[]) {
    const items = ids
      .map((id) => this.store.getItem(id))
      .filter((item) => item !== null)

    const removedItems = await Promise.all(
      items.map((generation) => this.removeGeneration(generation))
    )

    return async () => {
      await Promise.all(removedItems.map((restore) => restore()))
    }
  }

  async clear() {
    await this.db.clear()
    this.store.clear()
  }

  /**
   * Fetches the next batch of entities from the database, ordered by creation date in descending order.
   * Updates the store with the retrieved entities.
   *
   * @returns {Promise<boolean>} - Returns `true` if there are potentially more records to fetch,
   * meaning the last batch contains exactly 20 entities. Otherwise, returns `false`.
   */
  async fetchData(size: number = 15): Promise<boolean> {
    const entities = await this.db.find({
      order: { createdAt: 'DESC' },
      take: size,
      skip: this.store.list.length,
    })

    await Promise.all(
      entities
        .map((item) =>
          item.images.map(
            (image) =>
              new Promise(async (resolve) => {
                try {
                  let cachedPath = await Image.getCachePathAsync(image)
                  if (!cachedPath) {
                    await Image.prefetch(image, 'disk')
                  }
                } finally {
                  resolve(true)
                }
              })
          )
        )
        .flat()
    )

    this.store.setItems(entities)
    return entities.length === size
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
