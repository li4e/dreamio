import { ImageCache } from 'shared/ui/CachedImage'

export enum GenerationStatusDTO {
  Processing = 'processing',
  Completed = 'completed',
  Error = 'error',
}

export interface GenerationDTO {
  id: number
  prompt: string
  promptFull: string
  style: string | null
  createdAt: string
  updatedAt: string
  status: GenerationStatusDTO
  images: null | string[]
}

export interface StartGenerationBodyDTO {
  prompt: string
  style?: string
}

export class Api {
  private readonly data = new Map<number, GenerationDTO>()
  getGeneration = async (
    id: number
  ): Promise<{ generation: GenerationDTO }> => {
    const generation = this.data.get(id)

    if (!generation) {
      throw new Error('Generation not found')
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generation.promptFull)}?private=true&nologo=true&enhance=true`

    try {
      const cache = new ImageCache(imageUrl)
      await cache.download()

      generation.status = GenerationStatusDTO.Completed
      generation.updatedAt = new Date().toString()
      generation.images = [imageUrl]
    } catch {
      generation.status = GenerationStatusDTO.Error
    }

    this.data.delete(id)

    return {
      generation,
    }
  }

  createGeneration = async (
    data: StartGenerationBodyDTO
  ): Promise<{ generation: GenerationDTO }> => {
    const newGeneration = {
      id: Date.now(),
      prompt: data.prompt,
      promptFull: data.style
        ? `"${data.prompt}" in the "${data.style}" style.`
        : data.prompt,
      style: data.style ?? null,
      status: GenerationStatusDTO.Processing,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      images: null,
    }

    this.data.set(newGeneration.id, newGeneration)

    return {
      generation: newGeneration,
    }
  }
}

export const api = new Api()
