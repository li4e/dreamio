import { PropsWithChildren } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export function Providers({ children }: PropsWithChildren) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>
}
