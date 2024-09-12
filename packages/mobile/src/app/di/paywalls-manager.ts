import { AccountStore, restoreMembership } from 'shared/auth/AccountStore'
import { Paywalls, PaywallPlacement } from 'shared/lib/adapty'

export class PaywallsManager {
  private paywalls = new Paywalls()
  constructor(private accountStore: AccountStore) {}

  async initialize() {
    await this.paywalls.prepareAll()
  }

  showPaywall = async (placement: PaywallPlacement) => {
    const paywall = await this.paywalls.getPaywallController(placement)
    const update = async () => {
      await restoreMembership(this.accountStore)
      paywall.dismiss()
    }
    paywall.registerEventHandlers({
      onRestoreCompleted: () => {
        update()
      },
      onPurchaseCompleted: () => {
        update()
      },
    })
    paywall.present()
  }
}
