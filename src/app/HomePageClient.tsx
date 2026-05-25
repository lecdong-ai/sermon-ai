'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { LogIn, LayoutDashboard, ArrowRight, Upload } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'

const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /> })
const UsageBadge = dynamic(() => import('@/components/UsageBadge'), { ssr: false, loading: () => <div className="w-20 h-8 rounded-full bg-slate-100 animate-pulse" /> })

export default function HomePageClient() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        el.classList.add('visible')
      }
    })
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const handleUploadSuccess = (sermonId: string) => {
    router.push(`/workspace?id=${sermonId}`)
  }

  return (
    <>
      {/* CTA Buttons */}
      <div className="reveal mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {!loading && !user && (
          <Link
            href="/login?redirect=/"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <LogIn className="w-5 h-5" />
            지금 시작하기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
        {!loading && user && (
          <>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-bold text-[16px] shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <LayoutDashboard className="w-5 h-5" />
              대시보드로 이동
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sermon/new"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-slate-200/60 text-slate-700 font-bold text-[16px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <Upload className="w-5 h-5 text-indigo-500" />
              새 설교 만들기
            </Link>
          </>
        )}
      </div>

      {/* Upload Section */}
      <section className="relative py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="reveal">
            {!loading && (
              <>
                {user ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-2">
                      <div className="rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/40 shadow-lg shadow-indigo-500/3 p-1">
                        <FileUpload onSuccess={handleUploadSuccess} />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <div className="h-full">
                        <UsageBadge />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/40 shadow-lg p-8 sm:p-12 text-center">
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mx-auto mb-5">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                      </div>
                      <p className="text-[17px] sm:text-[20px] font-bold text-slate-800 mb-2">
                        원고 업로드를 위해 로그인이 필요합니다
                      </p>
                      <p className="text-[14px] sm:text-[15px] text-slate-400 mb-6 max-w-md mx-auto">
                        간단히 소셜/이메일 로그인 후 AI 생성 서비스를 이용하실 수 있습니다.
                      </p>
                      <Link
                        href="/login?redirect=/"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                        로그인하기
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
