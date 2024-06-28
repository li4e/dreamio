import { PubSub } from '@google-cloud/pubsub'
import { IPubSubService, PubSubTopics } from '../types/integrations/pub_sub'

class PubSubService implements IPubSubService {
  private readonly topics = new Set<string>()
  private readonly client: PubSub

  constructor() {
    this.client = new PubSub()
  }

  public async startGeneration(generationId: number) {
    const topicName = PubSubTopics.GENERATE_IMAGE
    this.ensureTopicExists(PubSubTopics.GENERATE_IMAGE)
    await this.client
      .topic(topicName)
      .publishMessage({ json: { generationId } })
  }

  private async ensureTopicExists(topicName: string) {
    if (this.topics.has(topicName)) {
      return
    }

    const [topics] = await this.client.getTopics()

    const exists = topics.some(
      (topic) =>
        topic.name === `projects/${this.client.projectId}/topics/${topicName}`
    )

    if (exists) {
      this.topics.add(topicName)
    } else {
      console.log(`Topic ${topicName} does not exist. Creating...`)
      await this.client.createTopic(topicName)
      console.log(`Topic ${topicName} created.`)
    }
  }
}

export const pubSubService = new PubSubService()
