import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId } from '../types';
import { useCounts } from '../contexts/CountContext';

// Props for search navigation
interface TaskListPageProps {
  selectedItemId?: string | null;
  selectedItemType?: string | null;
  highlightedItemId?: string | null;
  onClearSelection?: () => void;
}

export default function TaskListPage({ selectedItemId, selectedItemType, highlightedItemId, onClearSelection }: TaskListPageProps = {}) {
  const { tasks, setTasks } = useAppState();
  const { incrementCount, decrementCount } = useCounts();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
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

  // Handle selected item from search - ONLY open the detail modal, don't clear selection here
  useEffect(() => {
    // Only process if we have a valid selection request for this page type
    if (!selectedItemId || !selectedItemType || selectedItemType !== 'task') {
      return;
    }
    
    // Avoid re-processing the same item
    if (lastSelectedIdRef.current === selectedItemId && hasAutoSelectedRef.current) {
      return;
    }
    
    // If we don't have any items loaded yet, wait
    if (!tasks || tasks.length === 0) {
      console.log('[TaskListPage] Waiting for tasks to load...');
      return;
    }
    
    console.log('[TaskListPage] Auto-selecting task:', selectedItemId);
    console.log('[TaskListPage] Available tasks:', tasks.map((t: any) => t.id));
    
    lastSelectedIdRef.current = selectedItemId;
    hasAutoSelectedRef.current = true;
    
    // Find the item and open detail
    const task = tasks.find((t: any) => 
      t.id === selectedItemId || 
      t.id?.toString() === selectedItemId?.toString()
    );
    
    if (task) {
      console.log('[TaskListPage] Found task:', task.title);
      setSelectedTask(task);
    } else {
      console.warn('[TaskListPage] Task not found with ID:', selectedItemId);
      // Try alternative matching
      const taskAlt = tasks.find((t: any) => 
        selectedItemId?.includes(t.id) || t.id?.includes(selectedItemId)
      );
      if (taskAlt) {
        console.log('[TaskListPage] Found task via alternative match:', taskAlt.title);
        setSelectedTask(taskAlt);
      }
    }
    
    // NOTE: We do NOT call onClearSelection here - only when user closes the modal
  }, [selectedItemId, selectedItemType, tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t: any) => filterStatus === 'all' || t.status === filterStatus)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = {
      id: generateId(),
      title: formData.title,
      relatedStock: formData.relatedStock,
      client: formData.client,
      dueDate: formData.dueDate,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev: any) => [...prev, newTask]);
    incrementCount('task');
    setFormData({ title: '', relatedStock: '', client: '', dueDate: '', status: 'in-progress' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setTasks((prev: any) => prev.filter((t: any) => t.id !== id));
    decrementCount('task');
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    setTasks((prev: any) => prev.map((t: any) => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'in-progress': '진행중',
      'completed': '완료',
      'waiting': '대기',
      'on-hold': '보류',
    };
    return labels[status] || status;
  };

  // Close detail handler - ONLY NOW clear the selection
  const handleCloseDetail = () => {
    setSelectedTask(null);
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
    if (!selectedTask) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)' }}>{selectedTask.title}</h2>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseDetail}>✕ 닫기</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">상태</div>
              <div className="summary-card-value">
                <span className={`badge ${getStatusBadge(selectedTask.status)}`}>{getStatusLabel(selectedTask.status)}</span>
              </div>
            </div>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">마감일</div>
              <div className="summary-card-value">{selectedTask.dueDate || '-'}</div>
            </div>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">관련 종목</div>
              <div className="summary-card-value">{selectedTask.relatedStock || '-'}</div>
            </div>
            <div className="summary-card" style={{ background: 'var(--color-bg-input)' }}>
              <div className="summary-card-label">고객</div>
              <div className="summary-card-value">{selectedTask.client || '-'}</div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button 
                className="btn btn-sm" 
                style={{ background: '#dcfce7', color: '#166534' }}
                onClick={() => { handleStatusChange(selectedTask.id, 'completed'); handleCloseDetail(); }}
              >
                완료로 변경
              </button>
              <button 
                className="btn btn-sm" 
                style={{ background: '#fef3c7', color: '#92400e' }}
                onClick={() => { handleStatusChange(selectedTask.id, 'waiting'); handleCloseDetail(); }}
              >
                대기로 변경
              </button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
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
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
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
                onMouseOver={(e) => {
                  if (!highlightedItemId || task.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'var(--color-bg-input)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!highlightedItemId || task.id !== highlightedItemId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task.id, e.target.checked ? 'completed' : 'in-progress');
                  }}
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

      {/* 상세 모달 */}
      {renderDetail()}
    </div>
  );
}