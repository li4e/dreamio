import { Request } from 'express'
import userService from '../services/users'
import { ServerError, StatusCode } from '../shared/ServerError'
import { FirebaseAuthService } from '../integrations/firebase_auth'

export async function expressAuthentication(
  request: Request,
  securityName: string
) {
  if (securityName === 'firebase') {
    const firebaseIdToken = request.get('firebaseIdToken')

    if (!firebaseIdToken) {
      throw new ServerError(
        'FirebaseIdToken has not provided',
        StatusCode.UNAUTHORIZED
      )
    }

    const uid = await FirebaseAuthService.convertTokenToUID(firebaseIdToken)
    const user = await userService.getUserByFirebaseId(uid)
    return user
  }
}
