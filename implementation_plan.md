# Implementation Plan: 검색 기능 수정

## Summary
모든 카테고리에서 검색 시 결과가 제대로 나오지 않는 문제를 수정합니다. Supabase 연결 실패 시 localStorage 폴백 검색이 안정적으로 작동하도록 개선합니다.

## Problem Analysis

**현재 검색 흐름**:
1. `searchFromDB()` 호출 → Supabase에서 모든 테이블 데이터 가져옴
2. Supabase 연결 성공 + 결과 있음 → 검색 수행 → 결과 반환
3. Supabase 연결 실패 or 결과 없음 → `searchFromLocalStorage()` 폴백

**잠재적 문제점**:
1. Supabase 연결이 성공해도 빈 배열을 반환할 수 있음 (데이터가 실제로 없는 경우)
2. 이 경우 `matchedTotal === 0` 검사가 작동하여 localStorage 폴백으로 전환하지만, 사용자에게는 "Supabase에 데이터가 없음"으로 보일 수 있음
3. localStorage 폴백 검색이 제대로 작동하지만 사용자가 이를 신뢰하지 못할 수 있음

**핵심 수정사항**:
1. localStorage 폴백을 항상 먼저 시도하고, Supabase는 보조적으로 사용
2. 또는 Supabase + localStorage의 결과를 결합하여 반환
3. 검색 디버그 로깅 강화

## Planned Changes

| 파일 | 작업 | 목적 |
|------|------|------|
| src/lib/searchIndex.ts | 수정 | 검색 로직 개선: localStorage 우선 검색, 결과 결합 |
| src/App.tsx | 수정 | 검색 초기화 타이밍 개선 |

## Technical Approach

### 수정된 검색 전략
1. **항상 localStorage 데이터로 1차 검색 수행**
2. **Supabase 연결 시 Supabase 데이터도 병합**
3. **중복 제거 후 반환**
4. **더 명확한 디버그 로깅**

### 검색 우선순위
1. localStorage (항상 사용 가능)
2. Supabase (연결된 경우에만 보조적으로 사용)

## Estimated Complexity
**Low** — 기존 폴백 로직을 개선하는 수준

## Risk Assessment
- ** rendah**: 폴백 로직을 개선하는 것이므로 기존 동작 변경 최소화