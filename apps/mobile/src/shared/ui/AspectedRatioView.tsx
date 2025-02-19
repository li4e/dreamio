import { ViewProps } from 'react-native'
import Animated, { AnimatedProps } from 'react-native-reanimated'
import { twMerge } from 'tailwind-merge'

export enum AspectRatio {
  'square' = '1:1',
  'widescreen' = '16:9',
  'classic' = '4:3',
  'portrait' = '3:4',
  'vertical' = '9:16',
}

export function getAspectRatioFromSize(size: {
  width: number
  height: number
}): AspectRatio {
  const { width, height } = size
  const ratio = width / height

  if (Math.abs(ratio - 1) < 0.01) return AspectRatio.square
  if (Math.abs(ratio - 16 / 9) < 0.01) return AspectRatio.widescreen
  if (Math.abs(ratio - 4 / 3) < 0.01) return AspectRatio.classic
  if (Math.abs(ratio - 3 / 4) < 0.01) return AspectRatio.portrait
  if (Math.abs(ratio - 9 / 16) < 0.01) return AspectRatio.vertical

  return AspectRatio.square
}

interface AspectedRatioViewProps extends AnimatedProps<ViewProps> {
  ratio: AspectRatio
}

export function AspectedRatioView(props: AspectedRatioViewProps) {
  const { ratio, ...rest } = props
  return (
    <Animated.View
      className={twMerge(
        'w-full',
        ratio === AspectRatio.square && 'aspect-square',
        ratio === AspectRatio.widescreen && 'aspect-video',
        ratio === AspectRatio.classic && 'aspect-[4/3]',
        ratio === AspectRatio.portrait && 'aspect-[3/4]',
        ratio === AspectRatio.vertical && 'aspect-[3/4]' // Vertical image looks ugly, so let's fit it into square
      )}
      {...rest}
    />
  )
}
