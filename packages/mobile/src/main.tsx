import { AppRegistry } from 'react-native'
import { App } from 'app/App'

import 'reflect-metadata' // Required for TypeORM
import 'react-native-url-polyfill/auto' // Required for Axios

AppRegistry.registerComponent('Mobile', () => App)
