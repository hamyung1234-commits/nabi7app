/**
 * 검색 인덱스 관리 유틸리티
 * 모든 카테고리 데이터를 통합 검색 인덱스로 관리
 */

export interface SearchItem {
  id: string;
  type: 'customer' | 'company' | 'transaction' | 'pricecheck' | 'request' | 'account' | 'diary' | 'memo' | 'task' | 'fee';
  category: string;
  title: string;
  subtitle: string;
  detail: string;
  date?: string;
  rawData: any;
}

// 검색 인덱스 인스턴스
let searchIndex: SearchItem[] = [];

// 로컬 스토리지 키
const SEARCH_INDEX_KEY = 'nabi-search-index';

// 카테고리 매핑
const TYPE_CATEGORY_MAP: Record<string, string> = {
  'customer': '고객정보',
  'company': '기업정보',
  'transaction': '거래내역',
  'pricecheck': '시세체크',
  'request': '고객의뢰',
  'account': '계좌정보',
  'task': '진행리스트',
  'memo': '메모',
  'diary': '다이어리',
  'fee': '수고비계산',
};

// 내부 helper: 데이터에서 SearchItem 생성
function createSearchItem(type: string, data: any): SearchItem {
  const category = TYPE_CATEGORY_MAP[type] || type;
  let title = '', subtitle = '', detail = '', date = '';

  switch (type) {
    case 'customer':
      title = data.name || '이름 없음';
      subtitle = `${data.customerType === 'seller' ? '매도' : data.customerType === 'buyer' ? '매수' : '양방향'} | ${data.contact || ''}`;
      detail = [data.name, data.contact, data.interestedStocks, data.manager, data.memo, data.bankName, data.accountNumber].filter(Boolean).join(' ');
      date = data.firstDealDate;
      break;
    case 'company':
      title = data.stockName || '종목명 없음';
      subtitle = `${data.industry || ''} | 시세: ${data.currentPrice?.toLocaleString() || '0'}원`;
      detail = [data.stockName, data.industry, data.memo, data.parValue, data.totalShares].filter(Boolean).join(' ');
      break;
    case 'transaction':
      title = data.stockName || '종목명 없음';
      subtitle = `${data.date} | ${data.customerName || ''} | ${data.sellTotal?.toLocaleString() || '0'}원`;
      detail = [data.stockName, data.customerName, data.buyer, data.seller, data.manager, data.memo, data.note].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'pricecheck':
      title = data.stockName || '종목명 없음';
      subtitle = `${data.date} | ${data.holderCompany || ''}`;
      detail = [data.stockName, data.holderCompany, data.memo, data.note].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'request':
      title = data.targetStock || '종목명 없음';
      subtitle = `${data.clientName || ''} | ${data.requestType === 'buy' ? '매수' : '매도'} | ${data.quantity}주`;
      detail = [data.targetStock, data.clientName, data.contact, data.memo, data.note, data.desiredPrice].filter(Boolean).join(' ');
      date = data.requestDate;
      break;
    case 'account':
      title = data.bankName || '은행명 없음';
      subtitle = `${data.accountNumber || ''} | ${data.accountHolder || ''}`;
      detail = [data.bankName, data.accountNumber, data.accountHolder, data.purpose, data.memo].filter(Boolean).join(' ');
      break;
    case 'task':
      title = data.title || '제목 없음';
      subtitle = `${data.status === 'completed' ? '✅ 완료' : '📋 진행중'} | ${data.client || ''}`;
      detail = [data.title, data.description, data.client, data.relatedStock, data.memo, data.note].filter(Boolean).join(' ');
      date = data.dueDate;
      break;
    case 'memo':
      title = data.title || '제목 없음';
      subtitle = data.content?.substring(0, 60) || '내용 없음';
      detail = [data.title, data.content, data.tags?.join(' ')].filter(Boolean).join(' ');
      date = data.createdAt;
      break;
    case 'diary':
      title = data.date;
      subtitle = data.content?.substring(0, 60) || '내용 없음';
      detail = [data.content, data.tags?.join(' ')].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'fee':
      title = data.stockName || data.companyName || '종목명 없음';
      subtitle = `${data.date} | 수고비: ${data.feeAmount?.toLocaleString() || '0'}원`;
      detail = [data.stockName, data.companyName, data.customerName, data.memo].filter(Boolean).join(' ');
      date = data.date;
      break;
  }

  return {
    id: `${type}-${data.id || Date.now()}`,
    type: type as SearchItem['type'],
    category,
    title,
    subtitle,
    detail,
    date,
    rawData: data,
  };
}

/**
 * 검색 인덱스 초기화 - localStorage에서 전체 데이터 로드
 */
export function initSearchIndex(appState: any): void {
  searchIndex = [];

  // 1. 고객정보
  if (appState.customers) {
    appState.customers.forEach((c: any) => {
      searchIndex.push(createSearchItem('customer', c));
    });
  }

  // 2. 기업정보
  if (appState.companies) {
    appState.companies.forEach((c: any) => {
      searchIndex.push(createSearchItem('company', c));
    });
  }

  // 3. 거래내역
  if (appState.transactions) {
    appState.transactions.forEach((t: any) => {
      searchIndex.push(createSearchItem('transaction', t));
    });
  }

  // 4. 시세체크
  if (appState.priceChecks) {
    appState.priceChecks.forEach((p: any) => {
      searchIndex.push(createSearchItem('pricecheck', p));
    });
  }

  // 5. 고객의뢰
  if (appState.clientRequests) {
    appState.clientRequests.forEach((r: any) => {
      searchIndex.push(createSearchItem('request', r));
    });
  }

  // 6. 수고비계산
  if (appState.fees) {
    appState.fees.forEach((f: any) => {
      searchIndex.push(createSearchItem('fee', f));
    });
  }

  // 7. 계좌정보
  if (appState.accounts) {
    appState.accounts.forEach((a: any) => {
      searchIndex.push(createSearchItem('account', a));
    });
  }

  // 8. 할 일 (진행리스트)
  if (appState.tasks) {
    appState.tasks.forEach((t: any) => {
      searchIndex.push(createSearchItem('task', t));
    });
  }

  // 9. 메모
  if (appState.memos) {
    appState.memos.forEach((m: any) => {
      searchIndex.push(createSearchItem('memo', m));
    });
  }

  // 10. 다이어리
  if (appState.diaryEntries) {
    appState.diaryEntries.forEach((d: any) => {
      searchIndex.push(createSearchItem('diary', d));
    });
  }

  // localStorage에 캐싱
  cacheIndex();
}

/**
 * 검색 실행 - 대소문자 무시, includes() 사용
 */
export function search(query: string): SearchItem[] {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  
  return searchIndex.filter(item => {
    const searchableText = [
      item.title,
      item.subtitle,
      item.detail,
      item.date || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery);
  });
}

/**
 * 데이터 추가 시 인덱스에 자동 추가
 */
export function addToIndex(type: string, data: any): void {
  const item = createSearchItem(type, data);
  const existingIndex = searchIndex.findIndex(i => i.id === item.id);
  if (existingIndex >= 0) {
    searchIndex[existingIndex] = item;
  } else {
    searchIndex.push(item);
  }
  cacheIndex();
}

/**
 * 데이터 삭제 시 인덱스에서 자동 제거
 */
export function removeFromIndex(id: string): void {
  searchIndex = searchIndex.filter(item => item.id !== id);
  cacheIndex();
}

/**
 * 전체 인덱스 가져오기
 */
export function getIndex(): SearchItem[] {
  return [...searchIndex];
}

// localStorage에 검색 인덱스 캐싱
function cacheIndex(): void {
  try {
    localStorage.setItem(SEARCH_INDEX_KEY, JSON.stringify(searchIndex));
  } catch (e) {
    console.warn('Failed to cache search index:', e);
  }
}

// localStorage에서 검색 인덱스 복원 (앱 재시작 시)
export function loadCachedIndex(): SearchItem[] | null {
  try {
    const cached = localStorage.getItem(SEARCH_INDEX_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
}