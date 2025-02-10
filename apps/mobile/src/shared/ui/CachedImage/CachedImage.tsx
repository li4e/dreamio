import { useEffect, useRef, useState } from 'react'
import { Image, ImageProps, View } from 'react-native'
import { ImageCache } from './ImageCache'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { ImageLoader } from './ImageLoader'

interface CachedImageProps extends ImageProps {
  source: { uri: string }
}

export function CachedImage(props: CachedImageProps) {
  const { source, className, style, ...rest } = props
  const remoteUrl = source.uri
  const cache = useRef(new ImageCache(remoteUrl))
  const [localUri, setLocalUri] = useState<string | undefined>(
    cache.current.cachedPath
  )

  const [animatedEntering, setAnimatedEntering] = useState(
    !cache.current.hasCache
  )

  useEffect(() => {
    cache.current = new ImageCache(remoteUrl)
    setAnimatedEntering(!cache.current.hasCache)
    setLocalUri(cache.current.cachedPath)

    if (!cache.current.hasCache) {
      cache.current.download().then((localPath) => {
        setLocalUri(localPath)
      })
    }
  }, [remoteUrl])

  return (
    <View className={className} style={style}>
      {localUri ? (
        <Animated.View
          key="image"
          className="absolute top-0 right-0 bottom-0 left-0"
          entering={animatedEntering ? FadeIn.duration(300) : undefined}
        >
          <Image source={{ uri: localUri }} className="flex-1" {...rest} />
        </Animated.View>
      ) : (
        <Animated.View
          key="loader"
          className="absolute top-0 right-0 bottom-0 left-0"
          exiting={FadeOut.duration(300)}
        >
          <ImageLoader />
        </Animated.View>
      )}
    </View>
  )
}
