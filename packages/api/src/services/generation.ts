import {
  CreateGenerationDto,
  CreateImageDto,
  GenerationDto,
  dbClient,
} from '@choco/db'
import { PopulatedGeneration } from '../types/generation'

export class GenerationService {
  constructor(private _id: number) {}

  async getData(): Promise<PopulatedGeneration> {
    const result = await dbClient.generation.findFirstOrThrow({
      where: {
        id: this._id,
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
    })

    return {
      ...result,
      images: result.images.map((item) => item.image),
    }
  }

  static create(
    data: CreateGenerationDto,
    userId: number
  ): Promise<GenerationDto> {
    return dbClient.generation.create({
      data: {
        userId,
        ...data,
      },
    })
  }

  public async setErrorStatus() {
    await dbClient.generation.update({
      where: { id: this._id },
      data: {
        status: 'error',
      },
    })
  }

  async saveResults(images: CreateImageDto[]): Promise<PopulatedGeneration> {
    const result = await dbClient.$transaction(async ($transaction) => {
      const savedImages = await $transaction.image.createManyAndReturn({
        data: images,
      })

      return await $transaction.generation.update({
        where: { id: this._id },
        data: {
          status: 'completed',
          images: {
            createMany: {
              data: savedImages.map((image) => ({
                imageId: image.id,
                generationId: this._id,
              })),
            },
          },
        },
        include: {
          images: {
            include: {
              image: true,
            },
          },
        },
      })
    })
    return {
      ...result,
      images: result.images.map((image) => image.image),
    }
  }
}
