import auth from '@react-native-firebase/auth'
import storage from '@react-native-firebase/storage'

export const firebaseAuth = auth()
export const firebaseStorage = storage()

const tHostName = 'localhost'
firebaseAuth.useEmulator(`http://${tHostName}:9099`)
firebaseStorage.useEmulator(tHostName, 9199)
