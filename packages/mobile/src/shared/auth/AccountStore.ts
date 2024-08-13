import { GetCurrentUser200Response } from '@choco/api-client'
import { makeAutoObservable } from 'mobx'
import { useDI } from '../di'
import { api } from '../lib/api'
import { mkkvStorage } from '../lib/mmkv'

export interface AccountData {
  membership: {
    credits: number
    hasPremium: boolean
  }
}

export class AccountStore {
  private static readonly persistKey = 'account'
  private static readonly defaultAccountData: AccountData = {
    membership: {
      credits: 0,
      hasPremium: false,
    },
  }

  private _data: AccountData | null = null

  constructor() {
    this.restore()
    makeAutoObservable(this)
  }

  get data(): AccountData {
    if (this._data) {
      return this._data
    }
    return AccountStore.defaultAccountData
  }

  set data(data: AccountData | null) {
    this._data = data
    this.persist()
  }

  private restore() {
    const persisted = mkkvStorage.getString(AccountStore.persistKey)
    if (persisted) {
      this._data = JSON.parse(persisted)
    }
  }

  private persist() {
    mkkvStorage.set(AccountStore.persistKey, JSON.stringify(this._data))
  }
}

export function useAccountStore(): AccountStore {
  return useDI().store.account
}

export function mapAccountDtoToEntity(
  dto: GetCurrentUser200Response['currentUser']
): AccountData {
  return {
    membership: {
      credits: dto.premiumInfo.credits,
      hasPremium: dto.premiumInfo.hasPremium,
    },
  }
}

export function getAccountData(): Promise<AccountData> {
  return api
    .getCurrentUser()
    .then((res) => mapAccountDtoToEntity(res.data.currentUser))
}
