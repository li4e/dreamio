import { typeORMDriver } from 'react-native-quick-sqlite'
import { DataSource } from 'typeorm'
import { GenerationORMEntity as Generation } from 'entities/generation'

export const appDataSource = new DataSource({
  type: 'react-native',
  database: 'appDB',
  location: '.',
  driver: typeORMDriver,
  entities: [Generation],
  synchronize: true,
})
