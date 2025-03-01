import { PropsWithChildren } from 'react'
import Animated, {
  clamp,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

export function StickyHeaderWrapper(
  props: { scrollY: SharedValue<number> } & PropsWithChildren
) {
  const { children, scrollY } = props
  const styles = useAnimatedStyle(
    () => ({
      transform: [{ translateY: clamp(scrollY.value, -Infinity, 0) }],
    }),
    [scrollY]
  )
  return <Animated.View style={styles}>{children}</Animated.View>
}
