import {
  GetGeneration200Response,
  IGenerationStatusEnum,
  StartGenerationBody,
  CreateGeneration201Response,
  IGeneration,
  GeneratePrompt200Response,
  GetCurrentUser200Response,
  RestoreUserMembership200Response,
} from '@choco/api-client'
import { ImageCache } from '../ui/CachedImage'

export class FreeAPI {
  private readonly data = new Map<number, IGeneration>()

  generatePrompt = async (): Promise<{ data: GeneratePrompt200Response }> => {
    return {
      data: {
        prompt:
          'Sunset over snow-capped mountains, a calm lake reflecting the sky, and a cozy cabin with glowing windows in a meadow of colorful wildflowers. Warm, peaceful atmosphere',
      },
    }
  }
  getGeneration = async (
    id: number
  ): Promise<{ data: GetGeneration200Response }> => {
    const generation = this.data.get(id)

    if (!generation) {
      throw new Error('Generation not found')
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generation.promptFull)}?private=true&nologo=true&enhance=true`

    try {
      const cache = new ImageCache(imageUrl)
      await cache.download()

      generation.status = IGenerationStatusEnum.Completed
      generation.updatedAt = new Date().toString()
      generation.images = [
        {
          id: Date.now(),
          url: imageUrl,
        },
      ]
    } catch {
      generation.status = IGenerationStatusEnum.Error
    }

    this.data.delete(id)

    return {
      data: { generation },
    }
  }

  createGeneration = async (
    data: StartGenerationBody
  ): Promise<{ data: CreateGeneration201Response }> => {
    const newGeneration = {
      id: Date.now(),
      prompt: data.prompt,
      promptFull: data.style
        ? `"${data.prompt}" in the "${data.style}" style.`
        : data.prompt,
      style: data.style ?? null,
      highQuality: null,
      status: IGenerationStatusEnum.Processing,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      images: null,
    }

    this.data.set(newGeneration.id, newGeneration)

    return {
      data: {
        userData: {
          credits: 0,
          hasPremium: false,
        },
        generation: newGeneration,
      },
    }
  }

  getCurrentUser = async (): Promise<{ data: GetCurrentUser200Response }> => {
    return {
      data: {
        currentUser: {
          id: -1,
          userName: '',
          avatar: null,
          premiumInfo: {
            hasPremium: false,
            credits: 0,
          },
        },
      },
    }
  }

  restoreUserMembership = async (): Promise<{
    data: RestoreUserMembership200Response
  }> => {
    return {
      data: {
        membership: {
          hasPremium: false,
          credits: 0,
        },
      },
    }
  }
}
