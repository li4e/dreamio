import { CreateSubscriptionDto, UpdateSubscriptionDto } from '@choco/db'
import { AdaptyWebhookEvent } from '../../../types/adapty'
import { isNonSubscriptionEvent } from '../utils/isNonSubscriptionEvent'
import { IDBSubscriptionAdapter } from '../../../services/db_adapters'

export class SubscriptionEventTransformer implements IDBSubscriptionAdapter {
  constructor(private event: AdaptyWebhookEvent) {
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
    return [
      'entered_grace_period',
      'subscription_renewal_cancelled',
      'subscription_renewal_reactivated',
      'subscription_renewed',
      'subscription_started',
      'trial_converted',
      'trial_renewal_cancelled',
      'trial_renewal_reactivated',
      'trial_started',
    ].includes(this.event.event_type)
  }

  private get willRenew() {
    return [
      'subscription_renewal_reactivated',
      'subscription_renewed',
      'subscription_started',
      'trial_converted',
      'trial_renewal_reactivated',
      'trial_started',
    ].includes(this.event.event_type)
  }

  private get isInTrial() {
    return [
      'trial_started',
      'trial_renewal_reactivated',
      'trial_renewal_cancelled',
    ].includes(this.event.event_type)
  }

  private get isInGracePeriod() {
    return ['entered_grace_period'].includes(this.event.event_type)
  }

  public get shouldTopUpBalance() {
    return [
      'trial_started',
      'subscription_started',
      'subscription_renewed',
    ].includes(this.event.event_type)
  }

  private get changeIsActive() {
    return [
      'subscription_refunded',
      'subscription_paused',
      'subscription_expired',
      'subscription_started',
      'trial_expired',
      'trial_started',
    ].includes(this.event.event_type)
  }

  private get changeIsInGracePeriod() {
    return [
      'entered_grace_period',
      'subscription_expired',
      'subscription_paused',
      'subscription_refunded',
      'subscription_renewed',
    ].includes(this.event.event_type)
  }

  private get chnageWillRenew() {
    return [
      'trial_renewal_cancelled',
      'trial_renewal_reactivated',
      'subscription_renewal_reactivated',
      'subscription_renewal_cancelled',
      'subscription_renewed',
      'subscription_expired',
    ].includes(this.event.event_type)
  }

  private get changeIsInTrial() {
    return ['trial_started', 'trial_expired', 'trial_converted'].includes(
      this.event.event_type
    )
  }

  private get isSandbox() {
    return this.event.event_properties.environment === 'Sandbox'
  }

  private get credits() {
    // TODO: Change for a real data
    return this.isActive ? 100 : 0
  }
}
