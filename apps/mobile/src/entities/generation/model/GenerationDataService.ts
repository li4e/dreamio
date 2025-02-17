import { api } from '../api'
import { GenerationRepository } from './db/GenerationRepository'
import { CreateGenerationRequest, GenerationEntity } from './GenerationEntity'
import { GenerationStore } from './GenerationStore'
import {
  mapCreateGenerationRequestToDto,
  mapGenerationDtoToEntity,
} from './mapper'
import { Image } from 'expo-image'

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

  createGeneration(data: CreateGenerationRequest): Promise<GenerationEntity> {
    return api
      .createGeneration(mapCreateGenerationRequestToDto(data))
      .then(async (res) => {
        const { generation } = res

        const entity = mapGenerationDtoToEntity(generation)
        await this.setItem(entity)
        return entity
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
