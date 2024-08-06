import * as React from 'react'
import { AppRouter } from './AppRouter'

import { enableFreeze } from 'react-native-screens'
import { Providers } from './Providers'
enableFreeze(true)

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
