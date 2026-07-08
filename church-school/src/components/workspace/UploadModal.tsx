'use client'

import { X } from 'lucide-react'
import FileUpload from './FileUpload'

interface Props {
  showUploadModal: boolean
  setShowUploadModal: (show: boolean) => void
  handleUploadSuccess: (sermonId: string) => void
}

export default function UploadModal({ showUploadModal, setShowUploadModal, handleUploadSuccess }: Props) {
  if (!showUploadModal) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={() => setShowUploadModal(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">새 설교 원고 업로드</h2>
            <p className="text-xs text-gray-400 mt-0.5">PDF, TXT, DOCX 파일을 업로드하면 AI가 4개 서비스를 생성합니다</p>
          </div>
          <button
            onClick={() => setShowUploadModal(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <FileUpload onSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  )
}
