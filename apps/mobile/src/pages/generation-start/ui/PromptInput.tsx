import { useController } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import {
  View,
  ViewProps,
  LayoutChangeEvent,
  useWindowDimensions,
  Platform,
} from 'react-native'
import { FormControl } from '../model/FormControl'
import { UIStateStore } from '../model/UIStateStore'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { HelperText, IconButton, useTheme, TextInput } from 'react-native-paper'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { api } from 'shared/api'
import { BOTTOM_BAR_HEIGHT } from 'shared/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RefObject, useCallback, useRef } from 'react'
import Animated, {
  AnimatedRef,
  runOnUI,
  scrollTo,
  useScrollViewOffset,
  useSharedValue,
} from 'react-native-reanimated'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'

interface PromptInputProps extends ViewProps {
  control: FormControl
  uiStateStore: UIStateStore
  scrollViewRef: AnimatedRef<Animated.ScrollView>
}

export const PromptInput = observer(function PromptInput(
  props: PromptInputProps
) {
  const { t } = useTranslation()
  const { control, uiStateStore, scrollViewRef, ...rest } = props
  const { isPending, isPendingPromptGen } = uiStateStore
  const {
    field: { onChange, onBlur, value },
    formState,
    fieldState,
  } = useController({ control, name: 'prompt' })
  const textInputWrapperRef = useRef<View>(null)
  const hasInputError = formState.submitCount > 0 && fieldState.invalid

  const inputHandlers = useInputScrollBehaviour(
    scrollViewRef,
    textInputWrapperRef
  )

  const handleBlur = useCallback(() => {
    onBlur()
    inputHandlers.onBlur()
  }, [onBlur, inputHandlers])

  return (
    <View {...rest}>
      <View ref={textInputWrapperRef}>
        <TextInput
          onFocus={inputHandlers.onFocus}
          scrollEnabled={false}
          disabled={isPending || isPendingPromptGen}
          multiline
          mode="flat"
          className="min-h-[120] pr-10"
          placeholder={t(
            isPendingPromptGen
              ? 'screens.generation.inputPromptGeneration'
              : 'screens.generation.inputPlaceholder'
          )}
          onBlur={handleBlur}
          onLayout={inputHandlers.onLayout}
          onChangeText={onChange}
          value={value}
          error={hasInputError}
        />
        {value?.length > 0 && !isPending && (
          <IconButton
            disabled={isPendingPromptGen}
            className="absolute top-0 right-0"
            onPress={() => onChange('')}
            icon={'close'}
            size={20}
          />
        )}
        <RandomButton
          disabled={isPending}
          uiStateStore={uiStateStore}
          isPending={isPendingPromptGen}
          onChange={onChange}
        />
      </View>

      <View className="h-8">
        <HelperText type="error" visible={hasInputError}>
          {fieldState.error?.message}
        </HelperText>
      </View>
    </View>
  )
})

interface RandomButtonProps {
  disabled: boolean
  uiStateStore: UIStateStore
  isPending: boolean
  onChange(prompt: string): void
}

function RandomButton(props: RandomButtonProps) {
  const { disabled, uiStateStore, isPending, onChange } = props
  const pending = isPending
  const { t } = useTranslation()
  const { showSnackbar } = useSnackbar()
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()

  const onPress = async () => {
    uiStateStore.isPendingPromptGen = true
    try {
      const prompt = await api.generatePrompt()
      onChange(prompt)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      showSnackbar(
        {
          title: t('components.snackBar.generalError.title'),
          description: t('components.snackBar.generalError.description'),
        },
        {
          variant: SnackBarVariant.ERROR,
          offset: BOTTOM_BAR_HEIGHT + bottom,
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

function useInputScrollBehaviour(
  scrollViewRef: AnimatedRef<Animated.ScrollView>,
  textInputWrapperRef: RefObject<View>
): {
  onFocus: () => void
  onBlur: () => void
  onLayout: (event: LayoutChangeEvent) => void
} {
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
  const { height: screenHeight } = useWindowDimensions()
  const scrollOffset = useScrollViewOffset(scrollViewRef)
  const isFocused = useSharedValue(false)

  const { top } = useSafeAreaInsets()

  const scrollToFitKeyboard = useCallback(
    (withDelay: boolean) => {
      function run() {
        textInputWrapperRef.current?.measure(
          (x, y, width, height, pageX, pageY) => {
            const viewHeight = screenHeight - Math.abs(keyboardHeight.value)
            scrollOffset.value + pageY
            const offset = 32 + 55
            const scrollY = Math.max(
              scrollOffset.value +
                pageY -
                viewHeight +
                height +
                offset +
                (Platform.OS === 'android' ? top : 0),
              0
            )
            runOnUI(() => scrollTo(scrollViewRef, 0, scrollY, true))()
          }
        )
      }
      if (withDelay) {
        setTimeout(run, 600)
      } else {
        run()
      }
    },
    [
      keyboardHeight,
      screenHeight,
      scrollViewRef,
      textInputWrapperRef,
      scrollOffset,
      top,
    ]
  )

  const onFocus = useCallback(async () => {
    isFocused.value = true
    scrollToFitKeyboard(true)
  }, [scrollToFitKeyboard, isFocused])

  const onBlur = useCallback(async () => {
    isFocused.value = false
  }, [isFocused])

  const onLayout = useCallback(() => {
    if (isFocused.value) {
      scrollToFitKeyboard(false)
    }
  }, [scrollToFitKeyboard, isFocused])

  return { onFocus, onLayout, onBlur }
}
