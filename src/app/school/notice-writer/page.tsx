'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, Clipboard, Check, Bookmark, RefreshCw, Info,
  Mail, MessageSquare, ListTodo, Heart, Star, Clock, Edit3, Save, X, ChevronDown, ChevronUp,
  FileText, Bell, Send, CheckCircle2, Share2
} from 'lucide-react';
import { SITUATIONS, TARGETS, TONES } from '@/data/school/notice-templates';
import { useAuth } from '@/components/AuthProvider';
import { redirectToMainLogin } from '@/lib/school/auth-redirect';

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
  const [childName, setChildName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResults | null>(null);

  const { isLoggedIn, user } = useAuth();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedV1, setSavedV1] = useState(false);
  const [savedV2, setSavedV2] = useState(false);
  const [savedV3, setSavedV3] = useState(false);
  const [savedV4, setSavedV4] = useState(false);

  // Phase C: Inline editing
  const [editingV1, setEditingV1] = useState(false);
  const [editingV2, setEditingV2] = useState(false);
  const [editingV3, setEditingV3] = useState(false);
  const [editingV4, setEditingV4] = useState(false);
  const [draftV1, setDraftV1] = useState('');
  const [draftV2, setDraftV2] = useState('');
  const [draftV3, setDraftV3] = useState('');
  const [draftV4, setDraftV4] = useState('');

  // Phase D: Likes (localStorage)
  const [likedV1, setLikedV1] = useState(false);
  const [likedV2, setLikedV2] = useState(false);
  const [likedV3, setLikedV3] = useState(false);
  const [likedV4, setLikedV4] = useState(false);

  // Phase D: Saved combos (localStorage)
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([]);
  const [showCombos, setShowCombos] = useState(false);

  // Phase D: History
  const [showHistory, setShowHistory] = useState(false);
  const [historyNotices, setHistoryNotices] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load likes & combos from localStorage
  useEffect(() => {
    const loadLikes = (key: string, setter: (v: boolean) => void) => {
      const v = localStorage.getItem('cs_notice_' + key);
      if (v === 'true') setter(true);
    };
    loadLikes('liked_v1', setLikedV1);
    loadLikes('liked_v2', setLikedV2);
    loadLikes('liked_v3', setLikedV3);
    loadLikes('liked_v4', setLikedV4);

    const stored = localStorage.getItem('cs_notice_combos');
    if (stored) setSavedCombos(JSON.parse(stored));
  }, []);

  const toggleLike = (idx: number) => {
    const key = 'liked_v' + idx;
    const setters = [setLikedV1, setLikedV2, setLikedV3, setLikedV4];
    const current = [likedV1, likedV2, likedV3, likedV4][idx - 1];
    setters[idx - 1](!current);
    localStorage.setItem('cs_notice_' + key, (!current).toString());
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
  };

  const loadHistory = async () => {
    if (historyNotices.length > 0) {
      setShowHistory(!showHistory);
      return;
    }
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      setHistoryNotices(stored);
    } catch { }
    setHistoryLoading(false);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setResults(null);
    setSavedV1(false);
    setSavedV2(false);
    setSavedV3(false);
    setSavedV4(false);
    setEditingV1(false);
    setEditingV2(false);
    setEditingV3(false);
    setEditingV4(false);

    try {
      const response = await fetch('/school/api/notice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, target, tone, childName, teacherName, date, place, notes }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const r = {
            version1: data.version1,
            version2: data.version2,
            version3: data.version3,
            version4: data.version4,
          };
          setResults(r);
          setDraftV1(data.version1);
          setDraftV2(data.version2);
          setDraftV3(data.version3);
          setDraftV4(data.version4);
        }
      }
    } catch (err) {
      console.error('Error generating notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (text: string, versionIndex: 1 | 2 | 3 | 4) => {
    if (!isLoggedIn || !user) {
      redirectToMainLogin('/school/notice-writer');
      return;
    }

    const sitLabel = SITUATIONS.find(s => s.value === situation)?.label || '공지';
    const tgtLabel = TARGETS.find(t => t.value === target)?.label || '대상';
    const typeLabel =
      versionIndex === 1 ? '짧은문자형' :
      versionIndex === 2 ? '카톡공지형' :
      versionIndex === 3 ? '상세안내형' : '리마인드형';

    try {
      const { saveNotice } = await import('@/lib/school/db');
      await saveNotice(user.id, {
        title: `${sitLabel} - ${tgtLabel} (${typeLabel})`,
        content: text,
        situation,
        target,
        tone
      });

      if (versionIndex === 1) setSavedV1(true);
      if (versionIndex === 2) setSavedV2(true);
      if (versionIndex === 3) setSavedV3(true);
      if (versionIndex === 4) setSavedV4(true);
    } catch (err) {
      console.error('공지문 저장 실패:', err);
      alert('보관함에 저장하는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const toggleEdit = (idx: number) => {
    const setters = [setEditingV1, setEditingV2, setEditingV3, setEditingV4];
    const draftSetters = [setDraftV1, setDraftV2, setDraftV3, setDraftV4];
    const current = [editingV1, editingV2, editingV3, editingV4][idx - 1];
    const content = [results?.version1, results?.version2, results?.version3, results?.version4][idx - 1];

    if (!current) {
      draftSetters[idx - 1](content || '');
    }
    setters[idx - 1](!current);
  };

  const handleDraftChange = (idx: number, val: string) => {
    const draftSetters = [setDraftV1, setDraftV2, setDraftV3, setDraftV4];
    draftSetters[idx - 1](val);
  };

  const confirmEdit = (idx: number) => {
    const draftValues = [draftV1, draftV2, draftV3, draftV4];
    const setters = [setEditingV1, setEditingV2, setEditingV3, setEditingV4];

    if (results) {
      const key = 'version' + idx as 'version1' | 'version2' | 'version3' | 'version4';
      setResults({ ...results, [key]: draftValues[idx - 1] });
    }
    setters[idx - 1](false);
  };

  const renderVersionCard = (
    idx: 1 | 2 | 3 | 4,
    icon: React.ReactNode,
    title: string,
    badge: string,
    badgeClass: string,
    content: string,
    cardType: 'sms' | 'kakao' | 'document' | 'remind'
  ) => {
    const editing = [editingV1, editingV2, editingV3, editingV4][idx - 1];
    const draft = [draftV1, draftV2, draftV3, draftV4][idx - 1];
    const liked = [likedV1, likedV2, likedV3, likedV4][idx - 1];
    const saved = [savedV1, savedV2, savedV3, savedV4][idx - 1];
    const isCopied = copiedId === 'v' + idx;

    // Header gradient by type
    const headerBg = 
      cardType === 'kakao' ? 'bg-gradient-to-r from-amber-50 to-yellow-100/50 border-b border-amber-200/60' :
      cardType === 'sms' ? 'bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-indigo-100/60' :
      cardType === 'document' ? 'bg-gradient-to-r from-sky-50 to-blue-50/50 border-b border-sky-100/60' :
      'bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/60';

    const cardBorder =
      cardType === 'kakao' ? 'border-amber-200 hover:border-amber-300 hover:shadow-md' :
      cardType === 'sms' ? 'border-indigo-100 hover:border-indigo-200 hover:shadow-md' :
      cardType === 'document' ? 'border-sky-100 hover:border-sky-200 hover:shadow-md' :
      'border-orange-100 hover:border-orange-200 hover:shadow-md';

    const charCount = (editing ? draft : content)?.length || 0;

    return (
      <div className={`bg-white rounded-2xl shadow-xs border overflow-hidden flex flex-col justify-between h-[470px] transition-all duration-200 ${cardBorder}`}>
        {/* Card Header */}
        <div>
          <div className={`px-4 py-3 flex items-center justify-between ${headerBg}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/80 shadow-2xs shrink-0">
                {icon}
              </div>
              <span className="text-xs font-bold text-navy-950 truncate">{title}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 shadow-2xs ${badgeClass}`}>
              {badge}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[345px] scrollbar-thin">
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => handleDraftChange(idx, e.target.value)}
                  className="w-full h-[250px] text-xs text-navy-900 font-sans leading-relaxed resize-none p-3.5 bg-slate-50 border border-mint-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:bg-white transition-all"
                  placeholder="공지문 내용을 입력하세요..."
                />
                <div className="flex justify-between items-center text-[10px] text-navy-400 px-1">
                  <span>글자 수: {charCount}자</span>
                  <span className="text-mint-600 font-medium">✏️ 실시간 편집 중</span>
                </div>
              </div>
            ) : (
              <>
                {cardType === 'kakao' && (
                  <div className="bg-[#b2c7da] rounded-xl p-3.5 space-y-2 min-h-[260px] flex flex-col justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        교회
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-700 font-semibold mb-1 flex items-center gap-1">
                          <span>교회학교 안내</span>
                          <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded">Official</span>
                        </div>
                        <div className="bg-[#fee500] text-amber-950 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs whitespace-pre-wrap font-sans leading-relaxed shadow-2xs border border-amber-300/40">
                          {content}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] font-bold text-amber-600">1</span>
                          <span className="text-[9px] text-slate-500">오전 11:02</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {cardType === 'sms' && (
                  <div className="space-y-2">
                    <div className="bg-slate-100/90 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed border border-slate-200/70 shadow-2xs">
                      {content}
                    </div>
                    <div className="flex justify-end items-center gap-2 text-[10px] text-slate-400 px-1">
                      <span>{charCount}자</span>
                      <span>·</span>
                      <span className="font-medium text-indigo-600">{charCount > 80 ? 'LMS 전송' : 'SMS 전송'}</span>
                    </div>
                  </div>
                )}

                {cardType === 'document' && (
                  <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">[가정통신문 안내]</span>
                      <span className="text-[10px] text-slate-400">발신: 교회학교</span>
                    </div>
                    <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {content}
                    </pre>
                  </div>
                )}

                {cardType === 'remind' && (
                  <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/60 shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 border-b border-amber-200/40 pb-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>중요 알림 & 체크포인트</span>
                    </div>
                    <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {content}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Card Footer Action Bar */}
        <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 grid grid-cols-4 gap-1.5 items-center">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => toggleLike(idx)}
            className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] font-semibold transition-all border ${
              liked
                ? 'bg-red-50 border-red-200 text-red-600 shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="좋아요"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden xs:inline">좋아요</span>
          </button>

          {/* Edit Button */}
          {editing ? (
            <button
              type="button"
              onClick={() => confirmEdit(idx)}
              className="h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold bg-mint-500 text-white hover:bg-mint-600 transition-all shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>완료</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleEdit(idx)}
              className="h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] font-semibold bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100 transition-all"
              title="편집"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>수정</span>
            </button>
          )}

          {/* Save / Bookmark Button */}
          <button
            type="button"
            onClick={() => handleSave(content || '', idx)}
            className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] font-semibold transition-all border ${
              saved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
            }`}
            title="보관함 저장"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-emerald-600 text-emerald-600' : 'text-slate-500'}`} />
            <span>{saved ? '저장됨' : '보관'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => handleCopy(content || '', 'v' + idx)}
            className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold transition-all shadow-2xs ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-navy-900 text-white hover:bg-navy-800'
            }`}
            title="텍스트 복사"
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
            <span>{isCopied ? '복사됨' : '복사'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-warm-50 py-10">
      <div className="container-custom max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-warm-200 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-bold mb-2.5 border border-mint-200">
              <Sparkles className="w-3.5 h-3.5" />
              스마트 사역 비서
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950">공지문 작성기</h1>
            <p className="text-xs md:text-sm text-navy-500 mt-1">
              상황과 대상에 맞춰 현장에서 즉시 발송 가능한 4가지 스타일의 완성형 공지문을 실시간 작성합니다.
            </p>
          </div>

          {/* Favorite combos */}
          <div className="relative">
            <button
              onClick={() => setShowCombos(!showCombos)}
              className="btn-outline btn-sm gap-1.5"
            >
              <Star className={`w-4 h-4 ${savedCombos.length > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              즐겨찾기
              {savedCombos.length > 0 && (
                <span className="text-[9px] bg-mint-100 text-mint-700 rounded-full px-1.5 py-0.5 font-bold">{savedCombos.length}</span>
              )}
            </button>
            {showCombos && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-warm-200 z-20 p-3 space-y-1">
                <div className="text-[10px] font-bold text-navy-500 mb-2">저장된 조합</div>
                {savedCombos.length === 0 && (
                  <p className="text-[10px] text-navy-400">저장된 조합이 없습니다. 조건을 선택한 후 ⭐ 버튼을 눌러 저장하세요.</p>
                )}
                {savedCombos.map((combo, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-1.5 hover:bg-warm-50 rounded-xl transition-colors">
                    <button
                      onClick={() => applyCombo(combo)}
                      className="text-[11px] text-left text-navy-800 flex-1 hover:text-mint-700 transition-colors"
                    >
                      {combo.label}
                    </button>
                    <button onClick={() => deleteCombo(i)} className="text-navy-300 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Input form */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-card border border-warm-100 space-y-5">
            <h2 className="text-base font-bold text-navy-950 flex items-center gap-1.5 border-b border-warm-100 pb-3">
              ⚙️ 공지문 생성 조건
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-bold text-navy-800 mb-1.5">1. 상황 종류</label>
                <select
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {SITUATIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1.5">2. 발송 대상</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {TARGETS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-800 mb-1.5">3. 문체/어조</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="select-field py-2.5 text-xs"
                >
                  {TONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-warm-100 pt-4">
                <p className="text-[10px] font-bold text-navy-500 mb-3">4. 세부 정보 (선택)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-navy-700 block mb-1">👶 자녀 이름</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="예: 예은이"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-navy-700 block mb-1">👤 사역자/교사 이름</label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="예: 김민수 전도사"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-navy-700 block mb-1">📅 일시</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="예: 7월 26일(주일) 오전 11시"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-navy-700 block mb-1">📍 장소</label>
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="예: 본관 2층 유치부실"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-navy-700 block mb-1">📝 특이사항</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="기타 포함할 내용이 있다면 자유롭게 적어주세요."
                      className="input-field min-h-[80px] text-xs resize-none py-2 leading-relaxed"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-navy-400 mt-2">
                  * 입력한 정보는 AI가 자연스럽게 공지문에 반영합니다.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveCurrentCombo}
                  className="btn-outline btn-sm !px-3"
                  title="현재 조건 즐겨찾기 저장"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-secondary flex-1 py-3 gap-2 text-sm justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      공지문 조합 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      맞춤 공지문 작성하기
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Results */}
          <div className="lg:col-span-8 space-y-6">

            {!results && !loading ? (
              <div className="bg-white rounded-3xl border border-dashed border-warm-300 p-16 text-center h-[540px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-mint-50 flex items-center justify-center text-mint-500 mb-4 border border-mint-100">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-navy-950 mb-1">작성 대기 중</h3>
                <p className="text-xs text-navy-400 max-w-xs leading-relaxed">
                  왼쪽에서 상황과 대상을 선택하신 후 생성 버튼을 누르면, 모바일 SMS부터 카카오톡 단톡방용 안내문까지 4개 버전의 문안이 바로 렌더링됩니다.
                </p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-3xl p-16 shadow-card border border-warm-100 h-[540px] flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-mint-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-mint-500 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-navy-950">사역 문안 정서 검수 중</h3>
                  <p className="text-xs text-navy-400 mt-1">상황에 맞게 따뜻하고 예의 바른 한국어 문장으로 교정하고 있습니다.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                <div className="bg-mint-50/50 rounded-2xl p-4 border border-mint-100 flex items-start gap-2.5 text-xs text-mint-800">
                  <Info className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>사역 팁:</strong> 복사하기 버튼을 눌러 발송 매체에 맞게 발송해 주세요. ✏️ 편집 버튼으로 내용을 직접 수정할 수 있습니다. ❤️ 좋아요를 누르면 마음에 드는 시안을 표시할 수 있습니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderVersionCard(1,
                    <Mail className="w-4 h-4 text-indigo-600" />,
                    '시안 1: 짧은 문자형', 'SMS / LMS',
                    'bg-indigo-50 text-indigo-700 border border-indigo-200',
                    results.version1, 'sms'
                  )}
                  {renderVersionCard(2,
                    <MessageSquare className="w-4 h-4 text-amber-600" />,
                    '시안 2: 카톡 공지형', '🔥 BEST 인기',
                    'bg-amber-400 text-amber-950 font-bold',
                    results.version2, 'kakao'
                  )}
                  {renderVersionCard(3,
                    <FileText className="w-4 h-4 text-sky-600" />,
                    '시안 3: 상세 안내형', '가정통신문형',
                    'bg-sky-50 text-sky-700 border border-sky-200',
                    results.version3, 'document'
                  )}
                  {renderVersionCard(4,
                    <Bell className="w-4 h-4 text-orange-600" />,
                    '시안 4: 리마인드형', 'D-1 최종 체크',
                    'bg-orange-100 text-orange-800 border border-orange-200',
                    results.version4, 'remind'
                  )}
                </div>

                {/* Re-trigger */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-warm-200">
                  <button
                    onClick={loadHistory}
                    className="btn-outline btn-xs gap-1.5"
                  >
                    <Clock className="w-3 h-3" />
                    생성 이력
                    {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] text-navy-400">마음에 드는 시안이 없으신가요?</span>
                  <button
                    onClick={() => handleGenerate()}
                    className="btn-outline btn-xs gap-1.5 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    이 조건으로 재생성
                  </button>
                </div>

                {/* History */}
                {showHistory && (
                  <div className="bg-white rounded-2xl border border-warm-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-navy-500" />
                      지난 생성 공지문
                    </h4>
                    {historyLoading && (
                      <p className="text-[10px] text-navy-400">로딩 중...</p>
                    )}
                    {!historyLoading && historyNotices.length === 0 && (
                      <p className="text-[10px] text-navy-400">저장된 공지문이 없습니다.</p>
                    )}
                    {historyNotices.slice(0, 10).map((item: any, i: number) => (
                      <div key={i} className="border-b border-warm-100 pb-2 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-navy-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-navy-400 line-clamp-2 mt-0.5">{item.content}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(item.content, 'h_' + i)}
                            className="btn-outline btn-xs shrink-0"
                          >
                            <Clipboard className="w-3 h-3" />
                          </button>
                        </div>
                        {item.createdAt && (
                          <p className="text-[9px] text-navy-300 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
