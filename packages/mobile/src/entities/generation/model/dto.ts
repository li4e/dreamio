import {
  GetGeneration200Response,
  StartGenerationBody,
} from '@choco/api-client'

export type GenerationDto = GetGeneration200Response['generation']
export type CreateGenerationDto = StartGenerationBody
