@echo off
REM ============================================================
REM  StudyBuddy — one-click build wrapper (Windows)
REM ============================================================
REM  Builds StudyBuddy.html from src/ and opens it in the
REM  default browser. Safe to double-click from File Explorer.
REM ============================================================

setlocal
cd /d "%~dp0"

REM --- locate the build script ---
set "BUILD_DIR=src"
if not exist "%BUILD_DIR%\build_html.py" (
  if exist "studybuddy_src\build_html.py" (
    set "BUILD_DIR=studybuddy_src"
  ) else (
    echo [ERROR] Could not find build_html.py in either src\ or studybuddy_src\
    echo         Did you run migrate.bat yet?
    pause
    exit /b 1
  )
)

REM --- run the build ---
pushd "%BUILD_DIR%"
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py build_html.py
) else (
  python build_html.py
)
set "BUILD_RC=%ERRORLEVEL%"
popd

if not "%BUILD_RC%"=="0" (
  echo.
  echo [ERROR] Build failed with code %BUILD_RC%.
  pause
  exit /b %BUILD_RC%
)

REM --- open the built game ---
if exist "StudyBuddy.html" (
  start "" "StudyBuddy.html"
) else if exist "%BUILD_DIR%\StudyBuddy.html" (
  start "" "%BUILD_DIR%\StudyBuddy.html"
) else (
  echo [WARN] Build succeeded but no StudyBuddy.html was produced.
  pause
)

endlocal
