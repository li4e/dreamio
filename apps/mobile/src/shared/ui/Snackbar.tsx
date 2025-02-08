import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react'
import { View } from 'react-native'
import { Button, IconButton, Portal, Text, useTheme } from 'react-native-paper'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'

interface SnackBarMessage {
  title?: string
  description: string
}

export enum SnackBarVariant {
  GENERAL,
  ERROR,
}

interface SnackBarOptions {
  autoHide?: boolean
  hideDelay?: number
  variant?: SnackBarVariant
  rightAction?: {
    handler(): void
    label: string
  }
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
      const { autoHide = true, hideDelay = 3000 } = options || {}
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      if (autoHide) {
        setTimeout(() => {
          dismissSnackBar(id)
        }, hideDelay)
      }
    },
    [dismissSnackBar]
  )
  const { colors } = useTheme()

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Portal>
        {snackbars.map((snackbar, index) => {
          const rightAction = snackbar.options?.rightAction

          const isError = snackbar.options?.variant === SnackBarVariant.ERROR
          const textColor = isError ? colors.onError : colors.inverseOnSurface

          let rightContent = (
            <IconButton
              icon="close"
              iconColor={textColor}
              size={20}
              onPress={() => dismissSnackBar(snackbar.id)}
            />
          )

          if (rightAction !== undefined) {
            rightContent = (
              <Button
                mode="text"
                textColor={textColor}
                onPress={() => {
                  dismissSnackBar(snackbar.id)
                  rightAction.handler()
                }}
              >
                {rightAction.label}
              </Button>
            )
          }

          return (
            <Animated.View
              layout={LinearTransition}
              entering={FadeIn}
              exiting={FadeOut}
              key={snackbar.id}
              className={
                'absolute left-0 right-0 bottom-0 rounded-md h-[50] mx-5 flex-row items-center justify-between'
              }
              style={{
                backgroundColor: isError ? colors.error : colors.inverseSurface,
                marginBottom:
                  Math.max(insets.bottom, 16) + 80 + 12 + index * (50 + 10),
              }}
            >
              <View className="flex-1 justify-center px-3">
                {snackbar.message.title && (
                  <Text
                    numberOfLines={1}
                    variant="titleSmall"
                    className="font-bold"
                    style={{ color: textColor }}
                  >
                    {snackbar.message.title}
                  </Text>
                )}
                <Text
                  numberOfLines={1}
                  variant="bodyMedium"
                  style={{ color: textColor }}
                >
                  {snackbar.message.description}
                </Text>
              </View>
              {rightContent}
            </Animated.View>
          )
        })}
      </Portal>
    </SnackbarContext.Provider>
  )
}
