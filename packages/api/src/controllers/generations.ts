import {
  Controller,
  Post,
  Get,
  Path,
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
import { PopulatedGeneration } from '../types/generation'
import { GenerationService } from '../services/generation'
import { ServerError } from '../shared/ServerError'
import { wait } from '../utils/wait'
import { pubSubService } from '../integrations/pub_sub'

@Route('generations')
export class GenerationsController extends Controller {
  @Security('firebase')
  @Post()
  @SuccessResponse('201')
  @Response('206')
  public async createGeneration(
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
      await pubSubService.startGeneration(result.id)

      this.setStatus(201)
      return { data: { generation: result, userData: userManager.userData } }
    } catch (error) {
      await userManager.revertBackCredits()
      throw new ServerError('Not found', 404)
    }
  }

  @Security('firebase')
  @Get('{generationId}')
  @SuccessResponse('200')
  public async getGeneration(
    @Path('generationId') generationId: number,
    @Request() request: AuthenticatedRequest
  ): Promise<{ data: PopulatedGeneration }> {
    const { userId } = request

    const generation = new GenerationService(generationId)

    let generationInfo = await generation.getShortInfo()

    if (generationInfo === null || generationInfo.userId !== userId) {
      throw new ServerError('Not found', 404)
    }

    const startTime = Date.now()

    while (
      generationInfo &&
      generationInfo.status === 'processing' &&
      Date.now() - startTime < 40_000
    ) {
      await wait(2000)
      generationInfo = await generation.getShortInfo()
    }

    const generationData = await generation.getData()

    return { data: generationData }
  }
}
