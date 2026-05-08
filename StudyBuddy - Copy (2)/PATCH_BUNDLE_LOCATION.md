# Where the patch bundle lives

All Day 1 + Day 2 patch files are at:

```
C:\Users\lazar\Downloads\files\PATCH_BUNDLE\
```

Open that path directly in File Explorer (paste it in the address bar).

---

## What's in there

| File | What it is |
|---|---|
| `bonuses.jsx` | Augment effects + pet hooks + prestige perk readers + Memory Wraith spawner |
| `cram.jsx` | Cram Mode (10-min wave survival) |
| `skills.jsx` | All 24 weapon abilities + 40+ skill tree abilities + WEAPON_MASTERY_BONUSES + getCombinedStats |
| `caveman.jsx` | 7th weapon archetype (Caveman/Primal). Rampage hits all enemies. |
| `enemies.jsx` | ENEMY_ABILITIES + passives + generateEnemy + turn resolver |
| `multimob.jsx` | Multi-enemy state shape + targeting + MultiEnemyHUD + Cram wave V2 |
| `cram_mode_integration.md` | Day 1 wiring spec |
| `COMBAT_REWORK.md` | **Day 2 master integration spec — the doc to feed Cursor** |
| `app_jsx_patch.txt` | Patch for loadState / saveState (the original crash fix) |
| `extras_patched_section.txt` | Library fullscreen fix |
| `arena_css_additions.txt` | CSS for fullscreen overlay |
| `arena_jsx_wiring.txt` | 6 inline edits to plug augments + pets into combat |
| `APPLY_THIS.md` | Original crash-fix bundle |
| `README.md` | Bundle index + AI recommendations |

---

## To apply

1. Open `C:\Users\lazar\Downloads\files\PATCH_BUNDLE\` in File Explorer
2. Copy `bonuses.jsx`, `skills.jsx`, `caveman.jsx`, `cram.jsx`, `enemies.jsx`, `multimob.jsx` into `studybuddy_src/build/`
3. Open `COMBAT_REWORK.md` and follow the 10 steps (or paste it into Cursor)
4. `python3 build_html.py` from `studybuddy_src/`
5. Hard-refresh the rebuilt HTML

---

## If `Downloads\files\` doesn't exist on your machine

Reply and tell me the correct workspace folder you can see in File Explorer (the env says `Downloads\StudyBuddy` but if you have a different one for the project, give me that path) and I'll re-ship to that location.
