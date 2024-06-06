import { UserModel } from '../models/UserModel'
import { UserService } from '../services/user'
import { IUserData } from '../types/client'
import { PopulatedUser } from '../types/user'
import { CreditManager } from './credit'

export class UserManager {
  private creditManager: CreditManager
  private consumed = false

  constructor(private user: PopulatedUser) {
    this.creditManager = new CreditManager(user)
  }

  async consumeCredits() {
    this.consumed = await this.creditManager.consume()
  }

  async revertBackCredits() {
    if (this.consumed) {
      await this.creditManager.revertBack()
      this.consumed = false
    }
  }

  get userData(): IUserData {
    const user = new UserModel(this.user)
    return {
      ...user.data,
      credits: user.data.credits - (this.consumed ? 1 : 0),
    }
  }

  public static async get(userId: number) {
    return await new UserService(userId).getPopulated()
  }
}
