import { useStore, useStoreData } from 'shared/store'
import { GenerationEntity } from './GenerationEntity'

export function useGenerationEntity(id: number): GenerationEntity | null {
  const store = useStore()
  return useStoreData(() => store.generation.getItem(id), [useStoreData, id])
}
