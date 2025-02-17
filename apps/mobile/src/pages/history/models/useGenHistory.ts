import { useCallback, useEffect, useRef, useState } from 'react'
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
  fetchMore: () => Promise<void>
  fetchedAll: boolean
} {
  const [isPending, setPending] = useState(false)
  const genDataService = useGenerationDataService()
  const [fetchedAll, setFetchedAll] = useState(false)
  const genStore = useGenerationStore()
  const history = useStoreData(() => {
    return genStore.list
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((item) => item.status === GenerationEntityStatus.SUCCESS)
  }, [genStore])

  useEffect(() => {
    setPending(true)
    genDataService
      .fetchData()
      .finally(() => {
        setPending(false)
      })
      .then((hasMore) => {
        setFetchedAll(!hasMore)
      })
  }, [genDataService, setPending])

  const fetchMore = useCallback(async () => {
    setPending(true)
    try {
      const hasMore = await genDataService.fetchData()
      setFetchedAll(!hasMore)
    } finally {
      setPending(false)
    }
  }, [genDataService])

  return { history, isPending, fetchMore, fetchedAll }
}
