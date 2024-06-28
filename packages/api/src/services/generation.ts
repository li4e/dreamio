import {
  CreateGenerationDto,
  CreateImageDto,
  GenerationDto,
  dbClient,
} from '@choco/db'
import { PopulatedGeneration } from '../types/generation'

export class GenerationService {
  constructor(private readonly id: number) {}

  async getData(): Promise<PopulatedGeneration> {
    const result = await dbClient.generation.findFirstOrThrow({
      where: {
        id: this.id,
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

  async getShortInfo() {
    return dbClient.generation.findUnique({
      where: {
        id: this.id,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    })
  }

  static create(data: CreateGenerationDto): Promise<GenerationDto> {
    return dbClient.generation.create({
      data: {
        ...data,
      },
    })
  }

  public async setErrorStatus() {
    await dbClient.generation.update({
      where: { id: this.id },
      data: {
        status: 'error',
      },
    })
  }

  async saveResults(images: CreateImageDto[]): Promise<void> {
    await dbClient.$transaction(async ($transaction) => {
      const savedImages = await $transaction.image.createManyAndReturn({
        data: images,
      })

      await $transaction.imageGeneration.createMany({
        data: savedImages.map((image) => ({
          imageId: image.id,
          generationId: this.id,
        })),
      })

      return await $transaction.generation.update({
        where: { id: this.id },
        data: {
          status: 'completed',
        },
      })
    })
  }
}
