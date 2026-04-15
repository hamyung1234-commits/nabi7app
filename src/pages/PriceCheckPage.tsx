import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, formatCurrency } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface PriceCheckPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function PriceCheckPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: PriceCheckPageProps = {}) {
  const { priceChecks, setPriceChecks, selectedDate } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
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
  
  // 상세 선택된 항목
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Track if we need to auto-select an item from search
  const hasAutoSelectedRef = useRef(false);
  // Track the last selected ID to avoid re-processing
  const lastSelectedIdRef = useRef<string | null>(null);

  // Handle selected item from search - ONLY open the detail modal, don't clear selection here
  useEffect(() => {
    // Only process if we have a valid selection request for this page type
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'pricecheck') {
      return;
    }
    
    // Avoid re-processing the same item
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    // If we don't have any items loaded yet, wait
    if (!priceChecks || priceChecks.length === 0) {
      console.log('[PriceCheckPage] Waiting for price checks to load...');
      return;
    }
    
    console.log('[PriceCheckPage] Auto-selecting price check:', selectedItemId);
    console.log('[PriceCheckPage] Available items:', priceChecks.map((p: any) => p.id));
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    // Find the item and open detail - try both camelCase and snake_case
    const item = priceChecks.find((p: any) => 
      p.id === selectedItemId || 
      p.id?.toString() === selectedItemId?.toString()
    );
    
    if (item) {
      console.log('[PriceCheckPage] Found item:', item.stockName);
      setSelectedItem(item);
    } else {
      console.warn('[PriceCheckPage] Item not found with ID:', selectedItemId);
      // Try to find by stock name from rawData if available
      const itemAlt = priceChecks.find((p: any) => 
        selectedItemId?.includes(p.id) || p.id?.includes(selectedItemId)
      );
      if (itemAlt) {
        console.log('[PriceCheckPage] Found item via alternative match:', itemAlt.stockName);
        setSelectedItem(itemAlt);
      }
    }
    
    // NOTE: We do NOT call onClearSelection here - only when user closes the modal
  }, [selectedItemId, selectedItemType, priceChecks]);

  const filteredItems = useMemo(() => {
    return priceChecks
      .filter((p: any) => p.date === selectedDate)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [priceChecks, selectedDate]);

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
    incrementCount('pricecheck');
    setFormData({ stockName: '', date: selectedDate, sellPrice: '', buyPrice: '', quantity: '', holderCompany: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setPriceChecks((prev: any) => prev.filter((p: any) => p.id !== id));
    decrementCount('pricecheck');
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
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
              <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>{selectedItem.stockName}</h2>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>{selectedItem.date}</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card">
              <div className="summary-card-label">매도희망가</div>
              <div className="summary-card-value" style={{ color: 'var(--color-error)' }}>{formatCurrency(selectedItem.sellPrice)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">매수희망가</div>
              <div className="summary-card-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(selectedItem.buyPrice)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">수량</div>
              <div className="summary-card-value">{selectedItem.quantity?.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-label">보유회사</div>
              <div className="summary-card-value">{selectedItem.holderCompany || '-'}</div>
            </div>
          </div>

          {selectedItem.memo && (
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>메모</h4>
              <p style={{ fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap' }}>{selectedItem.memo}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem.id)}>삭제</button>
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
                    <td><strong>{item.stockName}</strong></td>
                    <td>{item.date}</td>
                    <td className="calculated-value">{formatCurrency(item.sellPrice)}</td>
                    <td>{formatCurrency(item.buyPrice)}</td>
                    <td>{item.quantity.toLocaleString()}</td>
                    <td>{item.holderCompany || '-'}</td>
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