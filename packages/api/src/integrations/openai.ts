import OpenAI from 'openai'
import { secrets } from '../config/secrets'

export class OpenAIService {
  private openAI: OpenAI

  constructor() {
    const apiKey = secrets.openAIApiKey.value()
    const organization = secrets.openAIOrg.value()

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
