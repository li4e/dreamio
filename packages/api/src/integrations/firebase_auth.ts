import { auth } from 'firebase-admin'

export class FirebaseAuthService {
  static async convertTokenToUID(firebaseIdToken: string) {
    const decodedIdToken = await auth().verifyIdToken(firebaseIdToken)
    return decodedIdToken.uid
  }
}
