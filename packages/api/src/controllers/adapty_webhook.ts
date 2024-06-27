import { Controller, Post, Route, Body, Header } from 'tsoa'
import { AdaptyWebhookEvent } from '../types/adapty'
import { ServerError } from '../shared/ServerError'
import { AdaptyWebhookHandler } from '../handlers/adapty/AdaptyWebhookHandler'
import { secrets } from '../config/secrets'

@Route('adapty_webhook')
export class AdaptyWebhookController extends Controller {
  @Post()
  public async postEvent(
    @Body() body: { adapty_check: unknown } | object,
    @Header('Authorization') authHeader: unknown
  ): Promise<{ adapty_check_response: unknown } | { success: true }> {
    const token = secrets.adaptyWebhookApiKey.value()

    if (authHeader !== token) {
      throw new ServerError('Token is invalid', 401)
    }

    if ('adapty_check' in body) {
      return { adapty_check_response: body.adapty_check }
    }

    await new AdaptyWebhookHandler(body as AdaptyWebhookEvent).handle()

    return { success: true }
  }
}
