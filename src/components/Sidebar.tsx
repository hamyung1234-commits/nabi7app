import { useState } from 'react';
import { Category, CategoryId } from '../types';
import Calendar from './Calendar';

interface SidebarProps {
  categories: Category[];
  activeCategory: CategoryId;
  onCategoryChange: (category: CategoryId) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  todayCounts: {
    priceChecks: number;
    clientRequests: number;
    tasks: number;
  };
}

export default function Sidebar({
  categories,
  activeCategory,
  onCategoryChange,
  selectedDate,
  onDateChange,
  todayCounts,
}: SidebarProps) {
  const getCategoryCount = (categoryId: CategoryId): number => {
    switch (categoryId) {
      case 'price-check':
        return todayCounts.priceChecks;
      case 'client-requests':
        return todayCounts.clientRequests;
      case 'task-list':
        return todayCounts.tasks;
      default:
        return 0;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span style={{ fontSize: '2rem' }}>🦋</span>
          <div>
            <h1>나비</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              나의 비서
            </span>
          </div>
        </div>
        <p className="sidebar-slogan">
          언제나 열려있는 나만의 업무 비서
        </p>
      </div>

      <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />

      <nav className="category-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            style={{
              borderLeft: activeCategory === category.id 
                ? `3px solid ${category.color}` 
                : '3px solid transparent',
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            {getCategoryCount(category.id) > 0 && (
              <span className="category-count">{getCategoryCount(category.id)}</span>
            )}
          </div>
        ))}
      </nav>

      <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
        <StartPageGuide />
      </div>
    </aside>
  );
}

function StartPageGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: 'var(--spacing-sm)',
          background: 'var(--color-bg-input)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-xs)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>🚀 시작 페이지 설정</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: 'var(--spacing-xs)' }}>
            이 페이지를 브라우저 시작 페이지로 설정하면 PC를 켤 때마다 자동으로 열립니다.
          </p>
          <ol style={{ paddingLeft: 'var(--spacing-md)' }}>
            <li>Chrome: 설정 → 시작 시 → 특정 페이지 열기 → 이 페이지 URL 입력</li>
            <li>Edge: 설정 → 시작 페이지 → 하나 이상의 페이지 → 추가 → 이 페이지 URL 입력</li>
          </ol>
        </div>
      )}
    </div>
  );
}