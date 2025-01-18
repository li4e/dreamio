import { autorun } from 'mobx'
import { useState, useEffect } from 'react'

/**
 * Universal hook for reactively retrieving data from a MobX store.
 *
 * @param getData Function that returns the data from the store.
 * @param deps Array of dependencies that trigger a re-subscription when changed.
 * @returns The data from the store.
 */
export function useStoreData<T>(getData: () => T, deps: unknown[] = []): T {
  // Initialize state with data from the store
  const [data, setData] = useState<T>(getData())

  useEffect(() => {
    // Create an autorun to reactively update data in the state
    const disposer = autorun(() => {
      setData(getData())
    })

    // Cleanup the subscription on component unmount or when dependencies change
    return () => disposer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) // deps are passed directly to useEffect

  return data
}
