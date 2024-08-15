import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SnackbarProvider } from 'shared/ui/Snackbar'
import { DiProvider } from './di'
import { i18next } from './lib/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <PaperProvider theme={MD3LightTheme}>
          <SnackbarProvider>
            <DiProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
              />

              <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
            </DiProvider>
          </SnackbarProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
