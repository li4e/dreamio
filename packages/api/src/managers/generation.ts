import { OpenAIService } from '../integrations/openai'
import { CloudStorage } from '../integrations/storage'
import { GenerationService } from '../services/generation'
import { StartGenerationBody } from '../types/controllers/generation'
import { IGeneration } from '../types/client'

export class GenerationsManager {
  constructor(
    private readonly body: StartGenerationBody,
    private readonly userId: number
  ) {}

  public async create(): Promise<IGeneration> {
    return GenerationService.create({
      ...this.body,
      promptFull: this._promptFull,
      model: 'dalle_3',
      userId: this.userId,
    })
  }

  private get _promptFull() {
    return `Generate image with prompt "${this.body.prompt}"` + this._style
  }

  private get _style() {
    const style = this.body.style
    if (style) {
      return ` in "${style}" style`
    }
    return ''
  }
}

export class GenerationsItemManager {
  private readonly item: GenerationService

  constructor(private readonly _generationId: number) {
    this.item = new GenerationService(this._generationId)
  }

  public async start(): Promise<void> {
    const data = await this.item.getData()

    try {
      const base64Image = await new OpenAIService().generateImage(
        data.promptFull,
        data.highQuality ?? undefined
      )

      const image = await new CloudStorage().saveImageFromBase64(base64Image)

      try {
        await this.item.saveResults([image.imageData])
      } catch (subError) {
        await image.delete()
        throw subError
      }
    } catch (error) {
      await this.item.setErrorStatus()
      console.error('Error during generation process', error)
      throw new Error('Error during generation process')
    }
  }
}
