import * as React from 'react'
import { AppRouter } from './AppRouter'
import { Providers } from './Providers'
import * as SplashScreen from 'expo-splash-screen'

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
