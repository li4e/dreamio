import * as React from 'react'
import { KeyboardAvoidingView, StatusBar } from 'react-native'
import { enableFreeze } from 'react-native-screens'
import { AppRouter } from './navigation/AppRouter'
import { Providers } from './Providers'
import './lib/gesture-handler'

enableFreeze(true)

export function App() {
  return (
    <Providers>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <AppRouter />
      </KeyboardAvoidingView>
    </Providers>
  )
}
