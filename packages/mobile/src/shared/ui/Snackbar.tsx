import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react'
import { View } from 'react-native'
import { IconButton, Portal, Text, useTheme } from 'react-native-paper'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SnackBarMessage {
  title?: string
  description: string
}

export enum SnackBarVariant {
  GENERAL,
  ERROR,
}

interface SnackBarOptions {
  variant?: SnackBarVariant
}

interface SnackbarStateMessage {
  id: number
  message: SnackBarMessage
  options?: SnackBarOptions
}

interface SnackbarContextType {
  showSnackbar: (message: SnackBarMessage, options?: SnackBarOptions) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
)

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

export const SnackbarProvider = ({ children }: PropsWithChildren) => {
  const [snackbars, setSnackbars] = useState<SnackbarStateMessage[]>([])
  const insets = useSafeAreaInsets()

  const dismissSnackBar = useCallback(
    (id: number) =>
      setSnackbars((prev) => prev.filter((item) => item.id !== id)),
    []
  )

  const showSnackbar = useCallback(
    (message: SnackBarMessage, options?: SnackBarOptions) => {
      const id = new Date().getTime()
      setSnackbars((prev) => [...prev, { id, message, options }])

      setTimeout(() => {
        dismissSnackBar(id)
      }, 3000) // autoClosing in 3 seconds
    },
    [dismissSnackBar]
  )
  const { colors } = useTheme()

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Portal>
        {snackbars.map((snackbar, index) => (
          <Animated.View
            layout={LinearTransition}
            entering={FadeIn}
            exiting={FadeOut}
            key={snackbar.id}
            className={
              'absolute left-0 right-0 bottom-0 rounded-md h-[50] mx-5 flex-row items-center justify-between'
            }
            style={{
              backgroundColor:
                snackbar.options?.variant === SnackBarVariant.ERROR
                  ? colors.error
                  : colors.onTertiaryContainer,
              marginBottom: Math.max(insets.bottom, 16) + index * (50 + 10),
            }}
          >
            <View className="flex-1 justify-center px-3">
              {snackbar.message.title && (
                <Text
                  numberOfLines={1}
                  variant="titleSmall"
                  className="text-white font-bold"
                >
                  {snackbar.message.title}
                </Text>
              )}
              <Text
                numberOfLines={1}
                variant="bodyMedium"
                className="text-white"
              >
                {snackbar.message.description}
              </Text>
            </View>
            <IconButton
              icon="close"
              iconColor="white"
              size={20}
              onPress={() => dismissSnackBar(snackbar.id)}
            />
          </Animated.View>
        ))}
      </Portal>
    </SnackbarContext.Provider>
  )
}
