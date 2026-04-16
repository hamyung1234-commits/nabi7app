# 배포 URL 변경 요청 처리

## 현재 상황
- **기존 URL**: `https://hamyung1234-commits.github.io/-nabi-app-/`
- **문제**: URL이 열리지 않거나, 다른 사람에게 전달이 안 됨

## 원인 분석
1. 저장소 이름에 앞뒤 하이픈이 포함됨 (`-nabi-app-`)
2. GitHub Pages에서 문제가 발생할 수 있음

## 해결 방법: 저장소 이름 변경

### 사용자가 직접 수행해야 할 단계

#### 1️⃣ GitHub 저장소 이름 변경
GitHub 웹사이트에서 직접 변경해야 합니다:

1. 브라우저에서 아래 링크로 이동:
   ```
   https://github.com/hamyung1234-commits/-nabi-app-/
   ```

2. **Settings** (설정) 탭 클릭

3. **Repository name** 필드에서:
   - 현재: `-nabi-app-`
   - 변경: `nabi-app` (앞뒤 하이픈 제거)

4. **Rename** 버튼 클릭

#### 2️⃣ GitHub Pages 재설정
저장소 이름 변경 후:

1. 새 저장소로 이동:
   ```
   https://github.com/hamyung1234-commits/nabi-app/settings/pages
   ```

2. 설정 확인:
   - Source: **Deploy from a branch**
   - Branch: **master** (또는 main)
   - 경로: **/ (root)**

3. **Save** 클릭

#### 3️⃣ 배포 완료 대기
- 2~3분 기다린 후 화면에 "Your site is live at..." 메시지 확인

#### 4️⃣ 새 URL 확인
**변경 후 새 주소:**
```
https://hamyung1234-commits.github.io/nabi-app/
```

---

## 다른 사람에게 공유할 때

| 확인 항목 | 방법 |
|-----------|------|
| URL 형식 | `https://`로 시작하는지 확인 |
| Public 설정 | Settings → Danger Zone → Make public |
| 강제 새로고침 | Ctrl + F5 (Windows) 또는 Cmd + Shift + R (Mac) |

---

## 대안: 완전히 다른 배포 플랫폼

Netlify를 사용하면 더 간단하게 배포할 수 있습니다:

1. https://app.netlify.com/drop 방문
2. `dist` 폴더를 드래그 앤 드롭
3. 자동 생성된 URL로 바로 사용 가능

---

## 최종 공유 URL (저장소 이름 변경 후)

```
https://hamyung1234-commits.github.io/nabi-app/
```

이 주소를 다른 사람에게 전달하시면 됩니다.
