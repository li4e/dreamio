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

const SNACK_BAR_HEIGHT = 50
const SPACE_BETWEEN_SNACKS = 12

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
  position?: 'top' | 'bottom'
  offset?: number
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

  const topSnackbars = snackbars.filter((s) => s.options?.position === 'top')
  const bottomSnackbars = snackbars.filter((s) => s.options?.position !== 'top')

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Portal>
        {renderSnackbars(topSnackbars, 'top', insets.top, dismissSnackBar)}
        {renderSnackbars(
          bottomSnackbars,
          'bottom',
          insets.bottom,
          dismissSnackBar
        )}
      </Portal>
    </SnackbarContext.Provider>
  )
}

function renderSnackbars(
  snackbars: SnackbarStateMessage[],
  position: 'top' | 'bottom',
  safeAreaInset: number,
  onDismiss: (id: number) => void
) {
  if (snackbars.length === 0) return null

  const maxOffset = Math.max(0, ...snackbars.map((s) => s.options?.offset ?? 0))

  let accumulatedOffset = safeAreaInset + SPACE_BETWEEN_SNACKS + maxOffset

  return snackbars.map((snackBar) => {
    const itemOffset = accumulatedOffset
    accumulatedOffset += SNACK_BAR_HEIGHT + SPACE_BETWEEN_SNACKS

    return (
      <SnackBar
        key={snackBar.id}
        snackBar={snackBar}
        offset={itemOffset}
        position={position}
        onDismiss={onDismiss}
      />
    )
  })
}

function SnackBar(props: {
  snackBar: SnackbarStateMessage
  offset: number
  position: 'top' | 'bottom'
  onDismiss: (id: number) => void
}) {
  const { snackBar, offset, position, onDismiss } = props
  const rightAction = snackBar.options?.rightAction
  const { colors } = useTheme()
  const isError = snackBar.options?.variant === SnackBarVariant.ERROR
  const textColor = isError ? colors.onError : colors.inverseOnSurface

  let rightContent = (
    <IconButton
      icon="close"
      iconColor={textColor}
      size={20}
      onPress={() => onDismiss(snackBar.id)}
    />
  )

  if (rightAction !== undefined) {
    rightContent = (
      <Button
        mode="text"
        textColor={textColor}
        onPress={() => {
          onDismiss(snackBar.id)
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
      key={snackBar.id}
      className="absolute left-0 right-0 rounded-md h-[50] mx-5 flex-row items-center justify-between"
      style={{
        backgroundColor: isError ? colors.error : colors.inverseSurface,
        [position]: offset,
      }}
    >
      <View className="flex-1 justify-center px-3">
        {snackBar.message.title && (
          <Text
            numberOfLines={1}
            variant="titleSmall"
            className="font-bold"
            style={{ color: textColor }}
          >
            {snackBar.message.title}
          </Text>
        )}
        <Text
          numberOfLines={1}
          variant="bodyMedium"
          style={{ color: textColor }}
        >
          {snackBar.message.description}
        </Text>
      </View>
      {rightContent}
    </Animated.View>
  )
}
