import { Keyboard, View, ViewProps } from 'react-native'
import { GenerationEntity } from '../model/GenerationEntity'
import { useTranslation } from 'react-i18next'
import { Chip, useTheme } from 'react-native-paper'
import { useMemo } from 'react'
import { getAspectRatioFromSize } from 'shared/ui/AspectedRatioView'

export interface GenerationSettings extends ViewProps {
  data: {
    style: GenerationEntity['style']
    width: GenerationEntity['width']
    height: GenerationEntity['height']
    enhance: GenerationEntity['enhance']
  }
  onAspectPress?(): void
  onStylePress?(): void
  onStyleRemovePress?(): void
  onEnhancePress?(): void
  disabled?: boolean
}

export function GenerationSettings(props: GenerationSettings) {
  const {
    data,
    onAspectPress,
    onStylePress,
    onStyleRemovePress,
    onEnhancePress,
    disabled = false,
    ...rest
  } = props
  const { t } = useTranslation()
  const { colors } = useTheme()

  const inactiveStyles = useMemo(
    () => ({ backgroundColor: colors.elevation.level2 }),
    [colors]
  )

  const activeStyles = useMemo(() => {
    return undefined
    // return { backgroundColor: colors.primaryContainer }
  }, [colors])

  return (
    <View className="flex-row flex-wrap" {...rest}>
      <Chip
        disabled={disabled}
        onPress={
          onAspectPress &&
          function () {
            Keyboard.dismiss()
            onAspectPress()
          }
        }
        style={activeStyles}
        mode="flat"
        icon="aspect-ratio"
        className="mr-1 mb-1"
      >
        {getAspectRatioFromSize(data)}
      </Chip>

      <Chip
        disabled={disabled}
        mode="flat"
        icon="auto-fix"
        className="mr-1 mb-1"
        style={!data.enhance ? inactiveStyles : activeStyles}
        onPress={
          onEnhancePress &&
          function () {
            Keyboard.dismiss()
            onEnhancePress()
          }
        }
      >
        {t(
          data.enhance
            ? 'screens.generation.settings.enhancer.on'
            : 'screens.generation.settings.enhancer.off'
        )}
      </Chip>

      <Chip
        className="mb-1 mr-1"
        disabled={disabled}
        onPress={onStylePress}
        style={!data.style ? inactiveStyles : activeStyles}
        icon="palette"
        onClose={
          onStyleRemovePress &&
          function () {
            Keyboard.dismiss()
            onStyleRemovePress()
          }
        }
      >
        {data.style || t('screens.generation.settings.style.none')}
      </Chip>
    </View>
  )
}
