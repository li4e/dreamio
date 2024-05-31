import OpenAI from 'openai'
import { openaiOrganization, openaiApiKey } from '../config/secrets'

export class OpenAIService {
  private openAI: OpenAI

  constructor() {
    const apiKey = openaiApiKey.value()
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
