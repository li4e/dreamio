import { Response, NextFunction } from 'express'
import { ServerError } from '../shared/ServerError'

export function errorHandler(
  _err: unknown,
  _req: unknown,
  res: Response,
  next: NextFunction
) {
  const error = _err as ServerError
  const status = error.status || 500

  if (status !== 401) {
    console.log(error)
  }

  const body = {
    name: error.name,
    message: error.message || 'Internal server error',
    status,
  }

  res.status(status).json(body)
  next()
}
