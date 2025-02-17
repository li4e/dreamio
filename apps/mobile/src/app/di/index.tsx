import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { DiContext } from 'shared/di'
import * as SplashScreen from 'expo-splash-screen'
import { appDataSource } from './db'
import { Store } from './store'
import { ImageCacheDeprecated } from 'shared/ui/CachedImage'

export function DiProvider({ children }: PropsWithChildren) {
  const [dbReady, setDbReady] = useState(false)

  const di = useMemo(() => {
    const store = new Store()

    return {
      store,
      db: appDataSource,
    }
  }, [])

  useEffect(() => {
    if (dbReady) {
      SplashScreen.hide()
    }
  }, [dbReady])

  useEffect(() => {
    if (!di.db.isInitialized) {
      Promise.all([
        di.db.initialize().catch((error) => {
          console.log('DB initialization error', error)
        }),
        ImageCacheDeprecated.clearAllCache(),
      ]).then(() => {
        setDbReady(true)
      })
    }
  }, [di.db])

  if (!dbReady) {
    return null
  }

  return <DiContext.Provider value={di}>{children}</DiContext.Provider>
}
