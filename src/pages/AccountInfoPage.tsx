import { useState } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, maskAccountNumber } from '../types';

export default function AccountInfoPage() {
  const { accounts, setAccounts } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    purpose: '',
    memo: '',
  });

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
    setFormData({ bankName: '', accountNumber: '', accountHolder: '', purpose: '', memo: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAccounts((prev: any) => prev.filter((a: any) => a.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleShowAccount = (id: string) => {
    setShowAccountNumbers(prev => ({ ...prev, [id]: !prev[id] }));
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
                style={{
                  padding: 'var(--spacing-lg)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: 'var(--font-lg)' }}>💳</span>
                    <strong style={{ fontSize: 'var(--font-lg)' }}>{account.bankName}</strong>
                  </div>
                  <div 
                    style={{ fontSize: 'var(--font-xl)', fontFamily: 'monospace', letterSpacing: '0.05em', marginBottom: 'var(--spacing-xs)', cursor: 'pointer' }}
                    onClick={() => toggleShowAccount(account.id)}
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
                  <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(account.accountNumber)}>
                    복사
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(account.id)}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}