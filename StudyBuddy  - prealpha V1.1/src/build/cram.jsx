/* ==========================================================================
 * cram.jsx · Blitz Mode — wave survival with ability drafting (was "Cram")
 *
 * Splice position: after multimob.jsx, before study_pass.jsx.
 * Defines:  CRAM_DURATION_MS, CRAM_HP_MULT, CRAM_XP_MULT, CRAM_BREAK_EVERY,
 *           CRAM_BOSS_WAVE, CRAM_LEGENDARY_AUGMENTS, defaultCramState,
 *           cramRemainingMs, fmtCramTimer, generateCramWave (fallback —
 *           multimob.jsx's V2 is canonical), getCramDraftPool,
 *           pickStudyBreakOptions, startCram, endCram, advanceCramWave,
 *           buildCramBoss, cramBossQuestions, awardCramVictory, CramHub.
 * Reads:    ABILITIES (skills.jsx + caveman.jsx), generateCramWaveV2
 *           (multimob.jsx).
 *
 * UI badge: shipped to users as "Blitz" — the Cram name lives on internally
 * to keep state-shape backwards compatibility (state.arena.cram).
 *
 * Edit when: tuning Blitz pacing (timer, wave cadence, break frequency,
 * boss-spawn condition), the ability draft pool, or the run reward.
 * ========================================================================== */
/* ============ CRAM MODE — REWORKED ============ *
 * "The Night Before" — wave survival with ability drafting.
 *
 * Flow:
 *   1. Pick a module → CramHub → "Begin Draft"
 *   2. CramDraftView — pick 3 abilities to start with (from your unlocked tree
 *      skills, or basic pool if you have fewer than 3 unlocked).
 *   3. Hotbar is set to those 3 (+ weapon basic). No augment swaps mid-run.
 *   4. Fight wave 1. On wave clear, the next wave spawns automatically.
 *   5. Every 3 waves cleared → study break: pick 1 of 3 NEW tree abilities to add.
 *   6. Boss spawns at wave 10 OR when 10 minutes elapse — whichever is first.
 *      No early-skip button. Beat it for run reward.
 *
 * Splice order: cram.jsx is BEFORE arena_runtime.jsx; raids.jsx is AFTER. */

const CRAM_DURATION_MS = 10 * 60 * 1000;
const CRAM_HP_MULT     = 0.5;
const CRAM_XP_MULT     = 4.0;          // bumped 3 → 4
const CRAM_BREAK_EVERY = 3;            // study break every N waves cleared
const CRAM_BOSS_WAVE   = 10;           // boss spawns when waveIndex hits this
const CRAM_LEGENDARY_AUGMENTS = ['capacitor_404','proctor_lens','god_mode_exe','silver_bullet','overflowing_chalice'];

function defaultCramState(){
  return {
    active:false, startedAt:null, durationMs:CRAM_DURATION_MS,
    waveIndex:0, killCount:0, studyBreaksRemaining:0,
    studyBreakOpen:false, bossPhase:false, moduleId:null,
    bestKills:0, bestWaves:0,
    draftedAbilities:[],   // ability IDs drafted at run start + study break unlocks
    runMistakeIds:[],      // questions missed THIS run (used by boss pool)
  };
}

function cramRemainingMs(cram){
  if (!cram || !cram.active || !cram.startedAt) return 0;
  if (cram.bossPhase) return 0;
  const elapsed = Date.now() - cram.startedAt;
  return Math.max(0, cram.durationMs - elapsed);
}

function fmtCramTimer(ms){
  const total = Math.ceil(ms/1000);
  const m = Math.floor(total/60), s = total % 60;
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

/* ---------- WAVE GENERATION ---------- */
/* `generateCramWaveV2` lives in multimob.jsx and pulls from enemies.jsx ability
 * pools. Use it as the canonical wave generator. This file's `generateCramWave`
 * is a fallback for when multimob isn't loaded. */
function generateCramWave(mod, waveIndex){
  if (typeof generateCramWaveV2 === 'function') return generateCramWaveV2(mod, waveIndex);
  const tier = waveIndex < 3 ? 'minion' : (waveIndex < 6 ? 'elite_lite' : 'elite');
  const count = waveIndex < 2 ? 1 : (waveIndex < 5 ? 2 : 3);
  const baseHp = tier === 'minion' ? 25 : tier === 'elite_lite' ? 45 : 70;
  const baseDmg = tier === 'minion' ? 5 : tier === 'elite_lite' ? 8 : 12;
  const enemies = [];
  for (let i = 0; i < count; i++){
    enemies.push({
      id: 'cram_w'+waveIndex+'_e'+i+'_'+Date.now(),
      name: tier === 'minion' ? 'Cram Minion' : tier === 'elite_lite' ? 'Stress Specter' : 'Burnout Beast',
      emoji: tier === 'minion' ? '👾' : tier === 'elite_lite' ? '😨' : '🔥',
      type: tier, tier: tier,
      hp: baseHp + waveIndex*3, maxHp: baseHp + waveIndex*3,
      dmg: { light: baseDmg, heavy: baseDmg * 2 },
      pattern: ['light','light','heavy'],
    });
  }
  return enemies;
}

/* ---------- DRAFT POOL ---------- */
/* What can you draft at run start?
 *   - All your unlocked tree abilities
 *   - If you have fewer than 3 unlocked, fall back to a basic tree pool */
function getCramDraftPool(state){
  const owned = (state.arena && state.arena.unlockedSkills) || [];
  const ownedAbs = owned
    .map(id => (typeof ABILITIES !== 'undefined') ? ABILITIES[id] : null)
    .filter(Boolean);
  if (ownedAbs.length >= 3) return ownedAbs;
  // Top-up from any tree-source ability the player hasn't seen
  const treeAll = (typeof ABILITIES !== 'undefined')
    ? Object.values(ABILITIES).filter(a => a.source === 'tree' && !owned.includes(a.id))
    : [];
  return [...ownedAbs, ...treeAll].slice(0, Math.max(6, ownedAbs.length + 6));
}

function pickStudyBreakOptions(state){
  const have = new Set([...((state.arena && state.arena.unlockedSkills) || []), ...((state.arena?.cram?.draftedAbilities) || [])]);
  const tree = (typeof ABILITIES !== 'undefined')
    ? Object.values(ABILITIES).filter(a => a.source === 'tree' && !have.has(a.id))
    : [];
  const a = tree.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a.slice(0, 3);
}

/* ---------- LIFECYCLE ---------- */
function startCram(state, setState, moduleId, draftedAbilities){
  const cram = {
    ...defaultCramState(),
    active: true,
    startedAt: Date.now(),
    durationMs: CRAM_DURATION_MS,
    waveIndex: 0, killCount: 0, studyBreaksRemaining: 0,
    studyBreakOpen: false, bossPhase: false, moduleId,
    draftedAbilities: draftedAbilities || [],
    runMistakeIds: [],
  };
  setState(s => ({...s, arena:{...s.arena, cram}}));
}

function endCram(state, setState, outcome){
  const cram = state.arena && state.arena.cram;
  if (!cram) return;
  const next = {
    ...defaultCramState(),
    bestKills: Math.max(cram.bestKills||0, cram.killCount||0),
    bestWaves: Math.max(cram.bestWaves||0, cram.waveIndex||0),
  };
  setState({...state, arena:{...state.arena, cram:next}});
}

/* ---------- COMBAT HOOKS (called from combat.jsx) ---------- */
/* Should the next wave be the boss? Boss spawns when wave hits the cap OR the
 * timer expires — whichever comes first. */
function cramShouldSpawnBoss(cram){
  if (!cram || !cram.active) return false;
  if (cram.bossPhase) return false;
  if ((cram.waveIndex || 0) >= CRAM_BOSS_WAVE) return true;
  if (cramRemainingMs(cram) <= 0) return true;
  return false;
}

function buildCramBoss(mod, level){
  const lvl = Math.max(1, level || 1);
  return {
    id: 'cram_boss_' + (mod?.id || 'x') + '_' + Date.now(),
    name: 'The Final Cram', emoji: '👹',
    tier: 'boss', type: 'boss',
    hp: 220 + lvl * 18, maxHp: 220 + lvl * 18,
    dmg: { light: 12 + lvl, heavy: 22 + lvl * 2 },
    pattern: ['heavy','light','heavy','light','heavy','light','heavy'],
    raidPhase: null,
  };
}

/* Cram boss question pool: 70% from arena.mistakePool + cram.runMistakeIds,
 * 30% from current module's exam-template-flavoured pool. If too few mistakes
 * to fill, fall back to module pool. */
function cramBossQuestions(mod, state, count){
  const want = count || 30;
  const lifetimeMistakes = (state.arena?.mistakePool || []);
  const runMistakes = (state.arena?.cram?.runMistakeIds || []);
  const allMistakes = Array.from(new Set([...runMistakes, ...lifetimeMistakes]));
  const allModQ = (mod?.levels || []).flatMap(l => l.concepts.flatMap(c =>
    c.questions
      .filter(q => ['mcq','tf','define','code_output','code_fill'].includes(q.type) || q.choices)
      .map(q => ({...q, conceptId:c.id, conceptName:c.name, conceptNotes:c.notes, levelName:l.name}))
  ));
  const qById = new Map(allModQ.map(q => [q.id, q]));
  const mistakeQs = allMistakes.map(id => qById.get(id)).filter(Boolean);
  if (mistakeQs.length < 5){
    // Not enough mistake history — use exam pool 100%
    return shuffleCram(allModQ).slice(0, want);
  }
  const wantMistakes = Math.round(want * 0.7);
  const wantExam     = want - wantMistakes;
  const m = shuffleCram(mistakeQs).slice(0, wantMistakes);
  const usedIds = new Set(m.map(q => q.id));
  const e = shuffleCram(allModQ.filter(q => !usedIds.has(q.id))).slice(0, wantExam);
  return shuffleCram([...m, ...e]);
}

function shuffleCram(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Called by combat.jsx after a successful wave clear in cram mode. */
function onCramWaveCleared(state, setState){
  const cram = state.arena && state.arena.cram;
  if (!cram) return;
  const newWave = (cram.waveIndex || 0) + 1;
  const breaksEarned = (cram.studyBreaksRemaining || 0) + (newWave % CRAM_BREAK_EVERY === 0 ? 1 : 0);
  setState(s => ({
    ...s,
    arena: { ...s.arena, cram: {
      ...cram, waveIndex: newWave,
      studyBreaksRemaining: breaksEarned,
      studyBreakOpen: breaksEarned > (cram.studyBreaksRemaining || 0),
    } },
  }));
}

function onCramKill(state, setState, count){
  const cram = state.arena && state.arena.cram;
  if (!cram) return;
  const n = count || 1;
  setState(s => ({...s, arena:{...s.arena, cram:{...cram, killCount:(cram.killCount||0)+n}}}));
}

/* Track per-run wrong-answer IDs so the boss can punish them. */
function onCramMistake(state, setState, qId){
  if (!qId) return;
  const cram = state.arena && state.arena.cram;
  if (!cram) return;
  const cur = cram.runMistakeIds || [];
  if (cur.includes(qId)) return;
  setState(s => ({...s, arena:{...s.arena, cram:{...cram, runMistakeIds:[...cur, qId].slice(-30)}}}));
}

function consumeStudyBreak(state, setState, abilityId){
  const cram = state.arena && state.arena.cram;
  if (!cram) return;
  const drafted = cram.draftedAbilities || [];
  setState(s => ({
    ...s,
    arena: { ...s.arena,
      cram: {
        ...cram,
        draftedAbilities: drafted.includes(abilityId) ? drafted : [...drafted, abilityId],
        studyBreaksRemaining: Math.max(0, (cram.studyBreaksRemaining || 0) - 1),
        studyBreakOpen: false,
      },
    },
  }));
}

/* ---------- UI ---------- */
function CramHub({ mod, state, setState, onLaunch }){
  const cram = (state.arena && state.arena.cram) || defaultCramState();
  const [draftOpen, setDraftOpen] = useState(false);
  const draftPool = useMemo(() => getCramDraftPool(state), [state.arena?.unlockedSkills?.length]);

  if (draftOpen){
    return (
      <CramDraftView
        pool={draftPool}
        onCancel={()=>setDraftOpen(false)}
        onConfirm={(picked)=>{
          setDraftOpen(false);
          onLaunch(mod.id, picked);
        }}
      />
    );
  }

  return (
    <div>
      <h2>⚡ Blitz Mode — The Night Before</h2>
      <div className="muted" style={{marginBottom:14}}>
        Wave survival, study-style. Pick 3 starting abilities, fight 10 waves, beat the boss.
        <b> HP halved, XP × {CRAM_XP_MULT}.</b> Every 3 waves cleared = pick a new ability for free.
        Boss spawns at <b>wave 10 OR 10:00 elapsed</b> (no early skip).
      </div>
      <div className="card char-card">
        <h3 style={{marginBottom:10}}>Your record — {mod.name}</h3>
        <div className="char-stats">
          <div className="stat"><span className="stat-label">Best waves</span><span className="stat-val">{cram.bestWaves || 0}</span></div>
          <div className="stat"><span className="stat-label">Best kills</span><span className="stat-val">{cram.bestKills || 0}</span></div>
          <div className="stat"><span className="stat-label">Mode</span><span className="stat-val pos">Glass cannon</span></div>
          <div className="stat"><span className="stat-label">XP mult</span><span className="stat-val pos">{CRAM_XP_MULT.toFixed(1)}×</span></div>
        </div>
        <div className="row" style={{marginTop:14,gap:8}}>
          <button className="btn" onClick={()=>setDraftOpen(true)}>⚡ Begin Draft</button>
          <span className="tiny">Module: {mod.name}</span>
        </div>
      </div>
      <div className="card">
        <h3>How it works</h3>
        <div className="prose">
          <ul>
            <li><b>Draft 3 abilities</b> at the start. Hotbar overrides — combat uses these only (plus weapon basic).</li>
            <li><b>Wave clear → next wave</b>, no downtime. Difficulty scales every wave.</li>
            <li><b>Every 3 waves cleared</b>: pick 1 of 3 new tree abilities to add to your kit.</li>
            <li><b>Boss spawns at wave 10 OR 10:00</b> — whichever comes first. <b>No early-skip.</b></li>
            <li><b>Boss questions are personal.</b> 70% drawn from your lifetime + this run's wrong answers, 30% from exam pool.</li>
            <li>Win = <b>{CRAM_XP_MULT}× XP + a Mythic augment + lore unlock</b>. Lose = bests saved, no penalty.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* CramDraftView — pre-run modal. Player picks 3 from the pool. */
function CramDraftView({ pool, onCancel, onConfirm }){
  const [picked, setPicked] = useState([]);
  const togglePick = (id)=>{
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length < 3 ? [...prev, id] : prev));
  };
  return (
    <div>
      <h2>📋 Cram Draft</h2>
      <div className="muted" style={{marginBottom:14}}>
        Pick {3 - picked.length > 0 ? `${3 - picked.length} more` : '3 — done'} ability{picked.length===2?'':'ies'} to bring into the run.
        Your hotbar will be locked to these for the whole cram. Choose carefully.
      </div>
      <div className="cram-draft-grid">
        {pool.map(a => {
          const isPicked = picked.includes(a.id);
          return (
            <button key={a.id} className={'cram-draft-card'+(isPicked?' picked':'')+(a.kind==='passive'?' passive':'')} onClick={()=>togglePick(a.id)}>
              <div className="cram-draft-icon">{a.icon}</div>
              <div className="cram-draft-name">{a.name}</div>
              <span className={'codex-tier-pill tier-'+(a.tier||'common')}>{a.kind || 'active'} · {a.tier || ''}</span>
              <div className="cram-draft-desc tiny">{(typeof a.getDesc === 'function') ? a.getDesc(1) : a.desc}</div>
              {isPicked && <div className="cram-draft-check">✓</div>}
            </button>
          );
        })}
      </div>
      <div className="row" style={{marginTop:14,gap:8}}>
        <button className="btn" disabled={picked.length !== 3} onClick={()=>onConfirm(picked)}>
          {picked.length === 3 ? '⚔️ Lock in & Start' : `Pick ${3 - picked.length} more`}
        </button>
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CramTimerStrip({ cram }){
  const [, setNow] = useState(Date.now());
  useEffect(()=>{
    if (!cram || !cram.active || cram.bossPhase) return;
    const i = setInterval(()=> setNow(Date.now()), 250);
    return ()=> clearInterval(i);
  }, [cram?.active, cram?.bossPhase]);
  const remaining = cramRemainingMs(cram);
  const isUrgent = remaining < 60_000 && !cram?.bossPhase;
  const waveProgress = Math.min(100, ((cram?.waveIndex || 0) / CRAM_BOSS_WAVE) * 100);
  return (
    <div className={'cram-timer-strip'+(isUrgent?' urgent':'')}>
      <span className="tiny">CRAM</span>
      <span className="cram-timer-clock">
        {cram?.bossPhase ? '👹 BOSS' : fmtCramTimer(remaining)}
      </span>
      <span className="chip">Wave {cram?.waveIndex || 0} / {CRAM_BOSS_WAVE}</span>
      <span className="chip">Kills {cram?.killCount || 0}</span>
      {cram?.studyBreaksRemaining > 0 && (
        <span className="chip ok">📚 {cram.studyBreaksRemaining} pick{cram.studyBreaksRemaining>1?'s':''} ready</span>
      )}
      {!cram?.bossPhase && (
        <div className="cram-progress-bar"><div className="cram-progress-fill" style={{width: waveProgress + '%'}}/></div>
      )}
    </div>
  );
}

function StudyBreakModal({ state, setState, onClose }){
  const options = useMemo(()=> pickStudyBreakOptions(state), []);
  if (!options.length){
    return (
      <div className="cram-modal-overlay" onClick={onClose}>
        <div className="cram-modal" onClick={e=>e.stopPropagation()}>
          <h2>📚 Study Break</h2>
          <div className="muted">No new abilities to learn. Take a breather instead.</div>
          <button className="btn" style={{marginTop:14}} onClick={onClose}>Continue</button>
        </div>
      </div>
    );
  }
  return (
    <div className="cram-modal-overlay">
      <div className="cram-modal">
        <h2>📚 Study Break</h2>
        <div className="muted" style={{marginBottom:14}}>Pick one to add to your hotbar for the rest of this run.</div>
        <div className="grid3">
          {options.map(a => (
            <button key={a.id} className="card cram-pick-card" onClick={()=> consumeStudyBreak(state, setState, a.id)}>
              <div style={{fontSize:32}}>{a.icon}</div>
              <h3 style={{margin:'6px 0 4px'}}>{a.name}</h3>
              <div className="tiny">{a.kind === 'active' ? 'Active' : 'Passive'} · {a.tier || ''}</div>
              <div className="muted" style={{fontSize:12,marginTop:6}}>{(typeof a.getDesc === 'function') ? a.getDesc(1) : a.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function awardCramVictory(state, setState, baseXp){
  const xp = Math.round((baseXp || 100) * 2);
  const eq = (state.inventory && state.inventory.equipment) || {};
  const ownedLegendaries = CRAM_LEGENDARY_AUGMENTS.filter(id => eq[id] && eq[id].quantity);
  const unowned = CRAM_LEGENDARY_AUGMENTS.filter(id => !ownedLegendaries.includes(id));
  let nextEquipment = {...eq};
  let droppedAugId = null;
  if (unowned.length > 0){
    droppedAugId = unowned[Math.floor(Math.random() * unowned.length)];
    nextEquipment[droppedAugId] = { id: droppedAugId, quantity: 1, discovered: true };
  } else if (CRAM_LEGENDARY_AUGMENTS.length){
    droppedAugId = CRAM_LEGENDARY_AUGMENTS[Math.floor(Math.random() * CRAM_LEGENDARY_AUGMENTS.length)];
    const cur = nextEquipment[droppedAugId] || { id: droppedAugId, quantity: 0, discovered: true };
    nextEquipment[droppedAugId] = { ...cur, quantity: (cur.quantity || 0) + 1, discovered: true };
  }
  setState({
    ...state,
    xp: (state.xp || 0) + xp,
    inventory: { ...(state.inventory||{}), equipment: nextEquipment },
    arena: { ...state.arena, cram: { ...defaultCramState(),
      bestKills: Math.max((state.arena.cram?.bestKills)||0, (state.arena.cram?.killCount)||0),
      bestWaves: Math.max((state.arena.cram?.bestWaves)||0, (state.arena.cram?.waveIndex)||0),
    }}
  });
  return { xpAwarded: xp, legendaryDropped: droppedAugId };
}
