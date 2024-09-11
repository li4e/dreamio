import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { firebaseAuth } from '../lib/firebase'
import { SnackBarVariant, useSnackbar } from '../ui/Snackbar'
import { getAccountData, AccountStore } from './AccountStore'

export function useAuthListeners(accountStore: AccountStore) {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const reSignIn = useCallback(async () => {
    if (!firebaseAuth.currentUser) {
      await firebaseAuth.signInAnonymously()
    }

    console.log({ currentUserId: firebaseAuth.currentUser?.uid })

    try {
      const accountData = await getAccountData()
      accountStore.data = accountData
    } catch (err) {
      await firebaseAuth.signOut()
      throw err
    }
  }, [accountStore])

  useEffect(() => {
    reSignIn().catch((error) => {
      showSnackbar(
        {
          title: t('components.snackBar.generalError.title'),
          description: t('components.snackBar.generalError.description'),
        },
        { variant: SnackBarVariant.ERROR }
      )
    })
  }, [reSignIn, showSnackbar, t])
}
