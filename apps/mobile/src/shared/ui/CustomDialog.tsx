import { useMemo, useState } from 'react'
import { Platform } from 'react-native'

import { useKeyboardHandler } from 'react-native-keyboard-controller'
import { Dialog, DialogProps, Portal } from 'react-native-paper'
import { runOnJS } from 'react-native-reanimated'

export function CustomDialog(props: DialogProps) {
  const { children, style = false, ...rest } = props

  const [bottom, setBottom] = useState(0)

  useKeyboardHandler(
    {
      onStart: (event) => {
        'worklet'
        if (Platform.OS === 'android') {
          const newBototm = Math.max(event.height / 2, 0)

          runOnJS(setBottom)(newBototm)
        }
      },
    },
    []
  )

  const dialogStyles = useMemo(() => [style, { bottom }], [bottom, style])

  return (
    <Portal>
      <Dialog style={dialogStyles} {...rest}>
        {children}
      </Dialog>
    </Portal>
  )
}
