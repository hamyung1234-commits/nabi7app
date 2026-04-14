/**
 * Supabase Hook - 데이터 동기화 및 실시간 업데이트
 */

import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';
import {
  customersService,
  companiesService,
  transactionsService,
  priceChecksService,
  clientRequestsService,
  accountsService,
  diaryEntriesService,
  memosService,
  tasksService,
  migrateFromLocalStorage,
  type Customer,
  type Company,
  type Transaction,
  type PriceCheck,
  type ClientRequest,
  type Account,
  type DiaryEntry,
  type Memo,
  type Task,
} from '../lib/supabaseService';

export interface UseSupabaseOptions {
  enableSync?: boolean;
  autoLoad?: boolean;
}

export interface SyncStatus {
  isLoading: boolean;
  isSyncing: boolean;
  isConnected: boolean;
  lastSynced: Date | null;
  error: string | null;
}

export function useSupabase(options: UseSupabaseOptions = {}) {
  const { enableSync = false, autoLoad = true } = options;

  // 데이터 상태
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [priceChecks, setPriceChecks] = useState<PriceCheck[]>([]);
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // 동기화 상태
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isSyncing: false,
    isConnected: false,
    lastSynced: null,
    error: null,
  });

  // 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('customers').select('id').limit(1);
        setSyncStatus(prev => ({
          ...prev,
          isConnected: !error,
          error: error?.message || null,
        }));
      } catch {
        setSyncStatus(prev => ({
          ...prev,
          isConnected: false,
          error: 'Failed to connect to Supabase',
        }));
      }
    };
    checkConnection();
  }, []);

  // 전체 데이터 로드
  const loadAllData = useCallback(async () => {
    if (!syncStatus.isConnected) return;

    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const [
        customersData,
        companiesData,
        transactionsData,
        priceChecksData,
        clientRequestsData,
        accountsData,
        diaryEntriesData,
        memosData,
        tasksData,
      ] = await Promise.all([
        customersService.getAll(),
        companiesService.getAll(),
        transactionsService.getAll(),
        priceChecksService.getAll(),
        clientRequestsService.getAll(),
        accountsService.getAll(),
        diaryEntriesService.getAll(),
        memosService.getAll(),
        tasksService.getAll(),
      ]);

      setCustomers(customersData);
      setCompanies(companiesData);
      setTransactions(transactionsData);
      setPriceChecks(priceChecksData);
      setClientRequests(clientRequestsData);
      setAccounts(accountsData);
      setDiaryEntries(diaryEntriesData);
      setMemos(memosData);
      setTasks(tasksData);

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSynced: new Date(),
        error: null,
      }));
    } catch (error: any) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, [syncStatus.isConnected]);

  // 자동 로드
  useEffect(() => {
    if (autoLoad && syncStatus.isConnected) {
      loadAllData();
    }
  }, [autoLoad, syncStatus.isConnected, loadAllData]);

  // 실시간 구독 (선택적)
  useEffect(() => {
    if (!enableSync) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Supabase change:', payload);
        loadAllData(); // 변경 시 데이터 다시 로드
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableSync, loadAllData]);

  // 마이그레이션 실행
  const migrateData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    const result = await migrateFromLocalStorage();
    if (result.success) {
      await loadAllData();
    }
    setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    return result;
  }, [loadAllData]);

  return {
    // 데이터
    customers,
    companies,
    transactions,
    priceChecks,
    clientRequests,
    accounts,
    diaryEntries,
    memos,
    tasks,

    // 세터 (Supabase에 직접 저장)
    setCustomers,
    setCompanies,
    setTransactions,
    setPriceChecks,
    setClientRequests,
    setAccounts,
    setDiaryEntries,
    setMemos,
    setTasks,

    // 서비스
    services: {
      customers: customersService,
      companies: companiesService,
      transactions: transactionsService,
      priceChecks: priceChecksService,
      clientRequests: clientRequestsService,
      accounts: accountsService,
      diaryEntries: diaryEntriesService,
      memos: memosService,
      tasks: tasksService,
    },

    // 동기화
    syncStatus,
    loadAllData,
    migrateData,
  };
}

// =====================================================
// 사용 예시 (App.tsx에서)
//
// 1. Supabase가 연결되어 있으면 Supabase 데이터 사용
// 2. 연결되어 있지 않으면 localStorage 사용
// 3. 마이그레이션 버튼으로 localStorage → Supabase 이동 가능
//
// =====================================================
