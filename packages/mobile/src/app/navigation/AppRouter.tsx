import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  HomeTabsNavigatorParamList,
  RootStackParamList,
} from 'types/navigation'
import { AccountScreen } from 'pages/account'
import { DiscoverScreen } from 'pages/discover'
import { ImageGenerationScreen } from 'pages/image-generation'
import { SettingsScreen } from 'pages/settings'
import { SettingsButton } from 'shared/ui/SettingsButton'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<HomeTabsNavigatorParamList>()

export function AppRouter() {
  const { t } = useTranslation()

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name={'home_tabs'}
          component={HomeTabs}
          options={{
            headerTitle: '',
            headerRight: () => <SettingsButton />,
          }}
        />
        <RootStack.Screen
          name={'settings'}
          component={SettingsScreen}
          options={{
            title: t('screens.settings.title'),
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: t('components.tabBar.discovery'),
        }}
      />
      <Tab.Screen
        name="generation"
        component={ImageGenerationScreen}
        options={{
          tabBarLabel: t('components.tabBar.generation'),
        }}
      />
      <Tab.Screen
        name="account"
        component={AccountScreen}
        options={{
          tabBarLabel: t('components.tabBar.account'),
        }}
      />
    </Tab.Navigator>
  )
}
