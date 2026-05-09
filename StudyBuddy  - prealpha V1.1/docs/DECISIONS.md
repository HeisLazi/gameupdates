# Decisions — open forks + locked calls

What's locked, what's still ambiguous. Lock these before the next major code session.

## Locked (no need to revisit)

- **Single-file output.** No bundler, no node_modules. Babel-standalone. *(Forever.)*
- **State persistence.** localStorage `studybuddy_v3` + IndexedDB `studybuddy_pdf_store_v1`. *(Forever.)*
- **Splash modes.** Two: Study and Arena. Story Mode (Day 17) wraps Arena, never becomes a 3rd splash button.
- **Arena hub structure.** 5 entries: Loadout · Workshop · Blitz · Raids · World (inline). *(Locked 2026-05-09.)*
- **Study topnav structure.** 4 parents: Learn · Exam · Library · Progress, with sub-tab strip below. *(Locked 2026-05-09.)*
- **Lock In Mode.** Killed. Practice covers the same use case. Don't recreate. *(Locked 2026-05-09.)*
- **Pass Mode placement.** Folded under Exam parent. Not a top-level Study tab. *(Locked 2026-05-09.)*
- **Combat HUD reskin direction.** Tactical / blueprint per `design/tokens.css`. Sharp corners, hairline borders, mono-caps labels, chartreuse accent. The variant pick (which of A–K to actually port into combat.jsx) is still open — see fork 1.

## Open forks — pick before next session

### Fork 1 · Combat HUD variant
Claude Design produced 11 directions (A–K) on the canvas. We have JSX source for 5 (G–K) saved in `design_handoff_v2/combat_variants/`. Source for A–F (Tactical · Sleek · XCOM · Library · Arcade · Dossier) is gated by Claude Design weekly limit.

**Pick one to port** into `src/build/combat.jsx`:
- A · Tactical (the original handoff baseline) — safest, already half-applied via the foundation pass
- G · Mission Control — telemetry / NASA dense data
- H · Terminal — pure VT100 / ANSI, all text
- I · JRPG — Pokémon battle box, sprite + dialog menu (most on-brand for a Q&A game)
- J · Fight Card — boxing VS poster
- K · Notebook — moleskine + sticky-note hotbar (most on-brand for studying)

*Recommendation:* I (JRPG) or K (Notebook). They reframe the game thematically rather than just restyling it. Mission Control and Tactical are very strong but visually similar to each other.

### Fork 2 · World Hub variant
4 in original handoff (`design/world-variants.jsx`) + 3 new (Hex Wargame · Subway Diagram · Command Console — source not yet exported from canvas).

*Recommendation:* defer until Combat HUD ports. World hub redesign is lower leverage — the player spends 95% of their time in Combat.

### Fork 3 · Sprite system
Sprites live in `design/sprites.jsx` as 16×16 SVG `<rect>` grids. Production currently uses emoji.

- (a) Port sprites verbatim. Heavier but matches handoff fidelity. ~1 day.
- (b) Stay on emoji indefinitely. Free.
- (c) Add a runtime toggle (sprite vs emoji). Doubles maintenance.

*Recommendation:* (b) for now. Emoji ship today. Revisit when one specific screen needs sprites for clarity.

### Fork 4 · Mobile strategy (Day 14)
Tactical reskin is desktop-first. Doesn't shrink well.

- (a) Reflow — rails collapse to bottom-sheets at <760px. Aesthetic survives, density drops. ~3d.
- (b) Mobile-only second skin — different visual language at <760px (single col, larger type). Doubles CSS, each surface stays good. ~5d.
- (c) Mobile = Study-side only — Pass/Library/Notes/Practice work on phone, Arena/Combat is "desktop or tablet only." ~2d. **Recommended** — Pass Mode is the killer mobile use case anyway.

### Fork 5 · Pass Mode in monetization
Strongest conversion lever — students panic-search "exam tomorrow" and convert in the moment.

- free unlimited (acquisition driver, no conversion)
- **1 free Pass session per 7 days, unlimited paid** (recommended — converts in panic, keeps word-of-mouth alive)
- paid-only (kills student adoption)

### Fork 6 · Pricing (Day 19)
GDD says $5/mo, $40/yr. Too steep for students.

- $3/mo with .edu verification + $4/mo regular + $30/yr
- **$20 one-shot semester pass** (matches student spending psychology — they buy textbooks, not subscriptions)
- keep GDD pricing
- some combo

### Fork 7 · Roadmap pacing
GDD lists 19 days. Days 15–19 individually multi-day in reality (AI tutor, AI boss, story, co-op via PeerJS, monetization shell). Decide:

- (a) Ship Days 10–14 first, revisit 15–19 with realistic per-feature sizing.
- (b) Cut Days 18 (co-op) entirely from v1. Ship without it.
- (c) Defer everything 15+ until v2 / post-launch. Ship a smaller core.

*Recommendation:* (a) + (b). Co-op is a multi-week feature treated as one day in the GDD; it shouldn't gate launch.

## Recently resolved

| Date       | Fork                          | Resolution                                                   |
|------------|-------------------------------|--------------------------------------------------------------|
| 2026-05-09 | Mode trim depth               | Full consolidation — kill Lock In, group into 5+4 entries.   |
| 2026-05-09 | Reskin sequencing             | Restructure hubs first, then reskin Combat (per-screen).     |
| 2026-05-09 | Defer Days 15–19 pre-emptively | No — keep on the table, tackle in order after consolidation. |
