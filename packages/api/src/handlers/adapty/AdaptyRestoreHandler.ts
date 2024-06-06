import { AdaptyProfile } from '../../types/adapty'
import { InAppPurchaseFromProfileTransformer } from './transformers/InAppPurchaseFromProfileTransformer'
import { SubscriptionFromProfileTransformer } from './transformers/SubscriptionFromProfileTransformer'
import { SubscriptionsService } from '../../services/subscriptions'
import { InAppPurchasesService } from '../../services/in_app_purchases'
import { UserService } from '../../services/user'
import { PopulatedUser } from '../../types/user'

export class AdaptyRestoreHandler {
  constructor(private userProfile: AdaptyProfile) {}

  public async handleAngGetUser(userId: number): Promise<PopulatedUser> {
    const promises: Promise<{
      type: 'inApp' | 'subscription'
      id: number
    }>[] = []

    if (this.userProfile.subscriptions) {
      for (const subscription of Object.values(
        this.userProfile.subscriptions
      )) {
        const dataTransformer =
          SubscriptionFromProfileTransformer.create(subscription)

        if (dataTransformer) {
          promises.push(
            new SubscriptionsService().save(dataTransformer).then((id) => ({
              type: 'subscription',
              id,
            }))
          )
        }
      }
    }

    if (this.userProfile.non_subscriptions) {
      for (const inApps of Object.values(this.userProfile.non_subscriptions)) {
        for (const inApp of inApps) {
          const dataTransformer =
            InAppPurchaseFromProfileTransformer.create(inApp)

          if (dataTransformer) {
            promises.push(
              new InAppPurchasesService().save(dataTransformer).then((id) => ({
                type: 'inApp',
                id,
              }))
            )
          }
        }
      }
    }

    const savingResults = await Promise.all(promises)

    return new UserService(userId).assignPurchases(savingResults)
  }
}
