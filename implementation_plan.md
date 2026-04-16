# Implementation Plan: 모바일 최적화 (Responsive Web CSS)

## Summary
나비(Nabi) 앱을 모바일에서도 완벽하게 사용할 수 있도록 반응형 CSS를 적용합니다. 모바일-first 접근법으로 모든 화면 크기에 최적화된 레이아웃을 구현합니다.

## Scope
### In Scope
- 모바일 사이드바 → 햄버거 메뉴 토글로 변경
- 모바일 레이아웃: 전체 화면 레이아웃 재구성
- 터치 타겟 최적화: 44x44px 이상
- Safe area 처리 (노치, 하단 바)
- Breakpoint 시스템 적용 (375px, 640px, 768px, 1024px, 1280px)

### Out of Scope
- 새로운 기능 추가
- 백엔드 로직 변경
- 다른 페이지 네비게이션 구조 변경

## Planned Changes
| 파일 | 변경 내용 |
|------|----------|
| `src/styles/global.css` | 반응형 CSS 추가 (모바일-first) |
| `src/components/Sidebar.tsx` | 햄버거 메뉴 토글 + 모바일 레이아웃 |
| `src/components/Header.tsx` | 모바일 헤더 최적화 |
| `src/App.tsx` | 모바일 레이아웃 컨테이너 |

## Technical Approach
1. **CSS Breakpoints**: Mobile-first (base → sm → md → lg → xl)
2. **Sidebar Pattern**: Mobile에서 Drawer/Overlay로 변경
3. **Touch Targets**: 모든 인터랙티브 요소 44x44px 이상
4. **Safe Area**: env(safe-area-inset-*) 활용
5. **Fluid Typography**: clamp() 함수 사용

## Estimated Complexity
**Medium** — 다중 파일 변경이지만 기존 패턴 활용

## Risk Assessment
- **레이아웃 변경**: 주요 구조 변경 → 충분한 테스트 필요
- **호환성**: 주요 브라우저-safe CSS 사용
