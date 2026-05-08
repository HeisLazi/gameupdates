# Study Buddy — Game Design Document v2.0
### Single-file Web Pixel-RPG that turns studying into combat
> Living document. Last updated 2026-05-03. Supersedes `studybuddy_src/StudyBuddy_GDD.md`.

---

## 0. HOW TO READ THIS DOC (FOR THE NEXT AI)

You are picking up a project mid-build. Read sections **1 → 4** to understand vision and architecture, then **5 → 9** for the systems already shipped, then **10 → 12** for what's still owed and how to ship it. Section **13** is the pure handoff cheat-sheet — file paths, splice order, common breakage. If you only have time for one section, read **13**.

The user codes in plain English and ships patches as `.jsx` files that get spliced into a single `StudyBuddy.html` artifact. There is no bundler, no node_modules, no server. Babel-standalone compiles JSX in the browser. State lives in localStorage (`studybuddy_v3`) plus IndexedDB (`studybuddy_pdf_store_v1`) for PDFs.

---

## 1. CONCEPT PITCH

> **You are a scholar in a dying academy. Knowledge is power — literally. Every correct answer is a sword strike, every wrong answer takes HP. The smarter you study, the harder you hit.**

Study Buddy fuses a spaced-repetition study tool with a deckbuilder/roguelite combat layer. You upload your real course modules (JSON), the app generates flashcards / MCQs / code questions from them, and you fight enemies whose attacks are gated behind those questions. Mastery per concept feeds the question pool — weak concepts haunt you as harder enemies.

### Core loop
```
Read concept → Answer questions → Earn XP / Insights / Drops
       ↓                                  ↓
   Mastery tracked        →    Equip Weapon + Augments + Pet + Skill tree
       ↓                                  ↓
   Enter World / Cram / Raid   →   Multi-mob combat with intent telegraphs
       ↓                                  ↓
   Defeat boss → unlock next world / new augments / prestige
```

### Two top-level modes
- **Study Mode** — calm, notes-first, exam practice. Same questions, no danger.
- **Arena Mode** — gamified combat. Same questions, real stakes (HP, drops, prestige).

The user toggles between them on the splash screen.

---

## 2. PILLARS

| Pillar | Meaning | Hard rule it imposes |
|---|---|---|
| **Learning First** | Content shown before testing. | Concept notes always render before recall. Study Mode never punishes. |
| **Consequence** | Wrong answers cost HP, momentum, sometimes drops. | Arena fights have HP bar. Cram has timer + permadeath wave. |
| **Momentum** | Streaks, combos, evolving builds. | Streak fuels ability tiers (basic→core→advanced→elite). |
| **Player Identity** | The build (weapon + augments + pet + tree + pets) feels yours. | 7 weapons, 30+ augments, skill tree, prestige perks all stack. |
| **Pixel Charm** | Retro UI keeps it feeling like a game, not Anki. | Emoji + ASCII-edge UI, juicy combat chips, no enterprise SaaS feel. |

---

## 3. CURRENT STATUS — WHAT EXISTS RIGHT NOW

Use this table as ground truth before writing new code.

| Feature | Status | Files | Notes |
|---|---|---|---|
| Study Mode (notes → recall → mastery) | ✅ Shipped | `app.jsx` | Read-then-recall flow. Spaced rep keyed on `concept.id`. |
| Exam Mode (timed, mixed types) | ✅ Shipped | `app.jsx` | All 11 question types. Star rating. |
| Module JSON loader | ✅ Shipped | `app.jsx` (head) | Reads inline `<script id="modules-data">`. Schema in `MODULE_SCHEMA.md`. |
| In-browser code runner | ✅ Shipped | `app.jsx` | JS via eval, Python via Pyodide CDN. |
| World Flow (Dojo→Practice→Street→Elite→Boss) | ✅ Shipped | `world.jsx`, `arena_views.jsx` | Per module. |
| Weapons (7 incl. Caveman) | ✅ Shipped | `skills.jsx`, `caveman.jsx` | Blade, Hammer, Shield, Focus, Oracle, Vanguard, Caveman Club. |
| Skill Tree (~20 nodes) | ✅ Shipped | `skills.jsx` | SP economy, passives + actives. Passives auto-active without hotbar. |
| 5-slot Hotbar (2 weapon + 3 tree) | ✅ Shipped | `combat.jsx` | Keyboard 1-9 selects ability mid-question. |
| Library + PDF storage (IndexedDB blobs) | ✅ Shipped | `extras.jsx`, `app.jsx` | Per-module tagging. Folder import on Chrome/Edge. |
| Insights economy (read 5min → 1 insight, daily cap) | ✅ Shipped | `extras.jsx` | Spend in combat: Hint(1), Reroll(2), Restore Streak(3). Biome `insightDiscount` applies. |
| **Cram Mode** (10-min wave survival) | ✅ Shipped | `cram.jsx` | Real-time timer. Study breaks every 3 waves. 3× XP, 0.5× HP. Legendary augments only drop here. **Day 11 will rework into ability-draft format.** |
| **Augments** (30+ entries) | ✅ Shipped | `arena_runtime.jsx` | `LOOT_TABLE` registry, `LOOT_TIERS` drop pools, `dropLoot()` wired into `finishCombat`. |
| **Augment Codex** (per-augment desc + tier glow) | ✅ Shipped | `arena_views.jsx` | Full-detail card grid in Librarian view. Locked entries readable. |
| **Post-fight loot screen** (NEW badges, tier glow) | ✅ Shipped | `combat.jsx` ResultScreen | Bouncy drop-in animation, legendary/mythic shimmer. |
| **Sockets** (2→6 progression) | ✅ Shipped | `arena_views.jsx` ArmoryView | +1 socket per 5 player levels, hard cap 6. Each slot inline-shows desc + remove. |
| **Pets** (7 in registry, all hooks wired) | ✅ Shipped | `bonuses.jsx`, `combat.jsx` | Hoot-ini, DRN-01, Buffer, Cachey, Syntax, Debuggy, Pointer. PetSanctuaryView in arena nav. In-combat pet HUD strip. **Day 13 adds pet XP/levels.** |
| **Biomes** (11 in registry) | ✅ Shipped | `arena_runtime.jsx`, `arena.css` | Per-biome palette swap via `--biome-tint`/`--biome-accent` CSS custom props. Modifier chips in banner (good/bad toned). `boss_sanctum` auto-applies on boss fights. |
| **Multi-mob combat** | ✅ Shipped | `multimob.jsx`, `combat.jsx` | `buildInitialArenaFight` spawns 1-3 minions for street, 1 elite + 1-2 minion adds for elite. Intent badge on each enemy card. |
| **Enemy abilities + passives** (30 abilities, 18 passives) | ✅ Shipped | `enemies.jsx` | Tiered minion/elite/boss pools. Intent telegraphed each turn. Resolver applies effects (poison, summon, halve_hp, etc). **Day 10 adds hover-tooltip with `desc`.** |
| **Caveman archetype** (7th weapon) | ✅ Shipped | `caveman.jsx` | Berserker. `Rampage` is the only `hitsAll:true` ability — direct synergy with multi-mob. |
| **Raids** (4-phase boss chains) | ✅ Shipped | `raids.jsx` | 3 raid types (logic_singularity / malware_hive / corrupted_professor). RaidHubView + RaidView. Full clear drops relic + bonus mythic. |
| **Ability selection UX** (locked-in banner, kbd shortcuts, dmg preview) | ✅ Shipped | `combat.jsx`, `arena.css` | Press 1-9 to swap. Selected card glows + checkmark. Same-twice warning amber. |
| Forge (craft / upgrade augments) | ❌ Day 6 | — | UI + recipe system. Bundled with level-up rewards + Passives tab. |
| Level-up choice rewards (passives / stats / abilities) | ❌ Day 6 | — | Modal fires on level transition. 3 picks per level. |
| Passives tab (read-only view of all active passives) | ❌ Day 6 | — | Mirrors Skill Tree but filtered to currently-active passives. |
| Forbidden Exchange (risk-reward shop) | ❌ Day 7 | — | Trade HP / streak / mastery for power. |
| Pet XP system + 5-level progression | ❌ Day 7 | — | Pets level via fights and arena daily plan. |
| Stats-as-buffs (lifetime stats grant gameplay bonuses) | ❌ Day 7 | — | E.g. 100 lifetime correct = +1 max HP. |
| Prestige Perks | ❌ Day 8+ | — | Post-game meta progression. |
| Tutorial module + 4 stock modules | ❌ Day 9 | — | Tutorial teaches the game. Maths / English / Science / CS as stock content. |
| Enemy intent hover tooltip + chapter numbers | ❌ Day 10 | — | `desc` on all `ENEMY_ABILITIES`. Per-fight thematic emoji + Chapter 1.1, 1.2, 1-Elite, 1-Boss. |
| Cram rework (3-ability draft → +1/3 waves → wave-10/10-min boss) | ❌ Day 11 | `cram.jsx` | Boss draws 70% from `arena.mistakePool`, 30% exam pool. |
| Calendar deadlines + grade calculator + practice menu | ❌ Day 12 | `app.jsx` | Month grid, urgency ramp, weighted-input calculator, full-page concept picker. |
| Arena Daily Plan (mirrors Study daily, feeds pet XP) | ❌ Day 13 | — | Quick-grasp helper + pet XP source. |
| Mobile responsive pass | ❌ Day 14 | `arena.css`, `head.html` | Vertical combat HUD, swipe targeting, 44px touch targets. |
| AI Tutor — companion (BYOK summarize / generate questions) | ❌ Day 15 | — | Anthropic / OpenAI provider abstraction. Diff-preview before JSON edits. |
| AI Tutor — final boss (uses your mistakes + counters playstyle) | ❌ Day 16 | — | Post-prestige boss. Reads last 50 fight logs. |
| Story Mode | ❌ Day 17 | — | Cutscenes wrap world flow. Pulls from `LORE_DATA`. |
| Co-op Raids (WebRTC P2P) | ❌ Day 18 | — | Shared HP, alternating questions. Single CDN script (PeerJS). |
| Final polish + monetization | ❌ Day 19 | — | Free vs paid tier gating. Stripe + Cloudflare Worker auth shell. |

---

## 4. ARCHITECTURE & BUILD PIPELINE

### 4.1 File layout (the only paths that matter)

```
C:\Users\lazar\Downloads\StudyBuddy\
├── StudyBuddy.html              ← built artifact, what the user opens
├── modules_all.json             ← all course content (8 modules)
├── deadlines.json               ← assignment due dates
├── grades.json                  ← grade tracking
├── MODULE_SCHEMA.md             ← JSON shape for modules
├── PATCH_BUNDLE_LOCATION.md     ← cross-machine patch dropbox info
├── PATCH_BUNDLE/                ← user-accessible copies of helper jsx
│   ├── bonuses.jsx
│   ├── caveman.jsx
│   ├── cram.jsx
│   ├── enemies.jsx
│   ├── multimob.jsx
│   └── skills.jsx
└── studybuddy_src/
    ├── README.md
    ├── StudyBuddy_GDD.md        ← the OLD gdd (this v2 supersedes it)
    ├── MODULE_SCHEMA.md
    ├── build_html.py            ← splices everything into StudyBuddy.html (writes to BOTH studybuddy_src/ AND parent)
    └── build/
        ├── head.html            ← <head>, base CSS, JSON <script> tags
        ├── arena.css            ← combat / library / world / biome / pet / raid styles
        ├── app.jsx              ← React mount + Study/Exam screens + state shell + render error catcher
        ├── extras.jsx           ← Splash + Library + Insights helpers + Prestige consts
        ├── world.jsx            ← World view + Insights panel + Practice picker
        ├── bonuses.jsx          ← AUGMENT_EFFECTS, PET_REGISTRY (7 pets), pet hooks, prestige flags
        ├── skills.jsx           ← TIER, ABILITIES, WEAPONS, TREE_ABILITIES, getCombinedStats
        ├── caveman.jsx          ← Caveman weapon (extends ABILITIES + WEAPONS, monkey-patches getCombinedStats)
        ├── enemies.jsx          ← ENEMY_ABILITIES (30), ENEMY_PASSIVES (18), generateEnemy, resolveEnemyAction
        ├── multimob.jsx         ← targetIndex helpers, runEnemyTurn, MultiEnemyHUD, generateCramWaveV2
        ├── cram.jsx             ← Cram Mode helpers (current — Day 11 reworks)
        ├── arena_runtime.jsx    ← LOOT_TABLE, LOOT_TIERS, BIOMES, getBiome, dropLoot, initArena, weapon helpers, biomeModifierChips
        ├── raids.jsx            ← RAID_DEFS, RAID_PHASES, RaidHubView, RaidView (4-phase chain wrapping CombatScreen)
        ├── combat.jsx           ← THE main CombatScreen + ResultScreen + buildInitialArenaFight
        └── arena_views.jsx      ← ArenaView, ArmoryView, SkillTreeView, HotbarView, LibrarianView, PetSanctuaryView
```

**Stale files removed in cleanup** (do not recreate): `arena.jsx`, `arena_constants.jsx`, `arena_part1.jsx`, `arena_part2.jsx`. Their contents live in `arena_runtime.jsx` / `combat.jsx` / `skills.jsx` now.

### 4.2 Build pipeline (`build_html.py`)

1. Reads `head.html`. Inlines `arena.css` into the `<style>` block.
2. Inlines `modules_all.json`, `deadlines.json`, `grades.json` into `<script type="application/json" id="...">` tags.
3. Concatenates JSX helper files in this fixed order:
   ```
   extras → world → bonuses → skills → caveman → enemies → multimob → cram → arena_runtime → raids → combat → arena_views
   ```
4. Splices the concatenated bundle into `app.jsx` **immediately after** the line:
   ```js
   const { useState, useEffect, useMemo, useRef } = React;
   ```
   (This avoids a Temporal Dead Zone error where helpers reference React before it's destructured.)
5. Output: writes self-contained HTML to BOTH `studybuddy_src/StudyBuddy.html` AND parent-folder `Downloads/StudyBuddy/StudyBuddy.html`. User can open either.

**Order rules that matter:**
- `skills.jsx` MUST come before `caveman.jsx` (caveman extends `ABILITIES`, `WEAPONS`, `WEAPON_MASTERY_BONUSES`).
- `enemies.jsx` MUST come before `multimob.jsx` (multimob calls `applyEnemyPassivesOnHit`, `resolveEnemyAction`, `onEnemyDeath`).
- `arena_runtime.jsx` MUST come before `raids.jsx` (raids reads `LOOT_TABLE`, `RAID_TYPES`, `RELIC_MAP`).
- `raids.jsx` and `combat.jsx` can come in any order relative to each other (function declarations are hoisted, JSX references resolve at render time), but `arena_views.jsx` MUST come last because it imports all UI components.

### 4.3 State shape (top-level shape in localStorage `studybuddy_v3`)

```js
{
  // Study side
  modules: { [moduleId]: { mastery: {[conceptId]: {ease, interval, dueAt}} } },
  examHistory: [...],
  insights: 0, insightsToday: 0, insightsTodayDate: 'YYYY-MM-DD',
  library: { pdfs: [{id, name, moduleId, addedAt, size}], readingMs: {...} },

  // Arena side
  arena: {
    // World
    moduleId, worldStage: 'dojo'|'practice'|'street'|'elite'|'boss',

    // Loadout
    equipped: 'blade'|'hammer'|...|'caveman',
    weapons: { [id]: {level, xp, unlocked} },     // 7 entries
    unlockedSkills: ['crit_chance', ...],         // tree node ids
    hotbar: [skillId|null x4],                    // 2 weapon + 2 tree (UI shows 5)
    sockets: ['silicon_skin','overclock_chip',...],// 2 starter, more from drops
    sp: number, spSpent: number,

    // Combat (live fight)
    enemies: [Enemy, ...],          // multi-mob array
    targetIndex: 0,                 // which one player is hitting
    statusEffects: { poisonStacks, antiHeal, confused, advancedLocked, forcedTarget, ... },
    momentum: 0, maxMomentum: 3,
    streak: { count, lastDelta },
    cooldowns: { [skillId]: turns },

    // Cram
    cram: { active, startedAt, durationMs, waveIndex, killCount, studyBreaksRemaining,
            studyBreakOpen, bossPhase, moduleId, bestKills, bestWaves },
  },

  // Inventory
  inventory: { equipment: { [augmentId]: {quantity} } },
  pet: 'pixel_owl'|'void_drone'|'data_slime'|null,

  // Prestige (planned)
  prestige: { tier: 0, perks: [] },
}
```

---

## 5. STUDY-SIDE SYSTEMS (already built — reference only)

### 5.1 Module / Level / Concept / Question
See `MODULE_SCHEMA.md` for the full shape. TL;DR: a Module has Levels, a Level has Concepts, a Concept has Questions. Questions are one of 11 types: `mcq, tf, define, explain, short_essay, long_essay, code_output, code_write, code_bug, code_fill, code_trace`.

### 5.2 Study Mode flow
1. Pick module → pick level → pick concept.
2. **Read** notes (markdown-lite renderer: bold, inline code, code blocks, bullets).
3. **Recall** — answer 1 recall + 1 understanding question. No HP loss. Wrong = retry, no XP.
4. **Mastery** updates per question via spaced rep (ease, interval). A concept reaches "mastered" when any question hits ≥ 7-day interval.

### 5.3 Exam Mode flow
1. App generates an exam from `examTemplate.composition` (e.g. 6 mcq + 4 tf + 3 explain).
2. Sequential, no immediate feedback.
3. Results screen shows per-question correctness + correct answers.
4. Star rating: <60% = 1★, 60–85% = 2★, ≥85% = 3★.
5. ≥60% on Exam unlocks the Boss node for that level on the World Map.

### 5.4 Library + Insights
- Drop PDFs in (or import a folder on Chrome/Edge). PDFs tagged by module.
- Reading time tracked per session. **Every 5 minutes of focused reading = +1 Insight.**
- Daily cap: 3 Insights/day. Balance cap: 10. Augments can lift these.
- Insights are the universal soft currency. Spent in combat:
  - **Hint** — 1 Insight, narrows MCQ.
  - **Reroll** — 2 Insights, swap question.
  - **Restore Streak** — 3 Insights, revive a broken streak.

---

## 6. ARENA-SIDE SYSTEMS (already built)

### 6.1 World Flow (per module)

```
DOJO ──► PRACTICE ──► STREET ──► ELITE ──► FINAL BOSS
 │          │           │          │           │
 │          │           │          │           └─ unlock next world
 │          │           │          └─ 1 elite + 1-2 minion adds (planned)
 │          │           └─ 1-3 minion fights
 │          └─ Single live fight, full questions
 └─ Training dummy. 0 dmg both sides. Try abilities risk-free.
```

### 6.2 Weapons (7)

| ID | Name | Class | atk/def | xpMul | Identity |
|---|---|---|---|---|---|
| `blade` | Syntax Blade | Sharp | +3/0 | 1.0 | Bread-and-butter. Bleeds, flurry on streak. |
| `hammer` | Logic Hammer | Heavy | +5/-2 | 0.9 | Chunky hits, self-damage on Reckless Swing. |
| `shield` | Bulwark Code | Defender | +1/+4 | 1.1 | Block, parry, counter. Tanky. |
| `focus` | Focus Crystal | Caster | +4/-1 | 1.0 | Burst damage, momentum sink. |
| `oracle` | Oracle Lens | Support | +2/+1 | 1.2 | Reveal, debuff cleanse, scry. |
| `vanguard` | Vanguard Banner | Hybrid | +3/+2 | 1.0 | Block + dmg buff stance switch. |
| `caveman` | Caveman Club | Primal | +5/-1 | 0.9 | Berserker. **Rampage hits ALL enemies.** Regen-tank. |

Each weapon has 4 abilities (basic / core / core / advanced) + 4 mastery bonuses at levels 3/5/7/10.

### 6.3 Ability Tiers (`TIER` constant in `arena_constants.jsx`)

| Tier | Min Streak | Cooldown | Color | Notes |
|---|---|---|---|---|
| `basic` | 0 | 0 | grey | Always available. No dead turns. |
| `core` | 2 | 1 | blue | First real spell. |
| `advanced` | 4 | 2 | purple | Combo payoff. |
| `elite` | 6 | 3 | gold | Reserved for future weapon ult / raid mechanics. |

**Same-ability-twice penalty**: cast the same skill twice in a row → -50% effect on the second cast.
**Momentum**: capped at 3, spent (1 momentum) to bypass any cooldown.

### 6.4 Skill Tree
~20 nodes spread across passives and actives. Examples:

| Node | Cost | Effect |
|---|---|---|
| Critical Strike | 2 | 25% chance to deal 2× on Attack. |
| Iron Will | 3 | Survive a lethal hit at 1 HP — once per fight. |
| Echo Recall | 3 | +5 XP per correct on a concept already seen this fight. |
| Polymath | 5 | 10% any-hit double dmg, +5% crit. |
| Second Wind (active) | 4 | Heal 20 HP, 3-turn CD. |
| Rally (active) | 5 | Reset all CDs + 3 streak, 4-turn CD. |
| Open Notes (active) | 6 | Eliminate 2 wrong answers, streak 4 req. |

Full list in `arena_constants.jsx` → `ABILITIES` (filter by `source:'tree'`).

### 6.5 Augments (15 shipped, expand to 30)

```
STARTER (auto-equipped)
  silicon_skin     +20 maxHp
  overclock_chip   +10% dmg

RARE (street/elite drops — drops NOT wired yet)
  firewall_dll     5 block/turn
  grounding_wire   -50% biome dmg
  scholar_eye      reveal enemy hp
  anti_virus       immune poison + amnesia
  reinforced_grip  +15 block on Basic abilities
  thorned_pommel   20% thorns

EPIC
  buffer_overflow  cap any single hit at 10
  insight_loop     20% chance Insight refunds
  momentum_battery +1 max momentum
  data_miner       +25% xp

LEGENDARY (Cram-only drops — wired)
  capacitor_404      hp cap 10, +100% dmg
  proctor_lens       highlight correct answer
  god_mode_exe       revive at 1 HP once
  silver_bullet      first hit deals 100% maxHp dmg
  overflowing_chalice uncapped insights
```

`getAugmentBonuses(state)` aggregates effects. `getCombinedStats(state)` rolls these into a single stats blob the combat code reads.

### 6.6 Pets (7 shipped — full hook wiring)

`PET_REGISTRY` lives in `bonuses.jsx`. All 7 pets fire actual combat hooks; once-per-fight pets are tracked via `useRef` in `combat.jsx` so they don't re-trigger on re-render.

| Pet | Tier | Trigger | Effect |
|---|---|---|---|
| Hoot-ini (🦉) | common | spend Insight (1× / fight) | reveals correct answer + hides 3 wrong (instead of 2) |
| DRN-01 (🛸) | common | turn start while ≤ 50% HP | +10 block |
| Buffer (🧪) | common | every 3rd correct answer | +10 HP heal |
| Cachey (🐈) | rare | enemy killed | +1 Insight (cap respected) |
| Syntax (🦊) | rare | combo stack | +5% damage per combo (max +25%); -5 HP on streak loss |
| Debuggy (🪲) | epic | wrong answer (1× / fight) | next answer auto-revealed |
| Pointer (🐕) | legendary | lethal damage (1× / fight) | survives at 1 HP |

Hooks fire from `combat.jsx`: `petOnCorrect`, `petOnEnemyKilled`, `petOnTurnStart`, `petOnWrong`, `petOnStreakLoss`, `petOnLethal`, `petDamageMultiplier`, `petShouldHighlightOnInsight`.

UI: in-combat pet companion strip below biome banner shows pet icon (bobbing) + last 2 trigger messages live. Sanctuary view in arena nav for bond/release.

### 6.7 Biomes (11 shipped — palette + modifiers)

`BIOMES` lives in `arena_runtime.jsx`. `getBiome(modId, mode)` returns a biome object; **boss fights auto-promote to `boss_sanctum`** regardless of module.

| Biome | Icon | Key modifiers |
|---|---|---|
| Server Room | 🖥️ | Skills -1 CD, DOT 2/turn |
| Library | 📚 | Insight cost -50%, Boss HP +20% |
| Cyberpunk | 🌆 | +15% active-ability dmg, +1 momentum/turn, Boss HP +5% |
| Cathedral | ⛪ | +25% crit dmg, harsher streak loss, Boss HP +10% |
| Wasteland | 🏜️ | DOT 3/turn, +20% loot, +10% XP |
| Lab | 🧪 | Skills -1 CD, +15% XP |
| Boss Sanctum | 👑 | +30% Boss HP, +30% XP, +30% loot, +10% active dmg (auto on boss fights) |
| Foundry | 🔥 | +20% active dmg, heat hazard |
| Sky | 🌤️ | floating animation, intent occasionally hidden |
| Quarantine | ☣️ | Boss HP -15%, DOT 2/turn, heals -25% |
| Corridor | 🌀 | crit per unique-ability cycle |
| Deep Web | 🌐 | first-strike bonus, evasion ×1.3 |
| High-speed | ⚡ | Skills -2 CD, +1 momentum/turn |
| Abandoned | 🏚️ | +50% XP, slower combat |
| Void | 🌑 | enemy intent hidden until streak ≥ 3 |

Each biome owns a CSS class `biome-XXX` on the combat root. Per-biome palette swap uses CSS custom props `--biome-tint` and `--biome-accent` (banner border, icon glow, name color all bind to these). The combat banner shows live modifier chips: green-toned for buffs (`+15% XP`, `Skills -1 CD`), red-toned for hostile mods (`Boss HP +30%`, `DOT 3/turn`).

Combat math reads: `bossHpMult` (in `buildArenaEnemy`), `dotDamage` (per turn), `skillCooldownReduce`, `activeDmgBoost`, `momentumBoost`, `xpBonus` (in `finishCombat`), `lootBonus` (bonus drop roll), `insightDiscount` (InsightsPanel costs).

### 6.8 Raids (3 shipped — 4-phase chain)

`RAID_DEFS` lives in `raids.jsx`. Each raid is a chain of 4 `CombatScreen` instances. `RaidHubView` is the entry, `RaidView` drives the chain (advances on win, exits on forfeit/loss). Phase progress dots above each fight pulse on the active phase.

| Raid | Accent | Theme | Relic |
|---|---|---|---|
| Logic Singularity | blue | Self-rewriting algorithm. Mistakes punish more. | Neural Adapter |
| Malware Hive | green | Always-spawning swarm. AOE matters. | Bio Upgrade |
| Corrupted Professor | red | 1v1 streak-management pressure. | Shadow Badge |

Phases: **Setup → Pressure → Burn → Death**. Per-phase modifiers (`hpMul`, `dmgMul`, `dotPerTurn`, `addCount`) scale up per phase. Full clear awards the relic + 1 random Mythic augment.

---

## 7. CRAM MODE (Day 1 — shipped)

**The Night Before**. Real-time wave survival.

| Setting | Value |
|---|---|
| Duration | 10 min real time |
| Player HP | 0.5× normal |
| XP gain | 3× normal |
| Wave cadence | new wave on full clear |
| Study break | every 3rd wave — pick 1 of 3 random tree skills, free unlock |
| Boss phase | spawns when timer hits 0 — kill it for run reward |
| Reward | only place legendary augments drop |

Wave generator (`generateCramWave`):
- Waves 0–2: 1× minion (HP 25)
- Waves 3–5: 2× elite-lite (HP 45)
- Waves 6+: 3× elite (HP 70)
- HP scales +3 per wave index.

`generateCramWaveV2` (in `multimob.jsx`) is the upgraded version that pulls from `enemies.jsx` ability pools — use this for any new spawn logic.

---

## 8. MULTI-MOB COMBAT (Day 2 — wiring)

State changes:
- `state.arena.boss` (single) → `state.arena.enemies[]` (array).
- Added `state.arena.targetIndex`, `state.arena.statusEffects`.

Helpers in `multimob.jsx`:
- `getCurrentTarget(state)` — returns enemy under targetIndex or first living.
- `setTarget(state, setState, idx)` — switch focus, no-op on dead.
- `retargetAfterKill(state, setState)` — auto-pick lowest-hp living enemy.
- `routeDamageToTarget(state, dmg, ctx)` — applies passives, block, thorns; returns `{newEnemies, killed, reflected, log}`.
- `runEnemyTurn(state, setState, ctx)` — iterates living enemies, resolves their telegraphed action (set last turn).
- `MultiEnemyHUD` — renders enemy cards with HP, intent badge, status icons. Click to target.
- `applyEndOfPlayerTurnEffects` — ticks poison, anti-heal expiry, etc.

**Pending wiring (high priority next session):**
1. `buildInitialArenaFight()` in `combat.jsx` line ~65 — currently spawns ONE enemy for street/elite. Patch to:
   - **Street**: 1–3 minions from `ENEMY_ABILITIES` minion pool.
   - **Elite**: 1 elite + 1–2 minion adds.
   - **Boss**: single boss for now (raids later).
2. The enemy render block at `combat.jsx` line ~412 (`{enemies.map((e,i)=> e.hp > 0 && (`) needs the **intent badge** showing `ENEMY_ABILITIES[e.pattern[e.patternIndex % e.pattern.length]]` — name + icon, color-coded by `intent` (heavy_dmg=red, defend=blue, debuff=purple, etc.).

---

## 9. ENEMY SYSTEM (Day 2 — shipped)

`enemies.jsx` defines:

### 9.1 `ENEMY_ABILITIES` — 30 entries across 3 tiers
- **Minion (10)**: scratch, bite, hunker_down, distract, pickpocket, poison_dart, kamikaze, cower, leech, taunt
- **Elite (10)**: cleave, siphon, rallying_cry, confuse, amnesia, brain_fog, group_barrier, enrage, vampiric_strike, sabotage
- **Boss (10)**: charging_up, exam_failure, call_backup, summon_proctor, mental_blank, mind_control, rewrite_rules, exam_stress, time_warp, ultimatum

Each ability has: `id, name, icon, intent, tier, getDmg(lvl), [getBlock, getHeal, effect, spawnTier, spawnCount]`.

### 9.2 `ENEMY_PASSIVES` — 18 entries
Examples: `passive_swarm` (+2 dmg per ally), `passive_thorns` (20% reflect), `passive_explosive` (death damage), `passive_regenerator` (+5 HP/turn), `passive_anti_magic` (-50% tree damage).

### 9.3 Factory: `generateEnemy(name, tier, level, opts)`
Picks a 3-step `pattern` from the tier pool, optionally rolls 1 passive, sets HP/dmg/block, returns enemy object.

### 9.4 Resolver: `resolveEnemyAction(enemy, ctx)`
Returns `{dmg, block, heal, effect, log, mutations}` and advances `patternIndex`. Effects (poison, halve_hp, reset_streak, summon, etc.) are handled by `runEnemyTurn` in `multimob.jsx`.

### 9.5 Death hook: `onEnemyDeath(enemy, state, setState, log)`
Triggers: explosive (10 dmg), coward (no XP), drops (planned).

### 9.6 Spawn hook: `applySpawnTimePassives(enemy, allEnemies)`
Applies pack mentality (+5 maxHp per ally), barrier seeding, etc.

---

## 10. ROADMAP — WHAT TO BUILD NEXT (priority order)

The user's priority stack is **fixed**. Don't reorder without asking. Each day must be **shippable in isolation** — no day blocks on a future day.

### 10.1 Day 3 — Augment Registry + Drops + Loot Screen + Sockets ✅ DONE 2026-05-02

Shipped: 30+ augments in `LOOT_TABLE`, `LOOT_TIERS` drop pools wired into `dropLoot()`, post-fight ResultScreen with NEW badges + tier glow + bouncy drop animation, Augment Codex (full-detail card grid in Librarian), socket cap scales 2→6 (+1 per 5 player levels), `ArmoryView` shows full inline socket cards with descriptions.

### 10.2 Day 4 — Biomes ✅ DONE 2026-05-02

Shipped: 11 biomes in `BIOMES` registry, per-biome palette swap via `--biome-tint` / `--biome-accent` CSS custom props, modifier chips in combat banner (good/bad toned), `boss_sanctum` auto-applies on boss fights, `xpBonus`/`lootBonus`/`insightDiscount` wired into combat math, `biomeModifierChips()` helper for chip generation. Modules remapped to thematic biomes (RWE→cathedral, WEB→cyberpunk, OLD→wasteland, etc).

### 10.3 Day 5 — Raids + Pets Fix ✅ DONE 2026-05-02

Shipped: new `raids.jsx` with `RAID_DEFS` (3 raids), `RAID_PHASES` (Setup→Pressure→Burn→Death), `RaidHubView` + `RaidView` chains CombatScreens, full clear drops relic + bonus mythic, phase progress dots pulse on active phase, forfeit button. Pets system fully fixed: 7 pets in `PET_REGISTRY` (was 3), all 7 hooks wired in `combat.jsx` (`petOnCorrect`/`petOnEnemyKilled`/`petOnTurnStart`/`petOnWrong`/`petOnStreakLoss`/`petOnLethal`/`petDamageMultiplier`), once-per-fight pets tracked via `useRef`, new `PetSanctuaryView` in arena nav, in-combat pet HUD strip with live trigger messages.

### 10.4 Day 6 — Forge + Level-up Rewards + Passives Tab (NEXT)

**Goal**: Augment crafting/upgrading economy + a real level-up moment + a UI that surfaces what passives are actually firing.

**Tasks:**

1. **Forge subsystem** (in Librarian or new `ForgeView`):
   - Sharding: dismantle duplicate augment → N shards (tier-scaled: common 1, rare 3, epic 8, legendary 20, mythic 50).
   - Crafting: spend shards + Insights to roll a random augment of chosen rarity (cost rises per tier).
   - Upgrading: spend shards to bump an augment's effect by ~20% (capped at +60% total). Track per-augment upgrade level in `inventory.equipment[id].upgradeLvl`.
   - State shape: `state.inventory.shards: number`, `state.inventory.equipment[id].upgradeLvl: 0..3`.

2. **Level-up choice rewards (#14)** — fires when `levelFromXp(state.xp).level` increases:
   - Modal blocks combat exit until choice made.
   - 3 choices presented from a weighted reward pool: passive (tree node), stat (e.g. +5 max HP / +1 dmg / +1 momentum cap), or unlock (random augment). Reroll once via Insight.
   - Persists via new `state.unlockedRewards: []` array applied to `getCombinedStats`.

3. **Passives Tab (#10)** — new view in arena nav showing all currently-active passives:
   - Section 1: tree passives (auto-active, sourced from `arena.unlockedSkills`).
   - Section 2: socketed augment passives (from `arena.sockets`).
   - Section 3: pet passive (current bonded pet's hooks).
   - Section 4: prestige perk passive (when Day 8+ ships).
   - Each row shows source, effect summary, and a click-to-detail expander.

**Files**: new `ForgeView` component (in `arena_views.jsx` or new `forge.jsx`), `levelup.jsx` for the modal, `PassivesView` in `arena_views.jsx`. State migration in `app.jsx` `defaultState()` and `normalizeArena()`.

### 10.5 Day 7 — Forbidden Exchange + Pet XP + Stats-as-Buffs

**Goal**: One day for risk-reward economy + pet progression + lifetime-stats-become-buffs.

**Tasks:**

1. **Forbidden Exchange** — between-fights NPC view:
   - Offers like "lose 30 max HP forever, gain legendary augment", "reset one concept's mastery, gain permanent +2 momentum", "take 2 random debuffs into next fight, +200% drop rate".
   - 1% data-corruption chance per offer (dramatic, visible warning).
   - Reuses existing augment / mastery / inventory systems.

2. **Pet XP system (#13)**:
   - Each pet gains XP from: every fight participated in (+5), every kill while in combat (+2), arena daily plan completion (+30).
   - 5 pet levels. At each level, pet hook gets stronger (e.g. Buffer's heal: 10 → 12 → 15 → 18 → 22).
   - State: `state.petXp: { [petId]: { xp, level } }`.
   - UI: PetSanctuaryView shows XP bar per pet, level chip, next-level threshold.

3. **Stats-as-Buffs (#3)** — lifetime stats grant gameplay bonuses:
   - `state.stats: { totalCorrect, totalKills, totalRunsCompleted, totalReadingMs, ... }` accumulated forever.
   - Tier thresholds: e.g. 100 lifetime correct = +1 max HP (cap at +20), 500 lifetime kills = +2 dmg, 1hr lifetime reading = +1 insight cap.
   - Stats panel in `<Stats/>` view shows progression bars to next buff.
   - Buffs flow through `getCombinedStats()` so combat reads them automatically.

**Files**: `exchange.jsx` (new), `bonuses.jsx` (pet XP hooks), `app.jsx` (`<Stats/>` view rewrite), `getCombinedStats` extension.

### 10.6 Day 8+ — Prestige Perks

**Goal**: Post-clear meta loop. Reset weapon levels + augments, keep mastery + 1 prestige perk per tier.

After clearing all modules' final bosses: **Prestige** unlocks. Each prestige tier:

- Resets: weapon XP, augment inventory, sockets, hotbar, SP, level, XP.
- Keeps: module mastery, library PDFs, lifetime stats (Day 7), pet XP (Day 7), all unlocked content (codex, lore).
- Awards: 1 perk slot. Up to 5 prestige tiers max.

Perks: `+5% xp permanently`, `start with 1 random rare augment`, `open with 1 momentum`, `Insight cap +5`, `+5% crit chance`, `pet XP earnings ×2`.

State: `state.prestigeRank: 0..5`, `state.prestigePerk: 'perk_id' | null` (single slot, tier 1 starts simple).

### 10.7 Day 9 — Module Library Expansion (#1)

**Goal**: Replace the mostly-empty `BUILTIN` modules array with a real curriculum + a tutorial that teaches the game itself.

**Tasks:**

1. **Tutorial module** (`tutorial_module` in `modules_all.json`) — first-run forces splash → tutorial:
   - 3 levels: "The Notes", "Combat Basics", "Building Your Build" — each level's concepts double as game tutorials (e.g. "Streaks", "Momentum", "Targeting", "Sockets").
   - Questions explain the game UI; correct answers unlock concept "skills" the player actually needs.
   - Marks `state.tutorialDone: true` on completion.

2. **Stock module pack**:
   - `Basic Maths` — arithmetic, fractions, basic algebra, geometry. ~5 levels, ~25 concepts.
   - `English` — vocabulary, grammar, reading comprehension, basic essay structure.
   - `Science` — scientific method, basic physics/biology/chemistry concepts.
   - `Computer Science` — variables, loops, conditionals, basic data structures, big-O intro.
   - Each gets `examTemplate.composition` for exam mode.

3. **Module picker upgrade** — group modules by tag (Stock / Custom / Tutorial), search bar, current-mastery preview chip per module.

**Files**: `modules_all.json` (content), `app.jsx` topbar `<select>` (group by tag), splash screen first-run check.

### 10.8 Day 10 — Combat Visuals Polish (#2 + #4)

**Goal**: Make combat feel readable at a glance.

**Tasks:**

1. **Enemy intent hover tooltip (#2)**:
   - Add `desc` field to all 30 entries in `ENEMY_ABILITIES` (e.g. `mob_scratch.desc: 'Light slash for ' + lvl + 1 + ' damage. Pure pressure.'`).
   - In `combat.jsx` multi-enemy HUD card and main HUD intent badge, wrap intent in a span with `title={desc}` (browser-native tooltip for desktop). Day 14 mobile pass replaces with custom tooltip.
   - Add intent legend chip at top of fight: tiny color key (heavy=red, defend=blue, etc).

2. **Per-fight thematic emoji + chapter numbers (#4)**:
   - `genWorld()` in `world.jsx` stops hard-coding `🥊` / `⭐`.
   - Streets in a module get sequenced chapter labels: "Chapter 1.1 · Hallway", "Chapter 1.2 · Stairwell", "Chapter 1.3 · Library Aisle". Emojis vary by biome (e.g. cyberpunk: 🌃 🛵 🍜, library: 📚 🪑 🕯️, lab: 🧪 ⚗️ 🔬).
   - Elites become "Chapter 1-Elite · The Lecturer" with stronger thematic emoji per biome.
   - Bosses: "Chapter 1-Boss · Final Exam". Already-themed; just rename consistently.
   - World view updates to show chapter labels above each fight card.

**Files**: `enemies.jsx` (desc fields), `combat.jsx` (tooltip wrapping), `world.jsx` (genWorld + chapter label), `arena_views.jsx` WorldView render.

### 10.9 Day 11 — Cram Rework (#5)

**Goal**: Make Cram feel like its own game mode, not just "fast Arena".

**New Cram flow:**

1. **Pick 3 starting abilities** at run start (drafted from `arena.unlockedSkills` — if you have <3 unlocked, fill from basic tree pool).
2. **Hotbar starts with these 3 only**, plus weapon basic. No augments swap mid-run.
3. **Every 3 waves cleared**: pick 1 of 3 random tree abilities to add. By wave 9: 6 abilities total.
4. **Boss spawns ONLY** at wave 10 OR 10:00 elapsed — whichever comes first. **No early-skip button** (current design lets timer-skip; remove that).
5. **Boss question pool**: 70% drawn from `arena.mistakePool` (player's recent wrong answers), 30% drawn from current module's `examTemplate` pool. If `mistakePool` < 5 entries, fall back 100% to exam pool.
6. **Victory reward**: bigger XP (current 3× → 4×) + always 1 random Mythic augment (already done) + lore unlock.

**Files**: `cram.jsx` (full rewrite of `defaultCramState`, `generateCramWaveV2`, `pickStudyBreakOptions`, `awardCramVictory`). UI in `arena_views.jsx` `CramHub`.

### 10.10 Day 12 — Study-Side Polish (#6 + #9 + #12)

**Goal**: Bring the Study side up to the polish level the Arena side is at.

**Tasks:**

1. **Practice picker as full page (#6)**:
   - Currently a tiny dropdown in `world.jsx`. Becomes a dedicated route with concept cards: each card shows mastery bar, last-reviewed date, est question count, fight-time estimate.
   - Multi-select with bulk "select all weak", "select due", "select unread" actions.

2. **Calendar deadlines (#9)**:
   - Replace the flat list in `DeadlinesView` with a month-grid calendar (7 cols × 5-6 rows).
   - Today highlighted. Each cell shows up to 3 deadline chips.
   - Urgency border: <3 days red, <7 days amber, otherwise muted. Click cell to see full list.
   - Add/edit modals stay (current "add custom deadline" flow).

3. **Grade calculator (#12)**:
   - `GradesView` gets new "Calculator" tab.
   - Per module: input fields for each assessment (assignment 1, mid-term, final, etc.) with weight (% of total) shown.
   - User types marks, app projects current grade + best-case + worst-case scenarios.
   - State: `state.gradeInputs: { [moduleId]: { [componentId]: marks } }`.

**Files**: `app.jsx` `DeadlinesView` / `GradesView` rewrites, `world.jsx` `PracticeSelect` becomes `PracticePickerView`.

### 10.11 Day 13 — Arena Quality of Life

**Goal**: Mirror Study Mode's daily-plan idea on the Arena side, feeding pet XP.

**Tasks:**

1. **Arena Daily Plan** tab:
   - Daily reset at midnight local time. Shows 4 quick activities: 1 street fight, 1 elite, 1 practice, 1 review-of-mistakes mini-fight.
   - Completion grants XP, drops, AND pet XP (Day 7 dependency).
   - Tracks streak (consecutive daily plan completions = bonus pet XP).

2. **Quick-grasp helper**:
   - Side panel showing 3 random concepts you haven't reviewed in 3+ days. One-click "drill" launches a 5-question recall.

3. **Loadout presets** — save/load 2-3 build presets (weapon + sockets + hotbar + pet) for fast switching.

**Files**: `arena_views.jsx` new `ArenaDailyView`, state shape additions for `state.arenaDaily: { date, completed: {} }` and `state.loadoutPresets: []`.

### 10.12 Day 14 — Mobile Support (#7)

**Goal**: Ship on phones. Touch-first redesign of the Arena side; Study side already mostly works.

**Tasks:**

1. **Viewport + safe areas**: confirm `<meta name="viewport">` set, add `padding: env(safe-area-inset-*)`, prevent zoom on input focus.
2. **Combat HUD reflow** at <760px: enemies stack vertically, action grid 2-col instead of grid-3, inputs full-width.
3. **Touch-friendly selection**: 44px minimum tap target (current 32-36px). Replace tiny ✕/edit icons with bigger ones on small screens.
4. **Swipe-to-target** on multi-enemy fights — swipe left/right to cycle target.
5. **Bottom-sheet modals** for ability detail / pet detail (instead of centered modals that get covered by virtual keyboard).
6. **Tooltip replacement**: native `title` attr (Day 10) doesn't work on touch — build custom `<Tooltip>` component that supports tap-to-show / tap-elsewhere-to-dismiss.
7. **Top bar collapse**: chip stat bar becomes a hamburger drawer on small screens.

**Files**: `arena.css` (heavy media-query work), `head.html` (viewport meta), new `tooltip.jsx`, `combat.jsx` (swipe handler).

### 10.13 Day 15 — AI Tutor: Companion (#11 part 1)

**Goal**: BYOK LLM tutor that lives inside the app.

**Tasks:**

1. **Settings → API Key** panel:
   - Provider picker: Anthropic / OpenAI / local-Ollama.
   - Key stored in localStorage with a clear "this is unencrypted" warning.
   - Test-call button to verify key works.

2. **Tutor sidebar** (collapsible, in study and arena modes):
   - Context-aware: knows current concept / current fight / recent mistakes.
   - 3 actions: **Summarize concept** (writes summary to current concept's notes pane), **Generate questions** (proposes new questions, diff-preview, write to `state.customModules[modId]` only on confirm), **Chat** (free-form Q&A scoped to module content).

3. **Safety**:
   - JSON edits go through `aiProposeEdit(diff)` → preview UI → `aiAcceptEdit()`. Undo log keeps last 5 edits.
   - Never auto-saves over user content.
   - Rate-limit visible (e.g. "5 calls remaining today" if user wants a soft cap).

**Files**: new `ai_tutor.jsx` (provider abstraction, prompt templates, sidebar UI), `app.jsx` settings panel, state additions `state.ai: { provider, keyHash, lastEdits: [] }`.

### 10.14 Day 16 — AI Tutor: Final Boss (#11 part 2)

**Goal**: End-game post-prestige boss that learns from your playstyle.

**Mechanic:**

1. **Question pool**: 100% drawn from `arena.mistakePool` (lifetime weak answers, deduplicated and weighted by recency).
2. **Playstyle counter**: read last 50 fight logs from `state.fightHistory` (new field). Score on axes:
   - **crit-heavy** (high crit-chance augments + Focus/Oracle weapons) → boss gets `passive_anti_magic` + thorns
   - **block-heavy** (Shield/Vanguard, +block augments) → boss gets armor-pen abilities + multi-hit
   - **streak-heavy** (high combo dependence) → boss casts streak-reset abilities first
   - **mistake-prone** (high `mistakePool` density on certain types) → boss leans into those types
3. **Boss adapts mid-fight**: every 5 turns, AI tutor picks the next ability from a pool weighted toward "what hurt you most last turn".
4. **Reward**: unique mythic augment "Adversary's Mirror" (no other source) + lore unlock + prestige perk slot bonus.

**Files**: `ai_boss.jsx`, hooks into `combat.jsx` to log fight outcomes to `state.fightHistory: [{ won, modId, mistakes, weaponId, dmgDealt, dmgTaken }, ...]` (capped at last 100 fights).

### 10.15 Day 17 — Story Mode (#8 part 1)

**Goal**: Wrap the existing world flow with narrative beats. No new combat — purely narrative connective tissue.

**Tasks:**

1. **Cutscene system** (`cutscene.jsx`):
   - Rendered as full-screen overlay during world transitions.
   - Text + emoji portraits + click/tap to advance.
   - Animations CSS-only.

2. **Module intro/outro**: each module gets a 3-beat intro (before first concept) and a 3-beat outro (after final boss). Pulls from existing `LORE_DATA` + new module-specific lore entries.

3. **State**: `state.story.chapter: number`, `state.story.seenCutscenes: { [id]: true }`. Cutscenes don't replay unless user opts in via "Replay" in Library.

4. **Mode toggle**: splash gets 3 buttons now — Study / Arena / **Story**. Story mode is Arena flow + cutscenes; user can disable mid-run.

**Files**: new `cutscene.jsx`, `story.jsx` for chapter data, splash update in `extras.jsx`.

### 10.16 Day 18 — Co-op Raids (#8 part 2)

**Goal**: 2-player synchronous raids without a server.

**Approach:**

- **WebRTC P2P** via PeerJS (single CDN script, free signaling relay).
- Host shares a 6-char code; guest enters it; PeerConnection established.
- **State sync**: shared HP pool, shared enemy state, alternating questions (player A answers Q1, player B answers Q2, etc.). Each turn ends when current player answers.
- **Targeting**: both can click any enemy; last-clicker's choice wins.
- **Ability use**: each player has their own loadout; both visible to both clients.
- **Disconnect handling**: if peer drops mid-raid, host auto-takes over remaining slots (graceful single-player fallback).
- **Co-op-only difficulty**: new "Mythic Raid" tier with 6 phases (vs 4 in solo) and exclusive co-op rewards.

**Constraint reality check**: this is the day where the "no external scripts" pillar bends — PeerJS is one extra CDN script. Acceptable trade. Confirm with user before shipping.

**Files**: new `coop.jsx` (peer setup, state sync), `raids.jsx` extension for mythic tier, networking error UI.

### 10.17 Day 19 — Final Polish + Monetization

**Goal**: Make the game sellable. THE LAST DAY.

**Sub-tasks:**

1. **Bug bash sprint** — every TODO/`?? default` site reviewed; fix or doc as known limitation.
2. **Performance pass** — bundle size review, lazy module load if HTML > 1MB, IndexedDB pruning helper for old PDFs.
3. **Accessibility pass** — keyboard nav on every interactive, ARIA labels, color-contrast spot-check.
4. **Free vs paid feature split** (see §16 Monetization for detail):
   - **Free**: Tutorial + 2 stock modules (Maths, English), Study Mode, Arena world flow, basic Cram, single pet (Hoot-ini).
   - **Paid**: All stock modules + custom module imports + AI tutor + co-op + Mythic raids + all pets + cosmetic biome variants.
5. **Auth/payment shell**:
   - Stripe Customer Portal for subscription (monthly + yearly).
   - Cloudflare Worker exposes `POST /verify` returning a signed license token.
   - License token cached in `localStorage`, re-verified weekly.
   - Free trial: 7 days full access on first install (cookie + localStorage flag).
6. **Marketing surface**: simple landing page (separate file) explaining Study + Arena + Cram + AI tutor, pricing table, payment CTA.

The "single HTML output" pillar bends here — a thin auth shell wraps the unchanged build. No bundlers added; just one `<script>` for the license check.

**Files**: new `auth.jsx`, `landing.html` (separate marketing page), `worker.js` (Cloudflare Worker source, deployed externally).

---

## 11. UX / UI CONVENTIONS

- Topbar layout (not sidebar). Left: module picker. Center: mode tabs. Right: HUD (HP/XP/Insights/Pet).
- Pixel emoji for everything that needs an icon. No SVG icon font.
- Combat card layout: enemies along the top, player stats bottom-left, ability bar bottom-right.
- Damage chips (yellow → red → crit gold) float up on hit. Block chips are blue.
- Dark mode is the only mode. Palette in `arena.css` (variables under `:root`).
- All animations CSS-driven. No JS animation libs.
- **Tier color system** (shared across augments / loot / pets / sockets): `common` = grey, `rare` = blue, `epic` = purple, `legendary` = gold (with shimmer), `mythic` = red (with stronger shimmer), `raid_only` = green. Defined as `.tier-X` classes + glow rules.
- **Selection feedback**: any clickable card uses transform translateY(-1px) on hover, scale(0.96) on active, plus 2px accent border + glow + ✓ checkmark when selected.
- **Keyboard parity**: every primary action that takes a click should accept a keyboard equivalent (numbers 1-9 for ability picking is the established pattern).

### 11.1 Mobile-first additions (Day 14 work, document early)

- Minimum tap target 44×44px. Replace any tiny ✕/edit icons with bigger ones below 760px.
- Vertical reflow on combat HUD <760px — enemies stack, action grid 2-col.
- Native scroll momentum (no `overflow:hidden` on scroll containers).
- Custom `<Tooltip>` component (built Day 14) — `title` attr fallback works for desktop only.
- Modals become bottom sheets on small screens to avoid virtual-keyboard occlusion.

### 11.2 Calendar pattern (Day 12)

- Month grid: 7 columns × 5-6 rows. Today gets accent ring.
- Per-cell deadline chips: max 3 visible, "+N more" overflow.
- Urgency border ramp: `<3d` red, `<7d` amber, otherwise muted. Tied to `--err` / `--warn` / `--line` design tokens.
- Click cell → side-drawer with full deadline list for that day.

### 11.3 Tooltip pattern

- Phase 1 (now): browser-native `title` attr — works on desktop hover, ignored on touch.
- Phase 2 (Day 14): custom `<Tooltip content={...}>{children}</Tooltip>` — supports tap-to-show + tap-elsewhere-to-dismiss + focus-show for keyboard nav.

---

## 12. TECHNICAL CONSTRAINTS — DO NOT BREAK

1. **Single HTML output.** No bundlers, no node_modules. Babel-standalone in browser.
2. **Splice order matters.** Current canonical order: `extras → world → bonuses → skills → caveman → enemies → multimob → cram → arena_runtime → raids → combat → arena_views`. Rules: skills before caveman (caveman monkey-patches), enemies before multimob (multimob calls enemy resolvers), arena_runtime before raids (raids reads LOOT_TABLE), arena_views last (uses everything).
3. **Splice point**: helpers go IMMEDIATELY AFTER `const { useState, useEffect, useMemo, useRef } = React;` — splicing before throws "Cannot access 'React' before initialization" (TDZ).
4. **No duplicate top-level declarations** — applies equally to `const`, `function`, and `let`. Babel-standalone rejects them all. Before adding any new top-level helper, **grep every build file for the name first**. Past crashes: duplicate `levelFromXp`, duplicate `prestigeFlags` (in both `bonuses.jsx` and `arena_runtime.jsx`). Symptom of duplicate identifier: blank page, no React mount, console error `Identifier 'X' has already been declared`. Browser silently drops the entire `<script type="text/babel">` block.
5. **State updates must be functional** when called from setTimeout / async — `setState(s => ({...s, ...}))`, never `setState({...state, ...})` from inside a delayed callback.
6. **PDFs go through IndexedDB, not localStorage.** localStorage is too small. `savePdfBlob / loadPdfBlob / deletePdfBlob` in `app.jsx`.
7. **Splice marker:** `/* ============ APP SHELL ============ */` in `app.jsx` is what the splice script targets — don't move or delete it.
8. **No external scripts** beyond Pyodide CDN (already loaded). The exception is **Day 18 (Co-op)** which adds PeerJS — confirm with user before adding any other CDN load.
9. **Saves must survive schema additions.** When you add a state field, gate reads with `state.arena?.cram || defaultCramState()` style fallbacks. Never assume the field exists in old saves. New fields added in Days 6-19 (`shards`, `petXp`, `stats`, `gradeInputs`, `arenaDaily`, `loadoutPresets`, `ai`, `story`, `fightHistory`) all need defaults in `defaultState()` + `normalizeArena()`.
10. **Verifying a build before declaring it works** — run the extracted script through `@babel/standalone` in Node to catch duplicate identifiers. Static `@babel/parser` is too lenient (accepts duplicate function decls as ES script syntax) — only Babel's transform throws. Symptom of failure: blank page, no console output until devtools open.
11. **AI tutor key (Day 15+) — never persisted unencrypted in localStorage.** Show a clear warning in the Settings panel before storing. Consider hashing the key for the storage flag and re-prompting on each session.
12. **Co-op networking (Day 18) — single CDN script (PeerJS).** No server. Bail to single-player on signal failure. Never trust peer-sent state directly — validate everything against local rules.
13. **Monetization (Day 19) — license token re-verified weekly.** Don't gate UI on every render — cache the verification result. Free trial = 7 days from first install (cookie + localStorage flag, treated as advisory not security).

---

## 13. HANDOFF CHEAT-SHEET (READ-FIRST FOR NEXT AI)

### 13.1 The user's working style
- Wants direct file edits, not patch instructions. "Add them into the files yourself."
- Prefers terse output. Caveman-speak is fine ("Respond terse like smart caveman. All technical substance stay. Only fluff die.")
- Will say "ngl just get it running fam no output message needed" if you over-explain.
- Codes in plain English, drops `.jsx` files into `Downloads\StudyBuddy\PATCH_BUNDLE\`. The user's actual project lives at `Downloads\StudyBuddy\studybuddy_src\build\`.

### 13.2 Where things live (memorize this)
- **The CombatScreen lives in `combat.jsx`** — that's where 95% of combat logic is.
- **Raid wrapper lives in `raids.jsx`** — chains CombatScreens through 4 phases.
- `app.jsx` defines `loadState`, `saveState`, `defaultState`, `defaultArenaState`, `levelFromXp`, `normalizeArena`, `renderNotes`. Don't re-declare these elsewhere.
- `arena_runtime.jsx` defines `LOOT_TABLE`, `LOOT_TIERS`, `BIOMES`, `getBiome`, `dropLoot`, `initArena`, `getWeaponProgress`, `gainWeaponXp`, `weaponXpNeeded`, `biomeModifierChips`.
- `bonuses.jsx` defines `AUGMENT_EFFECTS`, `getAugmentBonuses`, `PET_REGISTRY` (7 pets), all pet hooks, `prestigeFlags` (do not redeclare).
- `skills.jsx` defines `TIER`, `ABILITIES`, `WEAPONS`, `TREE_ABILITIES`, `getCombinedStats` — caveman monkey-patches the last one.
- Splice marker for `build_html.py` is the line `const { useState, useEffect, useMemo, useRef } = React;` — helpers go right after it.
- The build writes to BOTH `studybuddy_src/StudyBuddy.html` and parent `Downloads/StudyBuddy/StudyBuddy.html` — no manual copy needed.

### 13.3 Stale files that no longer exist (do not recreate)
`arena.jsx`, `arena_constants.jsx`, `arena_part1.jsx`, `arena_part2.jsx`. Their contents are now split across `arena_runtime.jsx`, `combat.jsx`, `skills.jsx`. If a previous AI session refers to these paths, they're stale.

### 13.4 Common errors and fixes
| Error | Cause | Fix |
|---|---|---|
| `Identifier 'X' has already been declared` (blank page) | Two build files declare the same top-level `const`/`function`/`let`. | Grep all build files for the name. Delete the duplicate. Common past offenders: `levelFromXp`, `prestigeFlags`, `defaultArenaState`. |
| `Cannot access 'React' before initialization` | Helper spliced before `const {useState...} = React;`. | Splice point in `build_html.py` must remain AFTER that line. |
| `state.arena.enemies is undefined` after upgrade | Old save has `boss`, not `enemies`. | `normalizeArena()` in `app.jsx` should migrate boss→enemies on load. |
| Babel parse error mid-build | Stray smart quote, trailing comma, or unmatched brace in a helper jsx. | Find the helper that changed last; eyeball the diff. |
| Blank page, no console error visible | The `<script type="text/babel">` block silently dropped (parse error). | Open devtools Console BEFORE loading. Babel errors appear there. Or extract the script and run through `@babel/standalone` in Node. |
| ArmoryView socket buttons do nothing | `setState` not in the destructured props. | Pass `setState` from ArenaView to ArmoryView (already fixed Day 3). |

### 13.5 Build + verify loop
```bash
cd C:\Users\lazar\Downloads\StudyBuddy\studybuddy_src
python build_html.py
# open ../StudyBuddy.html OR studybuddy_src/StudyBuddy.html in Chrome
# → DevTools Console BEFORE loading the page (catches Babel parse errors)
```

Verify Babel-compile cleanly (Node):
```js
const Babel = require('@babel/standalone');
const html = require('fs').readFileSync('StudyBuddy.html', 'utf-8');
const m = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
Babel.transform(m[1], { presets: ['react'] }); // throws on dup identifiers
```

### 13.6 If the user hands you the GDD only (no codebase)
You can rebuild from the schema in `MODULE_SCHEMA.md` + the system specs in sections 5–9 + the file map in section 4.1. The roadmap (section 10) tells you what to ship next and in what order. The constraints (section 12) tell you what'll break the build.

---

## 14. APPENDIX — Question Type Quick Reference

| `type` | `answer` shape | Extras | Used for |
|---|---|---|---|
| `mcq` | string ∈ `choices` | `choices: []` | Default. |
| `tf` | boolean | — | Quick checks. |
| `define` | string | `keywords: []` | Recall. Fuzzy + keyword match. |
| `explain` | string | `keywords: []` | Understanding. |
| `short_essay` | string | `keywords: []` | Synthesis. |
| `long_essay` | string | `keywords: []` | Deep recall. |
| `code_output` | string | `code: ""` | "What does this print?" |
| `code_write` | string | `language, starter, expectedOutput` | Function-write. |
| `code_bug` | string | `code, keywords` | Bug-spotting. |
| `code_fill` | string | `code: "...___..."`, comma-separated answer | Fill-the-blank. |
| `code_trace` | string | `code, keywords` | Step-through trace. |

---

## 15. APPENDIX — Glossary

- **Module**: a course (e.g. ARI711S Artificial Intelligence).
- **Level**: a topic within a module (e.g. Search Algorithms).
- **Concept**: a teachable unit within a level (e.g. BFS).
- **Mastery**: 0–100 score per concept, drives boss question pool weighting.
- **Streak**: consecutive correct answers, gates ability tiers.
- **Momentum**: separate cap-3 currency, spent to bypass cooldowns.
- **Insight**: soft currency from reading time, spent on combat aids.
- **Augment**: passive equipment piece (15 → 30 planned).
- **Pet**: persistent companion with a single hook-fired effect.
- **Cram**: 10-min wave-survival mode. Only legendary drops.
- **World**: the per-module run sequence (Dojo → ... → Boss).
- **Arena**: top-level mode that contains all combat. Sibling of Study Mode.
- **SP**: skill points, spent on tree nodes.
- **Prestige**: post-clear meta reset, planned.
- **Shards**: post-Day-6 currency from sharding duplicate augments. Spent on Forge crafting/upgrading.
- **Pet XP**: post-Day-7. Each pet has its own XP track and 5 levels.
- **Stats-as-buffs**: post-Day-7. Lifetime stat thresholds (correct answers, kills, reading time) grant permanent gameplay bonuses through `getCombinedStats`.
- **Mistake Pool**: `state.arena.mistakePool` — rolling list of recently-wrong question IDs. Day 11 cram boss + Day 16 AI boss draw questions from here.
- **Fight History**: `state.fightHistory` — last 100 fight summaries. Day 16 AI boss reads this to score playstyle.
- **BYOK**: "Bring Your Own Key" — Day 15 AI tutor model. User supplies an Anthropic/OpenAI API key; we never run our own LLM endpoint.

---

## 16. MONETIZATION & DISTRIBUTION (Day 19 work)

This section is design-only until Day 19. Do not implement before then.

### 16.1 Free vs Paid feature split

| Feature | Free | Paid |
|---|---|---|
| Tutorial module | ✓ | ✓ |
| Stock modules | 2 only (Maths, English) | All 4 (+ Science + CS) |
| Custom module imports (JSON) | — | ✓ |
| Study Mode | ✓ (full) | ✓ |
| Arena Mode (world flow) | ✓ (3 modules) | ✓ (all) |
| Cram Mode | ✓ (basic — Day 11 reworked version) | ✓ |
| Raids | Solo only, normal difficulty | + Mythic difficulty |
| Co-op Raids | — | ✓ |
| Pets | Hoot-ini only | All 7 |
| AI Tutor | — | ✓ (BYOK) |
| Cosmetic biome variants | — | ✓ |
| Library + PDF storage | 5 PDF cap | unlimited |
| Forge / Forbidden Exchange / Prestige | ✓ | ✓ |

Rationale: keep the core game loop free so the tool is genuinely useful for studying. Gate the *premium experience* features (more content, AI, multiplayer, cosmetics) behind subscription.

### 16.2 Tech stack

- **Stripe Customer Portal** for subscription (monthly + yearly tiers, e.g. $5/mo or $40/yr).
- **Cloudflare Worker** as the auth shell — single endpoint `POST /verify` that takes an email + magic-link token, returns a signed JWT license token.
- **License token** cached in `localStorage`, contains `{ tier, expiresAt, features: [] }`. Re-verified weekly (worker call). On verify failure: 7-day grace period, then drop to free tier.
- **Free trial**: 7 days full access on first install. Tracked via cookie + localStorage (advisory only — easy to bypass, accepted trade for simplicity).
- **No server-side game state**. License gates UI only; all game state stays local.

### 16.3 Auth UX

- Splash screen gets a "Sign in / Sign up" button. Magic-link flow (email-only, no passwords).
- Authed users see paid features unlocked automatically.
- Cancellation: customer-portal redirect, immediate downgrade on next verify cycle.
- Refund: 14-day money-back via support email; no in-app flow.

### 16.4 Marketing surface

Separate `landing.html` page (sibling of `StudyBuddy.html`). Static, single-file. Sections: hero (Study + Arena gif demo), features list, pricing table, testimonials slot (start empty), CTA. Hosted on the same Cloudflare Pages deployment as the worker.

### 16.5 The "single HTML output" pillar bend

Day 19 adds a thin auth shell — one extra `<script>` block in `head.html` that does the license check before mounting React. This is the only acceptable bundle-size tax for the free→paid model. No npm dependencies still apply.

---

## 17. AI TUTOR ARCHITECTURE (Day 15-16 work)

Design-only until Day 15. Do not implement before then.

### 17.1 Provider abstraction

```js
const AI_PROVIDERS = {
  anthropic: { url: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-6', headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
  openai:    { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o', headers: k => ({ 'Authorization': 'Bearer ' + k }) },
  ollama:    { url: 'http://localhost:11434/api/chat', model: 'llama3', headers: () => ({}) },
};
```

User picks one in Settings. `aiCall(prompt, opts)` is a thin wrapper that returns `{ text, tokensUsed }`. Errors surface as toast notifications.

### 17.2 Prompt templates

Three templates, all parameterized by current concept / module / mistakePool:

1. **Concept summary** — input: concept name + notes. Output: 3-5 bullet TL;DR. Used in Tutor sidebar "Summarize" action.
2. **Question generator** — input: concept name + notes + question types desired + count. Output: JSON array conforming to MODULE_SCHEMA. Used to extend `state.customModules`.
3. **Final boss persona (Day 16)** — input: last 50 fight logs + mistakePool. Output: boss question pool (50 questions weighted to your weaknesses) + boss ability sequence (10 abilities chosen to counter your build). Used by `ai_boss.jsx`.

### 17.3 JSON-edit safety

- Every AI-proposed JSON edit goes through `aiProposeEdit(diff)` → diff-preview UI → `aiAcceptEdit()` or `aiRejectEdit()`.
- Undo log: last 5 edits stored in `state.ai.lastEdits`. User can revert any of them.
- Never auto-saves. Never edits `BUILTIN` modules (only `state.customModules`).

### 17.4 Final-boss "playstyle adversary" algorithm

Read last 50 entries from `state.fightHistory`. Score the player on 4 axes:

| Axis | Signal | Counter |
|---|---|---|
| crit-heavy | high % of fights with `combined.critChance > 0.20` (Focus/Oracle weapons + crit augments) | boss gets `passive_anti_magic` + thorns + crit-ignore passive |
| block-heavy | high block-per-turn average + Shield/Vanguard equipped | boss gets armor-pen + multi-hit attacks |
| streak-heavy | average combo at end-of-fight > 5 | boss leads with streak-reset abilities (`elite_amnesia`, `boss_silence`) |
| mistake-prone-X | mistakePool densely contains question type X (mcq/define/code) | boss draws 80% of pool from type X |

Top axis determines the boss's primary passive set. The other 3 axes contribute secondary tweaks. Boss adapts mid-fight: every 5 turns, AI re-scores recent player ability use and picks the next 5 abilities to counter.

### 17.5 Reward gating

The Final Boss only unlocks after reaching prestige rank ≥ 1 AND completing all 4 stock modules' world bosses. Win drops:
- Unique mythic augment "**Adversary's Mirror**" — no other source. Effect: every 10 turns, mirror your own augments back at you (chaotic but powerful).
- Lore unlock: "lore_adversary" entry.
- +1 prestige perk slot bonus on next reset.

Loss is harmless — no XP loss, can re-attempt next session.
