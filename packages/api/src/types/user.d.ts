import { InAppPurchaseDto, SubscriptionDto, UserDto } from '@choco/db'

export type PopulatedUser = UserDto & {
  subscriptions: SubscriptionDto[]
  inAppPurchases: InAppPurchaseDto[]
}
