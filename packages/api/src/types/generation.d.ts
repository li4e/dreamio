import { GenerationDto, ImageDto } from '@choco/db'

export type PopulatedGeneration = GenerationDto & {
  images: ImageDto[]
}
