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
  Platform,
  TouchableOpacity,
} from 'react-native'
import {
  Appbar,
  HelperText,
  IconButton,
  Text,
  TextInput,
  Switch,
  useTheme,
  Portal,
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
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  SlideOutRight,
  SlideOutLeft,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { GenerationEntity, GenerationEntityStatus } from 'entities/generation'
import { twMerge } from 'tailwind-merge'
import { useDialog } from 'shared/ui/Dialog'

export function GenerationStartScreen(props: TabsScreenProps<'generation'>) {
  const { generation: generationFromNavigation } = props.route.params || {}
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
          enhance: yup.boolean().default(true).required(),
          width: yup.number().default(1280).required(),
          height: yup.number().default(1280).required(),
        })
        .required(),
    [t]
  )

  const curGen = useCurrentGeneration()
  const resultImage = curGen.state.result?.images[0] ?? null
  const prevResultImage = useRef<string | null>(resultImage)

  useEffect(() => {
    if (resultImage && prevResultImage.current !== resultImage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    prevResultImage.current = resultImage
    scrollView.current?.scrollTo({ y: 0, animated: true })
  }, [resultImage, scrollView, prevResultImage])

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
      enhance: true,
      width: 1280,
      height: 1280,
    },
  })

  const updateForm = useCallback(
    (generation: GenerationEntity) => {
      setValue('prompt', generation.prompt ?? '', { shouldValidate: true })
      setValue('style', generation.style ?? null, { shouldValidate: true })
      setValue('enhance', generation.enhance ?? true, { shouldValidate: true })
      setValue('width', generation.width ?? 1280, { shouldValidate: true })
      setValue('height', generation.height ?? 1280, { shouldValidate: true })
    },
    [setValue]
  )

  useEffect(() => {
    if (curGen.state.isPending && curGen.state.result) {
      updateForm(curGen.state.result)
    }
  }, [])

  useEffect(() => {
    if (generationFromNavigation) {
      curGen.setGeneration(generationFromNavigation)
      updateForm(generationFromNavigation)
    }
  }, [generationFromNavigation])

  const { submitCount, isValid } = useFormState({ control })
  const isInputDisabled = curGen.state.isPending
  const isStartButtonDisabled =
    curGen.state.isPending || (submitCount > 0 && !isValid)

  const modalState = mapCurGenStatusToModalState(curGen.state.status)

  const handleStartPress = useCallback(
    (form: {
      prompt: string
      style: string | null
      enhance: boolean
      width: number
      height: number
    }) => {
      Keyboard.dismiss()
      curGen.submit(form)
    },
    [curGen]
  )

  const onSaveImage = useOnSaveImage()

  const showStartButton = !(
    curGen.state.isPending &&
    curGen.state.result?.status === GenerationEntityStatus.IN_PROGRESS
  )

  const clear = useCallback(() => {
    setValue('prompt', '', { shouldValidate: true })
  }, [])

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1"
      enabled={Platform.OS === 'ios'}
    >
      <View className="flex-1" testID="GENERATION_SCREEN">
        <Appbar.Header>
          {curGen.state.result && resultImage && (
            <Animated.View
              entering={SlideInLeft.duration(500)}
              exiting={SlideOutLeft.duration(200)}
            >
              <Appbar.Action
                icon="share-variant"
                onPress={() => {
                  if (curGen.state.result) {
                    shareImage(resultImage, curGen.state.result?.prompt)
                  }
                }}
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
                onPress={() => onSaveImage(resultImage)}
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
                    className="absolute top-0 left-0 right-0 bottom-0"
                  >
                    <CachedImage
                      source={resultImage}
                      className="flex-1"
                      transition={300}
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
              <View className="flex-row justify-between items-center mb-3">
                <Text variant="titleMedium">
                  {t('screens.generation.inputLabel')}
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row justify-between items-center">
                      <EnhanceTitle />
                      <Switch
                        value={value}
                        onValueChange={(newValue) => {
                          onChange(newValue)
                        }}
                      />
                    </View>
                  )}
                  name="enhance"
                />
              </View>

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
                      <View>
                        <TextInput
                          scrollEnabled={false}
                          disabled={isInputDisabled}
                          multiline
                          mode="flat"
                          className="min-h-[120] pr-10"
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
                            onPress={clear}
                            icon={'close'}
                            size={20}
                          />
                        )}

                        <RandomButton
                          disabled={isInputDisabled}
                          onCreated={(prompt: string) => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            )
                            setValue('prompt', prompt, { shouldValidate: true })
                          }}
                        />
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
                      setValue('style', style, { shouldValidate: true })
                    }
                  />
                )}
              />
            </View>
          </Animated.View>
        </ScrollView>
        {showStartButton && (
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
        )}
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
  const { colors } = useTheme()

  const onPress = async () => {
    setPending(true)
    try {
      let prompt =
        'Sunset over snow-capped mountains, a calm lake reflecting the sky, and a cozy cabin with glowing windows in a meadow of colorful wildflowers. Warm, peaceful atmosphere'
      try {
        prompt = await api.generatePrompt()
      } catch {}
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
    <IconButton
      className="absolute right-2 bottom-2"
      mode="outlined"
      icon="dice-multiple"
      size={20}
      iconColor={colors.primary}
      onPress={onPress}
      loading={pending}
      disabled={pending || disabled}
    />
  )
}

function EnhanceTitle() {
  const { t } = useTranslation()
  const { showDialog } = useDialog()
  const handlePress = () => {
    showDialog({
      title: t('screens.generation.enhance.dialog.title'),
      content: t('screens.generation.enhance.dialog.description'),
      renderActions: (dismiss) => (
        <Button onPress={dismiss}>
          {t('screens.generation.enhance.dialog.button')}
        </Button>
      ),
    })
  }

  return (
    <>
      <TouchableOpacity className="flex-row items-center" onPress={handlePress}>
        <IconButton className="-mx-[6]" icon="alert-circle-outline" size={16} />

        <Text
          variant="labelMedium"
          className={twMerge(Platform.OS === 'ios' && 'mr-3')}
        >
          {t('screens.generation.enhance.title')}
        </Text>
      </TouchableOpacity>
    </>
  )
}
