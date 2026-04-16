import { useState, useEffect } from 'react';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
        }}>
          ⚠️
        </div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '12px',
        }}>
          연결 오류
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          {error || '서버 연결에 실패했습니다.'}
          <br />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            새로고침(F5)을 눌러주세요.
          </span>
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
        }}>
          <button
            onClick={onRetry}
            style={{
              padding: '12px 24px',
              background: '#1a3a5c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2d5a87'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1a3a5c'}
          >
            🔄 새로고침
          </button>
          <button
            onClick={() => window.location.href = '/nabi7app/'}
            style={{
              padding: '12px 24px',
              background: '#e2e8f0',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            📱 앱으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading overlay while app initializes
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = '로딩 중...' }: LoadingScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #1a3a5c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
      }} />
      <p style={{
        fontSize: '16px',
        color: '#64748b',
        fontWeight: 500,
      }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Error boundary wrapper for app
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('[AppErrorBoundary] Uncaught error:', event.error);
      setError(event.message || '알 수 없는 오류가 발생했습니다.');
    };

    // Unhandled promise rejection
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('[AppErrorBoundary] Unhandled promise rejection:', event.reason);
      setError(event.reason?.message || '서버 연결에 실패했습니다.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (error) {
    return <ErrorScreen error={error} onRetry={() => window.location.reload()} />;
  }

  return <>{children}</>;
}