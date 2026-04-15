import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, CATEGORIES } from '../types';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface DiaryPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function DiaryPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: DiaryPageProps = {}) {
  const { diaryEntries, setDiaryEntries, searchQuery } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
  const [showForm, setShowForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: [] as string[],
  });

  // 검색에서 자동 선택 처리
  const hasAutoSelectedRef = useRef(false);

  // Handle selected item from search
  useEffect(() => {
    if (selectedItemId && selectedItemType === 'diary' && !hasAutoSelectedRef.current) {
      console.log('[DiaryPage] Auto-selecting diary entry:', selectedItemId);
      hasAutoSelectedRef.current = true;
      
      const entry = diaryEntries.find((d: any) => d.id === selectedItemId);
      if (entry) {
        setSelectedEntry(entry);
      }
      
      if (onClearSelection) {
        setTimeout(() => {
          onClearSelection();
          hasAutoSelectedRef.current = false;
        }, 100);
      }
    }
  }, [selectedItemId, selectedItemType, diaryEntries, onClearSelection]);

  const filteredEntries = useMemo(() => {
    let filtered = [...diaryEntries];
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry: any) =>
        entry.tags.some((tag: string) => selectedTags.includes(tag))
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry: any) =>
        entry.content.toLowerCase().includes(query) ||
        entry.date.includes(query)
      );
    }
    
    return filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [diaryEntries, selectedTags, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: generateId(),
      date: formData.date,
      content: formData.content,
      tags: formData.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDiaryEntries((prev: any) => [...prev, newEntry]);
    incrementCount('diary');
    setFormData({ date: new Date().toISOString().split('T')[0], content: '', tags: [] });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setDiaryEntries((prev: any) => prev.filter((d: any) => d.id !== id));
    decrementCount('diary');
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const categoryTags = CATEGORIES.map(c => c.id);

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

  // 상세 모달
  const renderDetail = () => {
    if (!selectedEntry) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: '24px' }}>📝</span>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>
                  {format(parseISO(selectedEntry.date), 'yyyy년 M월 d일 (E)', { locale: ko })}
                </h2>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEntry(null)}>✕ 닫기</button>
          </div>

          {/* 태그 */}
          {selectedEntry.tags && selectedEntry.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-lg)' }}>
              {selectedEntry.tags.map((tag: string) => {
                const category = CATEGORIES.find(c => c.id === tag);
                return (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 12px',
                      background: category?.color || '#6b7280',
                      borderRadius: '9999px',
                      fontSize: 'var(--font-xs)',
                      color: 'white',
                    }}
                  >
                    {category?.icon} {category?.name}
                  </span>
                );
              })}
            </div>
          )}

          {/* 내용 */}
          <div style={{ 
            padding: 'var(--spacing-lg)', 
            background: 'var(--color-bg-input)', 
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 'var(--font-md)' }}>
              {selectedEntry.content}
            </p>
          </div>

          {/* 메타 정보 */}
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
            <div>작성일: {format(new Date(selectedEntry.createdAt), 'yyyy년 M월 d일 HH:mm')}</div>
            {selectedEntry.updatedAt && selectedEntry.updatedAt !== selectedEntry.createdAt && (
              <div>수정일: {format(new Date(selectedEntry.updatedAt), 'yyyy년 M월 d일 HH:mm')}</div>
            )}
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedEntry.id)}>삭제</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEntry(null)}>닫기</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">전체 메모 다이어리</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '+ 새 메모'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-group">
              <label className="form-label">날짜</label>
              <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: 'auto' }} />
            </div>
            <div className="form-group">
              <label className="form-label">내용</label>
              <textarea className="form-textarea" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="메모를 작성하세요..." />
            </div>
            <div className="form-group">
              <label className="form-label">태그</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {categoryTags.map(tag => {
                  const category = CATEGORIES.find(c => c.id === tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                      }))}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'var(--font-xs)',
                        background: formData.tags.includes(tag) ? category?.color : 'var(--color-bg-card-hover)',
                        color: 'white',
                      }}
                    >
                      {category?.icon} {category?.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">저장</button>
          </form>
        )}

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="form-label">태그로 필터</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => toggleTag(category.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--font-xs)',
                  background: selectedTags.includes(category.id) ? category.color : 'var(--color-bg-card-hover)',
                  color: 'white',
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">D</div>
            <p className="empty-state-text">다이어리 항목이 없습니다.</p>
          </div>
        ) : (
          <div>
            {filteredEntries.map((entry: any) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  padding: 'var(--spacing-lg)',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  ...getRowStyle(entry)
                }}
                onMouseOver={(e) => {
                  if (!highlightedItemId || entry.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'var(--color-bg-input)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!highlightedItemId || entry.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                    {format(parseISO(entry.date), 'yyyy년 M월 d일 (E)', { locale: ko })}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {entry.tags.map((tag: string) => {
                      const category = CATEGORIES.find(c => c.id === tag);
                      return (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 8px',
                            background: category?.color || '#6b7280',
                            borderRadius: '9999px',
                            fontSize: 'var(--font-xs)',
                            color: 'white',
                          }}
                        >
                          {category?.icon}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{entry.content}</p>
                <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}>삭제</button>
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
