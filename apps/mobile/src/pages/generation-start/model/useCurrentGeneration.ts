import { makeAutoObservable, toJS } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import { useCallback, useEffect } from 'react'
import {
  CreateGenerationRequest,
  GenerationDataService,
  GenerationEntity,
  GenerationEntityStatus,
  useGenerationDataService,
} from 'entities/generation'
import { useStoreData } from 'shared/store'
import { mkkvStorage } from 'shared/lib/mmkv'

export enum Status {
  NO_GENERATION,
  IN_PROGRESS,
  SUCCESS,
  ERROR,
}

class CurrentGeneration {
  private _hasError = false
  private _isPending = false
  private _generation: GenerationEntity | null = null

  get genId() {
    return this._generation?.id ?? null
  }

  constructor(private readonly generationDataService: GenerationDataService) {
    this.restore()
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setGeneration(generation: GenerationEntity | null) {
    this._generation = generation
    const shouldNotBeSaved =
      generation?.status === GenerationEntityStatus.SUCCESS
    this.persist(shouldNotBeSaved)
  }

  clear() {
    this._generation = null
    this._hasError = false
    this._isPending = false
  }

  setError(error: boolean) {
    this._hasError = error
  }

  setPending(isPending: boolean) {
    this._isPending = isPending
  }

  get status(): Status {
    if (this._hasError) {
      return Status.ERROR
    } else if (this.currentGeneration) {
      const mapEntityStatusToStore: Record<GenerationEntityStatus, Status> = {
        [GenerationEntityStatus.ERROR]: Status.ERROR,
        [GenerationEntityStatus.IN_PROGRESS]: Status.IN_PROGRESS,
        [GenerationEntityStatus.SUCCESS]: Status.SUCCESS,
      }

      return mapEntityStatusToStore[this.currentGeneration.status]
    }

    return Status.NO_GENERATION
  }

  get currentGeneration(): GenerationEntity | null {
    return this._generation
  }

  get isPending(): boolean {
    return this._isPending || this.status === Status.IN_PROGRESS
  }

  private readonly persistingKey = 'current_generation'

  private persist(clear: boolean) {
    if (clear) {
      mkkvStorage.delete(this.persistingKey)
      return
    }

    if (this.currentGeneration) {
      mkkvStorage.set(
        this.persistingKey,
        JSON.stringify(toJS(this.currentGeneration))
      )
    } else {
      mkkvStorage.delete(this.persistingKey)
    }
  }

  private restore() {
    const generationString = mkkvStorage.getString(this.persistingKey)
    if (generationString) {
      this._generation = JSON.parse(generationString)
    }
  }

  private async createGeneration(data: CreateGenerationRequest) {
    let generation = await this.generationDataService.createGeneration(data)
    this.setGeneration(generation)
    return generation
  }

  private async fetchGenerationResult(id: number) {
    const generation = await this.generationDataService.getGeneration(id)
    this.setGeneration(generation)
  }

  async submit(data: CreateGenerationRequest) {
    try {
      this.setPending(true)
      this.setError(false)
      const generation = await this.createGeneration(data)
      await this.fetchGenerationResult(generation.id)
    } catch (error) {
      this.setError(true)
    } finally {
      this.setPending(false)
    }
  }

  async fetchResultIfNeeded() {
    if (this.genId && this.isPending) {
      try {
        await this.fetchGenerationResult(this.genId)
      } catch {
        this.setError(true)
      } finally {
        this.setPending(false)
      }
    }
  }
}

export function useCurrentGeneration() {
  const genDataService = useGenerationDataService()
  const curGenStore = useLocalObservable(
    () => new CurrentGeneration(genDataService)
  )

  const state = useStoreData(
    () => ({
      result: curGenStore.currentGeneration,
      status: curGenStore.status,
      isPending: curGenStore.isPending,
    }),
    [curGenStore]
  )

  useEffect(() => {
    curGenStore.fetchResultIfNeeded()
  }, [curGenStore])

  const submit = useCallback(
    (data: CreateGenerationRequest) => curGenStore.submit(data),
    [curGenStore, genDataService]
  )

  const setGeneration = useCallback(
    (generation: GenerationEntity) => curGenStore.setGeneration(generation),
    [curGenStore, genDataService]
  )

  return {
    state,
    submit,
    clear: curGenStore.clear,
    setGeneration,
  }
}
