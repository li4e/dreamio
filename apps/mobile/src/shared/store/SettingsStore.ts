import { makeAutoObservable } from 'mobx'
import { mkkvStorage } from 'shared/lib/mmkv'
import { useStore } from '.'

interface SettingsPersistingData {
  censorship: boolean
  autoSave: boolean
}

export class SettingsStore {
  private _censorship = true
  private _autoSave = false

  constructor() {
    this.restoreData()
    makeAutoObservable(this)
  }

  set censorship(value: boolean) {
    this._censorship = value
    this.persistData()
  }

  get censorship() {
    return this._censorship
  }

  set autoSave(value: boolean) {
    this._autoSave = value
    this.persistData()
  }

  get autoSave() {
    return this._autoSave
  }

  private get persistingData(): SettingsPersistingData {
    return {
      censorship: this.censorship,
      autoSave: this.autoSave,
    }
  }

  private persistData() {
    mkkvStorage.set('store.settings', JSON.stringify(this.persistingData))
  }

  private restoreData() {
    const storedData = mkkvStorage.getString('store.settings')
    if (storedData) {
      const parsedData = JSON.parse(
        storedData
      ) as Partial<SettingsPersistingData>
      this.censorship = parsedData.censorship ?? this.censorship
      this.autoSave = parsedData.autoSave ?? this.autoSave
    }
  }
}

export function useSettingsStore() {
  const store = useStore()
  return store.settings
}
