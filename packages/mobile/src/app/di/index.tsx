import { PropsWithChildren, useMemo } from 'react'
import { DiContext } from 'shared/di'
import { appDataSource } from './db'
import { Store } from './store'

export function DiProvider({ children }: PropsWithChildren) {
  const di = useMemo(() => {
    if (!appDataSource.isInitialized) {
      appDataSource.initialize()
    }

    return {
      store: new Store(),
      db: appDataSource,
    }
  }, [])

  return <DiContext.Provider value={di}>{children}</DiContext.Provider>
}
