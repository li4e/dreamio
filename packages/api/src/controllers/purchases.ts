import { Controller, Get, Route, Request, Security } from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { IUserPremiumInfo } from '../types/client'
import { AdaptyService } from '../integrations/adapty'
import { AdaptyRestoreHandler } from '../handlers/adapty/AdaptyRestoreHandler'
import { UserModel } from '../models/UserModel'

@Route('purchases')
export class PurchasesController extends Controller {
  @Security('firebase')
  @Get('restore')
  public async restoreUserMembership(
    @Request() req: AuthenticatedRequest
  ): Promise<{ membership: IUserPremiumInfo }> {
    const adaptyProfile = await new AdaptyService().getProfile(req.userId)

    const userWithRestoredPuchases = await new AdaptyRestoreHandler(
      adaptyProfile
    ).handleAngGetUser(req.userId)
    const user = new UserModel(userWithRestoredPuchases)

    return { membership: user.premiumInfo }
  }
}
