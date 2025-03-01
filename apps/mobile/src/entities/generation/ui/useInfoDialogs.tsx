import { useTranslation } from 'react-i18next'
import { useDialog } from 'shared/ui/Dialog'
import { Button } from 'react-native-paper'
import { useCallback } from 'react'

export function useShowEnhanceInfoDialog() {
  const { t } = useTranslation()
  const { showDialog } = useDialog()

  return useCallback(() => {
    showDialog({
      title: t('screens.generation.enhance.dialog.title'),
      content: t('screens.generation.enhance.dialog.description'),
      renderActions: (dismiss) => (
        <Button onPress={dismiss}>
          {t('screens.generation.enhance.dialog.button')}
        </Button>
      ),
    })
  }, [showDialog, t])
}

export function useShowStyleInfoDialog() {
  const { t } = useTranslation()
  const { showDialog } = useDialog()

  return useCallback(() => {
    showDialog({
      title: t('screens.generation.styleDialog.title'),
      content: t('screens.generation.styleDialog.text'),
      renderActions(dismiss) {
        return (
          <Button onPress={dismiss}>
            {t('screens.generation.styleDialog.button')}
          </Button>
        )
      },
    })
  }, [showDialog, t])
}
