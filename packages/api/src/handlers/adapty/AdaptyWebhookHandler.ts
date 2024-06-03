import { AdaptyWebhookEvent } from '../../types/adapty'
import { InAppPurchaseEventTransformer } from './InAppPurchaseEventTransformer'
import { SubscriptionEventTransformer } from './SubscriptionEventTransformer'
import { dbClient } from '@choco/db'
import { isNonSubscriptionEvent } from './utils/isNonSubscriptionEvent'

export class AdaptyWebhookHandler {
  constructor(private event: AdaptyWebhookEvent) {}

  get isNonSubscription() {
    return isNonSubscriptionEvent(this.event.event_type)
  }

  async handle(): Promise<void> {
    if (this.isNonSubscription) {
      await this.savePurchase()
    } else {
      await this.saveSubscription()
    }
  }

  private async savePurchase() {
    const purchase = new InAppPurchaseEventTransformer(this.event)
    const createData = purchase.getCreateData()

    await dbClient.inAppPurchase.upsert({
      where: {
        store_original_transaction_id: {
          store: createData.store,
          original_transaction_id: createData.original_transaction_id,
        },
      },
      create: createData,
      update: purchase.getUpdateData(),
    })
  }

  private async saveSubscription() {
    const subscription = new SubscriptionEventTransformer(this.event)
    const createData = subscription.getСreateData()

    await dbClient.subscription.upsert({
      where: {
        store_original_transaction_id: {
          store: createData.store,
          original_transaction_id: createData.original_transaction_id,
        },
      },
      create: createData,
      update: subscription.getUpdateData(),
    })
  }
}
