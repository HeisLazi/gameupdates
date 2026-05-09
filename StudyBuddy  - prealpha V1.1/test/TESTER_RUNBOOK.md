# Tester Runbook

Step-by-step tests. Don't worry about getting through every section — pick a sub-section and go deep. The goal is to find broken things, not to tick boxes.

If you find a bug, append a note to `known_issues.md` (next to this file). Format at the bottom of that file.

## Smoke test (do this first — 2 minutes)

1. Double-click `StudyBuddy.html` (in the project root).
2. Splash should appear with two cards: **Study Mode** and **Arena Mode**. Top-right toggle says `⚔️ Arena` / `📚 Study`.
3. Click **Study Mode**.
4. You should see the topbar with 4 buttons: Learn · Exam · Library · Progress. Below that, a sub-tab strip with 5 children of Learn (Home · Study · Daily · Review · Mixed).
5. Click each parent in the topbar. Confirm:
   - Library has NO sub-tab strip (single child).
   - Exam shows 2 sub-tabs (Exam · Pass Sprint).
   - Progress shows 4 sub-tabs (Stats · Deadlines · Grades · Modules).
6. Click **⚔️ Arena** in the top-right.
7. Arena hub should show 5 buttons grouped as `BUILD · BUILD · PLAY · PLAY` (Loadout · Workshop · Blitz · Raids), then World stages below (Dojo · Practice · Street · Elite · Final Boss).
8. Click each Arena hub button. Confirm:
   - **Loadout** opens with a tab strip: Armory · Tree · Hotbar · Pets · Passives. Click each tab, see the right content. Click "← Back to Arena".
   - **Workshop** opens with a tab strip: Forge · Librarian · Exchange. Click each. Back.
   - **Blitz** opens the Cram hub.
   - **Raids** opens the Raid hub with 3 raid cards.

If anything in the smoke test breaks, **stop and write it up in `known_issues.md` first** — the rest of the runbook depends on this working.

## Section A — Study side

### A1 · Pick a module + answer a question
1. Use the module dropdown at the top of the page. Pick `Tutorial — How to Play`.
2. Click **Learn** parent → **Study** sub-tab.
3. Pick a level → pick a concept → read the notes → click **Quiz me (Study mode)**.
4. Answer one question. On submit, watch:
   - Streak chip in the topbar (top-right) increments.
   - XP increments.
   - "Saved" indicator briefly flashes.

### A2 · Trigger a wrong answer
1. Same flow as A1, but pick a wrong answer.
2. Confirm: you're allowed to retry. No HP damage (this is Study mode, not Arena).
3. Streak should NOT break in Study mode.

### A3 · Exam mode
1. Click **Exam** parent → **Exam** sub-tab.
2. Pick the demo module's exam template. Start the timer.
3. Submit a few answers. End early.
4. Verify the per-question breakdown table renders correctly with marks earned.

### A4 · Pass Sprint
1. Click **Exam** parent → **Pass Sprint** sub-tab.
2. Tweak hours-left and prep-level inputs.
3. Hit **Start Diagnostic**. Confirm a 12-question session begins.
4. Hit **Start Pass Sprint** for the longer focused run.

### A5 · Library (PDF tracking)
1. Click **Library**.
2. Drop a PDF onto the upload zone (or use folder import in Chrome/Edge).
3. Confirm the PDF appears in the list, tagged to the current module.
4. Click to open. Confirm it renders in the embedded viewer.
5. Reading time should accumulate; after ~5 minutes you should earn an Insight (top-right chip in Arena mode).

### A6 · Progress views
1. Click **Progress** → check Stats, Deadlines, Grades, Modules in turn.
2. Stats should show lifetime numbers + Stats-as-Buffs progress bars.
3. Deadlines should list dated items. Try adding a custom deadline.
4. Grades should let you input planned exam marks per module and project final.
5. Modules should let you add a new custom module via JSON paste.

## Section B — Arena side

### B1 · Dojo (zero stakes)
1. Arena hub → World → **Dojo · Open Dojo**.
2. Should land in the Library / concept teach view.

### B2 · Practice (training dummy)
1. Arena hub → World → **Practice · Start Practice**. Pick concepts in the dropdown picker.
2. Combat starts vs a training dummy that deals 0 damage.
3. Try a couple of abilities. You can't lose. Exit when done.

### B3 · Street fight
1. Arena hub → World → **Street** → click any Chapter X.1 card → **Fight**.
2. Confirm: 1–3 minion enemies spawn (multi-mob).
3. Click any enemy card to switch target.
4. Answer questions. Correct = damage, wrong = HP loss.
5. Win → ResultScreen with possible drop, "NEW" badge if first-time augment.

### B4 · Elite
1. Same as B3 but pick an Elite. Should be 1 elite + 1–2 minion adds.
2. Elite has a passive shown as a chip on the card.

### B5 · Final Boss
1. Beat all elites for a module (they all show a ✓), then click Final Boss.
2. Single boss fight, harder.

### B6 · Loadout — change your weapon
1. Arena hub → **Loadout** → **Armory** tab.
2. Click a different weapon → **Equip**.
3. Back to hub → top character card should show the new weapon.

### B7 · Loadout — spend SP on the tree
1. Arena hub → **Loadout** → **Tree** tab.
2. If you have SP available, click an unlock you can afford.
3. Confirm SP available drops, the node shows ✓ Owned.

### B8 · Loadout — set hotbar
1. Arena hub → **Loadout** → **Hotbar** tab.
2. Equip 4 tree abilities into slots.
3. Save. Next combat, those abilities should be hotbar-keyable (1–4).

### B9 · Loadout — bond a pet
1. Arena hub → **Loadout** → **Pets** tab.
2. Bond a pet. Next combat, the pet companion strip should show below the biome banner.

### B10 · Workshop — Forge
1. Arena hub → **Workshop** → **Forge** tab.
2. If you have augments to dismantle, click shard.
3. If you have shards + insights, try crafting.

### B11 · Workshop — Librarian (Bestiary)
1. Arena hub → **Workshop** → **Librarian** tab.
2. Scroll to the Bestiary section.
3. After a few fights you should see enemy entries with encounter counts and ability frequencies.

### B12 · Workshop — Exchange
1. Arena hub → **Workshop** → **Exchange** tab.
2. Read the offers. Don't click unless you're willing to lose what they ask for.

### B13 · Blitz
1. Arena hub → **Blitz**.
2. Pick 3 starter abilities from the draft.
3. Survive waves. Every 3rd wave you pick 1 of 3 new abilities.
4. Wave 10 OR 10:00 elapsed → boss spawns. Beat it for the run reward.

### B14 · Raids
1. Arena hub → **Raids**.
2. Pick a raid. Engage.
3. Each phase ramps difficulty. Full clear drops the relic + a Mythic augment.

## Section C — Edge cases

### C1 · Switch modes mid-session
1. Start a Study quiz. Don't finish. Switch to Arena.
2. Switch back. Quiz state should be preserved (if it was — known limitation, may not be).

### C2 · Refresh during combat
1. Start a fight. Hit refresh.
2. Game should restore your state. If a fight is mid-progress and the state shape changed in this build, `normalizeArena()` should migrate cleanly without crashing.

### C3 · Add a custom module
1. Progress → Modules → Add new.
2. Paste a small valid module JSON (see `docs/MODULE_SCHEMA.md`).
3. Confirm it appears in the module dropdown.
4. Open it, verify questions render.

### C4 · Stress test the topnav
1. Click each parent + each child rapidly.
2. Confirm no view ever blanks out or the active highlight gets stuck.

## Sign-off

When you've gone through one full pass, append your name + a 1-line summary to the bottom of `known_issues.md`:

```
[2026-05-10] tester-handle — runbook complete, 3 issues filed (#7, #8, #9)
```
