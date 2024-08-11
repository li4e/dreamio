import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { View, Image } from 'react-native'
import { Appbar } from 'react-native-paper'
import { ScrollView } from 'shared/ui/styled'

export function GenerationResultScreen() {
  const uri = 'https://i.ibb.co/zVS6L0B/Img.png'
  const { goBack } = useNavigation()
  const { t } = useTranslation()

  return (
    <View className="flex-1">
      <Appbar.Header>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={t('screens.generationResult.title')} />
      </Appbar.Header>
      <ScrollView className="flex-1" contentContainerStyle="p-4">
        <Image source={{ uri }} className="w-full aspect-square rounded-2xl" />
      </ScrollView>
    </View>
  )
}
