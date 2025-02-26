import { GenerationEntity, GenerationEntityStatus } from 'entities/generation'
import { makeAutoObservable } from 'mobx'
import { useMemo } from 'react'
import { mkkvStorage } from 'shared/lib/mmkv'

export enum Status {
  NO_GENERATION,
  IN_PROGRESS,
  SUCCESS,
  ERROR,
}

interface PersistingData {
  generation: GenerationEntity | null
}

export class UIStateStore {
  private _aspectRatioModalOpened = false
  private _styleSelectorModalOpened = false
  private _isFormDisabled = false
  private _isPending = false
  private _isPendingPromptGen = false
  private _hasError = false
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

  set hasError(value: boolean) {
    this._hasError = value
  }
  get hasError() {
    return (
      this._hasError || this.generation?.status === GenerationEntityStatus.ERROR
    )
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
      isPending: this.isPending,
      isPendingPromptGen: this.isPendingPromptGen,
      hasError: this.hasError,
    }
  }

  private readonly _persistingKey = 'ui_state_store'
  private get _persistingData(): PersistingData {
    return {
      generation:
        this.generation?.status !== GenerationEntityStatus.SUCCESS
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
