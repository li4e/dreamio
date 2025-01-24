import LottieView from 'lottie-react-native'
import Animated, { FadeOut } from 'react-native-reanimated'
import StartAnimation from '../ui/launch_animation.json'
import { useTheme } from 'react-native-paper'

export function AppLoader(props: { onAnimationFinish: () => void }) {
  const { onAnimationFinish } = props
  const { colors } = useTheme()

  return (
    <Animated.View
      className="flex-1 items-center justify-center"
      exiting={FadeOut.duration(200)}
      style={{
        backgroundColor: colors.background,
      }}
    >
      <LottieView
        style={{ width: '90%', height: 300 }}
        source={StartAnimation}
        autoPlay
        duration={500}
        loop={false}
        onAnimationFinish={onAnimationFinish}
      />
    </Animated.View>
  )
}
