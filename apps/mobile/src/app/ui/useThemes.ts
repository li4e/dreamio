import {
  NavigationContainer,
  DefaultTheme as RNLightTheme,
  DarkTheme as RNDarkTheme,
} from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper'

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: RNLightTheme,
  reactNavigationDark: RNDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
})

const lightTheme = { ...LightTheme, fonts: RNLightTheme.fonts }
const darkTheme = { ...DarkTheme, fonts: RNDarkTheme.fonts }

export function useThemes() {
  let colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const navigationTheme = isDark ? darkTheme : lightTheme
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme
  return { navigationTheme, paperTheme }
}
