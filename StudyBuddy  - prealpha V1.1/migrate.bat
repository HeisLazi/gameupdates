@echo off
REM ============================================================
REM  StudyBuddy — folder restructure migration (Windows)
REM ============================================================
REM  ONE-SHOT cleanup. Safe to re-run (each step checks before acting).
REM
REM  Renames:
REM    studybuddy_src\           -> src\
REM    design_handoff_studybuddy\ -> design\
REM    qa_screens\               -> test\qa_screens\
REM
REM  Deletes:
REM    PATCH_BUNDLE\             (duplicate of design handoff)
REM    PATCH_BUNDLE_LOCATION.md  (stale path tracker)
REM    StudyBuddy.jsx            (stale ES-module prototype)
REM    study_buddy.jsx           (stale ES-module prototype)
REM    _sync_test.tmp            (stray)
REM    MODULE_SCHEMA.md          (root copy — docs/MODULE_SCHEMA.md is now canonical)
REM    StudyBuddy_GDD_v2.md      (root copy — docs/GDD.md is now the pointer)
REM    studybuddy_src\StudyBuddy_GDD.md  (older GDD superseded by docs/GDD.md)
REM    studybuddy_src\MODULE_SCHEMA.md   (duplicate of root copy)
REM
REM  After running:
REM    1. build.bat will pick up src\ automatically.
REM    2. CONTEXT.md, README.md, START_HERE.md already point at the new layout.
REM    3. Existing .git\ history is preserved (this is a rename + delete only).
REM ============================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================
echo  StudyBuddy — folder restructure
echo ============================================================
echo  This script will rename folders and delete stale files.
echo  Press Ctrl+C now to abort, or any key to continue.
echo ============================================================
pause >nul

set "ERRORS="

REM ---------- Renames ----------
echo.
echo [1/3] Renaming folders...

if exist "studybuddy_src" (
  if exist "src" (
    echo   src\ already exists — skipping rename of studybuddy_src\.
  ) else (
    ren "studybuddy_src" "src"
    if errorlevel 1 ( set "ERRORS=1" & echo   FAILED: studybuddy_src -^> src ) else ( echo   ok: studybuddy_src -^> src )
  )
) else (
  echo   studybuddy_src\ already gone — skip.
)

if exist "design_handoff_studybuddy" (
  if exist "design" (
    echo   design\ already exists — skipping rename of design_handoff_studybuddy\.
  ) else (
    ren "design_handoff_studybuddy" "design"
    if errorlevel 1 ( set "ERRORS=1" & echo   FAILED: design_handoff_studybuddy -^> design ) else ( echo   ok: design_handoff_studybuddy -^> design )
  )
) else (
  echo   design_handoff_studybuddy\ already gone — skip.
)

if exist "qa_screens" (
  if not exist "test" mkdir "test"
  if exist "test\qa_screens" (
    echo   test\qa_screens\ already exists — skipping move.
  ) else (
    move "qa_screens" "test\qa_screens" >nul
    if errorlevel 1 ( set "ERRORS=1" & echo   FAILED: qa_screens -^> test\qa_screens ) else ( echo   ok: qa_screens -^> test\qa_screens )
  )
) else (
  echo   qa_screens\ already gone — skip.
)

REM ---------- Deletes (folder) ----------
echo.
echo [2/3] Deleting stale folders...

if exist "PATCH_BUNDLE" (
  rmdir /s /q "PATCH_BUNDLE"
  if errorlevel 1 ( set "ERRORS=1" & echo   FAILED: PATCH_BUNDLE\ ) else ( echo   ok: removed PATCH_BUNDLE\ )
) else (
  echo   PATCH_BUNDLE\ already gone — skip.
)

REM ---------- Deletes (files) ----------
echo.
echo [3/3] Deleting stale files...

call :delfile "PATCH_BUNDLE_LOCATION.md"
call :delfile "StudyBuddy.jsx"
call :delfile "study_buddy.jsx"
call :delfile "_sync_test.tmp"

REM Move canonical docs into docs/ instead of deleting them.
REM (A previous version of this script deleted the canonical GDD + schema
REM  while the docs/ copies were only pointer stubs. Don't repeat that.)
call :move_doc "StudyBuddy_GDD_v2.md"     "docs\GDD.md"
call :move_doc "MODULE_SCHEMA.md"         "docs\MODULE_SCHEMA.md"
call :move_doc "src\StudyBuddy_GDD.md"    "docs\GDD-old.md"
call :move_doc "src\MODULE_SCHEMA.md"     ""
call :move_doc "studybuddy_src\StudyBuddy_GDD.md" ""
call :move_doc "studybuddy_src\MODULE_SCHEMA.md"  ""

REM ---------- Done ----------
echo.
echo ============================================================
if defined ERRORS (
  echo  Migration finished with errors. Check the messages above.
) else (
  echo  Migration finished cleanly.
)
echo ============================================================
echo.
echo Next steps:
echo   1. Run build.bat to rebuild StudyBuddy.html.
echo   2. Open START_HERE.md if you're a tester.
echo   3. Open README.md if you're a developer.
echo.
pause
endlocal
exit /b 0

:delfile
if exist "%~1" (
  del /q "%~1"
  if errorlevel 1 (
    set "ERRORS=1"
    echo   FAILED: %~1
  ) else (
    echo   ok: deleted %~1
  )
) else (
  echo   %~1 already gone — skip.
)
exit /b 0

REM :move_doc src dest
REM   src  = the file to move (relative to project root)
REM   dest = the destination path. If empty, treat src as a duplicate to delete.
REM Safe rules:
REM   - If src doesn't exist, skip.
REM   - If dest is empty, this is a duplicate — delete src.
REM   - If dest exists AND is larger than 4 KB, dest is the canonical copy — delete src.
REM   - If dest exists AND is smaller than 4 KB, dest is likely a pointer file —
REM     overwrite it with src.
REM   - If dest doesn't exist, move src to dest.
:move_doc
if not exist "%~1" (
  echo   %~1 already gone — skip.
  exit /b 0
)
if "%~2"=="" (
  del /q "%~1"
  if errorlevel 1 ( set "ERRORS=1" & echo   FAILED to delete duplicate %~1 ) else ( echo   ok: deleted duplicate %~1 )
  exit /b 0
)
if exist "%~2" (
  for %%F in ("%~2") do set "_DEST_SIZE=%%~zF"
  if !_DEST_SIZE! gtr 4096 (
    del /q "%~1"
    if errorlevel 1 ( set "ERRORS=1" & echo   FAILED to delete redundant %~1 ) else ( echo   ok: deleted redundant %~1 ^(canonical at %~2^) )
  ) else (
    del /q "%~2"
    move "%~1" "%~2" >nul
    if errorlevel 1 ( set "ERRORS=1" & echo   FAILED to move %~1 -^> %~2 ) else ( echo   ok: %~1 -^> %~2 ^(replaced pointer^) )
  )
) else (
  REM destination dir must exist
  for %%F in ("%~2") do set "_DEST_DIR=%%~dpF"
  if not exist "!_DEST_DIR!" mkdir "!_DEST_DIR!"
  move "%~1" "%~2" >nul
  if errorlevel 1 ( set "ERRORS=1" & echo   FAILED to move %~1 -^> %~2 ) else ( echo   ok: %~1 -^> %~2 )
)
exit /b 0
