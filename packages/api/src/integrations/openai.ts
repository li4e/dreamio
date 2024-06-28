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
    try {
      const result = await this.openAI.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        response_format: 'b64_json',
        n: 1,
        quality: highQuality ? 'hd' : 'standard',
      })

      const imageBase64 = result.data[0].b64_json

      if (!imageBase64) {
        throw new Error('Images generation result length is below 1')
      }

      return imageBase64
    } catch (error) {
      console.error('Error during generating image with OpenAI', error)
      throw new Error('Error during generating image with OpenAI')
    }
  }
}
