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
import { OpenAIService } from '../integrations/openai'
import { UserManager } from '../managers/user'

interface RequestBody {
  prompt: string
}

@Route('generations')
export class GenerationsController extends Controller {
  @Security('firebase')
  @Post()
  @SuccessResponse('201')
  @Response('206')
  public async startGeneration(
    @Body() body: RequestBody,
    @Request() request: AuthenticatedRequest
  ): Promise<{ data: { imageUrl: string | null; userData: IUserData } }> {
    const { userId } = request

    const userManager = await UserManager.get(userId)

    await userManager.consumeCredits()
    if (!userManager.isConsumed) {
      this.setStatus(206)
      return { data: { userData: userManager.userData, imageUrl: null } }
    }

    try {
      const result = await new OpenAIService().generateImage(body.prompt)

      this.setStatus(201)
      return { data: { imageUrl: result, userData: userManager.userData } }
    } catch (error) {
      await userManager.revertBackCredits()
      throw error
    }
  }
}
