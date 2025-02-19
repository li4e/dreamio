import * as FileSystem from 'expo-file-system'

/**
 * @deprecated This class is no longer recommended for use.
 * Please consider using a different caching strategy.
 */
export class ImageCacheDeprecated {
  private static cachePathPrefix = `${FileSystem.documentDirectory}cachedImages`

  static async clearAllCache(): Promise<void> {
    try {
      const cacheDir = this.cachePathPrefix

      // Check if the cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(cacheDir)

      if (!dirInfo.exists) {
        return
      }

      const files = await FileSystem.readDirectoryAsync(cacheDir)

      await Promise.all(
        files.map((file) => FileSystem.deleteAsync(`${cacheDir}/${file}`))
      )

      // Finally, delete the cache directory itself
      await FileSystem.deleteAsync(cacheDir)
    } catch (error) {
      console.error('Error clearing image cache:', error)
    }
  }
}
