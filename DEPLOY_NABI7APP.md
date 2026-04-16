# 🚀 나비7app 배포 가이드

## 현재 상태

| 항목 | 상태 |
|------|------|
| 빌드 파일 | ✅ `dist/` 폴더 준비됨 |
| URL 경로 | ✅ `/nabi7app/` |
| GitHub Actions | ✅ 구성됨 |

---

## 배포 방법 선택

### 방법 1: GitHub Actions 자동 배포 (추천)

1. GitHub 저장소로 이동
2. **Actions** 탭 확인
3. 마지막 워크플로우 실행 대기 또는 수동 트리거

### 방법 2: 수동 배포 (직접 파일 업로드)

GitHub Pages에 직접 업로드:

```bash
# 1. dist 폴더 내용을 gh-pages 브랜치에 푸시
cd dist
git init
git add .
git commit -m "Deploy nabi7app"
git push -f origin gh-pages
```

### 방법 3: GitHub CLI 사용

```bash
gh repo deploy
```

---

## URL 안내

**현재 배포된 URL:** `https://hamyung1234-commits.github.io/nabi7app/`

이 URL이 작동하지 않는 경우:
1. GitHub 저장소 이름이 `-nabi-app-`인지 확인
2. Settings → Pages → Source가 `gh-pages`인지 확인

---

## 문제 해결

### Q: GitHub Actions가 실행되지 않아요
**A:** 저장소에 Actions 권한이 활성화되어 있는지 확인

### Q: 페이지가 404 에러를 표시해요
**A:** `vite.config.ts`의 `base` 경로가 저장소 이름과 일치하는지 확인

### Q: CSS/JS 파일이 로드되지 않아요
**A:** `post-build-fix.js`가 `/nabi7app/` 경로로 모든 에셋을 수정했는지 확인