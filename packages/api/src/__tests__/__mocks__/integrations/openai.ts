import { IOpenAiService } from '../../../types/integrations/openai'

const mockedGeneratedImage =
  'https://thumb.photo-ac.com/7a/7a706ac91fa3a2330382e7f4c11c6b3e_t.jpeg'

export class OpenAIService implements IOpenAiService {
  async generateImage() {
    return mockedGeneratedImage
  }
}
