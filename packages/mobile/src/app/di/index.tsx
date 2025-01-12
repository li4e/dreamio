import LottieView from 'lottie-react-native'
import { PropsWithChildren, useMemo, useState } from 'react'
// import { adapty } from 'react-native-adapty'
import Animated, { FadeOut } from 'react-native-reanimated'
import { useAuthListeners } from 'shared/auth/useAuthListeners'
// import { ADAPY_PUBLIC_SDK_KEY } from 'shared/constants'
import { DiContext } from 'shared/di'
import StartAnimation from '../ui/launch_animation.json'
import { appDataSource } from './db'
import { PaywallsManager } from './paywalls-manager'
import { Store } from './store'

export function DiProvider({ children }: PropsWithChildren) {
  const [dbReady, setDbReady] = useState(false)
  const [animationFinished, setAnimationFinished] = useState(false)
  const showLoader = !dbReady || !animationFinished

  const di = useMemo(() => {
    if (!appDataSource.isInitialized) {
      appDataSource.initialize().then(() => {
        setDbReady(true)
      })
    }

    const store = new Store()

    // adapty.activate(ADAPY_PUBLIC_SDK_KEY, {
    //   customerUserId: store.account.data.id
    //     ? String(store.account.data.id)
    //     : undefined,
    // })

    const paywalls = new PaywallsManager(store.account)

    // paywalls.initialize()

    return {
      store,
      paywalls,
      db: appDataSource,
    }
  }, [])

  useAuthListeners(di.store.account)

  if (showLoader) {
    return (
      <Animated.View
        className="flex-1 bg-white items-center justify-center"
        exiting={FadeOut.duration(200)}
      >
        <LottieView
          style={{ width: '90%', height: 300 }}
          source={StartAnimation}
          autoPlay
          duration={500}
          loop={false}
          onAnimationFinish={() => setAnimationFinished(true)}
        />
      </Animated.View>
    )
  }

  return <DiContext.Provider value={di}>{children}</DiContext.Provider>
}
