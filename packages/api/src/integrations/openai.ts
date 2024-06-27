import OpenAI from 'openai'
import { secrets } from '../config/secrets'
import { IOpenAiService } from '../types/integrations/openai'

export class OpenAIService implements IOpenAiService {
  private openAI: OpenAI

  constructor() {
    const apiKey = secrets.openAIApiKey.value()
    const organization = secrets.openAIOrg.value()

    this.openAI = new OpenAI({
      apiKey,
      organization,
    })
  }

  async generateImage(prompt: string, highQuality = false): Promise<string> {
    const result = await this.openAI.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      response_format: 'url',
      n: 1,
      quality: highQuality ? 'hd' : 'standard',
    })

    const imageUrl = result.data[0].url

    if (!imageUrl) {
      throw new Error('Images length is below 1')
    }

    return imageUrl
  }
}
