import { useState, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, maskAccountNumber } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface AccountInfoPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function AccountInfoPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: AccountInfoPageProps = {}) {
  const { accounts, setAccounts } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
  const [showForm, setShowForm] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    purpose: '',
    memo: '',
  });

  // Track if we need to auto-select an item from search
  const hasAutoSelectedRef = useRef(false);
  const lastSelectedIdRef = useRef<string | null>(null);

  // Handle selected item from search - ONLY open the detail modal, don't clear selection here
  useEffect(() => {
    // Only process if we have a valid selection request for this page type
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'account') {
      return;
    }
    
    // Avoid re-processing the same item
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    // If we don't have any items loaded yet, wait
    if (!accounts || accounts.length === 0) {
      console.log('[AccountInfoPage] Waiting for accounts to load...');
      return;
    }
    
    console.log('[AccountInfoPage] Auto-selecting account:', selectedItemId);
    console.log('[AccountInfoPage] Available accounts:', accounts.map((a: any) => a.id));
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    // Find the item and open detail
    const account = accounts.find((a: any) => 
      a.id === selectedItemId || 
      a.id?.toString() === selectedItemId?.toString()
    );
    
    if (account) {
      console.log('[AccountInfoPage] Found account:', account.bankName);
      setSelectedAccount(account);
    } else {
      console.warn('[AccountInfoPage] Account not found with ID:', selectedItemId);
      // Try alternative matching
      const accountAlt = accounts.find((a: any) => 
        selectedItemId?.includes(a.id) || a.id?.includes(selectedItemId)
      );
      if (accountAlt) {
        console.log('[AccountInfoPage] Found account via alternative match:', accountAlt.bankName);
        setSelectedAccount(accountAlt);
      }
    }
    
    // NOTE: We do NOT call onClearSelection here - only when user closes the modal
  }, [selectedItemId, selectedItemType, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount = {
      id: generateId(),
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountHolder: formData.accountHolder,
      purpose: formData.purpose,
      memo: formData.memo,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev: any) => [...prev, newAccount]);
    incrementCount('account');
    setFormData({ bankName: '', accountNumber: '', accountHolder: '', purpose: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAccounts((prev: any) => prev.filter((a: any) => a.id !== id));
    decrementCount('account');
    if (selectedAccount?.id === id) {
      setSelectedAccount(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleShowAccount = (id: string) => {
    setShowAccountNumbers(prev => ({ ...prev, [id]: !prev[id] }));
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

  // Close detail handler - ONLY NOW clear the selection
  const handleCloseDetail = () => {
    setSelectedAccount(null);
    // Reset auto-selection tracking
    hasAutoSelectedRef.current = false;
    lastSelectedIdRef.current = null;
    // Clear the selected item from App state
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // Detail modal
  const renderDetail = () => {
    if (!selectedAccount) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: '28px' }}>💳</span>
              <h2 style={{ fontSize: 'var(--font-xl)' }}>{selectedAccount.bankName}</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ 
              fontSize: 'var(--font-2xl)', 
              fontFamily: 'monospace', 
              letterSpacing: '0.05em', 
              marginBottom: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'var(--color-bg-input)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{showAccountNumbers[selectedAccount.id] ? selectedAccount.accountNumber : maskAccountNumber(selectedAccount.accountNumber)}</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => toggleShowAccount(selectedAccount.id)}
              >
                {showAccountNumbers[selectedAccount.id] ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">예금주</div>
              <div className="Summary-card-value">{selectedAccount.accountHolder || '-'}</div>
            </div>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">용도</div>
              <div className="Summary-card-value">{selectedAccount.purpose || '-'}</div>
            </div>
          </div>

          {selectedAccount.memo && (
            <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-primary)' }}>메모</h4>
              <p style={{ fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap' }}>{selectedAccount.memo}</p>
            </div>
          )}

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(selectedAccount.accountNumber)}>
              계좌번호 복사
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedAccount.id)}>삭제</button>
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
          <h3 className="card-title">계좌정보</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 계좌 추가'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">은행/증권사명</label>
                <input type="text" className="form-input" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">계좌번호</label>
                <input type="text" className="form-input" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">예금주</label>
                <input type="text" className="form-input" value={formData.accountHolder} onChange={e => setFormData({ ...formData, accountHolder: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">용도</label>
              <input type="text" className="form-input" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} placeholder="예: 메인 계좌, 준비금" />
            </div>
            <div className="form-group">
              <label className="form-label">메모</label>
              <textarea className="form-textarea" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary">저장</button>
          </form>
        )}

        {accounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">A</div>
            <p className="empty-state-text">등록된 계좌가 없습니다.</p>
          </div>
        ) : (
          <div>
            {accounts.map((account: any) => (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                style={{
                  padding: 'var(--spacing-lg)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  ...getRowStyle(account)
                }}
                onMouseOver={(e) => {
                  if (!highlightedItemId || account.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'var(--color-bg-input)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!highlightedItemId || account.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: 'var(--font-lg)' }}>💳</span>
                    <strong style={{ fontSize: 'var(--font-lg)' }}>{account.bankName}</strong>
                  </div>
                  <div 
                    style={{ fontSize: 'var(--font-xl)', fontFamily: 'monospace', letterSpacing: '0.05em', marginBottom: 'var(--spacing-xs)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); toggleShowAccount(account.id); }}
                    title="클릭하여 전체 계좌번호 보기"
                  >
                    {showAccountNumbers[account.id] ? account.accountNumber : maskAccountNumber(account.accountNumber)}
                  </div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                    {account.accountHolder && <span>예금주: {account.accountHolder}</span>}
                    {account.purpose && <span style={{ marginLeft: 'var(--spacing-md)' }}>용도: {account.purpose}</span>}
                  </div>
                  {account.memo && (
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>
                      {account.memo}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(account.accountNumber); }}>
                    복사
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {renderDetail()}
    </div>
  );
}
