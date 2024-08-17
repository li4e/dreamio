import md5 from 'md5'
import ReactNativeBlob from 'react-native-blob-util'

export class ImageCache {
  private static cachePathPrefix = `${ReactNativeBlob.fs.dirs.CacheDir}/cachedImages`

  constructor(private url: string) {}

  private get localFilePath(): string {
    return `${ImageCache.cachePathPrefix}/${this.urlHash}.jpg`
  }

  private get urlHash(): string {
    return md5(this.url)
  }

  /**
   * Downloads the image from the given URL and stores it in the cache if it doesn't already exist.
   * @returns {Promise<string>} - The local path to the cached image.
   */
  async download(): Promise<string> {
    const cacheExists = await ReactNativeBlob.fs.exists(this.localFilePath)
    if (!cacheExists) {
      await ReactNativeBlob.config({
        path: this.localFilePath,
      }).fetch('GET', this.url)
    }
    return this.localFilePath
  }
}
