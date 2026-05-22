'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  visible: boolean
  onClose: () => void
}

export default function Toast({ message, type = 'success', visible, onClose }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible && !show) return null

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${
        show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-xl ${
          type === 'success'
            ? 'bg-green-50/90 border-green-200 text-green-800'
            : 'bg-red-50/90 border-red-200 text-red-800'
        }`}
      >
        {type === 'success' ? (
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
        )}
        <span className="text-[16px] font-medium">{message}</span>
        <button
          onClick={() => { setShow(false); setTimeout(onClose, 300) }}
          className="w-6 h-6 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </div>
  )
}
