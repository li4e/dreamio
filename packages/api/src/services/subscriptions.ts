import { IDBSubscriptionAdapter } from './db_adapters'
import { dbClient, Prisma } from '@choco/db'

export class SubscriptionsService {
  public async save(dataAdapter: IDBSubscriptionAdapter): Promise<number> {
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        return await this.createOrUpdateSubscription(dataAdapter)
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

  private async createOrUpdateSubscription(
    dataAdapter: IDBSubscriptionAdapter
  ): Promise<number> {
    const createData = dataAdapter.getCreateData()

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
      const updateData = dataAdapter.getUpdateData(
        existedSubscription.transaction_id
      )

      return dbClient.subscription
        .update({
          where: {
            store_original_transaction_id: {
              store: createData.store,
              original_transaction_id: createData.original_transaction_id,
            },
            version: existedSubscription.version,
          },
          data: updateData,
          select: { id: true },
        })
        .then((data) => data.id)
    } else {
      return dbClient.subscription
        .create({
          data: createData,
          select: { id: true },
        })
        .then((data) => data.id)
    }
  }
}
