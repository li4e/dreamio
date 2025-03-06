import { useSnackbar } from 'shared/ui/Snackbar'
import { GenerationEntity } from '../model/GenerationEntity'
import { useGenerationDataService } from '../model/hooks/useGenerationDataService'
import { useTranslation } from 'react-i18next'
import { useDialog } from 'shared/ui/Dialog'
import { Button, useTheme } from 'react-native-paper'
import { HEADER_HEIGHT } from 'shared/constants'
import { useCallback } from 'react'

export function useGenDelete() {
  const { showSnackbar } = useSnackbar()
  const genDataService = useGenerationDataService()
  const { t } = useTranslation()

  const { showDialog } = useDialog()
  const { colors } = useTheme()

  return useCallback(
    (
      genertaion: GenerationEntity,
      deleteCallback?: () => void,
      restoreCallback?: () => void
    ) => {
      showDialog({
        title: t('screens.generationResult.deleteDialog.title'),
        content: t('screens.generationResult.deleteDialog.description'),
        renderActions(dismissDialog: () => void) {
          return (
            <>
              <Button
                textColor={colors.error}
                onPress={() =>
                  genDataService.removeGeneration(genertaion).then((undo) => {
                    dismissDialog()

                    showSnackbar(
                      { description: t('screens.generationResult.deleted') },
                      {
                        rightAction: {
                          handler() {
                            undo()
                            if (restoreCallback) {
                              restoreCallback()
                            }
                          },
                          label: t('screens.generationResult.undo'),
                        },
                        position: 'top',
                        offset: HEADER_HEIGHT,
                      }
                    )
                    if (deleteCallback) {
                      deleteCallback()
                    }
                  })
                }
              >
                {t('screens.generationResult.deleteDialog.confirm')}
              </Button>
              <Button onPress={dismissDialog}>
                {t('screens.generationResult.deleteDialog.cancel')}
              </Button>
            </>
          )
        },
      })
    },
    [showDialog, colors, genDataService, t, showSnackbar]
  )
}

export function useGenerationsDelete() {
  const { showSnackbar } = useSnackbar()
  const genDataService = useGenerationDataService()
  const { t } = useTranslation()

  const { showDialog } = useDialog()
  const { colors } = useTheme()

  return useCallback(
    (
      ids: number[],
      deleteCallback?: () => void,
      restoreCallback?: () => void
    ) => {
      showDialog({
        title: t('screens.generationResult.deleteDialog.title'),
        content: t('screens.generationResult.deleteDialog.descriptionMultiple'),
        renderActions(dismissDialog: () => void) {
          return (
            <>
              <Button
                textColor={colors.error}
                onPress={() =>
                  genDataService.removeGeneratios(ids).then((undo) => {
                    dismissDialog()

                    showSnackbar(
                      { description: t('screens.generationResult.deleted') },
                      {
                        rightAction: {
                          handler() {
                            undo()
                            if (restoreCallback) {
                              restoreCallback()
                            }
                          },
                          label: t('screens.generationResult.undo'),
                        },
                        position: 'top',
                        offset: HEADER_HEIGHT,
                      }
                    )
                    if (deleteCallback) {
                      deleteCallback()
                    }
                  })
                }
              >
                {t('screens.generationResult.deleteDialog.confirm')}
              </Button>
              <Button onPress={dismissDialog}>
                {t('screens.generationResult.deleteDialog.cancel')}
              </Button>
            </>
          )
        },
      })
    },
    [showDialog, colors, genDataService, t, showSnackbar]
  )
}
