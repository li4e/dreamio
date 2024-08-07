import { PropsWithChildren } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { I18nextProvider } from 'react-i18next'
import { i18next } from './libs/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
