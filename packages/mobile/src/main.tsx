import { AppRegistry } from 'react-native'
import { App } from 'app/App'
import 'reflect-metadata' // Required for TypeORM

AppRegistry.registerComponent('Mobile', () => App)
