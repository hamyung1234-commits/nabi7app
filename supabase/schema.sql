-- =====================================================
-- 나의비서 (나비) 앱 데이터베이스 스키마
-- Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 고객정보 (customers)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(50),
  customer_type VARCHAR(20) DEFAULT 'both', -- 'seller', 'buyer', 'both'
  manager VARCHAR(50),
  first_deal_date DATE,
  recent_deal_date DATE,
  interested_stocks TEXT,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_holder VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'blacklist'
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 기업정보 (companies)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_name VARCHAR(100) NOT NULL,
  industry VARCHAR(100),
  current_price INTEGER DEFAULT 0,
  par_value INTEGER DEFAULT 0,
  total_shares BIGINT DEFAULT 0,
  total_capital BIGINT DEFAULT 0,
  total_debt BIGINT DEFAULT 0,
  revenue BIGINT DEFAULT 0,
  operating_profit BIGINT DEFAULT 0,
  net_profit BIGINT DEFAULT 0,
  industry_per DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 거래내역 (transactions)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  stock_name VARCHAR(100),
  buyer VARCHAR(100),
  buy_quantity INTEGER DEFAULT 0,
  buy_unit_price INTEGER DEFAULT 0,
  buy_total INTEGER DEFAULT 0,
  seller VARCHAR(100),
  sell_quantity INTEGER DEFAULT 0,
  sell_unit_price INTEGER DEFAULT 0,
  sell_total INTEGER DEFAULT 0,
  transfer_profit INTEGER DEFAULT 0,
  actual_receipt INTEGER DEFAULT 0,
  customer_name VARCHAR(100),
  manager VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 시세체크 (price_checks)
-- =====================================================
CREATE TABLE IF NOT EXISTS price_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  stock_name VARCHAR(100),
  sell_price INTEGER DEFAULT 0,
  buy_price INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  holder_company VARCHAR(100),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 고객의뢰 (client_requests)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(100) NOT NULL,
  contact VARCHAR(50),
  target_stock VARCHAR(100),
  request_type VARCHAR(20) DEFAULT 'buy', -- 'buy', 'sell'
  quantity INTEGER DEFAULT 0,
  desired_price INTEGER DEFAULT 0,
  request_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in-progress', 'completed', 'on-hold'
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. 계좌정보 (accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100),
  account_holder VARCHAR(50),
  purpose VARCHAR(100),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. 다이어리 (diary_entries)
-- =====================================================
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. 메모 (memos)
-- =====================================================
CREATE TABLE IF NOT EXISTS memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. 할 일 (tasks)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  related_stock VARCHAR(100),
  client VARCHAR(100),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in-progress', 'completed', 'on-hold'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 인덱스 생성
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_contact ON customers(contact);
CREATE INDEX IF NOT EXISTS idx_companies_stock_name ON companies(stock_name);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_stock_name ON transactions(stock_name);
CREATE INDEX IF NOT EXISTS idx_price_checks_date ON price_checks(date);
CREATE INDEX IF NOT EXISTS idx_price_checks_stock_name ON price_checks(stock_name);
CREATE INDEX IF NOT EXISTS idx_client_requests_client_name ON client_requests(client_name);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- Row Level Security (RLS) 활성화
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS 정책 (모든 사용자가 모든 데이터 접근 가능 - 필요시 수정)
-- =====================================================
CREATE POLICY "Allow all for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for price_checks" ON price_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for client_requests" ON client_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for diary_entries" ON diary_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for memos" ON memos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
