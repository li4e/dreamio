import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import { useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, View } from 'react-native'
import {
  Appbar,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper'
import * as yup from 'yup'
import { GenerationEntity } from 'entities/generation'
import { ScrollView, Button } from 'shared/ui/styled'
import {
  useCurrentGeneration,
  Status as CurGenStatus,
} from '../model/useCurrentGeneration'
import { StateModal, StateModalVariant } from './StateModal'
import { StylesList } from './StylesList'

export function GenerationStartScreen() {
  const { t } = useTranslation()
  const { navigate } = useNavigation()

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

  const {
    control,
    handleSubmit,
    setValue,
    reset: resetForm,
  } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
    },
  })

  const handleFinish = useCallback(
    (generation: GenerationEntity) => {
      resetForm()
      navigate('generation_result', { generation })
    },
    [navigate, resetForm]
  )

  const curGen = useCurrentGeneration(handleFinish)

  const modalState = mapCurGenStatusToModalState(curGen.state.status)

  const handleStartPress = (form: { prompt: string; style: string | null }) => {
    Keyboard.dismiss()
    curGen.submit(form)
  }

  const { colors } = useTheme()

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <View className="flex-1">
        <Appbar.Header>
          <Appbar.Content title={t('screens.generation.title')} />
        </Appbar.Header>
        <ScrollView
          className="flex-1"
          contentContainerStyle="px-5 pb-[95] flex-grow pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="justify-center">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value }, formState }) => {
                const hasError = formState.submitCount > 0 && !formState.isValid

                return (
                  <>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text variant="titleMedium">
                        {t('screens.generation.inputLabel')}
                      </Text>
                      <Button
                        compact
                        mode="outlined"
                        icon="dice-multiple"
                        contentStyle="flex-row-reverse px-2"
                      >
                        {t('screens.generation.surpriseButton')}
                      </Button>
                    </View>

                    <TextInput
                      multiline
                      mode="flat"
                      className="min-h-[120]"
                      placeholder={t('screens.generation.inputPlaceholder')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={hasError}
                      style={{
                        backgroundColor: hasError
                          ? colors.errorContainer
                          : colors.secondaryContainer,
                      }}
                    />

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
          </View>
          <View className="-mx-5 flex-grow justify-center">
            <StylesList
              onSelect={(style: string | null) => setValue('style', style)}
            />
          </View>
        </ScrollView>
        <View className="absolute bottom-5 self-center bg-slate-50 rounded-full">
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
                  curGen.state.isPending ||
                  (formState.submitCount > 0 && !formState.isValid)
                }
                loading={curGen.state.isPending}
              >
                {t('screens.generation.startButton')}
              </Button>
            )}
          />
        </View>
        <StateModal variant={modalState} onDismiss={curGen.clear} />
      </View>
    </KeyboardAvoidingView>
  )
}

function mapCurGenStatusToModalState(
  status: CurGenStatus
): StateModalVariant | null {
  if ([CurGenStatus.PREMIUM].includes(status)) {
    return StateModalVariant.Premium
  } else if ([CurGenStatus.TOP_UP].includes(status)) {
    return StateModalVariant.TopUp
  } else if (
    [CurGenStatus.IN_PROGRESS, CurGenStatus.READY_TO_RESUBMIT].includes(status)
  ) {
    return StateModalVariant.Generation
  } else if ([CurGenStatus.ERROR].includes(status)) {
    return StateModalVariant.Error
  }

  return null
}
