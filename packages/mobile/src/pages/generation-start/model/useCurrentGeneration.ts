import { makeAutoObservable, reaction } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import {
  CreateGenerationRequest,
  GenerationDataService,
  GenerationEntity,
  GenerationEntityStatus,
  GenerationStore,
  useGenerationDataService,
} from 'entities/generation'
import { useGenerationStore } from 'entities/generation'
import { AccountStore, useAccountStore } from 'shared/auth/AccountStore'
import { useStoreData } from 'shared/store'

export enum Status {
  NO_GENERATION,
  SUBMITTING,
  IN_PROGRESS,
  PREMIUM,
  SUCCESS,
  TOP_UP,
  READY_TO_RESUBMIT,
  ERROR,
}

class CurrentGenerationStore {
  genId: number | null = null
  private _submittedData: CreateGenerationRequest | null = null
  private _pending = false
  private _creatingError = false

  constructor(
    private readonly generationStore: GenerationStore,
    private readonly accountStore: AccountStore
  ) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  onSubmitted(data: CreateGenerationRequest) {
    this.genId = null
    this.setCreatingError(false)
    this._submittedData = data
  }

  onCreated(genId: number) {
    this.genId = genId
    this.setPending(false)
  }

  clear() {
    this.genId = null
    this._submittedData = null
    this.setCreatingError(false)
  }

  get status(): Status {
    const { credits, hasPremium } = this.accountStore.data.membership

    if (this.currentGeneration) {
      const mapEntityStatusToStore: Record<GenerationEntityStatus, Status> = {
        [GenerationEntityStatus.ERROR]: Status.ERROR,
        [GenerationEntityStatus.IN_PROGRESS]: Status.IN_PROGRESS,
        [GenerationEntityStatus.SUCCESS]: Status.SUCCESS,
      }

      return mapEntityStatusToStore[this.currentGeneration.status]
    } else if (this.pending) {
      return Status.SUBMITTING
    } else if (this.isSubmitted) {
      if (credits < 1) {
        if (hasPremium) {
          return Status.TOP_UP
        }
        return Status.PREMIUM
      } else if (this.creatingError) {
        return Status.ERROR
      }
      return Status.READY_TO_RESUBMIT
    }
    return Status.NO_GENERATION
  }

  get isSubmitted() {
    return this._submittedData !== null
  }

  get pending(): boolean {
    return (
      this._pending ||
      Boolean(
        this.currentGeneration &&
          this.currentGeneration.status === GenerationEntityStatus.IN_PROGRESS
      )
    )
  }

  setPending(state: boolean) {
    this._pending = state
  }

  get creatingError() {
    return this._creatingError
  }

  setCreatingError(error: boolean) {
    this._creatingError = error
    this.setPending(false)
  }

  get currentGeneration(): GenerationEntity | null {
    if (this.genId) {
      return this.generationStore.getItem(this.genId)
    }
    return null
  }

  get enoughCredits(): boolean {
    return this.accountStore.data.membership.credits > 0
  }

  get submittedData() {
    return this._submittedData
  }
}

class CurrentGenerationService {
  constructor(
    private readonly curGenstore: CurrentGenerationStore,
    private readonly genDataService: GenerationDataService
  ) {
    this.submit = this.submit.bind(this)
    this.clearWorkers = this.clearWorkers.bind(this)
  }

  async submit(data: CreateGenerationRequest) {
    this.curGenstore.onSubmitted(data)

    if (this.curGenstore.enoughCredits) {
      this.curGenstore.setPending(true)
      try {
        const result = await this.genDataService.createGeneration(data)
        if (result) {
          this.curGenstore.onCreated(result.id)
        }
      } catch (error) {
        this.curGenstore.setCreatingError(true)
        throw error
      }
    }
  }

  async resubmit() {
    console.log('Resubmitting')
    const data = this.curGenstore.submittedData
    if (!data) {
      throw new Error('this._submittedData is undefined')
    }
    this.submit(data)
  }

  private timeoutId?: ReturnType<typeof setTimeout>

  private async updateGeneration(): Promise<void> {
    if (!this.curGenstore.currentGeneration) {
      throw new Error('this.curGenstore.currentGeneration is null')
    }
    await this.genDataService.getGeneration(
      this.curGenstore.currentGeneration.id
    )
  }

  addWorkers() {
    this.clearWorkers()
    if (this.curGenstore.status === Status.IN_PROGRESS) {
      this.timeoutId = setTimeout(async () => {
        this.updateGeneration().finally(() => {
          this.addWorkers()
        })
      }, 2000)
    }
    return this.clearWorkers
  }

  private clearWorkers() {
    clearTimeout(this.timeoutId)
  }

  readonly clear = this.curGenstore.clear
}

export function useCurrentGeneration(
  onGeneratingFinished: (generation: GenerationEntity) => void
) {
  const genStore = useGenerationStore()
  const accountStore = useAccountStore()
  const genDataService = useGenerationDataService()

  const curGenStore = useLocalObservable(
    () => new CurrentGenerationStore(genStore, accountStore)
  )

  const curGenService = useState(
    new CurrentGenerationService(curGenStore, genDataService)
  )[0]

  const state = useStoreData(
    () => ({
      status: curGenStore.status,
      isPending: curGenStore.pending,
    }),
    [curGenStore]
  )

  useEffect(() => {
    return reaction(
      () => curGenStore.status,
      (status, prevStatus) => {
        if (
          status === Status.READY_TO_RESUBMIT &&
          [Status.TOP_UP, Status.PREMIUM].includes(prevStatus)
        ) {
          curGenService.resubmit()
        } else if (status === Status.IN_PROGRESS) {
          return curGenService.addWorkers()
        } else if (status === Status.SUCCESS && curGenStore.currentGeneration) {
          onGeneratingFinished(curGenStore.currentGeneration)
          curGenService.clear()
        }
      }
    )
  }, [curGenStore, curGenService, onGeneratingFinished])

  return {
    state,
    submit: curGenService.submit,
    clear: curGenService.clear,
  }
}
