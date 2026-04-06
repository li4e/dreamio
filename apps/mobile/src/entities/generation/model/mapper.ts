import { GenerationStatusDTO } from '../api'
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

function mapEntityStatusToDTOStatus(
  status: GenerationEntity['status']
): GenerationDTO['status'] {
  if (status === GenerationEntityStatus.SUCCESS) {
    return GenerationStatusDTO.Completed
  } else if (status === GenerationEntityStatus.IN_PROGRESS) {
    return GenerationStatusDTO.Processing
  } else {
    return GenerationStatusDTO.Error
  }
}

export function mapGenerationDtoToEntity(
  generation: GenerationDTO
): GenerationEntity {
  return {
    id: generation.id,
    remoteId: generation.remoteId ?? null,
    prompt: generation.prompt,
    style: generation.style,
    status: statusMapping[generation.status],
    createdAt: convertDateToTimestamp(generation.createdAt),
    updatedAt: convertDateToTimestamp(generation.updatedAt),
    enhance: generation.enhance,
    width: generation.width,
    height: generation.height,
    images: generation.images ?? [],
  }
}

export function mapGenerationEntityToDTO(
  generation: GenerationEntity
): GenerationDTO {
  return {
    id: generation.id,
    remoteId: generation.remoteId ?? null,
    prompt: generation.prompt,
    promptFull: generation.prompt,
    style: generation.style,
    status: mapEntityStatusToDTOStatus(generation.status),
    createdAt: convertTimeStampToDateString(generation.createdAt),
    updatedAt: convertTimeStampToDateString(generation.updatedAt),
    enhance: generation.enhance,
    width: generation.width,
    height: generation.height,
    images: generation.images ?? [],
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

function convertTimeStampToDateString(timestamp: number): string {
  return new Date(timestamp).toString()
}
