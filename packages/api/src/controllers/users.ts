import { Controller, Get, Route, Path, Request, Security } from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { PopulatedUser } from '../types/user'
import { UserService } from '../services/user'

@Route('users')
export class UsersController extends Controller {
  @Security('firebase')
  @Get()
  public async getCurrentUser(
    @Request() request: AuthenticatedRequest
  ): Promise<{ user: PopulatedUser }> {
    const user = await new UserService(request.userId).getPopulated()
    return { user }
  }

  @Security('firebase')
  @Get('{userId}')
  public async getUser(
    @Path('userId') userIdFromPath: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ profile: { userId: number; userIdFromPath: number } }> {
    return { profile: { userId: request.userId, userIdFromPath } }
  }
}
