import {
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
} from '@react-navigation/native'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper'
import { useStoreData } from 'shared/store'
import { useColorSchemeStore } from 'shared/store/ColorSchemeStore'

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: RNLightTheme,
  reactNavigationDark: RNDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
})

const lightTheme = { ...LightTheme, fonts: RNLightTheme.fonts }
const darkTheme = { ...DarkTheme, fonts: RNDarkTheme.fonts }

export function useThemes() {
  const systemColorScheme = useColorScheme()
  const colorSchemeStore = useColorSchemeStore()
  const colorScheme = useStoreData(
    () => colorSchemeStore.colorScheme,
    [colorSchemeStore]
  )

  useEffect(() => {
    if (systemColorScheme) {
      colorSchemeStore.systemColorScheme = systemColorScheme
    }
  }, [systemColorScheme, colorSchemeStore])

  const isDark = colorScheme === 'dark'
  const navigationTheme = isDark ? darkTheme : lightTheme
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme
  return { navigationTheme, paperTheme }
}
