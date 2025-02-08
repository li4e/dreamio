import { useCallback } from 'react'
import { saveImage } from './ImageCache'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { useSnackbar } from 'shared/ui/Snackbar'

export function useOnSaveImage() {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return useCallback((url: string) => {
    const saved = saveImage(url)
    if (saved === null) {
      showSnackbar(
        {
          title: t('components.snackBar.saveImageError.title'),
          description: t('components.snackBar.saveImageError.description'),
        },
        {
          rightAction: {
            handler: () => {
              Linking.openSettings()
            },
            label: t('components.snackBar.saveImageError.button'),
          },
        }
      )
    }
  }, [])
}
