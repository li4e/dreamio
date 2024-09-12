import { DataSource } from 'typeorm'
import { PaywallsManager } from './paywalls-manager'
import { Store } from './store'

declare global {
  type RootStore = InstanceType<typeof Store>
  type PaywallsManagerType = InstanceType<typeof PaywallsManager>
  type AppDataSource = DataSource

  interface DiInterface {
    store: RootStore
    db: AppDataSource
    paywalls: PaywallsManagerType
  }
}
