'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Clipboard, Check, RefreshCw, Info,
  Mail, MessageSquare, ListTodo, Heart, Clock,
  Star, X, ChevronDown, ChevronUp, Bookmark, Pencil
} from 'lucide-react';
import { SITUATIONS, TARGETS, TONES } from '@/data/notice-templates';
import { useAuth } from '@/components/AuthProvider';
import { redirectToMainLogin } from '@/lib/auth-redirect';

interface GeneratedResults {
  version1: string;
  version2: string;
  version3: string;
  version4: string;
}

interface SavedCombo {
  situation: string;
  target: string;
  tone: string;
  label: string;
}

export default function NoticeWriterPage() {
  const [situation, setSituation] = useState('welcome');
  const [target, setTarget] = useState('kinder_parents');
  const [tone, setTone] = useState('warm');
  const [extra, setExtra] = useState('');

  const { isLoggedIn, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResults | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [liked, setLiked] = useState<boolean[]>([false, false, false, false]);
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([]);
  const [showCombos, setShowCombos] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [historyNotices, setHistoryNotices] = useState<any[]>([]);

  const [showExtra, setShowExtra] = useState(false);
  const [childName, setChildName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [notes, setNotes] = useState('');

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  useEffect(() => {
    const storedLikes = localStorage.getItem('cs_notice_liked');
    if (storedLikes) setLiked(JSON.parse(storedLikes));

    const stored = localStorage.getItem('cs_notice_combos');
    if (stored) setSavedCombos(JSON.parse(stored));
  }, []);

  const toggleLike = (idx: number) => {
    const updated = [...liked];
    updated[idx] = !updated[idx];
    setLiked(updated);
    localStorage.setItem('cs_notice_liked', JSON.stringify(updated));
  };

  const saveCurrentCombo = () => {
    const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || situation;
    const tgtLabel = TARGETS.find(t => t.value === target)?.label || target;
    const toneLabel = TONES.find(t => t.value === tone)?.label || tone;
    const combo: SavedCombo = { situation, target, tone, label: `${sitLabel} · ${tgtLabel} · ${toneLabel}` };
    const existing = savedCombos.find(c => c.situation === situation && c.target === target && c.tone === tone);
    if (existing) return;
    const updated = [combo, ...savedCombos].slice(0, 10);
    setSavedCombos(updated);
    localStorage.setItem('cs_notice_combos', JSON.stringify(updated));
    showToast('현재 조건이 즐겨찾기에 저장되었습니다');
  };

  const deleteCombo = (idx: number) => {
    const updated = savedCombos.filter((_, i) => i !== idx);
    setSavedCombos(updated);
    localStorage.setItem('cs_notice_combos', JSON.stringify(updated));
  };

  const applyCombo = (combo: SavedCombo) => {
    setSituation(combo.situation);
    setTarget(combo.target);
    setTone(combo.tone);
    setShowCombos(false);
    showToast('조합이 적용되었습니다');
  };

  const loadHistory = () => {
    if (historyNotices.length > 0) {
      setShowHistory(!showHistory);
      return;
    }
    setShowHistory(true);
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      setHistoryNotices(stored);
    } catch {}
  };

  const buildExtraFromFields = () => {
    const parts: string[] = [];
    if (childName) parts.push(childName);
    if (teacherName) parts.push(teacherName);
    if (date) parts.push(date);
    if (place) parts.push(place);
    if (notes) parts.push(notes);
    return parts.join(', ');
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResults(null);
    setEditIdx(null);
    setEditText('');

    const extraValue = showExtra ? buildExtraFromFields() : extra;

    try {
      const response = await fetch('/api/notice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, target, tone, extra: extraValue }),
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
          showToast('공지문이 생성되었습니다');
        }
      }
    } catch (err) {
      console.error('Error generating notices:', err);
      showToast('생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
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
    showToast('공지문이 복사되었습니다. 카카오톡을 열고 붙여넣기 하세요.');
  };

  const handleSave = async (text: string, versionIdx: number) => {
    if (!isLoggedIn || !user) {
      redirectToMainLogin('/notice-writer');
      return;
    }
    try {
      const { saveNotice } = await import('@/lib/db');
      const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || '공지';
      const tgtLabel = TARGETS.find(t => t.value === target)?.label || '대상';
      const typeLabel = ['짧은문자형', '카톡공지형', '상세안내형', '리마인드형'][versionIdx];
      await saveNotice(user.id, {
        title: `${sitLabel} - ${tgtLabel} (${typeLabel})`,
        content: text,
        situation,
        target,
        tone,
      });
      showToast('보관함에 저장되었습니다');

      const stored: any[] = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      stored.unshift({
        title: `${sitLabel} - ${tgtLabel} (${typeLabel})`,
        content: text,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('cs_saved_notices', JSON.stringify(stored.slice(0, 50)));
    } catch (err) {
      console.error('공지문 저장 실패:', err);
      showToast('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleStartEdit = (idx: number) => {
    const contents = [results?.version1, results?.version2, results?.version3, results?.version4];
    setEditIdx(idx);
    setEditText(contents[idx] || '');
  };

  const handleConfirmEdit = () => {
    if (!results || editIdx === null) return;
    const key = `version${editIdx + 1}` as keyof GeneratedResults;
    setResults({ ...results, [key]: editText });
    setEditIdx(null);
    setEditText('');
    showToast('수정이 반영되었습니다');
  };

  const handleCancelEdit = () => {
    setEditIdx(null);
    setEditText('');
  };

  const cards: {
    key: string; idx: number; icon: React.ReactNode; title: string;
    badge: string; badgeClass: string; getContent: () => string; isKakao: boolean;
  }[] = [
    { key: 'v1', idx: 0, icon: <Mail className="w-4 h-4 text-navy-500" />, title: '짧은 문자형', badge: 'SMS 전송용', badgeClass: 'bg-white border border-warm-200 text-navy-500', getContent: () => results?.version1 || '', isKakao: false },
    { key: 'v2', idx: 1, icon: <MessageSquare className="w-4 h-4 text-mint-600" />, title: '카톡 공지형', badge: '인기/추천', badgeClass: 'bg-mint-500 text-white', getContent: () => results?.version2 || '', isKakao: true },
    { key: 'v3', idx: 2, icon: <ListTodo className="w-4 h-4 text-navy-500" />, title: '상세 안내형', badge: '가정통신문형', badgeClass: 'bg-white border border-warm-200 text-navy-500', getContent: () => results?.version3 || '', isKakao: false },
    { key: 'v4', idx: 3, icon: <RefreshCw className="w-4 h-4 text-navy-500" />, title: '리마인드형', badge: '최종 체크', badgeClass: 'bg-orange-100 text-orange-700', getContent: () => results?.version4 || '', isKakao: false },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="container-custom max-w-6xl py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold mb-2.5 border border-mint-200">
              <Sparkles className="w-3.5 h-3.5" />
              스마트 사역 비서
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950">공지문 작성기</h1>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              상황과 대상에 맞춰 4가지 스타일의 완성형 공지문을 즉시 생성합니다.
            </p>
          </div>
          <div className="relative">
            <button onClick={() => setShowCombos(!showCombos)} className="btn-outline btn-sm gap-1.5">
              <Star className={`w-4 h-4 ${savedCombos.length > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              즐겨찾기
              {savedCombos.length > 0 && (
                <span className="text-[9px] bg-mint-100 text-mint-700 rounded-full px-1.5 py-0.5 font-bold">{savedCombos.length}</span>
              )}
            </button>
            {showCombos && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-warm-200 z-20 p-3 space-y-1">
                <div className="text-[10px] font-bold text-navy-500 mb-2">저장된 조건</div>
                {savedCombos.length === 0 ? (
                  <p className="text-[10px] text-navy-400">저장된 조건이 없습니다. ⭐ 버튼으로 저장하세요.</p>
                ) : (
                  savedCombos.map((combo, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-1.5 hover:bg-warm-50 rounded-xl transition-colors">
                      <button onClick={() => applyCombo(combo)} className="text-[11px] text-left text-navy-800 flex-1 hover:text-mint-700 transition-colors">{combo.label}</button>
                      <button onClick={() => deleteCombo(i)} className="text-navy-300 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Compact Form Bar ── */}
        <form onSubmit={handleGenerate} className="bg-white rounded-2xl p-4 shadow-sm border border-warm-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">상황</label>
                <select value={situation} onChange={(e) => setSituation(e.target.value)} className="select-field py-2 text-xs w-full">
                  {SITUATIONS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">대상</label>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="select-field py-2 text-xs w-full">
                  {TARGETS.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy-500 mb-1">어조</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="select-field py-2 text-xs w-full">
                  {TONES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-navy-500 mb-1">
                  추가 정보
                  <button type="button" onClick={() => setShowExtra(!showExtra)} className="ml-1.5 text-navy-300 hover:text-mint-600 transition-colors align-middle">
                    {showExtra ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                  </button>
                  <span className="text-navy-300 font-normal ml-1">(이름, 일시, 장소)</span>
                </label>
                {showExtra ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="자녀 이름 (예: 예은이)" className="input-field py-2 text-xs w-full" />
                      <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="사역자명 (예: 김민수 전도사)" className="input-field py-2 text-xs w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="일시 (예: 7월 26일, 오전 11시)" className="input-field py-2 text-xs w-full" />
                      <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="장소 (예: 본관 2층)" className="input-field py-2 text-xs w-full" />
                    </div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="특이사항 (선택)" className="input-field min-h-[60px] text-xs resize-none py-2 w-full" />
                  </div>
                ) : (
                  <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="예: 예은이 (달란트 시장)" className="input-field py-2 text-xs w-full" />
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={saveCurrentCombo} className="btn-outline btn-sm !px-3" title="현재 조건 저장">
                <Star className="w-4 h-4" />
              </button>
              <button type="submit" disabled={loading} className="btn-secondary py-2.5 px-6 gap-2 text-xs whitespace-nowrap justify-center">
                {loading ? (<><RefreshCw className="w-3.5 h-3.5 animate-spin" />작성 중</>) : (<><Sparkles className="w-3.5 h-3.5" />공지 생성</>)}
              </button>
            </div>
          </div>
        </form>

        {/* ── Results ── */}
        {!results && !loading ? (
          <div className="bg-white rounded-3xl border border-dashed border-warm-300 p-16 text-center h-[460px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-mint-50 flex items-center justify-center text-mint-500 mb-4 border border-mint-100">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-navy-950 mb-1">공지문을 생성해보세요</h3>
            <p className="text-xs text-navy-400 max-w-xs leading-relaxed">
              상단에서 상황과 대상을 선택한 후 공지 생성 버튼을 누르면,<br />
              4가지 스타일의 문안이 즉시 준비됩니다.
            </p>
            <div className="mt-6 flex gap-4 text-[10px] text-navy-400">
              <span>🖱 클릭 → 복사</span>
              <span>🔄 더블클릭 → 편집</span>
              <span>💬 카톡 공유</span>
              <span>❤️ 좋아요</span>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl p-16 shadow-card border border-warm-100 h-[460px] flex flex-col items-center justify-center space-y-4">
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
          <div className="space-y-5">

            <div className="bg-mint-50/50 rounded-2xl p-4 border border-mint-100 flex items-start gap-2.5 text-xs text-mint-800">
              <Info className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed"><strong>사역 팁:</strong> 문안을 클릭하면 복사, 더블클릭하면 바로 편집할 수 있습니다. ❤️ 좋아요로 마음에 드는 시안을 표시하고 ⭐ 조건을 저장해보세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  liked={liked[card.idx]}
                  isEditing={editIdx === card.idx}
                  editText={editText}
                  copied={copiedId === card.key}
                  onLike={() => toggleLike(card.idx)}
                  onCopy={() => handleCopy(card.getContent(), card.key)}
                  onStartEdit={() => handleStartEdit(card.idx)}
                  onEditChange={setEditText}
                  onConfirmEdit={handleConfirmEdit}
                  onCancelEdit={handleCancelEdit}
                  onSave={() => handleSave(card.getContent(), card.idx)}
                  onKakaoShare={card.isKakao ? () => handleKakaoShare(card.getContent()) : undefined}
                />
              ))}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-warm-200">
              <button onClick={loadHistory} className="btn-outline btn-xs gap-1.5">
                <Clock className="w-3 h-3" />
                생성 이력
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <span className="text-[10px] text-navy-400">마음에 드는 시안이 없으신가요?</span>
              <button onClick={() => handleGenerate()} className="btn-outline btn-xs gap-1.5 font-bold">
                <RefreshCw className="w-3 h-3" />
                이 조건으로 재생성
              </button>
            </div>

            {showHistory && (
              <div className="bg-white rounded-2xl border border-warm-200 p-4 space-y-3">
                <h4 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-navy-500" />
                  지난 생성 공지문
                </h4>
                {historyNotices.length === 0 && <p className="text-[10px] text-navy-400">저장된 공지문이 없습니다.</p>}
                {historyNotices.slice(0, 10).map((item: any, i: number) => (
                  <div key={i} className="border-b border-warm-100 pb-2 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-navy-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-navy-400 line-clamp-2 mt-0.5">{item.content}</p>
                      </div>
                      <button onClick={() => handleCopy(item.content, 'h_' + i)} className="btn-outline btn-xs shrink-0"><Clipboard className="w-3 h-3" /></button>
                    </div>
                    {item.createdAt && <p className="text-[9px] text-navy-300 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

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

// ── NoticeCard component ──

interface NoticeCardProps {
  idx: number;
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeClass: string;
  content: string;
  isKakao: boolean;
  liked: boolean;
  isEditing: boolean;
  editText: string;
  copied: boolean;
  onLike: () => void;
  onCopy: () => void;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onKakaoShare?: () => void;
}

function NoticeCard({
  idx, icon, title, badge, badgeClass, content,
  isKakao, liked, isEditing, editText, copied,
  onLike, onCopy, onStartEdit, onEditChange, onConfirmEdit, onCancelEdit,
  onSave, onKakaoShare,
}: NoticeCardProps) {
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isLiked, setIsLiked] = useState(liked);

  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

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
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col justify-between h-[400px] hover:border-mint-200 transition-colors ${borderClass}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className={`text-xs font-bold ${isKakao ? 'text-mint-800' : 'text-navy-900'}`}>{title}</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${badgeClass}`}>{badge}</span>
      </div>

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

      <div className="px-3 py-2.5 bg-white border-t border-warm-200 flex items-center gap-1.5 shrink-0">
        {isEditing ? (
          <>
            <button onClick={onCancelEdit} className="flex-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-warm-200 text-navy-600 hover:bg-warm-50 transition-colors">취소</button>
            <button onClick={onConfirmEdit} className="flex-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-mint-500 text-white hover:bg-mint-600 transition-colors inline-flex items-center justify-center gap-1"><Check className="w-3 h-3" />완료</button>
          </>
        ) : (
          <>
            <button onClick={onLike} className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm-200 bg-white text-navy-400 hover:bg-warm-50 hover:border-warm-300 transition-colors" title="좋아요">
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
            </button>
            <button onClick={onSave} className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm-200 bg-white text-navy-400 hover:bg-warm-50 hover:border-warm-300 transition-colors" title="보관함 저장">
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button onClick={onStartEdit} className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm-200 bg-white text-navy-400 hover:bg-warm-50 hover:border-warm-300 transition-colors" title="편집">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onCopy} className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm-200 bg-white text-navy-400 hover:bg-warm-50 hover:border-warm-300 transition-colors" title="복사">
              {copied ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1" />
            {isKakao && onKakaoShare && (
              <button onClick={onKakaoShare} className="h-7 text-[10px] font-bold px-2.5 rounded-lg bg-[#FEE500] text-[#3A1D1D] border border-[#FEE500] hover:bg-[#FDD800] hover:border-[#FDD800] inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.58 2 11c0 2.76 1.42 5.2 3.68 6.88L4 22l4.68-2.56C9.7 19.8 10.82 20 12 20c5.5 0 10-3.58 10-8S17.5 3 12 3z"/></svg>
                카톡
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}


