import LottieView, { AnimationObject } from 'lottie-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, View, ViewStyle } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { Button, Modal } from 'shared/ui/styled'

export enum StateModalVariant {
  Generation = 'generation',
  Premium = 'premium',
  TopUp = 'top_up',
  Error = 'error',
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
      contentContainerStyle="bg-white rounded-2xl p-5 pb-8 items-center justify-end mx-[50] min-h-[300]"
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
  const { t } = useTranslation()
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
            // TODO: Replace to a real one
          }}
        >
          {button}
        </Button>
      )}

      {variant === StateModalVariant.Premium && (
        <Button
          className="absolute top-2 left-2"
          onPress={() => {
            // TODO: Replace to a real one
          }}
        >
          {t('screens.generation.modalPremium.topUp')}
        </Button>
      )}

      {dismissable && (
        <IconButton
          icon="close"
          iconColor={colors.backdrop}
          size={20}
          className="absolute right-0 top-0"
          onPress={onDismiss}
        />
      )}
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
      [StateModalVariant.Premium]: {
        title: t('screens.generation.modalPremium.title'),
        description: t('screens.generation.modalPremium.description'),
        button: t('screens.generation.modalPremium.button_free'),
        animation: {
          source: require('./animations/premium_2.json'),
          style: { width: 90, height: 90 },
          autoPlay: true,
          loop: false,
          speed: 2,
        },
      },
      [StateModalVariant.TopUp]: {
        title: t('screens.generation.modalTopUp.title'),
        description: t('screens.generation.modalTopUp.description'),
        button: t('screens.generation.modalTopUp.button'),
        animation: {
          source: require('./animations/top_up.json'),
          style: { width: 100, height: 100 },
          autoPlay: true,
          loop: false,
          speed: 2,
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
    }),
    [t]
  )

  return content[variant]
}
