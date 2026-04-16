/**
 * Supabase Service Layer
 * Handles all database operations for 나비 (Nabi) app
 * Safely handles cases when Supabase is not configured
 */

import { supabase, isSupabaseConfigured } from './supabase';

// Type definitions
export interface Customer {
  id?: string;
  name: string;
  contact?: string;
  customer_type?: 'seller' | 'buyer' | 'both';
  manager?: string;
  first_deal_date?: string;
  recent_deal_date?: string;
  interested_stocks?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  status?: 'active' | 'inactive' | 'blacklist';
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id?: string;
  stock_name: string;
  industry?: string;
  current_price?: number;
  par_value?: number;
  total_shares?: number;
  total_capital?: number;
  total_debt?: number;
  revenue?: number;
  operating_profit?: number;
  net_profit?: number;
  industry_per?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: string;
  date: string;
  stock_name?: string;
  buyer?: string;
  buy_quantity?: number;
  buy_unit_price?: number;
  buy_total?: number;
  seller?: string;
  sell_quantity?: number;
  sell_unit_price?: number;
  sell_total?: number;
  transfer_profit?: number;
  actual_receipt?: number;
  customer_name?: string;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PriceCheck {
  id?: string;
  date: string;
  stock_name?: string;
  sell_price?: number;
  buy_price?: number;
  quantity?: number;
  holder_company?: string;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientRequest {
  id?: string;
  client_name: string;
  contact?: string;
  target_stock?: string;
  request_type?: 'buy' | 'sell';
  quantity?: number;
  desired_price?: number;
  request_date?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id?: string;
  bank_name: string;
  account_number?: string;
  account_holder?: string;
  purpose?: string;
  memo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiaryEntry {
  id?: string;
  date: string;
  content?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Memo {
  id?: string;
  title?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  related_stock?: string;
  client?: string;
  due_date?: string;
  status?: 'waiting' | 'in-progress' | 'completed' | 'on-hold';
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// Customers CRUD
// =====================================================
export const customersService = {
  async getAll(): Promise<Customer[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customer, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Companies CRUD
// =====================================================
export const companiesService = {
  async getAll(): Promise<Company[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, company: Partial<Company>): Promise<Company> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('companies')
      .update({ ...company, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Transactions CRUD
// =====================================================
export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...transaction, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Price Checks CRUD
// =====================================================
export const priceChecksService = {
  async getAll(): Promise<PriceCheck[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('price_checks')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(priceCheck: Omit<PriceCheck, 'id' | 'created_at' | 'updated_at'>): Promise<PriceCheck> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('price_checks')
      .insert([priceCheck])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, priceCheck: Partial<PriceCheck>): Promise<PriceCheck> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('price_checks')
      .update({ ...priceCheck, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('price_checks').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Client Requests CRUD
// =====================================================
export const clientRequestsService = {
  async getAll(): Promise<ClientRequest[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(request: Omit<ClientRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ClientRequest> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('client_requests')
      .insert([request])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, request: Partial<ClientRequest>): Promise<ClientRequest> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('client_requests')
      .update({ ...request, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('client_requests').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Accounts CRUD
// =====================================================
export const accountsService = {
  async getAll(): Promise<Account[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, account: Partial<Account>): Promise<Account> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('accounts')
      .update({ ...account, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Diary Entries CRUD
// =====================================================
export const diaryEntriesService = {
  async getAll(): Promise<DiaryEntry[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DiaryEntry> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('diary_entries')
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('diary_entries')
      .update({ ...entry, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Memos CRUD
// =====================================================
export const memosService = {
  async getAll(): Promise<Memo[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(memo: Omit<Memo, 'id' | 'created_at' | 'updated_at'>): Promise<Memo> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('memos')
      .insert([memo])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, memo: Partial<Memo>): Promise<Memo> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('memos')
      .update({ ...memo, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('memos').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Tasks CRUD
// =====================================================
export const tasksService = {
  async getAll(): Promise<Task[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...task, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Global Search
// =====================================================
export interface SearchResult {
  type: 'customer' | 'company' | 'transaction' | 'pricecheck' | 'request' | 'account' | 'diary' | 'memo' | 'task';
  title: string;
  subtitle: string;
  category: string;
  data: any;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  try {
    // Search customers
    const { data: customers } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${q}%,contact.ilike.%${q}%,interested_stocks.ilike.%${q}%`);
    
    customers?.forEach((c) => {
      results.push({
        type: 'customer',
        title: c.name,
        subtitle: `${c.customer_type === 'seller' ? '매도' : c.customer_type === 'buyer' ? '매수' : '양방향'} | ${c.contact || 'N/A'}`,
        category: '고객정보',
        data: c,
      });
    });

    // Search companies
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .or(`stock_name.ilike.%${q}%,industry.ilike.%${q}%`);
    
    companies?.forEach((c) => {
      results.push({
        type: 'company',
        title: c.stock_name,
        subtitle: `${c.industry || 'N/A'} | 시세: ${c.current_price?.toLocaleString()}원`,
        category: '기업정보',
        data: c,
      });
    });

    // Search transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .or(`stock_name.ilike.%${q}%,customer_name.ilike.%${q}%`);
    
    transactions?.forEach((t) => {
      results.push({
        type: 'transaction',
        title: t.stock_name,
        subtitle: `${t.date} | ${t.customer_name || 'N/A'} | ${t.sell_total?.toLocaleString()}원`,
        category: '거래내역',
        data: t,
      });
    });

    // Search price checks
    const { data: priceChecks } = await supabase
      .from('price_checks')
      .select('*')
      .or(`stock_name.ilike.%${q}%,holder_company.ilike.%${q}%`);
    
    priceChecks?.forEach((p) => {
      results.push({
        type: 'pricecheck',
        title: p.stock_name,
        subtitle: `${p.date} | ${p.holder_company || 'N/A'}`,
        category: '시세체크',
        data: p,
      });
    });

    // Search client requests
    const { data: requests } = await supabase
      .from('client_requests')
      .select('*')
      .or(`client_name.ilike.%${q}%,target_stock.ilike.%${q}%`);
    
    requests?.forEach((r) => {
      results.push({
        type: 'request',
        title: r.target_stock,
        subtitle: `${r.client_name} | ${r.request_type === 'buy' ? '매수' : '매도'} | ${r.quantity}주`,
        category: '고객의뢰',
        data: r,
      });
    });

    // Search accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .or(`bank_name.ilike.%${q}%,account_holder.ilike.%${q}%`);
    
    accounts?.forEach((a) => {
      results.push({
        type: 'account',
        title: a.bank_name,
        subtitle: `${a.account_number || 'N/A'} | ${a.account_holder || 'N/A'}`,
        category: '계좌정보',
        data: a,
      });
    });

    // Search memos
    const { data: memos } = await supabase
      .from('memos')
      .select('*')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    
    memos?.forEach((m) => {
      results.push({
        type: 'memo',
        title: m.title || '제목 없음',
        subtitle: `${m.content?.substring(0, 50)}${m.content && m.content.length > 50 ? '...' : ''}`,
        category: '메모',
        data: m,
      });
    });

    // Search tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    
    tasks?.forEach((t) => {
      results.push({
        type: 'task',
        title: t.title,
        subtitle: `${t.status === 'completed' ? '✅ 완료' : '📋 진행중'} | ${t.description || '설명 없음'}`,
        category: '할 일',
        data: t,
      });
    });

    // Search diary
    const { data: diary } = await supabase
      .from('diary_entries')
      .select('*')
      .ilike('content', `%${q}%`);
    
    diary?.forEach((d) => {
      results.push({
        type: 'diary',
        title: d.date,
        subtitle: `${d.content?.substring(0, 50)}${d.content && d.content.length > 50 ? '...' : ''}`,
        category: '다이어리',
        data: d,
      });
    });

  } catch (error) {
    console.error('Search error:', error);
  }

  return results;
}

// =====================================================
// Count Functions (for real-time category counts)
// =====================================================
export const countsService = {
  async getCustomersCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting customers count:', error); return 0; }
    return count || 0;
  },

  async getCompaniesCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting companies count:', error); return 0; }
    return count || 0;
  },

  async getTransactionsCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting transactions count:', error); return 0; }
    return count || 0;
  },

  async getPriceChecksCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('price_checks')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting price checks count:', error); return 0; }
    return count || 0;
  },

  async getClientRequestsCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('client_requests')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting client requests count:', error); return 0; }
    return count || 0;
  },

  async getAccountsCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting accounts count:', error); return 0; }
    return count || 0;
  },

  async getMemosCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('memos')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting memos count:', error); return 0; }
    return count || 0;
  },

  async getTasksCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting tasks count:', error); return 0; }
    return count || 0;
  },

  async getDiaryEntriesCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('diary_entries')
      .select('*', { count: 'exact', head: true });
    if (error) { console.error('Error getting diary entries count:', error); return 0; }
    return count || 0;
  },

  async getInProgressRequestsCount(): Promise<number> {
    if (!supabase || !isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('client_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in-progress');
    if (error) { console.error('Error getting in-progress requests count:', error); return 0; }
    return count || 0;
  },

  async getAllCounts(): Promise<Record<string, number>> {
    if (!supabase || !isSupabaseConfigured) return {};
    
    try {
      const [
        customersCount,
        companiesCount,
        transactionsCount,
        priceChecksCount,
        clientRequestsCount,
        accountsCount,
        memosCount,
        tasksCount,
        diaryEntriesCount,
        inProgressRequestsCount
      ] = await Promise.allSettled([
        this.getCustomersCount(),
        this.getCompaniesCount(),
        this.getTransactionsCount(),
        this.getPriceChecksCount(),
        this.getClientRequestsCount(),
        this.getAccountsCount(),
        this.getMemosCount(),
        this.getTasksCount(),
        this.getDiaryEntriesCount(),
        this.getInProgressRequestsCount()
      ]);

      const getCount = (result: PromiseSettledResult<number>) => 
        result.status === 'fulfilled' ? result.value : 0;

      return {
        customer: getCount(customersCount),
        company: getCount(companiesCount),
        transaction: getCount(transactionsCount),
        pricecheck: getCount(priceChecksCount),
        request: getCount(clientRequestsCount),
        account: getCount(accountsCount),
        memo: getCount(memosCount),
        task: getCount(tasksCount),
        diary: getCount(diaryEntriesCount),
        'in-progress-requests': getCount(inProgressRequestsCount)
      };
    } catch (error) {
      console.error('Error getting all counts:', error);
      return {};
    }
  }
};

// =====================================================
// Data Migration (from localStorage to Supabase)
// =====================================================
export async function migrateFromLocalStorage(): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase not configured' };
  }
  
  try {
    const STORAGE_KEY = 'nabi-data-1.0';
    
    // Get localStorage data
    const localData = {
      customers: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-customers`) || '[]'),
      companies: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-companies`) || '[]'),
      transactions: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-transactions`) || '[]'),
      priceChecks: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-priceChecks`) || '[]'),
      clientRequests: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-clientRequests`) || '[]'),
      accounts: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-accounts`) || '[]'),
      diaryEntries: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-diaryEntries`) || '[]'),
      memos: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-memos`) || '[]'),
      tasks: JSON.parse(localStorage.getItem(`${STORAGE_KEY}-tasks`) || '[]'),
    };

    // Convert camelCase to snake_case for Supabase
    const migrateRecords = async (tableName: string, records: any[]) => {
      if (records.length === 0) return;
      
      const convertedRecords = records.map(r => {
        const converted: any = {};
        for (const key in r) {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          converted[snakeKey] = r[key];
        }
        return converted;
      });

      const { error } = await supabase.from(tableName).insert(convertedRecords);
      if (error) console.error(`Error migrating ${tableName}:`, error);
    };

    // Migrate all tables
    await migrateRecords('customers', localData.customers);
    await migrateRecords('companies', localData.companies);
    await migrateRecords('transactions', localData.transactions);
    await migrateRecords('price_checks', localData.priceChecks);
    await migrateRecords('client_requests', localData.clientRequests);
    await migrateRecords('accounts', localData.accounts);
    await migrateRecords('diary_entries', localData.diaryEntries);
    await migrateRecords('memos', localData.memos);
    await migrateRecords('tasks', localData.tasks);

    return { success: true, message: 'Successfully migrated all data to Supabase!' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: 'Migration failed. Please check console for details.' };
  }
}
