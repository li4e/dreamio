import { IReactionDisposer, makeAutoObservable, reaction } from 'mobx'
import { useEffect, useMemo } from 'react'
import {
  StatisticsStore,
  useStatisticsStore,
} from 'shared/store/StatisticsStore'
import * as StoreReview from 'expo-store-review'

const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7

class RateApp {
  private readonly triggerCount = 10
  private readonly timeBeetwenAsks = WEEK_IN_MS

  private launchTime: number
  constructor(private statisticsStore: StatisticsStore) {
    makeAutoObservable(this)
    this.launchTime = Date.now()
  }

  get shouldAskByTime() {
    const { lastRateAskTime } = this.statisticsStore
    if (!lastRateAskTime) {
      return true
    }
    const diff = this.launchTime - lastRateAskTime
    return diff > this.timeBeetwenAsks
  }

  private get shouldAskByGenerations() {
    const { generationsCount } = this.statisticsStore
    return generationsCount > this.triggerCount
  }

  get shouldAskRate(): boolean {
    const { lastRateAskTime } = this.statisticsStore
    return lastRateAskTime ? this.shouldAskByTime : this.shouldAskByGenerations
  }
}

export function useRateApp() {
  const statisticsStore = useStatisticsStore()
  const rateAppStore = useMemo(
    () => new RateApp(statisticsStore),
    [statisticsStore]
  )

  useEffect(() => {
    if (rateAppStore.shouldAskByTime) {
      let disposer: IReactionDisposer | null = null
      function clear() {
        if (disposer) disposer()
      }

      disposer = reaction(
        () => rateAppStore.shouldAskRate,
        async (shouldAskRate) => {
          if (shouldAskRate) {
            if (await StoreReview.hasAction()) {
              StoreReview.requestReview().then(() => {
                statisticsStore.rateAppAskCount++
              })
            }
            clear()
          }
        },
        { fireImmediately: true, delay: 3000 }
      )

      return disposer
    }
  }, [rateAppStore])
}
