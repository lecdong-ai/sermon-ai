export function openKakaoApp() {
  const timer = setTimeout(() => {
    if (document.hidden) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = 'https://apps.apple.com/kr/app/kakaotalk/id362057947'
    } else {
      window.location.href = 'https://www.kakao.com'
    }
  }, 1500)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer)
  }, { once: true })

  try {
    const a = document.createElement('a')
    a.href = 'kakaotalk://'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    window.location.href = 'kakaotalk://'
  }
}

export async function copyAndOpenKakao(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  openKakaoApp()
}
