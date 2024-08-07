import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
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
