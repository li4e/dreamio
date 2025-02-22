import { yupResolver } from '@hookform/resolvers/yup'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useForm, Controller, useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Keyboard,
  View,
  Platform,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'
import {
  Appbar,
  HelperText,
  IconButton,
  TextInput,
  Switch,
  useTheme,
  List,
  Divider,
  Chip,
  Icon,
} from 'react-native-paper'
import * as yup from 'yup'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { Button } from 'shared/ui/styled'
import {
  useCurrentGeneration,
  Status as CurGenStatus,
} from '../model/useCurrentGeneration'
import { StateModalVariant, StateContent } from './StateModal'
import { StylesList } from './StylesList'
import { api } from 'shared/api'
import { CachedImage, shareImage, useOnSaveImage } from 'shared/ui/CachedImage'
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutRight,
  SlideOutLeft,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { GenerationEntity, GenerationEntityStatus } from 'entities/generation'
import { useDialog } from 'shared/ui/Dialog'
import {
  AspectedRatioView,
  AspectRatio,
  getAspectRatioFromSize,
} from 'shared/ui/AspectedRatioView'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { KeyboardAvoidingView } from 'shared/ui/KeyboardAvoidingView'

export function GenerationStartScreen(props: TabsScreenProps<'generation'>) {
  const { generation: generationFromNavigation } = props.route.params || {}
  const { t } = useTranslation()
  const scrollView = useRef<Animated.ScrollView>(null)

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
          aspectRatio: yup.string().default(AspectRatio.square).required(),
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
      aspectRatio: AspectRatio.square,
    },
  })

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
      aspectRatio: string
    }) => {
      const { aspectRatio, ...rest } = form
      Keyboard.dismiss()
      curGen.submit({ ...rest, ...getSizeFromAspectRatio(aspectRatio) })
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

  const { colors, dark } = useTheme()
  const insets = useSafeAreaInsets()

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

  const [settingsVisible, setSettingsVisible] = useState(false)

  return (
    <KeyboardAvoidingView withBottomBar>
      <Animated.View className="flex-1" testID="GENERATION_SCREEN">
        <Animated.ScrollView
          ref={scrollView}
          className="flex-1"
          scrollIndicatorInsets={{
            top: insets.top + 64,
          }}
          automaticallyAdjustsScrollIndicatorInsets={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: insets.top + 64,
            paddingBottom: 95,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {curGen.state.result && (
            <View className="-mx-5">
              <AspectedRatioView
                ratio={
                  resultImage && curGen.state.result
                    ? getAspectRatioFromSize(curGen.state.result)
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
                    key="generation_process"
                    className="flex-1 items-center justify-center"
                  >
                    <StateContent variant={modalState} />
                  </Animated.View>
                ) : null}
              </AspectedRatioView>
            </View>
          )}

          <Animated.View className="flex-grow justify-center">
            <Animated.View className="justify-center flex-grow">
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
                    <Animated.View>
                      <Animated.View>
                        <TextInput
                          autoFocus
                          scrollEnabled={false}
                          disabled={isInputDisabled}
                          multiline
                          mode="flat"
                          className="min-h-[120] pr-10 rounded-lg"
                          underlineStyle={{ height: 0 }}
                          placeholder={t('screens.generation.inputPlaceholder')}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          outlineStyle={{ borderWidth: 0 }}
                          error={hasError}
                        />
                        {value?.length > 0 && (
                          <IconButton
                            disabled={isInputDisabled}
                            className="absolute top-0 right-0"
                            onPress={clear}
                            icon={'close'}
                            size={24}
                          />
                        )}
                        <RandomButton
                          className="absolute right-2 bottom-2"
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
                      </Animated.View>
                      <Animated.View className="h-8 bg-red">
                        <HelperText type="error" visible={hasError}>
                          {fieldState.error?.message}
                        </HelperText>
                      </Animated.View>
                    </Animated.View>
                  )
                }}
                name="prompt"
              />

              <AdvancedSettings
                visible={settingsVisible}
                onChange={setSettingsVisible}
              >
                <Animated.View className="-mx-5 pt-5">
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <List.Item
                        title={t('screens.generation.enhance.title')}
                        onPress={() => onChange(!value)}
                        onLongPress={handleEnhanceInfoPress}
                        description={t(
                          'screens.generation.enhance.description'
                        )}
                        left={(props) => (
                          <List.Icon {...props} icon="auto-fix" />
                        )}
                        right={() => (
                          <Switch
                            value={value}
                            onValueChange={onChange}
                            disabled={isInputDisabled}
                            className="self-center"
                          />
                        )}
                      />
                    )}
                    name="enhance"
                  />

                  <Divider />
                </Animated.View>

                <Animated.View className="-mx-5">
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <AspectRatioSelector value={value} onChange={onChange} />
                    )}
                    name="aspectRatio"
                  />
                </Animated.View>

                <Animated.View
                  className="-mx-5"
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <Animated.View>
                    <Divider />
                  </Animated.View>
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
                        oneLineMode={true}
                      />
                    )}
                  />
                </Animated.View>
              </AdvancedSettings>
            </Animated.View>
          </Animated.View>
        </Animated.ScrollView>
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 100}
          tint={dark ? 'dark' : 'light'}
          className="absolute top-0 right-0 left-0"
          style={{ minHeight: insets.top }}
        >
          <Appbar.Header mode="center-aligned" className="bg-transparent">
            {curGen.state.result && resultImage && (
              <Animated.View entering={SlideInLeft} exiting={SlideOutLeft}>
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

            <Appbar.Content title="Begin Art" />

            {resultImage && (
              <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                <Appbar.Action
                  icon="download"
                  onPress={() => onSaveImage(resultImage)}
                />
              </Animated.View>
            )}
          </Appbar.Header>
        </BlurView>
        {showStartButton && (
          <Animated.View className="absolute bottom-5 self-center">
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
          </Animated.View>
        )}
        {/* <StateModal variant={modalState} onDismiss={curGen.clear} /> */}
      </Animated.View>
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
  style?: ViewStyle
  className?: string
}

function RandomButton(props: RandomButtonProps) {
  const { onCreated, disabled, ...rest } = props
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
      mode="outlined"
      icon="dice-multiple"
      size={20}
      iconColor={colors.primary}
      onPress={onPress}
      loading={pending}
      disabled={pending || disabled}
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

interface AdvancedSettingsProps extends PropsWithChildren {
  visible: boolean
  onChange: (value: boolean) => void
}

function AdvancedSettings(props: AdvancedSettingsProps) {
  const { children, visible, onChange } = props
  const { t } = useTranslation()
  return (
    <Animated.View>
      <TouchableOpacity
        className="flex-row items-center justify-center"
        onPress={() => onChange(!visible)}
      >
        <Button
          mode="text"
          icon={visible ? 'chevron-double-up' : 'chevron-double-down'}
        >
          {t('screens.generation.advancedSettings')}
        </Button>
      </TouchableOpacity>
      {visible && (
        <Animated.View entering={FadeIn.duration(250)}>
          {children}
        </Animated.View>
      )}
    </Animated.View>
  )
}

function AspectRatioSelector(props: {
  value: string
  onChange: (value: string) => void
}) {
  const { value, onChange } = props
  const [expanded, setExpanded] = React.useState(false)
  const list = [
    {
      title: '1:1 - Square',
      value: AspectRatio.square,
    },
    {
      title: '9:16 - Vertical',
      value: AspectRatio.vertical,
    },
    {
      title: '4:3 - Portrait',
      value: AspectRatio.portrait,
    },
    {
      title: '3:4 - Classic',
      value: AspectRatio.classic,
    },
    {
      title: '16:9 - Widescreen',
      value: AspectRatio.widescreen,
    },
  ]

  return (
    <>
      <List.Accordion
        title="Aspect Ratio"
        left={(props) => <List.Icon {...props} icon="aspect-ratio" />}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        right={({ isExpanded }) => (
          <View className="flex-row self-center items-center">
            <Chip className="mr-5" compact>
              {value}
            </Chip>
            <Icon
              source={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
            />
          </View>
        )}
      >
        {list.map((item) => (
          <List.Item
            key={item.value}
            title={item.title}
            onPress={() => {
              setExpanded(false)
              onChange(item.value)
            }}
          />
        ))}
      </List.Accordion>
    </>
  )
}
