import { useEffect } from 'react'
import { firebaseAuth } from '../lib/firebase'
import { getAccountData, AccountStore } from './AccountStore'

export function useAuthListeners(accountStore: AccountStore) {
  useEffect(() => {
    firebaseAuth.signOut().finally(() =>
      firebaseAuth.signInAnonymously().then(() => {
        getAccountData().then((data) => {
          accountStore.data = data
        })
      })
    )
  }, [accountStore])
}
