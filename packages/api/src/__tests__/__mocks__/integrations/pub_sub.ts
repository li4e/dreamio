import { GenerationsItemManager } from '../../../managers/generation'
import { IPubSubService } from '../../../types/integrations/pub_sub'

class PubSubService implements IPubSubService {
  public async startGeneration(generationId: number) {
    setTimeout(() => {
      new GenerationsItemManager(generationId).start()
    }, 2)
  }
}

export const pubSubService = new PubSubService()
