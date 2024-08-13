import { Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import { firebaseAuth } from 'shared/lib/firebase'

export function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Settings screen</Text>
      <Button
        mode="contained"
        onPress={() => {
          firebaseAuth.signOut()
        }}
      >
        SignOut
      </Button>
    </View>
  )
}
