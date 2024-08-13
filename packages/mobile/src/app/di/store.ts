import { GenerationStore } from 'entities/generation'
import { AccountStore } from 'shared/auth/AccountStore'

export class Store {
  generation = new GenerationStore()
  account = new AccountStore()
}
