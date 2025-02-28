import { useController } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import { View, ViewProps } from 'react-native'
import { FormControl } from '../model/FormControl'
import { UIStateStore } from '../model/UIStateStore'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { TextInput, HelperText, IconButton, useTheme } from 'react-native-paper'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import { api } from 'shared/api'
import { BOTTOM_BAR_HEIGHT } from 'shared/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface PromptInputProps extends ViewProps {
  control: FormControl
  uiStateStore: UIStateStore
}

export const PrompInput = observer(function PromptInput(
  props: PromptInputProps
) {
  const { t } = useTranslation()
  const { control, uiStateStore, ...rest } = props
  const { isPending, isPendingPromptGen } = uiStateStore
  const {
    field: { onChange, onBlur, value },
    formState,
    fieldState,
  } = useController({ control, name: 'prompt' })

  const hasInputError = formState.submitCount > 0 && fieldState.invalid

  return (
    <View {...rest}>
      <View>
        <TextInput
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
          onBlur={onBlur}
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
