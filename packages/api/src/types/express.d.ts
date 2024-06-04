// types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      user: { id: number } | null
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: { id: number }
}
