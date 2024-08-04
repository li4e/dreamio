import { CloudStorage } from '../integrations/storage'
import { UserModel } from '../models/UserModel'
import { UserService } from '../services/user'
import { IUserData } from '../types/client'
import { PopulatedUser } from '../types/user'
import { CreditManager } from './credit'

export class UserManager {
  private creditManager: CreditManager
  private _isConsumed = false

  constructor(private user: PopulatedUser) {
    this.creditManager = new CreditManager(user)
  }

  public async consumeCredits() {
    this._isConsumed = await this.creditManager.consume()
    return this._isConsumed
  }

  public async revertBackCredits() {
    if (this._isConsumed) {
      await this.creditManager.revertBack()
      this._isConsumed = false
    }
  }

  public get isConsumed() {
    return this._isConsumed
  }

  public get userData(): IUserData {
    const user = new UserModel(this.user)
    return {
      ...user.data,
      credits: user.data.credits - (this._isConsumed ? 1 : 0),
    }
  }

  public static async get(userId: number) {
    return new UserManager(await new UserService(userId).getPopulated())
  }

  public async updateAvatar(tempFileName: string) {
    const oldAvatarPath = this.user.avatarFilePath

    const file = await new CloudStorage().saveUserAvatar(
      this.user.id,
      tempFileName
    )

    await new UserService(this.user.id).updateAvatar(file.imageData)

    if (oldAvatarPath) {
      await new CloudStorage().deleteFile(oldAvatarPath)
    }
  }
}
