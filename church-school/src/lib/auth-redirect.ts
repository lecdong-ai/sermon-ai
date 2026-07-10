export function redirectToMainLogin(currentPath?: string) {
  if (typeof window === 'undefined') return
  const next = currentPath ? `&next=${encodeURIComponent(currentPath)}` : ''
  window.location.href = `/?login=1${next}`
}
