import { StatusCodes, getReasonPhrase } from 'http-status-codes'
export { StatusCodes as StatusCode } from 'http-status-codes'

export class ServerError extends Error {
  name: string

  constructor(
    message: string,
    public readonly status: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message)
    this.name = getReasonPhrase(status)
  }

  static codes = StatusCodes
}
