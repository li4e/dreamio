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
    private saveImage: (image: string) => void
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

    try {
      this.uiStateStore.isPending = true
      this.uiStateStore.error = null
      const existedGen = this.uiStateStore.generation
      const generation =
        existedGen && isEqualGeneration(data, existedGen)
          ? existedGen
          : await this.createGeneration(data)

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

    if (
      this.uiStateStore.generation &&
      this.uiStateStore.generation.status !== GenerationEntityStatus.SUCCESS
    ) {
      try {
        // START - TODO: Remove after some time, temporary fix for current users
        this.uiStateStore.generation = {
          ...this.uiStateStore.generation,
          images: this.uiStateStore.generation.images.map((url) => {
            const newUrl = new URL(url)
            const params = new URLSearchParams(newUrl.search)
            params.set(
              'seed',
              String(Math.trunc(Math.random() * 1000000000000))
            )
            newUrl.search = params.toString()
            return newUrl.toString()
          }),
        }
        // END

        this.uiStateStore.isPending = true
        this.uiStateStore.error = null
        await this.fetchGenerationResult(this.uiStateStore.generation)
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
    this.abortController.abort()
    this.uiStateStore.generation = null
  }
}

export function useCreateGenService(uiStateStore: UIStateStore) {
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
        saveImage
      ),

    [genDataService, uiStateStore, saveImage, settingsStore, statisticsStore]
  )
}
