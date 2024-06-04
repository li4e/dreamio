import { Request } from 'express'
import { UsersService } from '../services/users'
import { ServerError, StatusCode } from '../shared/ServerError'
import { FirebaseAuthService } from '../integrations/firebase_auth'
import { AuthenticatedRequest } from '../types/express'

export async function expressAuthentication(
  request: Request,
  securityName: string
): Promise<AuthenticatedRequest['user'] | null> {
  if (securityName === 'firebase') {
    const firebaseIdToken = request.get('firebase-token')

    if (!firebaseIdToken) {
      throw new ServerError(
        'FirebaseIdToken has not provided',
        StatusCode.UNAUTHORIZED
      )
    }

    const uid = await FirebaseAuthService.convertTokenToUID(firebaseIdToken)
    const userId = await new UsersService().getUserIdByFirebaseId(uid)
    return { id: userId }
  }

  return null
}
