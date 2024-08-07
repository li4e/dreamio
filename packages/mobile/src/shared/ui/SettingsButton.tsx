import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-ui-lib'
import { Icon } from './Icon'

export function SettingsButton() {
  const { navigate } = useNavigation()

  return (
    <TouchableOpacity onPress={() => navigate('settings')}>
      <Icon name="sliders" size={20} />
    </TouchableOpacity>
  )
}
