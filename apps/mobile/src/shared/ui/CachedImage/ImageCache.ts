import md5 from "md5";
import * as FileSystem from "expo-file-system";

export class ImageCache {
  private static cachePathPrefix = `${FileSystem.cacheDirectory}cachedImages`;

  constructor(private url: string) {}

  private get localFilePath(): string {
    return `${ImageCache.cachePathPrefix}/${this.urlHash}.jpg`;
  }

  private get urlHash(): string {
    return md5(this.url);
  }

  /**
   * Downloads the image from the given URL and stores it in the cache if it doesn't already exist.
   * @returns {Promise<string>} - The local path to the cached image.
   */
  async download(): Promise<string> {
    // Ensure the cache directory exists
    await FileSystem.makeDirectoryAsync(ImageCache.cachePathPrefix, {
      intermediates: true,
    });

    const fileInfo = await FileSystem.getInfoAsync(this.localFilePath);
    if (!fileInfo.exists) {
      const downloadResult = await FileSystem.downloadAsync(
        this.url,
        this.localFilePath
      );
      if (downloadResult.status !== 200) {
        await ImageCache.clearCache(this.localFilePath);
        throw new Error("Unable to generate image");
      }
    }
    return this.localFilePath;
  }

  /**
   * Deletes all cached images from the cache directory.
   * @param path - The path of the file to delete.
   * @returns {Promise<void>} - A promise that resolves once the file is deleted.
   */
  static async clearCache(path: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path);
      }
    } catch (error) {
      console.error("Error clearing image cache:", error);
    }
  }
}
