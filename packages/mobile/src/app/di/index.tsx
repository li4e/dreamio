import { PropsWithChildren, useMemo } from 'react'
import { adapty } from 'react-native-adapty'
import { useAuthListeners } from 'shared/auth/useAuthListeners'
import { ADAPY_PUBLIC_SDK_KEY } from 'shared/constants'
import { DiContext } from 'shared/di'
import { appDataSource } from './db'
import { PaywallsManager } from './paywalls-manager'
import { Store } from './store'

export function DiProvider({ children }: PropsWithChildren) {
  const di = useMemo(() => {
    if (!appDataSource.isInitialized) {
      appDataSource.initialize()
    }

    const store = new Store()

    adapty.activate(ADAPY_PUBLIC_SDK_KEY, {
      customerUserId: store.account.data.id
        ? String(store.account.data.id)
        : undefined,
    })

    const paywalls = new PaywallsManager(store.account)

    paywalls.initialize()

    return {
      store,
      paywalls,
      db: appDataSource,
    }
  }, [])

  useAuthListeners(di.store.account)

  return <DiContext.Provider value={di}>{children}</DiContext.Provider>
}
