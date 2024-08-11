import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  HomeTabsNavigatorParamList,
  RootStackParamList,
} from 'types/navigation'
import { GenerationResultScreen } from 'pages/generation-result'
import { HistoryScreen } from 'pages/history'
import { ImageGenerationScreen } from 'pages/image-generation'
import { SettingsScreen } from 'pages/settings'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createMaterialBottomTabNavigator<HomeTabsNavigatorParamList>()

export function AppRouter() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
        initialRouteName="generation_result"
      >
        <RootStack.Screen
          name={'home_tabs'}
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name={'generation_result'}
          component={GenerationResultScreen}
        />
        <RootStack.Screen name={'settings'} component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      keyboardHidesNavigationBar={true}
      initialRouteName="generation"
    >
      <Tab.Screen
        name="history"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" color={color} size={26} />
          ),
          tabBarLabel: t('components.tabBar.history'),
        }}
      />
      <Tab.Screen
        name="generation"
        component={ImageGenerationScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="draw" color={color} size={26} />
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
  )
}
