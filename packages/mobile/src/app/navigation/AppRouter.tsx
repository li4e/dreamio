import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  DefaultTheme,
  CommonActions,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { adaptNavigationTheme, BottomNavigation } from 'react-native-paper'
import Animated, {
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  HomeTabsNavigatorParamList,
  RootStackParamList,
} from 'types/navigation'
import { GenerationResultScreen } from 'pages/generation-result'
import { GenerationStartScreen } from 'pages/generation-start'
import { HistoryScreen } from 'pages/history'
import { SettingsScreen } from 'pages/settings'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<HomeTabsNavigatorParamList>()

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
})

export function AppRouter() {
  const { t } = useTranslation()

  return (
    <NavigationContainer theme={LightTheme}>
      <RootStack.Navigator
        screenOptions={{
          keyboardHandlingEnabled: true,
        }}
      >
        <RootStack.Screen
          name={'home_tabs'}
          component={HomeTabs}
          options={{
            headerShown: false,
            title: t('components.appBar.back'),
          }}
        />
        <RootStack.Screen
          name={'generation_result'}
          component={GenerationResultScreen}
          options={{
            title: t('screens.generationResult.title'),
          }}
        />
        <RootStack.Screen name={'settings'} component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const keyboard = useAnimatedKeyboard()
  const paddingBottom = insets.bottom + 80

  const style = useAnimatedStyle(
    () => ({
      paddingBottom: interpolate(
        keyboard.height.value,
        [0, paddingBottom],
        [paddingBottom, 0]
      ),
    }),
    [paddingBottom]
  )

  return (
    <Animated.View className="flex-1" style={style}>
      <Tab.Navigator
        initialRouteName="generation"
        tabBar={(props) => (
          <CustomTabBar paddingBottom={paddingBottom} {...props} />
        )}
      >
        <Tab.Screen
          name="history"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="history" color={color} size={26} />
            ),
            title: t('screens.history.title'),
            tabBarLabel: t('components.tabBar.history'),
          }}
        />

        <Tab.Screen
          name="generation"
          component={GenerationStartScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="draw" color={color} size={26} />
            ),
            tabBarLabel: t('components.tabBar.generation'),
            title: t('screens.generation.title'),
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="tune" color={color} size={26} />
            ),
            tabBarLabel: t('components.tabBar.settings'),
            title: t('components.tabBar.settings'),
          }}
        />
      </Tab.Navigator>
    </Animated.View>
  )
}

interface CustomTabBarProps extends BottomTabBarProps {
  paddingBottom: number
}

function CustomTabBar(props: CustomTabBarProps) {
  const { paddingBottom, state, navigation, descriptors } = props
  const style = useMemo(
    () => ({
      transform: [{ translateY: paddingBottom }],
    }),
    [paddingBottom]
  )

  return (
    <View className="absolute left-0 right-0 bottom-0" style={style}>
      <BottomNavigation.Bar
        navigationState={state}
        onTabPress={({ route, preventDefault }) => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (event.defaultPrevented) {
            preventDefault()
          } else {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            })
          }
        }}
        renderIcon={({ route, focused, color }) => {
          const { options } = descriptors[route.key]
          if (options.tabBarIcon) {
            return options.tabBarIcon({ focused, color, size: 24 })
          }

          return null
        }}
        getLabelText={({ route }) => {
          const { options } = descriptors[route.key]
          return options.tabBarLabel as string
        }}
      />
    </View>
  )
}
