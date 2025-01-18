import { useEffect, useState } from 'react'
import {
  GenerationEntity,
  GenerationEntityStatus,
  useGenerationDataService,
  useGenerationStore,
} from 'entities/generation'
import { useStoreData } from 'shared/store'

export function useHistory(): {
  history: GenerationEntity[]
  isPending: boolean
} {
  const [isPending, setPending] = useState(false)
  const genDataService = useGenerationDataService()
  const genStore = useGenerationStore()
  const history = useStoreData(() => {
    return genStore.list
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((item) => item.status === GenerationEntityStatus.SUCCESS)
  }, [genStore])

  useEffect(() => {
    setPending(true)
    genDataService.restoreAll().finally(() => {
      setPending(false)
    })
  }, [genDataService, setPending])

  return { history, isPending }
}
