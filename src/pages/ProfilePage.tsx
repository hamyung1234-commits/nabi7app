import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 style={styles.title}>내 프로필</h1>
        </div>

        <div style={styles.info}>
          <div style={styles.row}>
            <span style={styles.label}>이메일</span>
            <span style={styles.value}>{user?.email}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>사용자 ID</span>
            <span style={styles.valueMono}>{user?.id}</span>
          </div>
          {user?.created_at && (
            <div style={styles.row}>
              <span style={styles.label}>가입일</span>
              <span style={styles.value}>{formatDate(user.created_at)}</span>
            </div>
          )}
          <div style={styles.row}>
            <span style={styles.label}>이메일 인증</span>
            <span style={{
              ...styles.badge,
              background: user?.email_confirmed_at ? '#dcfce7' : '#fef3c7',
              color: user?.email_confirmed_at ? '#166534' : '#92400e',
            }}>
              {user?.email_confirmed_at ? '✅ 인증 완료' : '⏳ 인증 대기'}
            </span>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>보안</h2>
          <p style={styles.sectionDesc}>
            비밀번호 변경은 이메일 인증이 필요합니다.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loading}
          style={{
            ...styles.signOutButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '로그아웃 중...' : '🚪 로그아웃'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid #f1f5f9',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
  },
  value: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 500,
  },
  valueMono: {
    fontSize: '12px',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  badge: {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: 600,
  },
  section: {
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  signOutButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: '15px',
    fontWeight: 600,
    border: '2px solid #fecaca',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};