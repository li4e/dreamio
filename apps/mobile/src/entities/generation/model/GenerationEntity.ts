export enum GenerationEntityStatus {
  IN_PROGRESS = 1,
  SUCCESS = 2,
  ERROR = 3,
}

export interface GenerationEntity {
  id: number
  prompt: string
  style: string | null
  status: GenerationEntityStatus
  createdAt: number // timestamp in nanoseconds
  updatedAt: number // timestamp in nanoseconds
  images: Array<string>
  enhance: boolean
  width: number
  height: number
}

export interface CreateGenerationRequest {
  prompt: string
  style: string | null
  enhance: boolean
  width: number
  height: number
}

export function isEqualGeneration(
  create: CreateGenerationRequest,
  generation: GenerationEntity
) {
  return (
    create.prompt === generation.prompt &&
    create.enhance === generation.enhance &&
    create.height === generation.height &&
    create.width === generation.width &&
    create.style === generation.style &&
    generation.status !== GenerationEntityStatus.SUCCESS
  )
}
