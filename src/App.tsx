import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { CATEGORIES, CategoryId } from './types';
import { useAppState } from './hooks/useLocalStorage';
import { searchFromDB, initSearchIndexFromDB, SearchItem } from './lib/searchIndex';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MemoPage from './pages/MemoPage';
import PriceCheckPage from './pages/PriceCheckPage';
import ClientRequestsPage from './pages/ClientRequestsPage';
import CompanyInfoPage from './pages/CompanyInfoPage';
import FeeCalculatorPage from './pages/FeeCalculatorPage';
import TransactionPage from './pages/TransactionPage';
import TaskListPage from './pages/TaskListPage';
import AccountInfoPage from './pages/AccountInfoPage';
import DiaryPage from './pages/DiaryPage';
import CustomerPage from './pages/CustomerPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// 카테고리 ID 매핑
const CATEGORY_MAP: Record<string, string> = {
  customer: 'customer',
  company: 'company-info',
  transaction: 'transactions',
  pricecheck: 'price-check',
  request: 'client-requests',
  account: 'account-info',
  diary: 'diary',
  memo: 'memo',
  task: 'task-list',
  fee: 'fee-calculator',
};

// 앱 내부 컴포넌트 (AuthProvider 내부에서만 사용)
function AppContent() {
  const { user, loading } = useAuth();
  const {
    activeCategory,
    setActiveCategory,
    selectedDate,
    setSelectedDate,
    priceChecks,
    clientRequests,
    tasks,
    searchQuery,
    setSearchQuery,
    exportData,
    exportToExcel,
    importData,
  } = useAppState();

  // 검색 입력값의 로컬 상태
  const [localSearchInput, setLocalSearchInput] = useState('');
  // 검색 결과 팝업 상태
  const [showSearchResults, setShowSearchResults] = useState(false);
  // 검색 결과
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  // 프로필 모드
  const [showProfile, setShowProfile] = useState(false);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner}>📋</div>
        <p style={loadingStyles.text}>로딩 중...</p>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!user) {
    return <LoginPage />;
  }

  // 프로필 페이지 표시
  if (showProfile) {
    return (
      <div style={profileContainerStyles}>
        <div style={profileHeaderStyles}>
          <button onClick={() => setShowProfile(false)} style={backButtonStyles}>
            ← 뒤로가기
          </button>
          <h2 style={profileTitleStyles}>프로필 설정</h2>
          <div style={{ width: '80px' }}></div>
        </div>
        <ProfilePage />
      </div>
    );
  }

  // Search index initialization (on mount, once)
  useEffect(() => {
    const initSearch = async () => {
      try {
        await initSearchIndexFromDB();
        console.log('[App] Search index initialized from Supabase');
      } catch (error) {
        console.error('[App] Failed to initialize search index:', error);
      }
    };
    initSearch();
  }, []); // Run once on mount

  // Refresh search index when user logs in
  useEffect(() => {
    if (user) {
      const refreshSearch = async () => {
        try {
          await initSearchIndexFromDB();
          console.log('[App] Search index refreshed after login');
        } catch (error) {
          console.error('[App] Failed to refresh search index:', error);
        }
      };
      refreshSearch();
    }
  }, [user]);

  // Search input handler with debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search when input changes (debounced)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (localSearchInput.trim().length >= 1) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchFromDB(localSearchInput);
          console.log('[App] Search triggered:', localSearchInput, 'Results:', results.length);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error('[App] Search error:', error);
          setSearchResults([]);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchInput]);

  // 검색 결과 닫기
  const closeSearchResults = useCallback(() => {
    setShowSearchResults(false);
    setLocalSearchInput('');
    setSearchQuery('');
    setSearchResults([]);
  }, [setSearchQuery]);

  // ESC 키로 검색 결과 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearchResults) {
        closeSearchResults();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchResults, closeSearchResults]);

  // 데이터 가져오기 핸들러
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        importData(text);
      };
      reader.readAsText(file);
    }
  };

  // Header에 전달할 검색 핸들러
  const handleSearchChange = useCallback((query: string) => {
    console.log('[App] handleSearchChange called:', query);
    setLocalSearchInput(query);
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback(async () => {
    console.log('[App] handleSearchSubmit called');
    if (localSearchInput.trim()) {
      try {
        const results = await searchFromDB(localSearchInput);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('[App] Search error:', error);
      }
    }
  }, [localSearchInput]);

  // 검색 결과 클릭 시 카테고리로 이동
  const handleSearchResultClick = useCallback((result: SearchItem) => {
    console.log('[App] Result clicked:', result.title);
    const categoryId = CATEGORY_MAP[result.type];
    if (categoryId) {
      setActiveCategory(categoryId as CategoryId);
      closeSearchResults();
    }
  }, [setActiveCategory, closeSearchResults]);

  const todayCounts = useMemo(() => ({
    priceChecks: priceChecks.filter((p: any) => p.date === selectedDate).length,
    clientRequests: clientRequests.filter((c: any) => c.status === 'in-progress').length,
    tasks: tasks.filter((t: any) => t.status !== 'completed').length,
  }), [priceChecks, clientRequests, tasks, selectedDate]);

  const renderPage = () => {
    switch (activeCategory as string) {
      case 'memo':
        return <MemoPage />;
      case 'price-check':
        return <PriceCheckPage />;
      case 'client-requests':
        return <ClientRequestsPage />;
      case 'company-info':
        return <CompanyInfoPage />;
      case 'fee-calculator':
        return <FeeCalculatorPage />;
      case 'transactions':
        return <TransactionPage />;
      case 'task-list':
        return <TaskListPage />;
      case 'account-info':
        return <AccountInfoPage />;
      case 'diary':
        return <DiaryPage />;
      case 'customer':
        return <CustomerPage />;
      default:
        return <MemoPage />;
    }
  };

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="app">
      <Sidebar
        categories={CATEGORIES}
        activeCategory={activeCategory as CategoryId}
        onCategoryChange={(id) => setActiveCategory(id)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        todayCounts={todayCounts}
      />
      <main className="main-content">
        <Header
          title={currentCategory?.name || '나비'}
          date={selectedDate}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearch={handleSearchSubmit}
          onExport={exportData}
          onExportExcel={exportToExcel}
          onImport={handleImport}
          localSearchInput={localSearchInput}
          userEmail={user?.email}
          onProfileClick={() => setShowProfile(true)}
        />
        <div className="content-area">
          {renderPage()}
        </div>
      </main>

      {/* 전역 검색 결과 팝업 */}
      {showSearchResults && localSearchInput.trim() && (
        <>
          {/* 오버레이 */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 999,
            }}
            onClick={closeSearchResults}
          />
          {/* 검색 결과 드롭다운 */}
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            width: '520px',
            maxHeight: '580px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #e2e8f0',
          }}>
            {/* 헤더 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '2px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%)',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔍</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  "{localSearchInput}" 검색 결과 {searchResults.length > 0 ? `(${searchResults.length}건)` : ''}
                </span>
              </div>
              <button 
                onClick={closeSearchResults}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            {/* 결과 목록 */}
            <div style={{ overflow: 'auto', flex: 1, maxHeight: '480px' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔎</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>검색 결과가 없습니다</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    고객명, 종목명, 업체명 등을 검색해보세요
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '8px' }}>
                    현재 검색 인덱스: {searchResults.length}개 항목
                  </div>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    onClick={() => handleSearchResultClick(result)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderLeft = '3px solid #1a3a5c';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderLeft = '3px solid transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: getCategoryColor(result.category),
                        color: 'white',
                        fontWeight: 600,
                      }}>
                        [{result.category}]
                      </span>
                      {result.date && (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{result.date}</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '3px', fontSize: '15px' }}>
                      {result.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {result.subtitle}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* 푸터 */}
            <div style={{
              padding: '12px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#64748b',
              textAlign: 'center',
            }}>
              클릭하면 해당 카테고리로 이동합니다 • ESC 키로 닫기
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 카테고리별 색상
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '고객정보': '#059669',
    '기업정보': '#7c3aed',
    '거래내역': '#2563eb',
    '시세체크': '#ea580c',
    '고객의뢰': '#dc2626',
    '계좌정보': '#0891b2',
    '진행리스트': '#ca8a04',
    '메모': '#4f46e5',
    '다이어리': '#65a30d',
    '수고비계산': '#9333ea',
  };
  return colors[category] || '#1a3a5c';
}

// 로딩 스타일
const loadingStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%)',
    color: 'white',
  },
  spinner: {
    fontSize: '48px',
    animation: 'pulse 1s ease-in-out infinite',
  },
  text: {
    fontSize: '16px',
    marginTop: '16px',
  },
};

// 프로필 페이지 스타일
const profileContainerStyles: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f8fafc',
};

const profileHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  background: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const profileTitleStyles: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#1a3a5c',
  margin: 0,
};

const backButtonStyles: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: '#ffffff',
  color: '#64748b',
  fontSize: '14px',
  cursor: 'pointer',
};

// 메인 앱 컴포넌트 (AuthProvider로 래핑)
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;