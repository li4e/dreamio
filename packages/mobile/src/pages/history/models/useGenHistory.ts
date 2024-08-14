import { useEffect } from 'react'
import {
  GenerationEntity,
  GenerationEntityStatus,
  useGenerationDataService,
  useGenerationStore,
} from 'entities/generation'
import { useStoreData } from 'shared/store'

export function useHistory(): GenerationEntity[] {
  const genDataService = useGenerationDataService()
  const genStore = useGenerationStore()
  const history = useStoreData(() => {
    return genStore.list
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((item) => item.status === GenerationEntityStatus.SUCCESS)
  }, [genStore])

  useEffect(() => {
    setTimeout(() => {
      genDataService.restoreAll()
    }, 500)
  }, [genDataService])

  return history
}
