import {
  AdaptyProfile,
  AdaptySubscription,
  AdaptyWebhookEvent,
} from '../../../types/adapty'

const subscription: AdaptySubscription = {
  is_active: true,
  is_lifetime: false,
  vendor_product_id: 'premium_weekly',
  vendor_transaction_id: '1',
  vendor_original_transaction_id: '1',
  store: 'app_store',
  activated_at: '2024-05-18T01:00:00.000000+0000',
  will_renew: true,
  is_in_grace_period: true,
  is_sandbox: true,
}

const profile: AdaptyProfile = {
  profile_id: 'adapty_id_1',
  customer_user_id: '1',
  paid_access_levels: null,
  subscriptions: { premium: subscription },
  non_subscriptions: null,
  custom_attributes: null,
  total_revenue_usd: 0,
}

const webhookEvent: AdaptyWebhookEvent = {
  idfa: '',
  idfv: 'some_id',
  event_type: 'subscription_renewed',
  profile_id: 'adapty_id_1',
  user_agent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  advertising_id: '',
  event_datetime: '2024-05-18T01:00:00.000000+0000',
  customer_user_id: '1',
  event_properties: {
    store: 'app_store',
    environment: 'Sandbox',
    purchase_date: '2024-05-18T01:00:00.000000+0000',
    event_datetime: '2024-05-18T01:00:00.000000+0000',
    transaction_id: '2000000615102792',
    vendor_product_id: 'premium_weekly',
    original_purchase_date: '2024-05-18T01:00:00.000000+0000',
    original_transaction_id: '2000000602543560',
  },
  event_api_version: 1,
  profile_install_datetime: '2024-05-18T01:00:00.000000+0000',
}

export default {
  subscription,
  profile,
  webhookEvent,
}
