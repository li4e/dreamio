import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import { Image } from 'expo-image'
import md5 from 'md5'
import { HEADER_HEIGHT } from 'shared/constants'

export async function saveImage(url: string): Promise<boolean | null> {
  try {
    let permissions = await MediaLibrary.getPermissionsAsync(true)

    if (!permissions.granted && permissions.canAskAgain) {
      permissions = await MediaLibrary.requestPermissionsAsync(true)
    }

    if (permissions.granted) {
      const cachedPath = await getFileTempCachePath(url)
      await MediaLibrary.saveToLibraryAsync(cachedPath)
      await FileSystem.deleteAsync(cachedPath)
      return true
    } else {
      return null
    }
  } catch (error) {
    console.error('Error saving image:', error)
    return false
    // TODO: throw an error and handle at the place of usage and show snackbar
  }
}

export function useOnSaveImage() {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return useCallback(
    async (url: string) => {
      const saved = await saveImage(url)
      const snackOptions = { position: 'top', offset: HEADER_HEIGHT } as const

      if (saved === null) {
        showSnackbar(
          {
            title: t('components.snackBar.saveImage.noAccess.title'),
            description: t(
              'components.snackBar.saveImage.noAccess.description'
            ),
          },
          {
            ...snackOptions,
            variant: SnackBarVariant.ERROR,
            rightAction: {
              handler: () => {
                Linking.openSettings()
              },
              label: t('components.snackBar.saveImage.noAccess.button'),
            },
          }
        )
      } else if (saved === true) {
        showSnackbar(
          {
            title: t('components.snackBar.saveImage.success.title'),
            description: t('components.snackBar.saveImage.success.description'),
          },
          snackOptions
        )
      } else {
        showSnackbar(
          {
            title: t('components.snackBar.saveImage.error.title'),
            description: t('components.snackBar.saveImage.error.description'),
          },
          {
            ...snackOptions,
            variant: SnackBarVariant.ERROR,
            position: 'top',
            offset: HEADER_HEIGHT,
          }
        )
      }
    },
    [t]
  )
}

export async function getFileTempCachePath(url: string) {
  let cachedPath = await Image.getCachePathAsync(url)

  if (!cachedPath) {
    await Image.prefetch(url, 'disk')
    cachedPath = await Image.getCachePathAsync(url)
  }

  if (!cachedPath) {
    throw new Error('cachePath is null')
  }

  if (Platform.OS === 'android' && !cachedPath.startsWith('file://')) {
    cachedPath = `file://${cachedPath}`
  }

  const savePath = `${FileSystem.cacheDirectory}${md5(url)}.jpg`

  await FileSystem.copyAsync({ from: cachedPath, to: savePath })
  return savePath
}
