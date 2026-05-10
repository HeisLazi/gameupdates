# World Hub Variants — Claude Design output

7 world-map directions exist on the design canvas (`World Map Variants.html`).
This folder holds the JSX source so the production port can reference real
component code rather than screenshots.

| ID | Name              | Lane                                    | Source file                |
|----|-------------------|-----------------------------------------|----------------------------|
| A  | Dojo / Street     | Selectable concept tiles per chapter    | `design_handoff_studybuddy/world-variants.jsx` (original) |
| B  | Concept Tiles     | Grid of selectable level concept cards  | `design_handoff_studybuddy/world-variants.jsx` (original) |
| C  | Elite List        | Stars + encounter list, top-down        | `design_handoff_studybuddy/world-variants.jsx` (original) |
| D  | Iso Climb         | Diagonal route to boss (also Cram)      | `design_handoff_studybuddy/world-variants.jsx` (original) |
| E  | **Hex Wargame**   | Hex tile grid, unit deployment overlay  | needs source paste         |
| F  | **Subway Diagram**| Stylized transit map, station = stage   | needs source paste         |
| G  | **Command Console**| Mission-control style world overview   | needs source paste         |

## Status

- A–D: live in the original handoff bundle at `design_handoff_studybuddy/world-variants.jsx`. Already on disk, already a porting candidate.
- E–G: source has not been pasted into this folder yet. Paste them as `world-variants-e-g.jsx` in this folder, mirroring how `combat_variants/combat-variants-g-k.jsx` is structured.

## Globals each variant likely expects

Same pattern as the combat variants — when porting, map these to the real production state:

| Variant global       | Production source                                          |
|----------------------|------------------------------------------------------------|
| `window.MODULE`      | current `mod` object from `app.jsx`                        |
| `window.WORLD`       | output of `genWorld(mod)` from `world.jsx`                 |
| `window.STATE`       | `state.arena` (bossesBeaten, mistakePool, etc.)            |
| `window.SPR`         | not yet ported — emoji palette per biome lives in `world.jsx` `BIOME_EMOJI_PALETTES` |

## Port plan

1. Pick the winning variant.
2. Lift its JSX into `studybuddy_src/build/world.jsx`, replacing the current `WorldView` render output. Keep all existing helpers untouched: `genWorld`, `masteryOfLevel`, `eliteUnlocked`, `bossUnlocked`, `biomePalette`, `PracticeSelect`.
3. Map the variant's globals to real production data (see table above).
4. Replace any `window.SPR` calls with the existing biome emoji palette per stage.
5. Wire onClick handlers to the existing `onPickFight({fight, mode, conceptFilter})` callback that ArenaView passes in.
