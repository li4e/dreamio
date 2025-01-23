import { GenerationStore } from 'entities/generation'
import { SettingsStore } from 'shared/store/SettingsStore'

export class Store {
  settings = new SettingsStore()
  generation = new GenerationStore()
}
