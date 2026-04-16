# GitHub 저장소 이름 변경 가이드

## 현재 상태
- 기존 저장소: `hamyung1234-commits/-nabi-app-`
- 현재 URL: `https://hamyung1234-commits.github.io/-nabi-app-/`

## 저장소 이름 변경 절차

### ⚠️ 주의: 이 작업은 GitHub에서 직접 수행해야 합니다.

아래 순서대로 진행하세요:

---

### Step 1: 현재 브라우저에서 GitHub 저장소로 이동

이미 브라우저에 GitHub에 로그인되어 있습니다.
아래 링크를 클릭하세요:

👉 **https://github.com/hamyung1234-commits/-nabi-app-/settings**

---

### Step 2: 저장소 이름 변경

GitHub 저장소 Settings 페이지에서:

1. **Repository name** 입력란을 찾으세요
2. 현재 이름: `-nabi-app-`
3. 새 이름 입력: `nabi-app` (앞뒤 하이픈 제거)
4. **Rename** 버튼을 클릭하세요

---

### Step 3: GitHub Pages 재설정

저장소 이름이 변경되면:

1. 새 저장소 URL로 이동: **https://github.com/hamyung1234-commits/nabi-app/settings/pages**
2. **Build and deployment** 섹션에서:
   - **Source**: "Deploy from a branch" 선택
   - **Branch**: `master` (또는 `main`) 선택
   - **/ (root)** 선택
3. **Save** 클릭

---

### Step 4: 배포 대기 (2-3분)

화면에 다음과 같은 메시지가 나타나면 완료:
> "Your site is live at https://hamyung1234-commits.github.io/nabi-app/"

---

## 변경 후 새 URL

**✅ 새 배포 주소:**
```
https://hamyung1234-commits.github.io/nabi-app/
```

---

## 변경 전 체크리스트

실행 전 확인:
- [ ] GitHub에 로그인되어 있는지
- [ ] 저장소에管理员 권한이 있는지
- [ ] 변경 사항이 있을 경우 백업했는지

## 문제가 생기면?

저장소 이름을 변경해도 GitHub Pages URL이 자동으로 업데이트됩니다.
만약 페이지가 보이지 않으면:
1. Settings → Pages에서 다시 Branch 설정 확인
2. Actions 탭에서 배포 상태 확인
