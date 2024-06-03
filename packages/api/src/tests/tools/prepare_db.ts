import { dbClient } from '@choco/db'

export async function clearDB() {
  await dbClient.$transaction([
    dbClient.inAppPurchase.deleteMany(),
    dbClient.subscription.deleteMany(),
    dbClient.firebaseUser.deleteMany(),
    dbClient.user.deleteMany(),
  ])
}

export async function prepareDB() {
  await dbClient.$connect()
  await clearDB()
}
