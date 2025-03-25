/**
 * Retry an asynchronous action until it succeeds or a timeout is reached.
 *
 * @param action - The asynchronous function to execute.
 * @param timeout - The maximum time (in milliseconds) to keep retrying.
 * @param initialDelay - The initial delay between retries in milliseconds (default is 500ms).
 * @returns The result of the successful action.
 * @throws The last encountered error if the timeout is reached.
 */
export async function retryUntilTimeout<T>(
  action: () => Promise<T>,
  timeout: number,
  initialDelay = 500
): Promise<T> {
  const startTime = Date.now()
  let attempt = 0
  let delay = initialDelay

  while (true) {
    try {
      // Attempt to execute the action.
      return await action()
    } catch (error) {
      // Check if the timeout has been reached.
      if (Date.now() - startTime >= timeout) {
        throw error
      }
      // Wait for the current delay before retrying.
      await new Promise((resolve) => setTimeout(resolve, delay))
      attempt++
      // Increase the delay for the next attempt (exponential backoff with a cap).
      delay = Math.min(initialDelay * 2 ** attempt, 5000)
    }
  }
}
