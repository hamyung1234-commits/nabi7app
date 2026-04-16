/**
 * Search Index Management Utility
 * Searches data from Supabase with local fallback
 * Always searches ALL categories for comprehensive results
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
  originalId: string;  // Store the original ID separately for easier extraction
  type: 'customer' | 'company' | 'transaction' | 'pricecheck' | 'request' | 'account' | 'diary' | 'memo' | 'task' | 'fee';
  category: string;
  categoryLabel: string;  // 한국어 카테고리 이름
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

// Category mapping with Korean labels
const TYPE_CATEGORY_MAP: Record<string, { key: string; label: string; color: string }> = {
  'customer': { key: 'customer', label: '고객정보', color: '#059669' },
  'company': { key: 'company', label: '기업정보', color: '#7c3aed' },
  'transaction': { key: 'transaction', label: '거래내역', color: '#2563eb' },
  'pricecheck': { key: 'pricecheck', label: '시세체크', color: '#ea580c' },
  'request': { key: 'request', label: '고객의뢰', color: '#dc2626' },
  'account': { key: 'account', label: '계좌정보', color: '#0891b2' },
  'task': { key: 'task', label: '진행리스트', color: '#ca8a04' },
  'memo': { key: 'memo', label: '메모', color: '#4f46e5' },
  'diary': { key: 'diary', label: '다이어리', color: '#65a30d' },
  'fee': { key: 'fee', label: '수고비계산', color: '#9333ea' },
};

// Internal helper: Create SearchItem from data
function createSearchItem(type: string, data: any): SearchItem {
  const categoryInfo = TYPE_CATEGORY_MAP[type] || { key: type, label: type, color: '#1a3a5c' };
  const originalId = data.id || '';
  let title = '', subtitle = '', detail = '', date = '';

  switch (type) {
    case 'customer':
      title = data.name || '이름 없음';
      subtitle = `${data.customer_type === 'seller' ? '매도' : data.customer_type === 'buyer' ? '매수' : '양방향'} | ${data.contact || ''}`;
      detail = [data.name, data.contact, data.interested_stocks, data.manager, data.memo, data.bank_name, data.account_number].filter(Boolean).join(' ');
      date = data.first_deal_date || data.firstDealDate;
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
    id: `${type}-${originalId}`,
    originalId,
    type: type as SearchItem['type'],
    category: categoryInfo.key,
    categoryLabel: categoryInfo.label,
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

  console.log('[SearchIndex] Starting DB initialization...');

  try {
    // Fetch all data from Supabase in parallel - ALL categories
    const [
      customersResult,
      companiesResult,
      transactionsResult,
      priceChecksResult,
      clientRequestsResult,
      accountsResult,
      memosResult,
      tasksResult,
      diaryEntriesResult,
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

    // Helper to log and extract data
    const extractData = (name: string, result: PromiseSettledResult<any>): any[] => {
      if (result.status === 'fulfilled') {
        const data = Array.isArray(result.value) ? result.value : [];
        console.log(`[SearchIndex] ${name}: ${data.length} records`);
        return data;
      } else {
        console.error(`[SearchIndex] ${name} ERROR:`, result.reason?.message || result.reason);
        return [];
      }
    };

    const customers = extractData('customers', customersResult);
    const companies = extractData('companies', companiesResult);
    const transactions = extractData('transactions', transactionsResult);
    const priceChecks = extractData('priceChecks', priceChecksResult);
    const clientRequests = extractData('clientRequests', clientRequestsResult);
    const accounts = extractData('accounts', accountsResult);
    const memos = extractData('memos', memosResult);
    const tasks = extractData('tasks', tasksResult);
    const diaryEntries = extractData('diaryEntries', diaryEntriesResult);

    // Add items to search index - ALL categories
    customers.forEach((c: any) => searchIndex.push(createSearchItem('customer', c)));
    companies.forEach((c: any) => searchIndex.push(createSearchItem('company', c)));
    transactions.forEach((t: any) => searchIndex.push(createSearchItem('transaction', t)));
    priceChecks.forEach((p: any) => searchIndex.push(createSearchItem('pricecheck', p)));
    clientRequests.forEach((r: any) => searchIndex.push(createSearchItem('request', r)));
    accounts.forEach((a: any) => searchIndex.push(createSearchItem('account', a)));
    memos.forEach((m: any) => searchIndex.push(createSearchItem('memo', m)));
    tasks.forEach((t: any) => searchIndex.push(createSearchItem('task', t)));
    diaryEntries.forEach((d: any) => searchIndex.push(createSearchItem('diary', d)));

    console.log('[SearchIndex] Initialized from DB with', searchIndex.length, 'items across all categories');
  } catch (error) {
    console.error('[SearchIndex] Failed to initialize from DB:', error);
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize search index (legacy)
 */
export function initSearchIndex(_appState?: any): void {
  console.log('[SearchIndex] initSearchIndex called - use initSearchIndexFromDB for Supabase');
}

/**
 * Search execution - case insensitive, searches ALL categories
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
  
  console.log('[Search] Query:', query, 'Results:', results.length, '(from all categories)');
  return results;
}

/**
 * Get category color by category key
 */
export function getCategoryColor(category: string): string {
  const info = TYPE_CATEGORY_MAP[category];
  return info?.color || '#1a3a5c';
}

/**
 * Get category label by category key
 */
export function getCategoryLabel(category: string): string {
  const info = TYPE_CATEGORY_MAP[category];
  return info?.label || category;
}

/**
 * Direct Supabase search - queries DB directly for each table
 * ALWAYS searches ALL categories for comprehensive results
 * Falls back to localStorage if Supabase fails
 */
export async function searchFromDB(query: string): Promise<SearchItem[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const results: SearchItem[] = [];
  const q = query.toLowerCase().trim();

  console.log('[SearchFromDB] Starting comprehensive search for:', query, '(searching ALL categories)');

  try {
    // Fetch ALL data in parallel - 9 categories
    const [
      customersResult,
      companiesResult,
      transactionsResult,
      priceChecksResult,
      requestsResult,
      accountsResult,
      memosResult,
      tasksResult,
      diaryResult
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

    // Helper to log and extract data
    const logResult = (name: string, result: PromiseSettledResult<any>): any[] => {
      if (result.status === 'fulfilled') {
        const data = Array.isArray(result.value) ? result.value : [];
        console.log(`[SearchFromDB] ${name}: ${data.length} items`);
        return data;
      } else {
        console.error(`[SearchFromDB] ${name} error:`, result.reason);
        return [];
      }
    };

    const customers = logResult('customers', customersResult);
    const companies = logResult('companies', companiesResult);
    const transactions = logResult('transactions', transactionsResult);
    const priceChecks = logResult('priceChecks', priceChecksResult);
    const requests = logResult('requests', requestsResult);
    const accounts = logResult('accounts', accountsResult);
    const memos = logResult('memos', memosResult);
    const tasks = logResult('tasks', tasksResult);
    const diaryEntries = logResult('diaryEntries', diaryResult);

    // Check if we got no data - if so, try localStorage fallback
    const totalData = customers.length + companies.length + transactions.length + 
                      priceChecks.length + requests.length + accounts.length + 
                      memos.length + tasks.length + diaryEntries.length;

    if (totalData === 0) {
      console.log('[SearchFromDB] No data from Supabase, trying localStorage fallback...');
      return searchFromLocalStorage(query);
    }

    // Enhanced Supabase search - search ALL fields across ALL categories

    // 1. Search CUSTOMERS - ALL fields comprehensively
    const matchedCustomers = customers.filter((c: any) =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.contact && c.contact.toLowerCase().includes(q)) ||
      (c.customer_type && c.customer_type.toLowerCase().includes(q)) ||
      (c.customerType && c.customerType.toLowerCase().includes(q)) ||
      (c.manager && c.manager.toLowerCase().includes(q)) ||
      (c.interested_stocks && c.interested_stocks.toLowerCase().includes(q)) ||
      (c.interestedStocks && c.interestedStocks.toLowerCase().includes(q)) ||
      (c.memo && c.memo.toLowerCase().includes(q)) ||
      (c.bank_name && c.bank_name.toLowerCase().includes(q)) ||
      (c.bankName && c.bankName.toLowerCase().includes(q)) ||
      (c.account_number && c.account_number.toLowerCase().includes(q)) ||
      (c.accountNumber && c.accountNumber.toLowerCase().includes(q)) ||
      (c.account_holder && c.account_holder.toLowerCase().includes(q)) ||
      (c.accountHolder && c.accountHolder.toLowerCase().includes(q)) ||
      (c.status && c.status.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
    console.log(`[SearchFromDB] Customers matched: ${matchedCustomers.length}`);
    matchedCustomers.forEach((c: any) => results.push(createSearchItem('customer', c)));

    // 2. Search COMPANIES - ALL fields
    const matchedCompanies = companies.filter((c: any) =>
      (c.stock_name && c.stock_name.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q)) ||
      (c.memo && c.memo.toLowerCase().includes(q)) ||
      (c.par_value && String(c.par_value).toLowerCase().includes(q)) ||
      (c.total_shares && String(c.total_shares).toLowerCase().includes(q)) ||
      (c.listing_status && c.listing_status.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.business_number && c.business_number.toLowerCase().includes(q)) ||
      (c.representative && c.representative.toLowerCase().includes(q))
    );
    matchedCompanies.forEach((c: any) => results.push(createSearchItem('company', c)));

    // 3. Search TRANSACTIONS - ALL fields
    const matchedTransactions = transactions.filter((t: any) =>
      (t.stock_name && t.stock_name.toLowerCase().includes(q)) ||
      (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      (t.buyer && t.buyer.toLowerCase().includes(q)) ||
      (t.seller && t.seller.toLowerCase().includes(q)) ||
      (t.manager && t.manager.toLowerCase().includes(q)) ||
      (t.memo && t.memo.toLowerCase().includes(q)) ||
      (t.date && t.date.toLowerCase().includes(q)) ||
      (t.transaction_type && t.transaction_type.toLowerCase().includes(q)) ||
      (t.price && String(t.price).toLowerCase().includes(q)) ||
      (t.quantity && String(t.quantity).toLowerCase().includes(q))
    );
    matchedTransactions.forEach((t: any) => results.push(createSearchItem('transaction', t)));

    // 4. Search PRICE CHECKS - ALL fields
    const matchedPriceChecks = priceChecks.filter((p: any) =>
      (p.stock_name && p.stock_name.toLowerCase().includes(q)) ||
      (p.holder_company && p.holder_company.toLowerCase().includes(q)) ||
      (p.memo && p.memo.toLowerCase().includes(q)) ||
      (p.date && p.date.toLowerCase().includes(q)) ||
      (p.current_price && String(p.current_price).toLowerCase().includes(q)) ||
      (p.holder_name && p.holder_name.toLowerCase().includes(q)) ||
      (p.custodian && p.custodian.toLowerCase().includes(q))
    );
    matchedPriceChecks.forEach((p: any) => results.push(createSearchItem('pricecheck', p)));

    // 5. Search CLIENT REQUESTS - ALL fields
    const matchedRequests = requests.filter((r: any) =>
      (r.client_name && r.client_name.toLowerCase().includes(q)) ||
      (r.clientName && r.clientName.toLowerCase().includes(q)) ||
      (r.target_stock && r.target_stock.toLowerCase().includes(q)) ||
      (r.targetStock && r.targetStock.toLowerCase().includes(q)) ||
      (r.contact && r.contact.toLowerCase().includes(q)) ||
      (r.memo && r.memo.toLowerCase().includes(q)) ||
      (r.desired_price && String(r.desired_price).toLowerCase().includes(q)) ||
      (r.request_date && r.request_date.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q)) ||
      (r.request_type && r.request_type.toLowerCase().includes(q)) ||
      (r.quantity && String(r.quantity).toLowerCase().includes(q))
    );
    matchedRequests.forEach((r: any) => results.push(createSearchItem('request', r)));

    // 6. Search ACCOUNTS - ALL fields
    const matchedAccounts = accounts.filter((a: any) =>
      (a.bank_name && a.bank_name.toLowerCase().includes(q)) ||
      (a.account_number && a.account_number.toLowerCase().includes(q)) ||
      (a.account_holder && a.account_holder.toLowerCase().includes(q)) ||
      (a.purpose && a.purpose.toLowerCase().includes(q)) ||
      (a.memo && a.memo.toLowerCase().includes(q)) ||
      (a.account_name && a.account_name.toLowerCase().includes(q))
    );
    matchedAccounts.forEach((a: any) => results.push(createSearchItem('account', a)));

    // 7. Search MEMOS - ALL fields
    const matchedMemos = memos.filter((m: any) =>
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q)) ||
      (m.date && m.date.toLowerCase().includes(q)) ||
      (m.created_at && m.created_at.toLowerCase().includes(q)) ||
      (m.tags && m.tags.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q))
    );
    matchedMemos.forEach((m: any) => results.push(createSearchItem('memo', m)));

    // 8. Search TASKS - ALL fields
    const matchedTasks = tasks.filter((t: any) =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.client && t.client.toLowerCase().includes(q)) ||
      (t.related_stock && t.related_stock.toLowerCase().includes(q)) ||
      (t.relatedStock && t.relatedStock.toLowerCase().includes(q)) ||
      (t.memo && t.memo.toLowerCase().includes(q)) ||
      (t.status && t.status.toLowerCase().includes(q)) ||
      (t.due_date && t.due_date.toLowerCase().includes(q)) ||
      (t.priority && t.priority.toLowerCase().includes(q))
    );
    matchedTasks.forEach((t: any) => results.push(createSearchItem('task', t)));

    // 9. Search DIARY ENTRIES - ALL fields
    const matchedDiary = diaryEntries.filter((d: any) =>
      (d.content && d.content.toLowerCase().includes(q)) ||
      (d.date && d.date.toLowerCase().includes(q)) ||
      (d.mood && d.mood.toLowerCase().includes(q)) ||
      (d.weather && d.weather.toLowerCase().includes(q)) ||
      (d.title && d.title.toLowerCase().includes(q))
    );
    matchedDiary.forEach((d: any) => results.push(createSearchItem('diary', d)));

    // Sort by relevance (exact matches first, then partial)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = q.toLowerCase();
      
      // Exact title match first
      if (aTitle === queryLower && bTitle !== queryLower) return -1;
      if (bTitle === queryLower && aTitle !== queryLower) return 1;
      
      // Title starts with query
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;
      
      return 0;
    });

    console.log('[SearchFromDB] Final results:', results.length, 'from ALL categories');
    
    // Log breakdown by category
    const byCategory = results.reduce((acc, item) => {
      acc[item.categoryLabel] = (acc[item.categoryLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[SearchFromDB] Results by category:', byCategory);
    
    return results;
  } catch (error) {
    console.error('[SearchFromDB] Error:', error);
    return searchFromLocalStorage(query);
  }
}

/**
 * Helper to get data from localStorage with flexible key matching (backwards compatibility)
 */
function getLocalStorageData(key: string): any[] {
  const STORAGE_PREFIX = 'nabi-data-1.0-';
  
  // Try exact match first (lowercase)
  let data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (data) return JSON.parse(data);
  
  // Try capitalized first letter (for backwards compatibility)
  const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
  data = localStorage.getItem(`${STORAGE_PREFIX}${capitalized}`);
  if (data) return JSON.parse(data);
  
  // Try no prefix (for legacy data)
  data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  
  return [];
}

/**
 * LocalStorage fallback search - Comprehensive cross-category search
 * ALWAYS searches ALL categories from localStorage
 */
function searchFromLocalStorage(query: string): SearchItem[] {
  const results: SearchItem[] = [];
  const q = query.toLowerCase().trim();

  console.log('[SearchFromLocalStorage] Searching for:', query, '(ALL categories)');

  try {
    // Get ALL data from all categories (with flexible key matching)
    const customers = getLocalStorageData('customers');
    const companies = getLocalStorageData('companies');
    const transactions = getLocalStorageData('transactions');
    const priceChecks = getLocalStorageData('priceChecks');
    const requests = getLocalStorageData('clientRequests');
    const accounts = getLocalStorageData('accounts');
    const memos = getLocalStorageData('memos');
    const tasks = getLocalStorageData('tasks');
    const diaryEntries = getLocalStorageData('diaryEntries');

    console.log('[SearchFromLocalStorage] Data loaded:', {
      customers: customers.length,
      companies: companies.length,
      transactions: transactions.length,
      priceChecks: priceChecks.length,
      requests: requests.length,
      accounts: accounts.length,
      memos: memos.length,
      tasks: tasks.length,
      diaryEntries: diaryEntries.length,
    });

    // Comprehensive search maps - search ALL fields for each category
    // Note: Check BOTH lowercase (snake_case) AND camelCase field names
    const searchMaps: Record<string, (item: any) => boolean> = {
      customers: (item) => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.contact && item.contact.toLowerCase().includes(q)) ||
        (item.customerType && item.customerType.toLowerCase().includes(q)) ||
        (item.customer_type && item.customer_type.toLowerCase().includes(q)) ||
        (item.manager && item.manager.toLowerCase().includes(q)) ||
        (item.interestedStocks && item.interestedStocks.toLowerCase().includes(q)) ||
        (item.interested_stocks && item.interested_stocks.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.bankName && item.bankName.toLowerCase().includes(q)) ||
        (item.bank_name && item.bank_name.toLowerCase().includes(q)) ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(q)) ||
        (item.account_number && item.account_number.toLowerCase().includes(q)) ||
        (item.accountHolder && item.accountHolder.toLowerCase().includes(q)) ||
        (item.account_holder && item.account_holder.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)),
      companies: (item) =>
        (item.stock_name && item.stock_name.toLowerCase().includes(q)) ||
        (item.stockName && item.stockName.toLowerCase().includes(q)) ||
        (item.industry && item.industry.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.par_value && String(item.par_value).toLowerCase().includes(q)) ||
        (item.parValue && String(item.parValue).toLowerCase().includes(q)) ||
        (item.total_shares && String(item.total_shares).toLowerCase().includes(q)) ||
        (item.totalShares && String(item.totalShares).toLowerCase().includes(q)) ||
        (item.listing_status && item.listing_status.toLowerCase().includes(q)) ||
        (item.listingStatus && item.listingStatus.toLowerCase().includes(q)) ||
        (item.company_name && item.company_name.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)),
      transactions: (item) =>
        (item.stock_name && item.stock_name.toLowerCase().includes(q)) ||
        (item.stockName && item.stockName.toLowerCase().includes(q)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.buyer && item.buyer.toLowerCase().includes(q)) ||
        (item.seller && item.seller.toLowerCase().includes(q)) ||
        (item.manager && item.manager.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.transaction_type && item.transaction_type.toLowerCase().includes(q)) ||
        (item.transactionType && item.transactionType.toLowerCase().includes(q)) ||
        (item.price && String(item.price).toLowerCase().includes(q)) ||
        (item.quantity && String(item.quantity).toLowerCase().includes(q)),
      priceChecks: (item) =>
        (item.stock_name && item.stock_name.toLowerCase().includes(q)) ||
        (item.stockName && item.stockName.toLowerCase().includes(q)) ||
        (item.holder_company && item.holder_company.toLowerCase().includes(q)) ||
        (item.holderCompany && item.holderCompany.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.current_price && String(item.current_price).toLowerCase().includes(q)) ||
        (item.currentPrice && String(item.currentPrice).toLowerCase().includes(q)) ||
        (item.holder_name && item.holder_name.toLowerCase().includes(q)) ||
        (item.holderName && item.holderName.toLowerCase().includes(q)) ||
        (item.custodian && item.custodian.toLowerCase().includes(q)),
      requests: (item) =>
        (item.client_name && item.client_name.toLowerCase().includes(q)) ||
        (item.clientName && item.clientName.toLowerCase().includes(q)) ||
        (item.target_stock && item.target_stock.toLowerCase().includes(q)) ||
        (item.targetStock && item.targetStock.toLowerCase().includes(q)) ||
        (item.contact && item.contact.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.desired_price && String(item.desired_price).toLowerCase().includes(q)) ||
        (item.desiredPrice && String(item.desiredPrice).toLowerCase().includes(q)) ||
        (item.request_date && item.request_date.toLowerCase().includes(q)) ||
        (item.requestDate && item.requestDate.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.request_type && item.request_type.toLowerCase().includes(q)) ||
        (item.requestType && item.requestType.toLowerCase().includes(q)) ||
        (item.quantity && String(item.quantity).toLowerCase().includes(q)),
      accounts: (item) =>
        (item.bank_name && item.bank_name.toLowerCase().includes(q)) ||
        (item.bankName && item.bankName.toLowerCase().includes(q)) ||
        (item.account_number && item.account_number.toLowerCase().includes(q)) ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(q)) ||
        (item.account_holder && item.account_holder.toLowerCase().includes(q)) ||
        (item.accountHolder && item.accountHolder.toLowerCase().includes(q)) ||
        (item.purpose && item.purpose.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.account_name && item.account_name.toLowerCase().includes(q)) ||
        (item.accountName && item.accountName.toLowerCase().includes(q)),
      memos: (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.created_at && item.created_at.toLowerCase().includes(q)) ||
        (item.createdAt && item.createdAt.toLowerCase().includes(q)) ||
        (item.tags && String(item.tags).toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)),
      tasks: (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.client && item.client.toLowerCase().includes(q)) ||
        (item.related_stock && item.related_stock.toLowerCase().includes(q)) ||
        (item.relatedStock && item.relatedStock.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.due_date && item.due_date.toLowerCase().includes(q)) ||
        (item.dueDate && item.dueDate.toLowerCase().includes(q)) ||
        (item.priority && item.priority.toLowerCase().includes(q)),
      diary: (item) =>
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.mood && item.mood.toLowerCase().includes(q)) ||
        (item.weather && item.weather.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)),
    };tem.custodian.toLowerCase().includes(q)),
      requests: (item) =>
        (item.client_name && item.client_name.toLowerCase().includes(q)) ||
        (item.clientName && item.clientName.toLowerCase().includes(q)) ||
        (item.target_stock && item.target_stock.toLowerCase().includes(q)) ||
        (item.targetStock && item.targetStock.toLowerCase().includes(q)) ||
        (item.contact && item.contact.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.desired_price && String(item.desired_price).toLowerCase().includes(q)) ||
        (item.request_date && item.request_date.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)),
      accounts: (item) =>
        (item.bank_name && item.bank_name.toLowerCase().includes(q)) ||
        (item.account_number && item.account_number.toLowerCase().includes(q)) ||
        (item.account_holder && item.account_holder.toLowerCase().includes(q)) ||
        (item.purpose && item.purpose.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.account_name && item.account_name.toLowerCase().includes(q)),
      memos: (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.created_at && item.created_at.toLowerCase().includes(q)) ||
        (item.tags && item.tags.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)),
      tasks: (item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.client && item.client.toLowerCase().includes(q)) ||
        (item.related_stock && item.related_stock.toLowerCase().includes(q)) ||
        (item.relatedStock && item.relatedStock.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.due_date && item.due_date.toLowerCase().includes(q)) ||
        (item.priority && item.priority.toLowerCase().includes(q)),
      diary: (item) =>
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)) ||
        (item.mood && item.mood.toLowerCase().includes(q)) ||
        (item.weather && item.weather.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)),
      fee: (item) =>
        (item.stock_name && item.stock_name.toLowerCase().includes(q)) ||
        (item.company_name && item.company_name.toLowerCase().includes(q)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
        (item.memo && item.memo.toLowerCase().includes(q)) ||
        (item.date && item.date.toLowerCase().includes(q)),
    };

    const typeMaps: Record<string, string> = {
      customers: 'customer',
      companies: 'company',
      transactions: 'transaction',
      priceChecks: 'pricecheck',
      requests: 'request',
      accounts: 'account',
      memos: 'memo',
      tasks: 'task',
      diary: 'diary',
      fee: 'fee',
    };

    for (const [key, storageKey] of Object.entries(storageKeys)) {
      const dataStr = localStorage.getItem(storageKey);
      if (!dataStr) continue;
      
      try {
        const items = JSON.parse(dataStr);
        const matchedItems = items.filter(searchMaps[key]);
        console.log(`[SearchFromLocalStorage] ${key}: ${matchedItems.length} matched`);
        
        matchedItems.forEach((item: any) => {
          results.push(createSearchItem(typeMaps[key], item));
        });
      } catch (e) {
        console.error(`[SearchFromLocalStorage] Error parsing ${storageKey}:`, e);
      }
    }

    // Sort by relevance
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = q.toLowerCase();
      
      if (aTitle === queryLower && bTitle !== queryLower) return -1;
      if (bTitle === queryLower && aTitle !== queryLower) return 1;
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1;
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1;
      
      return 0;
    });

    console.log('[SearchFromLocalStorage] Total results:', results.length, 'from ALL categories');
    
    // Log breakdown by category
    const byCategory = results.reduce((acc, item) => {
      acc[item.categoryLabel] = (acc[item.categoryLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[SearchFromLocalStorage] Results by category:', byCategory);
    
    return results;
  } catch (error) {
    console.error('[SearchFromLocalStorage] Error:', error);
    return [];
  }
}

/**
 * Get all searchable categories with their counts
 */
export function getAllSearchableCategories(): Array<{ key: string; label: string; color: string }> {
  return Object.entries(TYPE_CATEGORY_MAP).map(([key, info]) => ({
    key,
    label: info.label,
    color: info.color,
  }));
}

export default {
  initSearchIndexFromDB,
  initSearchIndex,
  search,
  searchFromDB,
  getCategoryColor,
  getCategoryLabel,
  getAllSearchableCategories,
};
