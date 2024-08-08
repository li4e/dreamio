import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Appbar, IconButton } from 'react-native-paper'

export function HomeNavigationBar() {
  const { navigate } = useNavigation()

  return (
    <Appbar.Header elevated>
      <Appbar.Content title={'Dreamio'} />
      <IconButton
        icon="tune-vertical-variant"
        onPress={() => {
          navigate('settings')
        }}
      />
    </Appbar.Header>
  )
}
