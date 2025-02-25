import { styled } from 'nativewind'
import Animated from 'react-native-reanimated'

export const ScrollView = styled(Animated.ScrollView, {
  props: {
    contentContainerStyle: true,
  },
})
