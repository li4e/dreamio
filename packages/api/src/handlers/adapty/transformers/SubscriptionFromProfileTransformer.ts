import {
  CreateSubscriptionDto,
  SubscriptionDto,
  UpdateSubscriptionDto,
} from '@choco/db'
import { AdaptySubscription } from '../../../types/adapty'
import { IDBSubscriptionAdapter } from '../../../services/db_adapters'
import { TokensByProductMapper } from './TokensByProduct'

class SubscriptionFromProfileTransformerStrict
  implements IDBSubscriptionAdapter
{
  private store: SubscriptionDto['store']
  private originalTransactionId: string
  private transactionId: string
  private productId: string

  constructor(
    private subscription: AdaptySubscription,
    private tokensByProduct: TokensByProductMapper
  ) {
    if (
      !subscription.store ||
      !subscription.vendor_original_transaction_id ||
      !subscription.vendor_transaction_id ||
      !subscription.vendor_product_id
    ) {
      throw new Error('')
    }

    this.store = subscription.store
    this.transactionId = subscription.vendor_transaction_id
    this.originalTransactionId = subscription.vendor_original_transaction_id
    this.productId = subscription.vendor_product_id
  }

  public getCreateData(): CreateSubscriptionDto {
    return {
      store: this.store,
      original_transaction_id: this.originalTransactionId,
      transaction_id: this.transactionId,
      product_id: this.productId,
      base_plan_id: this.subscription.base_plan_id,
      is_active: this.subscription.is_active,
      will_renew: this.subscription.will_renew,
      is_in_grace_period: this.subscription.is_in_grace_period,
      is_lifetime: this.subscription.is_lifetime,
      is_sandbox: this.subscription.is_sandbox,
      is_in_trial:
        this.subscription.active_promotional_offer_type === 'free_trial',
      credits: this.credits,
    }
  }

  public getUpdateData(existedTransactionId: string): UpdateSubscriptionDto {
    const createData = this.getCreateData()

    const { credits, ...rest } = createData

    return {
      ...rest,
      ...(rest.is_active &&
        rest.transaction_id !== existedTransactionId && {
          credits,
        }),
    }
  }

  private get credits() {
    return this.tokensByProduct(this.productId)
  }

  static isValid(subscription: AdaptySubscription) {
    return (
      subscription.store &&
      subscription.vendor_original_transaction_id &&
      subscription.vendor_transaction_id &&
      subscription.vendor_product_id
    )
  }
}

export class SubscriptionFromProfileTransformer {
  static create(
    subscription: AdaptySubscription,
    tokensByProduct: TokensByProductMapper
  ): IDBSubscriptionAdapter | null {
    if (SubscriptionFromProfileTransformerStrict.isValid(subscription)) {
      return new SubscriptionFromProfileTransformerStrict(
        subscription,
        tokensByProduct
      )
    }

    return null
  }
}
