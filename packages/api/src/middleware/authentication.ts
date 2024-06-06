import { Request } from 'express'
import { UserService } from '../services/user'
import { ServerError, StatusCode } from '../shared/ServerError'
import { FirebaseAuthService } from '../integrations/firebase_auth'

export async function expressAuthentication(
  request: Request,
  securityName: string
) {
  if (securityName === 'firebase') {
    const firebaseIdToken = request.get('firebase-token')

    if (!firebaseIdToken) {
      throw new ServerError(
        'FirebaseIdToken has not provided',
        StatusCode.UNAUTHORIZED
      )
    }

    const uid = await FirebaseAuthService.convertTokenToUID(firebaseIdToken)
    const userId = await UserService.getUserIdByFirebaseId(uid)
    request.userId = userId
  }
}
