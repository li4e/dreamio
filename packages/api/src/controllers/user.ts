import { Controller, Get, Route, Path, Request, Security } from 'tsoa'
import { UserDto } from '@choco/db'
import { AuthenticatedRequest } from '../types/express'

@Route('users')
export class UserController extends Controller {
  @Security('firebase')
  @Get('{userId}')
  public async getUser(
    @Path() userId: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ data: UserDto }> {
    return { data: req.user }
  }
}
