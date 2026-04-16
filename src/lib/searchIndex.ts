/**
 * Search Index Management Utility
 * FIXED: Always searches localStorage FIRST, then merges Supabase data
 * This ensures search works even when Supabase is not configured
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
  originalId: string;
  type: 'customer' | 'company' | 'transaction' | 'pricecheck' | 'request' | 'account' | 'diary' | 'memo' | 'task' | 'fee';
  category: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  detail: string;
  date?: string;
  rawData: any;
}

// Search index instance (includes both Supabase and localStorage data)
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

// Helper to get data from localStorage with flexible key matching
function getLocalStorageData(key: string): any[] {
  const STORAGE_PREFIX = 'nabi-data-1.0-';
  
  let data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (data) return JSON.parse(data);
  
  // Try capitalized first letter (for backwards compatibility)
  const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
  data = localStorage.getItem(`${STORAGE_PREFIX}${capitalized}`);
  if (data) return JSON.parse(data);
  
  // Try no prefix
  data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  
  return [];
}

// Internal helper: Create SearchItem from data
function createSearchItem(type: string, data: any): SearchItem {
  const categoryInfo = TYPE_CATEGORY_MAP[type] || { key: type, label: type, color: '#1a3a5c' };
  const originalId = data.id || '';
  let title = '', subtitle = '', detail = '', date = '';

  switch (type) {
    case 'customer':
      title = data.name || '이름 없음';
      subtitle = `${data.customer_type === 'seller' ? '매도' : data.customer_type === 'buyer' ? '매수' : '양방향'} | ${data.contact || ''}`;
      detail = [data.name, data.contact, data.interested_stocks, data.interestedStocks, data.manager, data.memo, data.bank_name, data.bankName, data.account_number, data.accountNumber].filter(Boolean).join(' ');
      date = data.first_deal_date || data.firstDealDate;
      break;
    case 'company':
      title = data.stock_name || data.stockName || '종목명 없음';
      subtitle = `${data.industry || ''} | 시세: ${data.current_price?.toLocaleString() || '0'}원`;
      detail = [data.stock_name, data.stockName, data.industry, data.memo, data.par_value, data.total_shares].filter(Boolean).join(' ');
      break;
    case 'transaction':
      title = data.stock_name || '종목명 없음';
      subtitle = `${data.date} | ${data.customer_name || data.customerName || ''} | ${data.sell_total?.toLocaleString() || '0'}원`;
      detail = [data.stock_name, data.stockName, data.customer_name, data.customerName, data.buyer, data.seller, data.manager, data.memo].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'pricecheck':
      title = data.stock_name || '종목명 없음';
      subtitle = `${data.date} | ${data.holder_company || data.holderCompany || ''}`;
      detail = [data.stock_name, data.stockName, data.holder_company, data.holderCompany, data.memo].filter(Boolean).join(' ');
      date = data.date;
      break;
    case 'request':
      title = data.target_stock || data.targetStock || '종목명 없음';
      subtitle = `${data.client_name || data.clientName || ''} | ${data.request_type === 'buy' ? '매수' : '매도'} | ${data.quantity}주`;
      detail = [data.target_stock, data.targetStock, data.client_name, data.clientName, data.contact, data.memo, data.desired_price].filter(Boolean).join(' ');
      date = data.request_date || data.requestDate;
      break;
    case 'account':
      title = data.bank_name || data.bankName || '은행명 없음';
      subtitle = `${data.account_number || data.accountNumber || ''} | ${data.account_holder || data.accountHolder || ''}`;
      detail = [data.bank_name, data.bankName, data.account_number, data.accountNumber, data.account_holder, data.accountHolder, data.purpose, data.memo].filter(Boolean).join(' ');
      break;
    case 'task':
      title = data.title || '제목 없음';
      subtitle = `${data.status === 'completed' ? '✅ 완료' : '📋 진행중'} | ${data.client || ''}`;
      detail = [data.title, data.description, data.client, data.related_stock, data.relatedStock, data.memo].filter(Boolean).join(' ');
      date = data.due_date || data.dueDate;
      break;
    case 'memo':
      title = data.title || '제목 없음';
      subtitle = data.content?.substring(0, 60) || '내용 없음';
      detail = [data.title, data.content].filter(Boolean).join(' ');
      date = data.created_at || data.createdAt || data.date;
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
      detail = [data.stock_name, data.stockName, data.company_name, data.companyName, data.customer_name, data.customerName, data.memo].filter(Boolean).join(' ');
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

// Check if Supabase is configured - ALWAYS check for real credentials
function isSupabaseConfigured(): boolean {
  // Check if we have valid Supabase credentials
  // We always have the URL hardcoded in supabase.ts
  return true; // Always try Supabase, fallback to localStorage if it fails
}

/**
 * Initialize search index from localStorage FIRST (always available)
 * Then merge with Supabase data if available
 */
export async function initSearchIndexFromDB(): Promise<void> {
  if (isLoading) return;
  isLoading = true;
  searchIndex = [];

  console.log('[SearchIndex] Starting initialization...');

  try {
    // ALWAYS load localStorage data first (guaranteed to work)
    console.log('[SearchIndex] Loading localStorage data (PRIMARY)...');
    
    const localCustomers = getLocalStorageData('customers');
    const localCompanies = getLocalStorageData('companies');
    const localTransactions = getLocalStorageData('transactions');
    const localPriceChecks = getLocalStorageData('priceChecks');
    const localClientRequests = getLocalStorageData('clientRequests');
    const localAccounts = getLocalStorageData('accounts');
    const localMemos = getLocalStorageData('memos');
    const localTasks = getLocalStorageData('tasks');
    const localDiaryEntries = getLocalStorageData('diaryEntries');

    console.log('[SearchIndex] localStorage counts:', {
      customers: localCustomers.length,
      companies: localCompanies.length,
      transactions: localTransactions.length,
      priceChecks: localPriceChecks.length,
      clientRequests: localClientRequests.length,
      accounts: localAccounts.length,
      memos: localMemos.length,
      tasks: localTasks.length,
      diaryEntries: localDiaryEntries.length,
    });

    // Helper to add items to index
    const addToIndex = (items: any[], type: string) => {
      items.forEach((item: any) => {
        if (!item.id) return;
        const existingIndex = searchIndex.findIndex(s => s.originalId === item.id && s.type === type);
        if (existingIndex === -1) {
          searchIndex.push(createSearchItem(type, item));
        }
      });
    };

    // Add localStorage data FIRST
    addToIndex(localCustomers, 'customer');
    addToIndex(localCompanies, 'company');
    addToIndex(localTransactions, 'transaction');
    addToIndex(localPriceChecks, 'pricecheck');
    addToIndex(localClientRequests, 'request');
    addToIndex(localAccounts, 'account');
    addToIndex(localMemos, 'memo');
    addToIndex(localTasks, 'task');
    addToIndex(localDiaryEntries, 'diary');

    console.log('[SearchIndex] Added', searchIndex.length, 'items from localStorage');

    // THEN try to add Supabase data (supplementary)
    if (isSupabaseConfigured()) {
      console.log('[SearchIndex] Supabase configured, fetching additional data...');
      
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

      const extractData = (name: string, result: PromiseSettledResult<any>): any[] => {
        if (result.status === 'fulfilled') {
          const data = Array.isArray(result.value) ? result.value : [];
          console.log(`[SearchIndex] ${name}: ${data.length} records from Supabase`);
          return data;
        } else {
          console.log(`[SearchIndex] ${name}: Supabase unavailable, using localStorage only`);
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

      // Add Supabase data (will skip duplicates by ID)
      addToIndex(customers, 'customer');
      addToIndex(companies, 'company');
      addToIndex(transactions, 'transaction');
      addToIndex(priceChecks, 'pricecheck');
      addToIndex(clientRequests, 'request');
      addToIndex(accounts, 'account');
      addToIndex(memos, 'memo');
      addToIndex(tasks, 'task');
      addToIndex(diaryEntries, 'diary');
    } else {
      console.log('[SearchIndex] Supabase not configured, using localStorage only');
    }

    console.log('[SearchIndex] Final index with', searchIndex.length, 'total items');
  } catch (error) {
    console.error('[SearchIndex] Failed to initialize:', error);
    // Should never happen since we have localStorage fallback
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize search index (legacy)
 */
export function initSearchIndex(_appState?: any): void {
  console.log('[SearchIndex] initSearchIndex called - use initSearchIndexFromDB for async init');
}

/**
 * Search execution - case insensitive, searches ALL categories
 * FIXED: Uses in-memory index which includes localStorage data
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
  
  console.log('[Search] Query:', query, 'Results:', results.length, '(from localStorage + Supabase)');
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
 * Main search function - ALWAYS searches localStorage FIRST
 * Then merges with Supabase data for comprehensive results
 */
export async function searchFromDB(query: string): Promise<SearchItem[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const q = query.toLowerCase().trim();
  console.log('[SearchFromDB] Searching for:', query, '(localStorage FIRST)');

  const results: SearchItem[] = [];
  const seenIds = new Set<string>(); // Track to avoid duplicates

  // Helper to add to results if not duplicate
  const addToResults = (item: SearchItem) => {
    const key = `${item.type}-${item.originalId}`;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      results.push(item);
    }
  };

  // STEP 1: Search localStorage FIRST (guaranteed to work)
  console.log('[SearchFromDB] Step 1: Searching localStorage...');
  
  const localCustomers = getLocalStorageData('customers');
  const localCompanies = getLocalStorageData('companies');
  const localTransactions = getLocalStorageData('transactions');
  const localPriceChecks = getLocalStorageData('priceChecks');
  const localRequests = getLocalStorageData('clientRequests');
  const localAccounts = getLocalStorageData('accounts');
  const localMemos = getLocalStorageData('memos');
  const localTasks = getLocalStorageData('tasks');
  const localDiary = getLocalStorageData('diaryEntries');

  // Search localStorage customers
  localCustomers.filter((c: any) =>
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
  ).forEach((c: any) => addToResults(createSearchItem('customer', c)));

  // Search localStorage companies
  localCompanies.filter((c: any) =>
    (c.stock_name && c.stock_name.toLowerCase().includes(q)) ||
    (c.stockName && c.stockName.toLowerCase().includes(q)) ||
    (c.industry && c.industry.toLowerCase().includes(q)) ||
    (c.memo && c.memo.toLowerCase().includes(q)) ||
    (c.par_value && String(c.par_value).toLowerCase().includes(q)) ||
    (c.total_shares && String(c.total_shares).toLowerCase().includes(q)) ||
    (c.listing_status && c.listing_status.toLowerCase().includes(q)) ||
    (c.company_name && c.company_name.toLowerCase().includes(q)) ||
    (c.business_number && c.business_number.toLowerCase().includes(q)) ||
    (c.representative && c.representative.toLowerCase().includes(q))
  ).forEach((c: any) => addToResults(createSearchItem('company', c)));

  // Search localStorage transactions
  localTransactions.filter((t: any) =>
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
  ).forEach((t: any) => addToResults(createSearchItem('transaction', t)));

  // Search localStorage price checks
  localPriceChecks.filter((p: any) =>
    (p.stock_name && p.stock_name.toLowerCase().includes(q)) ||
    (p.holder_company && p.holder_company.toLowerCase().includes(q)) ||
    (p.holderCompany && p.holderCompany.toLowerCase().includes(q)) ||
    (p.memo && p.memo.toLowerCase().includes(q)) ||
    (p.date && p.date.toLowerCase().includes(q)) ||
    (p.current_price && String(p.current_price).toLowerCase().includes(q)) ||
    (p.holder_name && p.holder_name.toLowerCase().includes(q)) ||
    (p.custodian && p.custodian.toLowerCase().includes(q))
  ).forEach((p: any) => addToResults(createSearchItem('pricecheck', p)));

  // Search localStorage client requests
  localRequests.filter((r: any) =>
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
  ).forEach((r: any) => addToResults(createSearchItem('request', r)));

  // Search localStorage accounts
  localAccounts.filter((a: any) =>
    (a.bank_name && a.bank_name.toLowerCase().includes(q)) ||
    (a.bankName && a.bankName.toLowerCase().includes(q)) ||
    (a.account_number && a.account_number.toLowerCase().includes(q)) ||
    (a.accountNumber && a.accountNumber.toLowerCase().includes(q)) ||
    (a.account_holder && a.account_holder.toLowerCase().includes(q)) ||
    (a.accountHolder && a.accountHolder.toLowerCase().includes(q)) ||
    (a.purpose && a.purpose.toLowerCase().includes(q)) ||
    (a.memo && a.memo.toLowerCase().includes(q)) ||
    (a.account_name && a.account_name.toLowerCase().includes(q))
  ).forEach((a: any) => addToResults(createSearchItem('account', a)));

  // Search localStorage memos
  localMemos.filter((m: any) =>
    (m.title && m.title.toLowerCase().includes(q)) ||
    (m.content && m.content.toLowerCase().includes(q)) ||
    (m.date && m.date.toLowerCase().includes(q)) ||
    (m.created_at && m.created_at.toLowerCase().includes(q)) ||
    (m.createdAt && m.createdAt.toLowerCase().includes(q)) ||
    (m.tags && String(m.tags).toLowerCase().includes(q)) ||
    (m.category && m.category.toLowerCase().includes(q))
  ).forEach((m: any) => addToResults(createSearchItem('memo', m)));

  // Search localStorage tasks
  localTasks.filter((t: any) =>
    (t.title && t.title.toLowerCase().includes(q)) ||
    (t.description && t.description.toLowerCase().includes(q)) ||
    (t.client && t.client.toLowerCase().includes(q)) ||
    (t.related_stock && t.related_stock.toLowerCase().includes(q)) ||
    (t.relatedStock && t.relatedStock.toLowerCase().includes(q)) ||
    (t.memo && t.memo.toLowerCase().includes(q)) ||
    (t.status && t.status.toLowerCase().includes(q)) ||
    (t.due_date && t.due_date.toLowerCase().includes(q)) ||
    (t.dueDate && t.dueDate.toLowerCase().includes(q)) ||
    (t.priority && t.priority.toLowerCase().includes(q))
  ).forEach((t: any) => addToResults(createSearchItem('task', t)));

  // Search localStorage diary
  localDiary.filter((d: any) =>
    (d.content && d.content.toLowerCase().includes(q)) ||
    (d.date && d.date.toLowerCase().includes(q)) ||
    (d.mood && d.mood.toLowerCase().includes(q)) ||
    (d.weather && d.weather.toLowerCase().includes(q)) ||
    (d.title && d.title.toLowerCase().includes(q))
  ).forEach((d: any) => addToResults(createSearchItem('diary', d)));

  console.log('[SearchFromDB] localStorage results:', results.length);

  // STEP 2: If Supabase is configured, add additional results from Supabase
  if (isSupabaseConfigured() && results.length === 0) {
    console.log('[SearchFromDB] No localStorage results, checking Supabase...');
    
    try {
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

      const logResult = (name: string, result: PromiseSettledResult<any>): any[] => {
        if (result.status === 'fulfilled') {
          const data = Array.isArray(result.value) ? result.value : [];
          console.log(`[SearchFromDB] ${name}: ${data.length} items`);
          return data;
        } else {
          console.log(`[SearchFromDB] ${name}: Supabase unavailable`);
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

      // Add Supabase results (will skip duplicates via seenIds)
      customers.filter((c: any) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.contact && c.contact.toLowerCase().includes(q))
      ).forEach((c: any) => addToResults(createSearchItem('customer', c)));

      companies.filter((c: any) =>
        (c.stock_name && c.stock_name.toLowerCase().includes(q)) ||
        (c.stockName && c.stockName.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q))
      ).forEach((c: any) => addToResults(createSearchItem('company', c)));

      transactions.filter((t: any) =>
        (t.stock_name && t.stock_name.toLowerCase().includes(q)) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.buyer && t.buyer.toLowerCase().includes(q)) ||
        (t.seller && t.seller.toLowerCase().includes(q))
      ).forEach((t: any) => addToResults(createSearchItem('transaction', t)));

      priceChecks.filter((p: any) =>
        (p.stock_name && p.stock_name.toLowerCase().includes(q)) ||
        (p.holder_company && p.holder_company.toLowerCase().includes(q))
      ).forEach((p: any) => addToResults(createSearchItem('pricecheck', p)));

      requests.filter((r: any) =>
        (r.client_name && r.client_name.toLowerCase().includes(q)) ||
        (r.clientName && r.clientName.toLowerCase().includes(q)) ||
        (r.target_stock && r.target_stock.toLowerCase().includes(q)) ||
        (r.targetStock && r.targetStock.toLowerCase().includes(q))
      ).forEach((r: any) => addToResults(createSearchItem('request', r)));

      accounts.filter((a: any) =>
        (a.bank_name && a.bank_name.toLowerCase().includes(q)) ||
        (a.account_number && a.account_number.toLowerCase().includes(q)) ||
        (a.account_holder && a.account_holder.toLowerCase().includes(q))
      ).forEach((a: any) => addToResults(createSearchItem('account', a)));

      memos.filter((m: any) =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.content && m.content.toLowerCase().includes(q))
      ).forEach((m: any) => addToResults(createSearchItem('memo', m)));

      tasks.filter((t: any) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.client && t.client.toLowerCase().includes(q))
      ).forEach((t: any) => addToResults(createSearchItem('task', t)));

      diaryEntries.filter((d: any) =>
        (d.content && d.content.toLowerCase().includes(q)) ||
        (d.date && d.date.toLowerCase().includes(q))
      ).forEach((d: any) => addToResults(createSearchItem('diary', d)));

    } catch (error) {
      console.error('[SearchFromDB] Supabase search error:', error);
      // Already have localStorage results, continue with those
    }
  }

  // Sort results: exact matches first, then starts-with, then contains
  results.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    
    if (aTitle === q && bTitle !== q) return -1;
    if (bTitle === q && aTitle !== q) return 1;
    if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1;
    if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1;
    
    return 0;
  });

  console.log('[SearchFromDB] Final results:', results.length, 'items');
  
  // Summary by category
  const byCategory = results.reduce((acc, item) => {
    acc[item.categoryLabel] = (acc[item.categoryLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('[SearchFromDB] Results by category:', byCategory);
  
  return results;
}