/**
 * 메인 페이지 로그인으로 리다이렉트
 *
 * 사용처: church-school 보호된 페이지에서 미로그인 시 호출
 * 쿠키가 도메인 단위로 공유되므로 메인에서 로그인하면
 * 같은 세션이 church-school 에서도 자동 적용됨
 */
export function redirectToMainLogin(currentPath: string) {
  if (typeof window === 'undefined') return
  const next = encodeURIComponent(currentPath)
  window.location.href = `/login?redirect=${next}`
}
