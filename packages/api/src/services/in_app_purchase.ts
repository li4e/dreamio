import { IDBInAppAdapter } from './db_adapters'
import { dbClient, Prisma } from '@choco/db'

export class InAppPurchaseService {
  constructor(private inAppPurchaseId: number) {}

  public async consumeCredits(): Promise<number | null> {
    try {
      const data = await dbClient.inAppPurchase.update({
        where: {
          id: this.inAppPurchaseId,
          credits: {
            gt: 0,
          },
        },
        data: {
          credits: {
            decrement: 1,
          },
        },
        select: {
          credits: true,
        },
      })

      return data.credits
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // P2025 error code indicates that the record does not exist
        return null
      }
      throw error
    }
  }

  public async incrementCredits(): Promise<number> {
    return dbClient.inAppPurchase
      .update({
        where: {
          id: this.inAppPurchaseId,
        },
        data: {
          credits: {
            increment: 1,
          },
        },
        select: {
          credits: true,
        },
      })
      .then((data) => data.credits)
  }

  public static async save(dataAdapter: IDBInAppAdapter): Promise<number> {
    const createData = dataAdapter.getCreateData()
    const updateData = dataAdapter.getUpdateData()

    return dbClient.inAppPurchase
      .upsert({
        where: {
          store_original_transaction_id: {
            store: createData.store,
            original_transaction_id: createData.original_transaction_id,
          },
        },
        create: createData,
        update: updateData,
        select: { id: true },
      })
      .then((data) => data.id)
  }
}
