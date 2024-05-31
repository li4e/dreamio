import OpenAI from 'openai'
import { openaiOrganization, openaiToken } from '../config/secrets'

export class OpenAIService {
  private openAI: OpenAI

  constructor() {
    const apiKey = openaiToken.value()
    const organization = openaiOrganization.value()

    this.openAI = new OpenAI({
      apiKey,
      organization,
    })
  }

  generateImage(prompt: string): string {
    // Do something and return image

    return ''
  }
}
