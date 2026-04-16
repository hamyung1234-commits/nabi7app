# 배포 URL 문제 해결 - 최종 안내

## 현재 상황

현재 URL `https://hamyung1234-commits.github.io/-nabi-app-/` 이 **불안정하게 작동**하고 있습니다.

- Playwright 브라우저에서는 페이지가 로드됨
- Devicelab에서는 "Site not found" 오류 발생
- 다른 사람에게 전달 시 문제가 발생할 수 있음

## 원인

저장소 이름에 앞뒤 하이픈이 포함됨 (`-nabi-app-`)으로 인해 GitHub Pages에서 문제가 발생할 수 있습니다.

---

## 해결 방법 2가지

### ✅ 방법 1: GitHub 저장소 이름 변경 (무료)

**GitHub 웹사이트에서 직접 변경 필요:**

1. 아래 링크로 이동:
   https://github.com/hamyung1234-commits/-nabi-app-/

2. **Settings** → **Repository name** → `-nabi-app-` → `nabi-app`

3. **Rename** 클릭

4. 새 URL: **https://hamyung1234-commits.github.io/nabi-app/**

---

### ✅ 방법 2: Netlify로 즉시 배포 (가장 빠름)

Netlify Drop을 사용하면 1분 안에 새로운 URL을 생성할 수 있습니다.

**순서:**

1. 브라우저에서 https://app.netlify.com/drop 열기

2. GitHub 로그인 (또는 이메일 로그인)

3. 현재 프로젝트의 `dist` 폴더를 드래그 앤 드롭

4. 자동 생성된 URL로 바로 사용 가능!

**예시 URL:** `random-name-12345.netlify.app`

---

## 지금 바로 할 수 있는 것

Netlify Drop이 가장 빠릅니다:

1. 👉 **https://app.netlify.com/drop** 열기
2. 📁 `dist` 폴더를 드래그
3. 🔗 생성된 URL 복사
4. ✅ 완료!

`dist` 폴더 위치를 알려주시면, zip 파일로 압축해 드릴 수도 있습니다.

---

## 공유할 새 URL (Netlify 배포 후)

```
https://YOUR-SITE-NAME.netlify.app
```

이 주소는 다른 사람에게 바로 전달할 수 있습니다.
