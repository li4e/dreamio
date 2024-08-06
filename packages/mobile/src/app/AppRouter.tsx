import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { AccountScreen } from '../screens/account'
import { DiscoverScreen } from '../screens/discover'
import { ImageGenerationScreen } from '../screens/image-generation'

const Tab = createBottomTabNavigator()

export function AppRouter() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="ImageGeneration" component={ImageGenerationScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
