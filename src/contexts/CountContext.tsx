import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { countsService } from '../lib/supabaseService';
import { CategoryId } from '../types';

// Category counts type
export interface CategoryCounts {
  customer: number;
  company: number;
  transaction: number;
  pricecheck: number;
  request: number;
  account: number;
  memo: number;
  task: number;
  diary: number;
  'in-progress-requests': number;
}

interface CountContextType {
  counts: CategoryCounts;
  refreshCounts: () => Promise<void>;
  incrementCount: (type: keyof CategoryCounts) => void;
  decrementCount: (type: keyof CategoryCounts) => void;
  isLoading: boolean;
  isSupabaseConnected: boolean;
}

const defaultCounts: CategoryCounts = {
  customer: 0,
  company: 0,
  transaction: 0,
  pricecheck: 0,
  request: 0,
  account: 0,
  memo: 0,
  task: 0,
  diary: 0,
  'in-progress-requests': 0,
};

const CountContext = createContext<CountContextType | undefined>(undefined);

// LocalStorage key for counts fallback
const COUNTS_STORAGE_KEY = 'nabi-category-counts';

// Save counts to localStorage
function saveCountsToStorage(counts: CategoryCounts): void {
  try {
    localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(counts));
  } catch (e) {
    console.warn('[CountProvider] Failed to save counts to storage:', e);
  }
}

// Count localStorage data lengths (for all app data types)
function getLocalStorageCounts(): CategoryCounts {
  try {
    // Helper to get data from localStorage with flexible key matching
    const getData = (key: string): any[] => {
      // Try exact match first
      let data = localStorage.getItem(`nabi-data-1.0-${key}`);
      if (data) return JSON.parse(data);
      
      // Try capitalized first letter (for backwards compatibility)
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
      data = localStorage.getItem(`nabi-data-1.0-${capitalized}`);
      if (data) return JSON.parse(data);
      
      return [];
    };

    const customers = getData('customers');
    const companies = getData('companies');
    const transactions = getData('transactions');
    const priceChecks = getData('priceChecks');
    const clientRequests = getData('clientRequests');
    const accounts = getData('accounts');
    const memos = getData('memos');
    const tasks = getData('tasks');
    const diaryEntries = getData('diaryEntries');
    
    // Count in-progress requests
    const inProgressRequests = (clientRequests || []).filter((r: any) => r.status === 'in-progress').length;

    const result: CategoryCounts = {
      customer: Array.isArray(customers) ? customers.length : 0,
      company: Array.isArray(companies) ? companies.length : 0,
      transaction: Array.isArray(transactions) ? transactions.length : 0,
      pricecheck: Array.isArray(priceChecks) ? priceChecks.length : 0,
      request: Array.isArray(clientRequests) ? clientRequests.length : 0,
      account: Array.isArray(accounts) ? accounts.length : 0,
      memo: Array.isArray(memos) ? memos.length : 0,
      task: Array.isArray(tasks) ? tasks.length : 0,
      diary: Array.isArray(diaryEntries) ? diaryEntries.length : 0,
      'in-progress-requests': inProgressRequests,
    };
    
    console.log('[CountProvider] localStorage counts:', result);
    return result;
  } catch (e) {
    console.warn('[CountProvider] Failed to get localStorage counts:', e);
    return defaultCounts;
  }
}

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url !== '' && key !== '');
}

export function CountProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage counts immediately (synchronous)
  const [counts, setCounts] = useState<CategoryCounts>(getLocalStorageCounts);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const initRef = useRef(false);

  // Fetch counts from Supabase or localStorage
  const refreshCounts = useCallback(async () => {
    setIsLoading(true);
    
    // Check Supabase connection
    if (isSupabaseConfigured()) {
      setIsSupabaseConnected(true);
      try {
        const freshCounts = await countsService.getAllCounts() as unknown as CategoryCounts;
        setCounts(freshCounts);
        saveCountsToStorage(freshCounts);
        console.log('[CountProvider] Counts refreshed from Supabase:', freshCounts);
      } catch (error) {
        console.warn('[CountProvider] Supabase fetch failed, falling back to localStorage:', error);
        const localCounts = getLocalStorageCounts();
        setCounts(localCounts);
        saveCountsToStorage(localCounts);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use localStorage counts when Supabase is not configured
      setIsSupabaseConnected(false);
      const localCounts = getLocalStorageCounts();
      setCounts(localCounts);
      saveCountsToStorage(localCounts);
      console.log('[CountProvider] Using localStorage counts:', localCounts);
      setIsLoading(false);
    }
  }, []);

  // Increment a specific count (optimistic update)
  const incrementCount = useCallback((type: keyof CategoryCounts) => {
    setCounts(prev => {
      const newCounts = {
        ...prev,
        [type]: prev[type] + 1,
      };
      saveCountsToStorage(newCounts);
      return newCounts;
    });
  }, []);

  // Decrement a specific count (optimistic update)
  const decrementCount = useCallback((type: keyof CategoryCounts) => {
    setCounts(prev => {
      const newCounts = {
        ...prev,
        [type]: Math.max(0, prev[type] - 1),
      };
      saveCountsToStorage(newCounts);
      return newCounts;
    });
  }, []);

  // Initial load and listen for storage changes
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    // Immediately refresh counts on mount
    refreshCounts();
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('nabi-data-1.0-')) {
        console.log('[CountProvider] Storage changed, refreshing counts...');
        refreshCounts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll periodically for same-tab updates (less frequent now)
    const pollInterval = setInterval(() => {
      refreshCounts();
    }, 10000); // 10 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [refreshCounts]);

  return (
    <CountContext.Provider value={{ counts, refreshCounts, incrementCount, decrementCount, isLoading, isSupabaseConnected }}>
      {children}
    </CountContext.Provider>
  );
}

export function useCounts(): CountContextType {
  const context = useContext(CountContext);
  if (!context) {
    console.warn('[CountProvider] useCounts called outside CountProvider, using default values');
    return {
      counts: defaultCounts,
      refreshCounts: async () => {},
      incrementCount: () => {},
      decrementCount: () => {},
      isLoading: false,
      isSupabaseConnected: false,
    };
  }
  return context;
}

// Mapping from page type to count type
export function getCountTypeForPage(pageType: string): keyof CategoryCounts {
  const mapping: Record<string, keyof CategoryCounts> = {
    'customer': 'customer',
    'company': 'company',
    'transaction': 'transaction',
    'pricecheck': 'pricecheck',
    'request': 'request',
    'account': 'account',
    'memo': 'memo',
    'task': 'task',
    'diary': 'diary',
    'in-progress-requests': 'in-progress-requests',
  };
  return mapping[pageType] || 'memo';
}

// Convert counts to sidebar format (Record<CategoryId, number>)
export function useSidebarCounts(): Record<CategoryId, number> {
  const { counts } = useCounts();
  
  return {
    'memo': counts.memo,
    'price-check': counts.pricecheck,
    'client-requests': counts['in-progress-requests'],
    'company-info': counts.company,
    'fee-calculator': 0, // Fee calculator doesn't have count
    'transactions': counts.transaction,
    'task-list': counts.task,
    'account-info': counts.account,
    'diary': counts.diary,
    'customer': counts.customer,
  };
}