'use client';

import { useState, useRef, useEffect } from 'react';
import { 
   Sparkles, Clipboard, Check, RefreshCw, Info, 
   Mail, MessageSquare, ListTodo, Pencil 
} from 'lucide-react';
import { SITUATIONS, TARGETS, TONES } from '@/data/notice-templates';

interface GeneratedResults {
  version1: string;
  version2: string;
  version3: string;
  version4: string;
}

interface NoticeCardProps {
  idx: number;
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeClass: string;
  content: string;
  isKakao: boolean;
  editIdx: number | null;
  editText: string;
  onEditChange: (v: string) => void;
  onStartEdit: () => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onKakaoShare?: () => void;
  onCopy: () => void;
  copied: boolean;
}

function NoticeCard({
  idx, icon, title, badge, badgeClass, content,
  isKakao, editIdx, editText,
  onEditChange, onStartEdit, onConfirmEdit, onCancelEdit,
  onKakaoShare, onCopy, copied,
}: NoticeCardProps) {
  const isEditing = editIdx === idx;
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleTextClick = () => {
    if (isEditing) return;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onStartEdit();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onCopy();
      }, 250);
    }
  };

  const borderClass = isKakao ? 'border-mint-200 ring-2 ring-mint-400/10' : 'border-warm-200';
  const headerBg = isKakao ? 'bg-mint-50 border-mint-100' : 'bg-warm-50 border-warm-100';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col justify-between h-[390px] hover:border-mint-200 transition-colors ${borderClass}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className={`text-xs font-bold ${isKakao ? 'text-mint-800' : 'text-navy-900'}`}>{title}</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${badgeClass}`}>{badge}</span>
      </div>

      {/* Content */}
      <div className="p-0 flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full h-full p-5 text-xs font-sans leading-relaxed resize-none focus:outline-none bg-white text-navy-800"
          />
        ) : (
          <div
            onClick={handleTextClick}
            className="p-5 h-full overflow-y-auto scrollbar-thin cursor-copy"
          >
            <pre className="text-xs text-navy-800 whitespace-pre-wrap font-sans leading-relaxed select-all">
              {content}
            </pre>
            <div className="mt-3 text-[9px] text-navy-300 flex items-center gap-3">
              <span>🖱 클릭 → 복사</span>
              {!isKakao && <span>🔄 더블클릭 → 편집</span>}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-warm-50/50 border-t border-warm-100 flex gap-2">
        {isEditing ? (
          <>
            <button onClick={onCancelEdit} className="btn-outline btn-sm whitespace-nowrap flex-1 gap-1 text-[10px]">취소</button>
            <button onClick={onConfirmEdit} className="btn-secondary btn-sm whitespace-nowrap flex-1 gap-1 text-[10px]"><Check className="w-3.5 h-3.5" />완료</button>
          </>
        ) : (
          <>
            <button onClick={onCopy} className="btn-outline btn-sm whitespace-nowrap gap-1 text-[10px]">
              {copied ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onStartEdit} className="btn-outline btn-sm whitespace-nowrap gap-1 text-[10px]"><Pencil className="w-3.5 h-3.5" /></button>
            <div className="flex-1" />
            {isKakao && onKakaoShare && (
              <button onClick={onKakaoShare} className="btn-outline btn-sm whitespace-nowrap gap-1 text-[10px] px-2 rounded-xl bg-[#FEE500] text-[#3A1D1D] border-[#FEE500] hover:bg-[#FDD800] hover:border-[#FDD800] font-bold justify-center">
                <KakaoIcon />
                카카오톡
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NoticeWriterPage() {
  const [situation, setSituation] = useState('welcome');
  const [target, setTarget] = useState('kinder_parents');
  const [tone, setTone] = useState('warm');
  const [extra, setExtra] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResults | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('클립보드에 복사되었습니다');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleKakaoShare = (text: string) => {
    navigator.clipboard.writeText(text);
    window.open('kakaotalk://', '_blank');
    showToast('📋 공지문이 복사되었습니다. 카카오톡을 열고 붙여넣기 하세요.');
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResults(null);
    setEditIdx(null);
    setEditText('');

    try {
      const response = await fetch('/api/notice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, target, tone, extra }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResults({
            version1: data.version1,
            version2: data.version2,
            version3: data.version3,
            version4: data.version4,
          });
        }
      }
    } catch (err) {
      console.error('Error generating notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards: {
    key: string;
    idx: number;
    icon: React.ReactNode;
    title: string;
    badge: string;
    badgeClass: string;
    getContent: () => string;
    isKakao: boolean;
    onKakaoShare?: () => void;
  }[] = [
    {
      key: 'v1', idx: 0,
      icon: <Mail className="w-4 h-4 text-navy-500" />,
      title: '짧은 문자형',
      badge: 'SMS 전송용',
      badgeClass: 'bg-white border border-warm-200 text-navy-500',
      getContent: () => results?.version1 || '',
      isKakao: false,
    },
    {
      key: 'v2', idx: 1,
      icon: <MessageSquare className="w-4 h-4 text-mint-600" />,
      title: '카톡 공지형',
      badge: '인기/추천',
      badgeClass: 'bg-mint-500 text-white',
      getContent: () => results?.version2 || '',
      isKakao: true,
      onKakaoShare: () => handleKakaoShare(results?.version2 || ''),
    },
    {
      key: 'v3', idx: 2,
      icon: <ListTodo className="w-4 h-4 text-navy-500" />,
      title: '상세 안내형',
      badge: '가정통신문형',
      badgeClass: 'bg-white border border-warm-200 text-navy-500',
      getContent: () => results?.version3 || '',
      isKakao: false,
    },
    {
      key: 'v4', idx: 3,
      icon: <RefreshCw className="w-4 h-4 text-navy-500" />,
      title: '리마인드형',
      badge: '최종 체크',
      badgeClass: 'bg-orange-100 text-orange-700',
      getContent: () => results?.version4 || '',
      isKakao: false,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50 py-10">
      <div className="container-custom max-w-6xl">
        
        {/* Header */}
        <div className="border-b border-warm-200 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold mb-2.5 border border-mint-200">
            <Sparkles className="w-3.5 h-3.5" />
            스마트 사역 비서
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950">공지문 작성기</h1>
          <p className="text-xs md:text-sm text-navy-500 mt-1">
            상황과 대상에 맞춰 4가지 스타일의 공지문을 즉시 작성합니다.
          </p>
        </div>

        {/* Compact Form Bar */}
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl p-4 shadow-sm border border-warm-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-3 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">상황</label>
                <select
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="select-field py-2 text-xs w-full"
                >
                  {SITUATIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">대상</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="select-field py-2 text-xs w-full"
                >
                  {TARGETS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">어조</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="select-field py-2 text-xs w-full"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">추가 정보 <span className="text-navy-300 font-normal">(이름, 일시, 장소)</span></label>
                <input
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="예: 예은이 (달란트 시장)"
                  className="input-field py-2 text-xs w-full"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary py-2.5 px-6 gap-2 text-xs whitespace-nowrap shrink-0 justify-center"
            >
              {loading ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" />작성 중</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" />공지 생성</>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {!results && !loading ? (
          <div className="bg-white rounded-3xl border border-dashed border-warm-300 p-16 text-center h-[400px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-mint-50 flex items-center justify-center text-mint-500 mb-4 border border-mint-100">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-navy-950 mb-1">공지문을 생성해보세요</h3>
            <p className="text-xs text-navy-400 max-w-xs leading-relaxed">
              상단에서 상황과 대상을 선택한 후 공지 생성 버튼을 누르면 4가지 스타일의 문안이 준비됩니다.
            </p>
            <div className="mt-6 flex gap-4 text-[10px] text-navy-400">
              <span>🖱 클릭 → 복사</span>
              <span>🔄 더블클릭 → 편집</span>
              <span>💬 카톡 공유</span>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl p-16 shadow-card border border-warm-100 h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-mint-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-mint-500 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-navy-950">공지문 작성 중</h3>
              <p className="text-xs text-navy-400 mt-1">상황에 맞는 문안을 조합하고 있습니다.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => (
                <NoticeCard
                  key={card.key}
                  idx={card.idx}
                  icon={card.icon}
                  title={card.title}
                  badge={card.badge}
                  badgeClass={card.badgeClass}
                  content={card.getContent()}
                  isKakao={card.isKakao}
                  editIdx={editIdx}
                  editText={editText}
                  onEditChange={setEditText}
                  onStartEdit={() => {
                    setEditIdx(card.idx);
                    setEditText(card.getContent());
                  }}
                  onConfirmEdit={() => {
                    if (!results) return;
                    const key = `version${card.idx + 1}` as keyof GeneratedResults;
                    setResults({ ...results, [key]: editText });
                    setEditIdx(null);
                    setEditText('');
                    showToast('수정이 반영되었습니다');
                  }}
                  onCancelEdit={() => {
                    setEditIdx(null);
                    setEditText('');
                  }}
                  onKakaoShare={card.onKakaoShare}
                  onCopy={() => handleCopy(card.getContent(), card.key)}
                  copied={copiedId === card.key}
                />
              ))}
            </div>

            {/* Re-trigger */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-warm-200">
              <span className="text-[10px] text-navy-400">마음에 드는 시안이 없으신가요?</span>
              <button
                onClick={() => handleGenerate()}
                className="btn-outline btn-xs gap-1.5 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                이 조건으로 재생성
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-navy-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-navy-700">
            <Check className="w-3.5 h-3.5 text-mint-400" />
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C6.5 3 2 6.58 2 11c0 2.76 1.42 5.2 3.68 6.88L4 22l4.68-2.56C9.7 19.8 10.82 20 12 20c5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
    </svg>
  );
}
