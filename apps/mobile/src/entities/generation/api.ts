import { CanceledError } from 'axios'
import { Image } from 'expo-image'
import { apiClient } from 'shared/api'

export enum GenerationAPIErrorType {
  PROMPT_UNSAFE = 1,
  SERVICE_UNAVAILABLE = 2,
  INSUFFICIENT_CREDITS = 3,
  RATE_LIMITED = 4,
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
  remoteId: string | null
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

interface BackendRequest {
  id: string
  prompt: string
  enhancePrompt: boolean
  finalPrompt: string | null
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  results: Array<{ storageId: string; imageUrl: string; thumbnailUrl: string }>
  error: string | null
  createdAt: string
  updatedAt: string
  modelSettings: Record<string, unknown> | null
}

function mapBackendStatus(status: BackendRequest['status']): GenerationStatusDTO {
  switch (status) {
    case 'COMPLETED':
      return GenerationStatusDTO.Completed
    case 'FAILED':
    case 'CANCELLED':
      return GenerationStatusDTO.Error
    default:
      return GenerationStatusDTO.Processing
  }
}

function mapBackendToDTO(
  backendRequest: BackendRequest,
  localId: number,
  data: { style: string | null; enhance: boolean; width: number; height: number }
): GenerationDTO {
  return {
    id: localId,
    remoteId: backendRequest.id,
    prompt: backendRequest.prompt,
    promptFull: backendRequest.finalPrompt ?? backendRequest.prompt,
    style: data.style,
    status: mapBackendStatus(backendRequest.status),
    enhance: data.enhance,
    width: data.width,
    height: data.height,
    images: backendRequest.results.map((r) => r.imageUrl),
    createdAt: backendRequest.createdAt,
    updatedAt: backendRequest.updatedAt,
  }
}

export class Api {
  createGeneration = async (
    data: StartGenerationBodyDTO,
    signal: AbortSignal
  ): Promise<{ generation: GenerationDTO }> => {
    try {
      const res = await apiClient.post<BackendRequest>(
        '/requests',
        {
          prompt: data.prompt,
          enhancePrompt: data.enhance,
          settings: {
            width: data.width,
            height: data.height,
            style: data.style,
            enhance: data.enhance,
          },
        },
        { signal }
      )

      const generation = mapBackendToDTO(res.data, Date.now(), {
        style: data.style ?? null,
        enhance: data.enhance,
        width: data.width,
        height: data.height,
      })

      return { generation }
    } catch (error: any) {
      if (error.response?.status === 402) {
        throw new GetGenerationError(GenerationAPIErrorType.INSUFFICIENT_CREDITS)
      }
      if (error.response?.status === 429) {
        throw new GetGenerationError(GenerationAPIErrorType.RATE_LIMITED)
      }
      throw error
    }
  }

  getGeneration = async (
    generation: GenerationDTO,
    signal: AbortSignal
  ): Promise<{ generation: GenerationDTO }> => {
    if (!generation.remoteId) {
      throw new Error('Cannot poll generation without remoteId')
    }

    const remoteId = generation.remoteId
    let result: BackendRequest | null = null

    while (true) {
      if (signal.aborted) {
        throw new CanceledError()
      }

      const res = await apiClient.get<BackendRequest>(`/requests/${remoteId}`, {
        signal,
      })

      const backendRequest = res.data

      if (backendRequest.status === 'FAILED' || backendRequest.status === 'CANCELLED') {
        throw new GetGenerationError(GenerationAPIErrorType.SERVICE_UNAVAILABLE)
      }

      if (backendRequest.status === 'COMPLETED') {
        result = backendRequest
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const updatedGeneration = mapBackendToDTO(result, generation.id, {
      style: generation.style,
      enhance: generation.enhance,
      width: generation.width,
      height: generation.height,
    })

    // Prefetch the result image
    const imageUrl = updatedGeneration.images[0]
    if (imageUrl) {
      await Image.prefetch(imageUrl, 'disk')
    }

    return { generation: updatedGeneration }
  }

  cancelGeneration = async (remoteId: string): Promise<void> => {
    await apiClient.post(`/requests/${remoteId}/cancel`)
  }
}

export const api = new Api()
