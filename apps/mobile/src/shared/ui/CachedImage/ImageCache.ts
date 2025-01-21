import md5 from 'md5'
import * as FileSystem from 'expo-file-system'

const caches = new Set<string>()

export class ImageCache {
  private static cachePathPrefix = `${FileSystem.documentDirectory}cachedImages`

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
    if (caches.has(this.url)) {
      return this.localFilePath
    }

    const fileInfo = await FileSystem.getInfoAsync(this.localFilePath)
    if (!fileInfo.exists) {
      // Ensure the cache directory exists
      const dir = await FileSystem.getInfoAsync(ImageCache.cachePathPrefix)
      if (!dir.exists) {
        await FileSystem.makeDirectoryAsync(ImageCache.cachePathPrefix, {
          intermediates: true,
        })
      }

      const downloadResult = await FileSystem.downloadAsync(
        this.url,
        this.localFilePath
      )
      if (downloadResult.status !== 200) {
        await ImageCache.clearCache(this.url)
        throw new Error('Unable to download image')
      }
    }

    caches.add(this.url)
    return this.localFilePath
  }

  get hasCache() {
    return caches.has(this.url)
  }

  get cachedPath(): string | undefined {
    if (this.hasCache) {
      return this.localFilePath
    }
    return undefined
  }

  /**
   * Deletes cached images from the cache directory.
   * @param path - The url of the remote file to delete it's local cache.
   * @returns {Promise<void>} - A promise that resolves once the file is deleted.
   */
  static async clearCache(url: string): Promise<void> {
    try {
      const imageCache = new ImageCache(url)
      const fileInfo = await FileSystem.getInfoAsync(imageCache.localFilePath)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageCache.localFilePath)
      }
      caches.delete(url)
    } catch (error) {
      console.error('Error clearing image cache:', error)
    }
  }
}
