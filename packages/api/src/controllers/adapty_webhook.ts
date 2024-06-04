import { Controller, Post, Route, Body, Request } from 'tsoa'
import { AdaptyWebhookEvent } from '../types/adapty'
import { ServerError } from '../shared/ServerError'
import { AdaptyWebhookHandler } from '../handlers/adapty/AdaptyWebhookHandler'

@Route('adapty_webhook')
export class UserController extends Controller {
  @Post()
  public async getUser(
    @Body() body: AdaptyWebhookEvent,
    @Request() req: { header: { Authorization: string } }
  ): Promise<{ adapty_check_response: unknown } | { success: true }> {
    const authHeader = req.header.Authorization

    // TODO: Use a real key
    if (authHeader !== '123') {
      throw new ServerError('Token is invalid', 401)
    }

    if ('adapty_check' in body) {
      return { adapty_check_response: body['adapty_check'] }
    }

    const adaptyWebhookHandler = new AdaptyWebhookHandler(body)
    await adaptyWebhookHandler.handle()

    return { success: true }
  }
}
