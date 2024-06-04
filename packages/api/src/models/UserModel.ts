import { IUserSettings } from '../types/client'
import { PopulatedUser } from '../types/user'

export class UserModel {
  constructor(private user: PopulatedUser) {}

  get settings(): IUserSettings {
    return {
      id: this.user.id,
      credits: this.credits,
      hasPremium: this.hasPremium,
    }
  }

  get credits() {
    return (
      this.user.freeCredits +
      this.user.subscriptions
        .filter((sub) => sub.is_active)
        .reduce((total, sub) => total + sub.credits, 0) +
      this.user.inAppPurchases
        .filter((inApp) => !inApp.is_refunded)
        .reduce((total, inApp) => total + inApp.credits, 0)
    )
  }

  get hasPremium() {
    return this.user.subscriptions.findIndex((sub) => sub.is_active) !== -1
  }
}
