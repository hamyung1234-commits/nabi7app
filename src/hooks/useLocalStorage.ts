import * as XLSX from 'xlsx';
import { useState, useCallback } from 'react';

const STORAGE_VERSION = '1.0';
const STORAGE_KEY = `nabi-data-${STORAGE_VERSION}`;

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`${STORAGE_KEY}-${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function useAppState() {
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'memo');
  const [selectedDate, setSelectedDate] = useLocalStorage('selectedDate', new Date().toISOString().split('T')[0]);
  const [memos, setMemos] = useLocalStorage<any[]>('memos', []);
  const [priceChecks, setPriceChecks] = useLocalStorage<any[]>('priceChecks', []);
  const [clientRequests, setClientRequests] = useLocalStorage<any[]>('clientRequests', []);
  const [companies, setCompanies] = useLocalStorage<any[]>('companies', []);
  const [transactions, setTransactions] = useLocalStorage<any[]>('transactions', []);
  const [tasks, setTasks] = useLocalStorage<any[]>('tasks', []);
  const [accounts, setAccounts] = useLocalStorage<any[]>('accounts', []);
  const [diaryEntries, setDiaryEntries] = useLocalStorage<any[]>('diaryEntries', []);
  const [attachments, setAttachments] = useLocalStorage<any[]>('attachments', []);
  const [customers, setCustomers] = useLocalStorage<any[]>('customers', []);
  const [searchQuery, setSearchQuery] = useLocalStorage('searchQuery', '');
  
  // 검색 결과로 선택된 항목 (상세 보기를 위해)
  const [selectedItemId, setSelectedItemId] = useLocalStorage<string | null>('selectedItemId', null);
  const [selectedItemType, setSelectedItemType] = useLocalStorage<string | null>('selectedItemType', null);

  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    
    // 시세체크
    if (priceChecks.length > 0) {
      const pcData = priceChecks.map((p: any) => ({
        '종목명': p.stockName,
        '날짜': p.date,
        '매도시세': p.sellPrice,
        '매수시세': p.buyPrice,
        '물량': p.quantity,
        '보유업체': p.holderCompany,
        '메모': p.memo,
        '등록일': p.createdAt
      }));
      const pcSheet = XLSX.utils.json_to_sheet(pcData);
      XLSX.utils.book_append_sheet(wb, pcSheet, '시세체크');
    }

    // 고객 의뢰내역
    if (clientRequests.length > 0) {
      const crData = clientRequests.map((c: any) => ({
        '고객명': c.clientName,
        '연락처': c.contact,
        '의뢰종목': c.targetStock,
        '의뢰유형': c.requestType === 'buy' ? '매수' : '매도',
        '수량': c.quantity,
        '희망가': c.desiredPrice,
        '의뢰일': c.requestDate,
        '상태': c.status === 'in-progress' ? '진행중' : c.status === 'completed' ? '완료' : c.status === 'pending' ? '대기' : '보류',
        '메모': c.memo
      }));
      const crSheet = XLSX.utils.json_to_sheet(crData);
      XLSX.utils.book_append_sheet(wb, crSheet, '고객의뢰');
    }

    // 기업정보
    if (companies.length > 0) {
      const coData = companies.map((c: any) => ({
        '종목명': c.stockName,
        '업종': c.industry,
        '현재시세': c.currentPrice,
        '액면가': c.parValue,
        '발행주식수': c.totalShares,
        '자본총계': c.totalCapital,
        '부채총계': c.totalDebt,
        '매출': c.revenue,
        '영업이익': c.operatingProfit,
        '순이익': c.netProfit,
        '업종PER': c.industryPER
      }));
      const coSheet = XLSX.utils.json_to_sheet(coData);
      XLSX.utils.book_append_sheet(wb, coSheet, '기업정보');
    }

    // 거래내역
    if (transactions.length > 0) {
      const txData = transactions.map((t: any) => ({
        '날짜': t.date,
        '종목명': t.stockName,
        '매입처': t.buyer,
        '수량': t.buyQuantity,
        '매입단가': t.buyUnitPrice,
        '총액(매수)': t.buyTotal,
        '매출처': t.seller,
        '매출단가': t.sellUnitPrice,
        '매도총액': t.sellTotal,
        '양도차액': t.transferProfit,
        '실수령액': t.actualReceipt,
        '고객명': t.customerName,
        '담당': t.manager
      }));
      const txSheet = XLSX.utils.json_to_sheet(txData);
      XLSX.utils.book_append_sheet(wb, txSheet, '거래내역');
    }

    // 진행 리스트
    if (tasks.length > 0) {
      const tkData = tasks.map((t: any) => ({
        '업무명': t.title,
        '관련종목': t.relatedStock,
        '고객': t.client,
        '마감일': t.dueDate,
        '상태': t.status === 'in-progress' ? '진행중' : t.status === 'completed' ? '완료' : t.status === 'waiting' ? '대기' : '보류'
      }));
      const tkSheet = XLSX.utils.json_to_sheet(tkData);
      XLSX.utils.book_append_sheet(wb, tkSheet, '진행리스트');
    }

    // 계좌정보
    if (accounts.length > 0) {
      const acData = accounts.map((a: any) => ({
        '은행/증권사': a.bankName,
        '계좌번호': a.accountNumber,
        '예금주': a.accountHolder,
        '용도': a.purpose,
        '메모': a.memo
      }));
      const acSheet = XLSX.utils.json_to_sheet(acData);
      XLSX.utils.book_append_sheet(wb, acSheet, '계좌정보');
    }

    // 고객정보
    if (customers.length > 0) {
      const cuData = customers.map((c: any) => ({
        '고객명': c.name,
        '연락처': c.contact,
        '고객유형': c.customerType === 'seller' ? '매도' : c.customerType === 'buyer' ? '매수' : '양방향',
        '담당자': c.manager,
        '최초거래일': c.firstDealDate,
        '최근거래일': c.recentDealDate,
        '관심종목': c.interestedStocks,
        '은행명': c.bankName,
        '계좌번호': c.accountNumber,
        '예금주': c.accountHolder,
        '상태': c.status === 'active' ? '활성' : c.status === 'inactive' ? '휴면' : '블랙리스트',
        '메모': c.memo
      }));
      const cuSheet = XLSX.utils.json_to_sheet(cuData);
      XLSX.utils.book_append_sheet(wb, cuSheet, '고객정보');
    }

    // 전체 메모
    if (diaryEntries.length > 0) {
      const deData = diaryEntries.map((d: any) => ({
        '날짜': d.date,
        '내용': d.content,
        '태그': d.tags.join(', ')
      }));
      const deSheet = XLSX.utils.json_to_sheet(deData);
      XLSX.utils.book_append_sheet(wb, deSheet, '전체메모');
    }

    const fileName = `나비_백업_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [priceChecks, clientRequests, companies, transactions, tasks, accounts, customers, diaryEntries]);

  const exportData = useCallback(() => {
    const data = {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      activeCategory,
      selectedDate,
      memos,
      priceChecks,
      clientRequests,
      companies,
      transactions,
      tasks,
      accounts,
      diaryEntries,
      attachments,
      customers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nabi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeCategory, selectedDate, memos, priceChecks, clientRequests, companies, transactions, tasks, accounts, diaryEntries, attachments, customers]);

  const importData = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.activeCategory !== undefined) setActiveCategory(data.activeCategory);
      if (data.selectedDate !== undefined) setSelectedDate(data.selectedDate);
      if (data.memos !== undefined) setMemos(data.memos);
      if (data.priceChecks !== undefined) setPriceChecks(data.priceChecks);
      if (data.clientRequests !== undefined) setClientRequests(data.clientRequests);
      if (data.companies !== undefined) setCompanies(data.companies);
      if (data.transactions !== undefined) setTransactions(data.transactions);
      if (data.tasks !== undefined) setTasks(data.tasks);
      if (data.accounts !== undefined) setAccounts(data.accounts);
      if (data.diaryEntries !== undefined) setDiaryEntries(data.diaryEntries);
      if (data.attachments !== undefined) setAttachments(data.attachments);
      if (data.customers !== undefined) setCustomers(data.customers);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }, [setActiveCategory, setSelectedDate, setMemos, setPriceChecks, setClientRequests, setCompanies, setTransactions, setTasks, setAccounts, setDiaryEntries, setAttachments, setCustomers]);

  // Clear selected item (called after viewing detail)
  const clearSelectedItem = useCallback(() => {
    setSelectedItemId(null);
    setSelectedItemType(null);
  }, [setSelectedItemId, setSelectedItemType]);

  return {
    activeCategory, setActiveCategory,
    selectedDate, setSelectedDate,
    memos, setMemos,
    priceChecks, setPriceChecks,
    clientRequests, setClientRequests,
    companies, setCompanies,
    transactions, setTransactions,
    tasks, setTasks,
    accounts, setAccounts,
    diaryEntries, setDiaryEntries,
    attachments, setAttachments,
    customers, setCustomers,
    searchQuery, setSearchQuery,
    selectedItemId, setSelectedItemId,
    selectedItemType, setSelectedItemType,
    clearSelectedItem,
    exportData,
    exportToExcel,
    importData,
  };
}
