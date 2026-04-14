import { useMemo } from 'react';
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
  } = useAppState();

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
          onSearchChange={setSearchQuery}
          onExport={exportData}
          onExportExcel={exportToExcel}
          onImport={handleImport}
        />
        <div className="content-area">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;