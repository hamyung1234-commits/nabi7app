@echo off
REM ============================================
REM 나비7app 배포 스크립트
REM ============================================

echo.
echo =============================================
echo   나비7app GitHub Pages 배포
echo =============================================
echo.

REM GitHub 저장소 URL (필요시 수정)
set REPO_NAME=-nabi-app-
set GITHUB_USER=hamyung1234-commits

echo 1. GitHub에 접속하세요
echo    https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
echo.
echo 2. Source를 "Deploy from a branch"로 선택
echo.
echo 3. Branch를 "gh-pages"로 선택 (없으면 생성)
echo.
echo 4. Save 클릭
echo.
echo 5. dist 폴더의 모든 파일을 drag-and-drop으로 업로드
echo.
echo =============================================
echo.
echo 참고: GitHub Actions가 자동으로 배포되므로
echo        Actions 탭에서 상태 확인 가능
echo =============================================
echo.

pause