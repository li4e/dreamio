import {
  Controller,
  Post,
  Body,
  Route,
  Request,
  Security,
  SuccessResponse,
  Response,
} from 'tsoa'
import { AuthenticatedRequest } from '../types/express'
import { IUserData } from '../types/client'
import { UserManager } from '../managers/user'
import { GenerationDto } from '@choco/db'
import { StartGenerationBody } from '../types/controllers/generation'
import { GenerationsManager } from '../managers/generation'

@Route('generations')
export class GenerationsController extends Controller {
  @Security('firebase')
  @Post()
  @SuccessResponse('201')
  @Response('206')
  public async startGeneration(
    @Body() body: StartGenerationBody,
    @Request() request: AuthenticatedRequest
  ): Promise<{
    data: { generation: GenerationDto | null; userData: IUserData }
  }> {
    const { userId } = request

    const userManager = await UserManager.get(userId)

    await userManager.consumeCredits()
    if (!userManager.isConsumed) {
      this.setStatus(206)
      return { data: { userData: userManager.userData, generation: null } }
    }

    try {
      const result = await new GenerationsManager(body, userId).create()

      this.setStatus(201)
      return { data: { generation: result, userData: userManager.userData } }
    } catch (error) {
      await userManager.revertBackCredits()
      throw error
    }
  }
}
