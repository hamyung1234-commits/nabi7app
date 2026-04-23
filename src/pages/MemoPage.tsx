import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { useMemos } from '../hooks/useSupabase';
import { CATEGORIES, generateId } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface MemoPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function MemoPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: MemoPageProps = {}) {
  const { selectedDate } = useAppState();
  const { data: memos, create: createMemo, delete: deleteMemo, loading, isSupabaseActive } = useMemos();
  const { counts } = useCounts();
  const [memoContent, setMemoContent] = useState('');
  const [autoClassified, setAutoClassified] = useState<{ category: string; items: string[] } | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<any | null>(null);

  // 검색에서 자동 선택 처리
  const hasAutoSelectedRef = useRef(false);

  // Handle selected item from search
  useEffect(() => {
    if (selectedItemId && selectedItemType === 'memo' && !hasAutoSelectedRef.current) {
      console.log('[MemoPage] Auto-selecting memo:', selectedItemId);
      hasAutoSelectedRef.current = true;
      
      const memo = memos.find((m: any) => m.id === selectedItemId);
      if (memo) {
        setSelectedMemo(memo);
      }
      
      if (onClearSelection) {
        setTimeout(() => {
          onClearSelection();
          hasAutoSelectedRef.current = false;
        }, 100);
      }
    }
  }, [selectedItemId, selectedItemType, memos, onClearSelection]);

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

  const handleSaveAndClassify = async () => {
    if (!memoContent.trim()) return;
    const category = autoClassified?.category || 'memo';
    const newMemoData = {
      title: `메모 ${new Date().toLocaleTimeString('ko-KR')}`,
      content: memoContent,
      category: category as any,
      tags: [category],
      date: selectedDate,
    };
    
    try {
      await createMemo(newMemoData);
      setMemoContent('');
      setAutoClassified(null);
    } catch (error) {
      console.error('메모 저장 실패:', error);
    }
  };

  const handleDeleteMemo = async (id: string) => {
    try {
      await deleteMemo(id);
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
    }
  };

  // 상세 모달
  const renderDetail = () => {
    if (!selectedMemo) return null;
    const category = CATEGORIES.find(c => c.id === selectedMemo.category);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span style={{ 
                padding: '4px 12px', 
                background: category?.color || '#6b7280', 
                borderRadius: '9999px', 
                fontSize: 'var(--font-xs)', 
                color: 'white' 
              }}>
                {category?.icon} {category?.name}
              </span>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                {selectedMemo.date}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMemo(null)}>✕ 닫기</button>
          </div>

          {/* 내용 */}
          <div style={{ 
            padding: 'var(--spacing-lg)', 
            background: 'var(--color-bg-input)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 'var(--font-md)' }}>
              {selectedMemo.content}
            </p>
          </div>

          {/* 메타 정보 */}
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
            <div>작성일: {new Date(selectedMemo.createdAt).toLocaleString('ko-KR')}</div>
            {selectedMemo.updatedAt && selectedMemo.updatedAt !== selectedMemo.createdAt && (
              <div>수정일: {new Date(selectedMemo.updatedAt).toLocaleString('ko-KR')}</div>
            )}
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMemo(selectedMemo.id)}>삭제</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMemo(null)}>닫기</button>
          </div>
        </div>
      </div>
    );
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
        <div className="Summary-card price-check">
          <div className="Summary-card-label">오늘의 시세체크</div>
          <div className="Summary-card-value">
            {counts.pricecheck}
          </div>
        </div>
        <div className="Summary-card client-requests">
          <div className="Summary-card-label">진행중 의뢰</div>
          <div className="Summary-card-value">
            {counts['in-progress-requests']}
          </div>
        </div>
      </div>
      
      {/* Supabase Status Indicator */}
      <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: isSupabaseActive ? '#d4edda' : '#f8d7da', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
        🔗 데이터 연결: {isSupabaseActive ? '✅ Supabase 연결됨' : '📱 로컬 저장소 사용'} 
        {loading && ' (로딩 중...)'}
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
                <div 
                  key={memo.id} 
                  onClick={() => setSelectedMemo(memo)}
                  style={{ 
                    padding: 'var(--spacing-md)', 
                    borderBottom: '1px solid var(--color-border)', 
                    display: 'flex', 
                    gap: 'var(--spacing-md)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    ...getRowStyle(memo)
                  }}
                  onMouseOver={(e) => {
                    if (!highlightedItemId || memo.id !== highlightedItemId) {
                      e.currentTarget.style.background = 'var(--color-bg-input)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!highlightedItemId || memo.id !== highlightedItemId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ padding: '2px 8px', background: category?.color || '#6b7280', borderRadius: '9999px', fontSize: 'var(--font-xs)', color: 'white' }}>
                        {category?.icon} {category?.name}
                      </span>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{memo.content}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDeleteMemo(memo.id); }} style={{ alignSelf: 'flex-start' }}>삭제</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {renderDetail()}
    </div>
  );
}
