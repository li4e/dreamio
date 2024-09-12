import {
  GetCurrentUser200Response,
  RestoreUserMembership200Response,
} from '@choco/api-client'
import { makeAutoObservable } from 'mobx'
import { useDI } from '../di'
import { api } from '../lib/api'
import { mkkvStorage } from '../lib/mmkv'
import { useStoreData } from '../store'

interface Membership {
  credits: number
  hasPremium: boolean
}

export interface AccountData {
  id: number | null
  membership: Membership
}

export class AccountStore {
  private static readonly persistKey = 'account'
  private static readonly defaultAccountData: AccountData = {
    id: null,
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

  updateMembership(membership: Membership) {
    this.data = {
      ...AccountStore.defaultAccountData,
      ...this.data,
      membership,
    }
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

export function useMemebership() {
  const accountStore = useAccountStore()
  return useStoreData(() => accountStore.data.membership, [accountStore])
}

export function mapAccountDtoToEntity(
  dto: GetCurrentUser200Response['currentUser']
): AccountData {
  return {
    id: dto.id,
    membership: {
      credits: dto.premiumInfo.credits,
      hasPremium: dto.premiumInfo.hasPremium,
    },
  }
}

export function mapMembershipDtoToEntity(
  dto: RestoreUserMembership200Response
): Membership {
  return {
    credits: dto.membership.credits,
    hasPremium: dto.membership.hasPremium,
  }
}

export async function getAndUpdateAccountData(accountStore: AccountStore) {
  const accountData = await api
    .getCurrentUser()
    .then((res) => mapAccountDtoToEntity(res.data.currentUser))

  accountStore.data = accountData

  return accountData
}

export async function restoreMembership(accountStore: AccountStore) {
  const membership = await api
    .restoreUserMembership()
    .then((res) => mapMembershipDtoToEntity(res.data))
  accountStore.updateMembership(membership)
  return membership
}
