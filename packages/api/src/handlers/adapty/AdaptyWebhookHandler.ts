import { AdaptyWebhookEvent } from '../../types/adapty'
import { InAppPurchaseEventTransformer } from './transformers/InAppPurchaseEventTransformer'
import { SubscriptionEventTransformer } from './transformers/SubscriptionEventTransformer'
import { isNonSubscriptionEvent } from './utils/isNonSubscriptionEvent'
import { SubscriptionService } from '../../services/subscription'
import { InAppPurchaseService } from '../../services/in_app_purchase'

export class AdaptyWebhookHandler {
  constructor(private event: AdaptyWebhookEvent) {}

  private get isNonSubscription() {
    return isNonSubscriptionEvent(this.event.event_type)
  }

  public async handle(): Promise<void> {
    if (this.isNonSubscription) {
      await InAppPurchaseService.save(
        new InAppPurchaseEventTransformer(this.event)
      )
    } else {
      await SubscriptionService.save(
        new SubscriptionEventTransformer(this.event)
      )
    }
  }
}
