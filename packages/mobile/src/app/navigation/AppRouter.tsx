import {
  BottomTabBarProps,
  BottomTabHeaderProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import { getHeaderTitle } from '@react-navigation/elements'
import {
  NavigationContainer,
  DefaultTheme,
  CommonActions,
} from '@react-navigation/native'
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  adaptNavigationTheme,
  Appbar,
  BottomNavigation,
} from 'react-native-paper'
import Animated, {
  KeyboardState,
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
          header: (props) => <CustomAppBar {...props} />,
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

  const bottomBarHeight = insets.bottom + 80

  const style = useAnimatedStyle(
    () => ({
      paddingBottom:
        keyboard.state.value === KeyboardState.OPEN ? 0 : bottomBarHeight,
    }),
    [bottomBarHeight, keyboard]
  )

  return (
    <Animated.View className="flex-1" style={style}>
      <Tab.Navigator
        initialRouteName="generation"
        screenOptions={{
          header: (props) => <CustomAppBar {...props} />,
        }}
        tabBar={(props) => (
          <CustomTabBar bottomBarHeight={bottomBarHeight} {...props} />
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
            title: t('screens.settings.title'),
          }}
        />
      </Tab.Navigator>
    </Animated.View>
  )
}

interface CustomTabBarProps extends BottomTabBarProps {
  bottomBarHeight: number
}

function CustomAppBar(props: NativeStackHeaderProps | BottomTabHeaderProps) {
  const { options, route, back, navigation } = props as NativeStackHeaderProps
  const title = getHeaderTitle(options, route.name)

  return (
    <Appbar.Header elevated>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  )
}

function CustomTabBar(props: CustomTabBarProps) {
  const { bottomBarHeight, state, navigation, descriptors } = props

  return (
    <Animated.View
      className="absolute left-0 right-0"
      style={{ bottom: -bottomBarHeight }}
    >
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
    </Animated.View>
  )
}
