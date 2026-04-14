/**
 * Search Index Management Utility
 * Searches data from Supabase with local fallback
 */

import {
  customersService,
  companiesService,
  transactionsService,
  priceChecksService,
  clientRequestsService,
  accountsService,
  memosService,
  tasksService,
  diaryEntriesService,
} from './supabaseService';

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

// Search index instance
let searchIndex: SearchItem[] = [];

// Loading state
let isLoading = false;

// Category mapping
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

// Internal helper: Create SearchItem from data
function createSearchItem(type: string, data: any): SearchItem {
  const category = TYPE_CATEGORY_MAP[type] || type;
  let title = '', subtitle = '', detail = '', date = '';

  switch (type) {
    case 'customer':
      title = data.name || '이름 없음';
      subtitle = `${data.customer_type === 'seller' ? '매도' : data.customer_type === 'buyer' ? '매수' : '양방향'} | ${data.contact || ''}`;
      detail = [data.name, data.contact, data.interested_stocks, data.manager, data.memo, data.bank_name, data.account_number].filter(Boolean).join(' ');
      date = data.first_deal_date;
      break;
    case 'company':
      title = data.stock_name || '종목명 없음';
      subtitle = `${data.industry || ''} | 시세: ${data.current_price?.toLocaleString() || '0'}원`;
      detail = [data.stock_name, data.industry, data.memo, data.par_value, data.total_shares].filter(Boolean).join(' ');
      break;
    case 'transaction':
      title = data.stock_name || '종목명 없음';
      subtitle = `${data.date} | ${data.customer_name || ''} | ${data.sell_total?.toLocaleString() || '0'}원`;
      detail = [data.stock_name, data.customer_name, data.buyer, data.seller, data.manager, data.memo].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'pricecheck':
      title = data.stock_name || '종목명 없음';
      subtitle = `${data.date} | ${data.holder_company || ''}`;
      detail = [data.stock_name, data.holder_company, data.memo].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'request':
      title = data.target_stock || '종목명 없음';
      subtitle = `${data.client_name || ''} | ${data.request_type === 'buy' ? '매수' : '매도'} | ${data.quantity}주`;
      detail = [data.target_stock, data.client_name, data.contact, data.memo, data.desired_price].filter(Boolean).join(' ');
      date = data.request_date;
      break;
    case 'account':
      title = data.bank_name || '은행명 없음';
      subtitle = `${data.account_number || ''} | ${data.account_holder || ''}`;
      detail = [data.bank_name, data.account_number, data.account_holder, data.purpose, data.memo].filter(Boolean).join(' ');
      break;
    case 'task':
      title = data.title || '제목 없음';
      subtitle = `${data.status === 'completed' ? '✅ 완료' : '📋 진행중'} | ${data.client || ''}`;
      detail = [data.title, data.description, data.client, data.related_stock, data.memo].filter(Boolean).join(' ');
      date = data.due_date;
      break;
    case 'memo':
      title = data.title || '제목 없음';
      subtitle = data.content?.substring(0, 60) || '내용 없음';
      detail = [data.title, data.content].filter(Boolean).join(' ');
      date = data.created_at;
      break;
    case 'diary':
      title = data.date;
      subtitle = data.content?.substring(0, 60) || '내용 없음';
      detail = [data.content].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'fee':
      title = data.stock_name || data.company_name || '종목명 없음';
      subtitle = `${data.date} | 수고비: ${data.fee_amount?.toLocaleString() || '0'}원`;
      detail = [data.stock_name, data.company_name, data.customer_name, data.memo].filter(Boolean).join(' ');
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
 * Initialize search index from Supabase
 */
export async function initSearchIndexFromDB(): Promise<void> {
  if (isLoading) return;
  isLoading = true;
  searchIndex = [];

  try {
    // Fetch all data from Supabase in parallel
    const [
      customers,
      companies,
      transactions,
      priceChecks,
      clientRequests,
      accounts,
      memos,
      tasks,
      diaryEntries,
    ] = await Promise.allSettled([
      customersService.getAll(),
      companiesService.getAll(),
      transactionsService.getAll(),
      priceChecksService.getAll(),
      clientRequestsService.getAll(),
      accountsService.getAll(),
      memosService.getAll(),
      tasksService.getAll(),
      diaryEntriesService.getAll(),
    ]);

    // Process customers
    if (customers.status === 'fulfilled' && customers.value) {
      customers.value.forEach((c: any) => {
        searchIndex.push(createSearchItem('customer', c));
      });
    }

    // Process companies
    if (companies.status === 'fulfilled' && companies.value) {
      companies.value.forEach((c: any) => {
        searchIndex.push(createSearchItem('company', c));
      });
    }

    // Process transactions
    if (transactions.status === 'fulfilled' && transactions.value) {
      transactions.value.forEach((t: any) => {
        searchIndex.push(createSearchItem('transaction', t));
      });
    }

    // Process price checks
    if (priceChecks.status === 'fulfilled' && priceChecks.value) {
      priceChecks.value.forEach((p: any) => {
        searchIndex.push(createSearchItem('pricecheck', p));
      });
    }

    // Process client requests
    if (clientRequests.status === 'fulfilled' && clientRequests.value) {
      clientRequests.value.forEach((r: any) => {
        searchIndex.push(createSearchItem('request', r));
      });
    }

    // Process accounts
    if (accounts.status === 'fulfilled' && accounts.value) {
      accounts.value.forEach((a: any) => {
        searchIndex.push(createSearchItem('account', a));
      });
    }

    // Process memos
    if (memos.status === 'fulfilled' && memos.value) {
      memos.value.forEach((m: any) => {
        searchIndex.push(createSearchItem('memo', m));
      });
    }

    // Process tasks
    if (tasks.status === 'fulfilled' && tasks.value) {
      tasks.value.forEach((t: any) => {
        searchIndex.push(createSearchItem('task', t));
      });
    }

    // Process diary entries
    if (diaryEntries.status === 'fulfilled' && diaryEntries.value) {
      diaryEntries.value.forEach((d: any) => {
        searchIndex.push(createSearchItem('diary', d));
      });
    }

    console.log('[SearchIndex] Initialized from DB with', searchIndex.length, 'items');
  } catch (error) {
    console.error('[SearchIndex] Failed to initialize from DB:', error);
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize search index (legacy - now uses Supabase)
 */
export function initSearchIndex(_appState?: any): void {
  // Supabase integration: We'll fetch from DB when needed
  console.log('[SearchIndex] initSearchIndex called - use initSearchIndexFromDB for Supabase');
  // Legacy localStorage data support removed for Supabase integration
}

/**
 * Search execution - case insensitive
 */
export function search(query: string): SearchItem[] {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  
  const results = searchIndex.filter(item => {
    const searchableText = [
      item.title,
      item.subtitle,
      item.detail,
      item.date || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery);
  });
  
  console.log('[Search] Query:', query, 'Results:', results.length);
  return results;
}

/**
 * Direct Supabase search - queries DB directly for each table
 */
export async function searchFromDB(query: string): Promise<SearchItem[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const results: SearchItem[] = [];
  const q = query.toLowerCase().trim();

  try {
    // Search customers
    const customers = await customersService.getAll();
    customers?.filter((c: any) =>
      c.name?.toLowerCase().includes(q) ||
      c.contact?.toLowerCase().includes(q) ||
      c.interested_stocks?.toLowerCase().includes(q) ||
      c.manager?.toLowerCase().includes(q)
    ).forEach((c: any) => {
      results.push(createSearchItem('customer', c));
    });

    // Search companies
    const companies = await companiesService.getAll();
    companies?.filter((c: any) =>
      c.stock_name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q)
    ).forEach((c: any) => {
      results.push(createSearchItem('company', c));
    });

    // Search transactions
    const transactions = await transactionsService.getAll();
    transactions?.filter((t: any) =>
      t.stock_name?.toLowerCase().includes(q) ||
      t.customer_name?.toLowerCase().includes(q) ||
      t.buyer?.toLowerCase().includes(q) ||
      t.seller?.toLowerCase().includes(q)
    ).forEach((t: any) => {
      results.push(createSearchItem('transaction', t));
    });

    // Search price checks
    const priceChecks = await priceChecksService.getAll();
    priceChecks?.filter((p: any) =>
      p.stock_name?.toLowerCase().includes(q) ||
      p.holder_company?.toLowerCase().includes(q)
    ).forEach((p: any) => {
      results.push(createSearchItem('pricecheck', p));
    });

    // Search client requests
    const requests = await clientRequestsService.getAll();
    requests?.filter((r: any) =>
      r.client_name?.toLowerCase().includes(q) ||
      r.target_stock?.toLowerCase().includes(q)
    ).forEach((r: any) => {
      results.push(createSearchItem('request', r));
    });

    // Search accounts
    const accounts = await accountsService.getAll();
    accounts?.filter((a: any) =>
      a.bank_name?.toLowerCase().includes(q) ||
      a.account_holder?.toLowerCase().includes(q)
    ).forEach((a: any) => {
      results.push(createSearchItem('account', a));
    });

    // Search memos
    const memos = await memosService.getAll();
    memos?.filter((m: any) =>
      m.title?.toLowerCase().includes(q) ||
      m.content?.toLowerCase().includes(q)
    ).forEach((m: any) => {
      results.push(createSearchItem('memo', m));
    });

    // Search tasks
    const tasks = await tasksService.getAll();
    tasks?.filter((t: any) =>
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    ).forEach((t: any) => {
      results.push(createSearchItem('task', t));
    });

    // Search diary entries
    const diary = await diaryEntriesService.getAll();
    diary?.filter((d: any) =>
      d.content?.toLowerCase().includes(q)
    ).forEach((d: any) => {
      results.push(createSearchItem('diary', d));
    });

    console.log('[SearchFromDB] Query:', query, 'Results:', results.length);
    return results;
  } catch (error) {
    console.error('[SearchFromDB] Error:', error);
    return [];
  }
}

/**
 * Get full index
 */
export function getIndex(): SearchItem[] {
  return [...searchIndex];
}

/**
 * Check if index is loaded
 */
export function isIndexLoaded(): boolean {
  return searchIndex.length > 0;
}

/**
 * Refresh index from DB
 */
export async function refreshIndex(): Promise<void> {
  await initSearchIndexFromDB();
}