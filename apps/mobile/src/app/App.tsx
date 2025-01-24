import * as React from 'react'
import { AppRouter } from './AppRouter'
import { Providers } from './Providers'

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
