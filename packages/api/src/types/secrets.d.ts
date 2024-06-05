interface SecretValue {
  value(): string
}

export interface ISecrets {
  pgConenctionUrl: SecretValue
  openAIOrg: SecretValue
  openAIApiKey: SecretValue
  adaptyApiKey: SecretValue
}
