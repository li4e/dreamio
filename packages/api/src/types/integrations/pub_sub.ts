export interface IPubSubService {
  startGeneration: (generationId: number) => Promise<void>
}

export enum PubSubTopics {
  GENERATE_IMAGE = 'generate-image',
}
