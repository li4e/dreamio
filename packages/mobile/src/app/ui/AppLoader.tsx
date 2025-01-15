import LottieView from 'lottie-react-native'
import Animated, { FadeOut } from 'react-native-reanimated'
import StartAnimation from '../ui/launch_animation.json'

export function AppLoader(props: { onAnimationFinish: () => void }) {
  const { onAnimationFinish } = props
  return (
    <Animated.View
      className="flex-1 bg-white items-center justify-center"
      exiting={FadeOut.duration(200)}
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
