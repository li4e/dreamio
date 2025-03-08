import { makeAutoObservable } from 'mobx'
import { mkkvStorage } from 'shared/lib/mmkv'
import { useStore } from '.'

type ColorScheme = 'dark' | 'light'
export type SelectedColorScheme = ColorScheme | 'system'

export class ColorSchemeStore {
  private _systemColorScheme: ColorScheme = 'light'
  private _selectedColorScheme: SelectedColorScheme = 'system'

  constructor() {
    this.restore()

    makeAutoObservable(this)
  }

  get systemColorScheme() {
    return this._systemColorScheme
  }

  set systemColorScheme(scheme: ColorScheme) {
    this._systemColorScheme = scheme
    this.persist()
  }

  get selectedColorScheme() {
    return this._selectedColorScheme
  }

  set selectedColorScheme(scheme: SelectedColorScheme) {
    this._selectedColorScheme = scheme
    this.persist()
  }

  get colorScheme(): ColorScheme {
    if (this.selectedColorScheme === 'system') {
      return this.systemColorScheme
    }
    return this.selectedColorScheme
  }

  private readonly persistingKey = 'store.colorScheme'

  private persist() {
    const data: ColorSchemeStorePersistindData = {
      systemColorScheme: this.systemColorScheme,
      selectedColorScheme: this.selectedColorScheme,
    }
    mkkvStorage.set(this.persistingKey, JSON.stringify(data))
  }

  private restore() {
    const storedData = mkkvStorage.getString(this.persistingKey)
    if (storedData) {
      const parsedData = JSON.parse(
        storedData
      ) as ColorSchemeStorePersistindData

      this._selectedColorScheme = parsedData.selectedColorScheme
      this._systemColorScheme = parsedData.systemColorScheme
    }
  }
}

interface ColorSchemeStorePersistindData {
  systemColorScheme: ColorScheme
  selectedColorScheme: SelectedColorScheme
}

export function useColorSchemeStore() {
  const store = useStore()
  return store.colorScheme
}
