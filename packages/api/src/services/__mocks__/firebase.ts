export class FirebaseService {
  static async convertTokenToUID(firebaseIdToken: string) {
    if (firebaseIdToken === 'invalid') {
      throw new Error('FirebaseIdToken invalid')
    }
    return `firebase_user_id_${firebaseIdToken}`
  }
}
