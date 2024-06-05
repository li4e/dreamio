import { AdaptyProfile } from '../../../types/adapty'
import adaptyMockedData from '../data/adapty'

export class AdaptyService {
  async getProfile(userId: number): Promise<AdaptyProfile> {
    return adaptyMockedData.profile
  }
}
