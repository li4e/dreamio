import { useStore } from 'shared/store'
import { GenerationStore } from './GenerationStore'

export function useGenerationStore(): GenerationStore {
  return useStore().generation
}
