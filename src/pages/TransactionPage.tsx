import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface TransactionPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function TransactionPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: TransactionPageProps = {}) {
  const { transactions, setTransactions } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    stockName: '',
    buyer: '',
    buyQuantity: '',
    buyUnitPrice: '',
    buyCommissionRate: '0.5',
    seller: '',
    sellUnitPrice: '',
    sellCommissionRate: '0.5',
    customerName: '',
    customerContact: '',
    manager: '',
  });
  
  // Track if we need to auto-select an item from search
  const hasAutoSelectedRef = useRef(false);
  // Track the last selected ID to avoid re-processing
  const lastSelectedIdRef = useRef<string | null>(null);

  // Handle selected item from search - ONLY open the detail modal, don't clear selection here
  useEffect(() => {
    // Only process if we have a valid selection request for this page type
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'transaction') {
      return;
    }
    
    // Avoid re-processing the same item
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    // If we don't have any transactions loaded yet, wait
    if (!transactions || transactions.length === 0) {
      console.log('[TransactionPage] Waiting for transactions to load...');
      return;
    }
    
    console.log('[TransactionPage] Auto-selecting transaction:', selectedItemId);
    console.log('[TransactionPage] Available transactions:', transactions.map((t: any) => t.id));
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    // Find the transaction and open detail
    const transaction = transactions.find((t: any) => t.id === selectedItemId);
    if (transaction) {
      console.log('[TransactionPage] Found transaction:', transaction.stockName);
      setSelectedTransaction(transaction);
    } else {
      console.warn('[TransactionPage] Transaction not found with ID:', selectedItemId);
      // Try alternative ID formats
      const transactionAlt = transactions.find((t: any) => 
        t.id === selectedItemId || 
        t.id?.includes(selectedItemId) ||
        selectedItemId.includes(t.id)
      );
      if (transactionAlt) {
        console.log('[TransactionPage] Found transaction via alternative match:', transactionAlt.stockName);
        setSelectedTransaction(transactionAlt);
      }
    }
    
    // NOTE: We do NOT call onClearSelection here - only when user closes the modal
  }, [selectedItemId, selectedItemType, transactions]);

  const calc = useMemo(() => {
    const buyQuantity = Number(formData.buyQuantity) || 0;
    const buyUnitPrice = Number(formData.buyUnitPrice) || 0;
    const sellUnitPrice = Number(formData.sellUnitPrice) || 0;
    const buyCommissionRate = Number(formData.buyCommissionRate) / 100 || 0;
    const sellCommissionRate = Number(formData.sellCommissionRate) / 100 || 0;

    const buyTotal = buyQuantity * buyUnitPrice;
    const buyCommission = buyTotal * buyCommissionRate;
    const buyGrossTotal = buyTotal + buyCommission;

    const sellTotal = buyQuantity * sellUnitPrice;
    const transferProfit = sellTotal - buyGrossTotal;
    const transferTax = transferProfit * 0.11;
    const securitiesTax = sellTotal * 0.005;
    const sellCommission = sellTotal * sellCommissionRate;
    const totalDeduction = transferTax + securitiesTax + sellCommission;
    const netAmount = transferProfit - totalDeduction;
    const actualReceipt = netAmount / 2;
    const transferTax16 = transferProfit * 0.16;

    return { buyTotal, buyCommission, buyGrossTotal, sellTotal, transferProfit, transferTax, securitiesTax, sellCommission, totalDeduction, netAmount, actualReceipt, transferTax16 };
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction = {
      id: generateId(),
      date: formData.date,
      stockName: formData.stockName,
      buyer: formData.buyer,
      buyQuantity: Number(formData.buyQuantity),
      buyUnitPrice: Number(formData.buyUnitPrice),
      buyCommissionRate: Number(formData.buyCommissionRate),
      seller: formData.seller,
      sellUnitPrice: Number(formData.sellUnitPrice),
      sellCommissionRate: Number(formData.sellCommissionRate),
      customerName: formData.customerName,
      customerContact: formData.customerContact,
      manager: formData.manager,
      ...calc,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev: any) => [...prev, newTransaction]);
    incrementCount('transaction');
    setFormData({ date: new Date().toISOString().split('T')[0], stockName: '', buyer: '', buyQuantity: '', buyUnitPrice: '', buyCommissionRate: '0.5', seller: '', sellUnitPrice: '', sellCommissionRate: '0.5', customerName: '', customerContact: '', manager: '' });
    setShowForm(false);
  };

  // 하이라이트 스타일
  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return {
        background: '#FFF9C4',
        transition: 'background 0.3s ease'
      };
    }
    return {};
  };

  const handleDelete = (id: string) => {
    setTransactions((prev: any) => prev.filter((t: any) => t.id !== id));
    decrementCount('transaction');
    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
    }
  };

  const totals = useMemo(() => {
    return transactions.reduce((acc: any, t: any) => ({
      buyTotal: acc.buyTotal + (t.buyTotal || 0),
      sellTotal: acc.sellTotal + (t.sellTotal || 0),
      netAmount: acc.netAmount + (t.netAmount || 0),
    }), { buyTotal: 0, sellTotal: 0, netAmount: 0 });
  }, [transactions]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Close detail handler - ONLY NOW clear the selection
  const handleCloseDetail = () => {
    setSelectedTransaction(null);
    // Reset auto-selection tracking
    hasAutoSelectedRef.current = false;
    lastSelectedIdRef.current = null;
    // Clear the selected item from App state
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // 상세 모달
  const renderDetail = () => {
    if (!selectedTransaction) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>{selectedTransaction.stockName}</h2>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>{selectedTransaction.date}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          {/* 거래 요약 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card">
              <div className="summary-card-label">매수총액</div>
              <div className="summary-card-value">{formatCurrency(selectedTransaction.buyTotal)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">매도총액</div>
              <div className="summary-card-value" style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedTransaction.sellTotal)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">실수령액</div>
              <div className="summary-card-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(selectedTransaction.actualReceipt)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">고객</div>
              <div className="summary-card-value">{selectedTransaction.customerName || '-'}</div>
            </div>
          </div>

          {/* 매수/매도 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-error)' }}>매수 정보</h4>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                <div><strong>매수자:</strong> {selectedTransaction.buyer || '-'}</div>
                <div><strong>수량:</strong> {selectedTransaction.buyQuantity?.toLocaleString()}</div>
                <div><strong>단가:</strong> {formatCurrency(selectedTransaction.buyUnitPrice)}</div>
                <div><strong>수고비율:</strong> {selectedTransaction.buyCommissionRate}%</div>
                <div><strong>매수총액:</strong> {formatCurrency(selectedTransaction.buyTotal)}</div>
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-success)' }}>매도 정보</h4>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 2 }}>
                <div><strong>매도자:</strong> {selectedTransaction.seller || '-'}</div>
                <div><strong>단가:</strong> {formatCurrency(selectedTransaction.sellUnitPrice)}</div>
                <div><strong>수고비율:</strong> {selectedTransaction.sellCommissionRate}%</div>
                <div><strong>매도총액:</strong> {formatCurrency(selectedTransaction.sellTotal)}</div>
              </div>
            </div>
          </div>

          {/* 세금 및 수령액 */}
          <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-primary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'white' }}>정산 내역</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)', fontSize: 'var(--font-sm)', color: 'white' }}>
              <div><strong>양도차익:</strong> {formatCurrency(selectedTransaction.transferProfit)}</div>
              <div><strong>양도세(11%):</strong> {formatCurrency(selectedTransaction.transferTax)}</div>
              <div><strong>증권거래세:</strong> {formatCurrency(selectedTransaction.securitiesTax)}</div>
              <div><strong>순액:</strong> {formatCurrency(selectedTransaction.netAmount)}</div>
              <div><strong>실수령액:</strong> {formatCurrency(selectedTransaction.actualReceipt)}</div>
            </div>
          </div>

          {/* 기타 정보 */}
          {selectedTransaction.manager && (
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>기타 정보</h4>
              <div style={{ fontSize: 'var(--font-sm)' }}>
                <div><strong>담당자:</strong> {selectedTransaction.manager}</div>
                {selectedTransaction.customerContact && <div><strong>고객 연락처:</strong> {selectedTransaction.customerContact}</div>}
              </div>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedTransaction.id)}>삭제</button>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>닫기</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">거래내역</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 새 거래'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">날짜</label>
                <input type="date" className="form-input" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">종목명</label>
                <input type="text" className="form-input" value={formData.stockName} onChange={e => handleChange('stockName', e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매수侧</h4>
                <div className="form-group">
                  <label className="form-label">매수자</label>
                  <input type="text" className="form-input" value={formData.buyer} onChange={e => handleChange('buyer', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">수량</label>
                    <input type="number" className="form-input" value={formData.buyQuantity} onChange={e => handleChange('buyQuantity', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">단가</label>
                    <input type="number" className="form-input" value={formData.buyUnitPrice} onChange={e => handleChange('buyUnitPrice', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">수고비율 (%)</label>
                  <input type="number" className="form-input" value={formData.buyCommissionRate} onChange={e => handleChange('buyCommissionRate', e.target.value)} step="0.1" />
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                  매수총액: {formatCurrency(calc.buyTotal)}<br />
                  매수총액(+수고비): {formatCurrency(calc.buyGrossTotal)}
                </div>
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매도侧</h4>
                <div className="form-group">
                  <label className="form-label">매도자</label>
                  <input type="text" className="form-input" value={formData.seller} onChange={e => handleChange('seller', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">단가</label>
                  <input type="number" className="form-input" value={formData.sellUnitPrice} onChange={e => handleChange('sellUnitPrice', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">수고비율 (%)</label>
                  <input type="number" className="form-input" value={formData.sellCommissionRate} onChange={e => handleChange('sellCommissionRate', e.target.value)} step="0.1" />
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                  매도총액: {formatCurrency(calc.sellTotal)}<br />
                  양도차익: {formatCurrency(calc.transferProfit)}
                </div>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">고객명</label>
                <input type="text" className="form-input" value={formData.customerName} onChange={e => handleChange('customerName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">고객 연락처</label>
                <input type="text" className="form-input" value={formData.customerContact} onChange={e => handleChange('customerContact', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">담당자</label>
                <input type="text" className="form-input" value={formData.manager} onChange={e => handleChange('manager', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
              <strong>계산 결과:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-sm)' }}>
                <div>양도세 (11%): {formatCurrency(calc.transferTax)}</div>
                <div>증권거래세: {formatCurrency(calc.securitiesTax)}</div>
                <div>순액: {formatCurrency(calc.netAmount)}</div>
                <div>실수령액: {formatCurrency(calc.actualReceipt)}</div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>저장</button>
          </form>
        )}

        {transactions.length === 0 ? (
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
                  <th>매수총액</th>
                  <th>매도총액</th>
                  <th>양도세</th>
                  <th>순액</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr 
                    key={t.id}
                    onClick={() => setSelectedTransaction(t)}
                    style={{ cursor: 'pointer', ...getRowStyle(t) }}
                    onMouseOver={(e) => {
                      if (!highlightedItemId || t.id !== highlightedItemId) {
                        e.currentTarget.style.background = 'var(--color-bg-input)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!highlightedItemId || t.id !== highlightedItemId) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <td>{t.date}</td>
                    <td><strong>{t.stockName}</strong></td>
                    <td className="calculated-value">{formatCurrency(t.buyTotal)}</td>
                    <td className="calculated-value">{formatCurrency(t.sellTotal)}</td>
                    <td>{formatCurrency(t.transferTax)}</td>
                    <td style={{ color: t.netAmount >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {formatCurrency(t.netAmount)}
                    </td>
                    <td><button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', background: 'var(--color-bg-input)' }}>
                  <td colSpan={2}>합계</td>
                  <td>{formatCurrency(totals.buyTotal)}</td>
                  <td>{formatCurrency(totals.sellTotal)}</td>
                  <td>-</td>
                  <td>{formatCurrency(totals.netAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {renderDetail()}
    </div>
  );
}