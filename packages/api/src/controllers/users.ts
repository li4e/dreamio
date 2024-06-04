import { Controller, Get, Route, Path, Request, Security } from 'tsoa'
import { AuthenticatedRequest } from '../types/express'

@Route('users')
export class UsersController extends Controller {
  @Security('firebase')
  @Get('{userId}')
  public async getUser(
    @Path('userId') userIdFromPath: string,
    @Request() request: AuthenticatedRequest
  ): Promise<{ data: { userId: number; userIdFromPath: string } }> {
    return { data: { userId: request.user.id, userIdFromPath } }
  }
}
