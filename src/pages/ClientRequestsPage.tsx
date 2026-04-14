import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';

export default function ClientRequestsPage() {
  const { clientRequests, setClientRequests } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    clientName: '',
    contact: '',
    targetStock: '',
    requestType: 'buy' as 'buy' | 'sell',
    quantity: '',
    desiredPrice: '',
    requestDate: new Date().toISOString().split('T')[0],
    status: 'in-progress' as 'in-progress' | 'completed' | 'pending' | 'on-hold',
    memo: '',
  });

  const filteredItems = useMemo(() => {
    return clientRequests
      .filter((c: any) => filterStatus === 'all' || c.status === filterStatus)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clientRequests, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: generateId(),
      clientName: formData.clientName,
      contact: formData.contact,
      targetStock: formData.targetStock,
      requestType: formData.requestType,
      quantity: Number(formData.quantity),
      desiredPrice: Number(formData.desiredPrice),
      requestDate: formData.requestDate,
      status: formData.status,
      memo: formData.memo,
      createdAt: new Date().toISOString(),
    };
    setClientRequests((prev: any) => [...prev, newItem]);
    setFormData({ clientName: '', contact: '', targetStock: '', requestType: 'buy', quantity: '', desiredPrice: '', requestDate: new Date().toISOString().split('T')[0], status: 'in-progress', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setClientRequests((prev: any) => prev.filter((c: any) => c.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'in-progress': 'badge-in-progress',
      'completed': 'badge-completed',
      'pending': 'badge-waiting',
      'on-hold': 'badge-on-hold',
    };
    return badges[status] || 'badge-on-hold';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'in-progress': '진행중',
      'completed': '완료',
      'pending': '대기',
      'on-hold': '보류',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    return type === 'buy' ? '매수' : '매도';
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">고객 의뢰 목록</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">전체</option>
              <option value="in-progress">진행중</option>
              <option value="pending">대기</option>
              <option value="completed">완료</option>
              <option value="on-hold">보류</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 새 의뢰'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">고객명</label>
                <input type="text" className="form-input" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">연락처</label>
                <input type="text" className="form-input" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">목표 종목</label>
                <input type="text" className="form-input" value={formData.targetStock} onChange={e => setFormData({ ...formData, targetStock: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">의뢰 유형</label>
                <select className="form-select" value={formData.requestType} onChange={e => setFormData({ ...formData, requestType: e.target.value as any })}>
                  <option value="buy">매수</option>
                  <option value="sell">매도</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">수량</label>
                <input type="number" className="form-input" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">희망 가격</label>
                <input type="number" className="form-input" value={formData.desiredPrice} onChange={e => setFormData({ ...formData, desiredPrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">의뢰 날짜</label>
                <input type="date" className="form-input" value={formData.requestDate} onChange={e => setFormData({ ...formData, requestDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">상태</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="in-progress">진행중</option>
                  <option value="pending">대기</option>
                  <option value="completed">완료</option>
                  <option value="on-hold">보류</option>
                </select>
              </div>
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
            <div className="empty-state-icon">C</div>
            <p className="empty-state-text">의뢰 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>고객</th>
                  <th>종목</th>
                  <th>유형</th>
                  <th>수량</th>
                  <th>희망가</th>
                  <th>날짜</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item: any) => (
                  <tr key={item.id}>
                    <td><strong>{item.clientName}</strong><br /><small>{item.contact}</small></td>
                    <td>{item.targetStock}</td>
                    <td><span style={{ color: item.requestType === 'buy' ? '#10b981' : '#ef4444' }}>{getTypeLabel(item.requestType)}</span></td>
                    <td>{Number(item.quantity).toLocaleString()}</td>
                    <td className="calculated-value">{formatCurrency(item.desiredPrice)}</td>
                    <td>{item.requestDate}</td>
                    <td><span className={`badge ${getStatusBadge(item.status)}`}>{getStatusLabel(item.status)}</span></td>
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