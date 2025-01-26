
export function isAuthProviderEnabled() {
  return process.env.NODE_ENV !== 'development'
}
