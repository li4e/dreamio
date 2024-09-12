import auth from '@react-native-firebase/auth'
import storage from '@react-native-firebase/storage'
import { HOST_DEV } from '../constants'

export const firebaseAuth = auth()
export const firebaseStorage = storage()

if (__DEV__) {
  firebaseAuth.useEmulator(`http://${HOST_DEV}:9099`)
  firebaseStorage.useEmulator(HOST_DEV, 9199)
}
