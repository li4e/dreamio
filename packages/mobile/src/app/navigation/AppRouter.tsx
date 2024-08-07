import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { AccountScreen } from 'screens/account'
import { DiscoverScreen } from 'screens/discover'
import { ImageGenerationScreen } from 'screens/image-generation'

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
