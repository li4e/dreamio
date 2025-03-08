import { GenerationStore } from 'entities/generation'
import { SettingsStore } from 'shared/store/SettingsStore'
import { ColorSchemeStore } from 'shared/store/ColorSchemeStore'

export class Store {
  settings = new SettingsStore()
  generation = new GenerationStore()
  colorScheme = new ColorSchemeStore()
}
