import { useMemo } from 'react'
import { useDB } from 'shared/db'
import { Generation } from './Generation'
import { GenerationRepository } from './GenerationRepository'

export function useGenerationRepository(): GenerationRepository {
  const db = useDB()
  return useMemo(() => db.getRepository(Generation), [db])
}
