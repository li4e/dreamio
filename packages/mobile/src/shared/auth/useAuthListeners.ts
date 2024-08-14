import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { firebaseAuth } from '../lib/firebase'
import { SnackBarVariant, useSnackbar } from '../ui/Snackbar'
import { getAccountData, AccountStore } from './AccountStore'

export function useAuthListeners(accountStore: AccountStore) {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const reSignIn = useCallback(async () => {
    await firebaseAuth.signOut().catch(() => {
      //ignore error
    })
    await firebaseAuth.signInAnonymously()
    const accountData = await getAccountData()
    accountStore.data = accountData
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
  }, [reSignIn, showSnackbar])
}
