import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { useColorScheme, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DialogProvider } from 'shared/ui/Dialog'
import { SnackbarProvider } from 'shared/ui/Snackbar'
import {
  NavigationContainer,
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
} from '@react-navigation/native'
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper'
import { DiProvider } from './di'
import { i18next } from './lib/i18next'

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: RNLightTheme,
  reactNavigationDark: RNDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
})

const lightTheme = { ...LightTheme, fonts: RNLightTheme.fonts }
const darkTheme = { ...DarkTheme, fonts: RNDarkTheme.fonts }

export function Providers({ children }: PropsWithChildren) {
  let colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const navigationTheme = isDark ? darkTheme : lightTheme
  const paparTheme = isDark ? MD3DarkTheme : MD3LightTheme

  return (
    <View className="flex-1">
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <NavigationContainer theme={navigationTheme}>
            <PaperProvider theme={paparTheme}>
              <SnackbarProvider>
                <DialogProvider>
                  <DiProvider>
                    <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
                  </DiProvider>
                </DialogProvider>
              </SnackbarProvider>
            </PaperProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>
  )
}
