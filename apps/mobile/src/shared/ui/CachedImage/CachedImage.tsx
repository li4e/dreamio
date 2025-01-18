import { useEffect, useMemo, useState } from "react";
import { Image, ImageProps, View } from "react-native";
import { ImageCache } from "./ImageCache";

interface CachedImageProps extends ImageProps {
  source: { uri: string };
}

export function CachedImage(props: CachedImageProps) {
  const { source, className, style, ...rest } = props;
  const remoteUrl = source.uri;
  const cache = useMemo(() => new ImageCache(remoteUrl), [remoteUrl]);
  const [localUri, setLocalUri] = useState<string>();

  useEffect(() => {
    setLocalUri(undefined);
    cache.download().then((localPath) => {
      setLocalUri(localPath);
    });
  }, [cache]);

  return (
    <View className={className} style={style}>
      <Image
        source={{ uri: localUri ? `${localUri}` : undefined }}
        className="flex-1"
        {...rest}
      />
    </View>
  );
}
