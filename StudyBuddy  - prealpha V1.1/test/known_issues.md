# Known Issues

Append new issues at the bottom. Sort: open issues first (newest at top), then fixed (newest at top).

## Format for new bug reports

```
### #N · short title
**Status:** open | won't-fix | fixed (build XX)
**Reported:** YYYY-MM-DD by tester-handle
**Where:** which screen / mode / module
**What I did:** step-by-step
**What happened:** symptom
**What I expected:** desired behaviour
**Screenshot:** test/qa_screens/issue-N.png  (optional)
**Notes:** anything else
```

Increment N by 1 each time. Don't reuse numbers.

---

## Open

### #6 · Inner "Back" button visible inside Loadout/Workshop tab wrappers
**Status:** open (cosmetic)
**Reported:** 2026-05-09 by claude (during consolidation)
**Where:** Arena → Loadout (any tab) → bottom of view
**What I did:** Click any tab in Loadout or Workshop.
**What happened:** The wrapped legacy view (e.g. ArmoryView) still renders its own "Back to Arena" button at the bottom. Clicking it does nothing because the wrapper passes a noop.
**What I expected:** Inner Back button suppressed; only the tab strip's "← Back to Arena" should be visible.
**Notes:** Fix is to add a `wrapped` prop to each *View component and skip rendering the inner back button when wrapped. Low priority — cosmetic redundancy, not a functional break.

### #5 · Foundation tactical-skin and old purple skin both live in head.html
**Status:** open
**Reported:** 2026-05-09 by claude (during audit)
**Where:** any screen
**What I did:** Inspected `src/build/head.html`.
**What happened:** Two `:root { ... }` blocks coexist — the legacy purple `--accent: #8b9eff` block and the newer tactical `--accent: #7dd87d` block from the foundation pass. Some screens may render with mixed colors.
**What I expected:** One token block, the tactical one.
**Notes:** Fix is the per-screen reskin pass (Combat HUD first). Tracked under fork 1 in `docs/DECISIONS.md`.

### #4 · Duplicate augment entries in LOOT_TABLE
**Status:** open (data hygiene)
**Reported:** 2026-05-09 by claude
**Where:** `src/build/arena_runtime.jsx` LOOT_TABLE
**What I did:** Searched the augment registry.
**What happened:** Both `scholars_eye` and `scholar_eye` exist as separate keys with the same effect. If both are rolled they double-stack.
**What I expected:** One entry.
**Notes:** Pick the canonical key, point the other to it (alias) or delete and migrate any saves that reference the dropped one.

### #3 · Bash sandbox unavailable — could not run `python build_html.py` to verify post-consolidation build
**Status:** open (process)
**Reported:** 2026-05-09 by claude
**Where:** dev workflow
**What I did:** Tried to run the build inside the sandbox.
**What happened:** Sandbox bash returned "Workspace unavailable" all session.
**What I expected:** Clean build + Babel verification.
**Notes:** User to run `py build_html.py` from `studybuddy_src/` (or `src/` post-migrate) themselves and screenshot the result.

### #2 · Old prototype files at root will confuse first-time testers
**Status:** open (cleanup)
**Reported:** 2026-05-09 by claude
**Where:** project root
**What I did:** Listed root.
**What happened:** `StudyBuddy.jsx`, `study_buddy.jsx`, `_sync_test.tmp` are stale leftovers, opening them in an editor would mislead a tester.
**What I expected:** They should be deleted.
**Notes:** `migrate.bat` (root) handles this. Run it once.

### #1 · `PATCH_BUNDLE/` is a duplicate of `design_handoff_studybuddy/` with a misleading name
**Status:** open (cleanup)
**Reported:** 2026-05-09 by claude
**Where:** project root
**What I did:** Compared READMEs.
**What happened:** PATCH_BUNDLE_LOCATION.md describes patches that no longer match the folder contents (which is now design handoff material).
**What I expected:** Folder removed.
**Notes:** `migrate.bat` deletes it.

---

## Fixed

(empty — populate as fixes ship)

---

## Sign-offs

(append a line per tester run, newest at top)
