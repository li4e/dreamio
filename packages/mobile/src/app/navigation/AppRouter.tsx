import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native-ui-lib'
import {
  HomeTabsNavigatorParamList,
  RootStackParamList,
} from 'types/navigation'
import { AccountScreen } from 'pages/account'
import { DiscoverScreen } from 'pages/discover'
import { ImageGenerationScreen } from 'pages/image-generation'
import { SettingsScreen } from 'pages/settings'
import { Icon } from 'shared/ui/Icon'

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<HomeTabsNavigatorParamList>()

export function AppRouter() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name={'home_tabs'}
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen name={'settings'} component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const HomeTabs = () => {
  const { t } = useTranslation()
  const { navigate } = useNavigation()

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="discover"
        component={DiscoverScreen}
        options={{
          title: t('components.tabBar.discovery'),
          headerRight: () => (
            <TouchableOpacity
              paddingH-20
              paddingV-10
              onPress={() => navigate('settings')}
            >
              <Icon name="sliders" size={20} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="generation"
        component={ImageGenerationScreen}
        options={{
          title: t('components.tabBar.generation'),
        }}
      />
      <Tab.Screen
        name="account"
        component={AccountScreen}
        options={{
          title: t('components.tabBar.account'),
        }}
      />
    </Tab.Navigator>
  )
}
