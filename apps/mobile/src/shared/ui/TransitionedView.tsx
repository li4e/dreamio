import { PropsWithChildren, useLayoutEffect } from 'react'
import { Platform } from 'react-native'
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  measure,
  runOnUI,
  useAnimatedRef,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

interface TransitionedViewProps extends PropsWithChildren {
  duration?: number
}
function TransitionedViewAnimated(props: TransitionedViewProps) {
  const { children, duration = 250 } = props
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
        {children && (
          <Animated.View
            entering={FadeIn.duration(duration)}
            exiting={FadeOut.duration(Math.max(duration - 50, 0))}
          >
            {children}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  )
}

function TransitionedViewSimple(props: TransitionedViewProps) {
  const { children, duration = 300 } = props

  return (
    children && (
      <Animated.View entering={FadeIn.duration(duration)}>
        {children}
      </Animated.View>
    )
  )
}

export const TransitionedView =
  Platform.OS === 'ios' ? TransitionedViewAnimated : TransitionedViewSimple
