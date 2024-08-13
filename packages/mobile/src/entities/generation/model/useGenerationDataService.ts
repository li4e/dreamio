import { useMemo } from 'react'
import { useAccountStore } from 'shared/auth/AccountStore'
import { useGenerationRepository } from './db/useGenerationDB'
import { GenerationDataService } from './GenerationDataService'
import { useGenerationStore } from './useGenerationStore'

export function useGenerationDataService() {
  const store = useGenerationStore()
  const accountStore = useAccountStore()
  const repository = useGenerationRepository()
  return useMemo(
    () => new GenerationDataService(store, repository, accountStore),
    [store, repository, accountStore]
  )
}
