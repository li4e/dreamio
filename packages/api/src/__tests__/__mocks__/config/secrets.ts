import { ISecrets } from '../../../types/secrets'

function defineSecret(envVariable: string) {
  return {
    value() {
      return process.env[envVariable] || ''
    },
  }
}

export const secrets: ISecrets = {
  pgConenctionUrl: defineSecret('POSTGRESS_CONNECTION_URL'),
  openAIOrg: defineSecret('OPEN_AI_ORG'),
  openAIApiKey: defineSecret('OPEN_AI_API_KEY'),
  adaptyApiKey: defineSecret('ADAPTY_API_KEY'),
  adaptyWebhookApiKey: defineSecret('ADAPTY_WEBHOOK_API_KEY'),
}

export default Object.values(secrets)
