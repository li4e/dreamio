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
  openAIOrg: defineSecret('_'),
  openAIApiKey: defineSecret('_'),
  adaptyApiKey: defineSecret('_'),
}

export default Object.values(secrets)
