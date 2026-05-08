/* ============ ARENA RUNTIME GLUE ============ *
 * Keeps the Day 1/Day 2 patch bundle wired into the newer split Arena files.
 */

/* ---------- LEVEL-UP REWARD POOL + STATS HELPER ---------- */
const REWARD_POOL = [
  // Stat rewards (most common — 60% of rolls)
  { id:'r_maxhp_10',   weight:5, type:'stat', stat:'maxHpBonus',       value:10, name:'+10 Max HP',         icon:'❤️', desc:'Permanent +10 max HP for all future fights.' },
  { id:'r_dmg_2',      weight:4, type:'stat', stat:'flatDmg',          value:2,  name:'+2 Base Damage',     icon:'⚔️', desc:'Permanent +2 flat damage on every attack.' },
  { id:'r_mom_1',      weight:3, type:'stat', stat:'maxMomentumBonus', value:1,  name:'+1 Max Momentum',    icon:'⚡', desc:'Raises momentum cap by 1.' },
  { id:'r_insight_1',  weight:3, type:'stat', stat:'insightCapBonus',  value:1,  name:'+1 Insight Cap',     icon:'💡', desc:'Raises max insight balance by 1.' },
  { id:'r_crit_05',    weight:3, type:'stat', stat:'critChance',       value:0.05, name:'+5% Crit Chance',  icon:'🎯', desc:'Permanent +5% crit chance.' },
  { id:'r_xp_05',      weight:3, type:'stat', stat:'xpBonus',          value:0.05, name:'+5% XP Gain',      icon:'📈', desc:'+5% XP from all combat.' },
  { id:'r_block_2',    weight:3, type:'stat', stat:'flatBlock',        value:2,  name:'+2 Flat Block',      icon:'🛡️', desc:'+2 block at the start of every turn.' },
  { id:'r_heal_1',     weight:2, type:'stat', stat:'flatHeal',         value:1,  name:'+1 Heal/Turn',       icon:'💚', desc:'Heal 1 HP at the start of every turn.' },
  // Big stat rewards (rarer)
  { id:'r_maxhp_25',   weight:1, type:'stat', stat:'maxHpBonus',       value:25, name:'+25 Max HP',         icon:'❤️‍🔥', desc:'Big +25 max HP boost. Rare.', tier:'rare' },
  { id:'r_dmg_5',      weight:1, type:'stat', stat:'flatDmg',          value:5,  name:'+5 Base Damage',     icon:'💥', desc:'Big +5 base damage. Rare.', tier:'rare' },
  { id:'r_crit_15',    weight:1, type:'stat', stat:'critChance',       value:0.15, name:'+15% Crit Chance', icon:'🎯', desc:'Massive +15% crit. Rare.', tier:'rare' },
];

function getRewardBonuses(rewards){
  const out = {};
  for (const r of (rewards || [])){
    if (r.type === 'stat'){
      out[r.stat] = (out[r.stat] || 0) + r.value;
    }
  }
  return out;
}

function rollRewardChoices(state){
  const exclude = new Set((state.unlockedRewards || []).filter(r => r.unique).map(r => r.id));
  const pool = REWARD_POOL.filter(r => !exclude.has(r.id));
  const weighted = [];
  for (const r of pool){ for (let i=0;i<(r.weight||1);i++) weighted.push(r); }
  const picks = [];
  while (picks.length < 3 && weighted.length){
    const idx = Math.floor(Math.random() * weighted.length);
    const choice = weighted[idx];
    if (!picks.find(p => p.id === choice.id)) picks.push(choice);
    // Remove all weighted entries of same id
    for (let i = weighted.length - 1; i >= 0; i--) if (weighted[i].id === choice.id) weighted.splice(i, 1);
  }
  return picks;
}

/* Apply reward bonuses on top of the stack-patched getCombinedStats (caveman patches first). */
const _gcs_pre_rewards = getCombinedStats;
getCombinedStats = function(state){
  const combined = _gcs_pre_rewards(state);
  const r = getRewardBonuses(state.unlockedRewards || []);
  combined.maxHpBonus       = (combined.maxHpBonus || 0)       + (r.maxHpBonus || 0);
  combined.flatDmg          = (combined.flatDmg || 0)          + (r.flatDmg || 0);
  combined.maxMomentumBonus = (combined.maxMomentumBonus || 0) + (r.maxMomentumBonus || 0);
  combined.insightCapBonus  = (combined.insightCapBonus || 0)  + (r.insightCapBonus || 0);
  combined.critChance       = (combined.critChance || 0)       + (r.critChance || 0);
  combined.xpBonus          = (combined.xpBonus || 0)          + (r.xpBonus || 0);
  combined.flatBlock        = (combined.flatBlock || 0)        + (r.flatBlock || 0);
  combined.flatHeal         = (combined.flatHeal || 0)         + (r.flatHeal || 0);
  return combined;
};

/* Lifetime stat buffs — additional layer on top of rewards. */
const _gcs_pre_stats = getCombinedStats;
getCombinedStats = function(state){
  const combined = _gcs_pre_stats(state);
  const sb = (typeof getStatBuffs === 'function') ? getStatBuffs(state.stats) : {};
  combined.maxHpBonus       = (combined.maxHpBonus || 0)       + (sb.maxHpBonus || 0);
  combined.flatDmg          = (combined.flatDmg || 0)          + (sb.flatDmg || 0);
  combined.maxMomentumBonus = (combined.maxMomentumBonus || 0) + (sb.maxMomentumBonus || 0);
  combined.insightCapBonus  = (combined.insightCapBonus || 0)  + (sb.insightCapBonus || 0);
  combined.critChance       = (combined.critChance || 0)       + (sb.critChance || 0);
  return combined;
};

/* ---------- FORGE ECONOMY ---------- */
const FORGE_SHARD_VALUE = { common:1, rare:3, epic:8, legendary:20, mythic:50, raid_only:30 };
const FORGE_CRAFT_COST = {
  common:    { shards:5,   insights:2 },
  rare:      { shards:15,  insights:5 },
  epic:      { shards:40,  insights:10 },
  legendary: { shards:100, insights:25 },
  mythic:    { shards:250, insights:50 },
};
const FORGE_UPGRADE_COST = [ // index = current upgradeLvl, cost to bump to next
  { mult:5  }, // 0→1
  { mult:15 }, // 1→2
  { mult:50 }, // 2→3 (cap)
];
const FORGE_UPGRADE_MAX = 3;

function forgeUpgradeCost(tier, currentLvl){
  if (currentLvl >= FORGE_UPGRADE_MAX) return null;
  const tierMult = FORGE_SHARD_VALUE[tier] || 1;
  return Math.round((FORGE_UPGRADE_COST[currentLvl]?.mult || 5) * tierMult);
}

function forgeShardAugment(state, augId){
  const inv = state.inventory || {};
  const eq = inv.equipment || {};
  const item = eq[augId];
  if (!item || (item.quantity || 0) <= 0) return state;
  const tier = LOOT_TABLE[augId]?.tier || 'common';
  const shards = FORGE_SHARD_VALUE[tier] || 1;
  const nextEq = { ...eq };
  if ((item.quantity || 0) <= 1){
    // Keep entry for codex (mark discovered) but quantity 0
    nextEq[augId] = { ...item, quantity: 0 };
  } else {
    nextEq[augId] = { ...item, quantity: item.quantity - 1 };
  }
  return { ...state, inventory: { ...inv, equipment: nextEq, shards: (inv.shards || 0) + shards } };
}

function forgeCraftAugment(state, tier){
  const cost = FORGE_CRAFT_COST[tier];
  if (!cost) return { state, item: null, error: 'Unknown tier' };
  const inv = state.inventory || {};
  if ((inv.shards || 0) < cost.shards) return { state, item: null, error: 'Not enough shards' };
  if ((state.insights || 0) < cost.insights) return { state, item: null, error: 'Not enough insights' };
  const pool = (LOOT_TIERS[tier]?.pool) || [];
  if (!pool.length) return { state, item: null, error: 'Empty pool' };
  const id = pool[Math.floor(Math.random() * pool.length)];
  const item = LOOT_TABLE[id];
  if (!item) return { state, item: null, error: 'Item not found' };
  const eq = inv.equipment || {};
  const cur = eq[id] || { id, quantity: 0, discovered: false };
  const nextEq = { ...eq, [id]: { ...cur, quantity: (cur.quantity || 0) + 1, discovered: true } };
  return {
    state: {
      ...state,
      insights: (state.insights || 0) - cost.insights,
      inventory: { ...inv, equipment: nextEq, shards: (inv.shards || 0) - cost.shards },
    },
    item,
    error: null,
  };
}

/* ---------- BESTIARY ---------- */
/* state.bestiary[enemyKey] = {
 *   name, emoji, tier, encounters, defeats, lastSeen,
 *   patterns: { [abilityId]: count },   // how often we saw each ability
 *   passives: [...passive ids ever seen],
 *   mistakes: [questionId, ...],        // last 10 wrong answers vs this enemy type
 * }
 */
function bestiaryKey(enemy){
  // Group by display name + tier so "Cram Minion" doesn't collide with "Stress Specter"
  return (enemy?.name || 'Unknown') + '|' + (enemy?.tier || enemy?.type || 'minion');
}

function recordBestiaryEncounter(state, enemiesArr){
  if (!enemiesArr || !enemiesArr.length) return state;
  const next = { ...(state.bestiary || {}) };
  for (const e of enemiesArr){
    const k = bestiaryKey(e);
    const cur = next[k] || { name: e.name, emoji: e.emoji, tier: e.tier || e.type, encounters: 0, defeats: 0, patterns: {}, passives: [], mistakes: [] };
    cur.encounters = (cur.encounters || 0) + 1;
    cur.lastSeen = Date.now();
    if (e.hp <= 0) cur.defeats = (cur.defeats || 0) + 1;
    // Record what abilities this enemy carried (the pattern array is what they cycle through)
    if (Array.isArray(e.pattern)){
      cur.patterns = { ...cur.patterns };
      for (const id of e.pattern) cur.patterns[id] = (cur.patterns[id] || 0) + 1;
    }
    if (Array.isArray(e.passives)){
      const set = new Set(cur.passives);
      for (const id of e.passives) set.add(id);
      cur.passives = Array.from(set);
    }
    next[k] = cur;
  }
  return { ...state, bestiary: next };
}

function recordBestiaryMistake(state, enemiesArr, questionId){
  if (!questionId || !enemiesArr || !enemiesArr.length) return state;
  const next = { ...(state.bestiary || {}) };
  const livingTargets = enemiesArr.filter(e => e.hp > 0);
  // Tag the mistake against any living enemy at the time of the wrong answer
  for (const e of livingTargets){
    const k = bestiaryKey(e);
    const cur = next[k] || { name: e.name, emoji: e.emoji, tier: e.tier || e.type, encounters: 0, defeats: 0, patterns: {}, passives: [], mistakes: [] };
    const list = (cur.mistakes || []).filter(id => id !== questionId);
    list.unshift(questionId);
    cur.mistakes = list.slice(0, 10);
    next[k] = cur;
  }
  return { ...state, bestiary: next };
}

/* ---------- FORBIDDEN EXCHANGE v2 ---------- */
const EXCHANGE_OFFERS = [
  { id:'maxhp_for_momentum',
    name:'Bone Tax',
    icon:'🦴',
    cost:'-15 lifetime correct stat (loses ~1 max HP buff tier)',
    reward:'+1 permanent max momentum',
    canApply:(s)=> (s.stats?.totalCorrect || 0) >= 100,
    apply:(s)=>({
      ...s,
      stats:{ ...(s.stats||{}), totalCorrect: Math.max(0, (s.stats?.totalCorrect || 0) - 15) },
      unlockedRewards:[...(s.unlockedRewards||[]), { id:'exchange_mom_'+Date.now(), type:'stat', stat:'maxMomentumBonus', value:1, name:'Bone Tax', icon:'🦴', desc:'+1 max momentum (Forbidden Exchange)' }],
    }),
  },
  { id:'mastery_for_dmg',
    name:'Memory Burn',
    icon:'🔥',
    cost:'Reset 3 random concept mastery streaks',
    reward:'+2 permanent base damage',
    canApply:(s)=> Object.keys(s.sr || {}).length >= 5,
    apply:(s)=>{
      const ids = Object.keys(s.sr || {});
      const burned = [];
      const sr = { ...s.sr };
      for (let i = 0; i < 3 && ids.length; i++){
        const idx = Math.floor(Math.random() * ids.length);
        const k = ids.splice(idx, 1)[0];
        burned.push(k);
        sr[k] = { ...sr[k], interval: 0, ease: Math.max(1.3, (sr[k].ease || 2.5) - 0.3) };
      }
      return {
        ...s, sr,
        unlockedRewards:[...(s.unlockedRewards||[]), { id:'exchange_dmg_'+Date.now(), type:'stat', stat:'flatDmg', value:2, name:'Memory Burn', icon:'🔥', desc:'+2 base damage (forgot 3 concepts)' }],
      };
    },
  },
  { id:'insights_for_legendary',
    name:'All-In Gamble',
    icon:'🎰',
    cost:'Spend all current insights',
    reward:'Roll a guaranteed Legendary augment',
    canApply:(s)=> (s.insights || 0) >= 5,
    apply:(s)=>{
      const pool = LOOT_TIERS.legendary?.pool || [];
      if (!pool.length) return s;
      const id = pool[Math.floor(Math.random() * pool.length)];
      const item = LOOT_TABLE[id];
      const eq = (s.inventory || {}).equipment || {};
      const cur = eq[id] || { id, quantity: 0, discovered: false };
      return {
        ...s,
        insights: 0,
        inventory: { ...(s.inventory || {}), equipment: { ...eq, [id]: { ...cur, quantity: (cur.quantity || 0) + 1, discovered: true } } },
      };
    },
  },
  { id:'pet_for_xp',
    name:'Pet Sacrifice',
    icon:'💀',
    cost:'Release current pet (XP kept, can rebond)',
    reward:'+5% permanent XP gain',
    canApply:(s)=> !!s.pet,
    apply:(s)=>({
      ...s,
      pet: null,
      unlockedRewards:[...(s.unlockedRewards||[]), { id:'exchange_xp_'+Date.now(), type:'stat', stat:'xpBonus', value:0.05, name:'Pet Sacrifice', icon:'💀', desc:'+5% XP gain (released a pet)' }],
    }),
  },
  { id:'shards_for_random',
    name:'Black Box Forge',
    icon:'⬛',
    cost:'30 shards',
    reward:'Random epic OR legendary OR mythic (uniform)',
    canApply:(s)=> (s.inventory?.shards || 0) >= 30,
    apply:(s)=>{
      const tiers = ['epic','legendary','mythic'];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const pool = LOOT_TIERS[tier]?.pool || [];
      if (!pool.length) return s;
      const id = pool[Math.floor(Math.random() * pool.length)];
      const item = LOOT_TABLE[id];
      const eq = (s.inventory || {}).equipment || {};
      const cur = eq[id] || { id, quantity: 0, discovered: false };
      return {
        ...s,
        inventory: {
          ...(s.inventory || {}),
          shards: (s.inventory?.shards || 0) - 30,
          equipment: { ...eq, [id]: { ...cur, quantity: (cur.quantity || 0) + 1, discovered: true } },
        },
      };
    },
  },
  { id:'streak_for_insights',
    name:'Hot Streak Trade',
    icon:'🌡️',
    cost:'Reset daily streak to 0',
    reward:'+5 insights immediately',
    canApply:(s)=> (s.streak?.count || 0) >= 3,
    apply:(s)=>({
      ...s,
      streak: { ...(s.streak || {}), count: 0 },
      insights: (s.insights || 0) + 5,
    }),
  },
];

function applyExchangeOffer(state, offerId){
  const offer = EXCHANGE_OFFERS.find(o => o.id === offerId);
  if (!offer) return { state, error: 'Unknown offer' };
  if (!offer.canApply(state)) return { state, error: 'Cannot apply (requirements unmet)' };
  // 1% data-corruption chance
  if (Math.random() < 0.01){
    return { state: { ...state, exchangeHistory: [...(state.exchangeHistory||[]), { offerId, at: Date.now(), corrupted: true }] }, corrupted: true };
  }
  let next = offer.apply(state);
  next = { ...next, exchangeHistory: [...(next.exchangeHistory||[]), { offerId, at: Date.now() }] };
  return { state: next, error: null };
}

function forgeUpgradeAugment(state, augId){
  const inv = state.inventory || {};
  const eq = inv.equipment || {};
  const item = eq[augId];
  if (!item) return { state, error: 'Not owned' };
  const curLvl = item.upgradeLvl || 0;
  if (curLvl >= FORGE_UPGRADE_MAX) return { state, error: 'Max upgrade' };
  const tier = LOOT_TABLE[augId]?.tier || 'common';
  const cost = forgeUpgradeCost(tier, curLvl);
  if ((inv.shards || 0) < cost) return { state, error: 'Not enough shards' };
  return {
    state: {
      ...state,
      inventory: {
        ...inv,
        shards: (inv.shards || 0) - cost,
        equipment: { ...eq, [augId]: { ...item, upgradeLvl: curLvl + 1 } },
      },
    },
    error: null,
  };
}

function weaponList(){
  return Object.values(WEAPONS).filter(w => w && typeof w === 'object' && w.id);
}

function getWeaponDef(id){
  return WEAPONS[id] || weaponList().find(w => w.id === id) || WEAPONS.blade || weaponList()[0];
}

function weaponAbilityIds(weapon){
  if (!weapon) return [];
  return [weapon.basic, ...((weapon.abilities || []))].filter(Boolean);
}

if (!WEAPONS.find){
  Object.defineProperties(WEAPONS, {
    find: { value: cb => weaponList().find(cb), enumerable:false },
    map: { value: cb => weaponList().map(cb), enumerable:false },
    filter: { value: cb => weaponList().filter(cb), enumerable:false },
    0: { get(){ return weaponList()[0]; }, enumerable:false },
  });
}

/* ---------- LOOT / AUGMENTS ---------- */
const LOOT_TABLE = {
  silicon_skin:   { id:'silicon_skin',   name:'Silicon Skin',       icon:'🛡️', tier:'common',    desc:'+20 Max HP.',              effect:{ augment:true, slot:'weapon', maxHp:20 } },
  overclock_chip: { id:'overclock_chip', name:'Overclock Chip',     icon:'⚡', tier:'common',    desc:'+1 Momentum cap.',        effect:{ augment:true, slot:'weapon', maxMomentumBonus:1 } },
  firewall_dll:   { id:'firewall_dll',   name:'Firewall.dll',       icon:'🛡️', tier:'common',    desc:'Block +3.',               effect:{ augment:true, slot:'weapon', flatBlock:3 } },
  anti_virus:     { id:'anti_virus',     name:'Anti-Virus',         icon:'🦠', tier:'common',    desc:'Poison immunity.',        effect:{ augment:true, slot:'weapon', statusImmune:['poison'] } },
  grounding_wire: { id:'grounding_wire', name:'Grounding Wire',     icon:'⚡', tier:'common',    desc:'Heat damage -50%.',       effect:{ augment:true, slot:'weapon', hazardResist:0.5 } },
  brute_force:    { id:'brute_force',    name:'Brute Force',        icon:'💪', tier:'common',    desc:'Base damage +3.',         effect:{ augment:true, slot:'weapon', flatDamage:3 } },
  safe_mode:      { id:'safe_mode',      name:'Safe Mode',          icon:'🛡️', tier:'rare',      desc:'Block 100% below 30% HP.', effect:{ augment:true, slot:'weapon', emergencyBlock:0.3 } },
  executioner:    { id:'executioner',    name:'Executioner.bin',    icon:'⚔️', tier:'rare',      desc:'Execute +50% below 25%.', effect:{ augment:true, slot:'weapon', executeThreshold:0.25, executeBonus:0.5 } },
  data_miner:     { id:'data_miner',     name:'Data Miner',         icon:'⛏️', tier:'rare',      desc:'Wrong answer +3 XP.',     effect:{ augment:true, slot:'weapon', xpOnWrong:3 } },
  insight_loop:   { id:'insight_loop',   name:'Insight Loop',       icon:'💡', tier:'rare',      desc:'Start with +5 insights.', effect:{ augment:true, slot:'weapon', startInsight:5 } },
  scholars_eye:   { id:'scholars_eye',   name:"Scholar's Eye",      icon:'👁️', tier:'rare',      desc:'Crit chance +10%.',      effect:{ augment:true, slot:'weapon', critChance:0.1 } },
  scholar_eye:    { id:'scholar_eye',    name:"Scholar's Eye",      icon:'👁️', tier:'rare',      desc:'Crit chance +10%.',      effect:{ augment:true, slot:'weapon', critChance:0.1 } },
  scavenger_script:{ id:'scavenger_script', name:'Scavenger Script',icon:'🗑️', tier:'rare',      desc:'+15% loot chance.',      effect:{ augment:true, slot:'weapon', lootBonus:0.15 } },
  buffer_overflow:{ id:'buffer_overflow',name:'Buffer Overflow',    icon:'💥', tier:'epic',      desc:'Reduce attacks >20 by 10.', effect:{ augment:true, slot:'weapon', damageCapReduction:10, capThreshold:20 } },
  logic_leak:     { id:'logic_leak',     name:'Logic Leak',         icon:'🔓', tier:'epic',      desc:'Crit costs -3 HP.',      effect:{ augment:true, slot:'weapon', critSelfDamage:3 } },
  chain_reaction: { id:'chain_reaction', name:'Chain Reaction',     icon:'⛓️', tier:'epic',      desc:'Minion kill hits boss.', effect:{ augment:true, slot:'weapon', chainDamage:10 } },
  recoil_spring:  { id:'recoil_spring',  name:'Recoil Spring',      icon:'🔄', tier:'epic',      desc:'Crit makes next ability free.', effect:{ augment:true, slot:'weapon', nextAbilityFree:true } },
  momentum_battery:{ id:'momentum_battery', name:'Momentum Battery',icon:'🔋', tier:'epic',      desc:'Start with 2 momentum.', effect:{ augment:true, slot:'weapon', startMomentum:2 } },
  auto_save:      { id:'auto_save',      name:'Auto-Save',          icon:'💾', tier:'epic',      desc:'Survive lethal once.',   effect:{ augment:true, slot:'weapon', surviveLethal:1 } },
  dark_web_proxy: { id:'dark_web_proxy', name:'Dark Web Proxy',     icon:'🌐', tier:'epic',      desc:'Steal 5 HP on crit.',   effect:{ augment:true, slot:'weapon', healOnCrit:5 } },
  black_box:      { id:'black_box',      name:'The Black Box',      icon:'⬛', tier:'legendary', desc:'Random damage 1-100.',   effect:{ augment:true, slot:'weapon', randomDamage:true } },
  null_pointer:   { id:'null_pointer',   name:'Null Pointer',       icon:'🕳️', tier:'legendary', desc:'First hit heals instead.', effect:{ augment:true, slot:'weapon', healOnCorrect:10, disableDamage:true } },
  system_admin:   { id:'system_admin',   name:'System Admin',       icon:'👤', tier:'legendary', desc:'XP +25%.',              effect:{ augment:true, slot:'weapon', xpBonus:0.25 } },
  capacitor_404:  { id:'capacitor_404',  name:'404 Capacitor',      icon:'⚡', tier:'legendary', desc:'Max HP 10, 3x Damage.', effect:{ augment:true, slot:'weapon', maxHp:10, damageMult:3 } },
  ocular_lens:    { id:'ocular_lens',    name:'Ocular Lens',        icon:'👓', tier:'legendary', desc:'First strike +8% HP.',  effect:{ augment:true, slot:'weapon', firstHitPercent:0.08, bossFirstHitPercent:0.06 } },
  proctor_lens:   { id:'proctor_lens',   name:'Proctor Lens',       icon:'🔎', tier:'legendary', desc:'Highlights the correct answer once.', effect:{ augment:true, slot:'weapon', highlightCorrect:true } },
  reinforced_grip:{ id:'reinforced_grip',name:'Reinforced Grip',    icon:'🤝', tier:'legendary', desc:'Streak loss -1.',       effect:{ augment:true, slot:'weapon', streakProtection:1 } },
  thorned_pommel: { id:'thorned_pommel', name:'Thorned Pommel',     icon:'🌵', tier:'legendary', desc:'Reflect 20% damage.',   effect:{ augment:true, slot:'weapon', reflectDmg:0.2 } },
  infinite_loop:  { id:'infinite_loop',  name:'Infinite Loop',      icon:'♾️', tier:'mythic',    desc:'No cooldowns, cost HP.', effect:{ augment:true, slot:'weapon', noCooldown:true, abilitySelfDamage:10 } },
  silver_bullet:  { id:'silver_bullet',  name:'Silver Bullet',      icon:'🥈', tier:'mythic',    desc:'First hit = 12% HP.',  effect:{ augment:true, slot:'weapon', firstHitPercent:0.12, bossFirstHitPercent:0.12 } },
  god_mode:       { id:'god_mode',       name:'GOD MODE.EXE',       icon:'👑', tier:'mythic',    desc:'Invulnerable 1st turn.', effect:{ augment:true, slot:'weapon', invulnFirstTurn:true } },
  god_mode_exe:   { id:'god_mode_exe',   name:'GOD MODE.EXE',       icon:'👑', tier:'mythic',    desc:'Invulnerable 1st turn.', effect:{ augment:true, slot:'weapon', invulnFirstTurn:true } },
  overflowing_chalice:{ id:'overflowing_chalice', name:'Overflowing Chalice', icon:'🏆', tier:'mythic', desc:'Heal 3/tick, +15 HP.', effect:{ augment:true, slot:'weapon', maxHp:15, healPerTick:3 } },
  neural_adapter: { id:'neural_adapter', name:'Neural Adapter',     icon:'🧠', tier:'raid_only', desc:'Raid relic from Logic Singularity.', effect:{ augment:true, slot:'weapon', critChance:0.15 } },
  bio_upgrade:    { id:'bio_upgrade',    name:'Bio Upgrade',        icon:'🧬', tier:'raid_only', desc:'Raid relic from Malware Hive.', effect:{ augment:true, slot:'weapon', maxHp:25 } },
  shadow_badge:   { id:'shadow_badge',   name:'Shadow Badge',       icon:'🌑', tier:'raid_only', desc:'Raid relic from Corrupted Professor.', effect:{ augment:true, slot:'weapon', dodgeChance:0.10 } },
};

const LOOT_TIERS = {
  common:    { dropChance:0.50, pool:['silicon_skin','overclock_chip','firewall_dll','anti_virus','grounding_wire','brute_force'] },
  rare:      { dropChance:0.25, pool:['safe_mode','executioner','data_miner','insight_loop','scholars_eye','scavenger_script'] },
  epic:      { dropChance:0.18, pool:['buffer_overflow','logic_leak','chain_reaction','recoil_spring','momentum_battery','auto_save','dark_web_proxy'] },
  legendary: { dropChance:0.06, pool:['black_box','null_pointer','system_admin','capacitor_404','ocular_lens','proctor_lens','reinforced_grip','thorned_pommel'] },
  mythic:    { dropChance:0.01, pool:['infinite_loop','silver_bullet','god_mode','overflowing_chalice'] },
};

/* ---------- BIOMES / RAIDS ---------- */
const BIOMES = {
  server_room:{ id:'server_room', name:'Server Room', icon:'🖥️', desc:'Cooling fans hum. Skills cycle faster but heat ticks for damage.', skillCooldownReduce:1, dotDamage:2, bossHpMult:1, css:'biome-server' },
  library:{ id:'library', name:'Library', icon:'📚', desc:'Quiet study room. Insights cost less, but bosses read deeper.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1.2, insightDiscount:0.5, css:'biome-library' },
  cyberpunk:{ id:'cyberpunk', name:'Neon District', icon:'🌆', desc:'Pulse of the city. Bonus damage on active abilities, momentum builds faster.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1.05, activeDmgBoost:0.15, momentumBoost:1, css:'biome-cyberpunk' },
  cathedral:{ id:'cathedral', name:'Cathedral of Logic', icon:'⛪', desc:'Sacred silence. Crits hit harder, but mistakes hurt your streak more.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1.1, critDmgMult:0.25, streakOnFailLoss:1, css:'biome-cathedral' },
  wasteland:{ id:'wasteland', name:'Knowledge Wasteland', icon:'🏜️', desc:'Hostile terrain. DOT chips every turn, but loot rolls higher.', skillCooldownReduce:0, dotDamage:3, bossHpMult:1, lootBonus:0.20, xpBonus:0.10, css:'biome-wasteland' },
  lab:{ id:'lab', name:'Research Lab', icon:'🧪', desc:'Sterile precision. Skills cycle fast, +XP from clean play.', skillCooldownReduce:1, dotDamage:0, bossHpMult:1, xpBonus:0.15, css:'biome-lab' },
  boss_sanctum:{ id:'boss_sanctum', name:'Boss Sanctum', icon:'👑', desc:'Throne room. Fights are heavier — bigger HP, bigger rewards.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1.3, xpBonus:0.30, lootBonus:0.30, activeDmgBoost:0.10, css:'biome-sanctum' },
  void:{ id:'void', name:'The Void', icon:'🌑', desc:'Enemy intent hidden until your streak is steady.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, hideIntent:true, css:'biome-void' },
  foundry:{ id:'foundry', name:'Overclocked Foundry', icon:'🔥', desc:'Heat rewards active play.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, hazard:'heat_stacks', heatDamage:10, activeDmgBoost:0.2, css:'biome-foundry' },
  sky:{ id:'sky', name:'Fragmented Sky', icon:'🌤️', desc:'Some turns scramble your tools.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, hazard:'ui_disable', evasionMult:2, css:'biome-sky' },
  quarantine:{ id:'quarantine', name:'Quarantine Zone', icon:'☣️', desc:'Poison pressure, lower enemy HP.', skillCooldownReduce:0, dotDamage:2, bossHpMult:0.85, healReduction:0.25, css:'biome-quarantine' },
  corridor:{ id:'corridor', name:'Infinite Corridor', icon:'🌀', desc:'Repeating the same move is punished.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, hazard:'deja_vu', critPerUnique:0.05, css:'biome-corridor' },
  deep_web:{ id:'deep_web', name:'The Deep Web', icon:'🌐', desc:'Hidden HP and slippery enemies.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, stealthEnemy:true, evasionMult:1.3, firstStrikeBonus:0.5, css:'biome-deep' },
  high_speed:{ id:'high_speed', name:'High-Speed Server', icon:'⚡', desc:'Fast cooldowns, constant pressure.', skillCooldownReduce:2, dotDamage:1, bossHpMult:1, momentumBoost:1, css:'biome-speed' },
  abandoned:{ id:'abandoned', name:'Abandoned Archive', icon:'🏚️', desc:'More XP, slower combat.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, xpBonus:0.5, combatSlow:0.2, css:'biome-abandoned' },
  default:{ id:'default', name:'Training Room', icon:'🏠', desc:'Normal combat.', skillCooldownReduce:0, dotDamage:0, bossHpMult:1, css:'biome-default' },
};

function getBiome(modId, mode){
  // Boss fights override biome to the Sanctum regardless of module
  if (mode === 'boss') return BIOMES.boss_sanctum;
  const key = String(modId || '').toUpperCase();
  const map = {
    AIG711S:'server_room', DSA711S:'lab', ARI711S:'server_room',
    RWE711S:'library', HIS711S:'cathedral', WEB711S:'cyberpunk',
    CPU711S:'cyberpunk', SPED711S:'high_speed', OLD711S:'wasteland',
    ARC711S:'cathedral', VOID711S:'void', ENGR711S:'foundry',
    HIST711S:'cathedral', BIO711S:'quarantine', LOOP711S:'corridor',
  };
  return BIOMES[map[key] || 'lab'] || BIOMES.default;
}

// List of human-readable modifier descriptions for the active biome — used by the combat banner.
function biomeModifierChips(biome){
  if (!biome) return [];
  const chips = [];
  if (biome.skillCooldownReduce)   chips.push({ label:'Skills -' + biome.skillCooldownReduce + ' CD', tone:'good' });
  if (biome.dotDamage)             chips.push({ label:'DOT ' + biome.dotDamage + '/turn',              tone:'bad' });
  if (biome.bossHpMult && biome.bossHpMult !== 1) chips.push({ label:'Boss HP ' + (biome.bossHpMult > 1 ? '+' : '') + Math.round((biome.bossHpMult - 1) * 100) + '%', tone: biome.bossHpMult > 1 ? 'bad' : 'good' });
  if (biome.activeDmgBoost)        chips.push({ label:'+' + Math.round(biome.activeDmgBoost * 100) + '% active dmg', tone:'good' });
  if (biome.momentumBoost)         chips.push({ label:'+' + biome.momentumBoost + ' momentum/turn',     tone:'good' });
  if (biome.xpBonus)               chips.push({ label:'+' + Math.round(biome.xpBonus * 100) + '% XP',   tone:'good' });
  if (biome.lootBonus)             chips.push({ label:'+' + Math.round(biome.lootBonus * 100) + '% loot', tone:'good' });
  if (biome.insightDiscount)       chips.push({ label:'Insights -' + Math.round(biome.insightDiscount * 100) + '%', tone:'good' });
  if (biome.critDmgMult)           chips.push({ label:'+' + Math.round(biome.critDmgMult * 100) + '% crit dmg', tone:'good' });
  if (biome.hideIntent)            chips.push({ label:'Intent hidden', tone:'bad' });
  if (biome.healReduction)         chips.push({ label:'Heals -' + Math.round(biome.healReduction * 100) + '%', tone:'bad' });
  return chips;
}

const RAID_TYPES = {
  logic_singularity:{ id:'logic_singularity', name:'Logic Singularity', icon:'🧠', desc:'Accuracy and ability tiers. Clone sync, logic stacks, buff deletion.', recommended:'High Accuracy' },
  malware_hive:{ id:'malware_hive', name:'Malware Hive', icon:'🐛', desc:'Multi-target combat, swarm clear, momentum theft.', recommended:'AOE' },
  corrupted_professor:{ id:'corrupted_professor', name:'Corrupted Professor', icon:'👨‍🏫', desc:'1v1 pressure with forbidden actions and doom timers.', recommended:'Streak Management' },
};
const RELIC_MAP = { logic_singularity:'neural_adapter', malware_hive:'bio_upgrade', corrupted_professor:'shadow_badge' };

const LORE_DATA = {
  lore_exam_stress:{ id:'lore_exam_stress', name:'Exam Stress', icon:'📝', desc:'The weight of deadlines...' },
  lore_streak:{ id:'lore_streak', name:'On Streaks', icon:'🔥', desc:'Consistency beats intensity.' },
  lore_ghost:{ id:'lore_ghost', name:'The Ghost Mode', icon:'👻', desc:'What they dont teach in school.' },
  lore_boss:{ id:'lore_boss', name:'Facing the Boss', icon:'👑', desc:'Every boss is a concept you mastered.' },
  lore_passive:{ id:'lore_passive', name:'Passive Growth', icon:'🌱', desc:'Progress happens while you sleep.' },
  lore_cram:{ id:'lore_cram', name:'Cram Mode', icon:'⚡', desc:'Speed over depth, but depth over nothing.' },
  lore_polymath:{ id:'lore_polymath', name:'The Polymath', icon:'🏛️', desc:'Know a little about everything.' },
  lore_weapon:{ id:'lore_weapon', name:'Weapon Mastery', icon:'⚔️', desc:'Master one thing, use it everywhere.' },
  lore_insight:{ id:'lore_insight', name:'Insight', icon:'💡', desc:'Sometimes you need to see the path.' },
  lore_spaced:{ id:'lore_spaced', name:'Spaced Rep', icon:'🔄', desc:'Review, dont reread.' },
  lore_forge:{ id:'lore_forge', name:'The Neural Forge', icon:'🔥', desc:'Lore Fragments can forge legacy.' },
  lore_defrag:{ id:'lore_defrag', name:'The Great De-Frag', icon:'💾', desc:'Fragmented data, unified knowledge.' },
  lore_corruption:{ id:'lore_corruption', name:'Data Corruption', icon:'💀', desc:'1% chance. Never bet everything.' },
  lore_ascension:{ id:'lore_ascension', name:'Ascension', icon:'⚡', desc:'Reset to rise higher.' },
  lore_transcend:{ id:'lore_transcend', name:'Transcendence', icon:'🌟', desc:'Rank X. The final form.' },
};
const LORE_IDS = Object.keys(LORE_DATA);

const FORGE_RECIPES = {
  blade:{ fragments:5, chips:3, legacyName:'Blade of Clarity', legacyIcon:'⚔️' },
  hammer:{ fragments:5, chips:3, legacyName:'Hammer of Dawn', legacyIcon:'🔨' },
  shield:{ fragments:7, chips:5, legacyName:'Aegis Archive', legacyIcon:'🛡️' },
  spellbook:{ fragments:7, chips:5, legacyName:'Tome of Echoes', legacyIcon:'📘' },
  focus:{ fragments:6, chips:4, legacyName:'Crystal of Focus', legacyIcon:'⚡' },
  oracle:{ fragments:8, chips:6, legacyName:"Oracle's Third Eye", legacyIcon:'📖' },
  vanguard:{ fragments:6, chips:4, legacyName:'Fortress Protocol', legacyIcon:'🚩' },
  caveman:{ fragments:4, chips:2, legacyName:'Primordial Thesis', legacyIcon:'🪨' },
};

function dropLoot(raidType, biome){
  const drops = [];
  if (raidType && RELIC_MAP[raidType]){
    const relic = LOOT_TABLE[RELIC_MAP[raidType]];
    if (relic) drops.push({ item:relic, quantity:1 });
  }
  if (!raidType){
    const roll = Math.random();
    const tier = roll < 0.01 ? 'mythic' : roll < 0.07 ? 'legendary' : roll < 0.25 ? 'epic' : roll < 0.50 ? 'rare' : 'common';
    const cfg = LOOT_TIERS[tier];
    if (cfg && cfg.pool.length){
      const item = LOOT_TABLE[cfg.pool[Math.floor(Math.random() * cfg.pool.length)]];
      if (item) drops.push({ item, quantity:1 });
    }
  }
  if (biome?.lootTable?.length){
    const item = LOOT_TABLE[biome.lootTable[Math.floor(Math.random() * biome.lootTable.length)]];
    if (item) drops.push({ item, quantity:1 });
  }
  return drops;
}

function addDropsToInventory(state, drops){
  if (!drops || !drops.length) return state.inventory || {};
  const inv = state.inventory || {};
  const equipment = { ...(inv.equipment || {}) };
  for (const d of drops){
    if (!d.item) continue;
    const cur = equipment[d.item.id] || { id:d.item.id, quantity:0, discovered:false };
    equipment[d.item.id] = { ...cur, quantity:(cur.quantity || 0) + (d.quantity || 1), discovered:true };
  }
  return { ...inv, equipment };
}

function getSocket(key){
  const sockets = (window.__arenaState && window.__arenaState.sockets) || [];
  return sockets.find(a => a && LOOT_TABLE[a]?.effect?.slot === 'weapon' && LOOT_TABLE[a]?.effect?.[key] != null)?.effect?.[key];
}

/* ---------- ARENA STATE HELPERS ---------- */
function initArena(){
  return {
    equipped:'blade',
    dualWeapon:null,
    weapons:{
      blade:{level:1,xp:0,unlocked:true},
      hammer:{level:1,xp:0,unlocked:true},
      shield:{level:1,xp:0,unlocked:true},
      focus:{level:1,xp:0,unlocked:true},
      oracle:{level:1,xp:0,unlocked:true},
      vanguard:{level:1,xp:0,unlocked:true},
      caveman:{level:1,xp:0,unlocked:true},
    },
    unlockedSkills:[],
    hotbar:[null,null,null,null],
    sockets:['silicon_skin','overclock_chip'],
    spSpent:0,
    bossesBeaten:{},
    runStats:{wins:0,losses:0},
    enemies:[],
    targetIndex:0,
    statusEffects: typeof defaultStatusEffects === 'function' ? defaultStatusEffects() : {},
    cram: typeof defaultCramState === 'function' ? defaultCramState() : null,
    pet:null,
    mistakePool:[],
    raidPhase:0,
    raidForbiddenActions:[],
    raidShadowClone:null,
    raidCoresRemaining:0,
    raidQuestionCounter:0,
    raidCorrupted:false,
  };
}

function getWeaponProgress(arena, weaponId){
  const p = (arena.weapons || {})[weaponId] || {};
  return { level:Math.max(1, p.level || 1), xp:Math.max(0, p.xp || 0), unlocked:p.unlocked !== false };
}

function weaponXpNeeded(level){
  return Math.max(100, (level || 1) * 100);
}

function gainWeaponXp(arena, weaponId, amount){
  const current = getWeaponProgress(arena, weaponId);
  let xp = current.xp + Math.max(0, amount || 0);
  let level = current.level;
  let leveled = 0;
  while (xp >= weaponXpNeeded(level)){
    xp -= weaponXpNeeded(level);
    level += 1;
    leveled += 1;
  }
  const weapons = { ...(arena.weapons || {}), [weaponId]:{ ...current, unlocked:true, xp, level } };
  return { arena:{ ...arena, weapons }, leveled, level, xp };
}

function totalSP(state){
  return Math.floor((state.xp || 0) / 50);
}

function availableSP(state, arena){
  return totalSP(state) - (arena.spSpent || 0);
}

function moduleSkill(state, mod){
  const sr = state.sr || {};
  let mastered = 0;
  for (const lv of mod.levels){
    for (const c of lv.concepts){
      if (c.questions.some(q => (sr[q.id] || {}).interval >= 7)) mastered++;
    }
  }
  const total = mod.levels.reduce((a, lv) => a + lv.concepts.length, 0);
  return { level:Math.min(10, Math.floor(mastered / 2)), mastered, total };
}

function genBosses(mod){
  const subj = mod.name || mod.id;
  return [
    { id:mod.id+'_t1', tier:'normal', tierNum:1, name:'The Apprentice', subject:subj, emoji:'🤖', hp:60, dmg:{light:7,heavy:13}, pattern:['light','light','heavy'] },
    { id:mod.id+'_t2', tier:'elite', tierNum:2, name:'The Champion', subject:subj, emoji:'🤺', hp:110, dmg:{light:9,heavy:17}, pattern:['light','heavy','light','heavy','light'] },
    { id:mod.id+'_t3', tier:'boss', tierNum:3, name:'The Sovereign', subject:subj, emoji:'👑', hp:170, dmg:{light:11,heavy:22}, pattern:['light','heavy','heavy','light','heavy'] },
  ];
}

function arenaQuestions(mod, n, levelId, conceptFilter){
  const fast = new Set(['mcq','tf','define','code_output','code_fill']);
  const allowConcept = conceptFilter && conceptFilter.length ? new Set(conceptFilter) : null;
  const levels = levelId ? mod.levels.filter(l => l.id === levelId) : mod.levels;
  const all = levels.flatMap(l => l.concepts.flatMap(c => {
    if (allowConcept && !allowConcept.has(c.id)) return [];
    return c.questions
      .filter(q => fast.has(q.type) || q.choices)
      .map(q => ({ ...q, conceptId:c.id, conceptName:c.name, conceptNotes:c.notes, levelName:l.name }));
  }));
  return shuffle(all).slice(0, n || 50);
}

function getAbilityDesc(a, weaponLevel){
  if (!a) return '';
  return a.getDesc ? a.getDesc(weaponLevel || 1) : (a.desc || '');
}

