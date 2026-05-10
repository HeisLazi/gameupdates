/* ==========================================================================
 * multimob.jsx · Multi-enemy state · Targeting · Damage routing · Enemy turn
 *
 * Splice position: after enemies.jsx (calls resolveEnemyAction,
 *                  applyEnemyPassivesOnHit, onEnemyDeath, generateEnemy),
 *                  before cram.jsx.
 * Defines:  defaultStatusEffects, getCurrentTarget, setTarget,
 *           retargetAfterKill, routeDamageToTarget, runEnemyTurn,
 *           MultiEnemyHUD (UI), applyEndOfPlayerTurnEffects,
 *           generateCramWaveV2 (canonical Cram/Blitz wave generator).
 * Reads:    generateEnemy, resolveEnemyAction, applyEnemyPassivesOnHit,
 *           onEnemyDeath, applySpawnTimePassives, ENEMY_ABILITIES,
 *           ENEMY_PASSIVES (all from enemies.jsx); getAugmentBonuses
 *           (bonuses.jsx).
 *
 * STATE SHAPE introduced:
 *   state.arena.enemies     = [Enemy, ...]   (replaces single `boss`)
 *   state.arena.targetIndex = number          (which enemy is being attacked)
 *   state.arena.statusEffects = {             (player-side debuffs)
 *     poisonStacks, poisonDmgPerTurn, antiHeal, confused, advancedLocked, forcedTarget
 *   }
 *
 * Edit when: changing how player damage routes to a target, adding new
 * enemy-side effects to runEnemyTurn, or tweaking the multi-enemy HUD card.
 * ========================================================================== */
/* ============ MULTI-MOB COMBAT HELPERS ============ *
 * Splice into build_html.py AFTER enemies.jsx (depends on generateEnemy).
 * UI components + state helpers for multiple-enemy fights.
 *
 * STATE SHAPE
 *   state.arena.enemies     = [Enemy, ...]   (replaces single `boss`)
 *   state.arena.targetIndex = number          (which enemy is being attacked)
 *   state.arena.statusEffects = {             (player-side debuffs from enemy effects)
 *     poisonStacks, poisonDmgPerTurn, antiHeal, confused, advancedLocked, forcedTarget
 *   }
 */

function defaultStatusEffects(){
  return {
    poisonStacks: 0, poisonDmgPerTurn: 3,
    antiHeal: false, confused: false, advancedLocked: false, forcedTarget: null,
  };
}

/* ---------- TARGETING ---------- */
function getCurrentTarget(state){
  const enemies = (state.arena && state.arena.enemies) || [];
  const idx = (state.arena && typeof state.arena.targetIndex === 'number') ? state.arena.targetIndex : 0;
  return enemies[idx] || enemies.find(e => e.hp > 0) || null;
}

function setTarget(state, setState, idx){
  const enemies = (state.arena && state.arena.enemies) || [];
  if (!enemies[idx] || enemies[idx].hp <= 0) return;
  setState({...state, arena:{...state.arena, targetIndex: idx}});
}

function retargetAfterKill(state, setState){
  const enemies = (state.arena && state.arena.enemies) || [];
  const living = enemies.map((e,i)=>({e,i})).filter(x => x.e.hp > 0);
  if (living.length === 0) return;
  const cur = enemies[state.arena.targetIndex];
  if (cur && cur.hp > 0) return;
  living.sort((a,b)=> a.e.hp - b.e.hp);
  setState({...state, arena:{...state.arena, targetIndex: living[0].i}});
}

/* ---------- DAMAGE ROUTING ---------- */
function routeDamageToTarget(state, dmg, ctx){
  const enemies = (state.arena.enemies || []).map(e => ({...e}));
  const idx = state.arena.targetIndex || 0;
  const target = enemies[idx];
  if (!target || target.hp <= 0) return { newEnemies: enemies, killed: null, reflected: 0, log: [] };

  const passResult = applyEnemyPassivesOnHit(target, dmg, ctx);
  const log = passResult.log.slice();
  let killed = null;

  let dmgAfterBlock = passResult.dmgFinal;
  if ((target.block || 0) > 0 && dmgAfterBlock > 0){
    const absorbed = Math.min(target.block, dmgAfterBlock);
    target.block -= absorbed;
    dmgAfterBlock -= absorbed;
    if (absorbed > 0) log.push(`${target.name} blocks ${absorbed}`);
  }

  target.hp = Math.max(0, target.hp - dmgAfterBlock);
  if (passResult.clearEvasion) target.hasEvasion = false;
  if (target.hp === 0){
    const death = onEnemyDeath(target, enemies);
    log.push(...death.log);
    if (death.revivedEnemy){
      enemies[idx] = death.revivedEnemy;
    } else {
      killed = { enemy: target, extraDmgToPlayer: death.extraDmgToPlayer, suppressXp: death.suppressXp };
      enemies[idx] = target;
    }
  } else {
    enemies[idx] = target;
  }

  return { newEnemies: enemies, killed, reflected: passResult.dmgReflectedToPlayer, log };
}

/* ---------- TURN LOOP ---------- */
function runEnemyTurn(state){
  const enemies = (state.arena.enemies || []).map(e => ({...e}));
  let totalDmgToPlayer = 0;
  const summons = [];
  const log = [];
  const effects = {
    drainMomentum: 0, drainInsight: 0,
    applyPoison: 0, antiHeal: false, lockAdvanced: false,
    confused: false, halveHp: false, stealAllMomentum: false,
    wipePlayerBuffs: false, increaseCooldowns: 0, resetStreak: false,
    healAlliesPct: 0, shieldAllies: 0, buffAlliesDmg: 0,
    forceTargetId: null, ultimatumCheck: false,
  };

  for (let i = 0; i < enemies.length; i++){
    const e = enemies[i];
    if (e.hp <= 0) continue;
    const r = resolveEnemyAction(e, state, enemies);
    enemies[i] = r.enemy;
    if (r.selfDestructed) enemies[i].hp = 0;
    totalDmgToPlayer += r.dmgToPlayer;
    log.push(...r.log);
    if (r.summons.length) summons.push(...r.summons);
    Object.keys(r.effects).forEach(k => {
      const v = r.effects[k];
      if (typeof v === 'boolean') effects[k] = effects[k] || v;
      else if (typeof v === 'number') effects[k] = (effects[k] || 0) + v;
      else effects[k] = v;
    });
  }

  if (effects.shieldAllies > 0){
    enemies.forEach(e => { if (e.hp > 0) e.block = (e.block || 0) + effects.shieldAllies; });
    log.push(`Allies shielded (+${effects.shieldAllies})`);
  }
  if (effects.buffAlliesDmg > 0){
    enemies.forEach(e => { if (e.hp > 0) e.enrageBonus = (e.enrageBonus || 0) + effects.buffAlliesDmg; });
    log.push(`Allies enraged (+${effects.buffAlliesDmg} dmg permanently)`);
  }
  if (effects.healAlliesPct > 0){
    const heal = Math.floor(totalDmgToPlayer * effects.healAlliesPct);
    enemies.forEach(e => { if (e.hp > 0) e.hp = Math.min(e.maxHp, e.hp + heal); });
    if (heal > 0) log.push(`Allies healed +${heal} HP each (vampiric)`);
  }

  return { newEnemies: enemies.concat(summons), totalDmgToPlayer, summons, effects, log };
}

/* ---------- UI: Multi-enemy HUD ---------- */
function MultiEnemyHUD({ state, setState, intentVisible }){
  const enemies = (state.arena && state.arena.enemies) || [];
  const targetIdx = (state.arena && state.arena.targetIndex) || 0;
  if (!enemies.length) return null;

  return (
    <div className="multi-enemy-hud">
      {enemies.map((e, i) => {
        if (e.hp <= 0) return null;
        const isTarget = i === targetIdx;
        const ability = (typeof ENEMY_ABILITIES !== 'undefined') ? ENEMY_ABILITIES[e.pattern[e.patternIndex % e.pattern.length]] : null;
        return (
          <div
            key={e.id}
            className={'enemy-card'+(isTarget?' targeted':'')}
            onClick={()=> setTarget(state, setState, i)}
            title={(e.passives || []).map(p => (typeof ENEMY_PASSIVES !== 'undefined' ? ENEMY_PASSIVES[p]?.name : p)).filter(Boolean).join(' · ')}
          >
            <div className="enemy-emoji">{e.emoji}</div>
            <div className="enemy-name">{e.name}</div>
            <div className="enemy-hp-bar">
              <div className="enemy-hp-fill" style={{ width: ((e.hp / e.maxHp) * 100) + '%' }}/>
            </div>
            <div className="tiny">{e.hp} / {e.maxHp}{e.block > 0 ? ' · 🛡 ' + e.block : ''}</div>
            {intentVisible && ability && (
              <div className={'enemy-intent intent-'+(ability.intent||'light_dmg')}>
                <span>{ability.icon}</span> <span className="tiny">{ability.name}</span>
              </div>
            )}
            {(e.passives || []).length > 0 && (
              <div className="enemy-passive-row">
                {(e.passives||[]).map(p => (
                  <span key={p} className="enemy-passive-icon" title={typeof ENEMY_PASSIVES !== 'undefined' ? ENEMY_PASSIVES[p]?.desc : p}>●</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- POISON / STATUS APPLICATION ---------- */
function applyEndOfPlayerTurnEffects(state, setState, hooks){
  const eff = (state.arena && state.arena.statusEffects) || defaultStatusEffects();
  let log = [];
  let dmgToPlayer = 0;

  if (eff.poisonStacks > 0){
    const augBonus = (typeof getAugmentBonuses === 'function') ? getAugmentBonuses(state) : { immunePoison:false };
    if (!augBonus.immunePoison){
      dmgToPlayer += eff.poisonDmgPerTurn;
      log.push(`Poison ticks for ${eff.poisonDmgPerTurn} damage`);
    }
    const next = {...eff, poisonStacks: eff.poisonStacks - 1};
    setState({...state, arena:{...state.arena, statusEffects: next}});
  }

  return { dmgToPlayer, log };
}

/* ---------- CRAM WAVE V2 ---------- */
function generateCramWaveV2(mod, waveIndex){
  const lvl = 1 + Math.floor(waveIndex / 2);
  let count, tier;
  if (waveIndex < 3)      { count = 1 + Math.floor(waveIndex/2); tier = 'minion'; }
  else if (waveIndex < 6) { count = 2; tier = Math.random() < 0.3 ? 'elite' : 'minion'; }
  else if (waveIndex < 9) { count = 3; tier = Math.random() < 0.5 ? 'elite' : 'minion'; }
  else                    { count = 3; tier = 'elite'; }

  const enemies = [];
  for (let i = 0; i < count; i++){
    const isElite = tier === 'elite' || (tier !== 'minion' && Math.random() < 0.3);
    const t = isElite ? 'elite' : 'minion';
    enemies.push(generateEnemy(
      t === 'minion' ? `Cram Minion ${i+1}` : `Stress Specter`,
      t, lvl
    ));
  }
  return enemies.map(e => applySpawnTimePassives(e, enemies));
}
