export function wait(timeInMs: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), timeInMs))
}
