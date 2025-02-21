import { PropsWithChildren } from 'react'
import { View, KeyboardAvoidingView as KV } from 'react-native'
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

export function FakeView(props: { withTabBar?: boolean }) {
  const { withTabBar } = props

  const { bottom } = useSafeAreaInsets()
  const { height } = useKeyboardHeight()

  const style = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value) - (withTabBar ? bottom + 80 : 0),
    }
  }, [withTabBar, bottom])

  return <Animated.View style={style} />
}

interface KeyboardAvoidingViewProps extends PropsWithChildren {
  withBottomBar?: boolean
}

export function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
  const { children, withBottomBar } = props
  return (
    <View className="flex-1">
      {children}
      <FakeView withTabBar={withBottomBar} />
    </View>
  )
}

// export function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
//   const { children } = props
//   return (
//     <KV className="flex-1" behavior="padding">
//       {children}
//     </KV>
//   )
// }
