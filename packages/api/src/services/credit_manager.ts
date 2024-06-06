import { PopulatedUser } from '../types/user'
import { InAppPurchaseService } from './in_app_purchase'
import { SubscriptionService } from './subscription'
import { UserService } from './user'

type RevertBackFunction = () => Promise<void>

export class CreditManager {
  private populatedUser: PopulatedUser | null
  private revertBackFunction: null | RevertBackFunction = null

  constructor(
    private userId: number,
    populatedUser?: PopulatedUser
  ) {
    this.populatedUser = populatedUser ?? null
  }

  public async consume(): Promise<RevertBackFunction | null> {
    const user = new UserService(this.userId)
    const userCredits = await user.consumeFreeCredits()

    if (!this.populatedUser) {
      this.populatedUser = await new UserService(this.userId).getPopulated()
    }

    if (userCredits !== null) {
      this.revertBackFunction = async () => {
        await user.incrementFreeCredits()
      }

      return this.revertBackFunction
    }

    const activeSubscription = this.populatedUser.subscriptions.find(
      (item) => item.is_active
    )

    if (activeSubscription) {
      const subscription = new SubscriptionService(activeSubscription.id)
      const subscriptionCredits = await subscription.consumeCredits()

      if (subscriptionCredits !== null) {
        this.revertBackFunction = async () => {
          await subscription.incrementCredits()
        }
        return this.revertBackFunction
      }
    }

    const activeInApp = this.populatedUser.inAppPurchases.find(
      (item) => !item.is_refunded && item.credits > 0
    )

    if (activeInApp) {
      const inApp = new InAppPurchaseService(activeInApp.id)
      const inAppCredits = await inApp.consumeCredits()

      if (inAppCredits !== null) {
        this.revertBackFunction = async () => {
          await inApp.incrementCredits()
        }
        return this.revertBackFunction
      }
    }

    return null
  }

  public async revertBack() {
    if (this.revertBackFunction) {
      await this.revertBackFunction()
    }
  }
}
