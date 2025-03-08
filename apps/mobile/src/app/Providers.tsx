import { PropsWithChildren, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DialogProvider } from 'shared/ui/Dialog'
import { SnackbarProvider } from 'shared/ui/Snackbar'
import { i18next } from './lib/i18next'
import { useThemes } from './ui/useThemes'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ReportDialogProvider } from 'shared/ui/ReportDialog'

export function Providers({ children }: PropsWithChildren) {
  const { paperTheme } = useThemes()

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(paperTheme.colors.background)
  }, [paperTheme])

  return (
    <View className="flex-1">
      <StatusBar style={paperTheme.dark ? 'light' : 'dark'} />
      <KeyboardProvider enabled={true}>
        <SafeAreaProvider>
          <GestureHandlerRootView>
            <PaperProvider theme={paperTheme}>
              <SnackbarProvider>
                <DialogProvider>
                  <I18nextProvider i18n={i18next}>
                    <ReportDialogProvider>{children}</ReportDialogProvider>
                  </I18nextProvider>
                </DialogProvider>
              </SnackbarProvider>
            </PaperProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </KeyboardProvider>
    </View>
  )
}
