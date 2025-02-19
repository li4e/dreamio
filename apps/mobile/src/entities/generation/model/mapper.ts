import { CreateGenerationDTO, GenerationDTO } from './dto'
import {
  GenerationEntity,
  GenerationEntityStatus,
  CreateGenerationRequest,
} from './GenerationEntity'

const statusMapping: Record<
  GenerationDTO['status'],
  GenerationEntity['status']
> = {
  completed: GenerationEntityStatus.SUCCESS,
  processing: GenerationEntityStatus.IN_PROGRESS,
  error: GenerationEntityStatus.ERROR,
}

export function mapGenerationDtoToEntity(
  generation: GenerationDTO
): GenerationEntity {
  return {
    id: generation.id,
    prompt: generation.prompt,
    style: generation.style,
    status: statusMapping[generation.status],
    createdAt: convertDateToTimestamp(generation.createdAt),
    updatedAt: convertDateToTimestamp(generation.updatedAt),
    enhance: generation.enhance,
    width: generation.width,
    height: generation.height,
    images: generation.images
      ? mapImages(generation.images).map((image) => image.url)
      : [],
  }
}

export function mapCreateGenerationRequestToDto(
  request: CreateGenerationRequest
): CreateGenerationDTO {
  return {
    prompt: request.prompt,
    style: request.style ?? undefined,
    width: request.width,
    height: request.height,
    enhance: request.enhance,
  }
}

function convertDateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime()
}

function mapImages(images: string[]): { url: string }[] {
  return images.map((image) => ({ url: image }))
}
