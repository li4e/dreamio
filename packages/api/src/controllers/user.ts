import userService from '../services/users'
import { Controller, Get, Route, Path } from 'tsoa'
import { UserDto } from '@choco/db'

@Route('users')
export class UserController extends Controller {
  @Get('{userId}')
  public async getUser(@Path() userId: string): Promise<UserDto> {
    return await userService.getUserByFirebaseId(userId)
  }
}
