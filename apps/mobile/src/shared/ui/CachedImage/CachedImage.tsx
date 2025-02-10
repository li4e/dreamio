import { useEffect, useRef, useState } from 'react'
import { Image, ImageProps, View } from 'react-native'
import { ImageCache } from './ImageCache'

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

  useEffect(() => {
    cache.current = new ImageCache(remoteUrl)
    setLocalUri(cache.current.cachedPath)

    if (!cache.current.hasCache) {
      cache.current.download().then((localPath) => {
        setLocalUri(localPath)
      })
    }
  }, [remoteUrl])

  return (
    <View className={className} style={style}>
      <Image source={{ uri: localUri }} className="flex-1" {...rest} />
    </View>
  )
}
