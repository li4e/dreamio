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
      })
        .fetch('GET', this.url)
        .then(async (response) => {
          const statusCode = response.info().status

          if (statusCode !== 200) {
            await ImageCache.clearCache(this.localFilePath)
            throw new Error('Unable to generate image')
          }
        })
    }
    return this.localFilePath
  }

  /**
   * Deletes all cached images from the cache directory.
   * @returns {Promise<void>} - A promise that resolves once all images are deleted.
   */
  static async clearCache(path: string): Promise<void> {
    try {
      await ReactNativeBlob.fs.unlink(path)
    } catch (error) {
      console.error('Error clearing image cache:', error)
    }
  }
}
