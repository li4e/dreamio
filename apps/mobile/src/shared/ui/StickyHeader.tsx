import { BlurView } from 'expo-blur'
import { useCallback, useRef } from 'react'
import { ViewProps } from 'react-native'
import { Appbar, useTheme } from 'react-native-paper'
import Animated, {
  cancelAnimation,
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HEADER_HEIGHT } from 'shared/constants'

export function StickyHeader(
  props: { scrollY: SharedValue<number> } & ViewProps
) {
  const { children, scrollY, style, ...rest } = props
  const headerTranslateY = useSharedValue(0)
  const headerVisibility = useDerivedValue(
    () => interpolate(headerTranslateY.value, [0, HEADER_HEIGHT], [1, 0]),
    [headerTranslateY]
  )
  const toggleTimeout = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearToggleTimeout = useCallback(() => {
    if (toggleTimeout.current) {
      clearTimeout(toggleTimeout.current)
      toggleTimeout.current = null
    }
  }, [toggleTimeout])

  const finishScroll = useCallback(() => {
    toggleTimeout.current = setTimeout(() => {
      if (scrollY.value < HEADER_HEIGHT) {
        headerTranslateY.value = withTiming(0, { duration: 200 })
      } else {
        headerTranslateY.value = withTiming(
          headerTranslateY.value < HEADER_HEIGHT / 2 ? 0 : HEADER_HEIGHT,
          { duration: 200 }
        )
      }
    }, 50)
  }, [toggleTimeout, scrollY, headerTranslateY])

  useAnimatedReaction(
    () => {
      return scrollY.value
    },
    (currentY, previousY) => {
      if (currentY !== previousY && previousY !== null) {
        cancelAnimation(headerTranslateY)
        runOnJS(clearToggleTimeout)()

        let currentOffset = headerTranslateY.value

        if (currentY > previousY) {
          // Down Direction
          if (currentY <= 0) {
            // Don't react when overscrolling to top
            currentOffset = 0
          } else {
            currentOffset += currentY - previousY
          }
        } else if (currentY < previousY) {
          // Up Direction
          currentOffset -= previousY - currentY
        }
        headerTranslateY.value = clamp(currentOffset, 0, HEADER_HEIGHT)
        runOnJS(finishScroll)()
      }
    },
    [scrollY, clearToggleTimeout, finishScroll]
  )

  const wrapperStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -headerTranslateY.value }],
    }
  }, [headerTranslateY])
  const { dark } = useTheme()

  const headerStyles = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        headerVisibility.value,
        [0.5, 1],
        [0, 1],
        Extrapolation.CLAMP
      ),
    }),
    [headerVisibility]
  )

  return (
    <Animated.View
      style={[wrapperStyles, style]}
      {...rest}
      className="absolute top-0 left-0 right-0"
    >
      <BlurView intensity={100} tint={dark ? 'dark' : 'light'}>
        <Animated.View style={headerStyles}>
          <Appbar.Header className="bg-transparent" mode="center-aligned">
            {children}
          </Appbar.Header>
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

StickyHeader.useTopOffset = function () {
  const { top } = useSafeAreaInsets()
  return top + HEADER_HEIGHT
}

StickyHeader.height = HEADER_HEIGHT
