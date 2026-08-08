'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Download, Home, Share2, Copy } from 'lucide-react'

export default function CompletePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params?.token as string
  const aid = searchParams?.get('aid')

  const [event, setEvent] = useState<{ title: string; start_date: string | null } | null>(null)
  const [application, setApplication] = useState<{ student_name: string; grade: string; parent_name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/school/api/events/${token}`)
      .then(r => r.json())
      .then(data => { if (data.event) setEvent({ title: data.event.title, start_date: data.event.start_date }) })
  }, [token])

  useEffect(() => {
    if (!aid) return
    fetch(`/school/api/events/${token}/application/${aid}`)
      .then(r => r.json())
      .then(data => {
        if (data.application) {
          setApplication({
            student_name: data.application.student_name,
            grade: data.application.grade,
            parent_name: data.application.parent_name,
          })
        }
      })
      .catch(() => {})
  }, [aid, token])

  const checkinUrl = typeof window !== 'undefined' ? `${window.location.origin}/school/events/${token}/checkin?aid=${aid}` : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '행사 신청 완료', text: `${event?.title} 신청이 완료되었습니다.`, url: window.location.href })
      } catch {}
    } else {
      handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0, 400, 400)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `체크인_QR_${application?.student_name || ''}.png`
        a.click()
      })
    }
    img.src = url
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50/30 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-mint-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2">신청 완료!</h1>
          <p className="text-navy-500">
            {event?.title} 신청이 완료되었습니다.
          </p>
        </div>

        {/* Application Summary */}
        {application && (
          <div className="bg-white rounded-2xl border border-warm-200 p-5 mb-6">
            <h2 className="text-sm font-bold text-navy-900 mb-3">신청 내역</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">학생 이름</span>
                <span className="font-medium text-navy-900">{application.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">학년</span>
                <span className="font-medium text-navy-900">{application.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">보호자</span>
                <span className="font-medium text-navy-900">{application.parent_name}</span>
              </div>
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-navy-900 mb-1 text-center">행사 입장 QR 코드</h2>
          <p className="text-xs text-navy-400 mb-4 text-center">
            행사 당일 이 화면을 보여주거나 스크린샷 후 제시해주세요.
          </p>
          <div id="qr-code" className="flex justify-center mb-4">
            <div className="p-4 bg-white border-2 border-navy-100 rounded-2xl">
              <QRCodeSVG value={checkinUrl} size={200} level="M" />
            </div>
          </div>
          <button onClick={handleDownloadQR}
            className="w-full py-3 bg-navy-50 text-navy-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-navy-100 transition-colors">
            <Download className="w-4 h-4" />
            QR 이미지 저장
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={handleShare}
            className="w-full py-3.5 bg-navy-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-navy-800 transition-colors">
            <Share2 className="w-5 h-5" />
            공유하기
          </button>
          <button onClick={handleCopy}
            className="w-full py-3 bg-white text-navy-700 font-medium rounded-xl border-2 border-warm-200 flex items-center justify-center gap-2 hover:border-navy-300 transition-colors">
            <Copy className="w-4 h-4" />
            {copied ? '복사됨!' : '링크 복사'}
          </button>
          <Link href="/school/"
            className="w-full py-3 text-navy-400 font-medium text-center flex items-center justify-center gap-2 hover:text-navy-600 transition-colors">
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
