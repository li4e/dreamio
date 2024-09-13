import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { adaptNavigationTheme } from 'react-native-paper'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import Animated, { FadeIn } from 'react-native-reanimated'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  HomeTabsNavigatorParamList,
  RootStackParamList,
} from 'types/navigation'
import { GenerationResultScreen } from 'pages/generation-result'
import { GenerationStartScreen } from 'pages/generation-start'
import { HistoryScreen } from 'pages/history'
import { SettingsScreen } from 'pages/settings'
import { WebViewScreen } from 'pages/WebView'
import { theme } from '../ui/customTheme'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createMaterialBottomTabNavigator<HomeTabsNavigatorParamList>()

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  materialLight: theme,
})

export function AppRouter() {
  return (
    <NavigationContainer theme={LightTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name={'home_tabs'} component={HomeTabs} />
        <RootStack.Screen
          name={'generation_result'}
          component={GenerationResultScreen}
        />
        <RootStack.Screen name={'settings'} component={SettingsScreen} />
        <RootStack.Screen name={'webview'} component={WebViewScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()

  return (
    <Animated.View className="flex-1" entering={FadeIn.duration(200)}>
      <Tab.Navigator
        theme={LightTheme}
        initialRouteName="generation"
        sceneAnimationEnabled={true}
      >
        <Tab.Screen
          name="history"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name="history" color={color} size={26} />
            ),
            tabBarLabel: t('components.tabBar.history'),
          }}
        />

        <Tab.Screen
          name="generation"
          component={GenerationStartScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="image-plus"
                color={color}
                size={26}
              />
            ),
            tabBarLabel: t('components.tabBar.generation'),
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
          }}
        />
      </Tab.Navigator>
    </Animated.View>
  )
}
