# Study Buddy — Game Design Document
### Web Pixel RPG Study Game | v1.0

---

## 1. CONCEPT PITCH

> **You are a scholar in a dying world. Knowledge is power — literally. Study your notes, answer questions correctly, and channel that knowledge into combat power. The smarter you study, the harder you hit.**

Study Buddy is a pixel RPG study game where academic performance directly drives combat. The player moves through a world map of study topics, fights knowledge bosses, and levels up a companion. Mastery is tracked per concept. Weak spots haunt you — unmastered concepts come back as harder enemies.

**Core loop:**
```
Read concept → Answer questions → Earn power → Fight boss → Unlock next topic
```

---

## 2. PILLARS

| Pillar | What it means |
|--------|--------------|
| **Learning First** | Content is always shown before testing. Never ambush the player with unknown material. |
| **Consequence** | Wrong answers cost HP, not just streaks. Failure has weight. |
| **Momentum** | Streaks, combos, and evolving companions reward consistent performance. |
| **Pixel Charm** | Retro aesthetic makes studying feel like a game, not homework. |

---

## 3. SCREEN FLOW

```
TITLE SCREEN
    │
    ├── New Game → World Select → Intro Cutscene → World Map
    └── Continue → Load Save → World Map

WORLD MAP
    │
    ├── Select Level Node → LEVEL HUB
    │       │
    │       ├── [Study] → STUDY MODE
    │       ├── [Exam]  → EXAM MODE  (unlocks after Study complete)
    │       └── [Boss]  → BOSS FIGHT (unlocks after Exam score ≥ 60%)
    │
    ├── [Companion] → COMPANION SCREEN
    ├── [Grimoire]  → PROGRESS / MASTERY SCREEN
    └── [Options]   → OPTIONS

BOSS FIGHT
    └── Victory → Unlock next node on World Map → World Map
    └── Defeat  → Retry or return to World Map (no save penalty)
```

---

## 4. WORLD MAP SCREEN

### Layout
- Top-down pixel map with node icons connected by paths
- Nodes = Levels (topics from the JSON `levels` array)
- Locked nodes are greyed out with a padlock
- Completed nodes show a star rating (1–3 stars based on exam score)
- Current node pulses

### Node States
| State | Visual | Unlock Condition |
|-------|--------|-----------------|
| Locked | Grey + padlock | Previous node boss defeated |
| Available | Lit, idle animation | — |
| In Progress | Lit + scroll icon | Study started |
| Boss Ready | Skull glow | Exam ≥ 60% |
| Complete | Gold star | Boss defeated |

### World Map HUD (always visible)
- Companion sprite (small, top-right corner)
- Player level + XP bar
- Current world name

---

## 5. LEVEL HUB SCREEN

When a node is clicked, a small popup appears:

```
┌─────────────────────────────────┐
│  ⚔ LEVEL: Search Algorithms     │
│  Mastery: ████░░░░ 45%          │
│                                  │
│  [📖 Study]   [📝 Exam]  [💀 Boss] │
│  ✓ Done       🔒 Locked  🔒 Locked │
└─────────────────────────────────┘
```

---

## 6. STUDY MODE

### Purpose
Teach before testing. No surprises.

### Flow (per concept)
1. **Concept Card** — Full-screen pixel card shows:
   - Concept name (large header)
   - Definition
   - Analogy (italicised, greyed out — flavour text style)
   - Breakdown (bullet points, revealed one line at a time on click)

2. **"Ready?" prompt** — Player clicks when they feel ready.

3. **Question Phase** — 1 recall + 1 understanding question from the concept's `questions` array.
   - Multiple choice (4 options) OR typed short answer (for recall)
   - Timer bar (30 seconds, cosmetic pressure — no HP loss in study mode)

4. **Feedback Panel**
   - Correct: green flash, companion does a happy animation, `+10 XP | Streak: N`
   - Wrong: red flash, show correct answer, show explanation, "Try again" (max 2 retries, no XP penalty — just no XP gain)

5. **Mastery Update** — after all concepts in a level:
   - Correct → mastery +10
   - Wrong → mastery -5 (floor: 0)

6. **Level Complete** — short fanfare, return to Level Hub with Exam unlocked.

### Study Mode HUD
```
[← Back]          Level: Search Algorithms
Concept 2 / 5     [████████░░] Mastery
                               Companion: Lv3 | 80 XP
```

---

## 7. EXAM MODE

### Purpose
Mixed testing without the safety net of retries. Simulate test pressure.

### Flow
1. Show `exam_block.text` as a "passage" (flavour: ancient tome page, pixel parchment texture)
2. Ask all `exam_block.questions` for each concept in the level, presented sequentially
3. Question types rendered differently:
   - `understanding` / `application` / `comparison` → multiple choice (4 options)
   - `recall` → fill-in (short text input with fuzzy match)

4. No immediate feedback — answer all questions, then:
   - **Results Screen** — shows score, which answers were wrong, and the correct answers
   - Star rating: < 60% = 1 star, 60–85% = 2 stars, ≥ 85% = 3 stars

5. If score ≥ 60%: Boss Fight unlocks on the World Map node.

### Exam Mode HUD
```
[← Back]          EXAM: Search Algorithms
Question 3 / 8    No retries. Think carefully.
```

---

## 8. BOSS FIGHT

This is the centrepiece. Full pixel RPG battle screen.

### Visual Layout
```
┌──────────────────────────────────────────┐
│  [BOSS NAME]           [COMPANION NAME]  │
│  ░░░░░░░░░░ Boss HP    Player HP ░░░░░░  │
│                                          │
│     [Boss Sprite]       [Player Sprite]  │
│         ↑ idle anim         ↑ idle anim  │
│                                          │
│  ─────────────────────────────────────  │
│  Q: What data structure does BFS use?   │
│                                          │
│  [A. Queue] [B. Stack] [C. Tree] [D. Heap]│
│                                          │
│  [⏱ 20s]   Streak: 3🔥  [✦ Use Ability] │
└──────────────────────────────────────────┘
```

### Combat Rules

**Answering:**
- Correct answer → Boss loses HP
  - Base damage: 15 HP
  - Streak bonus: +3 HP per active streak (max +15)
  - Ability use: see Ability System

- Wrong answer → Player loses HP
  - Base damage: 20 HP
  - Consecutive wrongs: +5 damage each time (resets on correct)
  - After taking damage: show correct answer for 2 seconds, then next question

**Boss HP:** 100
**Player HP:** 100 (modified by level — see Companion System)

**Question Pool:**
- Pulls from ALL questions across all concepts in the level
- Prioritises low-mastery concepts (mastery < 50 = 2x chance of appearing)
- No repeats within the same fight

### Boss Identity
Each level has a named boss that fits the topic thematically:

| Level | Boss Name | Sprite theme |
|-------|-----------|-------------|
| Search Foundations | The Archivist | robed scholar |
| Uninformed Search | The Blind Wanderer | blindfolded knight |
| Informed Search / A* | The Oracle | eye motif, glowing |
| CSPs | The Constraint Golem | stone figure with chains |
| Adversarial Search | The Gamemaster | chess piece crown |
| MDPs | The Probability Wraith | translucent, shifting |
| Machine Learning | The Pattern Weaver | spider/web motif |

### Victory / Defeat
- **Victory:** Boss crumbles, XP burst, companion evolution check, star rating shown, node marked complete on World Map.
- **Defeat:** Screen fades, "You were defeated" with encouragement message, option to retry or go back to map (progress saved, just no boss clear).

---

## 9. COMPANION SYSTEM

The companion is the player's persistent avatar/pet across all sessions.

### Base Stats
| Stat | Description |
|------|-------------|
| Level | Increases every 50 XP |
| XP | Earned from correct answers in all modes |
| HP Bonus | Each companion level adds +5 max HP in boss fights |
| Form | Visual evolution (3 stages) |
| Abilities | Unlocked at milestones |

### XP Rewards
| Action | XP |
|--------|----|
| Correct in Study Mode | +10 |
| Correct in Exam Mode | +15 |
| Correct in Boss Fight | +20 |
| Boss defeated | +50 |
| 3-star Exam | +30 bonus |

### Evolution
| Level | Form | Description |
|-------|------|-------------|
| 1–2 | Hatchling | Small, basic sprite, no abilities |
| 3–5 | Apprentice | Slightly larger, first ability unlocked |
| 6–9 | Scholar | Full size, glowing eyes, second ability |
| 10+ | Sage | Final form, particle effects, all abilities |

### Abilities
Abilities are usable ONCE per boss fight. They unlock at streak or level milestones.

| Ability | Unlock | Effect |
|---------|--------|--------|
| **Second Chance** | Level 3 | Skip one wrong answer with no HP loss (1/fight) |
| **Scholar's Sight** | Level 5 OR 5-streak | Eliminate 2 wrong options from a question |
| **Critical Study** | Level 7 | Next correct answer deals 2× damage |
| **Revive** | Level 10 | Restore 30 HP once per fight |

---

## 10. MASTERY & ADAPTIVE SYSTEM

### Mastery Score (per concept)
- Range: 0–100
- Starts at 0
- Correct answer: +10
- Wrong answer: -20 (floor 0)

### Mastery Tiers
| Score | Tier | Effect |
|-------|------|--------|
| 0–29 | 🔴 Critical | 3× weight in boss fight question pool |
| 30–49 | 🟡 Weak | 2× weight |
| 50–74 | 🟢 Learning | Normal weight |
| 75–100 | ✨ Mastered | 0.5× weight (rare, not absent) |

### Grimoire Screen (Progress)
Full-screen view showing:
- All levels + their mastery bar per concept
- Colour-coded by tier
- "Weak concepts" panel — lists all 🔴 Critical concepts across all worlds
- Companion stats
- Total questions answered, total correct, accuracy %

---

## 11. SAVE SYSTEM

- Auto-save after every correct/wrong answer (localStorage)
- Save contains:
  - Selected world
  - Mastery per concept (keyed by `concept.id`)
  - Companion stats (level, XP, form, abilities)
  - Node completion states
  - Boss clear states + star ratings

---

## 12. REACT COMPONENT ARCHITECTURE

```
App
├── screens/
│   ├── TitleScreen
│   ├── WorldMapScreen
│   ├── LevelHubPopup
│   ├── StudyModeScreen
│   ├── ExamModeScreen
│   ├── Bos