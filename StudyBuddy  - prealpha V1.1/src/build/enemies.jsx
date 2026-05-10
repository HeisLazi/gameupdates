/* ==========================================================================
 * enemies.jsx · Enemy ability registry · Passives · Factory · Resolver
 *
 * Splice position: after caveman.jsx, before multimob.jsx (multimob calls
 *                  the resolvers + factory defined here).
 * Defines:  ENEMY_ABILITIES (30 entries, tiered minion/elite/boss),
 *           ENEMY_PASSIVES (18 entries), generateEnemy, resolveEnemyAction,
 *           applyEnemyPassivesOnHit, onEnemyDeath, applySpawnTimePassives.
 * Reads:    nothing critical from upstream (pure registry + factory).
 *
 * Edit when: adding/balancing enemy abilities or passives, changing the
 * factory's HP/pattern/passive rolls, or tweaking how passives affect
 * incoming hits / death.
 * ========================================================================== */
/* ============ ENEMY ABILITY REGISTRY + PASSIVES + FACTORY ============ *
 * Splice into build_html.py BEFORE arena.jsx (after bonuses.jsx).
 */

const ENEMY_ABILITIES = {
  /* ===== MINION TIER ===== */
  mob_scratch:       { id:'mob_scratch',       name:'Scratch',       icon:'🐾', intent:'light_dmg',  tier:'minion', desc:'Light slash. Pure pressure damage that scales lightly with level.', getDmg:(lvl)=>5+lvl },
  mob_bite:          { id:'mob_bite',          name:'Bite',          icon:'🦷', intent:'med_dmg',    tier:'minion', desc:'A solid chomp. Mid-tier damage; commits the enemy to attack.', getDmg:(lvl)=>8+(lvl*2) },
  mob_defend:        { id:'mob_defend',        name:'Hunker Down',   icon:'🛡️', intent:'defend',    tier:'minion', desc:'Curls up. Gains block this turn — your attack mostly absorbed.', getDmg:()=>0, getBlock:(lvl)=>10+lvl },
  mob_distract:      { id:'mob_distract',      name:'Distract',      icon:'🗣️', intent:'utility',   tier:'minion', desc:'Yells in your face. Drains 1 momentum.', getDmg:()=>0, effect:'drain_momentum' },
  mob_steal:         { id:'mob_steal',         name:'Pickpocket',    icon:'🖐️', intent:'utility',   tier:'minion', desc:'Light hit + steals 1 insight from your balance.', getDmg:(lvl)=>2+lvl, effect:'drain_insight' },
  mob_poison_dart:   { id:'mob_poison_dart',   name:'Poison Dart',   icon:'🎯', intent:'debuff',    tier:'minion', desc:'Applies poison stacks. Ticks damage every turn until cleared.', getDmg:()=>0, effect:'apply_poison' },
  mob_kamikaze:      { id:'mob_kamikaze',      name:'Cram Crash',    icon:'💥', intent:'heavy_dmg', tier:'minion', desc:'Self-destructs for huge damage. Dies after — no XP from kill.', getDmg:(lvl)=>25+(lvl*2), effect:'self_destruct' },
  mob_cower:         { id:'mob_cower',         name:'Cower',         icon:'🫣', intent:'defend',    tier:'minion', desc:'Hides. Gains evasion — 30% chance to dodge your next hit.', getDmg:()=>0, effect:'gain_evasion' },
  mob_leech:         { id:'mob_leech',         name:'Leech',         icon:'🦟', intent:'heal',      tier:'minion', desc:'Bites and drinks. Damages you AND heals itself by the same amount.', getDmg:(lvl)=>5+lvl, getHeal:(lvl)=>5+lvl },
  mob_taunt:         { id:'mob_taunt',         name:'Taunt',         icon:'🤬', intent:'utility',   tier:'minion', desc:'Forces you to target THIS enemy until it dies. Ignored on solo fights.', getDmg:()=>0, effect:'force_target' },

  /* ===== ELITE TIER ===== */
  elite_cleave:      { id:'elite_cleave',      name:'Cleave',        icon:'🪓', intent:'heavy_dmg', tier:'elite', desc:'Wide swing. Heavy damage; block helps a lot here.', getDmg:(lvl)=>15+(lvl*3) },
  elite_siphon:      { id:'elite_siphon',      name:'Siphon',        icon:'🩸', intent:'heal',      tier:'elite', desc:'Drains your HP and heals itself for the same amount.', getDmg:(lvl)=>10+lvl, getHeal:(lvl)=>10+lvl },
  elite_rally:       { id:'elite_rally',       name:'Rallying Cry',  icon:'📢', intent:'buff',      tier:'elite', desc:'Buffs all allies — they deal +X bonus damage permanently this fight.', getDmg:()=>0, effect:'buff_allies_dmg' },
  elite_confuse:     { id:'elite_confuse',     name:'Confuse',       icon:'❓', intent:'debuff',    tier:'elite', desc:'Drains insights. Big problem if you were planning to spend them.', getDmg:()=>0, effect:'drain_insight' },
  elite_amnesia:     { id:'elite_amnesia',     name:'Amnesia',       icon:'🌀', intent:'debuff',    tier:'elite', desc:'Resets your streak to 0. Light damage too. Brutal early.', getDmg:(lvl)=>5+lvl, effect:'reset_streak' },
  elite_brain_fog:   { id:'elite_brain_fog',   name:'Brain Fog',     icon:'☁️', intent:'debuff',    tier:'elite', desc:'+1 to all your active ability cooldowns. Slows your kit.', getDmg:()=>0, effect:'increase_cooldowns' },
  elite_barrier:     { id:'elite_barrier',     name:'Group Barrier', icon:'🛡️', intent:'buff',      tier:'elite', desc:'Shields every living ally with block. Multi-mob nightmare.', getDmg:()=>0, effect:'shield_allies' },
  elite_enrage:      { id:'elite_enrage',      name:'Enrage',        icon:'💢', intent:'buff',      tier:'elite', desc:'Permanent +damage stack on all allies. Pressure ramps fast.', getDmg:()=>0, effect:'permanent_dmg_up' },
  elite_vampiric:    { id:'elite_vampiric',    name:'Vampiric Strike',icon:'🦇',intent:'heavy_dmg', tier:'elite', desc:'Heavy hit + heals every other ally for a portion of the damage.', getDmg:(lvl)=>20+(lvl*2), effect:'heal_all_allies' },
  elite_sabotage:    { id:'elite_sabotage',    name:'Sabotage',      icon:'🔧', intent:'debuff',    tier:'elite', desc:'Hits AND applies anti-heal — your heals are 50% effective for 3 turns.', getDmg:(lvl)=>10+lvl, effect:'anti_heal' },

  /* ===== BOSS TIER ===== */
  boss_charge_up:    { id:'boss_charge_up',    name:'Charging…',     icon:'⏳', intent:'telegraph', tier:'boss', desc:'Wind-up. Telegraphs a massive attack on its NEXT turn — prepare to block hard.', getDmg:()=>0 },
  boss_soul_nuke:    { id:'boss_soul_nuke',    name:'Exam Failure',  icon:'☄️', intent:'fatal_dmg', tier:'boss', desc:'Massive nuke after a charge-up. Will likely one-shot if not blocked.', getDmg:(lvl)=>40+(lvl*5) },
  boss_summon_minions:{ id:'boss_summon_minions', name:'Call Backup', icon:'📯', intent:'summon',   tier:'boss', desc:'Summons 2 minions to the field. Multi-mob pressure spike.', getDmg:()=>0, spawnTier:'minion', spawnCount:2 },
  boss_summon_elite: { id:'boss_summon_elite', name:'Summon Proctor',icon:'🕴️', intent:'summon',    tier:'boss', desc:'Summons 1 elite ally. Adds a major target you also need to handle.', getDmg:()=>0, spawnTier:'elite', spawnCount:1 },
  boss_silence:      { id:'boss_silence',      name:'Mental Blank',  icon:'😶‍🌫️', intent:'debuff', tier:'boss', desc:'Locks all your advanced-tier abilities for 3 turns. Forces basic kit.', getDmg:()=>0, effect:'lock_advanced_skills' },
  boss_mind_control: { id:'boss_mind_control', name:'Mind Control',  icon:'😵‍💫', intent:'debuff', tier:'boss', desc:'Your next attack hits YOU instead of the enemy. Skip a turn or eat it.', getDmg:()=>0, effect:'attack_self' },
  boss_rewrite:      { id:'boss_rewrite',      name:'Rewrite Rules', icon:'📜', intent:'utility',   tier:'boss', desc:'Wipes all your active buffs. Resets the fight in the boss\'s favour.', getDmg:()=>0, effect:'wipe_player_buffs' },
  boss_gravity:      { id:'boss_gravity',      name:'Exam Stress',   icon:'⏬', intent:'fatal_dmg', tier:'boss', desc:'Halves your current HP. Cannot kill but leaves you vulnerable.', getDmg:()=>0, effect:'halve_player_hp' },
  boss_time_warp:    { id:'boss_time_warp',    name:'Time Warp',     icon:'⌛', intent:'utility',   tier:'boss', desc:'Steals all your current momentum. Cooldown bypass becomes very expensive.', getDmg:()=>0, effect:'steal_all_momentum' },
  boss_ultimatum:    { id:'boss_ultimatum',    name:'Ultimatum…',    icon:'⚖️', intent:'telegraph', tier:'boss', desc:'Sets up a multi-turn check — answer 3 in a row correctly OR take massive damage.', getDmg:()=>0, effect:'ultimatum_check' },
};

const ENEMY_PASSIVES = {
  /* MINION */
  passive_swarm:        { id:'passive_swarm',        name:'Swarm Tactics', tier:'minion', desc:'+2 damage per other living enemy.' },
  passive_frail:        { id:'passive_frail',        name:'Frail',         tier:'minion', desc:'Takes 2× damage from Critical Hits.' },
  passive_explosive:    { id:'passive_explosive',    name:'Volatile',      tier:'minion', desc:'On death, deals 10 damage to player.' },
  passive_evasive:      { id:'passive_evasive',      name:'Evasive',       tier:'minion', desc:'20% chance to dodge any player attack.' },
  passive_coward:       { id:'passive_coward',       name:'Coward',        tier:'minion', desc:'If last enemy alive, flees (no XP granted).' },
  passive_pack:         { id:'passive_pack',         name:'Pack Mentality',tier:'minion', desc:'+5 Max HP per other living enemy at spawn.' },

  /* ELITE */
  passive_thick_hide:   { id:'passive_thick_hide',   name:'Thick Hide',    tier:'elite', desc:'Reduces incoming damage by 5.' },
  passive_spikes:       { id:'passive_spikes',       name:'Spiked Armor',  tier:'elite', desc:'When player attacks this, player takes 3 damage.' },
  passive_anti_magic:   { id:'passive_anti_magic',   name:'Anti-Magic',    tier:'elite', desc:'Tree-source abilities deal 50% less damage.' },
  passive_punisher:     { id:'passive_punisher',     name:'Punisher',      tier:'elite', desc:'Deals 2× damage if player streak is 0.' },
  passive_thorns:       { id:'passive_thorns',       name:'Thorns',        tier:'elite', desc:'Reflects 20% of damage taken back to player.' },
  passive_regenerator:  { id:'passive_regenerator',  name:'Regenerator',   tier:'elite', desc:'Heals 5 HP each turn.' },

  /* BOSS */
  passive_unstoppable:  { id:'passive_unstoppable',  name:'Unstoppable',   tier:'boss',  desc:'Immune to skip-turn effects.' },
  passive_adaptive:     { id:'passive_adaptive',     name:'Adaptive',      tier:'boss',  desc:'Player using same ability twice in a row deals 50% less damage.' },
  passive_boss_armor:   { id:'passive_boss_armor',   name:'Boss Armor',    tier:'boss',  desc:'Single-hit damage capped at 50.' },
  passive_second_phase: { id:'passive_second_phase', name:'Second Phase',  tier:'boss',  desc:'Once per fight, on death revive at 50% HP.' },
  passive_jealousy:     { id:'passive_jealousy',     name:'Jealousy',      tier:'boss',  desc:'+3 damage per Insight player holds.' },
  passive_academic_probation:{ id:'passive_academic_probation', name:'Academic Probation', tier:'boss', desc:'While alive, player healing capped at 50% Max HP.' },
  passive_knowledge_eater:{ id:'passive_knowledge_eater', name:'Knowledge Eater', tier:'boss', desc:'Heals 20 HP whenever player answers wrong.' },
};

function _pickFromTier(registry, tier, count){
  const pool = Object.values(registry).filter(x => x.tier === tier);
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a.slice(0, count);
}

function generateEnemy(name, tier, level, opts){
  opts = opts || {};
  const lvl = Math.max(1, level || 1);
  const tierConfig = {
    minion: { hp: 20 + lvl*5,   patternLen: 3, passives: 1, emoji:'👾' },
    elite:  { hp: 60 + lvl*15,  patternLen: 4, passives: 1, emoji:'🤺' },
    boss:   { hp: 150 + lvl*30, patternLen: 5, passives: 2, emoji:'👑' },
  };
  const cfg = tierConfig[tier] || tierConfig.minion;
  const abilityPool = opts.abilityWhitelist
    ? Object.values(ENEMY_ABILITIES).filter(a => opts.abilityWhitelist.includes(a.id))
    : Object.values(ENEMY_ABILITIES).filter(a => a.tier === tier);
  const a = abilityPool.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  const pattern = a.slice(0, cfg.patternLen).map(x => x.id);
  const passivePool = opts.passiveWhitelist
    ? Object.values(ENEMY_PASSIVES).filter(p => opts.passiveWhitelist.includes(p.id))
    : Object.values(ENEMY_PASSIVES).filter(p => p.tier === tier);
  const passives = _pickFromTier({...passivePool.reduce((acc,p)=>{acc[p.id]=p;return acc;},{})}, tier, cfg.passives).map(p => p.id);
  return {
    id: 'enemy_' + tier + '_' + Date.now() + '_' + Math.floor(Math.random()*1000),
    name: opts.name || (tier === 'minion' ? 'Minion' : tier === 'elite' ? 'Elite' : 'Boss'),
    emoji: opts.emoji || cfg.emoji,
    type: tier, tier: tier, level: lvl,
    hp: opts.hpOverride || cfg.hp,
    maxHp: opts.hpOverride || cfg.hp,
    block: 0,
    pattern, patternIndex: 0,
    passives,
    enrageBonus: 0, hasRevived: false, hasEvasion: false, isShielded: false,
  };
}

function resolveEnemyAction(enemy, state, allEnemies){
  const log = [];
  const result = { enemy:{...enemy}, log, dmgToPlayer:0, summons:[], effects:{}, wasEvaded:false, selfDestructed:false };
  const ability = ENEMY_ABILITIES[enemy.pattern[enemy.patternIndex % enemy.pattern.length]];
  if (!ability){
    result.enemy.patternIndex = (enemy.patternIndex + 1) % enemy.pattern.length;
    return result;
  }

  let dmg = ability.getDmg ? ability.getDmg(enemy.level || 1) : 0;
  dmg += enemy.enrageBonus || 0;

  if ((enemy.passives||[]).includes('passive_swarm')){
    const others = allEnemies.filter(e => e.hp > 0 && e.id !== enemy.id).length;
    if (others > 0) dmg += 2 * others;
  }
  if ((enemy.passives||[]).includes('passive_punisher') && (state.streak?.count||0) === 0){
    dmg = dmg * 2;
    log.push(`${enemy.name} punishes broken streak — doubled damage`);
  }
  if ((enemy.passives||[]).includes('passive_jealousy')){
    dmg += 3 * (state.insights || 0);
  }

  result.dmgToPlayer = dmg;
  if (dmg > 0) log.push(`${enemy.emoji} ${enemy.name}: ${ability.name} → ${dmg} dmg`);
  else if (ability.intent !== 'telegraph') log.push(`${enemy.emoji} ${enemy.name}: ${ability.name}`);

  if (ability.getHeal){
    const h = ability.getHeal(enemy.level || 1);
    result.enemy.hp = Math.min(enemy.maxHp, enemy.hp + h);
    log.push(`${enemy.name} healed +${h}`);
  }
  if (ability.getBlock){
    const b = ability.getBlock(enemy.level || 1);
    result.enemy.block = (enemy.block || 0) + b;
    log.push(`${enemy.name} blocks ${b}`);
  }

  switch (ability.effect){
    case 'drain_momentum':       result.effects.drainMomentum = 1; break;
    case 'drain_insight':        result.effects.drainInsight = 1; break;
    case 'apply_poison':         result.effects.applyPoison = 3; break;
    case 'self_destruct':        result.selfDestructed = true; result.enemy.hp = 0; break;
    case 'gain_evasion':         result.enemy.hasEvasion = true; break;
    case 'force_target':         result.effects.forceTargetId = enemy.id; break;
    case 'reset_streak':         result.effects.resetStreak = true; break;
    case 'increase_cooldowns':   result.effects.increaseCooldowns = 1; break;
    case 'buff_allies_dmg':      result.effects.buffAlliesDmg = 5; break;
    case 'shield_allies':        result.effects.shieldAllies = 15; break;
    case 'permanent_dmg_up':     result.enemy.enrageBonus = (enemy.enrageBonus || 0) + 5; log.push(`${enemy.name} enraged (+5 permanent)`); break;
    case 'heal_all_allies':      result.effects.healAlliesPct = 0.5; break;
    case 'anti_heal':            result.effects.antiHeal = true; break;
    case 'lock_advanced_skills': result.effects.lockAdvanced = true; break;
    case 'attack_self':          result.effects.attackSelf = true; break;
    case 'wipe_player_buffs':    result.effects.wipePlayerBuffs = true; break;
    case 'halve_player_hp':      result.effects.halveHp = true; break;
    case 'steal_all_momentum':   result.effects.stealAllMomentum = true; break;
    case 'ultimatum_check':      result.effects.ultimatumCheck = true; break;
  }

  if (ability.intent === 'summon' && ability.spawnTier){
    for (let i = 0; i < (ability.spawnCount || 1); i++){
      result.summons.push(generateEnemy(
        ability.spawnTier === 'elite' ? 'Summoned Proctor' : 'Summoned Add',
        ability.spawnTier,
        Math.max(1, (enemy.level||1) - 1)
      ));
    }
    log.push(`${enemy.name} summons ${ability.spawnCount || 1} ${ability.spawnTier}(s)`);
  }

  if ((enemy.passives||[]).includes('passive_regenerator')){
    result.enemy.hp = Math.min(enemy.maxHp, result.enemy.hp + 5);
    log.push(`${enemy.name} regens +5 HP`);
  }

  result.enemy.patternIndex = (enemy.patternIndex + 1) % enemy.pattern.length;
  return result;
}

function applyEnemyPassivesOnHit(enemy, dmgIn, ctx){
  const log = [];
  let dmg = dmgIn;
  let reflected = 0;
  ctx = ctx || {};
  const passives = enemy.passives || [];

  if (passives.includes('passive_evasive') && Math.random() < 0.20){
    log.push(`${enemy.name} dodged the attack`);
    return { dmgFinal: 0, dmgReflectedToPlayer: 0, log, dodged: true };
  }
  if (enemy.hasEvasion){
    log.push(`${enemy.name} evaded (cower)`);
    return { dmgFinal: 0, dmgReflectedToPlayer: 0, log, dodged: true, clearEvasion: true };
  }
  if (passives.includes('passive_thick_hide')){
    dmg = Math.max(1, dmg - 5);
  }
  if (passives.includes('passive_anti_magic') && ctx.abilitySource === 'tree'){
    dmg = Math.floor(dmg * 0.5);
    log.push(`${enemy.name} resists the tree spell (×0.5)`);
  }
  if (passives.includes('passive_adaptive') && ctx.lastPlayerAbility && ctx.currentPlayerAbility === ctx.lastPlayerAbility){
    dmg = Math.floor(dmg * 0.5);
    log.push(`${enemy.name} adapted to repeat ability (×0.5)`);
  }
  if (passives.includes('passive_boss_armor') && dmg > 50){
    dmg = 50;
    log.push(`${enemy.name} caps the hit at 50`);
  }
  if (passives.includes('passive_frail') && ctx.wasCrit){
    dmg = dmg * 2;
    log.push(`${enemy.name} took 2× from crit`);
  }
  if (passives.includes('passive_thorns')){
    reflected = Math.floor(dmg * 0.20);
    if (reflected > 0) log.push(`Thorns reflect ${reflected} damage back`);
  }
  if (passives.includes('passive_spikes')){
    reflected += 3;
    log.push(`Spikes prick for 3 damage`);
  }
  return { dmgFinal: dmg, dmgReflectedToPlayer: reflected, log };
}

function onEnemyDeath(enemy, allEnemies){
  const log = [];
  let extraDmgToPlayer = 0;
  let suppressXp = false;
  let revivedEnemy = null;
  const passives = enemy.passives || [];

  if (passives.includes('passive_explosive')){
    extraDmgToPlayer += 10;
    log.push(`${enemy.name} explodes — 10 dmg to player`);
  }
  if (passives.includes('passive_coward') && allEnemies.filter(e => e.hp > 0 && e.id !== enemy.id).length === 0){
    suppressXp = true;
    log.push(`${enemy.name} flees — no XP`);
  }
  if (passives.includes('passive_second_phase') && !enemy.hasRevived){
    revivedEnemy = { ...enemy, hp: Math.floor(enemy.maxHp * 0.5), hasRevived: true };
    log.push(`${enemy.name} enters Phase 2 (revived at 50%)`);
  }
  return { extraDmgToPlayer, suppressXp, log, revivedEnemy };
}

function applySpawnTimePassives(enemy, allEnemies){
  const out = {...enemy};
  if ((out.passives||[]).includes('passive_pack')){
    const others = allEnemies.filter(e => e.id !== out.id).length;
    out.maxHp = out.maxHp + (5 * others);
    out.hp = out.hp + (5 * others);
  }
  return out;
}
