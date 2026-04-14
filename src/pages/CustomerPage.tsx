import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency, maskAccountNumber, Customer, CustomerStatus, CustomerType } from '../types';
import * as XLSX from 'xlsx';

export default function CustomerPage() {
  const { customers, setCustomers, transactions, clientRequests } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'transactions' | 'requests' | 'memo'>('info');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount' | 'fee'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    customerType: 'both' as CustomerType,
    manager: '',
    firstDealDate: '',
    recentDealDate: '',
    interestedStocks: '',
    memo: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    status: 'active' as CustomerStatus,
  });

  // 계산된 고객 데이터
  const calculateCustomerStats = (customer: Customer) => {
    // 거래내역 연동
    const customerTransactions = transactions.filter((t: any) => 
      t.customerName === customer.name
    );
    
    const totalDealCount = customerTransactions.length;
    const totalBuyAmount = customerTransactions.reduce((sum: number, t: any) => sum + (t.buyTotal || 0), 0);
    const totalSellAmount = customerTransactions.reduce((sum: number, t: any) => sum + (t.sellTotal || 0), 0);
    const totalFee = customerTransactions.reduce((sum: number, t: any) => sum + (t.actualReceipt || 0), 0);
    const avgDealAmount = totalDealCount > 0 ? totalSellAmount / totalDealCount : 0;
    
    // 거래 공백일수
    const today = new Date();
    const recentDeal = customerTransactions.length > 0 
      ? customerTransactions.reduce((latest: any, t: any) => 
          new Date(t.date) > new Date(latest.date) ? t : latest
        )
      : null;
    const recentDealDateCalc = recentDeal ? new Date(recentDeal.date) : null;
    const dealGapDays = recentDealDateCalc 
      ? Math.floor((today.getTime() - recentDealDateCalc.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // 의뢰내역 연동
    const customerRequests = clientRequests.filter((c: any) => c.clientName === customer.name);
    const totalRequestCount = customerRequests.length;
    const inProgressCount = customerRequests.filter((c: any) => c.status === 'in-progress').length;
    const completedCount = customerRequests.filter((c: any) => c.status === 'completed').length;
    const requestCompletionRate = totalRequestCount > 0 ? (completedCount / totalRequestCount) * 100 : 0;

    return {
      totalDealCount,
      totalBuyAmount,
      totalSellAmount,
      totalFee,
      avgDealAmount,
      dealGapDays,
      totalRequestCount,
      inProgressCount,
      completedCount,
      requestCompletionRate,
    };
  };

  // 요약 통계
  const summaryStats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const newCustomersThisMonth = customers.filter((c: any) => 
      c.createdAt && c.createdAt.startsWith(thisMonth)
    ).length;
    const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
    
    let longIdleCount = 0;
    customers.forEach((c: any) => {
      const stats = calculateCustomerStats(c);
      if (stats.dealGapDays && stats.dealGapDays >= 30) longIdleCount++;
    });

    return {
      total: customers.length,
      newThisMonth: newCustomersThisMonth,
      active: activeCustomers,
      longIdle: longIdleCount,
    };
  }, [customers, transactions]);

  // 필터링 및 정렬
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // 검색
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name?.toLowerCase().includes(query) ||
        c.contact?.toLowerCase().includes(query) ||
        c.interestedStocks?.toLowerCase().includes(query)
      );
    }

    // 고객 유형 필터
    if (filterType !== 'all') {
      filtered = filtered.filter((c: any) => c.customerType === filterType);
    }

    // 상태 필터
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c: any) => c.status === filterStatus);
    }

    // 정렬
    filtered.sort((a: any, b: any) => {
      const statsA = calculateCustomerStats(a);
      const statsB = calculateCustomerStats(b);
      
      switch (sortBy) {
        case 'recent':
          return (statsB.dealGapDays || 0) - (statsA.dealGapDays || 0);
        case 'amount':
          return statsB.totalSellAmount - statsA.totalSellAmount;
        case 'fee':
          return statsB.totalFee - statsA.totalFee;
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchQuery, filterType, filterStatus, sortBy, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      id: generateId(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev: any) => [...prev, newCustomer]);
    setFormData({
      name: '', contact: '', customerType: 'both', manager: '',
      firstDealDate: '', recentDealDate: '', interestedStocks: '',
      memo: '', bankName: '', accountNumber: '', accountHolder: '', status: 'active'
    });
    setShowForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCustomerTypeLabel = (type: CustomerType) => {
    const labels: Record<CustomerType, string> = {
      seller: '매도',
      buyer: '매수',
      both: '양방향',
    };
    return labels[type];
  };

  const getStatusLabel = (status: CustomerStatus) => {
    const labels: Record<CustomerStatus, string> = {
      active: '활성',
      inactive: '휴면',
      blacklist: '블랙리스트',
    };
    return labels[status];
  };

  const getStatusColor = (status: CustomerStatus) => {
    const colors: Record<CustomerStatus, string> = {
      active: '#10b981',
      inactive: '#f59e0b',
      blacklist: '#ef4444',
    };
    return colors[status];
  };

  // 엑셀 내보내기
  const exportToExcel = () => {
    const exportData = customers.map((c: any) => {
      const stats = calculateCustomerStats(c);
      return {
        '고객명': c.name,
        '연락처': c.contact,
        '고객유형': getCustomerTypeLabel(c.customerType),
        '담당자': c.manager,
        '최초거래일': c.firstDealDate,
        '최근거래일': stats.dealGapDays ? `${Math.floor((new Date().getTime() - new Date(c.recentDealDate).getTime()) / (1000 * 60 * 60 * 24))}일 전` : '-',
        '관심종목': c.interestedStocks,
        '총거래건수': stats.totalDealCount,
        '총매도금액': stats.totalSellAmount,
        '총수수료수입': stats.totalFee,
        '총의뢰건수': stats.totalRequestCount,
        '상태': getStatusLabel(c.status),
        '메모': c.memo,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '고객목록');
    XLSX.writeFile(wb, '고객목록_내보내기.xlsx');
  };

  // 고객 상세 페이지 렌더링
  const renderCustomerDetail = () => {
    if (!selectedCustomer) return null;
    const stats = calculateCustomerStats(selectedCustomer);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>{selectedCustomer.name}</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}>✕ 닫기</button>
          </div>

          {/* 요약 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">총 거래 건수</div>
              <div className="summary-card-value">{stats.totalDealCount}</div>
            </div>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">총 수수료 수입</div>
              <div className="summary-card-value">{formatCurrency(stats.totalFee)}</div>
            </div>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">최근 거래일</div>
              <div className="summary-card-value" style={{ fontSize: 'var(--font-sm)' }}>
                {selectedCustomer.recentDealDate || '-'}
              </div>
            </div>
            <div className={`summary-card ${stats.dealGapDays && stats.dealGapDays >= 90 ? 'summary-card-warning-red' : stats.dealGapDays && stats.dealGapDays >= 30 ? 'summary-card-warning-yellow' : ''}`}>
              <div className="summary-card-label">거래 공백일수</div>
              <div className="summary-card-value">
                {stats.dealGapDays !== null ? `${stats.dealGapDays}일` : '-'}
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
            {(['info', 'transactions', 'requests', 'memo'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                {tab === 'info' ? '① 기본 정보' : tab === 'transactions' ? '② 거래내역' : tab === 'requests' ? '③ 의뢰내역' : '④ 메모'}
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>기본 정보</h4>
                  <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                    <div><strong>연락처:</strong> {selectedCustomer.contact}</div>
                    <div><strong>고객 유형:</strong> {getCustomerTypeLabel(selectedCustomer.customerType)}</div>
                    <div><strong>담당자:</strong> {selectedCustomer.manager || '-'}</div>
                    <div><strong>관심 종목:</strong> {selectedCustomer.interestedStocks || '-'}</div>
                    <div><strong>상태:</strong> <span style={{ color: getStatusColor(selectedCustomer.status) }}>{getStatusLabel(selectedCustomer.status)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>계좌 정보</h4>
                  <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                    <div><strong>은행명:</strong> {selectedCustomer.bankName || '-'}</div>
                    <div><strong>계좌번호:</strong> {selectedCustomer.accountNumber ? (
                      <span style={{ cursor: 'pointer' }} onClick={() => setShowAccountNumbers(prev => ({ ...prev, [selectedCustomer.id]: !prev[selectedCustomer.id] }))}>
                        {showAccountNumbers[selectedCustomer.id] ? selectedCustomer.accountNumber : maskAccountNumber(selectedCustomer.accountNumber)}
                      </span>
                    ) : '-'}</div>
                    <div><strong>예금주:</strong> {selectedCustomer.accountHolder || '-'}</div>
                  </div>
                </div>
              </div>
              {selectedCustomer.memo && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>메모</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>{selectedCustomer.memo}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              {transactions.filter((t: any) => t.customerName === selectedCustomer.name).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">T</div>
                  <p className="empty-state-text">거래 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>종목</th>
                        <th>매도총액</th>
                        <th>실수령액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.filter((t: any) => t.customerName === selectedCustomer.name).map((t: any) => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td>{t.stockName}</td>
                          <td>{formatCurrency(t.sellTotal)}</td>
                          <td>{formatCurrency(t.actualReceipt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {clientRequests.filter((c: any) => c.clientName === selectedCustomer.name).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">C</div>
                  <p className="empty-state-text">의뢰 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>종목</th>
                        <th>유형</th>
                        <th>수량</th>
                        <th>희망가</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientRequests.filter((c: any) => c.clientName === selectedCustomer.name).map((c: any) => (
                        <tr key={c.id}>
                          <td>{c.targetStock}</td>
                          <td>{c.requestType === 'buy' ? '매수' : '매도'}</td>
                          <td>{Number(c.quantity).toLocaleString()}</td>
                          <td>{formatCurrency(c.desiredPrice)}</td>
                          <td>{c.status === 'in-progress' ? '진행중' : c.status === 'completed' ? '완료' : c.status === 'pending' ? '대기' : '보류'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memo' && (
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
                날짜별 고객 관련 메모 타임라인 기능은 차후 구현 예정입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">고객 CRM</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button className="btn btn-secondary btn-sm" onClick={exportToExcel}>📥 엑셀 내보내기</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 고객 추가'}
            </button>
          </div>
        </div>

        {/* 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="summary-card">
            <div className="summary-card-label">전체 고객 수</div>
            <div className="summary-card-value">{summaryStats.total}</div>
          </div>
          <div className="summary-card" style={{ background: 'var(--color-success)' }}>
            <div className="summary-card-label">이번달 신규</div>
            <div className="summary-card-value">{summaryStats.newThisMonth}</div>
          </div>
          <div className="summary-card" style={{ background: 'var(--color-primary)' }}>
            <div className="summary-card-label">활성 고객</div>
            <div className="summary-card-value">{summaryStats.active}</div>
          </div>
          <div className="summary-card" style={{ background: summaryStats.longIdle > 0 ? '#f59e0b' : 'var(--color-bg-input)' }}>
            <div className="summary-card-label">장기 미거래 (30일+)</div>
            <div className="summary-card-value">{summaryStats.longIdle}</div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="고객명, 연락처, 관심종목 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">전체 유형</option>
            <option value="seller">매도</option>
            <option value="buyer">매수</option>
            <option value="both">양방향</option>
          </select>
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">휴면</option>
            <option value="blacklist">블랙리스트</option>
          </select>
          <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ width: 'auto' }}>
            <option value="recent">최근 거래일 순</option>
            <option value="amount">거래 금액 순</option>
            <option value="fee">수수료 수입 순</option>
          </select>
        </div>

        {/* 새 고객 등록 폼 */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">고객명 *</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">연락처</label>
                <input type="text" className="form-input" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">고객 유형</label>
                <select className="form-select" value={formData.customerType} onChange={e => setFormData({ ...formData, customerType: e.target.value as any })}>
                  <option value="seller">매도</option>
                  <option value="buyer">매수</option>
                  <option value="both">양방향</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">담당자</label>
                <input type="text" className="form-input" value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">최초 거래일</label>
                <input type="date" className="form-input" value={formData.firstDealDate} onChange={e => setFormData({ ...formData, firstDealDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">최근 거래일</label>
                <input type="date" className="form-input" value={formData.recentDealDate} onChange={e => setFormData({ ...formData, recentDealDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">관심 종목</label>
                <input type="text" className="form-input" value={formData.interestedStocks} onChange={e => setFormData({ ...formData, interestedStocks: e.target.value })} placeholder="복수 입력 가능" />
              </div>
              <div className="form-group">
                <label className="form-label">상태</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="active">활성</option>
                  <option value="inactive">휴면</option>
                  <option value="blacklist">블랙리스트</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">은행명</label>
                <input type="text" className="form-input" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">계좌번호</label>
                <input type="text" className="form-input" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">예금주</label>
                <input type="text" className="form-input" value={formData.accountHolder} onChange={e => setFormData({ ...formData, accountHolder: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">메모 (고객 특이사항, 성향, 주의사항)</label>
              <textarea className="form-textarea" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">저장</button>
          </form>
        )}

        {/* 고객 목록 */}
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <p className="empty-state-text">고객이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            {filteredCustomers.map((customer: any) => {
              const stats = calculateCustomerStats(customer);
              const isWarning = stats.dealGapDays && stats.dealGapDays >= 30;
              const isDanger = stats.dealGapDays && stats.dealGapDays >= 90;

              return (
                <div
                  key={customer.id}
                  style={{
                    padding: 'var(--spacing-md)',
                    background: isDanger ? '#fef2f2' : isWarning ? '#fffbeb' : 'var(--color-bg-card)',
                    border: isDanger ? '1px solid #ef4444' : isWarning ? '1px solid #f59e0b' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                    <div>
                      <strong style={{ fontSize: 'var(--font-lg)' }}>{customer.name}</strong>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--spacing-sm)', marginTop: '2px' }}>
                        <span>{getCustomerTypeLabel(customer.customerType)}</span>
                        <span style={{ padding: '1px 6px', background: getStatusColor(customer.status), color: 'white', borderRadius: '9999px', fontSize: '10px' }}>
                          {getStatusLabel(customer.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <span>📞</span>
                      <span>{customer.contact}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(customer.contact); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-xs)', color: 'var(--color-primary)' }}
                      >
                        복사
                      </button>
                    </div>
                    {customer.interestedStocks && (
                      <div style={{ marginTop: '4px' }}>
                        <span>📈 관심: {customer.interestedStocks}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-xs)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      거래 {stats.totalDealCount}건 | 수수료 {formatCurrency(stats.totalFee)}
                    </span>
                    <span style={{ 
                      color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : 'var(--color-text-muted)',
                      fontWeight: isDanger || isWarning ? 'bold' : 'normal'
                    }}>
                      {stats.dealGapDays !== null ? `${stats.dealGapDays}일` : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 고객 상세 모달 */}
      {renderCustomerDetail()}
    </div>
  );
}