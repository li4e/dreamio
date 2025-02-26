import axios from 'axios'
import { Image } from 'expo-image'
import { translator } from 'shared/api'
import { mkkvStorage } from 'shared/lib/mmkv'
import { SettingsStore } from 'shared/store/SettingsStore'

export class GetGenerationError extends Error {
  constructor(public readonly status: number) {
    super('GetGenerationError')
    this.status = status
  }

  isPromptUnsafe(): boolean {
    return [500, 502].includes(this.status)
  }

  isServiceUnavailable(): boolean {
    return this.status > 500
  }
}

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
  enhance: boolean
  width: number
  height: number
  images: string[]
}

export interface StartGenerationBodyDTO {
  prompt: string
  enhance: boolean
  width: number
  height: number
  style?: string
}

export class Api {
  constructor() {
    mkkvStorage.delete(this.__deprecated__persistingKey)
  }

  getGeneration = async (
    generation: GenerationDTO
  ): Promise<{ generation: GenerationDTO }> => {
    const imageUrl = generation.images[0]

    if (!imageUrl) {
      throw new Error('There is no an image in the passed GenerationDTO')
    }

    const startTime = Date.now()
    const timeout = 60 * 1000
    await axios
      .head(imageUrl, {
        timeout,
      })
      .then((res) => res.status)
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          if (error.status && error.status >= 500) {
            throw new GetGenerationError(error.status)
          } else if (
            error.code &&
            ['ERR_NETWORK', 'ECONNABORTED'].includes(error.code) &&
            Date.now() - startTime >= timeout
          ) {
            throw new GetGenerationError(501)
          }
        }
        throw error
      })

    const prefetched = await Image.prefetch(imageUrl)
    if (!prefetched) {
      throw new Error('Error happened during image prefetching')
    }

    generation.status = GenerationStatusDTO.Completed
    generation.updatedAt = new Date().toString()

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
      if (axios.isAxiosError(err) && new SettingsStore().censorship) {
        if (err.status === 500) {
          throw new GetGenerationError(500)
        }
      }
      console.error('Error during tranlsating prompt', err)
    }

    const newGeneration = {
      id: Date.now(),
      prompt: data.prompt,
      enhance: data.enhance,
      width: data.width,
      height: data.height,
      promptFull: data.style
        ? `"${prompt}" in the "${data.style}" style.`
        : prompt,
      style: data.style ?? null,
      status: GenerationStatusDTO.Processing,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      images: [] as string[],
    }

    const withCensorship = new SettingsStore().censorship
    const seed = Math.trunc(Math.random() * 1000000000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(newGeneration.promptFull)}?private=true&nologo=true&enhance=${newGeneration.enhance}&safe=${withCensorship}&seed=${seed}&width=${newGeneration.width}&height=${newGeneration.height}`
    newGeneration.images.push(imageUrl)

    return {
      generation: newGeneration,
    }
  }

  private readonly __deprecated__persistingKey = 'api'
}

export const api = new Api()
