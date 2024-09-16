import { onMessagePublished } from 'firebase-functions/v2/pubsub'

import secrets from '../config/secrets'
import { GenerationsItemManager } from '../managers/generation'
import { PubSubTopics } from '../types/integrations/pub_sub'

export const handleGenerationRequest = onMessagePublished(
  {
    topic: PubSubTopics.GENERATE_IMAGE,
    secrets,
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async (event) => {
    const generationId = Number(event.data.message.json.generationId)

    await new GenerationsItemManager(generationId).start()

    return
  }
)
