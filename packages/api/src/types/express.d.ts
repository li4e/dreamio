// types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  userId: number
}
