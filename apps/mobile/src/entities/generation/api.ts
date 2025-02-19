import { Image } from 'expo-image'
import { translator } from 'shared/api'
import { mkkvStorage } from 'shared/lib/mmkv'
import { SettingsStore } from 'shared/store/SettingsStore'

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
  images: null | string[]
}

export interface StartGenerationBodyDTO {
  prompt: string
  enhance: boolean
  width: number
  height: number
  style?: string
}

interface PersistingData {
  generationsData: [number, GenerationDTO][]
}

export class Api {
  private readonly data = new Map<number, GenerationDTO>()

  constructor() {
    const persisted = this.restore()
    if (persisted?.generationsData) {
      this.data = new Map(persisted.generationsData)
    }
  }

  getGeneration = async (
    id: number
  ): Promise<{ generation: GenerationDTO }> => {
    const generation = this.data.get(id)

    if (!generation) {
      throw new Error('Generation not found')
    }

    const withCensorship = new SettingsStore().censorship

    const seed = Math.trunc(Math.random() * 1000000000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generation.promptFull)}?private=true&nologo=true&enhance=${generation.enhance}&safe=${withCensorship}&seed=${seed}&width=${generation.width}&height=${generation.height}`

    try {
      await Image.prefetch(imageUrl)

      generation.status = GenerationStatusDTO.Completed
      generation.updatedAt = new Date().toString()
      generation.images = [imageUrl]
    } catch (err) {
      generation.status = GenerationStatusDTO.Error
      throw err
    } finally {
      this.data.delete(id)
      this.persist()
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
      images: null,
    }

    this.data.set(newGeneration.id, newGeneration)
    this.persist()

    return {
      generation: newGeneration,
    }
  }

  private persist() {
    const persistingData: PersistingData = {
      generationsData: Array.from(this.data),
    }
    mkkvStorage.set(this.persistingKey, JSON.stringify(persistingData))
  }

  private restore(): null | Partial<PersistingData> {
    const persistingData = mkkvStorage.getString(this.persistingKey)
    if (persistingData) {
      return JSON.parse(persistingData)
    }
    return null
  }

  private readonly persistingKey = 'api'
}

export const api = new Api()
