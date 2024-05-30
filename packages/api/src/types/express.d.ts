// types/express.d.ts
import { UserDto } from '@choco/db'

declare global {
  namespace Express {
    interface Request {
      user?: UserDto
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: UserDto
}
