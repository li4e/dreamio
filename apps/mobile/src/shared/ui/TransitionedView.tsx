import { PropsWithChildren, useLayoutEffect } from 'react'
import Animated, {
  cancelAnimation,
  measure,
  runOnUI,
  useAnimatedRef,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

interface TransitionedViewProps extends PropsWithChildren {
  duration?: number
}
export function TransitionedView(props: TransitionedViewProps) {
  const { children, duration = 300 } = props
  const animatedHeight = useSharedValue(0)
  const contentRef = useAnimatedRef()

  useLayoutEffect(() => {
    runOnUI((animationDuration: number) => {
      const measurements = measure(contentRef)
      if (measurements) {
        cancelAnimation(animatedHeight)
        animatedHeight.value = withTiming(measurements.height, {
          duration: animationDuration,
        })
      }
    })(duration)
  }, [children, duration])

  return (
    <Animated.View style={{ height: animatedHeight }}>
      <Animated.View className="absolute top-0 right-0 left-0" ref={contentRef}>
        {children}
      </Animated.View>
    </Animated.View>
  )
}
