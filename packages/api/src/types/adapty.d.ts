/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AdaptyProfile {
  profile_id: string // UUID
  customer_user_id?: string | null // Optional
  paid_access_levels: Record<string, AdaptyCustomerAccessLevel> | null
  subscriptions: Record<string, AdaptySubscription> | null
  non_subscriptions: Record<string, AdaptyNonSubscription[]> | null
  custom_attributes: Record<string, string | number> | null
  total_revenue_usd: number
}

export interface AdaptyCustomerAccessLevel {
  id: string
  is_active: boolean
  expires_at?: string | null // ISO 8601 date
  starts_at?: string | null // ISO 8601 date
  is_lifetime: boolean
  vendor_product_id?: string | null
  base_plan_id?: string | null
  store?: 'app_store' | 'play_store' | 'adapty' | null
  activated_at: string // ISO 8601 date
  renewed_at?: string | null // ISO 8601 date
  will_renew: boolean
  is_in_grace_period: boolean
  unsubscribed_at?: string | null // ISO 8601 date
  billing_issue_detected_at?: string | null // ISO 8601 date
  active_introductory_offer_type?:
    | 'free_trial'
    | 'pay_as_you_go'
    | 'pay_up_front'
    | null
  active_promotional_offer_type?:
    | 'free_trial'
    | 'pay_as_you_go'
    | 'pay_up_front'
    | null
}

export interface AdaptySubscription {
  is_active: boolean
  expires_at?: string | null // ISO 8601 date
  starts_at?: string | null // ISO 8601 date
  is_lifetime: boolean
  vendor_product_id?: string | null
  base_plan_id?: string | null
  vendor_transaction_id?: string | null
  vendor_original_transaction_id?: string | null
  store?: 'app_store' | 'play_store' | 'adapty' | null
  activated_at: string // ISO 8601 date
  renewed_at?: string | null // ISO 8601 date
  will_renew: boolean
  is_in_grace_period: boolean
  unsubscribed_at?: string | null // ISO 8601 date
  billing_issue_detected_at?: string | null // ISO 8601 date
  active_introductory_offer_type?:
    | 'free_trial'
    | 'pay_as_you_go'
    | 'pay_up_front'
    | null
  active_promotional_offer_type?:
    | 'free_trial'
    | 'pay_as_you_go'
    | 'pay_up_front'
    | null
  is_sandbox: boolean
}

export interface AdaptyNonSubscription {
  purchase_id: string
  vendor_product_id?: string | null
  vendor_transaction_id?: string | null
  vendor_original_transaction_id?: string | null
  store?: 'app_store' | 'play_store' | 'adapty' | null
  purchased_at: string // ISO 8601 date
  is_one_time: boolean
  is_sandbox: boolean
}

// Основной интерфейс для события вебхука Adapty
export interface AdaptyWebhookEvent {
  profile_id: string
  customer_user_id?: string
  idfv: string
  idfa: string
  advertising_id: string
  profile_install_datetime: string
  user_agent: string
  email?: string
  event_type: AdaptyEventType
  event_datetime: string
  event_properties: AdaptyEventProperties
  event_api_version: number
  attributions?: Record<string, any>
  user_attributes?: Record<string, any>
  integration_ids?: Record<string, string>
}

// Interface for Adapty Event Properties
export interface AdaptyEventProperties {
  transaction_id: string // Unique identifier for a transaction
  original_transaction_id: string // Transaction identifier of the original purchase
  purchase_date: string // Date and time of product purchase (ISO 8601)
  original_purchase_date: string // Date and time of the original purchase (ISO 8601)
  environment: string // Can be Sandbox or Production
  vendor_product_id: string // Product ID in the Apple App Store, Google Play Store, or Stripe
  base_plan_id?: string
  event_datetime: string // Date and time of the event (ISO 8601)
  store: 'app_store' | 'play_store' | 'adapty' // Can be app_store or play_store
  is_active?: boolean
  will_renew?: boolean
  is_lifetime?: boolean
  is_refund?: boolean
  is_in_grace_period?: boolean
}

// Возможные типы событий Adapty
export type AdaptyEventType =
  | 'subscription_started'
  | 'subscription_renewed'
  | 'subscription_expired'
  | 'trial_started'
  | 'trial_converted'
  | 'trial_expired'
  | 'billing_issue_detected'
  | 'entered_grace_period'
  | 'trial_renewal_cancelled'
  | 'trial_renewal_reactivated'
  | 'subscription_renewal_cancelled'
  | 'subscription_renewal_reactivated'
  | 'subscription_refunded'
  | 'non_subscription_purchase'
  | 'non_subscription_purchase_refunded'
  | 'subscription_paused'
// | 'subscription_deferred'
// | 'access_level_updated'
