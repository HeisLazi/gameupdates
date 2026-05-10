# StudyBuddy — Build Sources

The shell sandbox in chat is unavailable, so here are the source files. You
have everything needed to build `StudyBuddy.html` locally with Python.

## How to build

1. Open a terminal in this folder (`studybuddy_src/`).
2. Run:

   ```
   python3 build_html.py
   ```

   (or `py build_html.py` on Windows if `python3` isn't on PATH)

3. The output `StudyBuddy.html` is written into this folder. Move/copy it
   anywhere you want and double-click to open in your browser.

## What's in here

```
studybuddy_src/
├── README.md            ← this file
├── build_html.py        ← the build script
└── build/
    ├── head.html        ← HTML shell + base CSS
    ├── arena.css        ← Arena/Library/World/Splash CSS
    ├── extras.jsx       ← Splash screen + Library + Insights helpers
    ├── world.jsx        ← World view (Dojo/Practice/Street/Elite/Boss) + Insights panel
    ├── arena.jsx        ← Combat + Weapons + Skill tree + Hotbar
    └── app.jsx          ← App shell + Study mode views (home/study/exam/etc)
```

## About the module data

The build needs `modules_all.json`, `deadlines.json`, and `grades.json`.
**You don't need to copy them manually** — `build_html.py` automatically
falls back to extracting them from your existing `StudyBuddy.html` if it sits
in the parent folder (e.g. `Downloads/files/StudyBuddy.html`).

So as long as you have a previous `StudyBuddy.html` in `Downloads/files/`,
just run `python3 build_html.py` and it'll work.

If you ever want the JSON files explicitly, drop them next to `build_html.py`
and they'll be used instead of the fallback.

## Editing modules

To add or edit a module, see `MODULE_SCHEMA.md` (lives in `Downloads/files/`)
for the full schema. Edit your local `modules_all.json` and re-run the build.

## What's new in this build

- Splash screen on launch with mode picker (Study vs Arena)
- Arena mode = separate gamified flow inside its own topbar
- World flow per module: Dojo → Practice → Street → Elite → Final Boss
- Library (in Arena) reads concept notes & uploaded PDFs, awards Insights
  for focused reading time (1 per 5 min, daily cap 3, balance cap 10)
- PDFs are tagged per module on upload; folder import (Chrome/Edge) auto-tags
  by subfolder name
- Combat: Weapons (4 soft-classes), Skill Tree (6 unlockables, SP economy),
  5-slot hotbar (2 weapon + 3 tree)
- Phase C combat: Basic / Core / Advanced ability tiers, Momentum (cap 3,
  spend to bypass cooldown), per-weapon Basic ability so no dead turns,
  same-ability-twice penalty
- Training dummy deals 0 damage; both player and dummy capped at 1 HP min
- Damage chips on both sides of the combat HUD
- Insights spending in combat: Hint (1), Reroll (2), Restore streak (3)
