import { translator } from 'shared/api'
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

    const seed = Math.trunc(Math.random() * 1000000000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generation.promptFull)}?private=true&nologo=true&enhance=true&safe=true&seed=${seed}`
    const cache = new ImageCache(imageUrl)

    try {
      await cache.download()

      generation.status = GenerationStatusDTO.Completed
      generation.updatedAt = new Date().toString()
      generation.images = [imageUrl]
    } catch (err) {
      generation.status = GenerationStatusDTO.Error
      throw err
    } finally {
      this.data.delete(id)
    }

    return {
      generation,
    }
  }

  createGeneration = async (
    data: StartGenerationBodyDTO
  ): Promise<{ generation: GenerationDTO }> => {
    let prompt = data.prompt

    try {
      prompt = await translator.translate(data.prompt, 'en')
    } catch (err) {
      console.error('Error during tranlsating prompt', err)
    }

    const newGeneration = {
      id: Date.now(),
      prompt: data.prompt,
      promptFull: data.style
        ? `"${prompt}" in the "${data.style}" style.`
        : prompt,
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
