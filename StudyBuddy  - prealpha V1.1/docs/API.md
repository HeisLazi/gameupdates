# API — state shape & key functions

What to grep for when debugging. For the *why*, see `ARCHITECTURE.md`.

## Top-level state (`localStorage['studybuddy_v3']`)

```js
{
  // Spaced repetition (per question id)
  sr: { [questionId]: { ease, interval, due, lastRating, lastAt } },

  // Top-level progression
  xp: 0,
  streak: { last: 'YYYY-MM-DD' | null, count: 0 },
  daily: { [dateKey]: { ... } },
  pomodoro: { [dateKey]: <count> },
  seenConcepts: { [conceptId]: <timestamp> },
  insights: 0,
  library: { dayKey, secondsRead, insightsEarned },
  libraryPdfs: [{ id, name, moduleId, addedAt, size, type, dataUrl? }],

  // Custom user content
  customModules: [<Module>],
  customDeadlines: [{ event, date, module, type, notes }],
  examResults: [{ title, date, earned, total, pct }],

  // Lifetime stats (drive Stats-as-Buffs)
  stats: {
    totalCorrect, totalIncorrect, totalKills, totalFightsWon, totalFightsLost,
    totalReadingMs, totalDmgDealt, totalDmgTaken,
  },

  // Inventory + pet
  inventory: {
    fragments: [], consumables: [], passives: [], permBuffs: {},
    equipment: { [augmentId]: { id, quantity, discovered, upgradeLvl } },
    aura: null,
    shards: 0,                           // Forge currency
  },
  pet: <petId> | null,
  petXp: { [petId]: { xp, level } },

  // Prestige
  prestigeRank: 0,
  prestigePerk: <perkId> | null,
  prestigeTimes: { [<rank>]: <timestamp> },

  // Level-up rewards
  unlockedRewards: [{ id, type, stat, value, name, icon, desc }],
  pendingLevelUps: 0,
  lastSeenLevel: 0,

  // Bestiary (recorded per encountered enemy type)
  bestiary: {
    [<bestiaryKey>]: {
      name, emoji, tier, encounters, defeats, lastSeen,
      patterns: { [abilityId]: <count> },
      passives: [<passiveId>],
      mistakes: [<questionId>, ...]    // last 10
    }
  },

  // Forbidden Exchange history
  exchangeHistory: [{ offerId, at, corrupted? }],

  // Active mode + module
  currentModuleId: <moduleId>,
  appMode: 'normal' | 'arena' | null,    // null = show splash

  // Arena substate (see below)
  arena: <ArenaState>,
}
```

## Arena state (`state.arena`)

```js
{
  // Loadout
  equipped: 'blade' | 'hammer' | 'shield' | 'focus' | 'oracle' | 'vanguard' | 'caveman',
  weapons: { [weaponId]: { level, xp, unlocked } },
  unlockedSkills: [<treeAbilityId>],     // tree node ids
  hotbar: [<treeAbilityId> | null × 4],
  sockets: [<augmentId>, ...],           // 2 starter, scales 2→6 with player level
  spSpent: 0,

  // Per-module progress
  bossesBeaten: { [bossId]: true },
  runStats: { wins, losses },
  mistakePool: [<questionId>],           // recent wrong answers — drives Wraith spawns + Cram boss

  // Live combat (during a fight)
  enemies: [<Enemy>],                    // multi-mob array (replaces single `boss`)
  targetIndex: 0,                        // index in enemies[]
  statusEffects: { poisonStacks, antiHeal, confused, advancedLocked, forcedTarget, ... },

  // Cram / Blitz
  cram: {
    active, startedAt, durationMs,
    waveIndex, killCount, studyBreaksRemaining,
    studyBreakOpen, bossPhase, moduleId,
    bestKills, bestWaves,
    draftedAbilities: [<abilityId>],     // 3 picked at run start, +1 every 3 waves
    runMistakeIds: [<questionId>],       // missed THIS run; feeds boss pool
  },
}
```

## Module shape (`modules_all.json`)

See `MODULE_SCHEMA.md` for the full spec. Quick version:

```js
{
  id: 'NEUR301',                  // unique, used everywhere
  name: 'Neuroscience',
  examTemplate: { durationMin, totalMarks, composition: [{type, count, marks}] },
  levels: [{
    id, name,
    concepts: [{
      id, name, definition, notes, analogy?, breakdown?,
      questions: [{
        id, type, marks, prompt, answer,
        choices?, keywords?, code?, language?, starter?, expectedOutput?,
      }]
    }]
  }]
}
```

11 question types: `mcq, tf, define, explain, short_essay, long_essay, code_output, code_write, code_bug, code_fill, code_trace`.

## Key functions — where to grep

| Function                         | File                  | What it does                                              |
|----------------------------------|-----------------------|-----------------------------------------------------------|
| `loadState()` / `saveState()`    | `app.jsx`             | localStorage round-trip with field whitelist              |
| `defaultState()` / `defaultArenaState()` | `app.jsx`     | Initial shape; gate new fields here for old saves         |
| `normalizeArena(raw)`            | `app.jsx`             | Migrate old shapes (boss → enemies, etc.)                 |
| `levelFromXp(xp)`                | `app.jsx`             | Returns `{level, into, span}`                             |
| `renderNotes(md)`                | `app.jsx`             | Markdown-lite renderer (bold, code, lists)                |
| `runCode(lang, code)`            | `app.jsx`             | JS via `new Function`, Python via Pyodide                 |
| `getCombinedStats(state)`        | `skills.jsx` (+ wraps in `caveman.jsx` and `arena_runtime.jsx`) | Aggregates weapon + augments + tree + stat-buffs into one stats blob combat reads |
| `getAugmentBonuses(state)`       | `bonuses.jsx`         | Aggregates active augment effects                         |
| `getStatBuffs(stats)`            | `bonuses.jsx`         | Lifetime stats → permanent buffs                          |
| `petLevelFromXp(xp)`             | `bonuses.jsx`         | Pet level from XP, capped at 5                            |
| `petOnCorrect / petOnEnemyKilled / petOnTurnStart / petOnWrong / petOnStreakLoss / petOnLethal / petDamageMultiplier` | `bonuses.jsx` | Pet event hooks fired from `combat.jsx` |
| `generateEnemy(name, tier, level, opts)` | `enemies.jsx`  | Factory — picks 3-step pattern, rolls passives            |
| `resolveEnemyAction(enemy, state, allEnemies)` | `enemies.jsx` | Returns dmg/heal/effects + advances patternIndex      |
| `applyEnemyPassivesOnHit(enemy, dmg, ctx)` | `enemies.jsx` | Thorns, evasion, anti-magic, etc.                     |
| `routeDamageToTarget(state, dmg, ctx)` | `multimob.jsx`  | Apply player damage to current target                     |
| `runEnemyTurn(state)`            | `multimob.jsx`        | Iterate living enemies, resolve actions, return effects  |
| `getBiome(modId, mode)`          | `arena_runtime.jsx`   | Per-module biome lookup; boss fights override to Sanctum  |
| `dropLoot(raidType, biome)`      | `arena_runtime.jsx`   | Roll a drop based on tier table + biome bonus             |
| `forgeShardAugment / forgeCraftAugment / forgeUpgradeAugment` | `arena_runtime.jsx` | Forge economy ops |
| `applyExchangeOffer(state, offerId)` | `arena_runtime.jsx` | Forbidden Exchange — 1% data corruption chance         |
| `recordBestiaryEncounter / recordBestiaryMistake` | `arena_runtime.jsx` | Bestiary writes                            |
| `genWorld(mod)`                  | `world.jsx`           | Returns the per-module World shape (streets, elites, boss, practice) |
| `masteryOfLevel(state, level)`   | `world.jsx`           | Mastery fraction per level (gates Elite unlock)           |
| `eliteUnlocked / bossUnlocked`   | `world.jsx`           | Stage gating logic                                        |
| `buildInitialArenaFight(mod, boss, mode, levelId, skill, state, conceptFilter)` | `combat.jsx` | Spawn the right enemy lineup for the fight type |
| `defaultCramState()`             | `cram.jsx`            | Initial Blitz substate                                    |
| `getCramDraftPool / pickStudyBreakOptions` | `cram.jsx`  | Blitz ability pools                                       |
| `startCram / endCram`            | `cram.jsx`            | Lifecycle                                                 |

## State migrations to remember

When you add a new top-level field, gate reads with a fallback:

```js
state.arena?.cram || defaultCramState()
state.stats || { totalCorrect: 0, ... }
state.inventory?.shards || 0
```

And add the field to the whitelist in `saveState()` — fields not on the whitelist are dropped on save.

## Hard constraints (don't break)

1. Single HTML output. No bundler.
2. No duplicate top-level declarations across spliced files (const / function / let).
3. Splice point: helpers go AFTER `const { useState, useEffect, useMemo, useRef } = React;`.
4. State updates from `setTimeout` / async must use functional form: `setState(s => ({...s, ...}))`.
5. PDFs in IndexedDB, not localStorage.
6. No external scripts beyond Pyodide.
