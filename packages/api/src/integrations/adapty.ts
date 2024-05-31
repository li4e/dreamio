import axios from 'axios'
import { adaptyApiKey } from '../config/secrets'
import { AdaptyProfile } from '../types/adapty'

export class AdaptyService {
  private readonly baseURL = 'https://api.adapty.io/api/v1/sdk'
  private readonly apiKey: string
  constructor() {
    this.apiKey = adaptyApiKey.value()
  }

  getProfile(firebaseUID: string): Promise<AdaptyProfile> {
    return axios
      .get<{ data: AdaptyProfile }>(
        `${this.baseURL}/profiles/${firebaseUID}/`,
        {
          headers: {
            Authorization: `Api-Key ${this.apiKey}`,
          },
        }
      )
      .then((res) => res.data.data)
  }
}
