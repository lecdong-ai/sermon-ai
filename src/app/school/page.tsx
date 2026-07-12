'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'

export default function SchoolRedirectPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = 'https://school.bunker.ai.kr'
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center mx-auto shadow-lg shadow-mint-500/20">
          <span className="text-3xl font-black text-white">CS</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            교회학교가 이전했습니다
          </h1>
          <p className="text-sm text-navy-300 leading-relaxed">
            교회학교 솔루션의 모든 서비스가{' '}
            <span className="text-mint-400 font-semibold">school.bunker.ai.kr</span>
            로 이동했습니다.
            <br />
            {countdown > 0 ? (
              <span className="text-navy-400">{countdown}초 후 자동 이동합니다.</span>
            ) : (
              <span className="text-mint-400">자동 이동 중...</span>
            )}
          </p>
        </div>

        <a
          href="https://school.bunker.ai.kr"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-mint-500 text-white font-bold text-sm hover:bg-mint-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-mint-500/20"
        >
          <ExternalLink className="w-4 h-4" />
          지금 이동하기
          <ArrowRight className="w-4 h-4" />
        </a>

        <div className="pt-4 border-t border-navy-700/50">
          <a
            href="https://school.bunker.ai.kr/admin"
            className="text-xs text-navy-500 hover:text-navy-300 transition-colors"
          >
            관리자는 여기로 이동 →
          </a>
        </div>
      </div>
    </div>
  )
}
