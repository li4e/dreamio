import { PopulatedUser } from '../types/user'
import { InAppPurchaseService } from '../services/in_app_purchase'
import { SubscriptionService } from '../services/subscription'
import { UserService } from '../services/user'

type RevertBackFunction = () => Promise<void>

export class CreditManager {
  private revertBackFunction: null | RevertBackFunction = null

  constructor(private user: PopulatedUser) {}

  public async consume(): Promise<boolean> {
    const user = new UserService(this.user.id)
    const userCredits = await user.consumeFreeCredits()

    if (userCredits !== null) {
      this.revertBackFunction = async () => {
        await user.incrementFreeCredits()
      }

      return true
    }

    const activeSubscription = this.user.subscriptions.find(
      (item) => item.is_active
    )

    if (activeSubscription) {
      const subscription = new SubscriptionService(activeSubscription.id)
      const subscriptionCredits = await subscription.consumeCredits()

      if (subscriptionCredits !== null) {
        this.revertBackFunction = async () => {
          await subscription.incrementCredits()
        }
        return true
      }
    }

    const activeInApp = this.user.inAppPurchases.find(
      (item) => !item.is_refunded && item.credits > 0
    )

    if (activeInApp) {
      const inApp = new InAppPurchaseService(activeInApp.id)
      const inAppCredits = await inApp.consumeCredits()

      if (inAppCredits !== null) {
        this.revertBackFunction = async () => {
          await inApp.incrementCredits()
        }
        return true
      }
    }

    return false
  }

  public async revertBack() {
    if (this.revertBackFunction) {
      await this.revertBackFunction()
    }
  }
}
