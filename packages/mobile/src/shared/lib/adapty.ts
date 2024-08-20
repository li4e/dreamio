import { createPaywallView } from '@adapty/react-native-ui'
import { adapty } from 'react-native-adapty'

export enum PaywallPlacement {
  ONBOARDING = 'onboarding',
  LAUNCH = 'launch',
  GENERATION_SCREEN = 'generation_screen',
  SETTINGS_SCREEN = 'settings_screen',
  TOP_UP_GENERATION_SCREEN = 'top_up_generation_screen',
}

export async function presentPaywall(placement: PaywallPlacement) {
  try {
    let startTime = Date.now()
    const paywall = await adapty.getPaywall(placement)
    console.log(`Fetching paywal took: ${Date.now() - startTime}ms`)
    startTime = Date.now()
    const view = await createPaywallView(paywall)
    view.registerEventHandlers({
      onAction() {
        console.log('onAction')
      },
      onLoadingProductsFailed() {
        console.log('onLoadingProductsFailed')
      },
      onProductSelected(product) {
        console.log('onProductSelected', product)
      },
      onPurchaseCancelled() {
        console.log('onPurchaseCancelled')
      },
      onPurchaseFailed(err) {
        console.log('onPurchaseFailed', err)
      },
      onPurchaseStarted() {
        console.log('onPurchaseStarted')
      },
      onRenderingFailed() {
        console.log('onRenderingFailed')
      },
      onRestoreFailed() {
        console.log('onRestoreFailed')
      },
      onRestoreStarted() {
        console.log('onRestoreStarted')
      },
      onUrlPress(url) {
        console.log('onUrlPress', url)
      },
      onCloseButtonPress() {
        console.log('onCloseButtonPress')
        view.dismiss()
      },
      onPurchaseCompleted(profile) {
        console.log('onPurchaseCompleted', profile)
        view.dismiss()
      },
      onRestoreCompleted(profile) {
        console.log('onRestoreCompleted', profile)
        view.dismiss()
      },
    })
    console.log(`Creating paywalView took: ${Date.now() - startTime}ms`)
    startTime = Date.now()
    await view.present()
    console.log(`Presenting paywal took: ${Date.now() - startTime}ms`)
  } catch (err) {
    console.log('function presentPaywall', err)
  }
}
