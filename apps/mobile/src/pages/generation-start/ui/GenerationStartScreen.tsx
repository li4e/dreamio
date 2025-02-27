import { yupResolver } from '@hookform/resolvers/yup'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useCallback, useMemo, useState } from 'react'
import {
  useForm,
  Controller,
  useFormState,
  useWatch,
  useController,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Keyboard, View, ViewProps } from 'react-native'
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
} from 'react-native-paper'
import * as yup from 'yup'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { Button } from 'shared/ui/styled'
import { useCreateGenService } from '../model/CreateGenerationService'
import { StateModalVariant, StateContent } from './StateModal'
import { StylesList } from './StylesList'
import { api } from 'shared/api'
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideOutRight,
  SlideOutLeft,
  useAnimatedScrollHandler,
  useSharedValue,
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useDerivedValue,
  clamp,
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
  useUIActions,
  Status as CurGenStatus,
  StateGenerationError,
} from '../model/UIStateStore'
import { useStoreData } from 'shared/store'
import { FormControl } from '../model/FormControl'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSelectDialog } from './StyleSelectDialog'
import { AspectRatioSelectDialog } from './AspectRatioSelectDialog'
import { BOTTOM_BAR_HEIGHT, HEADER_HEIGHT } from 'shared/constants'

const bottomOffset = 95

export function GenerationStartScreen(props: TabsScreenProps<'generation'>) {
  const { generation: generationFromNavigation } = props.route.params || {}
  const { t } = useTranslation()
  const scrollView = useRef<Animated.ScrollView | null>(null)
  const [uiStateStore] = useState(new UIStateStore())
  const createGenService = useCreateGenService(uiStateStore)
  const {
    generation,
    isPending,
    isPendingPromptGen,
    status,
    resultImage,
    hasError,
    error,
  } = useStoreData(() => uiStateStore.state, [uiStateStore])

  const modalState = mapCurGenStatusToModalState(status, error)
  const showStartButton = !isPending

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
    if (uiStateStore.generation) {
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

  const clear = useCallback(() => {
    setValue('prompt', '', { shouldValidate: true })
  }, [])

  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (e) => {
        'worklet'
        scrollY.value = e.contentOffset.y
      },
    },
    []
  )

  const { top, bottom } = useSafeAreaInsets()
  const topInset = modalState ? 0 : top + HEADER_HEIGHT

  return (
    <KeyboardAvoidingView withBottomBar>
      <View className="flex-1" testID="GENERATION_SCREEN">
        <Animated.ScrollView
          onScroll={scrollHandler}
          ref={scrollView}
          className="flex-1"
          scrollIndicatorInsets={{ top: topInset }}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: isPending ? bottom : bottomOffset,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {modalState ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              key="generation_process"
              className="items-center justify-center aspect-square"
            >
              <StateContent variant={modalState} />
            </Animated.View>
          ) : (
            generation &&
            resultImage && (
              <ResultImage
                scrollY={scrollY}
                image={resultImage}
                generation={generation}
              />
            )
          )}
          <Animated.View className="flex-grow justify-center">
            <View className="justify-center pt-6">
              {(generation || hasError || isPending) && (
                <View className="flex-row justify-between pr-4 mb-2">
                  <SelectedSettings
                    control={control}
                    className="px-5 self-end"
                    disabled={isPending}
                    uiStateStore={uiStateStore}
                  />
                  {generation && !isPending && (
                    <ResetButton
                      control={control}
                      generation={generation}
                      updateForm={updateForm}
                    />
                  )}
                </View>
              )}
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
                            disabled={isPending || isPendingPromptGen}
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
                          {value?.length > 0 && !isPending && (
                            <IconButton
                              disabled={isPendingPromptGen}
                              className="absolute top-0 right-0"
                              onPress={clear}
                              icon={'close'}
                              size={20}
                            />
                          )}
                        </View>

                        <RandomButton
                          disabled={isPending}
                          control={control}
                          uiStateStore={uiStateStore}
                          isPending={isPendingPromptGen}
                        />
                      </View>

                      <View className="h-8 px-5">
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
            <AdvancedSettings
              collapsable={generation !== null || hasError || isPending}
              disabled={isPending}
            >
              <View className="justify-center mb-5">
                <Controller
                  control={control}
                  name="style"
                  render={({ field: { value, onChange } }) => (
                    <StylesList
                      value={value}
                      disabled={isPending}
                      onSelect={onChange}
                    />
                  )}
                />
              </View>
              <EnhanceSetting control={control} disabled={isPending} />
              <Divider className="mx-5" />
              <AspectRatioSetting
                control={control}
                disabled={isPending}
                uiStateStore={uiStateStore}
              />
            </AdvancedSettings>
          </Animated.View>
        </Animated.ScrollView>
        {showStartButton && (
          <StartButton
            hasGeneration={resultImage !== null}
            control={control}
            isPending={isPending}
            disabled={isPendingPromptGen}
            onPress={handleSubmit(handleStartPress)}
          />
        )}
      </View>
      <Header uiStateStore={uiStateStore} scrollY={scrollY} />
      <AspectRatioSelectDialog control={control} uiStateStore={uiStateStore} />
      <StyleSelectDialog control={control} uiStateStore={uiStateStore} />
    </KeyboardAvoidingView>
  )
}

function StartButton(props: {
  control: FormControl
  isPending: boolean
  disabled: boolean
  hasGeneration: boolean
  onPress: () => void
}) {
  const { isPending, onPress, control, disabled, hasGeneration } = props
  const { submitCount, isValid } = useFormState({ control })
  const isDisabled = isPending || (submitCount > 0 && !isValid)
  const { t } = useTranslation()

  return (
    <View className="absolute bottom-5 self-center">
      <Button
        icon="creation"
        mode="contained"
        className="rounded-full"
        contentStyle="px-4 py-2"
        onPress={onPress}
        disabled={isDisabled || disabled}
        loading={isPending}
      >
        {t(
          hasGeneration
            ? 'screens.generation.reStartButton'
            : 'screens.generation.startButton'
        )}
      </Button>
    </View>
  )
}

function mapCurGenStatusToModalState(
  status: CurGenStatus,
  error: StateGenerationError | null
): StateModalVariant | null {
  if ([CurGenStatus.IN_PROGRESS].includes(status)) {
    return StateModalVariant.Generation
  } else if ([CurGenStatus.ERROR].includes(status)) {
    if (error === StateGenerationError.ServiceUnavailable) {
      return StateModalVariant.ErrorServiceUnavailable
    } else if (error === StateGenerationError.PromptUnsafe) {
      return StateModalVariant.ErrorUsafePrompt
    }
    return StateModalVariant.Error
  }

  return null
}

interface RandomButtonProps {
  disabled: boolean
  uiStateStore: UIStateStore
  control: FormControl
  isPending: boolean
}

function RandomButton(props: RandomButtonProps) {
  const { disabled, control, uiStateStore, isPending } = props
  const pending = isPending
  const { t } = useTranslation()
  const { showSnackbar } = useSnackbar()
  const { colors } = useTheme()
  const { field } = useController({ control, name: 'prompt' })

  const onPress = async () => {
    uiStateStore.isPendingPromptGen = true
    try {
      const prompt = await api.generatePrompt()
      field.onChange(prompt)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      showSnackbar(
        {
          title: t('components.snackBar.generalError.title'),
          description: t('components.snackBar.generalError.description'),
        },
        {
          variant: SnackBarVariant.ERROR,
          offset: BOTTOM_BAR_HEIGHT + bottomOffset,
        }
      )
    } finally {
      uiStateStore.isPendingPromptGen = false
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
          onPress={handleEnhanceInfoPress}
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
  uiStateStore: UIStateStore
}) {
  const { control, disabled, uiStateStore } = props
  const { t } = useTranslation()
  const { showAspectDialog } = useUIActions(uiStateStore)

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
          onPress={showAspectDialog}
          disabled={disabled}
          title={t('screens.generation.aspectRatio.title')}
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

function SelectedSettings(
  props: {
    control: FormControl
    disabled: boolean
    uiStateStore: UIStateStore
  } & ViewProps
) {
  const { control, disabled, uiStateStore, ...rest } = props
  const { t } = useTranslation()
  const { colors } = useTheme()
  const { showAspectDialog, showStylesDialog } = useUIActions(uiStateStore)

  const inactiveStyles = useMemo(
    () => ({ backgroundColor: colors.elevation.level2 }),
    [colors]
  )

  const activeStyles = useMemo(() => {
    return undefined
    // return { backgroundColor: colors.primaryContainer }
  }, [colors])

  return (
    <View className="flex-row flex-wrap flex-1" {...rest}>
      <Controller
        control={control}
        render={({ field: { value } }) => (
          <Chip
            disabled={disabled}
            onPress={showAspectDialog}
            style={activeStyles}
            mode="flat"
            icon="aspect-ratio"
            className="mr-1 mb-1"
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
            className="mr-1 mb-1"
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
            className="mb-1 mr-1"
            disabled={disabled}
            onPress={showStylesDialog}
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

interface AdvancedSettingsProps extends PropsWithChildren {
  collapsable: boolean
  disabled: boolean
}

function AdvancedSettings(props: AdvancedSettingsProps) {
  const { collapsable, disabled } = props
  const [visible, setVisible] = useState(true)
  const { children } = props
  const { t } = useTranslation()

  useEffect(() => {
    if (collapsable || disabled) {
      setVisible(false)
    }
  }, [collapsable, disabled])

  return (
    <Animated.View>
      {collapsable && !disabled && (
        <Button
          className="self-center"
          onPress={() => setVisible(!visible)}
          disabled={disabled}
          mode="text"
          icon={visible ? 'chevron-double-up' : 'chevron-double-down'}
        >
          {t('screens.generation.allSettings')}
        </Button>
      )}

      {visible && children}
    </Animated.View>
  )
}

function Header(props: {
  uiStateStore: UIStateStore
  scrollY: SharedValue<number>
}) {
  const { uiStateStore, scrollY } = props
  const { generation, resultImage, hasError, isPending } = useStoreData(
    () => ({
      hasError: uiStateStore.hasError,
      generation: uiStateStore.generation,
      resultImage: uiStateStore.resultImage,
      isPending: uiStateStore.isPending,
    }),
    [uiStateStore]
  )

  const onSaveImage = useOnSaveImage()
  const { t } = useTranslation()
  const { top } = useSafeAreaInsets()
  const { dark } = useTheme()

  const hasGeneration = useSharedValue(Boolean(generation))
  const hasImage = useSharedValue(Boolean(resultImage))
  const showTitle = !generation && !hasError && !isPending

  useEffect(() => {
    hasGeneration.value = Boolean(generation)
    hasImage.value = Boolean(resultImage)
  }, [generation, resultImage])

  const headerVisible = useDerivedValue(
    () =>
      hasGeneration.value && !hasImage.value
        ? 0
        : interpolate(scrollY.value, [0, 64], [1, 0], Extrapolation.CLAMP),
    [scrollY, hasGeneration]
  )

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            headerVisible.value,
            [0, 1],
            [-HEADER_HEIGHT, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    }
  }, [scrollY, headerVisible, top, hasImage])

  const headerContentStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        headerVisible.value,
        [0.5, 1],
        [0, 1],
        Extrapolation.CLAMP
      ),
    }),
    []
  )

  return (
    <Animated.View
      style={headerStyle}
      className="absolute right-0 left-0 top-0"
    >
      <BlurView intensity={100} tint={dark ? 'dark' : 'light'}>
        <Animated.View style={headerContentStyle}>
          <Appbar.Header className="bg-transparent" mode="center-aligned">
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

            <Appbar.Content
              title={showTitle && t('screens.generation.title')}
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
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

function ResultImage(
  props: {
    image: string
    generation: GenerationEntity
    scrollY: SharedValue<number>
  } & ViewProps
) {
  const { image, generation } = props
  const { colors } = useTheme()
  const imageStyles = useMemo(
    () => ({
      backgroundColor: colors.backdrop,
    }),
    [colors]
  )

  return (
    <AspectedRatioView ratio={getAspectRatioFromSize(generation)}>
      <CachedImage
        source={image}
        className="flex-1"
        transition={300}
        contentFit="contain"
        contentPosition="center"
        style={imageStyles}
      />
    </AspectedRatioView>
  )
}

function ResetButton(props: {
  generation: GenerationEntity
  control: FormControl
  updateForm(generation: GenerationEntity): void
}) {
  const { control, generation, updateForm } = props
  const { aspectRatio, style, enhance, prompt } = useWatch({ control })

  const isAnyChanged =
    generation.enhance !== enhance ||
    generation.prompt !== prompt ||
    generation.style !== style ||
    getAspectRatioFromSize(generation) !== aspectRatio

  const handlePress = useCallback(() => {
    updateForm(generation)
  }, [generation])

  return (
    <IconButton
      icon="backup-restore"
      size={20}
      className="m-0 self-start"
      disabled={!isAnyChanged}
      onPress={handlePress}
    />
  )
}
