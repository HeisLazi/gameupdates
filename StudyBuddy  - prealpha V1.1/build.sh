#!/usr/bin/env bash
# ============================================================
#  StudyBuddy — one-click build wrapper (macOS / Linux)
# ============================================================
#  Builds StudyBuddy.html and opens it in the default browser.
# ============================================================

set -e
cd "$(dirname "$0")"

# --- locate the build script ---
if [ -f "src/build_html.py" ]; then
  BUILD_DIR="src"
elif [ -f "studybuddy_src/build_html.py" ]; then
  BUILD_DIR="studybuddy_src"
else
  echo "[ERROR] Could not find build_html.py in either src/ or studybuddy_src/"
  echo "        Did you run migrate.bat yet?"
  exit 1
fi

# --- run the build ---
pushd "$BUILD_DIR" >/dev/null
if command -v python3 >/dev/null 2>&1; then
  python3 build_html.py
else
  python build_html.py
fi
popd >/dev/null

# --- open the built game ---
if [ -f "StudyBuddy.html" ]; then
  TARGET="StudyBuddy.html"
elif [ -f "$BUILD_DIR/StudyBuddy.html" ]; then
  TARGET="$BUILD_DIR/StudyBuddy.html"
else
  echo "[WARN] Build succeeded but no StudyBuddy.html was produced."
  exit 0
fi

case "$(uname -s)" in
  Darwin) open "$TARGET" ;;
  Linux)  xdg-open "$TARGET" >/dev/null 2>&1 || echo "Open $TARGET manually." ;;
  *)      echo "Open $TARGET in your browser." ;;
esac
