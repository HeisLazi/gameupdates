# Handoff: StudyBuddy — Tactical Reskin

## Overview
StudyBuddy is a single-file Web Pixel-RPG that turns student study sessions (PDFs, notes, decks, slides) into roguelite combat. This handoff covers a complete visual + UX reskin in a tactical / blueprint / dense-data direction inspired by **Football Manager 24**, **gt-mechanik**, **pally**, and **lightdash**.

The reskin spans 14 screens — from splash to combat to raid hub — sharing one design system (pixel sprites, mono+display type pairing, corner-bracketed panels, dense numeric rows).

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behavior, **not production code to copy directly**. The task is to **recreate these HTML designs in the target StudyBuddy codebase** (single-file vanilla HTML/JS app per the GDD) using its established patterns. The prototypes use React + Babel-in-browser purely for authoring speed; the production codebase decides the actual implementation approach.

If StudyBuddy stays single-file vanilla, lift the markup/CSS structure and translate the JSX into the existing render functions. If it migrates to a build step, the JSX components can be lifted closer to as-is.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions are locked. Recreate pixel-perfectly. All design tokens are centralized in `tokens.css` — port that file (or its values) verbatim.

## Files in this bundle

### Design references (HTML entrypoints)
| File | Purpose |
|---|---|
| `StudyBuddy.html` | Full prototype with hash routing across all 14 screens |
| `StudyBuddy Canvas.html` | Design-canvas overview — all 14 screens at once for review |
| `StudyBuddy Combat HUD.html` | Standalone combat screen (also reachable via `#combat`) |
| `World Map Variants.html` | Four world-map directions (A/B/C/D) for reference |

### Source modules
| File | Contents |
|---|---|
| `tokens.css` | **Design system source of truth** — all colors, type scale, spacing, borders, animations |
| `sprites.jsx` | Pixel-sprite system. 16×16 SVG `<rect>` grid renderer + libraries: `SPR` (enemies), `ABISPR` (abilities), `PETSPR` (pets) |
| `brand.jsx` | `SBMark` wordmark + `SBLogo` lockup |
| `data.jsx` | Mock content data (modules, chapters, abilities, enemies, augments, pets, skills, deadlines) |
| `ui.jsx` | UI primitives: `Chip`, `Bar`, `PanelHeader`, `Btn`, `TopBar`, `StatusBar`, `ASCIIBox` |
| `app.jsx` | Combat HUD (the flagship screen) — exported as `window.CombatHUD` |
| `screens-1.jsx` | Splash, World Map, Study |
| `screens-2.jsx` | Cram (nav + draft + run), Exam, Result |
| `screens-3.jsx` | Arsenal, Skills, Pets, Library, Raid, Stats, Deadlines |
| `shell.jsx` | Top-level router (hash-based) + topbar + status bar wiring |
| `world-variants.jsx` | The 4 world-map directions on a design canvas |
| `tweaks-panel.jsx` | Tweaks helper used in the prototypes (combat exposes accent + display-font tweaks) |

## Routes (hash-based in the prototype)

| Hash | Screen | Component |
|---|---|---|
| `#splash` | Ops / mode select | `ScreenSplash` |
| `#world` | World map (B for Dojo/Street, A for Elites, D for Cram nav) | `ScreenWorld` |
| `#combat` | Combat HUD | `CombatHUD` (from `app.jsx`) |
| `#study` | Study lab — two-pane (notebook left, pixel monster right) | `ScreenStudy` |
| `#cram` | Cram — iso nav → 3-of-N ability draft → wave run | `ScreenCram` |
| `#exam` | Timed mixed-format exam with question grid + proctor rail | `ScreenExam` |
| `#result` | Post-fight loot / mastery delta / XP | `ScreenResult` |
| `#arsenal` | Augment codex w/ paper-doll equipped + tier filter | `ScreenArsenal` |
| `#skills` | Diamond-node skill tree, 4 branches | `ScreenSkills` |
| `#pets` | Stable + sanctuary + bond / evolution stats | `ScreenPets` |
| `#library` | PDF source list + extracted reader + cards/insights | `ScreenLibrary` |
| `#raid` | Weekly cross-module raid chain | `ScreenRaid` |
| `#stats` | Dossier — KPI band, weekly heatmap, accuracy by module, achievements | `ScreenStats` |
| `#deadlines` | Gantt + grade calculator (what-if sliders) | `ScreenDeadlines` |

## Design Tokens — port verbatim from `tokens.css`

### Colors
```
--bg-1:   #0a0d0e   /* page background */
--bg-2:   #11161a   /* panel background */
--bg-3:   #181f24   /* inset / pressed */
--line:   #232b32   /* hairline */
--line-2: #3a4651   /* stronger divider */
--fg:     #e6ecef   /* primary text */
--fg-1:   #c4cdd3
--fg-2:   #8a96a0
--fg-3:   #5d6770   /* meta / labels */
--fg-4:   #353d44

--accent:       #7dd87d   /* primary action / success / streak */
--accent-soft:  rgba(125,216,125,0.10)
--accent-line:  rgba(125,216,125,0.45)
--accent-glow:  rgba(125,216,125,0.65)

--hp:       #d94545    /* enemy / danger */
--block:    #6db0ff    /* defense */
--insight:  #e7c14b    /* yellow tactical alert */
--xp:       #b076ff    /* progression purple */

/* Tier colors (used by augments, loot, raid difficulty) */
--t-common:    #8a96a0
--t-rare:      #6db0ff
--t-epic:      #b076ff
--t-legendary: #e7c14b
--t-mythic:    #ff6db0
```

### Type
- Display: **Space Grotesk** 400/500/600/700 (also accepts Bricolage Grotesque, IBM Plex Sans as alternates via tweak)
- Body: **Inter** 400/500/600
- Mono / labels / numerics: **JetBrains Mono** 400/500/600 — used for ALL labels, captions, telemetry, and tabular numbers
- Caps utility class `.cap` is `font-mono`, 9–10px, `letter-spacing: 0.18em–0.22em`, uppercase, `var(--fg-3)`

### Spacing & borders
- Hairlines are `1px solid var(--line)` everywhere — never use rounded corners on panels (sharp blueprint feel)
- Inner padding is typically 14px panel / 24–32px page content
- Status indicators use the corner-bracket pattern (4px L-shapes anchored to corners)
- Bars are `height: 3–8px`, no rounding

### Sprites
- All enemies/abilities/pets are hand-drawn 16×16 pixel grids rendered as inline SVG `<rect>`s. **Do not use emoji.** Sprite definitions live in `sprites.jsx`. Production should either ship the same grid data or replace with equivalent pixel-art assets at the same dimensions.

## System patterns

### Panel anatomy
Every panel has: `PanelHeader` (caps label + 1px line) → content → optional footer with `Btn` row.

### Topbar
- 44px tall, dark bg, hairline bottom border
- Logo cluster (left) → primary tabs (compact 5-char labels) → MORE dropdown for overflow → flex spacer → stats cluster (HP / STRK / INS / CR) right-aligned
- Active tab is bottom-bordered in `var(--accent)`
- Combat screen suppresses its inner topbar when nested under the shell (see `window.__SB_NESTED` flag in `app.jsx`)

### Status bar (bottom)
24px tall, mono 9px, blinking accent dot, READY/SYNC/CLOCK on the right.

### Buttons (`Btn`)
- Mono caps, 0.18em letter-spacing
- Sizes: `sm` (6×10 / 10px) and `md` (12×16 / 12px)
- Variants: default, `primary` (filled accent on bg-1 text), `danger` (bg-3 with red border + red text)
- All non-rounded; `cursor:pointer`; 110ms transition

### Numerics
- Always tabular mono (`JetBrains Mono`)
- Use color semantically: green = good, red = bad, yellow = warning, purple = XP/progression
- Show deltas as `value` (color-coded)

### Animations
- Bars: `transition: width 200ms ease`
- Hover lifts: 110ms
- Blinking dot: 1s infinite (CSS `blink` keyframe in `tokens.css`)
- Wave countdown: text turns red below 60s, pulses border

## Per-screen notes (high-priority specifics)

### Combat HUD (`app.jsx` — flagship)
- 3-rail layout: BUILD (320px) | STAGE (flex) | INTEL (320px)
- Stage row 1: enemy lineup (variable count, flex), each card has sprite preview + HP bar + intent indicator
- Stage row 2: question prompt with MCQ/SA options (4-key grid)
- Stage row 3: 5-slot ability hotbar with cooldown meters
- Intel rail: turn log (latest at top), telemetry, mistake pool
- Tweaks panel exposes accent color + display font
- Hotkeys: 1–5 abilities, A–D answer, Tab to swap target

### World Map
- B-direction (Dojo/Street): selectable concept tiles per chapter
- A-direction (Elites): elite encounter list with stars
- D-direction: iso climb to boss (also used by Cram)
- All three coexist in the production world screen via mode toggle

### Study
- Two-pane: lab notebook (left) + pixel monster (right)
- Notebook is monospace 13px, line-height 1.7, hairline-bordered cells per card

### Cram
- Three phases: `nav` (iso route) → `draft` (pick 3 of N abilities, slot preview row) → `run` (combat with red urgency chrome + giant 48px timer that turns red below 60s)

### Exam
- Three columns: Q-grid (240px, color-coded per state) | content (max 900px) | proctor (280px)
- Question grid uses 4 states: blank / answered / flagged / current
- Proctor rail shows section progress + WARDEN tip

### Result
- Hero band with rank chip → 4-column performance band → loot tier cards (corner-bracketed) → XP bar + mastery delta strips → pet bond callout

### Arsenal
- 3-col: paper-doll + derived stats (320) | tier-filter codex grid (flex) | detail (320)
- Codex grid is `auto-fill, minmax(180px, 1fr)`
- Detail panel slot card highlights tier color in left border

### Skills
- 600×600 SVG diamond grid, 4 branches (A/B/C/X) keyed by node color
- Edges drawn as `<line>` with dashed style if not learned
- Clicking a node updates the right detail rail

### Pets
- 3-col: stable list (280) | sanctuary stage (flex) | stats (320)
- Sanctuary uses radial green gradient bg + central habitat frame holding 200×200 sprite
- Bond shown as star runs

### Library
- 3-col: sources (320, with progress bars) | reader + extracted-cards (flex grid) | insights (320)
- Reader uses `Georgia, serif` 13px to feel like real document content; highlighted blocks use accent left-border + tinted bg

### Raid
- List of 5 numbered links, each with mod chips, difficulty diamonds, ENGAGE/REPLAY button
- Right rail: 4-slot party (1 player + 3 invite slots) + reward breakdown

### Stats
- Top KPI band — 6 stats in a single bordered row
- Weekly heatmap — 7×24 grid, 5 intensity steps using rgba(125,216,125, …)
- Accuracy by module — colored bars
- Achievements — auto-fill grid with locked/earned states

### Deadlines
- Gantt timeline (140px label col + 6-week timeline col)
- Each deadline shows a colored fill + dot at proportional offset
- Right rail: weighted grade calculator with what-if sliders (`accent-color: var(--accent)`)

## Interactions & Behavior

- Hash-based routing in the prototype is illustrative only — production should use whatever router fits (e.g., the existing GDD's mode-switch pattern)
- `g + letter` quick-nav (g→w world, g→s study, g→c cram, g→e exam, g→a arsenal, g→k skills, g→p pets, g→l library, g→r raids, g→t stats, g→d deadlines, g→x combat, g→h splash) — implemented in `shell.jsx`
- Combat: keyboard 1–5 select ability, A–D answer, Enter confirm, Tab swap target
- All cooldown bars and HP bars animate via `width` transition

## State management (suggested)

```
- player: { lvl, xp, xpNext, hp, maxHp, insight, gold, streak }
- session: { module, chapter, route, state, abilities[], targets[] }
- progress: { masteryByTag, accuracyByModule, deadlines[], achievements[] }
- inventory: { augmentsOwned[], augmentsEquipped, pets[], activePet }
```

The prototype uses local React state only; production should align with the GDD's persistence model.

## Assets

- All sprites: hand-drawn 16×16 grids in `sprites.jsx`. Reuse or re-author as PNG sprite sheet — each sprite is a `{ rows: number[][], palette: { [n]: hex } }` pair.
- No external images — every visual is CSS or inline SVG.

## Open questions for the developer

1. Persistence layer: prototype is in-memory; production should wire to the GDD's localStorage or db.
2. Real PDF ingestion: Library screen mocks extracted cards; the production "ingest" pipeline is out of scope for visual handoff.
3. Real-time multiplayer for Raid Hub: visuals are solo-centric; party slots are scaffolding for future multiplayer.
4. The `tweaks-panel.jsx` infrastructure is **prototype-only** — strip in production unless we want a runtime theme switcher.
