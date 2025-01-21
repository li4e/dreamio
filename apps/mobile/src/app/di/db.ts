import { DataSource } from 'typeorm'
import { GenerationORMEntity as Generation } from 'entities/generation'
import { typeORMDriver } from 'react-native-quick-sqlite'

export const appDataSource = new DataSource({
  type: 'react-native',
  database: 'db',
  location: '.',
  driver: typeORMDriver,
  entities: [Generation],
  synchronize: true,
})
