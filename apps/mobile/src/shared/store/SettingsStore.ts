import { makeAutoObservable } from 'mobx'
import { mkkvStorage } from 'shared/lib/mmkv'

interface SettingsPersistingData {
  censorship: boolean
}

export class SettingsStore {
  censorship = true

  constructor() {
    this.restoreData()
    makeAutoObservable(this)
  }

  setCensorship(censorship: boolean) {
    this.censorship = censorship
    this.persistData()
  }

  private get persistingData(): SettingsPersistingData {
    return {
      censorship: this.censorship,
    }
  }

  private persistData() {
    mkkvStorage.set('store.settings', JSON.stringify(this.persistingData))
  }

  private restoreData() {
    const storedData = mkkvStorage.getString('store.settings')
    if (storedData) {
      const parsedData = JSON.parse(storedData) as SettingsPersistingData
      this.censorship = parsedData.censorship
    }
  }
}
