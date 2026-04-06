import { GenerationEntity, GenerationEntityStatus } from 'entities/generation'
import { GenerationAPIErrorType } from 'entities/generation/api'
import { makeAutoObservable } from 'mobx'
import { useMemo } from 'react'
import { mkkvStorage } from 'shared/lib/mmkv'

export function mapGenerationAPIErrorToUIStateStoreError(
  error: GenerationAPIErrorType
): StateGenerationError {
  if (error === GenerationAPIErrorType.PROMPT_UNSAFE) {
    return StateGenerationError.PromptUnsafe
  } else if (error === GenerationAPIErrorType.SERVICE_UNAVAILABLE) {
    return StateGenerationError.ServiceUnavailable
  } else if (error === GenerationAPIErrorType.INSUFFICIENT_CREDITS) {
    return StateGenerationError.InsufficientCredits
  } else if (error === GenerationAPIErrorType.RATE_LIMITED) {
    return StateGenerationError.RateLimited
  }
  return StateGenerationError.General
}

export enum Status {
  NO_GENERATION,
  IN_PROGRESS,
  SUCCESS,
  ERROR,
}

interface PersistingData {
  generation: GenerationEntity | null
}

export enum StateGenerationError {
  PromptUnsafe = 1,
  ServiceUnavailable = 2,
  General = 3,
  InsufficientCredits = 4,
  RateLimited = 5,
}

export class UIStateStore {
  private _aspectRatioModalOpened = false
  private _styleSelectorModalOpened = false
  private _isFormDisabled = false
  private _isCreating = false
  private _isPending = false
  private _isCancelling = false
  private _isPendingPromptGen = false
  private _error: StateGenerationError | null = null
  private _generation: GenerationEntity | null = null

  constructor() {
    this.restore()
    makeAutoObservable(this)
  }

  set aspectRatioModalOpened(value: boolean) {
    this._aspectRatioModalOpened = value
  }
  get aspectRatioModalOpened() {
    return this._aspectRatioModalOpened
  }

  set styleSelectorModalOpened(value: boolean) {
    this._styleSelectorModalOpened = value
  }
  get styleSelectorModalOpened() {
    return this._styleSelectorModalOpened
  }

  set isFormDisabled(value: boolean) {
    this._isFormDisabled = value
  }
  get isFormDisabled() {
    return this._isFormDisabled
  }

  set isCreating(value: boolean) {
    this._isCreating = value
  }
  get isCreating() {
    return this._isCreating
  }

  set isCancelling(value: boolean) {
    this._isCancelling = value
  }
  get isCancelling() {
    return this._isCancelling
  }

  set isPending(value: boolean) {
    this._isPending = value
  }
  get isPending() {
    return this._isPending
  }

  set isPendingPromptGen(value: boolean) {
    this._isPendingPromptGen = value
  }
  get isPendingPromptGen() {
    return this._isPendingPromptGen
  }

  get hasError() {
    return (
      this._error !== null ||
      this.generation?.status === GenerationEntityStatus.ERROR
    )
  }

  get error() {
    return this._error
  }

  set error(value: StateGenerationError | null) {
    this._error = value
    this.persistData()
  }

  set generation(value: GenerationEntity | null) {
    this._generation = value
    this.persistData()
  }
  get generation() {
    return this._generation
  }

  get resultImage(): string | null {
    if (this.generation?.status === GenerationEntityStatus.SUCCESS) {
      return this.generation?.images[0] ?? null
    }
    return null
  }

  get status(): Status {
    if (this.isPending) {
      return Status.IN_PROGRESS
    } else if (
      this.generation &&
      this.generation.status === GenerationEntityStatus.SUCCESS
    ) {
      return Status.SUCCESS
    } else if (this.hasError) {
      return Status.ERROR
    }

    return Status.NO_GENERATION
  }

  get state() {
    return {
      status: this.status,
      generation: this.generation,
      resultImage: this.resultImage,
      isCreating: this.isCreating,
      isCancelling: this.isCancelling,
      isPending: this.isPending,
      isPendingPromptGen: this.isPendingPromptGen,
      hasError: this.hasError,
      error: this.error,
    }
  }

  private readonly _persistingKey = 'ui_state_store'
  private get _persistingData(): PersistingData {
    return {
      generation:
        this.generation?.status !== GenerationEntityStatus.SUCCESS &&
        this._error === null
          ? this.generation
          : null,
    }
  }
  private persistData() {
    mkkvStorage.set(this._persistingKey, JSON.stringify(this._persistingData))
  }
  private restore() {
    const generationString = mkkvStorage.getString(this._persistingKey)
    if (generationString) {
      const data = JSON.parse(generationString) as Partial<PersistingData>
      if (data.generation) {
        this._generation = data.generation
      }
    }
  }
}

export function useUIActions(uiStateStore: UIStateStore) {
  return useMemo(
    () => ({
      showAspectDialog() {
        uiStateStore.aspectRatioModalOpened = true
      },
      hideAspectDialog() {
        uiStateStore.aspectRatioModalOpened = false
      },
      showStylesDialog() {
        uiStateStore.styleSelectorModalOpened = true
      },
      hideStylesDialog() {
        uiStateStore.styleSelectorModalOpened = false
      },
    }),
    [uiStateStore]
  )
}
