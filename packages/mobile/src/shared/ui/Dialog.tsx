import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import { Dialog, Portal, Text } from 'react-native-paper'

interface DialogOptions {
  title?: string
  content?: string
  renderActions?(dismiss: () => void): ReactNode
}

interface DialogContextType {
  showDialog(options: DialogOptions): void
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

  const showDialog = useCallback(
    (options: DialogOptions) => setDialog(options),
    []
  )
  const hideDialog = useCallback(() => setDialog(undefined), [])

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <Portal>
        <Dialog visible={!!dialog} onDismiss={hideDialog}>
          {dialog?.title && <Dialog.Title>{dialog.title}</Dialog.Title>}
          {dialog?.content && (
            <Dialog.Content>
              <Text>{dialog.content}</Text>
            </Dialog.Content>
          )}
          {dialog?.renderActions && (
            <Dialog.Actions>{dialog.renderActions(hideDialog)}</Dialog.Actions>
          )}
        </Dialog>
      </Portal>
    </DialogContext.Provider>
  )
}
