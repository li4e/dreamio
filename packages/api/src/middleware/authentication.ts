import { Request } from 'express'
import userService from '../services/users'
import { ServerError, StatusCode } from '../shared/ServerError'
import { FirebaseService } from '../services/firebase'

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

    try {
      const uid = await FirebaseService.convertTokenToUID(firebaseIdToken)
      const user = await userService.getUserByFirebaseId(uid)
      return user
    } catch {
      throw new ServerError('User validation failed', StatusCode.UNAUTHORIZED)
    }
  }
}
