import * as React from 'react'
import { useFrameCallback } from 'react-native-reanimated'
import { enableFreeze } from 'react-native-screens'
import { AppRouter } from './navigation/AppRouter'
import { Providers } from './Providers'
import './lib/gesture-handler'

enableFreeze(true)

export function App() {
  useFrameCallback(() => {
    // Required
  })

  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
