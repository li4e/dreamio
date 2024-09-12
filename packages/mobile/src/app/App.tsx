import * as React from 'react'
import { adapty } from 'react-native-adapty'
import { useFrameCallback } from 'react-native-reanimated'
import { enableFreeze } from 'react-native-screens'
import { ADAPY_PUBLIC_SDK_KEY } from 'shared/constants'
import { firebaseAuth } from 'shared/lib/firebase'
import { AppRouter } from './navigation/AppRouter'
import { Providers } from './Providers'

import './lib/gesture-handler'
import './lib/dayjs'

enableFreeze(true)
adapty.activate(ADAPY_PUBLIC_SDK_KEY, {
  customerUserId: firebaseAuth.currentUser?.uid,
})

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
