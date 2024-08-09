import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, View } from 'react-native'
import { Chip, Text, TextInput } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Button } from 'shared/ui/styled'
import { StylesList } from './StylesList'

export function ImageGenerationScreen() {
  const { t } = useTranslation()
  const [style, setStyle] = useState<string | null>(null)

  const handleStylePress = useCallback(
    (newStyle: string) => {
      setStyle((currentStyle) => {
        if (currentStyle === newStyle) {
          return null
        }
        return newStyle
      })
    },
    [setStyle]
  )

  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle="px-5 pb-[95] flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-grow justify-end"
          style={{ paddingTop: insets.top + 20 }}
        >
          <View className="px-1 py-6 bg-white rounded-2xl border-gray-200 border-[1px] min-h-[210] justify-between mb-8">
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
                {t('screens.generation.surpriseButton')}
              </Button>
            </View>
          </View>
          <View className="flex-row justify-between items-center min-h-[35] mb-3">
            <Text variant="titleMedium" className="mb-1">
              {t('screens.generation.styleLabel')}
            </Text>
            {style && (
              <Chip compact onClose={() => setStyle(null)}>
                {style}
              </Chip>
            )}
          </View>
          <StylesList selectedStyle={style} onSelect={handleStylePress} />
        </View>
      </ScrollView>
      <View className="absolute left-0 bottom-0 right-0 items-center pb-5">
        <Button
          icon="creation"
          mode="contained"
          className="rounded-full"
          contentStyle="px-4 py-2"
          onPress={() => Keyboard.dismiss()}
        >
          {t('screens.generation.startButton')}
        </Button>
      </View>
    </View>
  )
}
