import {
  CreateGenerationDto,
  CreateImageDto,
  Generation,
  dbClient,
} from '@choco/db'
import { IGeneration } from '../types/client'

export class GenerationService {
  constructor(private readonly id: number) {}

  async getData(): Promise<IGeneration> {
    const generation = await dbClient.generation.findFirstOrThrow({
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

    return GenerationService.transformToCLient(generation)
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

  static async create(
    data: CreateGenerationDto,
    userId: number
  ): Promise<IGeneration> {
    const generation = await dbClient.generation.create({
      data: {
        ...data,
        userId,
      },
    })

    return GenerationService.transformToCLient(generation)
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

  static transformToCLient(generation: Generation): IGeneration {
    const images: IGeneration['images'] = []

    if (generation.status === 'completed' && generation.images) {
      for (const genImage of generation.images) {
        if (genImage.image) {
          images.push({ id: genImage.imageId, url: genImage.image.publicUrl })
        }
      }
    }

    return {
      id: generation.id,
      prompt: generation.prompt,
      promptFull: generation.promptFull,
      style: generation.style,
      highQuality: generation.highQuality,
      enhancer: generation.enhancer,
      status: generation.status,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
      images: images,
    }
  }
}
