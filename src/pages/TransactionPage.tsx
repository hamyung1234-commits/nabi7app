import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';

export default function TransactionPage() {
  const { transactions, setTransactions } = useAppState();
  const [showForm, setShowForm] = useState(false);
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
    setFormData({ date: new Date().toISOString().split('T')[0], stockName: '', buyer: '', buyQuantity: '', buyUnitPrice: '', buyCommissionRate: '0.5', seller: '', sellUnitPrice: '', sellCommissionRate: '0.5', customerName: '', customerContact: '', manager: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setTransactions((prev: any) => prev.filter((t: any) => t.id !== id));
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
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td><strong>{t.stockName}</strong></td>
                    <td className="calculated-value">{formatCurrency(t.buyTotal)}</td>
                    <td className="calculated-value">{formatCurrency(t.sellTotal)}</td>
                    <td>{formatCurrency(t.transferTax)}</td>
                    <td style={{ color: t.netAmount >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {formatCurrency(t.netAmount)}
                    </td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => handleDelete(t.id)}>삭제</button></td>
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
    </div>
  );
}