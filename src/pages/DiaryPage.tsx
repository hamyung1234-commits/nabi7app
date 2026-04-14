import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId, CATEGORIES } from '../types';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DiaryPage() {
  const { diaryEntries, setDiaryEntries, searchQuery } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: [] as string[],
  });

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
    setFormData({ date: new Date().toISOString().split('T')[0], content: '', tags: [] });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setDiaryEntries((prev: any) => prev.filter((d: any) => d.id !== id));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const categoryTags = CATEGORIES.map(c => c.id);

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
                style={{
                  padding: 'var(--spacing-lg)',
                  borderBottom: '1px solid var(--color-border)',
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
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(entry.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}