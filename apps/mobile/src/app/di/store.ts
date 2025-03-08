import { GenerationStore } from 'entities/generation'
import { SettingsStore } from 'shared/store/SettingsStore'
import { ColorSchemeStore } from 'shared/store/ColorSchemeStore'
import { StatisticsStore } from 'shared/store/StatisticsStore'

export class Store {
  settings = new SettingsStore()
  generation = new GenerationStore()
  colorScheme = new ColorSchemeStore()
  statistics = new StatisticsStore()
}
