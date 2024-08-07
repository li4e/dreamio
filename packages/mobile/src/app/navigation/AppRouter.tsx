import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { AccountScreen } from 'pages/account'
import { DiscoverScreen } from 'pages/discover'
import { ImageGenerationScreen } from 'pages/image-generation'

const Tab = createBottomTabNavigator()

export function AppRouter() {
  const { t } = useTranslation()

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name={t('components.tabBar.discovery')}
          component={DiscoverScreen}
        />
        <Tab.Screen
          name={t('components.tabBar.generation')}
          component={ImageGenerationScreen}
        />
        <Tab.Screen
          name={t('components.tabBar.account')}
          component={AccountScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
