import { useState, useMemo, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useSupabase';
import { generateId } from '../types';

// Props for search navigation
interface TaskListPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function TaskListPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: TaskListPageProps = {}) {
  const { data: tasks, loading, error, isSupabaseActive, create, update: updateTask, delete: deleteItem, refresh } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    relatedStock: '',
    client: '',
    dueDate: '',
    status: 'in-progress' as 'in-progress' | 'waiting' | 'completed' | 'on-hold',
  });

  // Track if we need to auto-select an item from search
  const hasAutoSelectedRef = useRef(false);
  const lastSelectedIdRef = useRef<string | null>(null);

  // Handle selected item from search
  useEffect(() => {
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'task') {
      return;
    }
    
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    if (!tasks || tasks.length === 0) {
      console.log('[TaskListPage] Waiting for tasks to load...');
      return;
    }
    
    console.log('[TaskListPage] Auto-selecting task:', selectedItemId);
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    const task = tasks.find((t: any) => t.id === selectedItemId || t.id?.toString() === selectedItemId?.toString());
    if (task) {
      setSelectedTask(task);
    } else {
      const taskAlt = tasks.find((t: any) => t.id === selectedItemId || selectedItemId.includes(t.id));
      if (taskAlt) {
        setSelectedTask(taskAlt);
      }
    }
  }, [selectedItemId, selectedItemType, tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t: any) => filterStatus === 'all' || t.status === filterStatus)
      .sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
  }, [tasks, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = {
      title: formData.title,
      relatedStock: formData.relatedStock,
      client: formData.client,
      dueDate: formData.dueDate,
      status: formData.status,
    };
    await create(newTask as any);
    setFormData({ title: '', relatedStock: '', client: '', dueDate: '', status: 'in-progress' });
    setShowForm(false);
  };

  // Edit functionality
  const handleEdit = (task: any) => {
    setFormData({
      title: task.title || '',
      relatedStock: task.relatedStock || '',
      client: task.client || '',
      dueDate: task.dueDate || '',
      status: task.status || 'in-progress',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const updatedTask = {
      title: formData.title,
      relatedStock: formData.relatedStock,
      client: formData.client,
      dueDate: formData.dueDate,
      status: formData.status,
    };

    await updateTask(selectedTask.id, updatedTask as any);
    setIsEditing(false);
    setSelectedTask(null);
    setFormData({ title: '', relatedStock: '', client: '', dueDate: '', status: 'in-progress' });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateTask(id, { status: newStatus } as any);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    if (selectedTask?.id === id) {
      setSelectedTask(null);
      setIsEditing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'in-progress': 'badge-in-progress',
      'completed': 'badge-completed',
      'waiting': 'badge-waiting',
      'on-hold': 'badge-on-hold',
    };
    return badges[status] || 'badge-on-hold';
  };

  const getRowStyle = (item: any) => {
    if (highlightedItemId && item.id === highlightedItemId) {
      return { background: '#FFF9C4', transition: 'background 0.3s ease' };
    }
    return {};
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'in-progress': '진행중',
      'completed': '완료',
      'waiting': '대기',
      'on-hold': '보류',
    };
    return labels[status] || status;
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
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
          <p>진행 리스트를 불러오는 중...</p>
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
    if (!isEditing || !selectedTask) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>작업 수정</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => { setIsEditing(false); setFormData({ title: '', relatedStock: '', client: '', dueDate: '', status: 'in-progress' }); }}>✕ 취소</button>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">작업 제목</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">관련 종목</label>
                <input type="text" className="form-input" value={formData.relatedStock} onChange={e => setFormData({ ...formData, relatedStock: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">고객</label>
                <input type="text" className="form-input" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">마감일</label>
                <input type="date" className="form-input" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">상태</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="in-progress">진행중</option>
                  <option value="waiting">대기</option>
                  <option value="completed">완료</option>
                  <option value="on-hold">보류</option>
                </select>
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
    if (!selectedTask || isEditing) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>{selectedTask.title}</h2>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">상태</div>
              <div className="Summary-card-value">
                <span className={`badge ${getStatusBadge(selectedTask.status)}`}>{getStatusLabel(selectedTask.status)}</span>
              </div>
            </div>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">마감일</div>
              <div className="Summary-card-value">{selectedTask.dueDate || '-'}</div>
            </div>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">관련 종목</div>
              <div className="Summary-card-value">{selectedTask.relatedStock || '-'}</div>
            </div>
            <div className="Summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="Summary-card-label">고객</div>
              <div className="Summary-card-value">{selectedTask.client || '-'}</div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#166534' }} onClick={() => { handleStatusChange(selectedTask.id, 'completed'); handleCloseDetail(); }}>완료로 변경</button>
              <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#92400e' }} onClick={() => { handleStatusChange(selectedTask.id, 'waiting'); handleCloseDetail(); }}>대기로 변경</button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedTask)}>✏ 수정</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedTask.id)}>삭제</button>
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
          <h3 className="card-title">진행 리스트</h3>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            {isSupabaseActive && (
              <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>Supabase 연결됨</span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{tasks.length}건</span>
            <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">전체</option>
              <option value="in-progress">진행중</option>
              <option value="waiting">대기</option>
              <option value="completed">완료</option>
              <option value="on-hold">보류</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? '취소' : '+ 새 작업'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div className="form-group">
              <label className="form-label">작업 제목</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">관련 종목</label>
                <input type="text" className="form-input" value={formData.relatedStock} onChange={e => setFormData({ ...formData, relatedStock: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">고객</label>
                <input type="text" className="form-input" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">마감일</label>
                <input type="date" className="form-input" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">상태</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                  <option value="in-progress">진행중</option>
                  <option value="waiting">대기</option>
                  <option value="completed">완료</option>
                  <option value="on-hold">보류</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">저장</button>
          </form>
        )}

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">T</div>
            <p className="empty-state-text">작업이 없습니다.</p>
          </div>
        ) : (
          <div>
            {filteredTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  padding: 'var(--spacing-md)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  ...getRowStyle(task)
                }}
                onMouseOver={(e) => { if (!highlightedItemId || task.id !== highlightedItemId) { e.currentTarget.style.background = 'var(--color-bg-input)'; } }}
                onMouseOut={(e) => { if (!highlightedItemId || task.id !== highlightedItemId) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(task.id, e.target.checked ? 'completed' : 'in-progress'); }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 20, height: 20 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--spacing-md)' }}>
                    {task.relatedStock && <span>종목: {task.relatedStock}</span>}
                    {task.client && <span>고객: {task.client}</span>}
                    {task.dueDate && <span>마감: {task.dueDate}</span>}
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(task.status)}`}>{getStatusLabel(task.status)}</span>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>삭제</button>
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