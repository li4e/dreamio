import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adapty } from 'react-native-adapty'
import { IS_LOCAL_DEV } from '../constants'
import { firebaseAuth } from '../lib/firebase'
import { SnackBarVariant, useSnackbar } from '../ui/Snackbar'
import { getAndUpdateAccountData, AccountStore } from './AccountStore'

export function useAuthListeners(accountStore: AccountStore) {
  const { showSnackbar } = useSnackbar()
  const { t } = useTranslation()

  const ensureSignIn = useCallback(async () => {
    if (!firebaseAuth.currentUser) {
      await firebaseAuth.signInAnonymously()
    }

    if (IS_LOCAL_DEV) {
      console.log({ currentFBUserId: firebaseAuth.currentUser?.uid })
    }

    try {
      const { id } = await getAndUpdateAccountData(accountStore)
      await adapty.identify(String(id))
    } catch (err) {
      if (IS_LOCAL_DEV) {
        await firebaseAuth.signOut()
      }
      throw err
    }
  }, [accountStore])

  useEffect(() => {
    ensureSignIn().catch((err) => {
      if (IS_LOCAL_DEV) {
        console.log('showing error', err)
      }
      showSnackbar(
        {
          title: t('components.snackBar.generalError.title'),
          description: t('components.snackBar.generalError.description'),
        },
        { variant: SnackBarVariant.ERROR }
      )
    })
  }, [ensureSignIn, showSnackbar, t])
}
