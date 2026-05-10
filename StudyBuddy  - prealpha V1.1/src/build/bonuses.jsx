/* ==========================================================================
 * bonuses.jsx · Augment effects · Pet hooks · Stats-as-Buffs · Pet XP · Prestige
 *
 * Splice position: after world.jsx, before skills.jsx.
 * Defines:  AUGMENT_EFFECTS, getAugmentBonuses, STAT_BUFF_TIERS, getStatBuffs,
 *           statBuffProgress, addStat, PET_XP_THRESHOLDS, PET_MAX_LEVEL,
 *           petLevelFromXp, petXpProgress, getPetLevel, addPetXp, petScale,
 *           PET_REGISTRY (7 pets), PET_LIST, petOf, petOnCorrect,
 *           petOnEnemyKilled, petDamageMultiplier, petOnStreakLoss,
 *           petOnTurnStart, petShouldHighlightOnInsight, petOwlHidesCount,
 *           petOnWrong, petBeetleMaxUses, petOnLethal, prestigeFlags,
 *           maybeSpawnWraith, onWraithDefeated.
 * Reads:    nothing critical from upstream (purely read-only over state).
 *
 * Edit when: tuning augment effects, adding/changing pets or pet hooks,
 * tweaking the lifetime-stats → buffs ladder, or prestige perk readers.
 * ========================================================================== */
/* ============ BONUSES: Augments + Pets + Prestige Perks ============ *
 * Standalone helpers — read-only over state.
 * Splice this BEFORE arena.jsx in build_html.py so combat code can call them.
 */

/* ---------- AUGMENT EFFECTS ---------- */
const AUGMENT_EFFECTS = {
  // STARTER KIT (auto-granted in defaultState)
  silicon_skin:    { maxHpBonus: 20 },
  overclock_chip:  { dmgMult: 0.10 },
  firewall_dll:    { blockPerTurn: 5 },
  // RARE — biome / street drops (when implemented)
  grounding_wire:  { biomeDmgReduction: 0.50 },
  // 2026-05-09 dedupe: renamed scholar_eye -> scholars_eye to match the
  // canonical key in arena_runtime.jsx LOOT_TABLE. NOTE: the LOOT_TABLE
  // entry advertises "+10% crit" while this effect is `revealEnemyHp`.
  // Pick one of the two effects in a follow-up balance pass and unify.
  scholars_eye:    { revealEnemyHp: true },
  anti_virus:      { immunePoison: true, immuneAmnesia: true },
  reinforced_grip: { blockOnBasic: 15 },
  thorned_pommel:  { thornsRatio: 0.20 },
  // EPIC
  buffer_overflow: { capLargeHits: 10 },
  insight_loop:    { insightSaveChance: 0.20 },
  momentum_battery:{ maxMomentumBonus: 1 },
  data_miner:      { xpBonus: 0.25 },
  // LEGENDARY (raid drops, when implemented)
  capacitor_404:   { hpCap: 10, dmgMult: 2.0 },
  proctor_lens:    { highlightCorrect: true },
  god_mode_exe:    { reviveAtOne: true },
  silver_bullet:   { firstHitMaxHpDmg: 1.0 },
  overflowing_chalice: { uncappedInsights: true },
};

function getAugmentBonuses(state){
  const totals = {
    maxHpBonus: 0, dmgMult: 0, blockPerTurn: 0,
    biomeDmgReduction: 0, blockOnBasic: 0, thornsRatio: 0,
    capLargeHits: 0, insightSaveChance: 0, maxMomentumBonus: 0, xpBonus: 0,
    hpCap: null, reviveAtOne: false,
    revealEnemyHp: false, immunePoison: false, immuneAmnesia: false,
    highlightCorrect: false, firstHitMaxHpDmg: 0, uncappedInsights: false,
  };
  const eq = (state.inventory && state.inventory.equipment) || {};
  for (const id of Object.keys(eq)){
    const item = eq[id];
    if (!item || !item.quantity) continue;
    const fx = AUGMENT_EFFECTS[id];
    if (!fx) continue;
    for (const k of Object.keys(fx)){
      if (typeof fx[k] === 'boolean')      totals[k] = totals[k] || fx[k];
      else if (k === 'hpCap')              totals[k] = totals[k] === null ? fx[k] : Math.min(totals[k], fx[k]);
      else                                  totals[k] = (totals[k] || 0) + fx[k];
    }
  }
  if (totals.hpCap !== null) totals.maxHpBonus = 0;
  return totals;
}

/* ---------- LIFETIME STATS → BUFFS ---------- */
const STAT_BUFF_TIERS = [
  { stat:'totalCorrect',    per: 100,     key:'maxHpBonus',       value: 1,    max: 20,  label:'+1 Max HP per 100 lifetime correct',   icon:'❤️', cap:'+20 HP' },
  { stat:'totalKills',      per: 250,     key:'flatDmg',          value: 1,    max: 10,  label:'+1 base dmg per 250 lifetime kills',   icon:'⚔️', cap:'+10 dmg' },
  { stat:'totalReadingMs',  per: 3600000, key:'insightCapBonus',  value: 1,    max: 5,   label:'+1 Insight cap per hour read',         icon:'💡', cap:'+5 cap' },
  { stat:'totalFightsWon',  per: 50,      key:'maxMomentumBonus', value: 1,    max: 3,   label:'+1 max momentum per 50 fights won',    icon:'⚡', cap:'+3 mom' },
  { stat:'totalDmgDealt',   per: 5000,    key:'critChance',       value: 0.01, max: 0.10, label:'+1% crit per 5000 lifetime dmg dealt', icon:'🎯', cap:'+10% crit' },
];

function getStatBuffs(stats){
  const out = {};
  if (!stats) return out;
  for (const tier of STAT_BUFF_TIERS){
    const raw = Math.floor((stats[tier.stat] || 0) / tier.per) * tier.value;
    const capped = Math.min(tier.max, raw);
    if (capped > 0) out[tier.key] = (out[tier.key] || 0) + capped;
  }
  return out;
}

function statBuffProgress(stats, tier){
  const cur = stats?.[tier.stat] || 0;
  const tiersUnlocked = Math.min(tier.max / tier.value, Math.floor(cur / tier.per));
  const nextThreshold = (tiersUnlocked + 1) * tier.per;
  const intoCurrent = cur - (tiersUnlocked * tier.per);
  const atMax = tiersUnlocked >= (tier.max / tier.value);
  return { tiersUnlocked, nextThreshold, intoCurrent, atMax, current: cur };
}

function addStat(state, key, delta){
  if (!delta) return state;
  return { ...state, stats: { ...(state.stats || {}), [key]: ((state.stats && state.stats[key]) || 0) + delta } };
}

/* ---------- PET XP / LEVELS ---------- */
const PET_XP_THRESHOLDS = [0, 30, 80, 150, 250]; // index = level (0..4 for levels 1..5)
const PET_MAX_LEVEL = 5;

function petLevelFromXp(xp){
  let lvl = 1;
  for (let i = 1; i < PET_XP_THRESHOLDS.length; i++){
    if ((xp || 0) >= PET_XP_THRESHOLDS[i]) lvl = i + 1;
  }
  return Math.min(PET_MAX_LEVEL, lvl);
}

function petXpProgress(xp){
  const lvl = petLevelFromXp(xp);
  if (lvl >= PET_MAX_LEVEL) return { level: lvl, xp: xp || 0, intoCurrent: 0, span: 0, pct: 100, max: true };
  const lower = PET_XP_THRESHOLDS[lvl - 1];
  const upper = PET_XP_THRESHOLDS[lvl];
  const intoCurrent = (xp || 0) - lower;
  const span = upper - lower;
  return { level: lvl, xp: xp || 0, intoCurrent, span, pct: Math.round((intoCurrent / span) * 100), max: false };
}

function getPetLevel(state){
  if (!state.pet) return 1;
  return petLevelFromXp((state.petXp || {})[state.pet]?.xp || 0);
}

function addPetXp(state, amount){
  if (!state.pet || !amount) return state;
  const cur = state.petXp || {};
  const old = cur[state.pet] || { xp: 0 };
  return { ...state, petXp: { ...cur, [state.pet]: { ...old, xp: (old.xp || 0) + amount } } };
}

/* Scale factor: level 1 = 1.0, level 5 = 2.0 (each level adds 25%). */
function petScale(level){ return 1 + ((Math.max(1, level) - 1) * 0.25); }

/* ---------- PET REGISTRY + EVENT HOOKS ---------- */
const PET_REGISTRY = {
  pixel_owl:  { id:'pixel_owl',  name:'Hoot-ini',   icon:'🦉', tier:'common',    desc:'Once per fight: reveals the correct answer briefly when you spend an Insight.' },
  void_drone: { id:'void_drone', name:'DRN-01',     icon:'🛸', tier:'common',    desc:'+10 Block at the start of every player turn while below 50% HP.' },
  data_slime: { id:'data_slime', name:'Buffer',     icon:'🧪', tier:'common',    desc:'Every 3rd correct answer in a row, heals you for 10 HP.' },
  cache_cat:  { id:'cache_cat',  name:'Cachey',     icon:'🐈', tier:'rare',      desc:'+1 Insight every time you clear an enemy. Cap respected.' },
  syntax_fox: { id:'syntax_fox', name:'Syntax',     icon:'🦊', tier:'rare',      desc:'+5% damage per combo step (max +25%). Punishes streak loss with -5 HP.' },
  bug_beetle: { id:'bug_beetle', name:'Debuggy',    icon:'🪲', tier:'epic',      desc:'On wrong answer: shows the correct one next turn for free (1× per fight).' },
  ghost_dog:  { id:'ghost_dog',  name:'Pointer',    icon:'🐕', tier:'legendary', desc:'On lethal damage, survives with 1 HP and barks (1× per fight).' },
};
const PET_LIST = Object.values(PET_REGISTRY);

function petOf(state){ return state.pet ? PET_REGISTRY[state.pet] : null; }

function petOnCorrect(state, correctStreakTotal){
  if (state.pet === 'data_slime' && correctStreakTotal > 0 && correctStreakTotal % 3 === 0){
    const heal = Math.round(10 * petScale(getPetLevel(state)));
    return { heal, msg: `🧪 Buffer digested data — +${heal} HP` };
  }
  return null;
}

function petOnEnemyKilled(state){
  if (state.pet === 'cache_cat'){
    const lvl = getPetLevel(state);
    const insight = lvl >= 4 ? 2 : 1;
    return { insight, msg: `🐈 Cachey snagged ${insight === 2 ? 'two stray bytes' : 'a stray byte'} — +${insight} 💡` };
  }
  return null;
}

function petDamageMultiplier(state, combo){
  if (state.pet === 'syntax_fox'){
    const lvl = getPetLevel(state);
    const perStack = 0.05 + ((lvl - 1) * 0.01); // L1: 5%, L5: 9% per stack
    const maxStacks = Math.min(5 + (lvl - 1), 10); // L1: 5, L5: 9 stacks
    const stack = Math.min(maxStacks, Math.max(0, combo));
    return { mult: 1 + stack * perStack, msg: stack > 0 ? `🦊 Syntax stacks ×${stack} (+${Math.round(stack*perStack*100)}% dmg)` : null };
  }
  return { mult: 1, msg: null };
}

function petOnStreakLoss(state){
  if (state.pet === 'syntax_fox'){
    const lvl = getPetLevel(state);
    const hpLoss = Math.max(1, Math.round(5 / petScale(lvl))); // higher level = less self-damage
    return { hpLoss, msg: `🦊 Syntax lost the trail (-${hpLoss} HP)` };
  }
  return null;
}

function petOnTurnStart(state, currentHp, maxHp){
  if (state.pet === 'void_drone' && currentHp <= maxHp * 0.5){
    const block = Math.round(10 * petScale(getPetLevel(state)));
    return { block, msg: `🛸 DRN-01 deployed shield — +${block} Block` };
  }
  return null;
}

function petShouldHighlightOnInsight(state, alreadyUsedThisFight){
  return state.pet === 'pixel_owl' && !alreadyUsedThisFight;
}

/* Pixel Owl: hides 2 wrong choices at L1, +1 per 2 levels (L3=3, L5=4). */
function petOwlHidesCount(state){
  const lvl = getPetLevel(state);
  return 2 + Math.floor((lvl - 1) / 2);
}

function petOnWrong(state, alreadyTriggered){
  if (state.pet === 'bug_beetle' && !alreadyTriggered){
    return { freeReveal: true, msg: '🪲 Debuggy traced the error — next answer revealed' };
  }
  return null;
}

/* Beetle: 1 reveal at L1, 2 at L3, 3 at L5 (uses count instead of bool flag). */
function petBeetleMaxUses(state){
  const lvl = getPetLevel(state);
  if (lvl >= 5) return 3;
  if (lvl >= 3) return 2;
  return 1;
}

function petOnLethal(state, alreadyTriggered){
  if (state.pet === 'ghost_dog' && !alreadyTriggered){
    const reviveHp = Math.round(1 * petScale(getPetLevel(state)));
    return { reviveHp, msg: `🐕 Pointer broke the loop — revived at ${reviveHp} HP` };
  }
  return null;
}

/* ---------- PRESTIGE PERK READERS ---------- */
function prestigeFlags(state){
  const p = state.prestigePerk;
  return {
    photoMemory:  p === 'photographic_memory',
    doubleMajor:  p === 'double_major',
    funding:      p === 'funding_secured',
    speedLearner: p === 'speed_learner',
    rank: state.prestigeRank || 0,
    xpMul: 1 + ((state.prestigeRank || 0) * 0.20),
  };
}

/* ---------- MEMORY WRAITH SPAWN HELPER ---------- */
function maybeSpawnWraith(state, allModuleQuestions){
  const pool = (state.arena && state.arena.mistakePool) || [];
  if (pool.length === 0) return null;
  if (Math.random() > 0.20) return null;
  const qid = pool[Math.floor(Math.random() * pool.length)];
  const q = allModuleQuestions.find(x => x.id === qid);
  if (!q) return null;
  return {
    id: 'wraith_' + qid + '_' + Date.now(),
    name: 'Memory Wraith', emoji: '👻',
    type: 'minion', tier: 'minion',
    hp: 30, maxHp: 30,
    dmg: { light: 4, heavy: 8 },
    pattern: ['light', 'light', 'heavy'],
    isWraith: true, haunts: qid, forcedQuestion: q,
  };
}

function onWraithDefeated(state, setState, wraith){
  const pool = (state.arena && state.arena.mistakePool) || [];
  setState({
    ...state,
    arena: { ...state.arena, mistakePool: pool.filter(qid => qid !== wraith.haunts) },
    xp: (state.xp || 0) + 30,
  });
}
