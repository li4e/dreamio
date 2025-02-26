import LottieView, { AnimationObject } from 'lottie-react-native'
import React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { Button, Modal } from 'shared/ui/styled'

export enum StateModalVariant {
  Generation = 'generation',
  Error = 'error',
  ErrorUsafePrompt = 'error_prompt',
  ErrorServiceUnavailable = 'error_service_unavailable',
}

interface StateModalProps {
  variant: StateModalVariant | null
  onDismiss(): void
}

export function StateModal(props: StateModalProps) {
  const { variant, onDismiss } = props

  const dismissable = variant !== StateModalVariant.Generation

  return (
    <Modal
      onDismiss={onDismiss}
      visible={variant !== null}
      dismissableBackButton={dismissable}
      dismissable={dismissable}
      contentContainerStyle="rounded-2xl p-5 pb-8 items-center justify-end mx-[50] min-h-[300]"
    >
      {variant && (
        <StateModalContent
          variant={variant}
          dismissable={dismissable}
          onDismiss={onDismiss}
        />
      )}
    </Modal>
  )
}

interface StateModalContentProps {
  variant: StateModalVariant
  dismissable: boolean
  onDismiss(): void
}

function StateModalContent(props: StateModalContentProps) {
  const { variant, onDismiss, dismissable } = props
  const { title, description, button, animation } = useStateContent(variant)
  const { colors } = useTheme()

  return (
    <>
      <View className="flex-grow justify-center">
        <LottieView {...animation} />
      </View>
      <Text variant="titleMedium" className="mb-1 text-center">
        {title}
      </Text>
      <Text variant="bodySmall" className="text-center max-w-[240]">
        {description}
      </Text>
      {button && (
        <Button
          mode="contained"
          icon="arrow-right-thin"
          contentStyle="flex-row-reverse"
          className="mt-6"
          onPress={() => {
            onDismiss()
          }}
        >
          {button}
        </Button>
      )}

      {dismissable && (
        <IconButton
          icon="close"
          iconColor={colors.onBackground}
          size={20}
          className="absolute right-0 top-0"
          onPress={onDismiss}
        />
      )}
    </>
  )
}

export function StateContent(props: Pick<StateModalContentProps, 'variant'>) {
  const { variant } = props
  const { title, description, animation } = useStateContent(variant)

  return (
    <>
      <View className="justify-center">
        <LottieView {...animation} />
      </View>
      <Text variant="titleMedium" className="mb-1 text-center">
        {title}
      </Text>
      <Text variant="bodySmall" className="text-center max-w-[240]">
        {description}
      </Text>
    </>
  )
}

interface StateContent {
  title: string
  description: string
  button?: string
  animation: {
    source: AnimationObject
    style: StyleProp<ViewStyle>
    autoPlay?: boolean
    loop?: boolean
    speed?: number
  }
}

function useStateContent(variant: StateModalVariant): StateContent {
  const { t } = useTranslation()

  const content: Record<StateModalVariant, StateContent> = useMemo(
    () => ({
      [StateModalVariant.Generation]: {
        title: t('screens.generation.modalGeneration.title'),
        description: t('screens.generation.modalGeneration.description'),
        animation: {
          source: require('./animations/spell.json'),
          style: { width: 200, height: 200 },
          autoPlay: true,
        },
      },
      [StateModalVariant.Error]: {
        title: t('screens.generation.modalError.title'),
        description: t('screens.generation.modalError.description'),
        button: t('screens.generation.modalError.button'),
        animation: {
          source: require('./animations/error.json'),
          style: { width: 90, height: 90 },
          autoPlay: true,
          loop: false,
        },
      },
      [StateModalVariant.ErrorServiceUnavailable]: {
        title: t('screens.generation.errorServiceUnavailable.title'),
        description: t(
          'screens.generation.errorServiceUnavailable.description'
        ),
        button: t('screens.generation.modalError.button'),
        animation: {
          source: require('./animations/error.json'),
          style: { width: 90, height: 90 },
          autoPlay: true,
          loop: false,
        },
      },
      [StateModalVariant.ErrorUsafePrompt]: {
        title: t('screens.generation.errorUnsafePrompt.title'),
        description: t('screens.generation.errorUnsafePrompt.description'),
        button: t('screens.generation.modalError.button'),
        animation: {
          source: require('./animations/error.json'),
          style: { width: 90, height: 90 },
          autoPlay: true,
          loop: false,
        },
      },
    }),
    [t]
  )

  return content[variant]
}
