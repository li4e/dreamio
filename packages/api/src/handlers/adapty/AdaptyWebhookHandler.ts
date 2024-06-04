import { AdaptyWebhookEvent } from '../../types/adapty'
import { InAppPurchaseEventTransformer } from './InAppPurchaseEventTransformer'
import { SubscriptionEventTransformer } from './SubscriptionEventTransformer'
import { dbClient, Prisma } from '@choco/db'
import { isNonSubscriptionEvent } from './utils/isNonSubscriptionEvent'

export class AdaptyWebhookHandler {
  constructor(private event: AdaptyWebhookEvent) {}

  get isNonSubscription() {
    return isNonSubscriptionEvent(this.event.event_type)
  }

  async handle(): Promise<void> {
    if (this.isNonSubscription) {
      await this.savePurchase()
    } else {
      await this.saveSubscription()
    }
  }

  private async savePurchase() {
    const purchase = new InAppPurchaseEventTransformer(this.event)
    const createData = purchase.getCreateData()
    const updateData = purchase.getUpdateData()

    await dbClient.inAppPurchase.upsert({
      where: {
        store_original_transaction_id: {
          store: createData.store,
          original_transaction_id: createData.original_transaction_id,
        },
      },
      create: createData,
      update: updateData,
    })
  }

  private async saveSubscription() {
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        await this.createOrUpdateSubscription()
        return
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          // P2002 - row with the provided unique store + original_transaction_id already exists
          // P2025 - updating document doesn't exist, possibly due to version conflict
          ['P2002', 'P2025'].includes(error.code)
        ) {
          continue // Retry on known errors related to race conditions
        } else {
          throw error // Throw unknown errors immediately
        }
      }
    }

    throw new Error('Too many attempts to save subscription')
  }

  private async createOrUpdateSubscription() {
    const subscription = new SubscriptionEventTransformer(this.event)
    const createData = subscription.getСreateData()

    const existedSubscription = await dbClient.subscription.findUnique({
      where: {
        store_original_transaction_id: {
          store: createData.store,
          original_transaction_id: createData.original_transaction_id,
        },
      },
      select: { transaction_id: true, version: true },
    })

    if (existedSubscription) {
      const updateData = subscription.getUpdateData(
        existedSubscription.transaction_id
      )

      await dbClient.subscription.update({
        where: {
          store_original_transaction_id: {
            store: createData.store,
            original_transaction_id: createData.original_transaction_id,
          },
          version: existedSubscription.version,
        },
        data: updateData,
      })
    } else {
      await dbClient.subscription.create({
        data: createData,
      })
    }
  }
}
