import { IDBInAppAdapter } from './db_adapters'
import { dbClient } from '@choco/db'

export class InAppPurchasesService {
  async save(dataAdapter: IDBInAppAdapter): Promise<void> {
    const createData = dataAdapter.getCreateData()
    const updateData = dataAdapter.getUpdateData()

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
}
