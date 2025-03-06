import * as React from 'react'
import { AppRouter } from './AppRouter'
import { Providers } from './Providers'
import * as SplashScreen from 'expo-splash-screen'
import RNTestFlight from 'react-native-test-flight'
import { firebase } from '@react-native-firebase/analytics'

if (!__DEV__ && RNTestFlight.isTestFlight !== true) {
  firebase.analytics().setAnalyticsCollectionEnabled(true)
}

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({
  duration: 300,
  fade: true,
})

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
