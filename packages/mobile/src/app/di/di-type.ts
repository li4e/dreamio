import { DataSource } from 'typeorm'
import { Store } from './store'

declare global {
  type RootStore = InstanceType<typeof Store>
  type AppDataSource = DataSource

  interface DiInterface {
    store: RootStore
    db: AppDataSource
  }
}
