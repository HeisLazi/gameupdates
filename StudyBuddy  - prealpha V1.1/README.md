# StudyBuddy — pre-alpha v1.1

Single-file web pixel-RPG that turns studying into combat. Upload your real course modules (JSON), the app generates flashcards / MCQs / code questions from them, and you fight enemies whose attacks are gated behind those questions. Mastery per concept feeds the question pool — weak concepts haunt you as harder enemies.

## Two top-level modes

- **Study Mode** — calm, notes-first, exam practice. Same questions, no combat.
- **Arena Mode** — gamified. Same questions, real stakes (HP, drops, prestige).

The user toggles between them on the splash screen.

## Who reads what

| You are…             | Read first                       |
|----------------------|----------------------------------|
| A tester             | `START_HERE.md`                  |
| A developer (human)  | this file, then `CONTEXT.md`     |
| An AI / agent        | `CONTEXT.md`                     |
| A designer           | `design/` and `design_handoff_v2/` |

## Folder layout (post-migration)

```
StudyBuddy/
├── START_HERE.md         ← tester entry (1-min read)
├── README.md             ← this file (project overview)
├── CONTEXT.md            ← AI / dev quick reference
├── StudyBuddy.html       ← THE GAME — double-click to play
├── build.bat / build.sh  ← one-click rebuild + open
│
├── src/                  ← source (JSX + Python build script)
│   ├── build_html.py     ← splices everything into StudyBuddy.html
│   ├── modules_all.json  ← course content
│   ├── deadlines.json
│   ├── grades.json
│   └── build/            ← all .jsx + .css + head.html
│
├── design/               ← original Claude Design handoff (read-only reference)
│   ├── tokens.css
│   ├── sprites.jsx
│   ├── ui.jsx
│   └── *.html            ← interactive mockups
│
├── design_handoff_v2/    ← variant library (Combat HUD A–K, World Hub A–G)
│
├── docs/                 ← deep documentation
│   ├── ARCHITECTURE.md   ← how the systems connect
│   ├── API.md            ← state shape + key functions
│   ├── GDD.md            ← full game design doc (v2)
│   ├── MODULE_SCHEMA.md  ← how to write a module
│   └── DECISIONS.md      ← open forks + locked decisions
│
└── test/                 ← QA artifacts
    ├── TESTER_RUNBOOK.md
    ├── known_issues.md
    └── qa_screens/       ← reference screenshots
```

If your project tree doesn't look like this yet, run `migrate.bat` once. That's the script that does the folder renames and stale-file deletes.

## Build

```
cd src
python build_html.py
```

Output: `StudyBuddy.html` (in both `src/` and the project root). Open in a browser. Hard-refresh after rebuilds.

## Constraints (don't break)

1. Single HTML output. No bundler, no node_modules. Babel-standalone compiles JSX in the browser.
2. State lives in `localStorage` (`studybuddy_v3`); PDFs in IndexedDB (`studybuddy_pdf_store_v1`).
3. Splice order in `build_html.py` is fixed and documented — see `docs/ARCHITECTURE.md`.
4. No external scripts beyond Pyodide (already loaded for the in-browser code runner).

## What's shipped (high level)

Study side: notes-first study, exam mode, all 11 question types, JS + Pyodide code runner, spaced rep, library + insights.

Arena side: 7 weapons, ~30 skill-tree nodes, multi-mob combat, 30 enemy abilities + 18 passives, 16 biomes, 7 fully-wired pets with XP/levels, Forge (shard/craft/upgrade), Forbidden Exchange, Stats-as-Buffs, Bestiary, 3 raids, Cram (10-min wave survival).

Recently consolidated: Arena hub trimmed from 13 buttons → 5 (Loadout · Workshop · Blitz · Raids), Study topnav from 11 → 4 (Learn · Exam · Library · Progress). Lock In mode killed (folded into Practice).

## What's not shipped (roadmap)

Prestige flow, mobile responsive pass, AI tutor (BYOK), AI final-boss, story mode cutscenes, co-op raids, monetization shell. See `docs/GDD.md` for the full ordered roadmap.
