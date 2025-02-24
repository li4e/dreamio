import { useMemo } from 'react'
import {
  CreateGenerationRequest,
  GenerationDataService,
  useGenerationDataService,
} from 'entities/generation'
import { UIStateStore } from './UIStateStore'

class CreateGenerationService {
  constructor(
    private readonly generationDataService: GenerationDataService,
    private uiStateStore: UIStateStore
  ) {}

  private async createGeneration(data: CreateGenerationRequest) {
    let generation = await this.generationDataService.createGeneration(data)
    this.uiStateStore.generation = generation
    return generation
  }

  private async fetchGenerationResult(id: number) {
    const generation = await this.generationDataService.getGeneration(id)
    this.uiStateStore.generation = generation
  }

  async submit(data: CreateGenerationRequest) {
    try {
      this.uiStateStore.isPending = true
      this.uiStateStore.hasError = false
      const generation = await this.createGeneration(data)
      await this.fetchGenerationResult(generation.id)
    } catch (error) {
      this.uiStateStore.hasError = true
    } finally {
      this.uiStateStore.isPending = false
    }
  }

  async fetchResultIfNeeded() {
    if (this.uiStateStore.generation) {
      try {
        this.uiStateStore.isPending = true
        this.uiStateStore.hasError = false
        await this.fetchGenerationResult(this.uiStateStore.generation.id)
      } catch (err) {
        console.log(err)
        this.uiStateStore.hasError = true
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
