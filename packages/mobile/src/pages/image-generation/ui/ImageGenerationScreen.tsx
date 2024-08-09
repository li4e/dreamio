import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, View } from 'react-native'
import { Text, TextInput } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as yup from 'yup'
import { ScrollView, Button } from 'shared/ui/styled'
import { StylesList } from './StylesList'

export const generationSchema = yup
  .object({
    prompt: yup.string().min(3).max(300).required(),
    style: yup.string().max(100).nullable(),
  })
  .required()

export function ImageGenerationScreen() {
  const { t } = useTranslation()
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
    },
  })

  const insets = useSafeAreaInsets()

  const handleStartPress = ({ prompt }: { prompt: string }) => {
    Keyboard.dismiss()
  }

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
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
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
            )}
            name="prompt"
          />
          <StylesList
            onSelect={(style: string | null) => setValue('style', style)}
          />
        </View>
      </ScrollView>
      <View className="absolute left-0 bottom-0 right-0 items-center pb-5">
        <Button
          icon="creation"
          mode="contained"
          className="rounded-full"
          contentStyle="px-4 py-2"
          onPress={handleSubmit(handleStartPress)}
        >
          {t('screens.generation.startButton')}
        </Button>
      </View>
    </View>
  )
}
