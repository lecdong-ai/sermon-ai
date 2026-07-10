'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, Settings, Plus, Edit2, Trash2, Check, X, Search, 
  Users, Download, HelpCircle, Shield, ShoppingCart, Calendar, Eye, ShieldAlert, KeyRound 
} from 'lucide-react';
import { noticeTemplates as initialTemplates, SITUATIONS, TARGETS, TONES, type NoticeTemplate } from '@/data/school/notice-templates';
import { mockUsers as initialUsers, mockProducts as initialProducts, type AdminUser, type AdminProduct } from '@/data/school/mock-admin';

// Extend template local interface to support isActive status
interface ExtendedNoticeTemplate extends NoticeTemplate {
  isActive: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates' | 'users' | 'products'>('dashboard');
  
  // Authorization simulation
  const [isAdmin, setIsAdmin] = useState(true);

  // States
  const [templates, setTemplates] = useState<ExtendedNoticeTemplate[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  // Search
  const [tempSearch, setTempSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');

  // Template Form Modal
  const [tempModalOpen, setTempModalOpen] = useState(false);
  const [selectedTemp, setSelectedTemp] = useState<ExtendedNoticeTemplate | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [tempSituation, setTempSituation] = useState('event');
  const [tempTarget, setTempTarget] = useState('parents');
  const [tempTone, setTempTone] = useState('warm');
  const [tempShort, setTempShort] = useState('');
  const [tempKakao, setTempKakao] = useState('');
  const [tempDetail, setTempDetail] = useState('');
  const [tempRemind, setTempRemind] = useState('');
  const [tempIsActive, setTempIsActive] = useState(true);

  // Product Form Modal
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<AdminProduct | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodType, setProdType] = useState<'single' | 'subscription'>('single');

  // Load Data
  useEffect(() => {
    const savedTemp = localStorage.getItem('cs_admin_templates');
    const savedUsers = localStorage.getItem('cs_admin_users');
    const savedProducts = localStorage.getItem('cs_admin_products');
    
    if (savedTemp) {
      setTemplates(JSON.parse(savedTemp));
    } else {
      const extended = initialTemplates.map(t => ({ ...t, isActive: true }));
      setTemplates(extended);
      localStorage.setItem('cs_admin_templates', JSON.stringify(extended));
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
      localStorage.setItem('cs_admin_users', JSON.stringify(initialUsers));
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('cs_admin_products', JSON.stringify(initialProducts));
    }
  }, []);

  // Save Helpers
  const saveTemplates = (data: ExtendedNoticeTemplate[]) => {
    setTemplates(data);
    localStorage.setItem('cs_admin_templates', JSON.stringify(data));
  };

  const saveUsers = (data: AdminUser[]) => {
    setUsers(data);
    localStorage.setItem('cs_admin_users', JSON.stringify(data));
  };

  const saveProducts = (data: AdminProduct[]) => {
    setProducts(data);
    localStorage.setItem('cs_admin_products', JSON.stringify(data));
  };

  // Template Delete
  const handleDeleteTemplate = (id: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
  };

  // Product Delete
  const handleDeleteProduct = (id: string) => {
    if (!confirm('이 상품을 삭제하시겠습니까?')) return;
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  };

  // Open Template Modal
  const openTempModal = (temp: ExtendedNoticeTemplate | null = null) => {
    setSelectedTemp(temp);
    if (temp) {
      setTempTitle(temp.title);
      setTempSituation(temp.situation);
      setTempTarget(temp.target);
      setTempTone(temp.tone);
      setTempShort(temp.shortVersion || '');
      setTempKakao(temp.kakaoVersion || '');
      setTempDetail(temp.detailVersion || '');
      setTempRemind(temp.remindVersion || '');
      setTempIsActive(temp.isActive);
    } else {
      setTempTitle('');
      setTempSituation('event');
      setTempTarget('parents');
      setTempTone('warm');
      setTempShort('');
      setTempKakao('');
      setTempDetail('');
      setTempRemind('');
      setTempIsActive(true);
    }
    setTempModalOpen(true);
  };

  // Submit Template Form
  const handleTempSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTemp) {
      const updated = templates.map(t => t.id === selectedTemp.id ? {
        ...t,
        title: tempTitle,
        situation: tempSituation,
        target: tempTarget,
        tone: tempTone,
        shortVersion: tempShort,
        kakaoVersion: tempKakao,
        detailVersion: tempDetail,
        remindVersion: tempRemind,
        isActive: tempIsActive,
      } : t);
      saveTemplates(updated);
    } else {
      const newTemp: ExtendedNoticeTemplate = {
        id: 'new-' + Math.random().toString(36).substr(2, 9),
        title: tempTitle,
        situation: tempSituation,
        target: tempTarget,
        tone: tempTone,
        shortVersion: tempShort,
        kakaoVersion: tempKakao,
        detailVersion: tempDetail,
        remindVersion: tempRemind,
        isActive: tempIsActive,
      };
      saveTemplates([newTemp, ...templates]);
    }
    setTempModalOpen(false);
  };

  // Open Product Modal
  const openProdModal = (prod: AdminProduct | null = null) => {
    setSelectedProd(prod);
    if (prod) {
      setProdName(prod.name);
      setProdDesc(prod.description);
      setProdPrice(prod.price);
      setProdType(prod.type);
    } else {
      setProdName('');
      setProdDesc('');
      setProdPrice(0);
      setProdType('single');
    }
    setProdModalOpen(true);
  };

  // Submit Product Form
  const handleProdSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProd) {
      const updated = products.map(p => p.id === selectedProd.id ? {
        ...p,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        type: prodType,
      } : p);
      saveProducts(updated);
    } else {
      const newProd: AdminProduct = {
        id: 'new-' + Math.random().toString(36).substr(2, 9),
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        type: prodType,
      };
      saveProducts([newProd, ...products]);
    }
    setProdModalOpen(false);
  };

  // Toggle User Plan Status
  const toggleUserPlan = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, planStatus: u.planStatus === 'free' ? 'premium' : 'free' as 'free' | 'premium' };
      }
      return u;
    });
    saveUsers(updated);
  };

  // Toggle Template Active State directly from list
  const toggleTemplateActive = (tempId: string) => {
    const updated = templates.map(t => {
      if (t.id === tempId) {
        return { ...t, isActive: !t.isActive };
      }
      return t;
    });
    saveTemplates(updated);
  };

  // Filters
  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(tempSearch.toLowerCase()) ||
    (t.shortVersion || '').toLowerCase().includes(tempSearch.toLowerCase()) ||
    (t.kakaoVersion || '').toLowerCase().includes(tempSearch.toLowerCase()) ||
    (t.detailVersion || '').toLowerCase().includes(tempSearch.toLowerCase()) ||
    (t.remindVersion || '').toLowerCase().includes(tempSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.churchName && u.churchName.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(prodSearch.toLowerCase())
  );

  // Auth lock screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-card border border-warm-100 space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-navy-950">어드민 접근 제한</h2>
            <p className="text-xs text-navy-500 leading-relaxed">
              요청하신 권한이 감지되지 않았습니다. 이 영역은 교회학교 서비스 최고 관리자 권한을 가진 계정만 입장할 수 있습니다.
            </p>
          </div>

          <hr className="border-warm-100" />

          <div className="space-y-2">
            <button
              onClick={() => setIsAdmin(true)}
              className="btn-primary btn-sm w-full gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              모의 관리자 권한 인증
            </button>
            <Link href="/school/" className="btn-outline btn-sm w-full block">
              메인 홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col md:flex-row">
      
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 bg-navy-900 text-white p-6 space-y-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">🛠️ 관리자 센터</h2>
            <p className="text-xs text-navy-400 mt-1">교회학교 솔루션 MVP 어드민</p>
          </div>
          
          {/* Permission Quick Toggle */}
          <button
            onClick={() => setIsAdmin(false)}
            className="p-1.5 rounded-lg bg-navy-800 text-red-400 border border-navy-700 hover:bg-navy-700"
            title="접근 잠금 테스트"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'dashboard' ? 'bg-mint-500 text-white' : 'text-navy-300 hover:bg-navy-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'templates' ? 'bg-mint-500 text-white' : 'text-navy-300 hover:bg-navy-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            템플릿 관리 ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'users' ? 'bg-mint-500 text-white' : 'text-navy-300 hover:bg-navy-800'
            }`}
          >
            <Users className="w-4 h-4" />
            사용자 현황 ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'products' ? 'bg-mint-500 text-white' : 'text-navy-300 hover:bg-navy-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            상품 구성 ({products.length})
          </button>
        </nav>
      </div>

      {/* Main Panel View */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-navy-900">시스템 관리 대시보드</h1>
            
            {/* Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-flat p-5 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 uppercase">공지 템플릿</p>
                  <p className="text-xl font-bold text-navy-950 mt-1">{templates.length}개</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
              </div>

              <div className="card-flat p-5 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 uppercase">총 사용자 수</p>
                  <p className="text-xl font-bold text-navy-950 mt-1">{users.length}명</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="card-flat p-5 bg-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-navy-400 uppercase">상품 패키지</p>
                  <p className="text-xl font-bold text-navy-950 mt-1">{products.length}개</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Tips & Instructions */}
              <div className="bg-gradient-to-br from-mint-50 to-warm-50 rounded-2xl p-6 border border-mint-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-mint-500" />
                    최고관리자 권한 인증 모드 작동 중
                  </h3>
                  <p className="text-xs text-navy-600 leading-relaxed">
                    본 시스템은 최고 사역 어드민을 위해 제작되었습니다. 왼쪽 네비게이션바의 잠금 아이콘을 누르면 일반 사용자일 때의 페이지 접근 불가 락 스크린 분기 처리를 테스트하실 수 있습니다.
                  </p>
                </div>
                <div className="text-[10px] text-navy-400 mt-4">
                  * MVP 로컬 데이터(localStorage)를 조작하므로 안전하며 데이터 손실 우려가 없습니다.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-navy-900">공지문 템플릿 관리</h1>
              <button
                onClick={() => openTempModal(null)}
                className="btn-secondary btn-sm gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                신규 템플릿 등록
              </button>
            </div>

            <div className="relative max-w-md bg-white rounded-xl shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="템플릿명 검색..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm text-navy-800">
                  <thead className="bg-warm-50 text-navy-600 font-bold border-b border-warm-100">
                    <tr>
                      <th className="p-4">템플릿명</th>
                      <th className="p-4">상황</th>
                      <th className="p-4">발송대상</th>
                      <th className="p-4">톤</th>
                      <th className="p-4 text-center">노출 여부</th>
                      <th className="p-4 text-center">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {filteredTemplates.map((temp) => (
                      <tr key={temp.id} className="hover:bg-warm-50/50">
                        <td className="p-4 font-bold text-navy-900">{temp.title}</td>
                        <td className="p-4 text-navy-600">
                          {SITUATIONS.find(s => s.value === temp.situation)?.label || temp.situation}
                        </td>
                        <td className="p-4">
                          {TARGETS.find(t => t.value === temp.target)?.label || temp.target}
                        </td>
                        <td className="p-4">
                          {TONES.find(t => t.value === temp.tone)?.label || temp.tone}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleTemplateActive(temp.id)}
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              temp.isActive 
                                ? 'bg-mint-50 text-mint-700 border border-mint-200' 
                                : 'bg-warm-100 text-navy-400 border border-warm-200'
                            }`}
                          >
                            {temp.isActive ? '활성' : '비활성'}
                          </button>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => openTempModal(temp)}
                            className="p-1.5 text-navy-400 hover:text-mint-600 transition-colors"
                            title="수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(temp.id)}
                            className="p-1.5 text-navy-400 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-navy-900">가입 사용자 관리</h1>

            <div className="relative max-w-md bg-white rounded-xl shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="이름, 이메일 또는 교회명 검색..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm text-navy-800">
                  <thead className="bg-warm-50 text-navy-600 font-bold border-b border-warm-100">
                    <tr>
                      <th className="p-4">이름</th>
                      <th className="p-4">이메일</th>
                      <th className="p-4">소속 교회명</th>
                      <th className="p-4">가입일</th>
                      <th className="p-4">요금제 플랜</th>
                      <th className="p-4 text-center">플랜 제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-warm-50/50">
                        <td className="p-4 font-bold text-navy-900">{user.name}</td>
                        <td className="p-4 text-navy-600">{user.email}</td>
                        <td className="p-4 font-medium text-navy-700">{user.churchName || '미지정'}</td>
                        <td className="p-4 text-navy-400">{user.joinedAt}</td>
                        <td className="p-4">
                          <span className={`badge text-[10px] font-bold ${
                            user.planStatus === 'premium' ? 'bg-mint-100 text-mint-800' : 'bg-warm-100 text-navy-500'
                          }`}>
                            {user.planStatus === 'premium' ? '프리미엄 구독' : '일반 무료'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleUserPlan(user.id)}
                            className="btn-outline btn-xs font-semibold py-1 px-2 text-[10px]"
                          >
                            플랜 토글
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-navy-900">상품 패키지 구성</h1>
              <button
                onClick={() => openProdModal(null)}
                className="btn-secondary btn-sm gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                신규 상품 등록
              </button>
            </div>

            <div className="relative max-w-md bg-white rounded-xl shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="상품명 검색..."
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm text-navy-800">
                  <thead className="bg-warm-50 text-navy-600 font-bold border-b border-warm-100">
                    <tr>
                      <th className="p-4">구분</th>
                      <th className="p-4">상품명</th>
                      <th className="p-4">설명</th>
                      <th className="p-4">가격</th>
                      <th className="p-4 text-center">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-warm-50/50">
                        <td className="p-4">
                          <span className={`badge text-[9px] font-bold ${
                            prod.type === 'subscription' ? 'bg-orange-100 text-orange-800' : 'bg-navy-100 text-navy-800'
                          }`}>
                            {prod.type === 'subscription' ? '정기구독' : '단건 패키지'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-navy-900">{prod.name}</td>
                        <td className="p-4 text-navy-500 max-w-xs truncate">{prod.description}</td>
                        <td className="p-4 font-extrabold">₩{prod.price.toLocaleString()}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => openProdModal(prod)}
                            className="p-1.5 text-navy-400 hover:text-mint-600 transition-colors"
                            title="수정"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-navy-400 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TEMPLATE MODAL */}
      {tempModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl relative">
            <button
              onClick={() => setTempModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-navy-400 hover:bg-warm-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-navy-900">
              {selectedTemp ? '템플릿 수정' : '새 공지문 템플릿 등록'}
            </h2>

            <form onSubmit={handleTempSubmit} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-navy-800 mb-1">템플릿 제목</label>
                <input
                  type="text"
                  required
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="예: 여름성경학교 2차 안내문"
                  className="input-field py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-navy-800 mb-1">상황</label>
                  <select
                    value={tempSituation}
                    onChange={(e) => setTempSituation(e.target.value)}
                    className="select-field py-2"
                  >
                    {SITUATIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-navy-800 mb-1">발송 대상</label>
                  <select
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    className="select-field py-2"
                  >
                    {TARGETS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-navy-800 mb-1">기본 톤</label>
                  <select
                    value={tempTone}
                    onChange={(e) => setTempTone(e.target.value)}
                    className="select-field py-2"
                  >
                    {TONES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="tempIsActive"
                  checked={tempIsActive}
                  onChange={(e) => setTempIsActive(e.target.checked)}
                  className="w-4 h-4 accent-mint-500 rounded cursor-pointer"
                />
                <label htmlFor="tempIsActive" className="font-semibold text-navy-800 cursor-pointer">
                  공지문 작성기에서 노출 활성화
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-navy-900 border-b border-warm-100 pb-1">4종 출력 서식 문구 설정</h3>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">1. 짧은 문자형 (SMS)</label>
                  <textarea
                    required
                    value={tempShort}
                    onChange={(e) => setTempShort(e.target.value)}
                    placeholder="짧은 요약 SMS 안내 문안"
                    className="input-field min-h-[80px] resize-none py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">2. 카톡 공지형</label>
                  <textarea
                    required
                    value={tempKakao}
                    onChange={(e) => setTempKakao(e.target.value)}
                    placeholder="단톡방/알림톡용 친근한 공지 문안"
                    className="input-field min-h-[100px] resize-none py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">3. 상세 안내형</label>
                  <textarea
                    required
                    value={tempDetail}
                    onChange={(e) => setTempDetail(e.target.value)}
                    placeholder="일정/가정통신문형 자세한 안내 문안"
                    className="input-field min-h-[120px] resize-none py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-700 mb-1">4. 리마인드형</label>
                  <textarea
                    required
                    value={tempRemind}
                    onChange={(e) => setTempRemind(e.target.value)}
                    placeholder="행사 직전 최종 점검용 리마인드 문안"
                    className="input-field min-h-[80px] resize-none py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTempModalOpen(false)}
                  className="btn-outline btn-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-secondary btn-sm"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {prodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setProdModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-navy-400 hover:bg-warm-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-navy-900 mb-4">
              {selectedProd ? '상품 수정' : '새 상품 등록'}
            </h2>

            <form onSubmit={handleProdSubmit} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-navy-800 mb-1">상품명</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="예: 여름 성경학교 가이드 패키지"
                  className="input-field py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-800 mb-1">설명</label>
                <input
                  type="text"
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="상품에 대한 핵심 혜택 및 포함 품목 요약"
                  className="input-field py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-navy-800 mb-1">가격 (원)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    placeholder="₩ 9900"
                    className="input-field py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy-800 mb-1">상품 유형</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as 'single' | 'subscription')}
                    className="select-field py-2"
                  >
                    <option value="single">단건 상품</option>
                    <option value="subscription">정기 구독권</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProdModalOpen(false)}
                  className="btn-outline btn-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-secondary btn-sm"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
