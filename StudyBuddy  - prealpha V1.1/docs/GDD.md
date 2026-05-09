# Game Design Document

> **Pointer file.** The canonical GDD is `../StudyBuddy_GDD_v2.md` at the project root. After `migrate.bat` runs, this file will become the canonical copy and the root version will be deleted.

For the full vision, pillars, system specs, and the Day 1–19 roadmap, read `../StudyBuddy_GDD_v2.md`.

## Where to read first

- **Section 0** — How to read this doc (for the next AI / dev).
- **Section 1** — Concept pitch.
- **Section 2** — Pillars (Learning First · Consequence · Momentum · Player Identity · Pixel Charm).
- **Section 3** — Current status table (what's shipped vs what's owed).
- **Section 4** — Architecture & build pipeline. (See also `ARCHITECTURE.md` for the post-consolidation view.)
- **Sections 5–9** — Shipped systems. Reference only.
- **Section 10** — Roadmap. Day 1–19 in priority order.
- **Section 11** — UX / UI conventions.
- **Section 12** — Hard constraints. Memorize.
- **Section 13** — Handoff cheat-sheet. Read first if short on time.
- **Section 14** — Question type quick reference.
- **Section 15** — Glossary.
- **Section 16** — Monetization (Day 19, design-only until then).
- **Section 17** — AI Tutor architecture (Day 15–16, design-only until then).

## Recent post-GDD changes (not yet folded back into the GDD)

These were shipped during the 2026-05-09 mode-consolidation pass and supersede whatever the GDD says about Lock In, the Arena hub, and the Study topnav:

- **Lock In mode killed.** Section 3's table still lists `LOCK IN` as a feature. Strike it. Practice covers the same role.
- **Arena hub: 13 buttons → 5.** New layout: BUILD (Loadout · Workshop) · PLAY (Blitz · Raids) · World stages inline.
- **Study topnav: 11 buttons → 4.** New layout: Learn · Exam · Library · Progress with sub-tab strip below.
- **Pass Mode** is no longer a top-level Study tab — folded under Exam.
- **Cram Mode is now branded "Blitz"** in the UI to free the word "cram" for casual use.

These changes are reflected in `ARCHITECTURE.md` and `DECISIONS.md`.
