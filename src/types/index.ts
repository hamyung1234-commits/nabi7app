// 나비 (나의 비서) 타입 정의

// 카테고리 ID 타입
export type CategoryId = 
  | 'memo' 
  | 'price-check' 
  | 'client-requests' 
  | 'company-info'
  | 'fee-calculator'
  | 'transactions'
  | 'task-list'
  | 'account-info'
  | 'diary'
  | 'customer';

// 카테고리 인터페이스
export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// 메모 타입
export interface Memo {
  id: string;
  content: string;
  category: CategoryId;
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 시세체크 (Price Check)
export interface PriceCheckItem {
  id: string;
  stockName: string;
  date: string;
  sellPrice: number;
  buyPrice: number;
  quantity: number;
  holderCompany: string;
  memo: string;
  createdAt: string;
}

// 고객 의뢰내역 (Client Requests)
export type RequestType = 'buy' | 'sell';
export type RequestStatus = 'in-progress' | 'completed' | 'pending' | 'on-hold';

export interface ClientRequest {
  id: string;
  clientName: string;
  contact: string;
  targetStock: string;
  requestType: RequestType;
  quantity: number;
  desiredPrice: number;
  requestDate: string;
  status: RequestStatus;
  memo: string;
  createdAt: string;
}

// 기업정보 (Company Info)
export interface CompanyInfo {
  id: string;
  stockName: string;
  industry: string;
  currentPrice: number;
  parValue: number;
  totalShares: number;
  floatingShares: number;
  totalCapital: number;
  totalDebt: number;
  revenue: number;
  operatingProfit: number;
  netProfit: number;
  industryPER: number;
  targetPrice: number;
  createdAt: string;
  updatedAt: string;
}

// 기업정보 계산 필드
export interface CompanyCalculations {
  capital: number;          // 자본금 = 액면가 × 주식수
  marketCap: number;        // 시총 = 현시세 × 주식수
  operatingProfitRate: number; // 영업이익률 = (영업이익 / 매출) × 100
  eps: number;              // EPS = 순이익 / 주식수
  bps: number;              // BPS = 자본총계 / 주식수
  per: number;              // PER = 현시세 / EPS
  pbr: number;              // PBR = 현시세 / BPS
  roe: number;              // ROE = EPS / BPS
  fairPrice: number;        // 적정주가 = 순이익 × (현시세 / BPS)
  debtRatio: number;        // 부채비율 = (부채총계 / 자본총계) × 100
}

// 수고비 세금계산 (Fee Calculator)
export interface FeeCalculation {
  // 공통 입력
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  commissionRate: number;    // 수고비율 (default 0.7%)
  depositRate: number;       // 계약금비율 (default 10%)

  // 계산 - 기본 거래
  totalAmount: number;       // 총거래금액 = 매도가 × 거래수량
  sellProfit: number;        // 매도차익 = (매도가 - 매수가) × 거래수량
  transactionTax: number;    // 거래세(0.35%) = 총거래금액 × 0.0035

  // 구간A (11% 양도세 - 소기업/개인)
  transferTax11: number;     // 양도세(11%) = 매도차익 × 0.11
  totalTax11: number;       // 매도총세금 = 거래세 + 양도세(11%)
  profitAfterTax11: number;  // 총세금공제차익 = 매도차익 - 매도총세금
  actualFee11: number;       // 실수령 수수료 = 총세금공제차익 × 0.5

  // 구간B (22% 양도세 - 대기업)
  transferTax22: number;     // 양도세(22%) = 매도차익 × 0.22
  totalTax22: number;        // 매도총세금 = 거래세 + 양도세(22%)
  profitAfterTax22: number;  // 총세금공제차익 = 매도차익 - 매도총세금
  actualFee22: number;       // 실수령 수수료 = 총세금공제차익 × 0.3

  // 수수료
  commission: number;        // 매수수고비 = 총거래금액 × 수고비율
  deposit: number;          // 계약금 = 총거래금액 × 계약금비율
  balance: number;           // 잔금 = 총거래금액 - 계약금
  transferAmount: number;   // 원매도 송금액 = 총거래금액

  // 일반빽 계산
  priceDiff: number;        // 주당차액
  taxManual: number;        // 세금 = 주당차액 × (양도세율/100 + 0.0035) × 수량
  totalDiff: number;        // 총차액 = 수량 × 주당차액
  paybackAmount: number;    // 빽해줄금액 = 총차액 - 세금
  taxRateManual: number;   // 양도세율(%)

  // 증권 플러스
  buyRealPrice: number;     // 매수 실입금가 = 매수가 × 1.01
  sellRealPrice: number;    // 매도 실입금가 = 매도가 × 0.99
}

// 거래내역 (Transactions)
export interface Transaction {
  id: string;
  date: string;
  stockName: string;
  
  // 매수 측
  buyer: string;
  buyQuantity: number;
  buyUnitPrice: number;
  buyCommissionRate: number;

  // 매도 측
  seller: string;
  sellUnitPrice: number;
  sellCommissionRate: number;

  // 고객 정보
  customerName: string;
  customerContact: string;
  manager: string;

  // 계산 - 매수
  buyTotal: number;
  buyCommission: number;
  buyGrossTotal: number;

  // 계산 - 매도
  sellTotal: number;
  transferProfit: number;
  transferTax: number;
  securitiesTax: number;
  sellCommission: number;
  totalDeduction: number;
  netAmount: number;
  actualReceipt: number;
  transferTax16: number;

  createdAt: string;
}

// 진행 리스트 (Task List)
export type TaskStatus = 'in-progress' | 'waiting' | 'completed' | 'on-hold';

export interface Task {
  id: string;
  title: string;
  relatedStock: string;
  client: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// 계좌정보 (Account Info)
export interface Account {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  purpose: string;
  memo: string;
  createdAt: string;
}

// 다이어리 / 전체 메모
export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 고객정보 (Customer CRM)
export type CustomerType = 'seller' | 'buyer' | 'both';
export type CustomerStatus = 'active' | 'inactive' | 'blacklist';

export interface Customer {
  id: string;
  name: string;
  contact: string;
  customerType: CustomerType;
  manager: string;
  firstDealDate: string;
  recentDealDate: string;
  interestedStocks: string;
  memo: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

// 고객 자동 계산
export interface CustomerCalculations {
  totalDealCount: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  totalFee: number;
  avgDealAmount: number;
  dealGapDays: number;
  totalRequestCount: number;
  inProgressCount: number;
  completedCount: number;
  requestCompletionRate: number;
}

// 파일 첨부
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  data: string; // base64
  uploadedAt: string;
}

// 앱 상태
export interface AppState {
  activeCategory: CategoryId;
  selectedDate: string;
  memos: Memo[];
  priceChecks: PriceCheckItem[];
  clientRequests: ClientRequest[];
  companies: CompanyInfo[];
  transactions: Transaction[];
  tasks: Task[];
  accounts: Account[];
  diaryEntries: DiaryEntry[];
  customers: Customer[];
  attachments: Attachment[];
  searchQuery: string;
}

// 카테고리 정의
export const CATEGORIES: Category[] = [
  { id: 'memo', name: '오늘의 메모', icon: '📝', color: '#6b7280', description: '일일 자유 메모 및 자동분류' },
  { id: 'price-check', name: '시세체크', icon: '💰', color: '#f59e0b', description: '종목별 시세 관리' },
  { id: 'client-requests', name: '고객 의뢰', icon: '👥', color: '#ef4444', description: '고객 의뢰내역 관리' },
  { id: 'company-info', name: '기업정보', icon: '🏢', color: '#8b5cf6', description: '기업 정보 및 재무제표' },
  { id: 'fee-calculator', name: '수고비 계산', icon: '🧮', color: '#10b981', description: '세금 및 수고비 계산' },
  { id: 'transactions', name: '거래내역', icon: '📊', color: '#3b82f6', description: '거래 내역 관리' },
  { id: 'task-list', name: '진행 리스트', icon: '✅', color: '#6366f1', description: '업무 진행 현황' },
  { id: 'account-info', name: '계좌정보', icon: '💳', color: '#ec4899', description: '계좌 정보 관리' },
  { id: 'diary', name: '전체 메모', icon: '📅', color: '#64748b', description: '전체 메모 다이어리' },
  { id: 'customer', name: '고객정보', icon: '👤', color: '#14b8a6', description: '고객 CRM 관리' },
];

// 유틸리티 타입
export type { CategoryId as CategoryType };

// 포맷터
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// 날짜 헬퍼
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 계좌번호 마스킹
export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  const visiblePart = accountNumber.slice(-4);
  const maskedPart = '*'.repeat(Math.min(accountNumber.length - 4, 8));
  return `${maskedPart}${visiblePart}`;
};