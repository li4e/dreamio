import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useRef } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller, useFormState, Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, View, ScrollView as SV, ViewProps } from 'react-native'
import {
  Appbar,
  HelperText,
  IconButton,
  TextInput,
  Switch,
  useTheme,
  Chip,
  Divider,
  List,
  Dialog,
} from 'react-native-paper'
import * as yup from 'yup'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { ScrollView, Button } from 'shared/ui/styled'
import { useCreateGenService } from '../model/CreateGenerationService'
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

import { useDialog } from 'shared/ui/Dialog'
import {
  AspectedRatioView,
  AspectRatio,
  getAspectRatioFromSize,
} from 'shared/ui/AspectedRatioView'
import { KeyboardAvoidingView } from 'shared/ui/KeyboardAvoidingView'
import { FlatList } from 'react-native-gesture-handler'
import {
  UIStateStore,
  UIStateStoreContext,
  useUIActions,
  useUIStateStore,
  Status as CurGenStatus,
} from '../model/UIStateStore'
import { useStoreData } from 'shared/store'
import { CustomDialog } from 'shared/ui/CustomDialog'
import { FormControl } from '../model/FormControl'

export function GenerationStartScreen(props: TabsScreenProps<'generation'>) {
  const { generation: generationFromNavigation } = props.route.params || {}
  const { t } = useTranslation()
  const scrollView = useRef<SV>()
  const [uiStateStore] = useState(new UIStateStore())
  const createGenService = useCreateGenService(uiStateStore)
  const { generation, isPending, status, resultImage } = useStoreData(
    () => uiStateStore.state,
    [uiStateStore]
  )
  const isInputDisabled = isPending

  const modalState = mapCurGenStatusToModalState(status)
  const showStartButton = !(
    isPending && generation?.status === GenerationEntityStatus.IN_PROGRESS
  )

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
          aspectRatio: yup
            .mixed<AspectRatio>()
            .oneOf(Object.values(AspectRatio))
            .default(AspectRatio.square)
            .required(),
        })
        .required(),
    [t]
  )

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(generationSchema),
    defaultValues: {
      prompt: '',
      style: null,
      enhance: true,
      aspectRatio: AspectRatio.square,
    },
  })

  useEffect(() => {
    createGenService.fetchResultIfNeeded()
  }, [createGenService])

  useEffect(() => {
    if (generation) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      scrollView.current?.scrollTo({ y: 0, animated: true })
    }
  }, [generation, scrollView])

  const updateForm = useCallback(
    (generation: GenerationEntity) => {
      setValue('prompt', generation.prompt ?? '', { shouldValidate: true })
      setValue('style', generation.style ?? null, { shouldValidate: true })
      setValue('enhance', generation.enhance ?? true, { shouldValidate: true })
      setValue('aspectRatio', getAspectRatioFromSize(generation), {
        shouldValidate: true,
      })
    },
    [setValue]
  )

  useEffect(() => {
    if (uiStateStore.isPending && uiStateStore.generation) {
      updateForm(uiStateStore.generation)
    }
  }, [uiStateStore])

  useEffect(() => {
    if (!uiStateStore.isPending && generationFromNavigation) {
      uiStateStore.generation = generationFromNavigation
      updateForm(generationFromNavigation)
    }
  }, [uiStateStore, generationFromNavigation])

  const handleStartPress = useCallback(
    (form: {
      prompt: string
      style: string | null
      enhance: boolean
      aspectRatio: string
    }) => {
      const { aspectRatio, ...rest } = form
      Keyboard.dismiss()
      createGenService.submit({
        ...rest,
        ...getSizeFromAspectRatio(aspectRatio),
      })
    },
    [createGenService]
  )

  const onSaveImage = useOnSaveImage()

  const clear = useCallback(() => {
    setValue('prompt', '', { shouldValidate: true })
  }, [])

  const { colors } = useTheme()

  return (
    <UIStateStoreContext.Provider value={uiStateStore}>
      <KeyboardAvoidingView withBottomBar>
        <View className="flex-1" testID="GENERATION_SCREEN">
          <Appbar.Header>
            {generation && resultImage && (
              <Animated.View
                entering={SlideInLeft.duration(500)}
                exiting={SlideOutLeft.duration(200)}
              >
                <Appbar.Action
                  icon="share-variant"
                  onPress={() => {
                    shareImage(resultImage, generation.prompt)
                  }}
                />
              </Animated.View>
            )}

            <Appbar.Content title={null} />

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
            contentContainerStyle="pb-[95] flex-grow"
            keyboardShouldPersistTaps="handled"
          >
            {generation && (
              <View>
                <AspectedRatioView
                  ratio={
                    resultImage && generation
                      ? getAspectRatioFromSize(generation)
                      : AspectRatio.square
                  }
                >
                  {resultImage ? (
                    <Animated.View
                      key="image_result"
                      className="absolute top-0 left-0 right-0 bottom-0"
                    >
                      <CachedImage
                        source={resultImage}
                        className="flex-1"
                        transition={300}
                        contentFit="contain"
                        contentPosition="center"
                        style={{ backgroundColor: colors.backdrop }}
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
                </AspectedRatioView>
              </View>
            )}
            <Animated.View
              layout={LinearTransition.duration(300)}
              className="flex-grow justify-center pt-4"
            >
              <View className="justify-center">
                <View className="flex-row justify-between items-center mb-1 flex-wrap">
                  {/* <Text variant="titleMedium">
                  {t('screens.generation.inputLabel')}
                </Text> */}
                </View>

                <SelectedSettings
                  control={control}
                  className="px-5"
                  disabled={isInputDisabled}
                />

                <Controller
                  control={control}
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                    formState,
                  }) => {
                    const hasInputError =
                      formState.submitCount > 0 && fieldState.invalid

                    return (
                      <>
                        <View className="mx-5">
                          <View>
                            <TextInput
                              scrollEnabled={false}
                              disabled={isInputDisabled}
                              multiline
                              mode="flat"
                              className="min-h-[120] pr-10"
                              placeholder={t(
                                'screens.generation.inputPlaceholder'
                              )}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              value={value}
                              error={hasInputError}
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
                          </View>

                          <RandomButton
                            disabled={isInputDisabled}
                            onCreated={(prompt: string) => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                              )
                              setValue('prompt', prompt, {
                                shouldValidate: true,
                              })
                            }}
                          />
                        </View>

                        <View className="h-8">
                          <HelperText type="error" visible={hasInputError}>
                            {fieldState.error?.message}
                          </HelperText>
                        </View>
                      </>
                    )
                  }}
                  name="prompt"
                />
              </View>
              <View className="justify-center mb-5">
                <Controller
                  control={control}
                  name="style"
                  render={({ field: { value, onChange } }) => (
                    <StylesList
                      value={value}
                      disabled={isInputDisabled}
                      onSelect={onChange}
                    />
                  )}
                />
              </View>
              <EnhanceSetting control={control} disabled={isInputDisabled} />
              <Divider className="mx-5" />
              <AspectRatioSetting
                control={control}
                disabled={isInputDisabled}
              />
            </Animated.View>
          </ScrollView>
          {showStartButton && (
            <StartButton
              control={control}
              isPending={isPending}
              onPress={handleSubmit(handleStartPress)}
            />
          )}
          {/* <StateModal variant={modalState} onDismiss={curGen.clear} /> */}
        </View>
        <AspectRatioSelectorDialog control={control} />
      </KeyboardAvoidingView>
    </UIStateStoreContext.Provider>
  )
}

function StartButton(props: {
  control: FormControl
  isPending: boolean
  onPress: () => void
}) {
  const { isPending, onPress, control } = props
  const { submitCount, isValid } = useFormState({ control })
  const disabled = isPending || (submitCount > 0 && !isValid)
  const { t } = useTranslation()

  return (
    <View className="absolute bottom-5 self-center">
      <Button
        icon="creation"
        mode="contained"
        className="rounded-full"
        contentStyle="px-4 py-2"
        onPress={onPress}
        disabled={disabled}
        loading={isPending}
      >
        {t('screens.generation.startButton')}
      </Button>
    </View>
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
      className="absolute right-0 bottom-0"
      icon="dice-multiple"
      size={20}
      iconColor={colors.primary}
      onPress={onPress}
      loading={pending}
      disabled={pending || disabled}
    />
  )
}

function EnhanceSetting(props: { control: FormControl; disabled: boolean }) {
  const { control, disabled } = props
  const { t } = useTranslation()
  const { showDialog } = useDialog()

  const handleEnhanceInfoPress = () => {
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
    <Controller
      control={control}
      render={({ field: { onChange, value } }) => (
        <List.Item
          disabled={disabled}
          title={t('screens.generation.enhance.title')}
          onPress={() => onChange(!value)}
          onLongPress={handleEnhanceInfoPress}
          description={t('screens.generation.enhance.description')}
          left={(props) => <List.Icon {...props} icon="auto-fix" />}
          right={() => (
            <Switch
              value={value}
              onValueChange={onChange}
              disabled={disabled}
              className="self-center"
            />
          )}
        />
      )}
      name="enhance"
    />
  )
}

function AspectRatioSetting(props: {
  control: FormControl
  disabled: boolean
}) {
  const { control, disabled } = props
  const { t } = useTranslation()
  const { showAspectModal } = useUIActions()

  const translates = useMemo(
    () => ({
      [AspectRatio.classic]: t('screens.generation.aspectRatio.classic'),
      [AspectRatio.portrait]: t('screens.generation.aspectRatio.portrait'),
      [AspectRatio.square]: t('screens.generation.aspectRatio.square'),
      [AspectRatio.vertical]: t('screens.generation.aspectRatio.vertical'),
      [AspectRatio.widescreen]: t('screens.generation.aspectRatio.widescreen'),
    }),
    [t]
  )

  return (
    <Controller
      control={control}
      render={({ field: { value } }) => (
        <List.Item
          onPress={showAspectModal}
          disabled={disabled}
          title={t('screens.generation.aspectRatio.title')}
          description={translates[value]}
          left={(props) => <List.Icon {...props} icon="aspect-ratio" />}
          right={() => (
            <Button mode="contained-tonal" className="self-center">
              {value}
            </Button>
          )}
        />
      )}
      name="aspectRatio"
    />
  )
}

function AspectRatioSelectorDialog(props: { control: FormControl }) {
  const { control } = props
  const { t } = useTranslation()
  const uiStateStore = useUIStateStore()
  const isVisible = useStoreData(
    () => uiStateStore.aspectRatioModalOpened,
    [uiStateStore]
  )
  const { hideAspectModal } = useUIActions()

  const items = useMemo(
    () => [
      {
        value: AspectRatio.square,
        title: t('screens.generation.aspectRatio.square'),
      },
      {
        value: AspectRatio.widescreen,
        title: t('screens.generation.aspectRatio.widescreen'),
      },
      {
        value: AspectRatio.portrait,
        title: t('screens.generation.aspectRatio.portrait'),
      },
      {
        value: AspectRatio.classic,
        title: t('screens.generation.aspectRatio.classic'),
      },
      {
        value: AspectRatio.vertical,
        title: t('screens.generation.aspectRatio.vertical'),
      },
    ],
    [t]
  )

  const renderItem = ({
    item,
    index,
  }: {
    index: number
    item: { value: AspectRatio; title: string }
  }) => {
    return (
      <Controller
        control={control}
        name="aspectRatio"
        render={({ field: { value, onChange } }) => {
          const handlePress = () => {
            onChange(item.value)
            hideAspectModal()
          }
          return (
            <View>
              <List.Item
                className="pl-5"
                title={item.title}
                onPress={handlePress}
                right={() => (
                  <Button
                    mode={
                      item.value === value ? 'contained' : 'contained-tonal'
                    }
                    className="self-center"
                  >
                    {item.value}
                  </Button>
                )}
              />
              {index !== items.length - 1 && <Divider />}
            </View>
          )
        }}
      />
    )
  }

  return (
    <CustomDialog visible={isVisible} onDismiss={hideAspectModal} dismissable>
      <Dialog.Title className="text-center">
        {t('screens.generation.aspectRatio.title')}
      </Dialog.Title>
      <Dialog.ScrollArea className="px-0">
        <FlatList
          keyboardShouldPersistTaps="always"
          data={items}
          renderItem={renderItem}
        />
      </Dialog.ScrollArea>
    </CustomDialog>
  )
}

function SelectedSettings(
  props: { control: FormControl; disabled: boolean } & ViewProps
) {
  const { control, disabled, ...rest } = props
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { showAspectModal } = useUIActions()

  const inactiveStyles = useMemo(
    () => ({ backgroundColor: colors.elevation.level2 }),
    [colors]
  )

  const activeStyles = useMemo(() => {
    return undefined
    // return { backgroundColor: colors.primaryContainer }
  }, [colors])

  return (
    <View className="flex-row mb-2" {...rest}>
      <Controller
        control={control}
        render={({ field: { value } }) => (
          <Chip
            disabled={disabled}
            onPress={showAspectModal}
            style={activeStyles}
            mode="flat"
            icon="aspect-ratio"
            className="mr-2"
          >
            {value}
          </Chip>
        )}
        name="aspectRatio"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <Chip
            disabled={disabled}
            mode="flat"
            icon="auto-fix"
            className="mr-2"
            style={!value ? inactiveStyles : activeStyles}
            onPress={() => onChange(!value)}
          >
            {t(
              value
                ? 'screens.generation.settings.enhancer.on'
                : 'screens.generation.settings.enhancer.off'
            )}
          </Chip>
        )}
        name="enhance"
      />

      <Controller
        control={control}
        render={({ field: { onChange, value } }) => (
          <Chip
            disabled={disabled}
            style={!value ? inactiveStyles : activeStyles}
            icon="palette"
            onClose={value ? () => onChange(null) : undefined}
          >
            {value || t('screens.generation.settings.style.none')}
          </Chip>
        )}
        name="style"
      />
    </View>
  )
}

function getSizeFromAspectRatio(
  ratio: string,
  maxSize: number = 1280
): { width: number; height: number } {
  switch (ratio) {
    case AspectRatio.square:
      return { width: maxSize, height: maxSize }
    case AspectRatio.widescreen:
      return { width: maxSize, height: Math.round((maxSize * 9) / 16) } // 16:9
    case AspectRatio.classic:
      return { width: maxSize, height: Math.round((maxSize * 3) / 4) } // 4:3
    case AspectRatio.portrait:
      return { width: maxSize, height: Math.round((maxSize * 4) / 3) } // 3:4
    case AspectRatio.vertical:
      return { width: Math.round((maxSize * 9) / 16), height: maxSize } // 9:16
    default:
      return { width: maxSize, height: maxSize } // Default fallback
  }
}
