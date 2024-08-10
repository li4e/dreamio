import { yupResolver } from '@hookform/resolvers/yup'
import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, View } from 'react-native'
import { HelperText, Text, TextInput, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { twMerge } from 'tailwind-merge'
import * as yup from 'yup'
import { ScrollView, Button } from 'shared/ui/styled'
import { StateModal, StateModalVariant } from './StateModal'
import { StylesList } from './StylesList'

export function ImageGenerationScreen() {
  const { t } = useTranslation()
  const [modalState, setModalState] = useState<StateModalVariant | null>(null)
  const [pending, setPending] = useState(false)

  const generationSchema = useMemo(
    () =>
      yup
        .object({
          prompt: yup
            .string()
            .min(3, ({ min }) =>
              t('screens.generation.promptValidationErrors.minLength', { min })
            )
            .max(300, ({ max }) =>
              t('screens.generation.promptValidationErrors.maxLength', { max })
            )
            .required(t('screens.generation.promptValidationErrors.required')),
          style: yup.string().max(100).nullable().default(null),
        })
        .required(),
    [t]
  )

  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
    },
  })

  const insets = useSafeAreaInsets()

  const handleStartPress = (form: { prompt: string; style: string | null }) => {
    setPending(true)
    Keyboard.dismiss()
    setTimeout(() => {
      setPending(false)
      reset()
      setModalState(StateModalVariant.Generation)
      setTimeout(() => {
        setModalState(StateModalVariant.Premium)
      }, 2000)
    }, 500)
  }

  const { colors } = useTheme()

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
            render={({ field: { onChange, onBlur, value }, formState }) => {
              const hasError = formState.submitCount > 0 && !formState.isValid

              return (
                <>
                  <View
                    className={twMerge(
                      'px-1 py-6 bg-white rounded-2xl border-gray-200 border-[1px] min-h-[210] justify-between',
                      hasError && 'border-red-700'
                    )}
                  >
                    <View>
                      <Text variant="titleLarge" className="mx-4">
                        {t('screens.generation.inputLabel')}
                      </Text>
                      <TextInput
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        multiline
                        placeholder={t('screens.generation.inputPlaceholder')}
                        placeholderTextColor={colors.backdrop}
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
                  <View className="h-8">
                    <HelperText type="error" visible={hasError}>
                      {formState.errors.prompt?.message}
                    </HelperText>
                  </View>
                </>
              )
            }}
            name="prompt"
          />
          <StylesList
            onSelect={(style: string | null) => setValue('style', style)}
          />
        </View>
      </ScrollView>
      <View className="absolute left-0 bottom-0 right-0 items-center pb-5">
        <Controller
          control={control}
          name="prompt"
          render={({ formState }) => (
            <Button
              icon="creation"
              mode="contained"
              className="rounded-full"
              contentStyle="px-4 py-2"
              onPress={handleSubmit(handleStartPress)}
              disabled={
                pending || (formState.submitCount > 0 && !formState.isValid)
              }
              loading={pending}
            >
              {t('screens.generation.startButton')}
            </Button>
          )}
        />
      </View>
      <StateModal variant={modalState} onDismiss={() => setModalState(null)} />
    </View>
  )
}
