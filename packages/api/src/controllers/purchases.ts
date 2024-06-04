import { Controller, Get, Route, Request, Security } from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { IUserSettings } from '../types/client'
import { AdaptyService } from '../integrations/adapty'
import { AdaptyRestoreHandler } from '../handlers/adapty/AdaptyRestoreHandler'
import { UserModel } from '../models/UserModel'

@Route('purchases')
export class PurchasesController extends Controller {
  @Security('firebase')
  @Get('restore')
  public async getUser(
    @Request() req: AuthenticatedRequest
  ): Promise<{ data: IUserSettings }> {
    const adaptyProfile = await new AdaptyService().getProfile(req.user.id)

    const populatedUser = await new AdaptyRestoreHandler(
      adaptyProfile
    ).handleAngGetUser(req.user.id)
    const user = new UserModel(populatedUser)

    return { data: user.settings }
  }
}
