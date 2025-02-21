import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
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
import { useThemes } from './ui/useThemes'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createMaterialBottomTabNavigator<HomeTabsNavigatorParamList>()

export function AppRouter() {
  const { navigationTheme } = useThemes()
  return (
    <NavigationContainer theme={navigationTheme}>
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
        <RootStack.Screen name={'webview'} component={WebViewScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()
  const { paperTheme } = useThemes()

  return (
    <Tab.Navigator
      theme={paperTheme}
      initialRouteName="generation"
      sceneAnimationEnabled={false}
      keyboardHidesNavigationBar={false}
    >
      <Tab.Screen
        name="history"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" color={color} size={26} />
          ),
          tabBarLabel: t('components.tabBar.history'),
          tabBarButtonTestID: 'TAB_BUTTON_HISTORY',
        }}
      />

      <Tab.Screen
        name="generation"
        component={GenerationStartScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="image-plus" color={color} size={26} />
          ),
          tabBarLabel: t('components.tabBar.generation'),
          tabBarButtonTestID: 'TAB_BUTTON_GENERATION',
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
          tabBarButtonTestID: 'TAB_BUTTON_SETTINGS',
        }}
      />
    </Tab.Navigator>
  )
}
