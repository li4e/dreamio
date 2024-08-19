import { useNavigation } from '@react-navigation/native'
import { View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { WebView } from 'react-native-webview'

export function WebViewScreen(props: RootScreenProps<'webview'>) {
  const { title, url } = props.route.params
  const { goBack } = useNavigation()
  return (
    <View className="flex-1">
      <Appbar.Header className="bg-transparent">
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={title} />
      </Appbar.Header>
      <WebView className="flex-1" source={{ uri: url }} />
    </View>
  )
}
