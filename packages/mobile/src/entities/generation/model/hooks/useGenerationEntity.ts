import { useStoreData } from 'shared/store'
import { GenerationEntity } from '../GenerationEntity'
import { useGenerationStore } from './useGenerationStore'

export function useGenerationEntity(id: number): GenerationEntity | null {
  const generationStore = useGenerationStore()
  return useStoreData(() => generationStore.getItem(id), [useStoreData, id])
}
