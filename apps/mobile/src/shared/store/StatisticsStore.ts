import { mkkvStorage } from 'shared/lib/mmkv'
import { useStore } from '.'
import { makeAutoObservable } from 'mobx'

export class StatisticsStore {
  private _generationsCount = 0
  get generationsCount() {
    return this._generationsCount
  }
  set generationsCount(value: number) {
    this._generationsCount = value
    this.persist()
  }

  private _errorsCount = 0
  get errorsCount() {
    return this._errorsCount
  }

  set errorsCount(value: number) {
    this._errorsCount = value
    this.persist()
  }

  private _rateAppAskCount = 0
  get rateAppAskCount() {
    return this._rateAppAskCount
  }
  set rateAppAskCount(value: number) {
    this._rateAppAskCount = value
    this._lastRateAskTime = Date.now()
    this.persist()
  }

  private _lastRateAskTime: null | number = null
  get lastRateAskTime() {
    return this._lastRateAskTime
  }

  constructor() {
    this.restore()

    makeAutoObservable(this)
  }

  private readonly persistingKey = 'store.statistics'

  private persist() {
    const data: StatisticsStorePersistingData = {
      generationsCount: this.generationsCount,
      errorsCount: this.errorsCount,
      rateAppAskCount: this.rateAppAskCount,
      lastRateAskTime: this.lastRateAskTime,
    }
    mkkvStorage.set(this.persistingKey, JSON.stringify(data))
  }

  private restore() {
    const storedData = mkkvStorage.getString(this.persistingKey)
    if (storedData) {
      const parsedData = JSON.parse(storedData) as StatisticsStorePersistingData

      this._generationsCount = parsedData.generationsCount
      this._errorsCount = parsedData.errorsCount
      this._rateAppAskCount = parsedData.rateAppAskCount
      this._lastRateAskTime = parsedData.lastRateAskTime
    }
  }
}

interface StatisticsStorePersistingData {
  generationsCount: number
  errorsCount: number
  rateAppAskCount: number
  lastRateAskTime: number | null
}

export function useStatisticsStore() {
  const store = useStore()
  return store.statistics
}
