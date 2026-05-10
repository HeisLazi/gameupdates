# StudyBuddy · Master Context

**One-file briefing for any new session.** Read this before touching code. Memory (auto-loaded) covers user style + build TDZ trap. This doc is everything else.

Last updated: 2026-05-09 (mode-consolidation pass)

---

## TL;DR

Single-HTML pixel-RPG that gamifies studying. Roguelite combat + spaced repetition. Built from `studybuddy_src/build/*.jsx` via `build_html.py` → `StudyBuddy.html`. No bundler, no node_modules, Babel-in-browser. State in localStorage (`studybuddy_v3`) + IndexedDB (PDFs).

**Roadmap day cursor: Day 10** (last shipped: Day 9 Module Library on 2026-05-04).

**Just-shipped mode consolidation pass (2026-05-09):**
- Lock In mode killed. `lockin.jsx` is now a tombstone. Don't recreate.
- Arena hub collapsed 13 buttons → 5: BUILD (Loadout, Workshop) · PLAY (Blitz, Raids) · World stages inline.
- Study topnav collapsed 11 buttons → 4: Learn · Exam · Library · Progress (with sub-tab strip below).
- New tabbed wrappers in `arena_views.jsx`: `LoadoutView` (5 tabs: Armory · Tree · Hotbar · Pets · Passives) and `WorkshopView` (3 tabs: Forge · Librarian · Exchange — Bestiary lives inside Librarian).
- Old phase strings (`armory`, `tree`, `hotbar`, `pets`, `passives`, `forge`, `librarian`, `exchange`) auto-redirect into the new wrappers, so external `setPhase('armory')` calls still work.

---

## OPEN DECISIONS (lock these before next code session)

1. **Cram split** — accept Untitled.txt argument? Splits Cram into:
   - Arena **Blitz Mode** (gamified, replayable — keeps Day 11 mechanics)
   - Study **Pass Mode** (NEW — one-day exam rescue, not gamified, lives in Study tab)
2. **Reskin integration depth** — recommend route (b): port `tokens.css` + primitives now, reskin each screen as roadmap touches it. Alternative (a) is a 2–3 day reskin sprint that blocks features.
3. **Pass Mode placement** — Study sub-tab vs new top-level mode on splash.
4. **Mobile strategy (Day 14)** — tactical reskin is desktop-first; doesn't shrink well. Pick before porting `tokens.css` because it changes which `@media` queries you write:
   - **(a) Reflow** — rails collapse to bottom-sheets at <760px. Aesthetic survives, density drops. ~3d.
   - **(b) Mobile-only second skin** — different visual language at <760px (single col, larger type). Doubles CSS, each surface stays good. ~5d.
   - **(c) Mobile = Study-side only** — Pass/Library/Notes/Practice work on phone, Arena/Combat is "desktop or tablet." Honest about phone use case. ~2d. *Recommended* — Pass Mode is the mobile killer use case anyway.
5. **Pass Mode in monetization** — strongest conversion lever. Pick:
   - free unlimited (acquisition driver, no conversion)
   - **1 free Pass session/7 days, unlimited paid** *(recommended — converts in panic moment, keeps word-of-mouth alive)*
   - paid-only (kills student adoption)
6. **Pricing tier (Day 19)** — GDD says $5/mo, $40/yr. Too steep for students. Pick:
   - $3/mo with .edu verification + $4/mo regular + $30/yr
   - **$20 one-shot semester pass** *(matches student spending psychology — they buy textbooks, not subscriptions)*
   - keep GDD pricing
   - some combo of the above

Until decided, treat Day 11 + Day 14 + Day 19 as ambiguous. Story Mode (Day 17) cascades from forks 1+5, no separate fork needed.

---

## FILE MAP

### Source (edit these)
```
studybuddy_src/build/
├── app.jsx              ← shell, top-level state, level-up modal, splice point
├── extras.jsx           ← misc helpers
├── world.jsx            ← world map, dojo/practice/street/elite/boss flow
├── bonuses.jsx          ← getCombinedStats core + prestigeFlags
├── skills.jsx           ← skill tree
├── caveman.jsx          ← caveman path (monkey-patches getCombinedStats)
├── enemies.jsx          ← ENEMY_REGISTRY + ENEMY_ABILITIES + ENEMY_PASSIVES
├── multimob.jsx         ← multi-enemy state (enemies[], targetIndex)
├── cram.jsx             ← Blitz Mode (10-min wave survival, ability draft)
├── lockin.jsx           ← TOMBSTONE — Lock In was killed during consolidation. Do not recreate.
├── study_pass.jsx       ← Study Pass Sprint (now folded under Exam topnav, deadline-aware)
├── arena_runtime.jsx    ← arena state, biomes, forge, exchange, prestige helpers
├── raids.jsx            ← raid logic + RaidHubView + RaidView
├── combat.jsx           ← combat screen, enemy render, intent badges (line ~412)
├── arena_views.jsx      ← arena UI (hub, ArmoryView, SkillTreeView, HotbarView, PetSanctuaryView, PassivesView, ForgeView, LibrarianView, ExchangeView, LoadoutView wrapper, WorkshopView wrapper)
├── arena.css            ← arena-only styles
└── head.html            ← <head> template
```

### Build artifacts (don't edit by hand)
- `studybuddy_src/StudyBuddy.html` (build output)
- `StudyBuddy.html` (root copy — same file)
- `studybuddy_src/modules_all.json`, `deadlines.json`, `grades.json` (data, edited via app)

### QA / Testing
- `qa_screens/` — test/reference screenshots for UI verification

### Reference files (not spliced)
- `StudyBuddy.jsx`, `study_buddy.jsx` — root-level references
- `PATCH_BUNDLE_LOCATION.md` — reskin bundle path tracker

### Reskin bundle (NEW — design references)
Lives somewhere on disk (paths from the design canvas / handoff README). High-fidelity HTML/JSX prototypes for all 14 screens. **Do NOT splice directly into the build** — they assume hash routing + React 18 createRoot. Lift the markup/CSS structure into existing screen files.

Critical files in the bundle:
- `tokens.css` — **port verbatim**, design system source of truth
- `sprites.jsx` — pixel-sprite library (SPR/ABISPR/PETSPR), 16×16 SVG-rect grids
- `brand.jsx` — `SBMark` + `SBWordmark`
- `ui.jsx` — primitives: `Chip`, `Bar`, `PanelHeader`, `Btn`, `TopBar`, `StatusBar`
- `app.jsx` — combat HUD (use as combat.jsx visual reference)
- `screens-1/2/3.jsx` — splash, world, study, cram, exam, result, arsenal, skills, pets, library, raid, stats, deadlines
- `world-variants.jsx` — 4 world-map directions (A/B/C/D)
- `README.md` — handoff notes (design tokens, per-screen specs)

### Patch dropbox
- `PATCH_BUNDLE/` — user drops `.jsx` patches here, you splice into `studybuddy_src/build/`

### Docs
- `studybuddy_src/StudyBuddy_GDD.md` (canonical GDD — see §10 for task breakdowns, §16 monetization, §17 AI tutor)
- `StudyBuddy_GDD_v2.md` (root copy)
- `MODULE_SCHEMA.md` (how to write module JSONs)
- `README.md` (in studybuddy_src — quickstart)

---

## BUILD

```
cd studybuddy_src && python3 build_html.py
```

Output: `studybuddy_src/StudyBuddy.html`. Open in browser.

**Splice order (locked in build_html.py):** `extras → world → bonuses → skills → caveman → enemies → multimob → cram → study_pass → arena_runtime → raids → combat → arena_views`. Files are spliced after React destructure, in this order. (`lockin.jsx` was removed from this list during consolidation — the file is now an empty tombstone.)

**Splice marker in app.jsx:** `/* ============ APP SHELL ============ */` — do not move/delete. Helpers go AFTER `const { useState, useEffect, useMemo, useRef } = React;` (TDZ trap if before).

**Verify before declaring done:** Babel-compile the extracted script with `@babel/standalone` in Node — duplicate top-level identifiers silently break the page (blank, no console).

---

## ROADMAP (priority-fixed — don't reorder without user confirmation)

| Day | Status | What |
|---|---|---|
| 3 | ✓ | Augments + drop tables + post-fight loot |
| 4 | ✓ | Biomes (5 new) + per-biome palette |
| 5 | ✓ | Raids + Pets fully wired (7 pets) |
| 6 | ✓ | Forge (shard/craft/upgrade) + LevelUpModal + REWARD_POOL |
| 7 | ✓ | Forbidden Exchange v2 + Pet XP + Stats-as-buffs |
| 9 | ✓ | Module Library + Bestiary in Librarian |
| **10** | ← here | Combat Visuals Polish — desc tooltips, chapter numbering. **Recommend folding in: reskin foundation (tokens.css + primitives + brand kit).** |
| 11 | ambiguous | Cram Rework — see fork 1. Either Blitz (gamified) or Blitz + Pass Mode. |
| 12 | pending | Study-Side Polish — Practice picker, Deadlines month-grid, Grade Calculator |
| 13 | pending | Arena QoL — Daily Plan, quick-grasp, loadout presets |
| 14 | pending | Mobile support |
| 15 | pending | AI Tutor — Companion (BYOK) |
| 16 | pending | AI Tutor — Final Boss |
| 17 | pending | Story Mode (cutscenes) |
| 18 | pending | Co-op Raids (PeerJS) |
| 19 | pending | Final polish + monetization |

Day 8 (Prestige Perks) was deferred — not in shipped list, check before claiming.

---

## PASS MODE (design seed — from Untitled.txt thread)

If fork 1 accepted, this becomes a new Study sub-mode. Research-backed (active recall, spacing, interleaving, feedback, worked examples for novices).

**Flow:**
1. **Diagnostic (5 min)** — subject, exam date, format, weak/strong topics, mark weights → builds marks-map ranked by likely-points-per-minute
2. **Priority map** — high-marks/low-time topics first, foundational deps surfaced, "skip for now" labelled
3. **Teach fast** (per topic) — 60s concept → worked example → completion task → 2 recall questions
4. **Retrieval cycles** — interleaved across topics, micro-spaced (revisit miss after 1/3/N waves), difficulty rises only after success
5. **Timed mock exam** — pulls heavily from `arena.mistakePool` + smaller slice of fresh items
6. **Coach debrief** — 3 things only: what's weak, what to review, next 10-min drill

**Avoid:** survival grind, loot chase, speed rewards, gamification. Pass Mode optimizes marks-per-minute, not engagement.

**Not in GDD yet** — needs §10b addendum before building.

---

## HARD CONSTRAINTS

- Single HTML output. No external libs beyond Pyodide CDN.
- No duplicate top-level decls across spliced files (const/function/let). **Grep all build files before adding any new top-level helper.**
  - `levelFromXp`, `defaultArenaState`, `defaultState` live ONLY in `app.jsx`
  - `prestigeFlags` lives ONLY in `bonuses.jsx`
- State updates from setTimeout/async must use functional form: `setState(s => ({...s,...}))`
- PDFs in IndexedDB (`studybuddy_pdf_store_v1`), not localStorage
- New state fields need fallback reads: `state.arena?.cram || defaultCramState()`

**Common errors:**
- `Identifier 'X' has already been declared` → duplicate top-level helper, delete the newer one
- `Cannot access 'React'` → helper spliced before React destructure
- `state.arena.enemies is undefined` → old save has `boss` not `enemies`; `normalizeArena()` migrates
- Blank page no console → almost always duplicate top-level identifier

---

## DESIGN TOKENS (from reskin bundle — these are LOCKED)

Port `tokens.css` verbatim. Key values:
- bg: `#0a0d0e` (page) `#11161a` (panel) `#181f24` (inset)
- accent: `#7dd87d` (chartreuse green — primary action / streak / success)
- semantic: `--hp #d94545` `--block #6db0ff` `--insight #e7c14b` `--xp #b076ff`
- tiers: common `#8a96a0` rare `#6db0ff` epic `#b076ff` legendary `#e7c14b` mythic `#ff6db0`
- type: Space Grotesk (display), Inter (body), JetBrains Mono (labels/numerics)
- **NO rounded corners on panels** — sharp blueprint feel, hairline `1px solid var(--line)`
- Caps utility `.cap` = mono 9–10px, letter-spacing 0.18–0.22em, uppercase, `var(--fg-3)`

Sprites are 16×16 SVG `<rect>` grids. Do not use emoji.

---

## WHEN STARTING A TASK — WHERE TO READ

| Task | Read |
|---|---|
| Combat tweak | `combat.jsx` + `multimob.jsx` + reskin `app.jsx` for visual ref |
| Enemy / ability / passive | `enemies.jsx` |
| New screen | matching `screens-N.jsx` in reskin bundle, then port to existing screen file |
| Biome / forge / exchange / prestige math | `arena_runtime.jsx` + `bonuses.jsx` |
| Pet hooks | `arena_runtime.jsx` (PET_REGISTRY) + grep `petOn` in `combat.jsx` |
| Module data | `modules_all.json` + `MODULE_SCHEMA.md` |
| Study Pass Sprint | `study_pass.jsx` |
| Loadout/Workshop tabs | `arena_views.jsx` (LoadoutView + WorkshopView at end of file) |
| Build issue | this doc → "Build" + "Hard constraints" |
| What's next | this doc → "Roadmap" + "Open decisions" |

If a memory file conflicts with this doc, this doc wins (memory is point-in-time observations; this is current state).
