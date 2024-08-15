import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { StatusBar, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SnackbarProvider } from 'shared/ui/Snackbar'
import { DiProvider } from './di'
import { i18next } from './lib/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <KBAvoidingView>
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
      </KBAvoidingView>
    </SafeAreaProvider>
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

export function KBAvoidingView({ children }: PropsWithChildren) {
  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true })
  const style = useAnimatedStyle(
    () => ({
      paddingBottom:
        keyboard.state.value === KeyboardState.OPEN ? keyboard.height.value : 0,
    }),
    []
  )

  return (
    <Animated.View className="flex-1" style={style}>
      {children}
    </Animated.View>
  )
}
