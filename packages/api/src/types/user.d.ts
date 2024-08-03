import { InAppPurchaseDto, SubscriptionDto, UserDto } from '@choco/db'

export type PopulatedUser = Omit<UserDto, 'firebaseId'> & {
  subscriptions: SubscriptionDto[]
  inAppPurchases: InAppPurchaseDto[]
}
