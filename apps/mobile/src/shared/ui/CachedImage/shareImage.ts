import { Share } from 'react-native'
import { getFileTempCachePath } from './useOnSaveImage'
import * as FileSystem from 'expo-file-system'

export async function shareImage(url: string, prompt: string) {
  let localPath: string | null = null

  try {
    localPath = await getFileTempCachePath(url)

    await Share.share({
      message: prompt,
      url: localPath,
    })
  } catch (error) {
    console.error('Error sharing image:', error)
    // TODO: throw an error and handle at the place of usage and show snackbar
  } finally {
    if (localPath) {
      await FileSystem.deleteAsync(localPath)
    }
  }
}
