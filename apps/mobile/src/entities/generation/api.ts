import axios from 'axios'
import { Image } from 'expo-image'
import { translator } from 'shared/api'
import { mkkvStorage } from 'shared/lib/mmkv'
import { SettingsStore } from 'shared/store/SettingsStore'
import { retryUntilTimeout } from 'shared/utils/retryUntilTimeout'

export enum GenerationAPIErrorType {
  PROMPT_UNSAFE = 1,
  SERVICE_UNAVAILABLE = 2,
}

export class GetGenerationError extends Error {
  constructor(public readonly type: GenerationAPIErrorType) {
    super('GetGenerationError')
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

    const timeout = 60 * 1000

    await retryUntilTimeout(async () => {
      try {
        // Try to fetch the image
        await axios.get(imageUrl, { timeout })
        const prefetched = await Image.prefetch(imageUrl)
        if (!prefetched) {
          throw new Error('Error happened during image prefetching')
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Check if error has a server response with status 500 or higher
          const isServerError = error.response && error.response.status >= 500
          // Check if error code is one of the network-related errors
          const isNetworkError =
            error.code && ['ERR_NETWORK', 'ECONNABORTED'].includes(error.code)

          if (isServerError || isNetworkError) {
            throw new GetGenerationError(
              GenerationAPIErrorType.SERVICE_UNAVAILABLE
            )
          }
        }
        throw error
      }
    }, 120_000)

    generation.status = GenerationStatusDTO.Completed
    generation.updatedAt = new Date().toString()

    return {
      generation,
    }
  }

  createGeneration = async (
    data: StartGenerationBodyDTO
  ): Promise<{ generation: GenerationDTO }> => {
    const withCensorship = new SettingsStore().censorship

    if (withCensorship) {
      const isPromptSafe = await this.isPromptSafe(data.prompt)
      if (!isPromptSafe) {
        throw new GetGenerationError(GenerationAPIErrorType.PROMPT_UNSAFE)
      }
    }

    const prompt = await translator
      .translate(data.prompt, 'en')
      .catch(() => data.prompt)

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

    const seed = Math.trunc(Math.random() * 1000000000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(newGeneration.promptFull)}?private=true&nologo=true&enhance=${newGeneration.enhance}&safe=${withCensorship}&seed=${seed}&width=${newGeneration.width}&height=${newGeneration.height}`
    newGeneration.images.push(imageUrl)

    return {
      generation: newGeneration,
    }
  }

  async isPromptSafe(promptToCheck: string): Promise<boolean> {
    const prompt = `Check if the following prompt is safe: "${promptToCheck}". A safe prompt means it does not contain harmful, offensive, NSFW (Not Safe For Work) content, hate speech, or other inappropriate material. Return a JSON object with the field {safe: boolean}, where 'true' means safe (no harmful content detected) and 'false' means not safe (harmful content detected).`

    return await retryUntilTimeout(() => {
      return axios
        .get(
          `https://text.pollinations.ai/${encodeURIComponent(prompt)}?private=true&json=true`
        )
        .then((res) => {
          const data = res.data
          if (typeof data.safe !== 'boolean') {
            throw new Error('AI Response is invalid')
          }
          return data.safe
        })
    }, 30_000)
  }

  private readonly __deprecated__persistingKey = 'api'
}

export const api = new Api()
