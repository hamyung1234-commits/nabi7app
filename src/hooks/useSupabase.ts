/**
 * useSupabase Hook - Unified Supabase-first data management
 * Prioritizes Supabase operations with localStorage fallback
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  memosService, 
  priceChecksService, 
  clientRequestsService, 
  companiesService,
  transactionsService,
  tasksService,
  accountsService,
  diaryEntriesService,
  customersService,
  globalSearch
} from '../lib/supabaseService';
import { useAppState } from './useLocalStorage';
import { useCounts } from '../contexts/CountContext';

export type DataType = 'memos' | 'priceChecks' | 'clientRequests' | 'companies' | 'transactions' | 'tasks' | 'accounts' | 'diaryEntries' | 'customers';

interface UseSupabaseOptions {
  dataType: DataType;
  enableRealtime?: boolean;
}

interface UseSupabaseReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isSupabaseActive: boolean;
  create: (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<any[]>;
}

// Service mapping
const serviceMap = {
  memos: memosService,
  priceChecks: priceChecksService,
  clientRequests: clientRequestsService,
  companies: companiesService,
  transactions: transactionsService,
  tasks: tasksService,
  accounts: accountsService,
  diaryEntries: diaryEntriesService,
  customers: customersService,
};

// Count type mapping
const countTypeMap = {
  memos: 'memo',
  priceChecks: 'pricecheck',
  clientRequests: 'request',
  companies: 'company',
  transactions: 'transaction',
  tasks: 'task',
  accounts: 'account',
  diaryEntries: 'diary',
  customers: 'customer',
} as const;

export function useSupabase<T = any>({ dataType, enableRealtime = false }: UseSupabaseOptions): UseSupabaseReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  // Get localStorage fallback data
  const appState = useAppState();
  const localStorageData = appState[dataType] || [];
  const localStorageSetters = {
    memos: appState.setMemos,
    priceChecks: appState.setPriceChecks,
    clientRequests: appState.setClientRequests,
    companies: appState.setCompanies,
    transactions: appState.setTransactions,
    tasks: appState.setTasks,
    accounts: appState.setAccounts,
    diaryEntries: appState.setDiaryEntries,
    customers: appState.setCustomers,
  };

  // Count management
  const { incrementCount, decrementCount, refreshCounts } = useCounts();
  const countType = countTypeMap[dataType];

  const service = serviceMap[dataType];

  // Load data (Supabase-first)
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured && service) {
        console.log(`[useSupabase] Loading ${dataType} from Supabase...`);
        const supabaseData = await service.getAll();
        setData(supabaseData as T[]);
        setIsSupabaseActive(true);
        
        // Sync with localStorage for offline access
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter(supabaseData);
        }
        
        console.log(`[useSupabase] Loaded ${supabaseData.length} items from Supabase`);
      } else {
        // Fallback to localStorage
        console.log(`[useSupabase] Supabase not available, using localStorage for ${dataType}`);
        setData(localStorageData);
        setIsSupabaseActive(false);
      }
    } catch (err) {
      console.warn(`[useSupabase] Supabase error for ${dataType}, falling back to localStorage:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(localStorageData);
      setIsSupabaseActive(false);
    } finally {
      setLoading(false);
    }
  }, [dataType, service, localStorageData, localStorageSetters]);

  // Create item
  const create = useCallback(async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> => {
    try {
      if (isSupabaseActive && service) {
        console.log(`[useSupabase] Creating ${dataType} in Supabase...`);
        const newItem = await service.create(item as any);
        
        // Update local state
        setData(prev => [newItem as T, ...prev]);
        
        // Update localStorage
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => [newItem, ...prev]);
        }
        
        // Update counts
        if (countType) {
          incrementCount(countType as any);
        }
        
        console.log(`[useSupabase] Created ${dataType} successfully`);
        return newItem as T;
      } else {
        // Fallback to localStorage only
        const newItem = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        } as T;
        
        setData(prev => [newItem, ...prev]);
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => [newItem, ...prev]);
        }
        
        if (countType) {
          incrementCount(countType as any);
        }
        
        return newItem;
      }
    } catch (err) {
      console.error(`[useSupabase] Create error for ${dataType}:`, err);
      setError(err instanceof Error ? err.message : 'Create failed');
      return null;
    }
  }, [isSupabaseActive, service, dataType, countType, incrementCount, localStorageSetters]);

  // Update item
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T | null> => {
    try {
      if (isSupabaseActive && service) {
        console.log(`[useSupabase] Updating ${dataType} in Supabase...`);
        const updatedItem = await service.update(id, updates as any);
        
        // Update local state
        setData(prev => prev.map(item => 
          (item as any).id === id ? updatedItem as T : item
        ));
        
        // Update localStorage
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => prev.map((item: any) => 
            item.id === id ? updatedItem : item
          ));
        }
        
        return updatedItem as T;
      } else {
        // Fallback to localStorage only
        const updatedItem = { 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        
        setData(prev => prev.map(item => 
          (item as any).id === id ? { ...item, ...updatedItem } : item
        ));
        
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => prev.map((item: any) => 
            item.id === id ? { ...item, ...updatedItem } : item
          ));
        }
        
        return { ...updatedItem } as T;
      }
    } catch (err) {
      console.error(`[useSupabase] Update error for ${dataType}:`, err);
      setError(err instanceof Error ? err.message : 'Update failed');
      return null;
    }
  }, [isSupabaseActive, service, dataType, localStorageSetters]);

  // Delete item
  const delete_ = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseActive && service) {
        console.log(`[useSupabase] Deleting ${dataType} from Supabase...`);
        await service.delete(id);
        
        // Update local state
        setData(prev => prev.filter(item => (item as any).id !== id));
        
        // Update localStorage
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => prev.filter((item: any) => item.id !== id));
        }
        
        // Update counts
        if (countType) {
          decrementCount(countType as any);
        }
        
        console.log(`[useSupabase] Deleted ${dataType} successfully`);
        return true;
      } else {
        // Fallback to localStorage only
        setData(prev => prev.filter(item => (item as any).id !== id));
        const setter = localStorageSetters[dataType];
        if (setter) {
          setter((prev: any[]) => prev.filter((item: any) => item.id !== id));
        }
        
        if (countType) {
          decrementCount(countType as any);
        }
        
        return true;
      }
    } catch (err) {
      console.error(`[useSupabase] Delete error for ${dataType}:`, err);
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, [isSupabaseActive, service, dataType, countType, decrementCount, localStorageSetters]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData();
    // Also refresh counts
    await refreshCounts();
  }, [loadData, refreshCounts]);

  // Search function
  const search = useCallback(async (query: string): Promise<any[]> => {
    try {
      if (isSupabaseActive) {
        return await globalSearch(query);
      } else {
        // Local search fallback
        const lowerQuery = query.toLowerCase();
        return data.filter((item: any) => 
          JSON.stringify(item).toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // Limit to 10 results
      }
    } catch (err) {
      console.error(`[useSupabase] Search error:`, err);
      return [];
    }
  }, [isSupabaseActive, data]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Setup realtime subscription if enabled
  useEffect(() => {
    if (!enableRealtime || !isSupabaseActive || !supabase) return;

    console.log(`[useSupabase] Setting up realtime for ${dataType}`);
    
    const tableName = dataType === 'priceChecks' ? 'price_checks' : 
                     dataType === 'clientRequests' ? 'client_requests' :
                     dataType === 'diaryEntries' ? 'diary_entries' :
                     dataType;

    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: tableName 
      }, (payload) => {
        console.log(`[useSupabase] Realtime change for ${dataType}:`, payload);
        // Refresh data on any change
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, isSupabaseActive, dataType, loadData]);

  return {
    data,
    loading,
    error,
    isSupabaseActive,
    create,
    update,
    delete: delete_,
    refresh,
    search,
  };
}

// Convenience hooks for specific data types
export const useMemos = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'memos', ...options });

export const usePriceChecks = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'priceChecks', ...options });

export const useClientRequests = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'clientRequests', ...options });

export const useCompanies = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'companies', ...options });

export const useTransactions = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'transactions', ...options });

export const useTasks = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'tasks', ...options });

export const useAccounts = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'accounts', ...options });

export const useDiaryEntries = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'diaryEntries', ...options });

export const useCustomers = (options?: Omit<UseSupabaseOptions, 'dataType'>) => 
  useSupabase<any>({ dataType: 'customers', ...options });