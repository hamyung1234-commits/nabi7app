# Implementation Plan: 검색 기능 수정

## Summary
사용자가 모든 카테고리에서 검색할 때 검색 결과가 제대로 나오지 않는 문제를 수정합니다. Supabase 연결 실패 시 localStorage 폴백 검색이 제대로 작동하도록 개선합니다.

## Problem Analysis
1. **검색이 작동하지 않는 원인 추정**:
   - Supabase 연결 실패 시 `searchFromLocalStorage` 폴백이 제대로 호출되지 않음
   - localStorage 데이터 키 불일치 (`camelCase` vs `snake_case`)
   - 검색 인덱스 초기화가 완료되지 않은 상태에서 검색 시도

2. **현재 검색 흐름**:
   - `searchFromDB()` 호출 → Supabase에서 모든 테이블 데이터 가져옴
   - 데이터가 없으면 `searchFromLocalStorage()` 폴백
   - 문제: Supabase 연결은 되지만 빈 배열을 반환할 때의 처리가 불완전

## Planned Changes

| 파일 | 작업 | 목적 |
|------|------|------|
| src/lib/searchIndex.ts | 수정 | localStorage 폴백 검색 개선 및 디버그 로깅 추가 |
| src/App.tsx | 수정 | 검색 초기화 타이밍 및 검색 결과 처리 개선 |

## Technical Approach

### 1. searchFromDB 개선
- Supabase 연결 상태를 더 명확히 확인
- Promise.allSettled의 결과 처리 로직 개선
- 데이터가 0건일 때만 localStorage 폴백，而不是 Supabase 에러 시에만

### 2. localStorage 폴백 개선
- camelCase와 snake_case 키 모두 시도
- 데이터 키 매핑을 명확히 함
- 검색 필드 Coverage 확장

### 3. 검색 초기화 시퀀스 개선
- 앱 마운트 시 검색 인덱스 즉시 초기화
- 검색 결과를 localStorage 데이터 개수와 비교하여 폴백 결정

## Estimated Complexity
**Medium** — 로직 흐름 수정이지만 핵심 구조는 그대로 유지

## Risk Assessment
- 검색 폴백 로직 변경으로 기존 동작 변경 가능성 있음 → Thorough testing
- localStorage 키 명칭 변경 → 기존 데이터 마이그레이션 불필요 (양쪽 모두 확인)