import { AdaptyProfile } from '../../../types/adapty'

export class AdaptyService {
  async getProfile(firebaseUID: string): Promise<AdaptyProfile> {
    return {
      profile_id: '1',
      customer_user_id: firebaseUID,
      paid_access_levels: null,
      subscriptions: null,
      non_subscriptions: null,
      custom_attributes: null,
      total_revenue_usd: 0,
    }
  }
}
