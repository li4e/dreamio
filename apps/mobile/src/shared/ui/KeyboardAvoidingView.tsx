import { PropsWithChildren } from 'react'
import { Platform, KeyboardAvoidingView as KV, View } from 'react-native'
import { useKeyboardHandler } from 'react-native-keyboard-controller'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const useKeyboardHeight = () => {
  const height = useSharedValue(0)

  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet'
        height.value = Math.max(event.height, 0)
      },
    },
    []
  )
  return { height }
}

interface KeyboardAvoidingViewProps extends PropsWithChildren {
  withBottomBar?: boolean
}

function KeyboardAvoidingViewAnimated(props: KeyboardAvoidingViewProps) {
  const { children, withBottomBar } = props
  const { bottom } = useSafeAreaInsets()
  const { height } = useKeyboardHeight()

  const style = useAnimatedStyle(() => {
    let paddingBottom = height.value
    paddingBottom = Math.max(height.value - (withBottomBar ? bottom + 80 : 0))

    return {
      flex: 1,
      paddingBottom,
    }
  }, [withBottomBar, bottom])

  return (
    <Animated.View style={style}>
      <View className="flex-1">{children}</View>
    </Animated.View>
  )
}

function KeyboardAvoidingViewFallback(props: KeyboardAvoidingViewProps) {
  const { children } = props

  return (
    <KV className="flex-1" behavior="padding">
      {children}
    </KV>
  )
}

// export const KeyboardAvoidingView =
//   Platform.OS === 'ios'
//     ? KeyboardAvoidingViewAnimated
//     : KeyboardAvoidingViewFallback

export const KeyboardAvoidingView = KeyboardAvoidingViewAnimated
