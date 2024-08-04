const usernameRegex = /^[a-zA-Z0-9]([._-]?[a-zA-Z0-9]+)*$/

export function isValidUsername(username: string): boolean {
  return (
    usernameRegex.test(username) &&
    username.length >= 3 &&
    username.length <= 20
  )
}
