import { makeAutoObservable } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import { useCallback } from 'react'
import {
  CreateGenerationRequest,
  GenerationEntity,
  GenerationEntityStatus,
  GenerationStore,
  useGenerationDataService,
} from 'entities/generation'
import { useGenerationStore } from 'entities/generation'
import { useStoreData } from 'shared/store'

export enum Status {
  NO_GENERATION,
  IN_PROGRESS,
  SUCCESS,
  ERROR,
}

class CurrentGenerationStore {
  genId: number | null = null
  private _hasError = false

  constructor(private readonly generationStore: GenerationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setGenId(genId: number) {
    this.genId = genId
  }

  clear() {
    this.genId = null
    this._hasError = false
  }

  setError(error: boolean) {
    this._hasError = error
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
    if (this.genId) {
      return this.generationStore.getItem(this.genId)
    }
    return null
  }
}

export function useCurrentGeneration() {
  const genStore = useGenerationStore()
  const genDataService = useGenerationDataService()
  const curGenStore = useLocalObservable(
    () => new CurrentGenerationStore(genStore)
  )

  const state = useStoreData(
    () => ({
      status: curGenStore.status,
      isPending: curGenStore.status === Status.IN_PROGRESS,
    }),
    [curGenStore]
  )

  const submit = useCallback(
    async (
      data: CreateGenerationRequest,
      onGenerated: (generation: GenerationEntity) => void
    ) => {
      try {
        let generation = await genDataService.createGeneration(data)
        curGenStore.setGenId(generation.id)
        generation = await genDataService.getGeneration(generation.id)
        onGenerated(generation)
      } catch {
        curGenStore.setError(true)
      }
    },
    [curGenStore, genDataService]
  )

  return {
    state,
    submit,
    clear: curGenStore.clear,
  }
}
