# Start Here

Welcome to StudyBuddy. You're holding a pre-alpha test build.

## Just play the game

**Double-click `StudyBuddy.html`.** That's it. The game runs in your browser. No install, no internet required after the first load.

If you want a fresh build first (you edited a module, you got the latest source, etc.):

- **Windows**: double-click `build.bat`
- **macOS / Linux**: `./build.sh` from a terminal

Either one runs the build script and opens the game. Takes about a second.

## What to test

Open `test/TESTER_RUNBOOK.md` for the step-by-step list of things to try. The short version:

1. Pick **Study Mode** on the splash. Open a module, answer a question, watch your streak go up.
2. Switch to **Arena Mode** (top-right toggle). Pick a Dojo fight. Try a couple of streets. Beat the boss.
3. Try **Blitz** (Arena → Play → Blitz) — 10-minute wave survival.
4. Mess with **Loadout** and **Workshop** in Arena to see weapons / pets / augments.

## What to ignore

- `src/`, `design/`, `design_handoff_v2/` — developer source. Look but don't touch.
- `docs/` — game design doc, schema, architecture notes. Read if curious.
- `qa_screens/` — old QA screenshots.
- The 3 stale files at the root of the project (`StudyBuddy.jsx`, `study_buddy.jsx`, `_sync_test.tmp`) — leftovers from earlier prototypes; they're scheduled for deletion. Don't open them.

## Found a bug?

Open `test/known_issues.md` to see if it's already known. If not, add a new line at the bottom of that file with:
- What you did
- What happened
- What you expected
- (Optional) screenshot path

Save the file. That's the bug report.

## What's the most useful thing you can do?

Try to break it. Try the modes you don't understand. Try editing a module JSON. Note what's confusing on first contact — first-time UX feedback is the rarest, most valuable thing right now.
