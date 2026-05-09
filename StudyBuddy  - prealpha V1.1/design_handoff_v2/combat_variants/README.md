# Combat HUD Variants — Claude Design output

11 combat HUD directions exist on the design canvas (`Combat Variants.html`).
This folder holds the JSX source so the production port can reference real
component code rather than screenshots.

| ID | Name              | Lane                                    | Source file              |
|----|-------------------|-----------------------------------------|--------------------------|
| A  | Tactical          | Original handoff baseline               | needs export from canvas |
| B  | Sleek             | Minimalist, fewer panels                | needs export from canvas |
| C  | XCOM              | Soldier readout, action grid            | needs export from canvas |
| D  | Library           | Bookish, serif type, study desk         | needs export from canvas |
| E  | Arcade            | Cabinet bezel, score chimes             | needs export from canvas |
| F  | Dossier           | Manila folder, classified stamps        | needs export from canvas |
| G  | **Mission Control** | NASA telemetry · oscilloscope monitors | combat-variants-g-k.jsx  |
| H  | **Terminal**      | Pure VT100/ANSI, all text                | combat-variants-g-k.jsx  |
| I  | **JRPG**          | Pokémon-style battle box + dialog menu   | combat-variants-g-k.jsx  |
| J  | **Fight Card**    | Boxing VS poster, oversized type         | combat-variants-g-k.jsx  |
| K  | **Notebook**      | Moleskine, sticky-note hotbar (on-brand) | combat-variants-g-k.jsx  |

## Globals each variant expects

These are provided by the design canvas wrapper. When porting to production,
each must be mapped to the real state shape from `studybuddy_src/build/`:

| Variant global       | Production source                                          |
|----------------------|------------------------------------------------------------|
| `window.ENEMIES`     | `state.arena.enemies` (multimob.jsx state shape)           |
| `window.ABILITIES`   | `ABILITIES` from `skills.jsx` + `caveman.jsx`              |
| `window.SPR`         | does not exist yet — emoji fallback in production for now  |
| `window.Sprite`      | sprite renderer from `design_handoff_studybuddy/sprites.jsx` (not yet ported) |

## Port plan

1. Pick the winning variant (or one primary + one toggle).
2. Lift its JSX into `studybuddy_src/build/combat.jsx`, replacing the current
   `CombatScreen` render output. Keep all the existing combat logic untouched.
3. Map the variant's globals to real state (see table above).
4. Replace `window.Sprite` calls with `<span>{enemy.emoji}</span>` until
   sprites are ported.
5. Replace mock answer options with real `q.choices` from the question.
6. Replace the static "×12 streak / 142 insight / NEUR-301" copy with real
   `state.streak.count`, `state.insights`, `mod.id`.
7. Wire onClick handlers to existing combat callbacks (`setTarget`,
   `selectAbility`, `submitAnswer`).

## Not in this folder

- A–F variants: still on the design canvas only. Export them the same way
  if we want them as porting candidates.
- Sprite system (`sprites.jsx`): lives in `design_handoff_studybuddy/`,
  not yet ported to production.
