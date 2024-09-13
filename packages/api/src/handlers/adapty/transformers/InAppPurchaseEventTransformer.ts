import { AdaptyWebhookEvent } from '../../../types/adapty'
import { CreateInAppPurchaseDto, UpdateInAppPurchaseDto } from '@choco/db'
import { isNonSubscriptionEvent } from '../utils/isNonSubscriptionEvent'
import { IDBInAppAdapter } from '../../../services/db_adapters'
import { TokensByProductMapper } from './TokensByProduct'

export class InAppPurchaseEventTransformer implements IDBInAppAdapter {
  constructor(
    private event: AdaptyWebhookEvent,
    private tokensByProduct: TokensByProductMapper
  ) {
    if (!isNonSubscriptionEvent(event.event_type)) {
      throw Error('Provided event has a subscription type')
    }
  }

  public getCreateData(): CreateInAppPurchaseDto {
    return {
      product_id: this.event.event_properties.vendor_product_id,
      transaction_id: this.event.event_properties.transaction_id,
      original_transaction_id:
        this.event.event_properties.original_transaction_id,
      store: this.event.event_properties.store,
      is_refunded: this.isRefunded,
      is_sandbox: this.isSandbox,
      credits: this.credits,
    }
  }

  public getUpdateData(): UpdateInAppPurchaseDto {
    return {
      is_refunded: this.isRefunded,
      transaction_id: this.event.event_properties.transaction_id,
    }
  }

  private get isRefunded() {
    return this.event.event_type === 'subscription_refunded'
  }

  private get isSandbox() {
    return this.event.event_properties.environment === 'Sandbox'
  }

  private get credits() {
    return this.tokensByProduct(this.event.event_properties.vendor_product_id)
  }
}
