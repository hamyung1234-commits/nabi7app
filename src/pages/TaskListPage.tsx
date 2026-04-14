import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useLocalStorage';
import { generateId } from '../types';

export default function TaskListPage() {
  const { tasks, setTasks } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    relatedStock: '',
    client: '',
    dueDate: '',
    status: 'in-progress' as 'in-progress' | 'waiting' | 'completed' | 'on-hold',
  });

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
    setFormData({ title: '', relatedStock: '', client: '', dueDate: '', status: 'in-progress' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setTasks((prev: any) => prev.filter((t: any) => t.id !== id));
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'in-progress': '진행중',
      'completed': '완료',
      'waiting': '대기',
      'on-hold': '보류',
    };
    return labels[status] || status;
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
                style={{
                  padding: 'var(--spacing-md)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  opacity: task.status === 'completed' ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => handleStatusChange(task.id, e.target.checked ? 'completed' : 'in-progress')}
                  style={{ width: 20, height: 20 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>{task.title}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--spacing-md)' }}>
                    {task.relatedStock && <span>종목: {task.relatedStock}</span>}
                    {task.client && <span>고객: {task.client}</span>}
                    {task.dueDate && <span>마감: {task.dueDate}</span>}
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(task.status)}`}>{getStatusLabel(task.status)}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(task.id)}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}