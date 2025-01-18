import { useMemo } from 'react'
import { useGenerationRepository } from '../db/useGenerationDB'
import { GenerationDataService } from '../GenerationDataService'
import { useGenerationStore } from './useGenerationStore'

export function useGenerationDataService() {
  const store = useGenerationStore()

  const repository = useGenerationRepository()
  return useMemo(
    () => new GenerationDataService(store, repository),
    [store, repository]
  )
}
