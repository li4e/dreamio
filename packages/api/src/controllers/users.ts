import { Controller, Get, Route, Path, Request, Security } from 'tsoa'
import { AuthenticatedRequest } from '../types/express'

@Route('users')
export class UsersController extends Controller {
  @Security('firebase')
  @Get('{userId}')
  public async getUser(
    @Path('userId') userIdFromPath: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ profile: { userId: number; userIdFromPath: number } }> {
    return { profile: { userId: request.userId, userIdFromPath } }
  }
}
