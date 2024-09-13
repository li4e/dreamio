import { AdaptyProfile } from '../../types/adapty'
import { InAppPurchaseFromProfileTransformer } from './transformers/InAppPurchaseFromProfileTransformer'
import { SubscriptionFromProfileTransformer } from './transformers/SubscriptionFromProfileTransformer'
import { SubscriptionService } from '../../services/subscription'
import { InAppPurchaseService } from '../../services/in_app_purchase'
import { UserService } from '../../services/user'
import { PopulatedUser } from '../../types/user'
import { tokensByProduct } from '../../shared/tokensByProduct'

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
        const dataTransformer = SubscriptionFromProfileTransformer.create(
          subscription,
          tokensByProduct
        )

        if (dataTransformer) {
          promises.push(
            SubscriptionService.save(dataTransformer).then((id) => ({
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
          const dataTransformer = InAppPurchaseFromProfileTransformer.create(
            inApp,
            tokensByProduct
          )

          if (dataTransformer) {
            promises.push(
              InAppPurchaseService.save(dataTransformer).then((id) => ({
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
