import { useMemo } from 'react'
import {
  CreateGenerationRequest,
  GenerationDataService,
  GenerationEntity,
  GetGenerationError,
  useGenerationDataService,
} from 'entities/generation'
import {
  mapGenerationAPIErrorToUIStateStoreError,
  StateGenerationError,
  UIStateStore,
} from './UIStateStore'
import {
  GenerationEntityStatus,
  isEqualGeneration,
} from 'entities/generation/model/GenerationEntity'
import { useOnSaveImage } from 'shared/ui/CachedImage'
import { SettingsStore, useSettingsStore } from 'shared/store/SettingsStore'
import {
  StatisticsStore,
  useStatisticsStore,
} from 'shared/store/StatisticsStore'
import { CanceledError } from 'axios'

class CreateGenerationService {
  private abortController = new AbortController()

  constructor(
    private readonly generationDataService: GenerationDataService,
    private uiStateStore: UIStateStore,
    private settingsStore: SettingsStore,
    private statisticsStore: StatisticsStore,
    private saveImage: (image: string) => void,
    private onCreateError: (error: StateGenerationError, serverMessage?: string) => void
  ) {}

  private async createGeneration(data: CreateGenerationRequest) {
    this.uiStateStore.generation = null
    let generation = await this.generationDataService.createGeneration(
      data,
      this.abortController.signal
    )
    this.uiStateStore.generation = generation
    return generation
  }

  private async fetchGenerationResult(entity: GenerationEntity) {
    const generation = await this.generationDataService.getGeneration(
      entity,
      this.abortController.signal
    )
    this.uiStateStore.generation = generation
    if (this.settingsStore.autoSave) {
      this.saveImage(generation.images[0])
    }
    this.statisticsStore.generationsCount++
  }

  async submit(data: CreateGenerationRequest) {
    this.abortController = new AbortController()
    this.uiStateStore.error = null

    // Phase 1: Create request (button loader, no modal)
    let generation: GenerationEntity
    const existedGen = this.uiStateStore.generation
    if (existedGen && isEqualGeneration(data, existedGen)) {
      generation = existedGen
    } else {
      try {
        this.uiStateStore.isCreating = true
        generation = await this.createGeneration(data)
      } catch (error: any) {
        this.uiStateStore.isCreating = false
        this.statisticsStore.errorsCount++
        if (error instanceof GetGenerationError) {
          this.onCreateError(
            mapGenerationAPIErrorToUIStateStoreError(error.type)
          )
        } else if (!(error instanceof CanceledError)) {
          this.onCreateError(StateGenerationError.General)
        }
        return
      } finally {
        this.uiStateStore.isCreating = false
      }
    }

    // Phase 2: Poll for result (generation modal)
    try {
      this.uiStateStore.isPending = true
      await this.fetchGenerationResult(generation)
    } catch (error: any) {
      this.statisticsStore.errorsCount++
      if (error instanceof GetGenerationError) {
        this.uiStateStore.error = mapGenerationAPIErrorToUIStateStoreError(
          error.type
        )
      } else if (!(error instanceof CanceledError)) {
        this.uiStateStore.error = StateGenerationError.General
      }
    } finally {
      this.uiStateStore.isPending = false
    }
  }

  async fetchResultIfNeeded() {
    this.abortController = new AbortController()

    const generation = this.uiStateStore.generation
    if (
      generation &&
      generation.status !== GenerationEntityStatus.SUCCESS
    ) {
      // Discard pre-migration generations that have no remoteId
      if (!generation.remoteId) {
        this.uiStateStore.generation = null
        return
      }

      try {
        this.uiStateStore.isPending = true
        this.uiStateStore.error = null
        await this.fetchGenerationResult(generation)
      } catch (error: any) {
        if (error instanceof GetGenerationError) {
          this.uiStateStore.error = mapGenerationAPIErrorToUIStateStoreError(
            error.type
          )
        } else if (!(error instanceof CanceledError)) {
          this.uiStateStore.error = StateGenerationError.General
        }
      } finally {
        this.uiStateStore.isPending = false
      }
    }
  }

  async cancelGeneration() {
    const generation = this.uiStateStore.generation
    if (generation?.remoteId) {
      this.uiStateStore.isCancelling = true
      try {
        await this.generationDataService.cancelGeneration(generation)
        this.abortController.abort()
        this.uiStateStore.generation = null
      } catch (error: any) {
        const data = error?.response?.data
        const message =
          typeof data === 'string'
            ? data
            : data?.error ?? data?.message
        this.onCreateError(StateGenerationError.General, message || undefined)
      } finally {
        this.uiStateStore.isCancelling = false
      }
    } else {
      this.abortController.abort()
      this.uiStateStore.generation = null
    }
  }
}

export function useCreateGenService(
  uiStateStore: UIStateStore,
  onCreateError: (error: StateGenerationError, serverMessage?: string) => void
) {
  const saveImage = useOnSaveImage()
  const settingsStore = useSettingsStore()
  const statisticsStore = useStatisticsStore()

  const genDataService = useGenerationDataService()
  return useMemo(
    () =>
      new CreateGenerationService(
        genDataService,
        uiStateStore,
        settingsStore,
        statisticsStore,
        saveImage,
        onCreateError
      ),

    [
      genDataService,
      uiStateStore,
      saveImage,
      settingsStore,
      statisticsStore,
      onCreateError,
    ]
  )
}
