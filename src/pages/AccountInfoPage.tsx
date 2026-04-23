import { useState, useEffect, useRef } from 'react';
import { useAccounts } from '../hooks/useSupabase';
import { generateId, maskAccountNumber } from '../types';

// Props for search navigation
interface AccountInfoPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function AccountInfoPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: AccountInfoPageProps = {}) {
  const { data: accounts, loading, error, isSupabaseActive, create, update: updateAccount, delete: deleteItem, refresh } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'account') {
      return;
    }
    
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    if (!accounts || accounts.length === 0) {
      console.log('[AccountInfoPage] Waiting for accounts to load...');
      return;
    }
    
    console.log('[AccountInfoPage] Auto-selecting account:', selectedItemId);
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    const account = accounts.find((a: any) => a.id === selectedItemId || a.id?.toString() === selectedItemId?.toString());
    if (account) {
      setSelectedAccount(account);
    } else {
      const accountAlt = accounts.find((a: any) => a.id === selectedItemId || selectedItemId.includes(a.id));
      if (accountAlt) {
        setSelectedAccount(accountAlt);
      }
    }
  }, [selectedItemId, selectedItemType, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount = {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountHolder: formData.accountHolder,
      purpose: formData.purpose,
      memo: formData.memo,
    };
    await create(newAccount as any);
    setFormData({ bankName: '', accountNumber: '', accountHolder: '', purpose: '', memo: '' });
    setShowForm(false);
  };

  // Edit functionality
  const handleEdit = (account: any) => {
    setFormData({
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      accountHolder: account.accountHolder || '',
      purpose: account.purpose || '',
      memo: account.memo || '',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const updatedAccount = {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountHolder: formData.accountHolder,
      purpose: formData.purpose,
      memo: formData.memo,
    };

    await updateAccount(selectedAccount.id, updatedAccount as any);
    setIsEditing(false);
    setSelectedAccount(null);
    setFormData({ bankName: '', accountNumber: '', accountHolder: '', purpose: '', memo: '' });
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    if (selectedAccount?.id === id) {
      setSelectedAccount(null);
      setIsEditing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleShowAccount = (id: string) => {
    setShowAccountNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return { background: '#FFF9C4', transition: 'background 0.3s ease' };
    }
    return {};
  };

  const handleCloseDetail = () => {
    setSelectedAccount(null);
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
          <p>계좌 정보를 불러오는 중...</p>
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
    if (!isEditing || !selectedAccount) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>계좌 수정</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setFormData({ bankName: '', accountNumber: '', accountHolder: '', purpose: '', memo: '' }); }}>✕ 취소</button>
          </div>

          <form onSubmit={handleUpdate}>
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

            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>취소</button>
              <button type="submit" className="btn btn-primary">수정 저장</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Detail modal
  const renderDetail = () => {
    if (!selectedAccount || isEditing) return null;

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
              <button className="btn btn-secondary btn-sm" onClick={() => toggleShowAccount(selectedAccount.id)}>
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
            <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(selectedAccount.accountNumber)}>계좌번호 복사</button>
            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedAccount)}>✏ 수정</button>
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
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {isSupabaseActive && (
              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Supabase 연결됨</span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{accounts.length}건</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 계좌 추가'}
            </button>
          </div>
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
                onMouseOver={(e) => { if (!highlightedItemId || account.id !== highlightedItemId) { e.currentTarget.style.background = 'var(--color-bg-input)'; } }}
                onMouseOut={(e) => { if (!highlightedItemId || account.id !== highlightedItemId) { e.currentTarget.style.background = 'transparent'; } }}
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
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(account.accountNumber); }}>복사</button>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renderDetail()}
      {renderEditForm()}
    </div>
  );
}