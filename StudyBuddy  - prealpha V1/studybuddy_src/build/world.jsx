/* ============ WORLD FLOW: Dojo / Practice / Street / Elite / Boss ============ */

const ELITE_MASTERY_THRESHOLD = 0.6; // 60% of a level's concepts at SR interval >= 7

function masteryOfLevel(state, level){
  const sr = state.sr || {};
  let mastered = 0;
  for (const c of level.concepts){
    if (c.questions.some(q => (sr[q.id]||{}).interval >= 7)) mastered++;
  }
  return { mastered, total: level.concepts.length, frac: level.concepts.length===0 ? 0 : mastered/level.concepts.length };
}

function eliteUnlocked(state, mod, levelId){
  const lv = mod.levels.find(l=>l.id===levelId); if (!lv) return false;
  const m = masteryOfLevel(state, lv);
  const beaten = (state.arena && state.arena.bossesBeaten) || {};
  const streetBossId = mod.id+'_street_'+levelId;
  return (m.frac >= ELITE_MASTERY_THRESHOLD) || (beaten[streetBossId] === true);
}

function bossUnlocked(state, arena, mod){
  const beaten = arena.bossesBeaten || {};
  return mod.levels.every(lv => beaten[mod.id+'_elite_'+lv.id]);
}

/* Per-biome emoji palettes — `getBiome` (arena_runtime.jsx) decides which biome
 * each module gets; we just look up the right palette from biome.id. Streets
 * cycle through the street pool by level index, elites use the elite emoji,
 * bosses use the boss emoji. Falls back to the originals if biome unknown. */
const BIOME_EMOJI_PALETTES = {
  server_room: { street:['🖥️','🔌','💾','📡'],   elite:'⚡',  boss:'🌐' },
  library:     { street:['📚','🪑','🕯️','📖'],   elite:'📜',  boss:'🦉' },
  cyberpunk:   { street:['🌃','🛵','🍜','🕶️'],   elite:'🤖',  boss:'👁️' },
  cathedral:   { street:['⛪','🕯️','🪦','🔔'],   elite:'👼',  boss:'⚖️' },
  wasteland:   { street:['🏜️','💀','🦴','☢️'],   elite:'🦅',  boss:'🐍' },
  lab:         { street:['🧪','⚗️','🔬','💊'],   elite:'🧬',  boss:'☣️' },
  boss_sanctum:{ street:['👑','🗡️','🛡️','🏰'],  elite:'⚔️',  boss:'👑' },
  foundry:     { street:['🔥','🔨','⚒️','🪨'],   elite:'🌋',  boss:'🐉' },
  sky:         { street:['🌤️','☁️','🪁','✈️'],  elite:'🦅',  boss:'⛈️' },
  quarantine:  { street:['☣️','🦠','💉','🧫'],   elite:'🦟',  boss:'☠️' },
  corridor:    { street:['🌀','🌫️','🪞','🎭'],  elite:'👁️',  boss:'∞' },
  deep_web:    { street:['🌐','🕸️','🦑','🌑'],   elite:'🦈',  boss:'🐙' },
  high_speed:  { street:['⚡','🚀','💨','📈'],   elite:'🏎️',  boss:'⚡' },
  abandoned:   { street:['🏚️','📦','🕸️','🪦'],  elite:'🐀',  boss:'👻' },
  void:        { street:['🌑','⚫','🕳️','✨'],    elite:'👻',  boss:'🌌' },
  default:     { street:['🥊','👊','🤺','⚔️'],   elite:'⭐',  boss:'👑' },
};

function biomePalette(modId){
  const b = (typeof getBiome === 'function') ? getBiome(modId) : null;
  return BIOME_EMOJI_PALETTES[b?.id] || BIOME_EMOJI_PALETTES.default;
}

function genWorld(mod){
  const subj = mod.name || mod.id;
  const palette = biomePalette(mod.id);
  return {
    moduleId: mod.id,
    name: subj,
    streets: mod.levels.map((lv, idx) => ({
      tier: lv.tier || (idx+1),
      chapter: 'Chapter ' + (idx+1) + '.1',
      name: 'Chapter ' + (idx+1) + '.1 · ' + lv.name,
      emoji: palette.street[idx % palette.street.length],
      hp: 50 + (idx+1)*25,
      dmg:{light: 5+(idx+1)*2, heavy: 9+(idx+1)*3},
      pattern: ['light','light',idx>0?'heavy':''].filter(Boolean),
      id: mod.id+'_street_'+lv.id,
      levelId: lv.id,
      subject: subj,
      kind:'street',
    })),
    elites: mod.levels.map((lv, idx) => ({
      id: mod.id+'_elite_'+lv.id, kind:'elite',
      chapter: 'Chapter ' + (idx+1) + '-Elite',
      name: 'Chapter ' + (idx+1) + '-Elite · ' + lv.name,
      levelId: lv.id, subject: subj, emoji: palette.elite,
      hp: 110, dmg:{light:9, heavy:17},
      pattern:['light','heavy','light','heavy','heavy'],
    })),
    boss: {
      id: mod.id+'_finalboss', kind:'boss',
      chapter: 'Final Chapter',
      name: 'Final Chapter · ' + subj, subject: subj, emoji: palette.boss,
      hp: 200, dmg:{light:12, heavy:24},
      pattern:['heavy','light','heavy','heavy','light','heavy'],
    },
    practice: {
      id: mod.id+'_practice', kind:'practice',
      name:'Training Dummy', subject:subj, emoji:'🪵',
      hp: 9999, dmg:{light:0, heavy:0},
      pattern:['light','light'],
    },
  };
}

/* ---------- WORLD VIEW (per-module hub) ---------- */
function WorldView({ mod, state, setState, arena, onPickFight, onOpenDojo }){
  const world = useMemo(()=>genWorld(mod), [mod.id]);
  const beaten = arena.bossesBeaten || {};
  const lvl = levelFromXp(state.xp||0).level;

  const eliteRows = mod.levels.map(lv => {
    const m = masteryOfLevel(state, lv);
    const unlocked = eliteUnlocked(state, mod, lv.id);
    const elite = world.elites.find(e=>e.levelId===lv.id);
    const isBeat = !!beaten[elite.id];
    return { lv, m, unlocked, elite, isBeat };
  });
  const bossOpen = bossUnlocked(state, arena, mod);
  const eliteCount = eliteRows.length;
  const elitesBeat = eliteRows.filter(r=>r.isBeat).length;

  return (
    <div>
      <h2>🌍 {mod.id} World</h2>
      
      {/* Raid Alert */}
      <div className="card" style={{marginBottom:12,background:'var(--warn-soft)',border:'1px solid var(--warn)',padding:'10px 14px'}}>
        <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <span style={{color:'var(--warn)',fontWeight:700}}>⚠️ RAID ALERT</span>
            <div className="tiny" style={{marginTop:2}}>{mod.raidType?.name || 'No raid active'}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="tiny">Recommended</div>
            <div style={{fontWeight:600,color:'var(--accent)'}}>{mod.raidType?.recommended || '—'}</div>
          </div>
        </div>
      </div>
      
      <div className="muted" style={{marginBottom:14}}>
        Pick a stage. Each one teaches, tests or proves something different.
      </div>

      {/* Stage 1: Dojo */}
      <div className="card stage-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div className="row" style={{gap:14,alignItems:'flex-start'}}>
            <div className="stage-emoji">🏯</div>
            <div>
              <h3 style={{marginBottom:2}}>Dojo · Learn</h3>
              <div className="muted" style={{fontSize:12.5}}>Read the concept notes. Build the foundation. Always open, no penalties.</div>
            </div>
          </div>
          <button className="btn" onClick={onOpenDojo}>Open Dojo</button>
        </div>
      </div>

      {/* Stage 2: Practice */}
      <div className="card stage-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div className="row" style={{gap:14,alignItems:'flex-start'}}>
            <div className="stage-emoji">🪵</div>
            <div>
              <h3 style={{marginBottom:2}}>Practice · Train safely</h3>
              <div className="muted" style={{fontSize:12.5}}>Fight a training dummy. Concept notes stay visible. You can't lose.</div>
            </div>
          </div>
          <PracticeSelect mod={mod} onStart={(conceptIds)=>onPickFight({fight: world.practice, mode:'practice', conceptFilter: conceptIds})}/>
        </div>
      </div>

      {/* Stage 3: Street fights */}
      <div className="card stage-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,gap:12}}>
          <div className="row" style={{gap:14,alignItems:'flex-start'}}>
            <div className="stage-emoji">🥊</div>
            <div>
              <h3 style={{marginBottom:2}}>Street · Test yourself</h3>
              <div className="muted" style={{fontSize:12.5}}>Standard combat from the whole module. Insights allowed.</div>
            </div>
          </div>
        </div>
        <div className="grid3">
          {world.streets.map(s=>{
            const isBeat = !!beaten[s.id];
            return (
              <div key={s.id} className="card boss-card">
                <div className="boss-emoji">{s.emoji}</div>
                <h3>{s.name}</h3>
                <div className="row" style={{justifyContent:'center',gap:6,marginTop:4}}>
                  <span className="chip">HP {s.hp}</span>
                  <span className="chip warn">⚔️ {s.dmg.light}</span>
                  <span className="chip err">💥 {s.dmg.heavy}</span>
                </div>
                <div style={{marginTop:12,display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
                  <button className="btn" onClick={()=>onPickFight({fight:s, mode:'street'})}>{isBeat?'Rematch':'Fight'}</button>
                  {isBeat && <span className="chip ok">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage 4: Elites */}
      <div className="card stage-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,gap:12}}>
          <div className="row" style={{gap:14,alignItems:'flex-start'}}>
            <div className="stage-emoji">⭐</div>
            <div>
              <h3 style={{marginBottom:2}}>Elites · Topic mastery</h3>
              <div className="muted" style={{fontSize:12.5}}>One per topic. Questions only from that topic. Limited insights ({2}). Unlocks when you master 60% of concepts OR beat the Street Boss for that topic.</div>
            </div>
          </div>
          <span className="chip">{elitesBeat} / {eliteCount} beaten</span>
        </div>
        <div className="grid2">
          {eliteRows.map(({lv,m,unlocked,elite,isBeat})=>(
            <div key={elite.id} className={'card elite-card'+(unlocked?'':' locked')}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <div className="row" style={{gap:8}}>
                  <span style={{fontSize:22}}>⭐</span>
                  <div>
                    <h3 style={{marginBottom:0}}>{lv.name}</h3>
                    <div className="tiny">HP {elite.hp} · ⚔️ {elite.dmg.light} · 💥 {elite.dmg.heavy}</div>
                  </div>
                </div>
                {isBeat && <span className="chip ok">✓ Beaten</span>}
              </div>
              <div className="elite-mastery">
                <div className="tiny" style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span>Mastery</span>
                  <span>{m.mastered} / {m.total} concepts at 7d+</span>
                </div>
                <div className="hp-bar"><div className="hp-fill" style={{width:Math.min(100,(m.frac/Math.max(0.001,ELITE_MASTERY_THRESHOLD))*100)+'%', background: unlocked?'linear-gradient(90deg, var(--ok), #22c55e)':'linear-gradient(90deg, var(--warn), #d97706)'}}/></div>
              </div>
              <div style={{marginTop:10}}>
                {unlocked
                  ? <button className="btn" onClick={()=>onPickFight({fight:elite, mode:'elite'})}>{isBeat?'Rematch':'Challenge Elite'}</button>
                  : <span className="tiny">🔒 Master 60% of concepts OR defeat the Street Boss to unlock.</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage 5: Final Boss */}
      <div className="card stage-card boss-stage">
        <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
          <div className="row" style={{gap:14,alignItems:'flex-start'}}>
            <div className="stage-emoji">👑</div>
            <div>
              <h3 style={{marginBottom:2}}>Final Boss · {world.boss.name}</h3>
              <div className="muted" style={{fontSize:12.5}}>Mixed topics. No insights. Long fight. Unlocks once you've beaten every Elite.</div>
            </div>
          </div>
          {bossOpen
            ? <button className="btn" onClick={()=>onPickFight({fight:world.boss, mode:'boss'})}>{beaten[world.boss.id]?'Rematch Boss':'⚔️ Challenge'}</button>
            : <span className="chip warn">🔒 {elitesBeat} / {eliteCount} elites</span>}
        </div>
        {beaten[world.boss.id] && <div className="chip ok" style={{marginTop:10}}>👑 You've beaten {world.boss.name}</div>}
      </div>
    </div>
  );
}

/* ---------- INSIGHTS PANEL (used inside CombatScreen) ---------- */
function InsightsPanel({ state, setState, allowed, used, max, onHint, onReroll, onRestoreStreak, canRestore }){
  if (!allowed){
    return <div className="insights-panel disabled"><span className="tiny">💡 Insights disabled in this fight</span></div>;
  }
  const remaining = max==null ? Infinity : Math.max(0, max-used);
  const insights = state.insights || 0;
  const can = (cost)=> insights>=cost && remaining>0;
  return (
    <div className="insights-panel">
      <div className="row" style={{justifyContent:'space-between',marginBottom:6}}>
        <span className="tiny">💡 INSIGHTS · balance {insights}{max!=null?(' · '+remaining+' uses left this fight'):''}</span>
      </div>
      <div className="row" style={{gap:6,flexWrap:'wrap'}}>
        <button className="btn ghost sm" disabled={!can(1)} onClick={onHint}>💡 Hint (1)</button>
        <button className="btn ghost sm" disabled={!can(2)} onClick={onReroll}>🎲 New question (2)</button>
        <button className="btn ghost sm" disabled={!can(3) || !canRestore} onClick={onRestoreStreak}>🔥 Restore streak (3)</button>
      </div>
    </div>
  );
}

/* ---------- PRACTICE TOPIC SELECTOR ---------- */
function PracticeSelect({ mod, onStart }){
  const [showMenu, setShowMenu] = React.useState(false);
  const [selected, setSelected] = React.useState(() => {
    const all = mod.levels.flatMap(l => l.concepts.map(c => c.id));
    return new Set(all);
  });
  
  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const allSelected = selected.size === mod.levels.flatMap(l=>l.concepts).length;
  const toggleAll = () => {
    if (allSelected){
      setSelected(new Set());
    } else {
      setSelected(new Set(mod.levels.flatMap(l => l.concepts.map(c => c.id))));
    }
  };
  
  const handleStart = () => {
    const conceptIds = Array.from(selected);
    onStart(conceptIds);
    setShowMenu(false);
  };
  
  if (!showMenu){
    return <button className="btn ghost" onClick={()=>setShowMenu(true)}>Start Practice</button>;
  }
  
  return (
    <div style={{position:'relative'}}>
      <button className="btn ghost" onClick={()=>setShowMenu(false)}>Cancel</button>
      <div className="card" style={{position:'absolute',right:0,top:'110%',zIndex:50,width:240,maxHeight:300,overflow:'auto',padding:10}}>
        <div className="row" style={{justifyContent:'space-between',marginBottom:8}}>
          <span className="tiny">Select concepts</span>
          <button className="tiny" style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer'}} onClick={toggleAll}>
            {allSelected?'Deselect All':'Select All'}
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {mod.levels.map(lv => (
            <div key={lv.id}>
              <div className="tiny" style={{color:'var(--muted)',marginTop:6}}>{lv.name}</div>
              {lv.concepts.map(c => (
                <label key={c.id} className="row" style={{gap:6,cursor:'pointer',alignItems:'center'}}>
                  <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggle(c.id)}/>
                  <span className="tiny">{c.name}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <button className="btn" style={{marginTop:10,width:'100%'}} onClick={handleStart}>
          Start Practice
        </button>
      </div>
    </div>
  );
}
