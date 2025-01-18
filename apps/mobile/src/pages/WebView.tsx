import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { View } from 'react-native'
import { ActivityIndicator, Appbar } from 'react-native-paper'
import { WebView } from 'react-native-webview'

export function WebViewScreen(props: RootScreenProps<'webview'>) {
  const { title, url } = props.route.params
  const [pending, setPending] = useState(true)

  const { goBack } = useNavigation()

  return (
    <View className="flex-1">
      <Appbar.Header className="bg-transparent">
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={title} />
      </Appbar.Header>
      <View className="flex-1">
        <WebView
          onLoadEnd={() => {
            setPending(false)
          }}
          className="flex-1"
          source={{ uri: url }}
        />
        {pending && (
          <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </View>
  )
}
