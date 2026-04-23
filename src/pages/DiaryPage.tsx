import { useState, useMemo, useEffect, useRef } from 'react';
import { useDiaryEntries } from '../hooks/useSupabase';
import { generateId, CATEGORIES } from '../types';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// Props for search navigation
interface DiaryPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function DiaryPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: DiaryPageProps = {}) {
  const { data: diaryEntries, loading, error, isSupabaseActive, create, update: updateEntry, delete: deleteItem, refresh } = useDiaryEntries();
  const [showForm, setShowForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: [] as string[],
  });

  // 검색에서 자동 선택 처리
  const hasAutoSelectedRef = useRef(false);
  const lastSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'diary') {
      return;
    }
    
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    if (!diaryEntries || diaryEntries.length === 0) {
      console.log('[DiaryPage] Waiting for diary entries to load...');
      return;
    }
    
    console.log('[DiaryPage] Auto-selecting diary entry:', selectedItemId);
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    const entry = diaryEntries.find((d: any) => d.id === selectedItemId || d.id?.toString() === selectedItemId?.toString());
    if (entry) {
      setSelectedEntry(entry);
    } else {
      const entryAlt = diaryEntries.find((d: any) => d.id === selectedItemId || selectedItemId.includes(d.id));
      if (entryAlt) {
        setSelectedEntry(entryAlt);
      }
    }
  }, [selectedItemId, selectedItemType, diaryEntries]);

  const filteredEntries = useMemo(() => {
    let filtered = [...diaryEntries];
    
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry: any) =>
        entry.tags?.some((tag: string) => selectedTags.includes(tag))
      );
    }
    
    return filtered.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
  }, [diaryEntries, selectedTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      date: formData.date,
      content: formData.content,
      tags: formData.tags,
    };
    await create(newEntry as any);
    setFormData({ date: new Date().toISOString().split('T')[0], content: '', tags: [] });
    setShowForm(false);
  };

  // Edit functionality
  const handleEdit = (entry: any) => {
    setFormData({
      date: entry.date || entry.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      content: entry.content || '',
      tags: entry.tags || [],
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    const updatedEntry = {
      date: formData.date,
      content: formData.content,
      tags: formData.tags,
    };

    await updateEntry(selectedEntry.id, updatedEntry as any);
    setIsEditing(false);
    setSelectedEntry(null);
    setFormData({ date: new Date().toISOString().split('T')[0], content: '', tags: [] });
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const categoryTags = CATEGORIES.map(c => c.id);

  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return { background: '#FFF9C4', transition: 'background 0.3s ease' };
    }
    return {};
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
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
          <p>다이어리를 불러오는 중...</p>
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
    if (!isEditing || !selectedEntry) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>메모 수정</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setFormData({ date: new Date().toISOString().split('T')[0], content: '', tags: [] }); }}>✕ 취소</button>
          </div>

          <form onSubmit={handleUpdate}>
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
    if (!selectedEntry || isEditing) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <span style={{ fontSize: '24px' }}>📝</span>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '4px' }}>
                  {format(parseISO(selectedEntry.date || selectedEntry.created_at), 'yyyy년 M월 d일 (E)', { locale: ko })}
                </h2>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
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
            <div>작성일: {format(new Date(selectedEntry.created_at || selectedEntry.createdAt), 'yyyy년 M월 d일 HH:mm')}</div>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedEntry)}>✏ 수정</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedEntry.id)}>삭제</button>
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
          <h3 className="card-title">전체 메모 다이어리</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {isSupabaseActive && (
              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Supabase 연결됨</span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{diaryEntries.length}건</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 새 메모'}
            </button>
          </div>
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
                onMouseOver={(e) => { if (!highlightedItemId || entry.id !== highlightedItemId) { e.currentTarget.style.background = 'var(--color-bg-input)'; } }}
                onMouseOut={(e) => { if (!highlightedItemId || entry.id !== highlightedItemId) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                    {format(parseISO(entry.date || entry.created_at), 'yyyy년 M월 d일 (E)', { locale: ko })}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {entry.tags?.map((tag: string) => {
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

      {renderDetail()}
      {renderEditForm()}
    </div>
  );
}