import { CreateSubscriptionDto, UpdateSubscriptionDto } from '@choco/db'
import { AdaptyEventType, AdaptyWebhookEvent } from '../../../types/adapty'
import { isNonSubscriptionEvent } from '../utils/isNonSubscriptionEvent'
import { IDBSubscriptionAdapter } from '../../../services/db_adapters'
import { TokensByProductMapper } from './TokensByProduct'

export class SubscriptionEventTransformer implements IDBSubscriptionAdapter {
  constructor(
    private event: AdaptyWebhookEvent,
    private tokensByProduct: TokensByProductMapper
  ) {
    if (isNonSubscriptionEvent(event.event_type)) {
      throw Error('Provided event has a non_subscription type')
    }
  }

  public getCreateData(): CreateSubscriptionDto {
    return {
      is_active: this.isActive,
      will_renew: this.willRenew,
      is_in_grace_period: this.isInGracePeriod,
      is_in_trial: this.isInTrial,
      is_lifetime: this.event.event_properties.is_lifetime ?? false,
      is_sandbox: this.isSandbox,
      original_transaction_id:
        this.event.event_properties.original_transaction_id,
      transaction_id: this.event.event_properties.transaction_id,
      product_id: this.event.event_properties.vendor_product_id,
      store: this.event.event_properties.store,
      credits: this.credits,
    }
  }

  public getUpdateData(existedTransactionId: string): UpdateSubscriptionDto {
    const isSameTransaction =
      this.event.event_properties.transaction_id === existedTransactionId

    return {
      ...(this.changeIsActive && { is_active: this.isActive }),
      ...(this.chnageWillRenew && { will_renew: this.willRenew }),
      ...(this.changeIsInGracePeriod && {
        is_in_grace_period: this.isInGracePeriod,
      }),
      ...(this.changeIsInTrial && {
        is_in_trial: this.isInTrial,
      }),
      ...(this.shouldTopUpBalance &&
        !isSameTransaction && {
          credits: this.credits,
        }),
    }
  }

  private get isActive() {
    const events: AdaptyEventType[] = [
      'entered_grace_period',
      'subscription_renewal_cancelled',
      'subscription_renewal_reactivated',
      'subscription_renewed',
      'subscription_started',
      'trial_converted',
      'trial_renewal_cancelled',
      'trial_renewal_reactivated',
      'trial_started',
    ]

    return events.includes(this.event.event_type)
  }

  private get willRenew() {
    const events: AdaptyEventType[] = [
      'subscription_renewal_reactivated',
      'subscription_renewed',
      'subscription_started',
      'trial_converted',
      'trial_renewal_reactivated',
      'trial_started',
    ]

    return events.includes(this.event.event_type)
  }

  private get isInTrial() {
    const events: AdaptyEventType[] = [
      'trial_started',
      'trial_renewal_reactivated',
      'trial_renewal_cancelled',
    ]

    return events.includes(this.event.event_type)
  }

  private get isInGracePeriod() {
    const events: AdaptyEventType[] = ['entered_grace_period']

    return events.includes(this.event.event_type)
  }

  public get shouldTopUpBalance() {
    const events: AdaptyEventType[] = [
      'trial_started',
      'subscription_started',
      'subscription_renewed',
    ]

    return events.includes(this.event.event_type)
  }

  private get changeIsActive() {
    const events: AdaptyEventType[] = [
      'billing_issue_detected',
      'subscription_refunded',
      'subscription_paused',
      'subscription_expired',
      'subscription_started',
      'trial_expired',
      'trial_started',
    ]

    return events.includes(this.event.event_type)
  }

  private get changeIsInGracePeriod() {
    const events: AdaptyEventType[] = [
      'entered_grace_period',
      'subscription_expired',
      'subscription_paused',
      'subscription_refunded',
      'subscription_renewed',
    ]

    return events.includes(this.event.event_type)
  }

  private get chnageWillRenew() {
    const events: AdaptyEventType[] = [
      'billing_issue_detected',
      'trial_renewal_cancelled',
      'trial_renewal_reactivated',
      'subscription_renewal_reactivated',
      'subscription_renewal_cancelled',
      'subscription_renewed',
      'subscription_expired',
    ]

    return events.includes(this.event.event_type)
  }

  private get changeIsInTrial() {
    const events: AdaptyEventType[] = [
      'billing_issue_detected',
      'trial_started',
      'trial_expired',
      'trial_converted',
    ]

    return events.includes(this.event.event_type)
  }

  private get isSandbox() {
    return this.event.event_properties.environment === 'Sandbox'
  }

  private get credits() {
    return this.tokensByProduct(this.event.event_properties.vendor_product_id)
  }
}
