import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native-paper'
import { Modal } from 'shared/ui/styled'

export function StateModal() {
  const { t } = useTranslation()
  const dismissable = false
  return (
    <Modal
      visible
      dismissableBackButton={dismissable}
      dismissable={dismissable}
      contentContainerStyle="bg-white rounded-2xl p-5 pb-8 items-center justify-center mx-[50]"
    >
      <LottieView
        source={require('shared/ui/lottie-animations/spell.json')}
        style={{ width: 200, height: 200 }}
        autoPlay
      />
      <Text variant="titleMedium" className="mb-1">
        {t('screens.generation.modalGeneration.title')}
      </Text>
      <Text variant="bodySmall">
        {t('screens.generation.modalGeneration.description')}
      </Text>
    </Modal>
  )
}
