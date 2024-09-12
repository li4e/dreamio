import { createPaywallView } from '@adapty/react-native-ui'
import { ViewController } from '@adapty/react-native-ui/dist/view-controller'
import { adapty, AdaptyPaywall } from 'react-native-adapty'

export enum PaywallPlacement {
  GENERATION_SCREEN = 'generation_screen',
  SETTINGS_SCREEN = 'settings_screen',
  TOP_UP_GENERATION_SCREEN = 'top_up_generation_screen',
  TOP_UP_SETTINGS_SCREEN = 'top_up_settings_screen',
}

export class Paywalls {
  private paywalls: Map<PaywallPlacement, AdaptyPaywall> = new Map()

  async getPaywallController(
    placement: PaywallPlacement
  ): Promise<ViewController> {
    const cachedPaywall = this.paywalls.get(placement)
    const paywall = cachedPaywall || (await adapty.getPaywall(placement))
    this.paywalls.set(placement, paywall)

    const view = await createPaywallView(paywall, { prefetchProducts: true })

    return view
  }

  async prepareAll() {
    await Promise.all(
      Object.values(PaywallPlacement).map((item) =>
        this.getPaywallController(item)
      )
    )
  }
}
