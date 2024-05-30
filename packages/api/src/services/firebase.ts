import { auth } from 'firebase-admin'

export class FirebaseService {
  static async convertTokenToUID(firebaseIdToken: string) {
    const decodedIdToken = await auth().verifyIdToken(firebaseIdToken)
    return decodedIdToken.uid

    // if (firebaseIdToken === 'valid') {
    //   return 'fake_firebase_uid_123'
    // }
    // throw new Error('FirebaseIdToken invalid')
  }
}
