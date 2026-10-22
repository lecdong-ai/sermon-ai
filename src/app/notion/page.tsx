'use client';

import dynamic from 'next/dynamic';

const SecondBrainApp = dynamic(
  () => import('@/components/second-brain/App'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-[#232220] font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#232220]">사역자 세컨드 브레인을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

export default function NotionPage() {
  return <SecondBrainApp />;
}
