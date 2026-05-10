# Architecture

How the systems connect. For the *what*, see `GDD.md`. For the *file layout*, see `../CONTEXT.md`.

## 30-second mental model

```
                  ┌─────────────┐
                  │  StudyBuddy │
                  │   .html     │  (single file, opens in any browser)
                  └──────┬──────┘
                         │ Babel-standalone compiles JSX in-browser
                         ▼
                  ┌─────────────┐
                  │   <App/>    │
                  └──────┬──────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   <Splash/>         localStorage      IndexedDB
   pick mode         studybuddy_v3     studybuddy_pdf_store_v1
       │
       ├──► Study Mode  → Learn · Exam · Library · Progress
       │
       └──► Arena Mode  → World stages + Loadout · Workshop · Blitz · Raids
```

## Build pipeline

Source lives in `src/build/*.jsx`. The Python script `src/build_html.py`:

1. Reads `head.html` and inlines `arena.css` into the `<style>` block.
2. Inlines `modules_all.json`, `deadlines.json`, `grades.json` into `<script type="application/json" id="...">` tags.
3. Concatenates JSX helper files in this fixed order:
   ```
   extras → world → bonuses → skills → caveman → enemies → multimob
          → cram → study_pass → arena_runtime → raids → combat → arena_views
   ```
4. Splices the concatenated bundle into `app.jsx` IMMEDIATELY AFTER the line:
   ```js
   const { useState, useEffect, useMemo, useRef } = React;
   ```
5. Output: writes self-contained HTML to BOTH `src/StudyBuddy.html` AND the project root `StudyBuddy.html`.

**Order rules:**
- `skills.jsx` MUST come before `caveman.jsx` (caveman extends ABILITIES + WEAPONS + monkey-patches getCombinedStats).
- `enemies.jsx` MUST come before `multimob.jsx` (multimob calls enemy resolvers).
- `arena_runtime.jsx` MUST come before `raids.jsx` (raids reads LOOT_TABLE, RAID_TYPES, RELIC_MAP).
- `arena_views.jsx` MUST come last (uses every helper).

## State flow

`localStorage['studybuddy_v3']` holds everything that survives a refresh. `loadState()` in `app.jsx` is the entry point; `defaultState()` provides defaults for missing keys; `normalizeArena()` migrates old shapes (e.g. single `boss` → `enemies[]`). See `API.md` for the full shape.

PDFs are too large for localStorage — they live in IndexedDB (`studybuddy_pdf_store_v1`). Helpers in `app.jsx`: `savePdfBlob`, `loadPdfBlob`, `deletePdfBlob`.

## Mode subsystems

### Splash (`extras.jsx`)

Two cards: Study Mode / Arena Mode. Stores choice in `state.appMode`. Returning users see a status row (level, streak, XP, insights).

### Study Mode (`app.jsx`)

Topnav has 4 parents and a sub-tab strip below:

| Parent   | Sub-tabs                                              |
|----------|-------------------------------------------------------|
| Learn    | Home · Study · Daily · Review · Mixed                 |
| Exam     | Exam · Pass Sprint                                    |
| Library  | (single child)                                        |
| Progress | Stats · Deadlines · Grades · Modules                  |

The active parent is computed from the active view. The sub-tab strip only renders when the active parent has more than one child.

### Arena Mode (`arena_views.jsx` → `ArenaView`)

Hub shows the equipped weapon panel, sockets, hotbar preview, then 5 entries:

| Group | Entry    | Renders                                                              |
|-------|----------|----------------------------------------------------------------------|
| BUILD | Loadout  | `LoadoutView` — tabs: Armory · Tree · Hotbar · Pets · Passives       |
| BUILD | Workshop | `WorkshopView` — tabs: Forge · Librarian (Bestiary inside) · Exchange |
| PLAY  | Blitz    | `CramHub` (10-min wave survival, ability draft)                      |
| PLAY  | Raids    | `RaidHubView` → `RaidView` (4-phase boss chains)                     |
| World | (inline) | `WorldView` — Dojo · Practice · Street · Elite · Final Boss          |

Old phase strings (`armory`, `tree`, `hotbar`, `pets`, `passives`, `forge`, `librarian`, `exchange`) are intercepted at the top of `ArenaView` and redirected into the appropriate wrapper with the matching tab pre-selected.

### Combat (`combat.jsx` → `CombatScreen`)

The flagship screen. Wraps every fight type — street, elite, boss, practice, blitz wave, raid phase. Reads `state.arena.enemies[]` (the multi-mob array), routes damage via helpers in `multimob.jsx`, applies pet hooks from `bonuses.jsx`, applies biome modifiers from `arena_runtime.jsx`. Emits `result` to `ResultScreen` on win/loss.

### Raids (`raids.jsx`)

Each raid is a chain of 4 `CombatScreen` instances (Setup → Pressure → Burn → Death). `RaidView` advances on win, exits on forfeit/loss. Full clear awards the raid relic + 1 random Mythic augment.

## Cross-file dependency graph (top of helpers)

```
app.jsx ──┬── extras.jsx ── world.jsx ── bonuses.jsx ── skills.jsx ── caveman.jsx
          │                                                                │
          │                                              monkey-patches:    │
          │                                              getCombinedStats   │
          │                                                                │
          ├── enemies.jsx ── multimob.jsx ── cram.jsx ── study_pass.jsx
          │                  │
          │                  uses generateEnemy / resolveEnemyAction
          │
          ├── arena_runtime.jsx ── raids.jsx
          │     │                    │
          │     LOOT_TABLE/BIOMES    chains 4× CombatScreen
          │     getCombinedStats     reads RELIC_MAP
          │     wrapped twice
          │     (rewards layer +
          │      stat-buffs layer)
          │
          ├── combat.jsx (THE CombatScreen — uses everything above)
          │
          └── arena_views.jsx (ArenaView, all *View components, LoadoutView, WorkshopView)
```

## Failure modes

| Symptom                                              | Likely cause                                                  |
|------------------------------------------------------|---------------------------------------------------------------|
| Blank page, no console output                        | Babel parse error or duplicate top-level identifier silently dropped the script block. Open DevTools BEFORE loading. |
| `Identifier 'X' has already been declared`           | Same `const` / `function` declared in two helper files. Grep all of `src/build/`. |
| `Cannot access 'React' before initialization`        | A helper got spliced before `const { useState, ... } = React;`. |
| `state.arena.enemies is undefined` after upgrade     | Old save has the legacy `boss` field. `normalizeArena()` should handle this — verify it ran. |
| Save was wiped after a refresh                       | `saveState()` whitelist in `app.jsx` is missing a new field. Add it. |

## Recent structural decisions

- **Lock In mode killed** (2026-05-09). Was a 48-line wrapper that spawned one boss into CombatScreen — Practice already covers that. `lockin.jsx` is now an empty tombstone, removed from the splice list.
- **Arena hub collapsed 13 → 5 buttons** (2026-05-09). Loadout + Workshop are tabbed wrappers around the existing standalone views, not new screens.
- **Study topnav collapsed 11 → 4 buttons** (2026-05-09). Sub-tab strip below the topbar exposes the children of the active parent.
- **Pass Mode folded under Exam** (2026-05-09). No longer a top-level Study tab.

See `DECISIONS.md` for what's still open.
