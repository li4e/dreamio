import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { adaptNavigationTheme } from 'react-native-paper'
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

  return (
    <Tab.Navigator initialRouteName="history">
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
  )
}
