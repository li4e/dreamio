import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect } from 'react'
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
  IconButton,
  Switch,
  useTheme,
  Divider,
  List,
} from 'react-native-paper'
import * as yup from 'yup'
import { Button } from 'shared/ui/styled'
import { useCreateGenService } from '../model/CreateGenerationService'
import { StateModalVariant, StateContent } from './StateModal'
import { StylesList } from './StylesList'
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideOutRight,
  SlideOutLeft,
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useDerivedValue,
  useAnimatedRef,
  scrollTo,
  runOnUI,
  useScrollViewOffset,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import {
  GenerationEntity,
  GenerationSettings,
  useGenDelete,
  useShowEnhanceInfoDialog,
} from 'entities/generation'

import {
  AspectedRatioView,
  AspectRatio,
  getAspectRatioFromSize,
} from 'shared/ui/AspectedRatioView'
import { KeyboardAvoidingView } from 'shared/ui/KeyboardAvoidingView'
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
import { HEADER_HEIGHT } from 'shared/constants'
import { PromptInput } from './PromptInput'
import { twMerge } from 'tailwind-merge'

export function GenerationStartScreen(props: TabsScreenProps<'generation'>) {
  const { generation: generationFromNavigation } = props.route.params || {}
  const { t } = useTranslation()
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>()
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
            .min(3, ({ min }) =>
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
      runOnUI(() => scrollTo(scrollViewRef, 0, 0, true))()
    }
  }, [generation, scrollViewRef])

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

  const scrollY = useScrollViewOffset(scrollViewRef)

  const { top } = useSafeAreaInsets()
  const topInset = modalState ? 0 : top + HEADER_HEIGHT

  const showAllSettings = !generation && !isPending && !hasError

  return (
    <KeyboardAvoidingView withBottomBar>
      <View className="flex-1" testID="GENERATION_SCREEN">
        <Animated.ScrollView
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          className="flex-1"
          scrollIndicatorInsets={{ top: topInset }}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: 20,
            flexGrow: 1,
          }}
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
                className="mb-6"
              />
            )
          )}
          {!showAllSettings && (
            <View className="flex-row justify-between pr-4 mb-2">
              <SelectedSettings
                control={control}
                className="px-5 self-end"
                disabled={isPending}
                uiStateStore={uiStateStore}
              />
              <ResetButton
                control={control}
                generation={generation}
                updateForm={updateForm}
                hidden={isPending}
              />
            </View>
          )}
          <PromptInput
            scrollViewRef={scrollViewRef}
            control={control}
            uiStateStore={uiStateStore}
            className="mx-5"
          />
          {showStartButton && (
            <StartButton
              hasGeneration={resultImage !== null}
              control={control}
              isPending={isPending}
              disabled={isPendingPromptGen}
              onPress={handleSubmit(handleStartPress)}
              className="mb-4"
            />
          )}
          {showAllSettings && (
            <>
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
            </>
          )}
        </Animated.ScrollView>
      </View>
      <Header uiStateStore={uiStateStore} scrollY={scrollY} />
      <AspectRatioSelectDialog control={control} uiStateStore={uiStateStore} />
      <StyleSelectDialog control={control} uiStateStore={uiStateStore} />
    </KeyboardAvoidingView>
  )
}

function StartButton(
  props: {
    control: FormControl
    isPending: boolean
    disabled: boolean
    hasGeneration: boolean
    onPress: () => void
  } & ViewProps
) {
  const { isPending, onPress, control, disabled, hasGeneration, ...rest } =
    props
  const { submitCount, isValid } = useFormState({ control })
  const isDisabled = isPending || (submitCount > 0 && !isValid)
  const { t } = useTranslation()

  return (
    <View className="items-center" {...rest}>
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

function EnhanceSetting(props: { control: FormControl; disabled: boolean }) {
  const { control, disabled } = props
  const { t } = useTranslation()
  const showEnhanceDialog = useShowEnhanceInfoDialog()

  const handleEnhanceInfoPress = () => {
    Keyboard.dismiss()
    showEnhanceDialog()
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
              onValueChange={(selectedValue: boolean) => {
                Keyboard.dismiss()
                onChange(selectedValue)
              }}
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

  return (
    <Controller
      control={control}
      render={({ field: { value } }) => (
        <List.Item
          onPress={() => {
            Keyboard.dismiss()
            showAspectDialog()
          }}
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
  const { showAspectDialog, showStylesDialog } = useUIActions(uiStateStore)
  const { field: styleField } = useController({ control, name: 'style' })
  const { field: enhanceField } = useController({ control, name: 'enhance' })
  const { field: aspectField } = useController({ control, name: 'aspectRatio' })

  const data = {
    style: styleField.value,
    enhance: enhanceField.value,
    ...getSizeFromAspectRatio(aspectField.value),
  }

  return (
    <GenerationSettings
      data={data}
      disabled={disabled}
      onAspectPress={showAspectDialog}
      onEnhancePress={() => enhanceField.onChange(!enhanceField.value)}
      onStylePress={showStylesDialog}
      onStyleRemovePress={() => styleField.onChange(null)}
      className="flex-1"
      {...rest}
    />
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

  const showTitle = !generation

  const headerVisible = useDerivedValue(
    () => interpolate(scrollY.value, [0, 64], [1, 0], Extrapolation.CLAMP),
    [scrollY]
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
  }, [scrollY, headerVisible, top])

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

  if (hasError || isPending) {
    return null
  }

  return (
    <Animated.View
      style={headerStyle}
      className="absolute right-0 left-0 top-0"
    >
      <BlurView intensity={100} tint={dark ? 'dark' : 'light'}>
        <Animated.View style={headerContentStyle}>
          <Appbar.Header className="bg-transparent" mode="center-aligned">
            {generation && resultImage && (
              <HeaderGenDeleteButton
                generation={generation}
                uiStateStore={uiStateStore}
              />
            )}

            <Appbar.Content
              title={showTitle && t('screens.generation.title')}
            />

            {generation && resultImage && (
              <Animated.View
                entering={SlideInUp.duration(500)}
                exiting={SlideOutUp.duration(200)}
              >
                <Appbar.Action
                  icon="share-variant"
                  onPress={() => {
                    shareImage(resultImage, generation.prompt)
                  }}
                />
              </Animated.View>
            )}

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

function HeaderGenDeleteButton(props: {
  generation: GenerationEntity
  uiStateStore: UIStateStore
}) {
  const { generation, uiStateStore } = props
  const handleDelete = useCallback(() => {
    uiStateStore.generation = null
  }, [uiStateStore])
  const handleRestore = useCallback(() => {
    if (!uiStateStore.generation && !uiStateStore.isPending) {
      uiStateStore.generation = generation
    }
  }, [generation, uiStateStore])

  const onDeletePress = useGenDelete(generation, handleDelete, handleRestore)

  return (
    <Animated.View
      entering={SlideInLeft.duration(500)}
      exiting={SlideOutLeft.duration(200)}
    >
      <Appbar.Action icon="trash-can-outline" onPress={onDeletePress} />
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
  const { image, generation, ...rest } = props
  const { colors } = useTheme()
  const imageStyles = useMemo(
    () => ({
      backgroundColor: colors.backdrop,
    }),
    [colors]
  )

  return (
    <AspectedRatioView ratio={getAspectRatioFromSize(generation)} {...rest}>
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
  generation: GenerationEntity | null
  control: FormControl
  updateForm(generation: GenerationEntity): void
  hidden: boolean
}) {
  const { control, generation, hidden, updateForm } = props
  const { aspectRatio, style, enhance, prompt } = useWatch({ control })

  const isAnyChanged =
    generation &&
    (generation.enhance !== enhance ||
      generation.prompt !== prompt ||
      generation.style !== style ||
      getAspectRatioFromSize(generation) !== aspectRatio)

  const handlePress = useCallback(() => {
    if (generation) {
      updateForm(generation)
    }
  }, [generation])

  return (
    <IconButton
      icon="backup-restore"
      size={20}
      className={twMerge('m-0 self-start', hidden && 'opacity-0')}
      disabled={!isAnyChanged}
      onPress={handlePress}
    />
  )
}
