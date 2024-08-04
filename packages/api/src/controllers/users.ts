import {
  Controller,
  Get,
  Patch,
  Route,
  Body,
  Path,
  Request,
  Security,
} from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { PopulatedUser } from '../types/user'
import { UserService } from '../services/user'
import { isValidUsername } from '../utils/isUserNameValid'
import { ServerError, StatusCode } from '../shared/ServerError'
import { UserManager } from '../managers/user'

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

  @Security('firebase')
  @Patch()
  public async updateUser(
    @Body() body: { userName: string },
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: true }> {
    const newUserName = body.userName.toLowerCase()

    if (!isValidUsername(newUserName)) {
      throw new ServerError(
        'Provided username is not valid',
        StatusCode.BAD_REQUEST
      )
    }

    await new UserService(request.userId).changeUserName(newUserName)

    return { success: true }
  }

  @Security('firebase')
  @Patch('avatar')
  public async updateUserAvatar(
    @Body() body: { filePath: string },
    @Request() request: AuthenticatedRequest
  ): Promise<{ success: true }> {
    await new UserManager(
      await new UserService(request.userId).getPopulated()
    ).updateAvatar(body.filePath)

    return { success: true }
  }
}
