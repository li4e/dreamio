import { useTranslation } from 'react-i18next'
import { Button, Dialog, Text, TextInput, useTheme } from 'react-native-paper'
import { CustomDialog } from './CustomDialog'
import { View } from 'react-native'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { api } from 'shared/api'
import { SnackBarVariant, useSnackbar } from './Snackbar'
import { HEADER_HEIGHT } from 'shared/constants'
import { Controller, useForm } from 'react-hook-form'

export function ReportDialog(props: { urls: string[]; onDismiss(): void }) {
  const { urls, onDismiss } = props
  const { colors } = useTheme()
  const { t } = useTranslation()
  const [pending, setPending] = useState(false)
  const { showSnackbar } = useSnackbar()

  const { control, handleSubmit } = useForm<{ description: string }>()

  const onPress = handleSubmit(async ({ description }) => {
    setPending(true)
    try {
      await api.reportGeneration(urls, description)
      showSnackbar(
        {
          title: t('components.reportDialog.success.title'),
          description: t('components.reportDialog.success.description'),
        },
        { position: 'top', offset: HEADER_HEIGHT }
      )
      onDismiss()
    } catch {
      showSnackbar(
        {
          title: t('components.reportDialog.error.title'),
          description: t('components.reportDialog.error.description'),
        },
        {
          variant: SnackBarVariant.ERROR,
          position: 'top',
          offset: HEADER_HEIGHT,
        }
      )
    } finally {
      setPending(false)
    }
  })

  return (
    <CustomDialog visible onDismiss={pending ? undefined : onDismiss}>
      <Dialog.Title className="text-center">
        {t('components.reportDialog.title')}
      </Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium" className="mb-5">
          {t('components.reportDialog.description')}
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              disabled={pending}
              value={value}
              onChangeText={(text) => onChange(text.slice(0, 500))}
              className="py-4 max-h-[150]"
              placeholder={t('components.reportDialog.inputPlaceholder')}
              mode="outlined"
              multiline={true}
            />
          )}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button textColor={colors.error} onPress={onDismiss} disabled={pending}>
          {t('components.reportDialog.cancel')}
        </Button>
        <Button disabled={pending} loading={pending} onPress={onPress}>
          {t('components.reportDialog.button')}
        </Button>
      </Dialog.Actions>
    </CustomDialog>
  )
}

const ReportDialogContext = createContext<null | {
  openReporDialog(urls: string[]): void
}>(null)

export function ReportDialogProvider(props: PropsWithChildren) {
  const [urls, setUrls] = useState<null | string[]>(null)
  const { children } = props
  const onDismiss = () => setUrls(null)
  const contextValue = useMemo(
    () => ({
      openReporDialog: setUrls,
    }),
    [setUrls]
  )

  return (
    <ReportDialogContext.Provider value={contextValue}>
      {children}
      {urls && <ReportDialog urls={urls} onDismiss={onDismiss} />}
    </ReportDialogContext.Provider>
  )
}

export const useReportDialog = () => {
  const context = useContext(ReportDialogContext)
  if (!context) {
    throw new Error('ReportDialogContext is undefined')
  }

  return context
}
