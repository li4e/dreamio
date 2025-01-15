import * as React from 'react'
import { enableFreeze } from 'react-native-screens'
import { AppRouter } from './navigation/AppRouter'
import { Providers } from './Providers'

import './lib/gesture-handler'
import './lib/dayjs'

enableFreeze(true)

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
