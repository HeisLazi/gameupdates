/* ==========================================================================
 * combat.jsx · THE CombatScreen + ResultScreen + buildInitialArenaFight
 *
 * Splice position: after raids.jsx, before arena_views.jsx (the arena hub
 *                  + LoadoutView + WorkshopView all reference CombatScreen
 *                  and ResultScreen at render time).
 * Defines:  arenaNormText, arenaChoiceLabel, arenaAnswerChoices,
 *           arenaIsCorrect, buildArenaEnemy, buildInitialArenaFight,
 *           applyDamageToArenaEnemy, CombatScreen (the flagship — ~880
 *           lines), ResultScreen.
 * Reads:    Almost everything — getCombinedStats, ABILITIES, WEAPONS,
 *           generateEnemy, applyEnemyPassivesOnHit, runEnemyTurn,
 *           getBiome, biomeModifierChips, dropLoot, addDropsToInventory,
 *           getAugmentBonuses, all pet hooks (petOnCorrect, petOnEnemyKilled,
 *           petOnTurnStart, petOnWrong, petOnStreakLoss, petOnLethal,
 *           petDamageMultiplier), recordBestiaryEncounter,
 *           recordBestiaryMistake, defaultCramState, buildCramBoss,
 *           cramBossQuestions, arenaQuestions, MultiEnemyHUD.
 *
 * THIS IS THE FLAGSHIP SCREEN. 95% of combat logic lives here. Pet hooks
 * fire from inside the answer-submit path; once-per-fight pets are tracked
 * via useRef so React re-renders don't re-trigger them.
 *
 * Edit when: changing how player damage / answers / abilities resolve,
 * adding new combat status effects, fixing pet hook timing, or porting a
 * new visual layout from the design handoff.
 * ========================================================================== */
/* ============ ARENA COMBAT + RESULTS ============ */

function arenaNormText(v){
  return String(v ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function arenaChoiceLabel(v){
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  return String(v);
}

function arenaAnswerChoices(q){
  if (!q) return [];
  if (q.type === 'tf') return [true, false];
  return Array.isArray(q.choices) ? q.choices : [];
}

function arenaIsCorrect(q, answer){
  if (!q) return false;
  if (q.type === 'tf') return answer === q.answer || String(answer) === String(q.answer);
  const expected = q.answer;
  if (Array.isArray(q.choices) || q.type === 'mcq' || q.type === 'code_output'){
    return String(answer) === String(expected);
  }
  const a = arenaNormText(answer);
  const e = arenaNormText(expected);
  if (!a || !e) return false;
  if (a === e || a.includes(e) || e.includes(a)) return true;
  if (q.keywords && q.keywords.length){
    const words = new Set(a.split(/\s+/));
    const hits = q.keywords.filter(k => words.has(arenaNormText(k))).length;
    return hits / q.keywords.length >= 0.5;
  }
  return false;
}

function buildArenaEnemy(boss, mode, skill, mod, state){
  const biome = getBiome(mod.id, mode);
  const tier = mode === 'boss' ? 'boss' : mode === 'elite' ? 'elite' : 'minion';
  const generated = (typeof generateEnemy === 'function' && mode !== 'practice')
    ? generateEnemy(boss.name, tier, Math.max(1, skill?.level || 1), { name:boss.name, emoji:boss.emoji })
    : null;
  const prestigeScale = 1 + ((state.prestigeRank || 0) * 0.10);
  const hp = Math.max(1, Math.round((boss.hp || generated?.hp || 80) * (biome.bossHpMult || 1) * prestigeScale));
  return {
    ...(generated || {}),
    id: boss.id || ('boss_' + Date.now()),
    name: boss.name || generated?.name || 'Boss',
    emoji: boss.emoji || generated?.emoji || '👑',
    tier,
    type: tier,
    level: Math.max(1, skill?.level || generated?.level || 1),
    hp,
    maxHp: hp,
    block: generated?.block || 0,
    pattern: generated?.pattern?.length ? generated.pattern : (boss.pattern || ['mob_scratch','mob_bite','mob_defend']),
    patternIndex: 0,
    passives: generated?.passives || [],
    enrageBonus: 0,
    hasRevived: false,
    hasEvasion: false,
  };
}

function buildInitialArenaFight(mod, boss, mode, levelId, skill, state, conceptFilter){
  const lvl = Math.max(1, skill?.level || 1);
  const mkMinion = () => typeof generateEnemy === 'function'
    ? generateEnemy('Minion', 'minion', lvl)
    : buildArenaEnemy(boss, 'street', skill, mod, state);
  const mkElite = () => typeof generateEnemy === 'function'
    ? generateEnemy(boss.name || 'Elite', 'elite', lvl, { name: boss.name, emoji: boss.emoji })
    : buildArenaEnemy(boss, 'elite', skill, mod, state);

  let enemies;
  if (mode === 'cram'){
    const cram = (state?.arena && state.arena.cram) || defaultCramState();
    if (cram.bossPhase && typeof buildCramBoss === 'function'){
      enemies = [buildCramBoss(mod, lvl)];
    } else {
      enemies = typeof generateCramWaveV2 === 'function'
        ? generateCramWaveV2(mod, cram.waveIndex || 0)
        : [buildArenaEnemy(boss, mode, skill, mod, state)];
    }
  } else if (mode === 'street'){
    const count = 1 + Math.floor(Math.random() * 3);
    enemies = Array.from({ length: count }, mkMinion);
  } else if (mode === 'elite'){
    const addCount = 1 + Math.floor(Math.random() * 2);
    enemies = [mkElite(), ...Array.from({ length: addCount }, mkMinion)];
  } else {
    enemies = [buildArenaEnemy(boss, mode, skill, mod, state)];
  }
  let questions = arenaQuestions(mod, 50, levelId, conceptFilter || boss.conceptFilter);
  if (mode === 'cram' && state?.arena?.cram?.bossPhase && typeof cramBossQuestions === 'function'){
    const bossQuestions = cramBossQuestions(mod, state, 50);
    if (bossQuestions.length) questions = bossQuestions;
  }
  return { enemies, questions };
}

function applyDamageToArenaEnemy(enemy, allEnemies, rawDmg, ctx){
  let target = { ...enemy };
  let log = [];
  let reflected = 0;
  let killed = null;
  const pass = typeof applyEnemyPassivesOnHit === 'function'
    ? applyEnemyPassivesOnHit(target, Math.max(0, Math.round(rawDmg)), ctx)
    : { dmgFinal:Math.max(0, Math.round(rawDmg)), dmgReflectedToPlayer:0, log:[] };
  log = log.concat(pass.log || []);
  reflected += pass.dmgReflectedToPlayer || 0;
  let dmg = pass.dmgFinal || 0;
  if (pass.dodged){
    if (pass.clearEvasion) target.hasEvasion = false;
    return { enemy:target, killed:null, reflected, log };
  }
  if ((target.block || 0) > 0 && dmg > 0){
    const absorbed = Math.min(target.block, dmg);
    target.block -= absorbed;
    dmg -= absorbed;
    if (absorbed > 0) log.push(`${target.name} blocks ${absorbed}`);
  }
  target.hp = Math.max(0, target.hp - dmg);
  if (dmg > 0) log.push(`${target.name} takes ${dmg} damage`);
  if (target.hp === 0){
    const death = typeof onEnemyDeath === 'function'
      ? onEnemyDeath(target, allEnemies)
      : { log:[], extraDmgToPlayer:0, suppressXp:false, revivedEnemy:null };
    log = log.concat(death.log || []);
    if (death.revivedEnemy){
      target = death.revivedEnemy;
    } else {
      killed = { enemy:target, extraDmgToPlayer:death.extraDmgToPlayer || 0, suppressXp:!!death.suppressXp };
    }
  }
  return { enemy:target, killed, reflected, log };
}

function callArenaAbility(fn, args, fallback){
  if (typeof fn !== 'function') return fallback;
  try {
    const v = fn(...args);
    return v == null ? fallback : v;
  } catch(e){
    return fallback;
  }
}

function CombatScreen({ mod, boss, mode, levelId, conceptFilter, arena, skill, state, setState, onEnd }){
  const conceptKey = JSON.stringify(conceptFilter || boss?.conceptFilter || []);
  const initial = useMemo(()=>buildInitialArenaFight(mod, boss, mode, levelId, skill, state, conceptFilter), [mod.id, boss?.id, mode, levelId, conceptKey]);
  const weapon = getWeaponDef(arena.equipped || 'blade');
  const weaponProg = getWeaponProgress(arena, weapon.id);
  const cramStateForFight = mode === 'cram' ? ((state.arena && state.arena.cram) || (arena.cram || defaultCramState())) : null;
  const cramDraftedAbilities = cramStateForFight?.draftedAbilities || [];
  const combatArena = mode === 'cram'
    ? { ...arena, unlockedSkills:Array.from(new Set([...(arena.unlockedSkills || []), ...cramDraftedAbilities])) }
    : arena;
  const combined = getCombinedStats({ ...state, arena:combatArena });
  const biome = getBiome(mod.id, mode);
  const prestige = prestigeFlags(state);
  const baseMaxHp = mode === 'practice' ? 999 : 100;
  const computedMaxHp = Math.max(1, Math.round((combined.hpCap || (baseMaxHp + (combined.maxHpBonus || 0) + (skill?.level || 0) * 4)) * (mode === 'cram' ? CRAM_HP_MULT : 1)));

  const [questions, setQuestions] = useState(initial.questions);
  const [idx, setIdx] = useState(0);
  const [enemies, setEnemies] = useState(initial.enemies);
  const [targetIndex, setTargetIndex] = useState(0);
  const [hp, setHp] = useState(computedMaxHp);
  const [block, setBlock] = useState(combined.blockPerTurn || 0);
  const [momentum, setMomentum] = useState(Math.min(3 + (combined.maxMomentumBonus || 0), combined.startMomentum || 0));
  const [combo, setCombo] = useState(state.streak?.count || 0);
  const [cooldowns, setCooldowns] = useState({});
  const [actionId, setActionId] = useState(weapon.basic);
  const [feedback, setFeedback] = useState('Choose an action, then answer.');
  const [log, setLog] = useState([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [hiddenChoices, setHiddenChoices] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [usedInsights, setUsedInsights] = useState(0);
  const [insightBalance, setInsightBalance] = useState(state.insights || 0);
  const [lastAbility, setLastAbility] = useState(null);
  const [buffs, setBuffs] = useState({});
  const [mistakeIds, setMistakeIds] = useState([]);
  const [ended, setEnded] = useState(false);
  const [petLog, setPetLog] = useState([]);
  // Once-per-fight pet flags (refs so we don't trigger re-renders mid-resolve)
  const petFlags = useRef({ insightOwlFired:false, beetleUses:0, beetleMaxUses: typeof petBeetleMaxUses === 'function' ? petBeetleMaxUses(state) : 1, dogFired:false, beetleNextReveal:false });
  // Per-fight stat accumulator — flushed at finishCombat
  const combatStats = useRef({ correct: 0, incorrect: 0, dmgDealt: 0, dmgTaken: 0 });

  useEffect(()=>{ window.__arenaState = arena; }, [arena]);

  if (!questions.length){
    return (
      <div className="card">
        <h2>⚔️ Arena</h2>
        <p className="muted">This module has no combat-ready questions yet.</p>
        <button className="btn ghost" onClick={()=>onEnd({won:false,xpAwarded:0,drops:[],reason:'No combat-ready questions'})}>Back to Arena</button>
      </div>
    );
  }

  const q = questions[idx % questions.length];
  const maxMomentum = 3 + (combined.maxMomentumBonus || 0);
  const living = enemies.filter(e => e.hp > 0);
  const target = enemies[targetIndex]?.hp > 0 ? enemies[targetIndex] : living[0];
  const targetIdx = target ? enemies.findIndex(e => e.id === target.id) : 0;
  const allowedInsights = mode !== 'boss';
  const maxInsightUses = mode === 'elite' ? 2 : null;
  const currentAction = actionId === 'guard'
    ? { id:'guard', name:'Guard', icon:'🛡️', source:'basic', kind:'active', tier:'basic', desc:'Block this turn and soften enemy attacks.', onBlock:(b)=>b + 12 }
    : (ABILITIES[actionId] || ABILITIES[weapon.basic]);

  const draftedActiveIds = cramDraftedAbilities.filter(id => {
    const ability = typeof ABILITIES !== 'undefined' ? ABILITIES[id] : null;
    return ability && ability.kind !== 'passive';
  });
  const actionIds = weaponAbilityIds(weapon)
    .concat(mode === 'cram' ? draftedActiveIds : (arena.hotbar || []))
    .filter(Boolean);
  const actionCards = [{ id:'guard', name:'Guard', icon:'🛡️', desc:'Block this turn.', tier:'basic', kind:'active' }]
    .concat(actionIds.map(id => ABILITIES[id]).filter(Boolean));

  const actionCardsKey = actionCards.map(a=>a.id).join(',');
  useEffect(()=>{
    const onKey = (e)=>{
      if (ended) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= 9){
        const card = actionCards[n-1];
        if (!card) return;
        const ready = !(card.reqWeaponLvl && weaponProg.level < card.reqWeaponLvl)
                   && !(card.reqStreak && combo < card.reqStreak)
                   && !((cooldowns[card.id] || 0) > 0)
                   && card.kind !== 'passive';
        if (ready) setActionId(card.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [ended, actionCardsKey, weaponProg.level, combo, cooldowns]);

  const canUseInsight = (cost)=> allowedInsights && insightBalance >= cost && (maxInsightUses == null || usedInsights < maxInsightUses);
  const spendInsight = (cost)=>{
    if (!canUseInsight(cost)) return false;
    setInsightBalance(v => Math.max(0, v - cost));
    setUsedInsights(v => v + 1);
    return true;
  };

  const abilityReady = (a)=>{
    if (!a || a.kind === 'passive') return false;
    if (a.reqWeaponLvl && weaponProg.level < a.reqWeaponLvl) return false;
    if (a.reqStreak && combo < a.reqStreak) return false;
    if ((cooldowns[a.id] || 0) > 0) return false;
    return true;
  };

  const finishCombat = (won, finalEnemies, details)=>{
    if (ended) return;
    setEnded(true);
    const xpBase = won
      ? (mode === 'boss' ? 140 : mode === 'elite' ? 90 : mode === 'cram' ? 120 : mode === 'practice' ? 12 : 55)
      : 8;
    const xpAwarded = Math.max(0, Math.round(xpBase * (weapon.xpMul || 1) * (1 + (combined.xpBonus || 0) + (biome.xpBonus || 0)) * (prestige.funding ? 1.5 : 1) * (mode === 'cram' && won ? CRAM_XP_MULT : 1)));
    let nextArena = {
      ...arena,
      enemies: finalEnemies || enemies,
      targetIndex:0,
      mistakePool:Array.from(new Set([...(arena.mistakePool || []), ...(details?.mistakes || mistakeIds)])).slice(-60),
      runStats:{
        ...(arena.runStats || {wins:0,losses:0}),
        wins:(arena.runStats?.wins || 0) + (won ? 1 : 0),
        losses:(arena.runStats?.losses || 0) + (won ? 0 : 1),
      },
    };
    if (won && mode !== 'practice' && mode !== 'cram'){
      nextArena.bossesBeaten = { ...(arena.bossesBeaten || {}), [boss.id]:true };
    }
    if (mode === 'cram'){
      const curCram = (state.arena && state.arena.cram) || (arena.cram || defaultCramState());
      nextArena.cram = {
        ...defaultCramState(),
        bestKills:Math.max(curCram.bestKills || 0, curCram.killCount || 0),
        bestWaves:Math.max(curCram.bestWaves || 0, curCram.waveIndex || 0),
      };
    }
    const wxp = won ? Math.max(20, Math.round(xpAwarded * 0.75)) : 10;
    const gained = gainWeaponXp(nextArena, weapon.id, wxp);
    nextArena = gained.arena;
    let drops = won && mode !== 'practice' ? dropLoot(mod.raidType?.id, biome) : [];
    if (won && mode === 'cram' && typeof LOOT_TABLE !== 'undefined'){
      const cramPool = CRAM_LEGENDARY_AUGMENTS.map(id => LOOT_TABLE[id]).filter(Boolean);
      if (cramPool.length) drops = [{ item:cramPool[Math.floor(Math.random() * cramPool.length)], quantity:1 }];
    }
    if (won && drops.length === 0 && (biome.lootBonus || 0) > 0 && Math.random() < biome.lootBonus){
      const bonus = dropLoot(null, biome);
      if (bonus.length) drops = bonus;
    }
    // Lifetime stats + pet XP
    const killCount = (finalEnemies || enemies).filter(e => e.hp <= 0).length;
    const finalEnemiesArr = finalEnemies || enemies;
    let nextState = {
      ...state,
      xp:(state.xp || 0) + xpAwarded,
      insights:insightBalance,
      inventory:addDropsToInventory(state, drops),
      arena:nextArena,
    };
    if (mode !== 'practice'){
      const cs = combatStats.current;
      const dStats = {
        totalKills: killCount,
        totalFightsWon: won ? 1 : 0,
        totalFightsLost: won ? 0 : 1,
        totalCorrect: cs.correct,
        totalIncorrect: cs.incorrect,
        totalDmgDealt: cs.dmgDealt,
        totalDmgTaken: cs.dmgTaken,
      };
      nextState.stats = { ...(nextState.stats || {}) };
      for (const k of Object.keys(dStats)){
        if (dStats[k]) nextState.stats[k] = (nextState.stats[k] || 0) + dStats[k];
      }
      // Bestiary: record encounter for each enemy seen this fight, plus defeats
      if (typeof recordBestiaryEncounter === 'function'){
        nextState = recordBestiaryEncounter(nextState, finalEnemiesArr);
      }
      // Pet XP: +5 per fight participated, +2 per kill (only if pet bonded)
      if (typeof addPetXp === 'function' && state.pet){
        const petXpGain = 5 + killCount * 2 + (won ? 5 : 0);
        nextState = addPetXp(nextState, petXpGain);
      }
    }
    setState(nextState);
    onEnd({
      won, mode, boss, xpAwarded, drops, wxp,
      weaponLeveled:gained.leveled || 0,
      weaponLevel:gained.level,
      reason:details?.reason || '',
    });
  };

  const advanceQuestion = ()=>{
    setTextAnswer('');
    setHiddenChoices([]);
    setShowHint(false);
    setIdx(i => (i + 1) % Math.max(1, questions.length));
  };

  const runEnemies = (nextEnemies, incomingBlock, nextMomentum, nextHp, nextLog)=>{
    if (mode === 'practice') return { nextEnemies, nextMomentum, nextHp, nextLog:nextLog.concat('Training dummy deals 0 damage.') };
    const tempState = { ...state, arena:{ ...arena, enemies:nextEnemies, targetIndex:targetIdx, statusEffects:arena.statusEffects || (typeof defaultStatusEffects === 'function' ? defaultStatusEffects() : {}) }, streak:{ count:combo } };
    const turn = typeof runEnemyTurn === 'function'
      ? runEnemyTurn(tempState)
      : { newEnemies:nextEnemies, totalDmgToPlayer:(target?.dmg?.light || 8), effects:{}, log:[`${target?.name || 'Enemy'} attacks.`] };
    let incoming = turn.totalDmgToPlayer || 0;
    if (biome.dotDamage) incoming += biome.dotDamage;
    if (combined.dmgReduction) incoming = Math.max(0, incoming - combined.dmgReduction);
    incoming = Math.round(incoming * (combined.dmgTakenMult || 1));
    const absorbed = Math.min(incomingBlock, incoming);
    incoming -= absorbed;
    if (absorbed > 0) nextLog.push(`Block absorbs ${absorbed}`);
    if (turn.effects?.drainMomentum) nextMomentum = Math.max(0, nextMomentum - turn.effects.drainMomentum);
    if (turn.effects?.resetStreak) setCombo(0);
    const finalHp = Math.max(0, nextHp - incoming);
    return {
      nextEnemies:turn.newEnemies || nextEnemies,
      nextMomentum,
      nextHp:finalHp,
      nextLog:nextLog.concat(turn.log || []).concat(incoming > 0 ? [`You take ${incoming} damage`] : []),
    };
  };

  const continueCramRun = (clearedEnemies, nextMistakes)=>{
    if (mode !== 'cram') return false;
    const curCram = (state.arena && state.arena.cram) || (arena.cram || defaultCramState());
    const clearedBoss = clearedEnemies.some(e => e.tier === 'boss' || e.type === 'boss' || String(e.id || '').startsWith('cram_boss_'));
    if (curCram.bossPhase || clearedBoss){
      finishCombat(true, clearedEnemies, { mistakes:nextMistakes });
      return true;
    }
    const nextWave = (curCram.waveIndex || 0) + 1;
    const spawnBoss = nextWave >= CRAM_BOSS_WAVE || cramRemainingMs(curCram) <= 0;
    const runMistakeIds = Array.from(new Set([...(curCram.runMistakeIds || []), ...(nextMistakes || [])])).slice(-30);
    const killsThisWave = clearedEnemies.filter(e => e.hp <= 0).length;
    const nextCram = {
      ...curCram,
      active:true,
      waveIndex:nextWave,
      killCount:(curCram.killCount || 0) + killsThisWave,
      runMistakeIds,
      bossPhase:spawnBoss,
      studyBreaksRemaining:spawnBoss ? (curCram.studyBreaksRemaining || 0) : ((curCram.studyBreaksRemaining || 0) + (nextWave % CRAM_BREAK_EVERY === 0 ? 1 : 0)),
      studyBreakOpen:!spawnBoss && nextWave % CRAM_BREAK_EVERY === 0,
    };
    const nextEnemies = spawnBoss
      ? [buildCramBoss(mod, skill?.level || 1)]
      : (typeof generateCramWaveV2 === 'function' ? generateCramWaveV2(mod, nextWave) : generateCramWave(mod, nextWave));
    const nextQuestions = spawnBoss && typeof cramBossQuestions === 'function'
      ? cramBossQuestions(mod, { ...state, arena:{ ...arena, cram:nextCram } }, 50)
      : arenaQuestions(mod, 50, levelId, conceptFilter || boss?.conceptFilter);

    setState(prev => {
      const prevArena = prev.arena || {};
      const prevCram = prevArena.cram || curCram;
      const savedMistakes = Array.from(new Set([...(prevArena.mistakePool || []), ...(nextMistakes || [])])).slice(-60);
      return {
        ...prev,
        arena:{
          ...prevArena,
          cram:{
            ...prevCram,
            ...nextCram,
            draftedAbilities:nextCram.draftedAbilities || prevCram.draftedAbilities || [],
            runMistakeIds:Array.from(new Set([...(prevCram.runMistakeIds || []), ...(nextMistakes || [])])).slice(-30),
          },
          mistakePool:savedMistakes,
        },
      };
    });

    setEnemies(nextEnemies);
    setQuestions(nextQuestions.length ? nextQuestions : questions);
    setIdx(0);
    setTargetIndex(0);
    setBlock(combined.blockPerTurn || 0);
    setTextAnswer('');
    setHiddenChoices([]);
    setShowHint(false);
    setFeedback(spawnBoss ? 'The Final Cram is here.' : `Wave ${nextWave + 1} begins.`);
    setLog(spawnBoss ? ['Timer or wave cap reached.', 'Mistake-pool boss spawned.'] : [`Wave ${nextWave} cleared.`, 'Next wave spawned.']);
    return true;
  };

  const processAnswer = (answer)=>{
    if (ended) return;
    const correct = arenaIsCorrect(q, answer);
    const action = currentAction;
    const nextMistakes = correct ? mistakeIds : [...mistakeIds, q.id];
    if (!correct) setMistakeIds(nextMistakes);
    if (correct) combatStats.current.correct++; else combatStats.current.incorrect++;

    let nextEnemies = enemies.map(e => ({ ...e }));
    let nextHp = hp;
    let nextMomentum = momentum;
    let nextBlock = combined.blockPerTurn || 0;
    // Pet: DRN-01 block at turn start while low HP
    if (typeof petOnTurnStart === 'function'){
      const r = petOnTurnStart(state, hp, computedMaxHp);
      if (r){ nextBlock += (r.block || 0); }
    }
    let nextCombo = correct ? combo + 1 : Math.max(0, combo - 1);
    let nextBuffs = { ...buffs };
    let nextLog = [];
    const fightCtx = { ...state, hp:nextHp, maxHp:computedMaxHp, momentum:nextMomentum, insights:insightBalance, streak:{ count:nextCombo }, abilitySource:action?.source, lastPlayerAbility:lastAbility, currentPlayerAbility:action?.id };

    if (action?.id === 'guard' || action?.onBlock){
      nextBlock = callArenaAbility(action.onBlock, [nextBlock, weaponProg.level, fightCtx], nextBlock + 8 + Math.max(0, weapon.def || 0));
      nextBlock += combined.flatBlock || 0;
    }

    const petMessages = [];

    if (correct){
      let dmg = 12 + (weapon.atk || 0) + (skill?.level || 0) * 2 + Math.min(15, nextCombo * 2);
      dmg += combined.flatDmg || 0;
      dmg += (combined.streakFlatDmg || 0) * nextCombo;
      if (action?.id !== 'guard'){
        dmg = callArenaAbility(action?.onAttack, [dmg, weaponProg.level, fightCtx], dmg);
      }
      if (nextBuffs.double_dmg_next){ dmg *= 2; delete nextBuffs.double_dmg_next; }
      if (nextBuffs.triple_dmg_next){ dmg *= 3; delete nextBuffs.triple_dmg_next; }
      if (lastAbility && lastAbility === action?.id) dmg = Math.floor(dmg * 0.75);
      if (combined.berserkThreshold && nextHp <= computedMaxHp * combined.berserkThreshold) dmg *= (1 + (combined.berserkMult || 0));
      dmg *= (1 + (combined.dmgMult || 0) + (biome.activeDmgBoost && action?.kind === 'active' ? biome.activeDmgBoost : 0));
      // Pet damage multiplier (Syntax Fox combo stacks)
      if (typeof petDamageMultiplier === 'function'){
        const petDmg = petDamageMultiplier(state, nextCombo);
        dmg *= petDmg.mult;
        if (petDmg.msg) petMessages.push(petDmg.msg);
      }
      const wasCrit = Math.random() < (combined.critChance || 0);
      if (wasCrit) dmg *= (combined.critDmgMult || 1.5);
      if (combined.dmgPerInsight) dmg += combined.dmgPerInsight * insightBalance;
      const hitCtx = { abilitySource:action?.source, lastPlayerAbility:lastAbility, currentPlayerAbility:action?.id, wasCrit };
      const hitAll = action?.hitsAll;
      const passes = combined.rampageDoubleHit && action?.id === 'rampage' ? 2 : 1;
      let killsThisAnswer = 0;
      for (let pass = 0; pass < passes; pass++){
        const indexes = hitAll ? nextEnemies.map((e,i)=>e.hp > 0 ? i : -1).filter(i=>i >= 0) : [targetIdx];
        indexes.forEach(i => {
          if (!nextEnemies[i] || nextEnemies[i].hp <= 0) return;
          const before = nextEnemies[i].hp;
          const hit = applyDamageToArenaEnemy(nextEnemies[i], nextEnemies, dmg, hitCtx);
          nextEnemies[i] = hit.enemy;
          combatStats.current.dmgDealt += Math.max(0, before - hit.enemy.hp);
          if (hit.killed) killsThisAnswer++;
          const reflected = hit.reflected || 0;
          combatStats.current.dmgTaken += reflected;
          nextHp = Math.max(0, nextHp - reflected - (hit.killed?.extraDmgToPlayer || 0));
          nextLog = nextLog.concat(hit.log);
        });
      }
      // Pet: Cachey gives +1 insight per kill
      if (typeof petOnEnemyKilled === 'function' && killsThisAnswer > 0){
        for (let k = 0; k < killsThisAnswer; k++){
          const r = petOnEnemyKilled(state);
          if (r){
            setInsightBalance(v => Math.min(INSIGHT_MAX_BALANCE + (combined.insightCapBonus || 0), v + (r.insight || 0)));
            petMessages.push(r.msg);
          }
        }
      }
      // Pet: Buffer heals every 3rd correct
      if (typeof petOnCorrect === 'function'){
        const r = petOnCorrect(state, nextCombo);
        if (r){ nextHp = Math.min(computedMaxHp, nextHp + (r.heal || 0)); petMessages.push(r.msg); }
      }
      const heal = callArenaAbility(action?.onHeal, [weaponProg.level, fightCtx], action?.healOnUse || 0) + (combined.flatHeal || 0) + (combined.healOnCorrect || 0);
      if (heal > 0) nextHp = Math.min(computedMaxHp, nextHp + heal);
      const momentumDelta = callArenaAbility(action?.onMomentum, [nextMomentum, weaponProg.level, fightCtx], action?.momentumBonus || 0);
      nextMomentum = Math.max(0, Math.min(maxMomentum, nextMomentum + momentumDelta + (biome.momentumBoost || 0)));
      const insightGain = callArenaAbility(action?.onInsight, [weaponProg.level, fightCtx], 0);
      if (insightGain > 0) setInsightBalance(v => Math.min(INSIGHT_MAX_BALANCE + (combined.insightCapBonus || 0), v + insightGain));
      const selfDmg = callArenaAbility(action?.onSelfDamage, [weaponProg.level, fightCtx], 0);
      if (selfDmg > 0) nextHp = Math.max(0, nextHp - selfDmg);
      const buff = callArenaAbility(action?.onBuff, [weaponProg.level, fightCtx], null);
      if (buff) nextBuffs[buff] = true;
      if (action?.onStreakReset) nextCombo = 0;
      nextLog.unshift(wasCrit ? 'Critical answer!' : 'Correct answer.');
    } else {
      nextLog.push(`Wrong. Correct answer: ${arenaChoiceLabel(q.answer)}`);
      // Bestiary: tag this mistake against the enemies the player was facing
      if (typeof recordBestiaryMistake === 'function' && mode !== 'practice'){
        const livingNow = enemies.filter(e => e.hp > 0);
        if (livingNow.length) setState(s => recordBestiaryMistake(s, livingNow, q.id));
      }
      // Pet: Debuggy reveals next answer free (1×/2×/3× per fight by level)
      if (typeof petOnWrong === 'function'){
        const max = petFlags.current.beetleMaxUses || 1;
        const used = petFlags.current.beetleUses || 0;
        if (used < max){
          const r = petOnWrong(state, false);
          if (r){
            petFlags.current.beetleUses = used + 1;
            petFlags.current.beetleNextReveal = true;
            petMessages.push(r.msg + ` (${petFlags.current.beetleUses}/${max})`);
          }
        }
      }
      // Pet: Syntax Fox -5 HP on streak loss
      if (typeof petOnStreakLoss === 'function' && combo > 0){
        const r = petOnStreakLoss(state);
        if (r){ nextHp = Math.max(0, nextHp - (r.hpLoss || 0)); petMessages.push(r.msg); }
      }
    }

    const livingAfterHit = nextEnemies.filter(e => e.hp > 0);
    if (livingAfterHit.length === 0){
      setEnemies(nextEnemies);
      if (mode === 'cram' && continueCramRun(nextEnemies, nextMistakes)){
        return;
      }
      setFeedback('Victory.');
      finishCombat(true, nextEnemies, { mistakes:nextMistakes });
      return;
    }

    const enemyTurn = runEnemies(nextEnemies, nextBlock, nextMomentum, nextHp, nextLog);
    nextEnemies = enemyTurn.nextEnemies;
    nextMomentum = enemyTurn.nextMomentum;
    const dmgFromEnemies = Math.max(0, nextHp - enemyTurn.nextHp);
    combatStats.current.dmgTaken += dmgFromEnemies;
    nextHp = enemyTurn.nextHp;
    nextLog = enemyTurn.nextLog;

    const nextCooldowns = {};
    Object.keys(cooldowns).forEach(id => { nextCooldowns[id] = Math.max(0, cooldowns[id] - 1); });
    if (correct && action?.kind === 'active' && action.id !== 'guard'){
      const tierCd = TIER[action.tier]?.cooldown || action.cooldown || 0;
      const cd = Math.max(0, tierCd - (biome.skillCooldownReduce || 0) - (prestige.speedLearner ? 1 : 0));
      if (cd > 0) nextCooldowns[action.id] = cd;
    }

    // Pet: Pointer revives at 1 HP if lethal (1× per fight)
    let lethalSurvived = false;
    if (nextHp <= 0 && typeof petOnLethal === 'function'){
      const r = petOnLethal(state, petFlags.current.dogFired);
      if (r){
        petFlags.current.dogFired = true;
        nextHp = r.reviveHp || 1;
        lethalSurvived = true;
        petMessages.push(r.msg);
      }
    }

    setEnemies(nextEnemies);
    setHp(nextHp);
    setMomentum(nextMomentum);
    setCombo(nextCombo);
    setCooldowns(nextCooldowns);
    setBuffs(nextBuffs);
    setLastAbility(action?.id || null);
    if (petMessages.length) setPetLog(p => [...p, ...petMessages].slice(-3));
    setLog([...petMessages, ...nextLog].slice(-8));
    setFeedback(correct ? 'Hit landed. Enemy turn resolved.' : 'Missed. Enemy turn resolved.');
    const nextLivingTarget = nextEnemies[targetIdx]?.hp > 0 ? targetIdx : Math.max(0, nextEnemies.findIndex(e => e.hp > 0));
    setTargetIndex(nextLivingTarget < 0 ? 0 : nextLivingTarget);
    advanceQuestion();

    if (nextHp <= 0 && !lethalSurvived){
      finishCombat(false, nextEnemies, { mistakes:nextMistakes, reason:'You were defeated.' });
    }
  };

  // Pet: Debuggy auto-reveal hint on next question after a wrong answer (1× per fight)
  const beetleAutoReveal = petFlags.current.beetleNextReveal;
  if (beetleAutoReveal && !showHint){
    petFlags.current.beetleNextReveal = false;
    setShowHint(true);
  }
  const pet = typeof petOf === 'function' ? petOf(state) : null;
  const filteredChoices = arenaAnswerChoices(q).filter(choice => !hiddenChoices.includes(String(choice)));
  const actionIsReady = abilityReady(currentAction);
  const hpPct = Math.max(0, Math.min(100, (hp / computedMaxHp) * 100));
  const targetPct = target ? Math.max(0, Math.min(100, (target.hp / target.maxHp) * 100)) : 0;

  // ── XCOM-style render (port of design_handoff_v2 variant C, 2026-05-09) ──
  // 3-rail layout: BUILD (left) | STAGE (center) | INTEL (right).
  // STAGE column = enemy lineup → Arcade VS panel → question card → hotbar.
  // Initiative Queue strip is currently a UI stub (combat resolver still
  // round-robin); the real init system is a future wave.
  return (
    <div className={'arena-combat '+(biome.css || '')} data-arena>
      <div className={'card biome-banner '+(biome.css || '')}>
        <div className="biome-banner-top">
          <div className="biome-banner-info">
            <span className="biome-banner-icon">{biome.icon}</span>
            <div>
              <div className="biome-banner-name">{biome.name}</div>
              <div className="biome-banner-desc tiny">{biome.desc}</div>
            </div>
          </div>
          <div className="row" style={{gap:6}}>
            <span className="chip momentum-chip">⚡ {momentum}/{maxMomentum}</span>
            <span className="chip">🔥 {combo}</span>
            <span className="chip">💡 {insightBalance}</span>
          </div>
        </div>
        {(()=>{
          const chips = typeof biomeModifierChips === 'function' ? biomeModifierChips(biome) : [];
          if (!chips.length) return null;
          return (
            <div className="biome-modifiers">
              {chips.map((c,i)=>(
                <span key={i} className={'biome-mod-chip '+(c.tone||'')}>{c.label}</span>
              ))}
            </div>
          );
        })()}
      </div>

      {mode === 'cram' && <CramTimerStrip cram={(state.arena?.cram || arena.cram || defaultCramState())}/>}
      {mode === 'cram' && state.arena?.cram?.studyBreakOpen && (
        <StudyBreakModal
          state={state}
          setState={setState}
          onClose={()=>setState(s => ({...s, arena:{...s.arena, cram:{...(s.arena?.cram || defaultCramState()), studyBreakOpen:false}}}))}
        />
      )}

      {pet && (
        <div className="pet-companion-strip">
          <div className="pet-comp-info">
            <span className="pet-comp-icon">{pet.icon}</span>
            <div>
              <div className="pet-comp-name">{pet.name}</div>
              <div className="pet-comp-desc tiny">{pet.desc}</div>
            </div>
          </div>
          {petLog.length > 0 && (
            <div className="pet-comp-log">
              {petLog.slice(-2).map((m,i)=>(<div key={i} className="tiny pet-comp-log-line">{m}</div>))}
            </div>
          )}
        </div>
      )}

      {/* ── XCOM LAYOUT (single-viewport reflow 2026-05-09) ── */}

      {/* TOP BAR · enemy lineup, full width */}
      <div className="xcom-enemies-bar">
        <div className="cap cap-line">LINEUP · {living.length} ALIVE</div>
        <div className="xcom-enemies-grid">
          {enemies.map((e,i)=>{
            if (e.hp <= 0) return null;
            const ab = typeof ENEMY_ABILITIES !== 'undefined' && e.pattern?.length
              ? ENEMY_ABILITIES[e.pattern[(e.patternIndex || 0) % e.pattern.length]]
              : null;
            const isT = i === targetIdx;
            return (
              <button key={e.id}
                className={'xcom-enemy-card'+(isT?' targeted':'')}
                onClick={()=>setTargetIndex(i)}>
                <div className="xcom-enemy-emoji">{e.emoji}</div>
                <div className="xcom-enemy-name">{e.name}</div>
                <div className="xcom-bar xcom-bar-enemy"><div className="xcom-bar-fill" style={{width:((e.hp/e.maxHp)*100)+'%'}}/></div>
                <div className="tiny mono">{e.hp}/{e.maxHp}{e.block?' · 🛡 '+e.block:''}</div>
                {ab && <div className={'xcom-enemy-intent intent-'+(ab.intent||'light_dmg')} title={ab.desc || ab.name}>{ab.icon} {ab.name}</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="xcom-hud">

        {/* LEFT RAIL · OPERATOR / character card */}
        <div className="xcom-rail xcom-rail-l">
          <div className="xcom-panel xcom-character">
            <div className="cap cap-line">OPERATOR · LV {weaponProg.level}</div>
            <div className="xcom-char-portrait">
              <div className="xcom-char-emoji">⚔️</div>
              <div className="xcom-char-class cap">{weapon.kind}</div>
            </div>
            <div className="xcom-char-name">{weapon.icon} {weapon.name}</div>
            <div className="xcom-bar xcom-bar-hp"><div className="xcom-bar-fill" style={{width:hpPct+'%'}}/></div>
            <div className="xcom-bar-text mono">{hp} / {computedMaxHp} HP · BLK {block}</div>

            <div className="cap" style={{marginTop:10}}>ACTION POINTS</div>
            <div className="xcom-ap-row">
              {Array.from({length:maxMomentum},(_,i)=>(
                <div key={i} className={'xcom-ap-pip'+(i<momentum?' filled':'')}/>
              ))}
              <span className="xcom-ap-text mono">{momentum} / {maxMomentum}</span>
            </div>

            <div className="cap" style={{marginTop:10}}>WEAPON STATS</div>
            <div className="xcom-stat-row">
              <span className="xcom-stat-pill">ATK {weapon.atk>=0?'+':''}{weapon.atk}</span>
              <span className="xcom-stat-pill">DEF {weapon.def>=0?'+':''}{weapon.def}</span>
              <span className="xcom-stat-pill">XP×{(weapon.xpMul||1).toFixed(1)}</span>
            </div>

            {(arena.sockets || []).filter(Boolean).length > 0 && (
              <>
                <div className="cap" style={{marginTop:10}}>SOCKETS</div>
                <div className="xcom-sockets-list">
                  {(arena.sockets || []).filter(Boolean).map((augId,i)=>{
                    const aug = (typeof LOOT_TABLE !== 'undefined') ? LOOT_TABLE[augId] : null;
                    if (!aug) return null;
                    return <span key={i} className="xcom-socket-chip" title={aug.desc}>{aug.icon} {aug.name}</span>;
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CENTER STAGE */}
        <div className="xcom-stage">
          {/* Arcade VS panel — adds life to the data-dense XCOM layout */}
          <div className="arcade-vs-panel">
            <div className="arcade-vs-side arcade-vs-player">
              <div className="arcade-sprite arcade-sprite-player">{weapon.icon || '⚔️'}</div>
              <div className="arcade-vs-name cap">YOU</div>
              <div className="arcade-vs-hp"><div className="arcade-vs-hp-fill player" style={{width:hpPct+'%'}}/></div>
              <div className="tiny mono">{hp}/{computedMaxHp}</div>
            </div>
            <div className="arcade-vs-center">
              <div className="arcade-vs-text">VS</div>
              <div className="tiny mono arcade-vs-round">ROUND {idx+1} / {questions.length}</div>
            </div>
            <div className="arcade-vs-side arcade-vs-enemy">
              <div className="arcade-sprite arcade-sprite-enemy">{target?.emoji || '👾'}</div>
              <div className="arcade-vs-name cap">{target?.name || 'NO TARGET'}</div>
              <div className="arcade-vs-hp"><div className="arcade-vs-hp-fill enemy" style={{width:targetPct+'%'}}/></div>
              <div className="tiny mono">{target?.hp || 0}/{target?.maxHp || 0}</div>
            </div>
          </div>

          {mode === 'practice' && (
            <div className="card practice-notes">
              <div className="tiny" style={{marginBottom:6}}>PRACTICE NOTES · {q.conceptName || 'Current concept'}</div>
              {q.conceptNotes
                ? renderNotes(q.conceptNotes)
                : q.note
                  ? renderNotes(q.note)
                  : q.explanation
                    ? <div className="prose">{q.explanation}</div>
                    : <div className="muted">No notes for this concept yet.</div>}
            </div>
          )}

          {/* Question card */}
          <div className="card combat-q xcom-question">
            <div className="cap cap-line">{q.levelName || mod.name} · {q.conceptName || 'Mixed'} · Q {idx+1} / {questions.length}</div>
            <h3>{q.prompt}</h3>
            {showHint && <div className="note-block">{q.note ? renderNotes(q.note) : (q.explanation || String(q.answer))}</div>}
            {filteredChoices.length > 0 ? (
              <div className="xcom-answer-grid">
                {filteredChoices.map((choice,i) => (
                  <button key={String(choice)}
                    className="xcom-answer-btn"
                    disabled={!actionIsReady || ended}
                    onClick={()=>processAnswer(choice)}>
                    <span className="xcom-answer-key mono">{['A','B','C','D','E','F'][i] || (i+1)}</span>
                    <span className="xcom-answer-label">{arenaChoiceLabel(choice)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{marginTop:12}}>
                <textarea value={textAnswer} onChange={e=>setTextAnswer(e.target.value)} placeholder="Type your answer..." style={{minHeight:100}} disabled={!actionIsReady || ended}/>
                <button className="btn" style={{marginTop:8}} disabled={!textAnswer.trim() || !actionIsReady || ended} onClick={()=>processAnswer(textAnswer)}>Submit Answer</button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT RAIL · INTEL — chances, intent, log */}
        <div className="xcom-rail xcom-rail-r">
          <div className="xcom-panel xcom-stats-panel">
            <div className="cap cap-line">CHANCES · {target?.name || 'NO TARGET'}</div>
            {(()=>{
              const baseDmg = 12 + (weapon.atk || 0) + (skill?.level || 0) * 2 + Math.min(15, (combo+1) * 2) + (combined.flatDmg || 0) + ((combined.streakFlatDmg || 0) * (combo+1));
              const estDmg = currentAction && currentAction.id !== 'guard'
                ? Math.round(callArenaAbility(currentAction.onAttack, [baseDmg, weaponProg.level, {}], baseDmg))
                : 0;
              const corrPct = Math.min(95, Math.max(35, 60 + combo * 3));  // visual estimate, not authoritative
              return (
                <>
                  <div className="xcom-stat-line">
                    <span className="cap">EST HIT %</span>
                    <span className="mono xcom-stat-big">{corrPct}%</span>
                  </div>
                  <div className="xcom-stat-line">
                    <span className="cap">EST DMG</span>
                    <span className="mono xcom-stat-big">{estDmg ? estDmg + ' DMG' : '— DMG'}</span>
                  </div>
                  <div className="xcom-stat-line">
                    <span className="cap">STREAK</span>
                    <span className="mono">×{combo}</span>
                  </div>
                  <div className="xcom-stat-line">
                    <span className="cap">TOPIC MASTERY</span>
                    <span className="mono">{Math.round((skill?.level || 0) * 10)}%</span>
                  </div>
                  <div className="xcom-stat-line">
                    <span className="cap">XP MULT</span>
                    <span className="mono">×{(weapon.xpMul || 1).toFixed(2)}</span>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="xcom-panel xcom-intent-panel">
            <div className="cap cap-line">INTENT · INCOMING</div>
            {(()=>{
              const tgtAb = typeof ENEMY_ABILITIES !== 'undefined' && target?.pattern?.length
                ? ENEMY_ABILITIES[target.pattern[(target.patternIndex || 0) % target.pattern.length]]
                : null;
              if (!tgtAb) return <div className="tiny muted">No intent available</div>;
              return (
                <>
                  <div className={'xcom-intent-name intent-'+(tgtAb.intent||'light_dmg')}>{tgtAb.icon} {tgtAb.name}</div>
                  {tgtAb.desc && <div className="tiny xcom-intent-desc">{tgtAb.desc}</div>}
                </>
              );
            })()}
          </div>

          <div className="xcom-panel xcom-feedback-panel">
            <div className="cap cap-line">COMBAT LOG</div>
            <div className="xcom-feedback-current"><b>{feedback}</b></div>
            {log.length > 0 && (
              <div className="xcom-feedback-log">
                {log.slice(-6).map((x,i)=><div key={i} className="tiny mono xcom-feedback-line">{x}</div>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR · hotbar, full width */}
      <div className="card action-card xcom-hotbar-bar">
        {(()=>{
          const sel = currentAction;
          if (!sel || sel.id === 'guard'){
            return (
              <div className="action-locked-banner">
                <span className="action-locked-label">LOCKED IN</span>
                <span className="action-locked-icon">🛡️</span>
                <span className="action-locked-name">Guard</span>
                <span className="action-locked-est">Block on next answer</span>
              </div>
            );
          }
          const baseDmg = 12 + (weapon.atk || 0) + (skill?.level || 0) * 2 + Math.min(15, (combo+1) * 2) + (combined.flatDmg || 0) + ((combined.streakFlatDmg || 0) * (combo+1));
          const estDmg = callArenaAbility(sel.onAttack, [baseDmg, weaponProg.level, {}], baseDmg);
          const sameWarn = lastAbility === sel.id;
          return (
            <div className={'action-locked-banner'+(sameWarn?' warn':'')}>
              <span className="action-locked-label">LOCKED IN</span>
              <span className="action-locked-icon">{sel.icon}</span>
              <span className="action-locked-name">{sel.name}</span>
              <span className="action-locked-est">~{Math.round(estDmg)} dmg on correct answer</span>
              {sameWarn && <span className="action-locked-warn">⚠ same as last · -25%</span>}
            </div>
          );
        })()}
        <div className="tiny" style={{marginBottom:8,marginTop:10,opacity:0.7}}>ACTIONS · press <b>1-{Math.min(9,actionCards.length)}</b> to switch</div>
        <div className="action-row xcom-action-row">
          {actionCards.map((a,i)=>{
            const ready = abilityReady(a);
            const selected = (a.id || a.name) === actionId;
            const cd = cooldowns[a.id] || 0;
            const reasonLocked = !ready
              ? (cd > 0 ? `CD ${cd}` : (a.reqWeaponLvl && weaponProg.level < a.reqWeaponLvl ? `W-Lv ${a.reqWeaponLvl}` : (a.reqStreak && combo < a.reqStreak ? `Combo ${a.reqStreak}` : 'locked')))
              : null;
            return (
              <button key={a.id} className={'action-btn ability '+(selected?'selected':'')+(lastAbility===a.id?' same-warn':'')+(!ready?' locked':'')} disabled={!ready || ended} onClick={()=>setActionId(a.id)}>
                {i < 9 && <span className="action-key-hint">{i+1}</span>}
                <div className="action-icon">{a.icon}</div>
                <div className="action-name">{a.name}</div>
                <div className="action-desc">{getAbilityDesc(a, weaponProg.level) || a.desc}</div>
                {a.tier && <span className={'tier-badge tier-'+a.tier}>{a.tier}</span>}
                {selected && ready && <span className="action-selected-check">✓</span>}
                {reasonLocked && <span className="same-warn-tag">{reasonLocked}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <InsightsPanel
        state={{...state, insights:insightBalance}}
        setState={()=>{}}
        allowed={allowedInsights}
        used={usedInsights}
        max={maxInsightUses}
        canRestore={combo === 0}
        onHint={()=>{
          if(!spendInsight(Math.max(1,Math.ceil(1*(1-(biome.insightDiscount||0))))))return;
          const opts=arenaAnswerChoices(q);
          // Pet: Pixel Owl hides 3 wrong answers (instead of 2) once per fight
          const owlBoost = typeof petShouldHighlightOnInsight === 'function' && petShouldHighlightOnInsight(state, petFlags.current.insightOwlFired);
          if (owlBoost) petFlags.current.insightOwlFired = true;
          if(opts.length){
            const owlHide = (typeof petOwlHidesCount === 'function') ? petOwlHidesCount(state) : 3;
            const hideN = owlBoost ? owlHide : 2;
            const wrong=opts.filter(c=>String(c)!==String(q.answer)).slice(0, hideN).map(String);
            setHiddenChoices(wrong);
          }
          setShowHint(true);
          if (owlBoost) setPetLog(p => [...p, '🦉 Hoot-ini sharpened the hint'].slice(-3));
        }}
        onReroll={()=>{if(spendInsight(Math.max(1,Math.ceil(2*(1-(biome.insightDiscount||0))))))advanceQuestion();}}
        onRestoreStreak={()=>{if(spendInsight(Math.max(1,Math.ceil(3*(1-(biome.insightDiscount||0))))))setCombo(Math.max(combo,1));}}
      />
    </div>
  );
}

function ResultScreen({ result, arena, state, setState, onContinue, onRematch, onNavigate }){
  const won = !!result.won;
  const drops = result.drops || [];
  // Detect first-time discoveries: items the player didn't already own before the fight
  const preEquipment = state?.inventory?.equipment || {};
  const firstTimeIds = new Set(
    drops
      .filter(d => d.item && (preEquipment[d.item.id]?.quantity || 0) <= (d.quantity || 1))
      .map(d => d.item.id)
  );
  return (
    <div className="result-overlay">
      <div className={'result-modal '+(won?'win':'lose')}>
        <div className={'result-banner '+(won?'win':'lose')}>
          <h2 style={{marginBottom:6}}>{won ? '🏆 Victory' : '💀 Defeat'}</h2>
          <div className="muted" style={{marginBottom:12}}>{won ? 'Boss cleared. Progress saved.' : (result.reason || 'You can retry with the same loadout.')}</div>
          <div className="row" style={{flexWrap:'wrap',gap:6}}>
            <span className="chip ok">+{result.xpAwarded || 0} XP</span>
            <span className="chip">+{result.wxp || 0} WXP</span>
            {result.weaponLeveled > 0 && <span className="chip warn">⬆ Weapon level +{result.weaponLeveled}</span>}
            {result.weaponLevel && <span className="chip accent">W-Lv {result.weaponLevel}</span>}
          </div>
        </div>
        {drops.length > 0 ? (
          <div className="result-loot">
            <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <h3 style={{marginBottom:0}}>🎁 Loot ({drops.length})</h3>
              <span className="tiny muted">{firstTimeIds.size > 0 ? `${firstTimeIds.size} new discovered` : 'all duplicates'}</span>
            </div>
            <div className="loot-grid">
              {drops.map((d,i)=>{
                const isNew = firstTimeIds.has(d.item.id);
                return (
                  <div key={i} className={'loot-card tier-'+d.item.tier+(isNew?' new':'')}>
                    {isNew && <span className="loot-new-badge">NEW!</span>}
                    <div className="loot-icon">{d.item.icon}</div>
                    <div className="loot-name">{d.item.name}</div>
                    <span className={'codex-tier-pill tier-'+d.item.tier}>{d.item.tier}</span>
                    <div className="loot-desc">{d.item.desc}</div>
                    {d.quantity > 1 && <span className="chip" style={{marginTop:4}}>×{d.quantity}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : won && (
          <div className="result-empty">
            <div className="tiny muted">No loot dropped this time. Higher tiers fall on bigger fights.</div>
          </div>
        )}
        <div className="row result-actions">
          <button className="btn" onClick={onContinue}>Back to Arena</button>
          <button className="btn ghost" onClick={onRematch}>Rematch</button>
          <button className="btn ghost" onClick={()=>onNavigate && onNavigate('library')}>Library</button>
        </div>
      </div>
    </div>
  );
}
