import { useMemo, useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CategoryId } from './types';
import { useAppState } from './hooks/useLocalStorage';
import { initSearchIndex, search, SearchItem } from './lib/searchIndex';
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

function App() {
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
    transactions,
    customers,
    companies,
    accounts,
    diaryEntries,
    memos,
    } = useAppState();

  // 검색 입력값의 로컬 상태
  const [localSearchInput, setLocalSearchInput] = useState('');
  // 검색 결과 팝업 상태
  const [showSearchResults, setShowSearchResults] = useState(false);
  // 검색 결과
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // 검색 인덱스 초기화 (앱 마운트 시)
  useEffect(() => {
    initSearchIndex({
      customers,
      companies,
      transactions,
      priceChecks,
      clientRequests,
      accounts,
      tasks,
      memos,
      diaryEntries,
      // fees는 현재 state에 없으므로 빈 배열
      fees: [],
    });
  }, [customers, companies, transactions, priceChecks, clientRequests, accounts, tasks, memos, diaryEntries]);

  // 검색 인덱스 자동 동기화 - 데이터 변경 시마다 인덱스 업데이트
  useEffect(() => {
    initSearchIndex({
      customers,
      companies,
      transactions,
      priceChecks,
      clientRequests,
      accounts,
      tasks,
      memos,
      diaryEntries,
      fees: [],
    });
  }, [customers, companies, transactions, priceChecks, clientRequests, accounts, tasks, memos, diaryEntries]);

  // 검색 입력값이 변경될 때마다 실시간 검색 (input 이벤트 리스너 방식)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput.trim().length >= 1) {
        const results = search(localSearchInput);
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 50);
    return () => clearTimeout(timer);
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

  // Header에 전달할 검색 핸들러 (input 이벤트 방식)
  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchInput(query);
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback(() => {
    if (localSearchInput.trim()) {
      const results = search(localSearchInput);
      setSearchResults(results);
      setShowSearchResults(true);
    }
  }, [localSearchInput]);

  // 검색 결과 클릭 시 카테고리로 이동
  const handleSearchResultClick = useCallback((result: SearchItem) => {
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
        />
        <div className="content-area">
          {renderPage()}
        </div>
      </main>

      {/* 전역 검색 결과 팝업 - searchIndex 기반 */}
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
                  "{localSearchInput}" 검색 결과 ({searchResults.length}건)
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
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>고객명, 종목명, 업체명 등을 검색해보세요</div>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <div
                    key={index}
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

export default App;