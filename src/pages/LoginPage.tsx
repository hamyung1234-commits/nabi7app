import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || '로그인에 실패했습니다.');
      }
    } else {
      const { error } = await signUp(email, password, userName);
      if (error) {
        setError(error.message || '회원가입에 실패했습니다.');
      } else {
        setSuccess('입력한 이메일로 인증 링크를 보내드렸습니다. 이메일을 확인해주세요.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUserName('');
      }
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 로고 */}
        <div style={styles.logoArea}>
          <div style={styles.logo}>📋</div>
          <h1 style={styles.title}>나비 (나의비서)</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? '로그인하여 시작하세요' : '새 계정을 만들어 시작하세요'}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>이름</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '6자 이상' : '비밀번호 입력'}
              style={styles.input}
              required
            />
          </div>

          {mode === 'signup' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                style={styles.input}
                required
              />
            </div>
          )}

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {success && (
            <div style={styles.success}>{success}</div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 모드 전환 */}
        <div style={styles.switchMode}>
          {mode === 'login' ? (
            <>
              계정이 없으신가요?{' '}
              <button type="button" onClick={switchMode} style={styles.linkButton}>
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button type="button" onClick={switchMode} style={styles.linkButton}>
                로그인
              </button>
            </>
          )}
        </div>

        {/* 데모 안내 */}
        <div style={styles.demo}>
          <p style={styles.demoText}>
            💡 처음 사용하시는 분은 회원가입 후 이메일을 인증하세요.
          </p>
        </div>
      </div>

      {/* 배경 패턴 */}
      <div style={styles.pattern} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 50%, #3d7ab5 100%)',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '56px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a3a5c',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s, opacity 0.2s',
    marginTop: '8px',
  },
  error: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  success: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: '#f0fdf4',
    color: '#16a34a',
    fontSize: '14px',
    border: '1px solid #bbf7d0',
  },
  switchMode: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#64748b',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#1a3a5c',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  demo: {
    marginTop: '24px',
    padding: '16px',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
  },
  demoText: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    textAlign: 'center',
  },
  pattern: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
};