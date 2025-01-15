import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, View } from 'react-native'
import {
  Appbar,
  HelperText,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper'
import * as yup from 'yup'
import { GenerationEntity } from 'entities/generation'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
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
            .min(10, ({ min }) =>
              t('screens.generation.promptValidationErrors.minLength', { min })
            )
            .max(500, ({ max }) =>
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

  const { submitCount, isValid } = useFormState({ control })
  const isDisabled = curGen.state.isPending || (submitCount > 0 && !isValid)

  const modalState = mapCurGenStatusToModalState(curGen.state.status)

  const handleStartPress = (form: { prompt: string; style: string | null }) => {
    Keyboard.dismiss()
    curGen.submit(form)
  }

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
              render={({
                field: { onChange, onBlur, value },
                fieldState,
                formState,
              }) => {
                const hasError = formState.submitCount > 0 && fieldState.invalid

                return (
                  <>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text variant="titleMedium">
                        {t('screens.generation.inputLabel')}
                      </Text>
                      <RandomButton
                        onCreated={(prompt: string) => onChange(prompt)}
                      />
                    </View>

                    <View>
                      <TextInput
                        multiline
                        mode="flat"
                        className="min-h-[120] pr-5"
                        placeholder={t('screens.generation.inputPlaceholder')}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={hasError}
                      />
                      {value?.length > 0 && (
                        <IconButton
                          className="absolute top-0 right-0"
                          onPress={() => setValue('prompt', '')}
                          icon={'close'}
                          size={20}
                        />
                      )}
                    </View>

                    <View className="h-8">
                      <HelperText type="error" visible={hasError}>
                        {fieldState.error?.message}
                      </HelperText>
                    </View>
                  </>
                )
              }}
              name="prompt"
            />
          </View>
          <View className="-mx-5 flex-grow justify-center">
            <Controller
              control={control}
              name="style"
              render={({ field: { value } }) => (
                <StylesList
                  value={value}
                  onSelect={(style: string | null) => setValue('style', style)}
                />
              )}
            />
          </View>
        </ScrollView>
        <View className="absolute bottom-5 self-center bg-slate-50 rounded-full">
          <Button
            icon="creation"
            mode="contained"
            className="rounded-full"
            contentStyle="px-4 py-2"
            onPress={handleSubmit(handleStartPress)}
            disabled={isDisabled}
            loading={curGen.state.isPending}
          >
            {t('screens.generation.startButton')}
          </Button>
        </View>
        <StateModal variant={modalState} onDismiss={curGen.clear} />
      </View>
    </KeyboardAvoidingView>
  )
}

function mapCurGenStatusToModalState(
  status: CurGenStatus
): StateModalVariant | null {
  if ([CurGenStatus.IN_PROGRESS].includes(status)) {
    return StateModalVariant.Generation
  } else if ([CurGenStatus.ERROR].includes(status)) {
    return StateModalVariant.Error
  }

  return null
}

interface RandomButtonProps {
  onCreated(prompt: string): void
}

function RandomButton(props: RandomButtonProps) {
  const { onCreated } = props
  const [pending, setPending] = useState(false)
  const { t } = useTranslation()
  const { showSnackbar } = useSnackbar()

  const onPress = async () => {
    setPending(true)
    try {
      const prompt =
        'Sunset over snow-capped mountains, a calm lake reflecting the sky, and a cozy cabin with glowing windows in a meadow of colorful wildflowers. Warm, peaceful atmosphere'
      onCreated(prompt)
    } catch {
      showSnackbar(
        {
          title: t('components.snackBar.generalError.title'),
          description: t('components.snackBar.generalError.description'),
        },
        { variant: SnackBarVariant.ERROR }
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      compact
      mode="outlined"
      icon="dice-multiple"
      contentStyle="flex-row-reverse px-2"
      onPress={onPress}
      loading={pending}
      disabled={pending}
    >
      {t('screens.generation.surpriseButton')}
    </Button>
  )
}
