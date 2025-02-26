import { useMemo } from 'react'
import {
  CreateGenerationRequest,
  GenerationDataService,
  GenerationEntity,
  GetGenerationError,
  useGenerationDataService,
} from 'entities/generation'
import { StateGenerationError, UIStateStore } from './UIStateStore'
import { isEqualGeneration } from 'entities/generation/model/GenerationEntity'

class CreateGenerationService {
  constructor(
    private readonly generationDataService: GenerationDataService,
    private uiStateStore: UIStateStore
  ) {}

  private async createGeneration(data: CreateGenerationRequest) {
    this.uiStateStore.generation = null
    let generation = await this.generationDataService.createGeneration(data)
    this.uiStateStore.generation = generation
    return generation
  }

  private async fetchGenerationResult(entity: GenerationEntity) {
    const generation = await this.generationDataService.getGeneration(entity)
    this.uiStateStore.generation = generation
  }

  async submit(data: CreateGenerationRequest) {
    try {
      this.uiStateStore.isPending = true
      this.uiStateStore.error = null
      const existedGen = this.uiStateStore.generation
      const generation =
        existedGen && isEqualGeneration(data, existedGen)
          ? existedGen
          : await this.createGeneration(data)

      await this.fetchGenerationResult(generation)
    } catch (error) {
      if (error instanceof GetGenerationError) {
        this.uiStateStore.error = error.isPromptUnsafe()
          ? StateGenerationError.PromptUnsafe
          : error.isServiceUnavailable()
            ? StateGenerationError.ServiceUnavailable
            : StateGenerationError.General
      } else {
        this.uiStateStore.error = StateGenerationError.General
      }
    } finally {
      this.uiStateStore.isPending = false
    }
  }

  async fetchResultIfNeeded() {
    if (this.uiStateStore.generation) {
      try {
        this.uiStateStore.isPending = true
        this.uiStateStore.error = null
        await this.fetchGenerationResult(this.uiStateStore.generation)
      } catch (error) {
        if (error instanceof GetGenerationError) {
          this.uiStateStore.error = error.isPromptUnsafe()
            ? StateGenerationError.PromptUnsafe
            : error.isServiceUnavailable()
              ? StateGenerationError.ServiceUnavailable
              : StateGenerationError.General
        } else {
          this.uiStateStore.error = StateGenerationError.General
        }
      } finally {
        this.uiStateStore.isPending = false
      }
    }
  }
}

export function useCreateGenService(uiStateStore: UIStateStore) {
  const genDataService = useGenerationDataService()
  return useMemo(
    () => new CreateGenerationService(genDataService, uiStateStore),
    [genDataService, uiStateStore]
  )
}
