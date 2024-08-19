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
        "A breathtaking sunset over a serene lake surrounded by tall pine trees. The sky is painted with shades of pink, orange, and purple, reflecting off the calm waters. In the foreground, there's a small wooden dock extending into the lake, with a rowboat gently tied to it. Soft mist rises from the water, adding a magical and tranquil atmosphere. The scene is peaceful, with warm, golden light filtering through the trees and casting long shadows across the landscape.",
    }
  }
}
