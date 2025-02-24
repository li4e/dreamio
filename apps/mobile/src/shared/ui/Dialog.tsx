import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Dialog, Text } from 'react-native-paper'
import { CustomDialog } from './CustomDialog'

interface DialogOptions {
  title?: string
  content?: string
  renderActions?(dismiss: () => void): ReactNode
}

interface DialogContextType {
  showDialog(options: DialogOptions): void
  hideDialog(): void
}

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext)

  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}

const DialogContext = createContext<DialogContextType | null>(null)

export function DialogProvider({ children }: PropsWithChildren) {
  const [dialog, setDialog] = useState<DialogOptions>()

  const showDialog = useCallback((options: DialogOptions) => {
    setDialog(options)
  }, [])
  const hideDialog = useCallback(() => setDialog(undefined), [])

  const value = useMemo(() => ({ showDialog, hideDialog }), [])

  return (
    <DialogContext.Provider value={value}>
      {children}

      <CustomDialog visible={!!dialog} onDismiss={hideDialog}>
        {dialog?.title && <Dialog.Title>{dialog.title}</Dialog.Title>}
        {dialog?.content && (
          <Dialog.Content>
            <Text variant="bodyLarge">{dialog.content}</Text>
          </Dialog.Content>
        )}
        {dialog?.renderActions && (
          <Dialog.Actions>{dialog.renderActions(hideDialog)}</Dialog.Actions>
        )}
      </CustomDialog>
    </DialogContext.Provider>
  )
}
