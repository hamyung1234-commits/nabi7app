import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';

export default function PriceCheckPage() {
  const { priceChecks, setPriceChecks, selectedDate } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stockName: '',
    date: selectedDate,
    sellPrice: '',
    buyPrice: '',
    quantity: '',
    holderCompany: '',
    memo: '',
  });

  const filteredItems = useMemo(() => {
    return priceChecks
      .filter((p: any) => p.date === selectedDate)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [priceChecks, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: generateId(),
      stockName: formData.stockName,
      date: formData.date,
      sellPrice: Number(formData.sellPrice),
      buyPrice: Number(formData.buyPrice),
      quantity: Number(formData.quantity),
      holderCompany: formData.holderCompany,
      memo: formData.memo,
      createdAt: new Date().toISOString(),
    };
    setPriceChecks((prev: any) => [...prev, newItem]);
    setFormData({ stockName: '', date: selectedDate, sellPrice: '', buyPrice: '', quantity: '', holderCompany: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setPriceChecks((prev: any) => prev.filter((p: any) => p.id !== id));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">시세체크 기록</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 새 기록'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">종목명</label>
                <input type="text" className="form-input" value={formData.stockName} onChange={e => setFormData({ ...formData, stockName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">날짜</label>
                <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">매도희망가</label>
                <input type="number" className="form-input" value={formData.sellPrice} onChange={e => setFormData({ ...formData, sellPrice: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">매수희망가</label>
                <input type="number" className="form-input" value={formData.buyPrice} onChange={e => setFormData({ ...formData, buyPrice: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">수량</label>
                <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">보유회사</label>
              <input type="text" className="form-input" value={formData.holderCompany} onChange={e => setFormData({ ...formData, holderCompany: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea className="form-textarea" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">저장</button>
          </form>
        )}

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">P</div>
            <p className="empty-state-text">이 날짜에 시세체크 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>종목</th>
                  <th>날짜</th>
                  <th>매도</th>
                  <th>매수</th>
                  <th>수량</th>
                  <th>보유사</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id}>
                    <td><strong>{item.stockName}</strong></td>
                    <td>{item.date}</td>
                    <td className="calculated-value">{formatCurrency(item.sellPrice)}</td>
                    <td>{formatCurrency(item.buyPrice)}</td>
                    <td>{item.quantity.toLocaleString()}</td>
                    <td>{item.holderCompany || '-'}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => handleDelete(item.id)}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}