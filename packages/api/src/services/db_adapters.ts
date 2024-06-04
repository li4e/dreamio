import {
  CreateInAppPurchaseDto,
  CreateSubscriptionDto,
  UpdateInAppPurchaseDto,
  UpdateSubscriptionDto,
} from '@choco/db'

export interface IDBSubscriptionAdapter {
  getCreateData(): CreateSubscriptionDto
  getUpdateData(transactionId: string): UpdateSubscriptionDto
}

export interface IDBInAppAdapter {
  getCreateData(): CreateInAppPurchaseDto
  getUpdateData(): UpdateInAppPurchaseDto
}
