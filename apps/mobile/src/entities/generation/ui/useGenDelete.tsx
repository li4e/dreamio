import { useSnackbar } from 'shared/ui/Snackbar'
import { GenerationEntity } from '../model/GenerationEntity'
import { useGenerationDataService } from '../model/hooks/useGenerationDataService'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { useDialog } from 'shared/ui/Dialog'
import { Button, useTheme } from 'react-native-paper'
import { HEADER_HEIGHT } from 'shared/constants'

export function useGenDelete(genertaion: GenerationEntity) {
  const { showSnackbar } = useSnackbar()
  const genDataService = useGenerationDataService()
  const { t } = useTranslation()
  const { goBack } = useNavigation()
  const { showDialog } = useDialog()
  const { colors } = useTheme()

  return async () => {
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
                  goBack()
                  dismissDialog()

                  showSnackbar(
                    { description: t('screens.generationResult.deleted') },
                    {
                      rightAction: {
                        handler: undo,
                        label: t('screens.generationResult.undo'),
                      },
                      position: 'top',
                      offset: HEADER_HEIGHT,
                    }
                  )
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
  }
}
