import auth from '@react-native-firebase/auth'
import storage from '@react-native-firebase/storage'
import { HOST_DEV, IS_LOCAL_DEV } from '../constants'

export const firebaseAuth = auth()
export const firebaseStorage = storage()

if (IS_LOCAL_DEV) {
  firebaseAuth.useEmulator(`http://${HOST_DEV}:9099`)
  firebaseStorage.useEmulator(HOST_DEV, 9199)
}
