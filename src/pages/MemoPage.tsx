import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { CATEGORIES, generateId } from '../types';

export default function MemoPage() {
  const { memos, setMemos, priceChecks, clientRequests, selectedDate } = useAppState();
  const [memoContent, setMemoContent] = useState('');
  const [autoClassified, setAutoClassified] = useState<{ category: string; items: string[] } | null>(null);

  const filteredMemos = useMemo(() => {
    return memos.filter(m => m.date === selectedDate);
  }, [memos, selectedDate]);

  const extractNumbers = (text: string): number[] => {
    const matches = text.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  };

  const analyzeContent = (content: string) => {
    const lowerContent = content.toLowerCase();
    const detected: { category: string; items: string[] } = { category: 'memo', items: [] };

    if (lowerContent.includes('시세') || lowerContent.includes('매도') || lowerContent.includes('매수') || lowerContent.includes('주식')) {
      detected.category = 'price-check';
      const numbers = extractNumbers(content);
      if (numbers.length > 0) detected.items.push(`숫자: ${numbers.slice(0, 5).join(', ')}`);
    }
    if (lowerContent.includes('고객') || lowerContent.includes('의뢰') || lowerContent.includes('연락')) {
      detected.category = 'client-requests';
    }
    if (lowerContent.includes('기업') || lowerContent.includes('회사') || lowerContent.includes('업종')) {
      detected.category = 'company-info';
    }
    if (lowerContent.includes('세금') || lowerContent.includes('수고비') || lowerContent.includes('수수료')) {
      detected.category = 'fee-calculator';
    }
    setAutoClassified(detected);
  };

  const handleSaveAndClassify = () => {
    if (!memoContent.trim()) return;
    const category = autoClassified?.category || 'memo';
    const newMemo = {
      id: generateId(),
      content: memoContent,
      category: category as any,
      tags: [category],
      date: selectedDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMemos((prev: any) => [...prev, newMemo]);
    setMemoContent('');
    setAutoClassified(null);
  };

  const handleDeleteMemo = (id: string) => {
    setMemos((prev: any) => prev.filter((m: any) => m.id !== id));
  };

  return (
    <div>
      <div className="start-page-guide">
        <h3>브라우저 시작 페이지 설정</h3>
        <p>이 페이지를 브라우저 시작 페이지로 설정하면 PC를 켤 때마다 자동으로 열립니다.</p>
        <ol>
          <li>Chrome: 설정 → 시작 시 → 특정 페이지 열기 → 이 페이지 URL 입력</li>
          <li>Edge: 설정 → 시작 페이지 → 하나 이상의 페이지 → 추가 → 이 페이지 URL 입력</li>
        </ol>
      </div>

      <div className="summary-cards">
        <div className="summary-card price-check">
          <div className="summary-card-label">오늘의 시세체크</div>
          <div className="summary-card-value">
            {priceChecks.filter((p: any) => p.date === selectedDate).length}
          </div>
        </div>
        <div className="summary-card client-requests">
          <div className="summary-card-label">진행중 의뢰</div>
          <div className="summary-card-value">
            {clientRequests.filter((c: any) => c.status === 'in-progress').length}
          </div>
        </div>
      </div>

      <div className="card memo-input-container">
        <div className="card-header">
          <h3 className="card-title">오늘의 메모</h3>
        </div>
        <textarea
          className="form-textarea memo-textarea"
          placeholder="대화 내용을 여기에 붙여넣으세요. 자동 분류됩니다."
          value={memoContent}
          onChange={(e) => {
            setMemoContent(e.target.value);
            if (e.target.value.length > 10) analyzeContent(e.target.value);
          }}
        />

        {autoClassified && (
          <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)' }}>
            <strong>자동 분류:</strong>
            <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--color-primary-light)' }}>
              {CATEGORIES.find(c => c.id === autoClassified.category)?.name || '메모'}
            </span>
            {autoClassified.items.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-muted)' }}>
                {autoClassified.items.map((item, i) => <div key={i}>{item}</div>)}
              </div>
            )}
          </div>
        )}

        <div className="memo-actions">
          <button className="btn btn-primary" onClick={handleSaveAndClassify}>저장 및 분류</button>
          <label className="btn btn-secondary">
            파일 첨부
            <input type="file" multiple style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">오늘의 메모 목록 ({filteredMemos.length})</h3>
        </div>
        {filteredMemos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">M</div>
            <p className="empty-state-text">오늘 작성된 메모가 없습니다.</p>
          </div>
        ) : (
          <div>
            {filteredMemos.map((memo: any) => {
              const category = CATEGORIES.find(c => c.id === memo.category);
              return (
                <div key={memo.id} style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ padding: '2px 8px', background: category?.color || '#6b7280', borderRadius: '9999px', fontSize: 'var(--font-xs)', color: 'white' }}>
                        {category?.icon} {category?.name}
                      </span>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{memo.content}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteMemo(memo.id)} style={{ alignSelf: 'flex-start' }}>삭제</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}