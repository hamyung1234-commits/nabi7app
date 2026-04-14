# Implementation Plan: Supabase 데이터베이스 구축 + 로그인 기능

## Summary
Supabase 프로젝트와 연결하고, Email/Password 인증을 통한 로그인 기능을 구현합니다. 기존 localStorage 데이터를 Supabase DB로 마이그레이션하며, 인증 상태에 따른 UI 처리를 추가합니다.

## Scope
### In Scope
- Supabase 프로젝트 생성 및 API 키 발급 가이드
- 환경변수 설정 (`.env`)
- Supabase Auth (로그인/회원가입/로그아웃) 구현
- 인증 상태 관리 (Context API)
- 로그인/회원가입 UI 페이지
- 인증 가드 (Protected Routes)
- localStorage → Supabase 마이그레이션 기능 연결

### Out of Scope
- 소셜 로그인 (Google, Kakao 등)
- 비밀번호 재설정 기능
- 2단계 인증
- 기존 데이터 일괄 삭제/재설정

---

## Planned Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/supabase.ts` | Modify | Auth 모듈 추가, session 상태 관리 |
| `src/contexts/AuthContext.tsx` | Create | 인증 상태 Context Provider |
| `src/pages/LoginPage.tsx` | Create | 로그인 UI |
| `src/pages/RegisterPage.tsx` | Create | 회원가입 UI |
| `src/components/AuthGuard.tsx` | Create | 인증 가드 (미인증 시 로그인 페이지 리다이렉트) |
| `src/App.tsx` | Modify | AuthProvider wrapping, 라우팅 추가 |
| `.env.example` | Create | 환경변수 템플릿 |

---

## Technical Approach

### 1. Supabase 프로젝트 설정
```
Console: https://supabase.com/dashboard
Path: Project Settings > API
- Project URL 복사 → VITE_SUPABASE_URL
- anon/public key 복사 → VITE_SUPABASE_ANON_KEY
```

### 2. Authentication 방식
- **Email/Password** 인증 (Supabase 기본 제공)
- Session 관리: `supabase.auth.getSession()` + `onAuthStateChange`

### 3. Auth 상태 관리
```tsx
// AuthContext 구조
interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email, password) => Promise
  signUp: (email, password) => Promise
  signOut: () => Promise
}
```

### 4. UI 흐름
```
[미인증] → /login → (로그인 성공) → /app
[미인증] → /register → (회원가입 성공) → /login
[인증됨] → /login 접근 → /app 으로 리다이렉트
```

### 5. 마이그레이션 트리거
- 로그인 후 첫 접속 시 `migrateFromLocalStorage()` 자동 실행
- 마이그레이션 여부는 localStorage 플래그로 관리

---

## Database Schema (Supabase)
기존 `database.types.ts`에 정의된 테이블 구조 사용:

| Table | Description |
|-------|-------------|
| `customers` | 고객 정보 |
| `companies` | 기업 정보 |
| `transactions` | 거래 내역 |
| `price_checks` | 시세 체크 |
| `client_requests` | 고객 의뢰 |
| `accounts` | 계좌 정보 |
| `diary_entries` | 다이어리 |
| `memos` | 메모 |
| `tasks` | 할 일 |

> **참고**: `auth.users` 테이블은 Supabase Auth가 자동 관리합니다.

---

## Estimated Complexity
**Medium** — Auth 구현 + 마이그레이션 로직

## Risk Assessment
- **기존 데이터 손실**: 마이그레이션 전 localStorage 백업 안내
- **RLS(Row Level Security)**: 개발初期는 비활성화, 향후 필요 시 설정
