export interface IOpenAiService {
  generateImage(prompt: string): Promise<string>
}
