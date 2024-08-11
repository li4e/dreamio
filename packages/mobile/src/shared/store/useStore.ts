import { useContext } from 'react'
import { StoreContext } from './store'

export function useStore(): RootStore {
  const store = useContext(StoreContext)

  if (store === null) {
    throw new Error('Root store is not provided')
  }

  return store
}
