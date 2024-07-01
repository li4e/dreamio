import { CreateInAppPurchaseDto, UpdateInAppPurchaseDto } from '@choco/db'
import { AdaptyNonSubscription } from '../../../types/adapty'
import { IDBInAppAdapter } from '../../../services/db_adapters'
import { Store } from 'packages/db/__generated/client'

class InAppPurchaseFromProfileTransformerStrict implements IDBInAppAdapter {
  private store: Store
  private originalTransactionId: string
  private transactionId: string
  private productId: string

  constructor(private inAppPurchase: AdaptyNonSubscription) {
    if (
      !inAppPurchase.store ||
      !inAppPurchase.vendor_original_transaction_id ||
      !inAppPurchase.vendor_transaction_id ||
      !inAppPurchase.vendor_product_id
    ) {
      throw new Error('In app purchase has required, but empty values')
    }

    this.store = inAppPurchase.store
    this.originalTransactionId = inAppPurchase.vendor_original_transaction_id
    this.transactionId = inAppPurchase.vendor_transaction_id
    this.productId = inAppPurchase.vendor_product_id
  }

  public getCreateData(): CreateInAppPurchaseDto {
    return {
      store: this.store,
      original_transaction_id: this.originalTransactionId,
      transaction_id: this.transactionId,
      product_id: this.productId,
      is_refunded: false,
      is_sandbox: this.inAppPurchase.is_sandbox,
      credits: this.credits,
    }
  }

  public getUpdateData(): UpdateInAppPurchaseDto {
    return { is_refunded: false }
  }

  private get credits() {
    // TODO: Upadate with a real data
    return 100
  }

  static isValid(inAppPurchase: AdaptyNonSubscription) {
    return (
      inAppPurchase.store &&
      inAppPurchase.vendor_original_transaction_id &&
      inAppPurchase.vendor_transaction_id &&
      inAppPurchase.vendor_product_id
    )
  }
}

export class InAppPurchaseFromProfileTransformer {
  static create(inAppPurchase: AdaptyNonSubscription): IDBInAppAdapter | null {
    if (InAppPurchaseFromProfileTransformerStrict.isValid(inAppPurchase)) {
      return new InAppPurchaseFromProfileTransformerStrict(inAppPurchase)
    }

    return null
  }
}
