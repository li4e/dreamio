import { View, Text, Button } from 'react-native-ui-lib'
import { Icon } from '../../shared/ui/Icon'

export function DiscoverScreen() {
  return (
    <View flex>
      <View flex center>
        <Text>DiscoverScreen</Text>
      </View>
      <View padding-16>
        <Button>
          <View row centerV>
            <Text white marginR-10>
              <Icon name="magic-wand" size={16} />
            </Text>
            <Text white>Generate</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}
