import { PropsWithChildren, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { Button } from 'react-native-paper'
import Animated from 'react-native-reanimated'

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
          onPress={() => {
            Keyboard.dismiss()
            setVisible(!visible)
          }}
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
