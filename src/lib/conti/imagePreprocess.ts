export function preprocessImage(
  dataUrl: string,
  maxDimension = 2048,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.naturalWidth
      let h = img.naturalHeight

      if (w > maxDimension || h > maxDimension) {
        const scale = Math.min(maxDimension / w, maxDimension / h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }

      ctx.filter = 'contrast(1.3) saturate(0) brightness(1.1)'
      ctx.drawImage(img, 0, 0, w, h)

      const processed = canvas.toDataURL('image/jpeg', 0.92)
      resolve(processed)
    }
    img.onerror = () => reject(new Error('이미지 로딩 실패'))
    img.src = dataUrl
  })
}
