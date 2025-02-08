import { useCallback } from 'react'
import { saveImage } from './ImageCache'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { SnackBarVariant, useSnackbar } from 'shared/ui/Snackbar'

export function useOnSaveImage() {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  return useCallback(async (url: string) => {
    const saved = await saveImage(url)
    if (saved === null) {
      showSnackbar(
        {
          title: t('components.snackBar.saveImage.noAccess.title'),
          description: t('components.snackBar.saveImage.noAccess.description'),
        },
        {
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
      showSnackbar({
        title: t('components.snackBar.saveImage.success.title'),
        description: t('components.snackBar.saveImage.success.description'),
      })
    } else {
      showSnackbar({
        title: t('components.snackBar.saveImage.error.title'),
        description: t('components.snackBar.saveImage.error.title'),
      })
    }
  }, [])
}
