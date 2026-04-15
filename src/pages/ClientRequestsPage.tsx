import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface ClientRequestsPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function ClientRequestsPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: ClientRequestsPageProps = {}) {
  const { clientRequests, setClientRequests } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
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
  
  // 상세 선택된 항목
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Track if we need to auto-select an item from search
  const hasAutoSelectedRef = useRef(false);
  // Track the last selected ID to avoid re-processing
  const lastSelectedIdRef = useRef<string | null>(null);

  // Handle selected item from search - ONLY open the detail modal, don't clear selection here
  useEffect(() => {
    // Only process if we have a valid selection request for this page type
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'request') {
      return;
    }
    
    // Avoid re-processing the same item
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    // If we don't have any items loaded yet, wait
    if (!clientRequests || clientRequests.length === 0) {
      console.log('[ClientRequestsPage] Waiting for client requests to load...');
      return;
    }
    
    console.log('[ClientRequestsPage] Auto-selecting request:', selectedItemId);
    console.log('[ClientRequestsPage] Available items:', clientRequests.map((c: any) => c.id));
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    // Find the item and open detail - try both camelCase and snake_case
    const item = clientRequests.find((c: any) => 
      c.id === selectedItemId || 
      c.id?.toString() === selectedItemId?.toString()
    );
    
    if (item) {
      console.log('[ClientRequestsPage] Found item:', item.targetStock);
      setSelectedItem(item);
    } else {
      console.warn('[ClientRequestsPage] Item not found with ID:', selectedItemId);
      // Try alternative matching
      const itemAlt = clientRequests.find((c: any) => 
        selectedItemId?.includes(c.id) || c.id?.includes(selectedItemId)
      );
      if (itemAlt) {
        console.log('[ClientRequestsPage] Found item via alternative match:', itemAlt.targetStock);
        setSelectedItem(itemAlt);
      }
    }
    
    // NOTE: We do NOT call onClearSelection here - only when user closes the modal
  }, [selectedItemId, selectedItemType, clientRequests]);

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
    incrementCount('request');
    if (formData.status === 'in-progress') {
      incrementCount('in-progress-requests');
    }
    setFormData({ clientName: '', contact: '', targetStock: '', requestType: 'buy', quantity: '', desiredPrice: '', requestDate: new Date().toISOString().split('T')[0], status: 'in-progress', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const item = clientRequests.find((c: any) => c.id === id);
    setClientRequests((prev: any) => prev.filter((c: any) => c.id !== id));
    decrementCount('request');
    if (item?.status === 'in-progress') {
      decrementCount('in-progress-requests');
    }
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
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

  // Close detail handler - ONLY NOW clear the selection
  const handleCloseDetail = () => {
    setSelectedItem(null);
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
    if (!selectedItem) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>{selectedItem.targetStock}</h2>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                {selectedItem.clientName} | {getTypeLabel(selectedItem.requestType)}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card">
              <div className="summary-card-label">고객명</div>
              <div className="summary-card-value">{selectedItem.clientName}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">연락처</div>
              <div className="summary-card-value">{selectedItem.contact || '-'}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">의뢰유형</div>
              <div className="summary-card-value">
                <span style={{ color: selectedItem.requestType === 'buy' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {getTypeLabel(selectedItem.requestType)}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">희망가격</div>
              <div className="summary-card-value">{formatCurrency(selectedItem.desiredPrice)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">수량</div>
              <div className="summary-card-value">{Number(selectedItem.quantity).toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">의뢰일</div>
              <div className="summary-card-value">{selectedItem.requestDate}</div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card">
              <div className="summary-card-label">상태</div>
              <div className="summary-card-value">
                <span className={`badge ${getStatusBadge(selectedItem.status)}`}>{getStatusLabel(selectedItem.status)}</span>
              </div>
            </div>
          </div>

          {selectedItem.memo && (
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>메모</h4>
              <p style={{ fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap' }}>{selectedItem.memo}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {selectedItem.status !== 'completed' && (
                <button 
                  className="btn btn-sm" 
                  style={{ background: '#dcfce7', color: '#166534' }}
                  onClick={() => {
                    setClientRequests((prev: any) => prev.map((c: any) => 
                      c.id === selectedItem.id ? { ...c, status: 'completed' } : c
                    ));
                    setSelectedItem(null);
                  }}
                >
                  완료로 변경
                </button>
              )}
              {selectedItem.status !== 'in-progress' && (
                <button 
                  className="btn btn-sm" 
                  style={{ background: '#fef3c7', color: '#92400e' }}
                  onClick={() => {
                    setClientRequests((prev: any) => prev.map((c: any) => 
                      c.id === selectedItem.id ? { ...c, status: 'in-progress' } : c
                    ));
                    setSelectedItem(null);
                  }}
                >
                  진행중으로 변경
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>삭제</button>
              <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>닫기</button>
            </div>
          </div>
        </div>
      </div>
    );
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
                  <tr 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{ cursor: 'pointer', ...getRowStyle(item) }}
                    onMouseOver={(e) => {
                      if (!highlightedItemId || item.id !== highlightedItemId) {
                        e.currentTarget.style.background = 'var(--color-bg-input)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!highlightedItemId || item.id !== highlightedItemId) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <td><strong>{item.clientName}</strong><br /><small>{item.contact}</small></td>
                    <td>{item.targetStock}</td>
                    <td><span style={{ color: item.requestType === 'buy' ? '#10b981' : '#ef4444' }}>{getTypeLabel(item.requestType)}</span></td>
                    <td>{Number(item.quantity).toLocaleString()}</td>
                    <td className="calculated-value">{formatCurrency(item.desiredPrice)}</td>
                    <td>{item.requestDate}</td>
                    <td><span className={`badge ${getStatusBadge(item.status)}`}>{getStatusLabel(item.status)}</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {renderDetail()}
    </div>
  );
}