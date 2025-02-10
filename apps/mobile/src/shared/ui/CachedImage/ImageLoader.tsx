import { useTheme } from 'react-native-paper'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'

export function ImageLoader() {
  const { colors } = useTheme()
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 bottom-0"
      style={[{ backgroundColor: colors.surfaceDisabled }, animatedStyle]}
    />
  )
}
