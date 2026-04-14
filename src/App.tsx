import { useMemo, useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CategoryId } from './types';
import { useAppState } from './hooks/useLocalStorage';
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

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  category: string;
  data: any;
}

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
  } = useAppState();

  // 검색 입력값의 로컬 상태 (즉시 반응을 위해)
  const [localSearchInput, setLocalSearchInput] = useState('');
  // 검색 결과 팝업 상태 관리
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 로컬 입력값이 변경될 때 검색 결과 팝업 자동 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput && localSearchInput.trim().length >= 1) {
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    }, 50); // 짧은 딜레이로 상태 반영 보장
    return () => clearTimeout(timer);
  }, [localSearchInput]);

  // 검색 결과 닫기 함수
  const closeSearchResults = useCallback(() => {
    setShowSearchResults(false);
    setLocalSearchInput('');
    setSearchQuery('');
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

  // 전역 검색 결과 (localSearchInput 사용으로 즉시 반응)
  const searchResults = useMemo(() => {
    if (!localSearchInput.trim()) return [];
    
    const query = localSearchInput.toLowerCase();
    const results: SearchResult[] = [];

    // 고객 검색
    customers.forEach((c: any) => {
      if (c.name?.toLowerCase().includes(query) || 
          c.contact?.includes(query) ||
          c.interestedStocks?.toLowerCase().includes(query)) {
        results.push({
          type: 'customer',
          title: c.name,
          subtitle: `${c.customerType === 'seller' ? '매도' : c.customerType === 'buyer' ? '매수' : '양방향'} | ${c.contact}`,
          category: '고객정보',
          data: c,
        });
      }
    });

    // 기업/종목 검색
    companies.forEach((c: any) => {
      if (c.stockName?.toLowerCase().includes(query)) {
        results.push({
          type: 'company',
          title: c.stockName,
          subtitle: `${c.industry} | 시세: ${c.currentPrice?.toLocaleString()}원`,
          category: '기업정보',
          data: c,
        });
      }
    });

    // 거래내역 검색
    transactions.forEach((t: any) => {
      if (t.stockName?.toLowerCase().includes(query) || 
          t.customerName?.toLowerCase().includes(query)) {
        results.push({
          type: 'transaction',
          title: t.stockName,
          subtitle: `${t.date} | ${t.customerName} | ${t.sellTotal?.toLocaleString()}원`,
          category: '거래내역',
          data: t,
        });
      }
    });

    // 시세체크 검색
    priceChecks.forEach((p: any) => {
      if (p.stockName?.toLowerCase().includes(query) ||
          p.holderCompany?.toLowerCase().includes(query)) {
        results.push({
          type: 'pricecheck',
          title: p.stockName,
          subtitle: `${p.date} | ${p.holderCompany}`,
          category: '시세체크',
          data: p,
        });
      }
    });

    // 고객 의뢰 검색
    clientRequests.forEach((r: any) => {
      if (r.clientName?.toLowerCase().includes(query) ||
          r.targetStock?.toLowerCase().includes(query)) {
        results.push({
          type: 'request',
          title: r.targetStock,
          subtitle: `${r.clientName} | ${r.requestType === 'buy' ? '매수' : '매도'} | ${r.quantity}주`,
          category: '고객의뢰',
          data: r,
        });
      }
    });

    // 메모 검색
    const memosData = localStorage.getItem('memos');
    const memos = memosData ? JSON.parse(memosData) : [];
    memos.forEach((m: any) => {
      if (m.content?.toLowerCase().includes(query) || m.title?.toLowerCase().includes(query)) {
        results.push({
          type: 'memo',
          title: m.title || '제목 없음',
          subtitle: m.content?.substring(0, 50) + (m.content?.length > 50 ? '...' : ''),
          category: '메모',
          data: m,
        });
      }
    });

    // 할 일 검색
    const tasksData = localStorage.getItem('tasks');
    const tasksDataList = tasksData ? JSON.parse(tasksData) : [];
    tasksDataList.forEach((t: any) => {
      if (t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query)) {
        results.push({
          type: 'task',
          title: t.title,
          subtitle: `${t.status === 'completed' ? '✅ 완료' : '📋 진행중'} | ${t.description || '설명 없음'}`,
          category: '할 일',
          data: t,
        });
      }
    });

    // 계좌 검색
    accounts.forEach((a: any) => {
      if (a.bankName?.toLowerCase().includes(query) ||
          a.accountHolder?.toLowerCase().includes(query)) {
        results.push({
          type: 'account',
          title: a.bankName,
          subtitle: `${a.accountNumber} | ${a.accountHolder}`,
          category: '계좌정보',
          data: a,
        });
      }
    });

    // 다이어리 검색
    diaryEntries.forEach((d: any) => {
      if (d.content?.toLowerCase().includes(query)) {
        results.push({
          type: 'diary',
          title: d.date,
          subtitle: d.content.substring(0, 50) + (d.content.length > 50 ? '...' : ''),
          category: '다이어리',
          data: d,
        });
      }
    });

    return results;
  }, [localSearchInput, customers, companies, transactions, priceChecks, clientRequests, accounts, diaryEntries]);

  // Header 컴포넌트에 전달할 검색 핸들러
  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchInput(query);
    setSearchQuery(query); // localStorage에도 저장
    // 검색어가 있으면 즉시 팝업 표시
    if (query.trim().length >= 1) {
      setShowSearchResults(true);
    }
  }, [setSearchQuery]);

  const handleSearchSubmit = useCallback(() => {
    if (localSearchInput.trim()) {
      setShowSearchResults(true);
    }
  }, [localSearchInput]);

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    // 카테고리 매핑 (type -> categoryId)
    const categoryMap: Record<string, string> = {
      'customer': 'customer',
      'company': 'company-info',
      'transaction': 'transactions',
      'pricecheck': 'price-check',
      'request': 'client-requests',
      'account': 'account-info',
      'diary': 'diary',
      'memo': 'memo',
      'task': 'task-list',
    };
    const categoryId = categoryMap[result.type];
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

      {/* 전역 검색 결과 팝업 */}
      {showSearchResults && localSearchInput.trim() && (
        <>
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
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            width: '500px',
            maxHeight: '550px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #e2e8f0',
          }}>
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
            <div style={{ overflow: 'auto', flex: 1, maxHeight: '450px' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔎</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>검색 결과가 없습니다</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>다른 검색어를 입력해보세요</div>
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
                        background: '#1a3a5c',
                        color: 'white',
                        fontWeight: 600,
                      }}>
                        {result.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{result.type}</span>
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

export default App;