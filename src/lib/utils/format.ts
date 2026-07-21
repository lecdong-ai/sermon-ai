export function formatDate(date: string, locale = 'ko-KR') {
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n)
}
