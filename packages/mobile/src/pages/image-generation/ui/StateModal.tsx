import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { Button, Modal } from 'shared/ui/styled'

export enum StateModalVariant {
  Generation,
  Premium,
  TopUp,
  Error,
}

interface StateModalProps {
  variant: StateModalVariant
  onDismiss?(): void
}

export function StateModal(props: StateModalProps) {
  const { variant, onDismiss } = props
  const texts = useStateTexts()
  const title = texts[variant].title
  const description = texts[variant].description
  const buttonTitle = texts[variant].button
  const { t } = useTranslation()
  const { colors } = useTheme()
  const dismissable = !!onDismiss

  return (
    <Modal
      visible={true}
      dismissableBackButton={dismissable}
      dismissable={dismissable}
      contentContainerStyle="bg-white rounded-2xl p-5 pb-8 items-center justify-end mx-[50] min-h-[300]"
    >
      <View className="flex-grow justify-center min-h-[140]">
        <StateAnimation variant={variant} />
      </View>
      <Text variant="titleMedium" className="mb-1 text-center">
        {title}
      </Text>
      <Text variant="bodySmall" className="text-center max-w-[240]">
        {description}
      </Text>
      {buttonTitle && (
        <Button
          mode="contained"
          icon="arrow-right-thin"
          contentStyle="flex-row-reverse"
          className="mt-6"
          onPress={() => {
            // TODO: Replace to a real one
          }}
        >
          {buttonTitle}
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

      {onDismiss && (
        <IconButton
          icon="close"
          iconColor={colors.backdrop}
          size={20}
          className="absolute right-1 top-1"
          onPress={onDismiss}
        />
      )}
    </Modal>
  )
}

function StateAnimation({ variant }: { variant: StateModalVariant }) {
  switch (variant) {
    case StateModalVariant.Generation: {
      return (
        <LottieView
          source={require('shared/ui/lottie-animations/spell.json')}
          style={{ width: 220, height: 220 }}
          autoPlay
        />
      )
    }
    case StateModalVariant.Premium: {
      return (
        <LottieView
          source={require('shared/ui/lottie-animations/premium_1.json')}
          style={{ width: 130, height: 130 }}
          autoPlay
        />
      )
    }
    case StateModalVariant.TopUp: {
      return (
        <LottieView
          source={require('shared/ui/lottie-animations/top_up.json')}
          style={{ width: 100, height: 100 }}
          autoPlay
          loop={false}
        />
      )
    }
    case StateModalVariant.Error: {
      return (
        <LottieView
          source={require('shared/ui/lottie-animations/error.json')}
          style={{ width: 90, height: 90 }}
          autoPlay
          loop={false}
        />
      )
    }
  }
}

function useStateTexts(): Record<
  StateModalVariant,
  { title: string; description: string; button?: string }
> {
  const { t } = useTranslation()

  return {
    [StateModalVariant.Generation]: {
      title: t('screens.generation.modalGeneration.title'),
      description: t('screens.generation.modalGeneration.description'),
    },
    [StateModalVariant.Premium]: {
      title: t('screens.generation.modalPremium.title'),
      description: t('screens.generation.modalPremium.description'),
      button: t('screens.generation.modalPremium.button_free'),
    },
    [StateModalVariant.TopUp]: {
      title: t('screens.generation.modalTopUp.title'),
      description: t('screens.generation.modalTopUp.description'),
      button: t('screens.generation.modalTopUp.button'),
    },
    [StateModalVariant.Error]: {
      title: t('screens.generation.modalError.title'),
      description: t('screens.generation.modalError.description'),
      button: t('screens.generation.modalError.button'),
    },
  }
}
