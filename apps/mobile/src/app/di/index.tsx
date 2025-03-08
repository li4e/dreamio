import { useEffect, useMemo, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { appDataSource } from './db'
import { Store } from './store'

export function useDIProvider() {
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
      di.db
        .initialize()
        .catch((error) => {
          console.log('DB initialization error', error)
        })
        .then(() => {
          setDbReady(true)
        })
    }
  }, [di.db])

  return { dbReady, di }
}
