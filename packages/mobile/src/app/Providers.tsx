import { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'
import { PaperProvider } from 'react-native-paper'
import { i18next } from './lib/i18next'

export function Providers({ children }: PropsWithChildren) {
  return (
    <PaperProvider>
      <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
    </PaperProvider>
  )
}
