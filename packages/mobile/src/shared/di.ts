import { createContext, useContext } from 'react'

export const DiContext = createContext<DiInterface | null>(null)

export function useDI() {
  const di = useContext(DiContext)

  if (di === null) {
    throw new Error('DI is not provided')
  }

  return di
}

export function usePaywallManager() {
  return useDI().paywalls
}
