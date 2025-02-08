import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useRef } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Keyboard,
  KeyboardAvoidingView,
  View,
  ScrollView as SV,
} from 'react-native'
import {
  Appbar,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper'
import * as yup from 'yup'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { ScrollView, Button } from 'shared/ui/styled'
import {
  useCurrentGeneration,
  Status as CurGenStatus,
} from '../model/useCurrentGeneration'
import { StateModalVariant, StateContent } from './StateModal'
import { StylesList } from './StylesList'
import { api } from 'shared/api'
import { CachedImage, saveImage, shareImage } from 'shared/ui/CachedImage'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  SlideOutRight,
  SlideOutLeft,
} from 'react-native-reanimated'

export function GenerationStartScreen() {
  const { t } = useTranslation()
  const scrollView = useRef<SV>()

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

  const curGen = useCurrentGeneration()
  const resultImage = curGen.state.result?.images[0] ?? null

  useEffect(() => {
    scrollView.current?.scrollTo({ y: 0, animated: true })
  }, [resultImage, scrollView])

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
    },
  })

  useEffect(() => {
    if (curGen.state.isPending && curGen.state.result) {
      setValue('prompt', curGen.state.result.prompt)
      setValue('style', curGen.state.result.style)
    }
  }, [curGen, setValue])

  const { submitCount, isValid } = useFormState({ control })
  const isInputDisabled = curGen.state.isPending
  const isStartButtonDisabled =
    curGen.state.isPending || (submitCount > 0 && !isValid)

  const modalState = mapCurGenStatusToModalState(curGen.state.status)

  const handleStartPress = useCallback(
    (form: { prompt: string; style: string | null }) => {
      Keyboard.dismiss()
      curGen.submit(form)
    },
    [curGen]
  )

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <View className="flex-1" testID="GENERATION_SCREEN">
        <Appbar.Header>
          {resultImage && (
            <Animated.View
              entering={SlideInLeft.duration(500)}
              exiting={SlideOutLeft.duration(200)}
            >
              <Appbar.Action
                icon="share-variant"
                onPress={() => shareImage(resultImage)}
              />
            </Animated.View>
          )}

          <Appbar.Content
            title={
              !isInputDisabled
                ? t(
                    resultImage
                      ? 'screens.generationResult.title'
                      : 'screens.generation.title'
                  )
                : null
            }
          />

          {resultImage && (
            <Animated.View
              entering={SlideInRight.duration(500)}
              exiting={SlideOutRight.duration(200)}
            >
              <Appbar.Action
                icon="download"
                onPress={() => saveImage(resultImage)}
              />
            </Animated.View>
          )}
        </Appbar.Header>
        <ScrollView
          ref={scrollView}
          className="flex-1"
          contentContainerStyle="px-5 pb-[95] flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {curGen.state.result && (
            <View className="-mx-5">
              <View className="w-full aspect-square">
                {resultImage ? (
                  <Animated.View
                    key="image_result"
                    entering={FadeIn.duration(500)}
                    exiting={FadeOut.duration(200)}
                    className="absolute top-0 left-0 right-0 bottom-0"
                  >
                    <CachedImage
                      source={{ uri: resultImage }}
                      className="flex-1"
                    />
                  </Animated.View>
                ) : modalState ? (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    key="generation_process"
                    className="flex-1 items-center justify-center"
                  >
                    <StateContent variant={modalState} />
                  </Animated.View>
                ) : null}
              </View>
            </View>
          )}
          <Animated.View layout={LinearTransition.duration(300)}>
            <View className="justify-center pt-4">
              <Controller
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState,
                  formState,
                }) => {
                  const hasError =
                    formState.submitCount > 0 && fieldState.invalid

                  return (
                    <>
                      <View className="flex-row justify-between items-center mb-3">
                        <Text variant="titleMedium">
                          {t('screens.generation.inputLabel')}
                        </Text>
                        <RandomButton
                          disabled={isInputDisabled}
                          onCreated={(prompt: string) => onChange(prompt)}
                        />
                      </View>

                      <View>
                        <TextInput
                          disabled={isInputDisabled}
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
                            disabled={isInputDisabled}
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
                    disabled={isInputDisabled}
                    value={value}
                    onSelect={(style: string | null) =>
                      setValue('style', style)
                    }
                  />
                )}
              />
            </View>
          </Animated.View>
        </ScrollView>
        <View className="absolute bottom-5 self-center">
          <Button
            icon="creation"
            mode="contained"
            className="rounded-full"
            contentStyle="px-4 py-2"
            onPress={handleSubmit(handleStartPress)}
            disabled={isStartButtonDisabled}
            loading={curGen.state.isPending}
          >
            {t('screens.generation.startButton')}
          </Button>
        </View>
        {/* <StateModal variant={modalState} onDismiss={curGen.clear} /> */}
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
  disabled: boolean
}

function RandomButton(props: RandomButtonProps) {
  const { onCreated, disabled } = props
  const [pending, setPending] = useState(false)
  const { t } = useTranslation()
  const { showSnackbar } = useSnackbar()

  const onPress = async () => {
    setPending(true)
    try {
      let prompt =
        'Sunset over snow-capped mountains, a calm lake reflecting the sky, and a cozy cabin with glowing windows in a meadow of colorful wildflowers. Warm, peaceful atmosphere'
      try {
        prompt = await api.generatePrompt()
      } catch {}
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
      disabled={pending || disabled}
    >
      {t('screens.generation.surpriseButton')}
    </Button>
  )
}
