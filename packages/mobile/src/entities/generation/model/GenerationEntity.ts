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
  images: Array<{ url: string }>
}

export interface CreateGenerationRequest {
  prompt: string
  style: string
}
