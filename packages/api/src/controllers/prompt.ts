import { Controller, Get, Route, Security } from 'tsoa'
import { wait } from '../utils/wait'

@Route('prompt')
export class PromtController extends Controller {
  @Security('firebase')
  @Get()
  public async generatePrompt(): Promise<{
    prompt: string
  }> {
    await wait(2000)
    return {
      prompt:
        'A vibrant sunset over a tranquil lake, surrounded by pine trees. The sky is ablaze with pink, orange, and purple hues, reflecting on the calm waters. A small wooden dock and a rowboat add to the peaceful scene, with a soft mist rising from the water, creating a magical, serene atmosphere.',
    }
  }
}
