import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { ScrollView, Button } from 'shared/ui/styled'
import { StylesList } from './StylesList'

export function ImageGenerationScreen() {
  const { t } = useTranslation()
  return (
    <ScrollView className="flex-1" contentContainerStyle="p-5 pb-10 flex-grow">
      <View className="flex-1 justify-center">
        <View>
          <View className="px-1 py-6 bg-white rounded-2xl border-gray-200 border-[1px] min-h-[210] justify-between mb-5">
            <View>
              <Text variant="titleLarge" className="mx-4">
                {t('screens.generation.inputLabel')}
              </Text>
              <TextInput
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                multiline
                placeholder={t('screens.generation.inputPlaceholder')}
                className="bg-transparent px-0"
              />
            </View>
            <View className="items-end px-4">
              <Button
                compact
                mode="outlined"
                icon="dice-multiple"
                contentStyle="flex-row-reverse px-1"
              >
                {t('screens.generation.randomButton')}
              </Button>
            </View>
          </View>
          <Text variant="titleMedium" className="mb-1">
            {t('screens.generation.styleLabel')}
          </Text>
          <StylesList />
        </View>
      </View>
      <View className="items-center">
        <Button
          icon="creation"
          mode="contained"
          className="rounded-full"
          contentStyle="px-4 py-2"
        >
          {t('screens.generation.startButton')}
        </Button>
      </View>
    </ScrollView>
  )
}
