import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { KeyboardAvoidingView, StatusBar, View } from 'react-native'
import { PaperProvider, useTheme } from 'react-native-paper'
import { i18next } from './lib/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <PaperProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ThemeProvider>
          <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
        </ThemeProvider>
      </KeyboardAvoidingView>
    </PaperProvider>
  )
}

function ThemeProvider(props: PropsWithChildren) {
  const { children, ...rest } = props
  const { colors } = useTheme()

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      {...rest}
    >
      {children}
    </View>
  )
}
