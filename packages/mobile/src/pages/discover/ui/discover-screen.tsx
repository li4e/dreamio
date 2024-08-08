import { View } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { ScrollView } from 'shared/ui/rn'

export function DiscoverScreen() {
  return (
    <ScrollView className="flex-1" contentContainerStyle="p-5 pb-10 flex-grow">
      <View className="flex-1 justify-center items-center">
        <TextInput
          multiline
          mode="outlined"
          label="Enter prompt"
          placeholder="Type here a detailed description of what you want to see in your artwork"
          className="w-full min-h-[200]"
        />
      </View>
      <View className="items-center">
        <Button icon="magic-staff" mode="contained">
          Make magic
        </Button>
      </View>
    </ScrollView>
  )
}
