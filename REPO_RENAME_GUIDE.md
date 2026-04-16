# 저장소 이름 변경 및 신규 배포 가이드

## 현재 상태
- 현재 URL: `https://hamyung1234-commits.github.io/-nabi-app-/`
- 현재 저장소: `hamyung1234-commits/-nabi-app-`

## 문제 해결 방법

### 방법 1: 저장소 이름 변경 (권장)

#### Step 1: 현재 GitHub Pages 비활성화
1. GitHub에서 현재 저장소로 이동: https://github.com/hamyung1234-commits/-nabi-app-/
2. **Settings** → **Pages** 로 이동
3. **Source** 드롭다운을 "None"으로 변경
4. **Save** 클릭

#### Step 2: 저장소 이름 변경
1. 같은 저장소의 **Settings** 페이지에서
2. **Repository name** 필드에서 `-nabi-app-` → `nabi-app`로 변경
3. **Rename** 버튼 클릭
4. 경고 메시지가 나타나면 확인

#### Step 3: GitHub Pages 재활성화
1. 변경된 저장소 URL로 이동: https://github.com/hamyung1234-commits/nabi-app/
2. **Settings** → **Pages** 로 이동
3. **Source**: Deploy from a branch 선택
4. **Branch**: `master` (또는 `main`) / `/(root)` 선택
5. **Save** 클릭

#### Step 4: 배포 대기
- "Your site is live at https://hamyung1234-commits.github.io/nabi-app/" 메시지가 나타날 때까지 2-3분 대기

#### Step 5: 새 URL 확인
- 새 URL: **https://hamyung1234-commits.github.io/nabi-app/**
- 다른 브라우저/기기에서 접속 테스트

---

### 방법 2: Netlify로 신규 배포 (대안)

Netlify를 사용하면 더 빠른 배포와 깔끔한 URL을 얻을 수 있습니다.

#### Step 1: Netlify 가입
1. https://app.netlify.com/drop 방문
2. GitHub 계정으로 로그인

#### Step 2: 드래그 앤 드롭 배포
1. `dist` 폴더를 Netlify 드래그 영역에 드롭
2. 자동 배포 후 URL 생성

#### Step 3: 커스텀 도메인 (선택사항)
- Netlify 대시보드에서 커스텀 도메인 연결 가능

---

## 예상 결과

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| URL | `-nabi-app-` (앞뒤 하이픈) | `nabi-app` (깔끔) |
| 저장소 | `hamyung1234-commits/-nabi-app-` | `hamyung1234-commits/nabi-app` |
| GitHub Pages | https://...github.io/-nabi-app-/ | https://...github.io/nabi-app/ |

## 공유할 새 주소

**변경 완료 후 공유할 주소:**
```
https://hamyung1234-commits.github.io/nabi-app/
```

## 외부 접속 확인 체크리스트

- [ ] 다른 기기(핸드폰)로 접속 테스트
- [ ] 다른 네트워크(WiFi → 모바일 데이터)에서 테스트
- [ ] 시크릿/프라이빗 모드 브라우저에서 테스트
- [ ] https://github.com/nabi-app/settings 에서 Public 확인
