# 구현 계획: 나비 - 고객정보 카테고리 추가 및 한국어 번역

## 개요
기존 8개 카테고리 UI의 모든 영어 텍스트를 한국어로 번역하고, 9번째 "고객정보 (Customer CRM)" 카테고리를 추가합니다.

## 포함 사항
- 기존 8개 페이지의 모든 영어 라벨/제목/메시지 한국어 번역
- 9번째 고객정보 페이지 신규 생성
- 사이드바 카테고리 목록 업데이트
- 타입 정의 업데이트

## 제외 사항
- 백엔드 API 변경
- 데이터 구조 변경 (호환성 유지)
- CSS/스타일 변경

## 변경 파일
| 파일 | 작업 | 목적 |
|------|------|------|
| src/types/index.ts | 수정 | 고객정보 타입 추가, CATEGORIES 업데이트 |
| src/components/Sidebar.tsx | 수정 | 영어 가이드 텍스트 한국어 번역 |
| src/pages/MemoPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/PriceCheckPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/ClientRequestsPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/CompanyInfoPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/FeeCalculatorPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/TransactionPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/TaskListPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/AccountInfoPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/DiaryPage.tsx | 수정 | 모든 영어 라벨 한국어 번역 |
| src/pages/CustomerPage.tsx | 생성 | 신규 고객 CRM 페이지 |

## 기술 접근 방식
- 한국어 번역: 모든 UI 텍스트(제목, 라벨, 버튼, 메시지)를 한국어로 변환
- 고객정보: 카드형 목록 + 상세 페이지 + 자동 계산 기능
- 거래내역/의뢰내역 연동: 고객명 기준으로 자동 집계
- 엑셀 내보내기/가져오기: xlsx 라이브러리 활용

## 예상 복잡도
낮음 — UI 텍스트 번역 + 신규 페이지 1개

## 위험 평가
- 위험: 없음 (UI만 변경, 기능 로직 변경 없음)