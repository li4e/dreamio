import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { KeyboardAvoidingView, StatusBar, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { SnackbarProvider } from 'shared/ui/Snackbar'
import { DiProvider } from './di'
import { i18next } from './lib/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <GestureHandlerRootView>
        <PaperProvider theme={MD3LightTheme}>
          <SnackbarProvider>
            <DiProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent={true}
              />
              <ThemeProvider>
                <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
              </ThemeProvider>
            </DiProvider>
          </SnackbarProvider>
        </PaperProvider>
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  )
}

function ThemeProvider(props: PropsWithChildren) {
  const { children, ...rest } = props

  return (
    <View className="flex-1" {...rest}>
      {children}
    </View>
  )
}
