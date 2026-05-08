/* ============ RAIDS — 4-PHASE BOSS ARENAS ============ *
 * Splice AFTER arena_runtime.jsx (uses LOOT_TABLE, RAID_TYPES, RELIC_MAP, dropLoot)
 * but BEFORE combat.jsx (RaidView wraps CombatScreen).
 *
 * Structure: each raid is a chain of 4 CombatScreens, one per phase.
 * After phase 4 clears: relic + bonus mythic + raid completion stamp.
 */

const RAID_PHASES = ['setup','pressure','burn','death'];
const RAID_PHASE_META = {
  setup:    { idx:1, name:'Setup',    icon:'🎯', desc:'Read the boss. Standard pressure. Insights allowed.' },
  pressure: { idx:2, name:'Pressure', icon:'🔥', desc:'Heavier attacks. More minions. Less margin.' },
  burn:     { idx:3, name:'Burn',     icon:'⏱️', desc:'DOT every turn. Clear fast or you cook.' },
  death:    { idx:4, name:'Death',    icon:'☠️', desc:'Final stand. Bigger boss, biggest reward.' },
};

const RAID_DEFS = {
  logic_singularity: {
    id:'logic_singularity',
    name:'Logic Singularity',
    icon:'🧠',
    accent:'#8b9eff',
    desc:'A self-rewriting algorithm. Mistakes punish more than misses.',
    relicId:'neural_adapter',
    phases: {
      setup:    { hpMul:1.0,  dmgMul:1.0, dotPerTurn:0, addCount:0, name:'Subroutine', icon:'⚙️' },
      pressure: { hpMul:1.4,  dmgMul:1.2, dotPerTurn:0, addCount:1, name:'Recursion',  icon:'🌀' },
      burn:     { hpMul:1.3,  dmgMul:1.1, dotPerTurn:4, addCount:1, name:'Stack Overflow', icon:'💣' },
      death:    { hpMul:2.0,  dmgMul:1.4, dotPerTurn:2, addCount:0, name:'Singularity', icon:'🧠' },
    },
  },
  malware_hive: {
    id:'malware_hive',
    name:'Malware Hive',
    icon:'🐛',
    accent:'#22c55e',
    desc:'A nest of rogue processes. Always more spawning.',
    relicId:'bio_upgrade',
    phases: {
      setup:    { hpMul:0.9,  dmgMul:0.9, dotPerTurn:0, addCount:1, name:'Worker Bees', icon:'🐝' },
      pressure: { hpMul:1.1,  dmgMul:1.1, dotPerTurn:0, addCount:2, name:'Swarm',       icon:'🐝' },
      burn:     { hpMul:1.0,  dmgMul:1.0, dotPerTurn:3, addCount:2, name:'Infestation', icon:'🪲' },
      death:    { hpMul:1.8,  dmgMul:1.3, dotPerTurn:1, addCount:1, name:'Queen',       icon:'👑' },
    },
  },
  corrupted_professor: {
    id:'corrupted_professor',
    name:'Corrupted Professor',
    icon:'👨‍🏫',
    accent:'#f87171',
    desc:'A 1-on-1 with the entity that grades you. Streak management is everything.',
    relicId:'shadow_badge',
    phases: {
      setup:    { hpMul:1.2,  dmgMul:1.0, dotPerTurn:0, addCount:0, name:'Pop Quiz',    icon:'📝' },
      pressure: { hpMul:1.4,  dmgMul:1.2, dotPerTurn:0, addCount:0, name:'Mid-term',    icon:'📋' },
      burn:     { hpMul:1.5,  dmgMul:1.1, dotPerTurn:5, addCount:0, name:'Detention',   icon:'⏳' },
      death:    { hpMul:2.4,  dmgMul:1.5, dotPerTurn:0, addCount:0, name:'Final Exam',  icon:'🎓' },
    },
  },
};

function defaultRaidProgress(){
  return { activeRaidId: null, phaseIdx: 0, completed: {}, runs: 0 };
}

function buildRaidBoss(raidDef, phaseKey, mod, skill){
  const ph = raidDef.phases[phaseKey];
  const lvl = Math.max(1, skill?.level || 1);
  const baseHp = 80 + lvl * 14;
  const hp = Math.round(baseHp * (ph.hpMul || 1));
  return {
    id: raidDef.id + '_' + phaseKey,
    name: ph.name + ' · ' + raidDef.name,
    emoji: ph.icon,
    hp,
    dmg: { light: Math.round((8 + lvl) * (ph.dmgMul || 1)), heavy: Math.round((14 + lvl * 2) * (ph.dmgMul || 1)) },
    pattern: ['light','heavy','light','heavy','heavy'],
    levelId: null,
    raidPhase: phaseKey,
    raidId: raidDef.id,
    raidPhaseMods: { dotPerTurn: ph.dotPerTurn || 0, addCount: ph.addCount || 0 },
  };
}

function RaidHubView({ state, setState, mod, skill, arena, onStartFight, onBack }){
  const progress = arena.raidProgress || defaultRaidProgress();
  return (
    <div>
      <h2>⚡ Raids</h2>
      <div className="muted" style={{marginBottom:14}}>Four phases per raid: Setup → Pressure → Burn → Death. Clear all four to drop the boss's relic and a bonus Mythic augment. Lose any phase, the run ends.</div>
      <div className="raid-hub-grid">
        {Object.values(RAID_DEFS).map(rd => {
          const completed = !!progress.completed[rd.id];
          return (
            <div key={rd.id} className="card raid-card" style={{borderColor: rd.accent, boxShadow:'0 0 24px '+rd.accent+'33'}}>
              <div className="raid-card-head">
                <span className="raid-card-icon" style={{color:rd.accent}}>{rd.icon}</span>
                <div>
                  <h3 style={{marginBottom:4,color:rd.accent}}>{rd.name}</h3>
                  <div className="tiny">{rd.desc}</div>
                </div>
              </div>
              <div className="raid-phases-row">
                {RAID_PHASES.map((p,i)=>{
                  const ph = rd.phases[p];
                  const meta = RAID_PHASE_META[p];
                  return (
                    <div key={p} className="raid-phase-pip" title={meta.desc}>
                      <span className="raid-phase-pip-num">{meta.icon}</span>
                      <span className="tiny">{meta.name}</span>
                      <span className="raid-phase-pip-stats">HP×{ph.hpMul} · DMG×{ph.dmgMul}{ph.dotPerTurn?' · DOT '+ph.dotPerTurn:''}{ph.addCount?' · +'+ph.addCount+' adds':''}</span>
                    </div>
                  );
                })}
              </div>
              <div className="raid-card-rewards tiny">
                <span>🏆 Reward: {LOOT_TABLE[rd.relicId]?.icon} {LOOT_TABLE[rd.relicId]?.name} + bonus Mythic</span>
                {completed && <span className="chip ok" style={{marginLeft:6}}>✓ Cleared</span>}
              </div>
              <button className="btn" style={{marginTop:10,width:'100%',background:rd.accent,color:'#0a0b10'}}
                onClick={()=>onStartFight(rd.id)}>
                {completed ? 'Run Again' : 'Begin Raid'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* RaidView — drives the 4-phase chain. Each phase is a CombatScreen.
 * After each clear: advance phase. After phase 4: award rewards + return to hub. */
function RaidView({ raidId, state, setState, mod, skill, arena, onExit }){
  const raidDef = RAID_DEFS[raidId];
  const [phaseKey, setPhaseKey] = useState('setup');
  const [done, setDone] = useState(false);
  const [outcome, setOutcome] = useState(null);

  if (!raidDef){
    return (
      <div className="card">
        <h2>Unknown raid</h2>
        <button className="btn ghost" onClick={onExit}>Back</button>
      </div>
    );
  }

  if (done){
    const rewardItem = LOOT_TABLE[raidDef.relicId];
    const bonusMythicPool = ['infinite_loop','silver_bullet','god_mode','overflowing_chalice'];
    return (
      <div>
        <div className="card" style={{textAlign:'center',padding:'24px',borderColor:raidDef.accent,boxShadow:'0 0 32px '+raidDef.accent+'66'}}>
          <h2 style={{color:raidDef.accent,fontSize:28,marginBottom:8}}>✨ Raid Cleared</h2>
          <div className="muted" style={{marginBottom:14}}>{raidDef.name} — all 4 phases down.</div>
          {outcome && (
            <div className="raid-rewards-row">
              {outcome.drops.map((d,i)=>(
                <div key={i} className={'loot-card tier-'+d.item.tier}>
                  <span className="loot-new-badge">RAID</span>
                  <div className="loot-icon">{d.item.icon}</div>
                  <div className="loot-name">{d.item.name}</div>
                  <span className={'codex-tier-pill tier-'+d.item.tier}>{d.item.tier}</span>
                  <div className="loot-desc">{d.item.desc}</div>
                </div>
              ))}
            </div>
          )}
          <button className="btn" style={{marginTop:14}} onClick={onExit}>Return to Arena</button>
        </div>
      </div>
    );
  }

  const meta = RAID_PHASE_META[phaseKey];
  const phaseIdx = meta.idx;
  const totalPhases = RAID_PHASES.length;
  const boss = buildRaidBoss(raidDef, phaseKey, mod, skill);

  const handleEnd = (res) => {
    if (!res.won){
      // Run ended early
      onExit();
      return;
    }
    const nextIdx = RAID_PHASES.indexOf(phaseKey) + 1;
    if (nextIdx >= totalPhases){
      // Award rewards
      const drops = [];
      if (LOOT_TABLE[raidDef.relicId]) drops.push({ item: LOOT_TABLE[raidDef.relicId], quantity:1 });
      const bonusMythicPool = ['infinite_loop','silver_bullet','god_mode','overflowing_chalice'];
      const bonusId = bonusMythicPool[Math.floor(Math.random() * bonusMythicPool.length)];
      if (LOOT_TABLE[bonusId]) drops.push({ item: LOOT_TABLE[bonusId], quantity:1 });
      // Persist drops + completion stamp
      setState(s => {
        const inv = (typeof addDropsToInventory === 'function') ? addDropsToInventory(s, drops) : s.inventory;
        const ar = s.arena || {};
        const prog = ar.raidProgress || defaultRaidProgress();
        return {
          ...s,
          inventory: inv,
          arena: {
            ...ar,
            raidProgress: { ...prog, completed: { ...prog.completed, [raidDef.id]: true }, runs: (prog.runs || 0) + 1, activeRaidId: null, phaseIdx: 0 },
          },
        };
      });
      setOutcome({ drops });
      setDone(true);
      return;
    }
    setPhaseKey(RAID_PHASES[nextIdx]);
  };

  return (
    <div>
      <div className="card raid-phase-banner" style={{borderColor:raidDef.accent,background:'linear-gradient(135deg,'+raidDef.accent+'22, transparent 70%), var(--panel)'}}>
        <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div className="row" style={{gap:10,alignItems:'center'}}>
            <span style={{fontSize:24}}>{raidDef.icon}</span>
            <div>
              <div style={{fontWeight:700,color:raidDef.accent}}>{raidDef.name}</div>
              <div className="tiny">Phase {phaseIdx} of {totalPhases} — {meta.name}</div>
            </div>
          </div>
          <div className="row" style={{gap:6}}>
            {RAID_PHASES.map((p,i)=>{
              const isPast = i < phaseIdx - 1;
              const isCurrent = i === phaseIdx - 1;
              return <span key={p} className={'raid-phase-dot'+(isPast?' done':'')+(isCurrent?' active':'')} title={RAID_PHASE_META[p].name}>{RAID_PHASE_META[p].icon}</span>;
            })}
          </div>
        </div>
        <div className="tiny" style={{marginTop:8,color:'var(--text-2)'}}>{meta.desc}</div>
      </div>
      <CombatScreen
        key={phaseKey}
        mod={mod}
        boss={boss}
        mode={'boss'}
        levelId={null}
        conceptFilter={null}
        arena={arena}
        skill={skill}
        state={state}
        setState={setState}
        onEnd={handleEnd}
      />
      <div className="row" style={{marginTop:8}}>
        <button className="btn ghost sm" onClick={onExit}>✕ Forfeit Raid</button>
      </div>
    </div>
  );
}
