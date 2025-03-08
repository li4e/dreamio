import * as React from 'react'
import { AppRouter } from './AppRouter'
import { Providers } from './Providers'
import * as SplashScreen from 'expo-splash-screen'
import RNTestFlight from 'react-native-test-flight'
import { firebase } from '@react-native-firebase/analytics'
import { useDIProvider } from './di'
import { DiContext } from 'shared/di'

if (!__DEV__ && RNTestFlight.isTestFlight !== true) {
  firebase.analytics().setAnalyticsCollectionEnabled(true)
}

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 300,
  fade: true,
})

export function App() {
  const { dbReady, di } = useDIProvider()

  if (!dbReady) {
    return null
  }

  return (
    <DiContext.Provider value={di}>
      <Providers>
        <AppRouter />
      </Providers>
    </DiContext.Provider>
  )
}
