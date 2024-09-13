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

    paywall.registerEventHandlers({
      onRestoreCompleted: (profile) => {
        if (profile.accessLevels?.premium?.isActive === true) {
          paywall.dismiss()
        }
        // TODO: Add global app level loader
        restoreMembership(this.accountStore)
      },
      onPurchaseCompleted: () => {
        paywall.dismiss()
        // TODO: Add global app level loader
        restoreMembership(this.accountStore)
      },
    })
    paywall.present()
  }
}
