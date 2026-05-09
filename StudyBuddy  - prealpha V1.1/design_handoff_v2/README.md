# Design Handoff v2 — Variant Library

This folder is the **menu** of design directions Claude Design has authored
for StudyBuddy. The original handoff lives next door at
`../design_handoff_studybuddy/`; this folder holds everything generated AFTER
that — extra variants, alternate lanes, screen-by-screen explorations.

## What's here

| Folder              | Contents                                                    |
|---------------------|-------------------------------------------------------------|
| `combat_variants/`  | Combat HUD variants A–K (5 saved as JSX, 6 still on canvas) |
| `world_variants/`   | World Hub variants A–G (4 in original handoff, 3 pending)   |

## Workflow

1. **Capture**: Claude Design produces variants on its canvas. Copy/paste the source into this folder so it's not stuck on the canvas.
2. **Pick**: User decides which variant to ship. Usually 1, sometimes 2 (one for desktop, one for mobile, or one as a runtime toggle).
3. **Port**: Cowork (me) lifts the chosen variant's JSX into the real production component in `studybuddy_src/build/`, mapping mock globals (`window.ENEMIES`, `window.SPR`, etc.) to real state.
4. **Verify**: `python build_html.py`, smoke-test, screenshot.

## Important

- **Do not try to ship every variant.** The variants are a menu, not features. The game ships ONE Combat HUD and ONE World Hub. If the user wants a runtime toggle, that's a separate decision and adds maintenance cost.
- **Sprites are not ported yet.** Every variant that calls `<window.Sprite>` will need the sprite system from `../design_handoff_studybuddy/sprites.jsx` ported into production OR an emoji fallback used. Production uses emoji today.
- **Production tokens are partly applied.** `studybuddy_src/build/head.html` already has the new tactical token block from `../design_handoff_studybuddy/tokens.css` but the old purple block is also still present — they live side-by-side until the per-screen reskin lands.
