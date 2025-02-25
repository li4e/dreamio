import { useMemo, useState } from 'react'

import {
  useKeyboardHandler,
  useWindowDimensions,
} from 'react-native-keyboard-controller'
import { Dialog, DialogProps, Portal } from 'react-native-paper'
import { runOnJS } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function CustomDialog(props: DialogProps) {
  const { children, style, ...rest } = props

  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const { height } = useWindowDimensions()

  useKeyboardHandler(
    {
      onStart: (event) => {
        'worklet'
        runOnJS(setKeyboardHeight)(Math.max(event.height, 0))
      },
    },
    []
  )

  const insets = useSafeAreaInsets()

  const dialogStyles = useMemo(() => {
    const bottom =
      keyboardHeight > 0 ? keyboardHeight / 2 - insets.bottom / 2 : 80 / 2

    return [
      style,
      {
        bottom: bottom,
        maxHeight:
          height -
          keyboardHeight -
          insets.top -
          insets.bottom -
          (keyboardHeight > 0 ? 0 : 80),
      },
    ]
  }, [keyboardHeight, style, height, insets])

  return (
    <Portal>
      <Dialog style={dialogStyles} {...rest}>
        {children}
      </Dialog>
    </Portal>
  )
}
