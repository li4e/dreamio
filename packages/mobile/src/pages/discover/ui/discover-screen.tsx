import { View, StyleSheet } from 'react-native'
import { TextInput } from 'react-native-paper'

export function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <TextInput
        multiline
        mode="outlined"
        label="Outlined input"
        placeholder="Type something"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
})
