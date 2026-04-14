import { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface HeaderProps {
  title: string;
  date: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  onExport: () => void;
  onExportExcel: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  localSearchInput?: string;
}

export default function Header({
  title,
  date,
  searchQuery,
  onSearchChange,
  onSearch,
  onExport,
  onExportExcel,
  onImport,
  localSearchInput,
}: HeaderProps) {
  const formattedDate = format(parseISO(date), 'yyyy년 M월 d일 (E)', { locale: ko });
  const displayValue = localSearchInput !== undefined ? localSearchInput : searchQuery;
  
  // input 요소 ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 인풋에 input 이벤트 리스너 등록 (addEventListener 방식)
  useEffect(() => {
    const inputElement = searchInputRef.current;
    if (!inputElement) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      onSearchChange(target.value);
    };

    // addEventListener로 input 이벤트 등록
    inputElement.addEventListener('input', handleInput);

    // cleanup: 이벤트 리스너 제거
    return () => {
      inputElement.removeEventListener('input', handleInput);
    };
  }, [onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">{title}</h2>
        <span className="header-date">{formattedDate}</span>
      </div>

      <div className="header-right">
        <div className="search-box" style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginLeft: '12px', marginRight: '8px' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="검색... (종목명, 고객명, 금액)"
            defaultValue={displayValue}
            onKeyDown={handleKeyDown}
            style={{ 
              borderRadius: '8px 0 0 8px',
              borderRight: 'none'
            }}
          />
          <button 
            className="btn btn-primary btn-sm"
            onClick={onSearch}
            style={{ 
              borderRadius: '0 8px 8px 0', 
              padding: '8px 14px',
              minWidth: '56px',
              fontWeight: 600
            }}
          >
            검색
          </button>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onExportExcel} title="Excel 파일로 내보내기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Excel
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onExport} title="JSON 백업">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          백업
        </button>

        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          복원
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </header>
  );
}