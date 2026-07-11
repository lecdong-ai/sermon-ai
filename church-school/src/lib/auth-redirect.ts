export function redirectToMainLogin(currentPath?: string) {
  if (typeof window === 'undefined') return
  const next = currentPath ? `&next=${encodeURIComponent(currentPath)}` : ''
  window.location.href = `https://bunker.ai.kr/?login=1${next}`
}
