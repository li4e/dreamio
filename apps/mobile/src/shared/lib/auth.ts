import { getAuth, signInAnonymously, getIdToken } from '@react-native-firebase/auth'

let signInPromise: Promise<void> | null = null

async function ensureSignedIn() {
  if (getAuth().currentUser) return

  if (!signInPromise) {
    signInPromise = signInAnonymously(getAuth())
      .then(() => {})
      .catch((error) => {
        signInPromise = null
        throw error
      })
  }

  await signInPromise
}

export async function getAuthToken(): Promise<string> {
  await ensureSignedIn()

  const user = getAuth().currentUser
  if (!user) {
    throw new Error('No authenticated user')
  }

  return getIdToken(user)
}
