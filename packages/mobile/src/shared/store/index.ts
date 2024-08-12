import { useDI } from '../di'
export { useStoreData } from './useStoreData'

export function useStore(): RootStore {
  return useDI().store
}
