import { useState, useMemo, useEffect, useRef } from 'react';
import { useTransactions } from '../hooks/useSupabase';
import { generateId, formatCurrency } from '../types';

// Props for search navigation
interface TransactionPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function TransactionPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: TransactionPageProps = {}) {
  const { data: transactions, loading, error, isSupabaseActive, create, delete: deleteItem, refresh } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'transaction') {
      return;
    }
    
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('[TransactionPage] Waiting for transactions to load...');
      return;
    }
    
    console.log('[TransactionPage] Auto-selecting transaction:', selectedItemId);
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    const transaction = transactions.find((t: any) => t.id === selectedItemId);
    if (transaction) {
      setSelectedTransaction(transaction);
    } else {
      const transactionAlt = transactions.find((t: any) => t.id === selectedItemId || t.id?.toString() === selectedItemId?.toString());
      if (transactionAlt) {
        setSelectedTransaction(transactionAlt);
      }
    }
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

    return { buyTotal, buyCommission, buyGrossTotal, sellTotal, transferProfit, transferTax, securitiesTax, sellCommission, totalDeduction, netAmount, actualReceipt };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction = {
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
      buyTotal: calc.buyTotal,
      buyCommission: calc.buyCommission,
      buyGrossTotal: calc.buyGrossTotal,
      sellTotal: calc.sellTotal,
      transferProfit: calc.transferProfit,
      transferTax: calc.transferTax,
      securitiesTax: calc.securitiesTax,
      sellCommission: calc.sellCommission,
      totalDeduction: calc.totalDeduction,
      netAmount: calc.netAmount,
      actualReceipt: calc.actualReceipt,
    };
    
    await create(newTransaction);
    setFormData({ date: new Date().toISOString().split('T')[0], stockName: '', buyer: '', buyQuantity: '', buyUnitPrice: '', buyCommissionRate: '0.5', seller: '', sellUnitPrice: '', sellCommissionRate: '0.5', customerName: '', customerContact: '', manager: '' });
    setShowForm(false);
  };

  // Edit functionality
  const handleEdit = (transaction: any) => {
    setFormData({
      date: transaction.date || '',
      stockName: transaction.stockName || '',
      buyer: transaction.buyer || '',
      buyQuantity: transaction.buyQuantity?.toString() || '',
      buyUnitPrice: transaction.buyUnitPrice?.toString() || '',
      buyCommissionRate: transaction.buyCommissionRate?.toString() || '0.5',
      seller: transaction.seller || '',
      sellUnitPrice: transaction.sellUnitPrice?.toString() || '',
      sellCommissionRate: transaction.sellCommissionRate?.toString() || '0.5',
      customerName: transaction.customerName || '',
      customerContact: transaction.customerContact || '',
      manager: transaction.manager || '',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    const updatedTransaction = {
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
      buyTotal: calc.buyTotal,
      buyCommission: calc.buyCommission,
      buyGrossTotal: calc.buyGrossTotal,
      sellTotal: calc.sellTotal,
      transferProfit: calc.transferProfit,
      transferTax: calc.transferTax,
      securitiesTax: calc.securitiesTax,
      sellCommission: calc.sellCommission,
      totalDeduction: calc.totalDeduction,
      netAmount: calc.netAmount,
      actualReceipt: calc.actualReceipt,
    };

    // Use the update function from the hook
    const { update } = useTransactions();
    await update(selectedTransaction.id, updatedTransaction);
    
    setIsEditing(false);
    setSelectedTransaction(null);
    setFormData({ date: new Date().toISOString().split('T')[0], stockName: '', buyer: '', buyQuantity: '', buyUnitPrice: '', buyCommissionRate: '0.5', seller: '', sellUnitPrice: '', sellCommissionRate: '0.5', customerName: '', customerContact: '', manager: '' });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 하이라이트 스타일
  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return { background: '#FFF9C4', transition: 'background 0.3s ease' };
    }
    return {};
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
      setIsEditing(false);
    }
  };

  const totals = useMemo(() => {
    return transactions.reduce((acc: any, t: any) => ({
      buyTotal: acc.buyTotal + (t.buyTotal || 0),
      sellTotal: acc.sellTotal + (t.sellTotal || 0),
      netAmount: acc.netAmount + (t.netAmount || 0),
    }), { buyTotal: 0, sellTotal: 0, netAmount: 0 });
  }, [transactions]);

  // Close detail handler
  const handleCloseDetail = () => {
    setSelectedTransaction(null);
    setIsEditing(false);
    hasAutoSelectedRef.current = false;
    lastSelectedIdRef.current = null;
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <p>거래내역을 불러오는 중...</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Supabase에서 데이터를 가져오는 중입니다</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <p>데이터 로드 중 오류가 발생했습니다</p>
          <p style={{ fontSize: '12px' }}>{error}</p>
        </div>
        <button className="btn btn-primary" onClick={() => refresh()}>다시 시도</button>
      </div>
    );
  }

  // Edit form modal
  const renderEditForm = () => {
    if (!isEditing || !selectedTransaction) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>거래 수정</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setFormData({ date: new Date().toISOString().split('T')[0], stockName: '', buyer: '', buyQuantity: '', buyUnitPrice: '', buyCommissionRate: '0.5', seller: '', sellUnitPrice: '', sellCommissionRate: '0.5', customerName: '', customerContact: '', manager: '' }); }}>✕ 취소</button>
          </div>

          <form onSubmit={handleUpdate}>
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
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매수측</h4>
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
              </div>

              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매도측</h4>
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

            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); }}>취소</button>
              <button type="submit" className="btn btn-primary">수정 저장</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 상세 모달
  const renderDetail = () => {
    if (!selectedTransaction || isEditing) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>{selectedTransaction.stockName}</h2>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>{selectedTransaction.date}</span>
              {isSupabaseActive && (
                <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Cloud</span>
              )}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="Summary-card">
              <div className="Summary-card-label">매수총액</div>
              <div className="Summary-card-value">{formatCurrency(selectedTransaction.buyTotal)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">매도총액</div>
              <div className="Summary-card-value" style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedTransaction.sellTotal)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">실수령액</div>
              <div className="Summary-card-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(selectedTransaction.actualReceipt)}</div>
            </div>
            <div className="Summary-card">
              <div className="Summary-card-label">고객</div>
              <div className="Summary-card-value">{selectedTransaction.customerName || '-'}</div>
            </div>
          </div>

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
            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedTransaction)}>✏ 수정</button>
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
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {isSupabaseActive && (
              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Supabase 연결됨</span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{transactions.length}건</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 새 거래'}
            </button>
          </div>
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
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매수측</h4>
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
                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>매도측</h4>
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
                    onMouseOver={(e) => { if (!highlightedItemId || t.id !== highlightedItemId) { e.currentTarget.style.background = 'var(--color-bg-input)'; } }}
                    onMouseOut={(e) => { if (!highlightedItemId || t.id !== highlightedItemId) { e.currentTarget.style.background = 'transparent'; } }}
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

      {renderDetail()}
      {renderEditForm()}
    </div>
  );
}