import { useState, useEffect, useCallback, useRef } from 'react';
import { CATEGORIES, CategoryId } from './types';
import { useAppState } from './hooks/useLocalStorage';
import { searchFromDB, initSearchIndexFromDB, SearchItem } from './lib/searchIndex';
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
import { CountProvider, useSidebarCounts } from './contexts/CountContext';

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

function AppContent() {
  const {
    activeCategory,
    setActiveCategory,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    exportData,
    exportToExcel,
    importData,
    selectedItemId,
    selectedItemType,
    setSelectedItemId,
    setSelectedItemType,
    clearSelectedItem,
  } = useAppState();

  // Get counts from CountProvider for sidebar
  const computedCounts = useSidebarCounts();

  // 하이라이트 상태 (검색 결과에서 선택된 항목 강조 표시)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  // 검색 입력값의 로컬 상태
  const [localSearchInput, setLocalSearchInput] = useState('');
  // 검색 결과 팝업 상태
  const [showSearchResults, setShowSearchResults] = useState(false);
  // 검색 결과
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // Track previous category to detect navigation
  const prevCategoryRef = useRef<string>(activeCategory);

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
  }, []);

  // When category changes, clear the selected item after it's been processed
  useEffect(() => {
    if (prevCategoryRef.current !== activeCategory) {
      prevCategoryRef.current = activeCategory;
    }
  }, [activeCategory]);

  // 검색 진행 중 상태
  const [isSearching, setIsSearching] = useState(false);
  // 디버그 로그 보기
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Search when input changes (debounced)
  useEffect(() => {
    if (localSearchInput.length >= 1) {
      setDebugInfo(`"${localSearchInput}" 검색 중...`);
      const timer = setTimeout(async () => {
        setIsSearching(true);
        console.log('[App] Starting search for:', localSearchInput);
        try {
          const results = await searchFromDB(localSearchInput);
          console.log('[App] Search completed. Results:', results.length);
          setSearchResults(results);
          setShowSearchResults(true);
          setDebugInfo(`"${localSearchInput}" 검색 결과: ${results.length}건`);
        } catch (error) {
          console.error('[App] Search error:', error);
          setSearchResults([]);
          setDebugInfo(`검색 오류: ${error}`);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setDebugInfo('');
    }
  }, [localSearchInput]);

  // 검색 결과 닫기 (검색 UI만 닫음 - 선택된 항목은 유지)
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

  // 검색 결과 클릭 시 카테고리로 이동하고 해당 항목 선택 + 하이라이트
  const handleSearchResultClick = useCallback((result: SearchItem) => {
    console.log('[App] Result clicked:', result.title, 'Type:', result.type, 'OriginalID:', result.originalId);
    
    // Use originalId which is the actual UUID from the database
    const itemId = result.originalId || result.id.split('-').slice(1).join('-');
    console.log('[App] Using itemId:', itemId);
    
    // Set selected item ID and type BEFORE navigating
    setSelectedItemId(itemId);
    setSelectedItemType(result.type);
    
    // Navigate to the category
    const categoryId = CATEGORY_MAP[result.type];
    if (categoryId) {
      console.log('[App] Navigating to category:', categoryId);
      setActiveCategory(categoryId as CategoryId);
      
      // 2초간 하이라이트 설정
      setHighlightedItemId(itemId);
      
      // 기존 타이머をクリア
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      
      // 2초 후 하이라이트 제거
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedItemId(null);
      }, 2000);
    } else {
      console.warn('[App] No category mapping for type:', result.type);
    }
    
    // Close search popup
    setShowSearchResults(false);
    setLocalSearchInput('');
    setSearchResults([]);
  }, [setSelectedItemId, setSelectedItemType, setActiveCategory]);

  // Render page with selected item props
  const renderPage = () => {
    const pageProps = {
      selectedItemId,
      selectedItemType,
      highlightedItemId,
      onClearSelection: clearSelectedItem,
    };

    switch (activeCategory as string) {
      case 'memo':
        return <MemoPage {...pageProps} />;
      case 'price-check':
        return <PriceCheckPage {...pageProps} />;
      case 'client-requests':
        return <ClientRequestsPage {...pageProps} />;
      case 'company-info':
        return <CompanyInfoPage {...pageProps} />;
      case 'fee-calculator':
        return <FeeCalculatorPage {...pageProps} />;
      case 'transactions':
        return <TransactionPage {...pageProps} />;
      case 'task-list':
        return <TaskListPage {...pageProps} />;
      case 'account-info':
        return <AccountInfoPage {...pageProps} />;
      case 'diary':
        return <DiaryPage {...pageProps} />;
      case 'customer':
        return <CustomerPage {...pageProps} />;
      default:
        return <MemoPage {...pageProps} />;
    }
  };

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="app">
      {/* 디버그 정보 (개발용) */}
      {debugInfo && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 9999,
        }}>
          {debugInfo}
        </div>
      )}
      <Sidebar
        categories={CATEGORIES}
        activeCategory={activeCategory as CategoryId}
        onCategoryChange={(id) => setActiveCategory(id)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        categoryCounts={computedCounts}
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

      {/* 전역 검색 결과 팝업 */}
      {(showSearchResults && localSearchInput.trim()) && (
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
                  "{localSearchInput}"{isSearching ? ' 검색 중...' : ` 검색 결과${searchResults.length > 0 ? ` (${searchResults.length}건)` : ''}`}
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
                    모든 카테고리에서 검색 중 • 총 {searchResults.length}개 항목
                  </div>
                </div>
              ) : (
                <>
                  {/* 카테고리별 결과 요약 */}
                  <div style={{
                    padding: '10px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>전체 {searchResults.length}건:</span>
                    {(() => {
                      const byCategory = searchResults.reduce((acc, item) => {
                        acc[item.categoryLabel] = (acc[item.categoryLabel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      return Object.entries(byCategory).map(([cat, count]) => (
                        <span key={cat} style={{
                          background: categoryColorMap[cat] || '#1a3a5c',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                        }}>
                          {cat} {count}건
                        </span>
                      ));
                    })()}
                  </div>
                  {/* 결과 목록 */}
                  <div style={{ overflow: 'auto', flex: 1, maxHeight: '420px' }}>
                    {searchResults.map((result, index) => (
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
                            background: categoryColorMap[result.categoryLabel] || '#1a3a5c',
                            color: 'white',
                            fontWeight: 600,
                          }}>
                            [{result.categoryLabel}]
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
                    ))}
                  </div>
                </>
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
              클릭하면 해당 카테고리로 이동하여 상세 내용을 확인합니다 • ESC 키로 닫기
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 카테고리별 색상 (searchIndex에서 import)
const categoryColorMap: Record<string, string> = {
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

function App() {
  return (
    <CountProvider>
      <AppContent />
    </CountProvider>
  );
}

export default App;