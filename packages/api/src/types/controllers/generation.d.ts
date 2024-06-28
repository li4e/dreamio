export interface StartGenerationBody {
  prompt: string
  enhancer: boolean
  style?: string | null
  highQuality?: boolean | null
}
