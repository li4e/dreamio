import { useEffect } from 'react'
import { firebaseAuth } from '../lib/firebase'
import { getAccountData, AccountStore } from './AccountStore'

export function useAuthListeners(accountStore: AccountStore) {
  useEffect(() => {
    let firstTimeFetched = false

    return firebaseAuth.onAuthStateChanged((auth) => {
      if (auth) {
        if (!firstTimeFetched) {
          firstTimeFetched = true
          getAccountData().then((data) => {
            accountStore.data = data
          })
        }
      } else {
        accountStore.data = null
        firstTimeFetched = false
      }
    })
  }, [accountStore])
}
