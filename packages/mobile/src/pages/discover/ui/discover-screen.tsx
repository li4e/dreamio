import { View } from 'react-native'
import { TextInput } from 'react-native-paper'

export function DiscoverScreen() {
  return (
    <View className="flex-1 justify-center p-4">
      <TextInput
        multiline
        mode="outlined"
        label="Outlined input"
        placeholder="Type something"
      />
    </View>
  )
}
