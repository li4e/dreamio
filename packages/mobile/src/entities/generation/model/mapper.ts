import { CreateGenerationDto, GenerationDto } from './dto'
import {
  GenerationEntity,
  GenerationEntityStatus,
  CreateGenerationRequest,
} from './GenerationEntity'

const statusMapping: Record<
  GenerationDto['status'],
  GenerationEntity['status']
> = {
  completed: GenerationEntityStatus.SUCCESS,
  processing: GenerationEntityStatus.IN_PROGRESS,
  error: GenerationEntityStatus.ERROR,
}

export function mapGenerationDtoToEntity(
  generation: GenerationDto
): GenerationEntity {
  return {
    id: generation.id,
    prompt: generation.prompt,
    style: generation.style,
    status: statusMapping[generation.status],
    createdAt: convertDateToTimestamp(generation.createdAt),
    updatedAt: convertDateToTimestamp(generation.updatedAt),
    images: generation.images ? mapImages(generation.images) : [],
  }
}

export function mapCreateGenerationRequestToDto(
  request: CreateGenerationRequest
): CreateGenerationDto {
  return {
    prompt: request.prompt,
    style: request.style,
  }
}

function convertDateToTimestamp(dateString: string): number {
  return new Date(dateString).getTime()
}

function mapImages(images: { url: string }[]): { url: string }[] {
  return images.map((image) => ({ url: image.url }))
}
