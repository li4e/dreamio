import { AdaptyEventType } from '../../../types/adapty'

export function isNonSubscriptionEvent(eventType: AdaptyEventType) {
  return [
    'non_subscription_purchase',
    'non_subscription_purchase_refunded',
  ].includes(eventType)
}
