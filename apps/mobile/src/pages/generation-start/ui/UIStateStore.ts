import { makeAutoObservable } from 'mobx'
import { createContext, useContext, useMemo } from 'react'

export class UIStateStore {
  private _aspectRatioModalOpened = false

  constructor() {
    makeAutoObservable(this)
  }

  set aspectRatioModalOpened(value: boolean) {
    this._aspectRatioModalOpened = value
  }
  get aspectRatioModalOpened() {
    return this._aspectRatioModalOpened
  }
}

export const UIStateStoreContext = createContext<UIStateStore | null>(null)

export function useUIStateStore() {
  const uiStateStore = useContext(UIStateStoreContext)
  if (!uiStateStore) {
    throw new Error('uiStateStore is null')
  }
  return uiStateStore
}

export function useUIActions() {
  const uiStateStore = useUIStateStore()
  return useMemo(
    () => ({
      showAspectModal() {
        uiStateStore.aspectRatioModalOpened = true
      },
      hideAspectModal() {
        uiStateStore.aspectRatioModalOpened = false
      },
    }),
    [uiStateStore]
  )
}
