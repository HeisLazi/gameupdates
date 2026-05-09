/* ============ ARENA ROOT ============ */
function ArenaView({ mod, state, setState, onNavigate }){
  const [phase, setPhase] = useState('hub');
  const [fight, setFight] = useState(null);
  const [result, setResult] = useState(null);

  const arena = state.arena || initArena();
  const lvl = levelFromXp(state.xp||0).level;
  const skill = moduleSkill(state, mod);
  const prestigeRank = state.prestigeRank || 0;
  const prestigePerk = state.prestigePerk || null;
  const prestigeScaling = 1 + (prestigeRank * 0.10);
  const prestigeGlow = prestigeRank > 0 ? PRESTIGE_RANKS.find(r=>r.rank===Math.min(prestigeRank,10))?.color : null;

  // Loadout & Workshop are tabbed wrappers that consolidate the old standalone phases.
  // Old phase strings (armory/tree/hotbar/pets/passives/forge/librarian/exchange) now redirect
  // into the appropriate wrapper with the matching tab pre-selected, so any saved deep-links
  // or external setPhase calls keep working.
  const LOADOUT_PHASES = { armory:'armory', tree:'tree', hotbar:'hotbar', pets:'pets', passives:'passives' };
  const WORKSHOP_PHASES = { forge:'forge', librarian:'librarian', exchange:'exchange' };
  if (phase==='loadout' || LOADOUT_PHASES[phase]){
    return <LoadoutView initialTab={LOADOUT_PHASES[phase] || 'armory'} arena={arena} state={state} setState={setState} mod={mod}
      onEquipWeapon={id=>setState({...state,arena:{...arena,equipped:id}})}
      onSaveHotbar={hotbar=>setState({...state,arena:{...arena,hotbar}})}
      onBack={()=>setPhase('hub')}/>;
  }
  if (phase==='workshop' || WORKSHOP_PHASES[phase]){
    return <WorkshopView initialTab={WORKSHOP_PHASES[phase] || 'forge'} state={state} setState={setState} arena={arena} mod={mod} onBack={()=>setPhase('hub')}/>;
  }
  if (phase==='raids') return <RaidHubView state={state} setState={setState} mod={mod} skill={skill} arena={arena} onBack={()=>setPhase('hub')} onStartFight={(rid)=>{setFight({ raidId: rid }); setPhase('raid');}}/>;
  if (phase==='raid' && fight?.raidId) return <RaidView raidId={fight.raidId} state={state} setState={setState} mod={mod} skill={skill} arena={arena} onExit={()=>{setFight(null);setPhase('raids');}}/>;
  if (phase==='cram') return <div><CramHub mod={mod} state={state} setState={setState} onLaunch={(moduleId, drafted)=>{
    if(typeof startCram==='function') startCram(state, setState, moduleId, drafted || []);
    setFight({
      boss:{id:mod.id+'_cram', name:'Cram Wave', emoji:'☕', hp:80, dmg:{light:8,heavy:14}, pattern:['light','heavy','light'], levelId:null},
      mode:'cram',
    });
    setPhase('combat');
  }}/><div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={()=>setPhase('hub')}>Back to Arena</button></div></div>;
  if (phase==='combat' && fight) return <CombatScreen mod={mod} boss={fight.boss} mode={fight.mode||'street'} levelId={fight.levelId} conceptFilter={fight.conceptFilter} arena={arena} skill={skill} state={state} setState={setState} onEnd={res=>{setResult({...res,mode:fight.mode});setPhase('result');}}/>;
  if (phase==='result' && result) return <ResultScreen result={result} arena={arena} state={state} setState={setState} onContinue={()=>setPhase('hub')} onRematch={()=>{setFight(fight);setPhase('combat');setResult(null);}} onNavigate={onNavigate}/>;

  const weapon = WEAPONS.find(w=>w.id===(arena.equipped||'blade'))||WEAPONS[0];
  const weaponProg = getWeaponProgress(arena, weapon.id);
  const sp = availableSP(state, arena);
  const ALL_MODS = [...BUILTIN,...((state.customModules)||[])];
  const skills = ALL_MODS.map(m=>({mod:m,...moduleSkill(state,m)})).sort((a,b)=>b.level-a.level);
  const loadoutSlots = [...weaponAbilityIds(weapon).map(id=>ABILITIES[id]).filter(a=>a&&(!a.reqWeaponLvl||weaponProg.level>=a.reqWeaponLvl)).map(a=>({...a,slot:'weapon'})),...(arena.hotbar||[null,null,null,null]).map(id=>id?{...ABILITIES[id],slot:'hotbar'}:null)];

  return (
    <div>
      <h2 style={prestigeGlow?{textShadow:'0 0 10px '+prestigeGlow}:{}}>⚔️ Arena — {mod.name}</h2>
      <div className="muted" style={{marginBottom:14}}>Pick a boss. Choose your action <i>before</i> answering. Knowledge = damage. Streak = power.</div>

      {prestigeRank > 0 && (
        <div className="card" style={{marginBottom:12,background:'rgba(0,0,0,0.3)',border:'1px solid '+prestigeGlow}}>
          <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div><span style={{fontSize:11,color:prestigeGlow,fontWeight:700}}>⚡ ASCENDED SCHOLAR</span><div style={{fontSize:20,color:prestigeGlow,fontWeight:700}}>{PRESTIGE_RANKS.find(r=>r.rank===Math.min(prestigeRank,10))?.numeral||'0'}</div></div>
            <div style={{textAlign:'right'}}>
              {prestigePerk && <div style={{fontSize:12}}>{PRESTIGE_PERKS.find(p=>p.id===prestigePerk)?.icon} {PRESTIGE_PERKS.find(p=>p.id===prestigePerk)?.name}</div>}
              <div style={{fontSize:12,color:prestigeGlow}}>+{(prestigeRank*20)}% XP · +{(prestigeRank*10)}% Enemy HP</div>
            </div>
          </div>
        </div>
      )}

      <div className="card char-card dynamic-card">
        <div className="char-head">
          <div className="char-avatar"><div className="char-avatar-ring" style={prestigeGlow?{borderColor:prestigeGlow,boxShadow:'0 0 8px '+prestigeGlow}:{}}>L{lvl}</div></div>
          <div className="char-meta">
            <h3 style={{marginBottom:2}}>You · Level {lvl}</h3>
            <div className="tiny">{state.xp||0} XP · 🔥 {state.streak.count} day streak · {sp} SP</div>
            {prestigeRank>0 && <div className="tiny" style={{color:prestigeGlow}}>⚡ Rank {prestigeRank}</div>}
          </div>
          <div className="weapon-equipped">
            <div className="tiny" style={{textAlign:'right'}}>EQUIPPED</div>
            <div className="weapon-name"><span style={{fontSize:18}}>{weapon.icon}</span> {weapon.name}</div>
            <div className="tiny" style={{textAlign:'right'}}>{weapon.kind} · W-Lv {weaponProg.level}</div>
          </div>
        </div>
        <div className="char-stats">
          <div className="stat"><span className="stat-label">ATK</span><span className={'stat-val '+(weapon.atk>0?'pos':weapon.atk<0?'neg':'')}>{weapon.atk>=0?'+':''}{weapon.atk}</span></div>
          <div className="stat"><span className="stat-label">DEF</span><span className={'stat-val '+(weapon.def>0?'pos':weapon.def<0?'neg':'')}>{weapon.def>=0?'+':''}{weapon.def}</span></div>
          <div className="stat"><span className="stat-label">XP×</span><span className="stat-val">{(weapon.xpMul+(prestigePerk==='funding_secured'?0.5:0)).toFixed(1)}</span></div>
          <div className="stat"><span className="stat-label">{mod.id} skill</span><span className="stat-val pos">Lv {skill.level}</span></div>
        </div>
        <div style={{marginTop:10,padding:'8px 0',borderTop:'1px solid var(--panel2)'}}>
          <div className="tiny" style={{marginBottom:6}}>⚙️ WEAPON SOCKETS {(lvl>=6)?'(Lv.6+)':'(Ascended)'}</div>
          <div className="row" style={{gap:6,flexWrap:'wrap'}}>
            {[0,1].map(i=>{const augId=(arena.sockets||[])[i];const aug=augId?LOOT_TABLE[augId]:null;return(<div key={i} className="chip" style={aug?{background:'var(--accent-soft)',border:'1px solid var(--accent)',minWidth:80}:{opacity:0.3}}>{aug?<><span>{aug.icon}</span> <span style={{fontSize:11}}>{aug.name}</span></>:<span>Empty</span>}</div>);})}
          </div>
        </div>
        <div className="hotbar-preview">
          <div className="tiny" style={{marginBottom:6}}>HOTBAR · 6 slots (2 weapon + 4 tree)</div>
          <div className="hotbar-strip">{loadoutSlots.map((a,i)=>(<div key={i} className={'hotbar-slot mini '+(a?(a.slot==='weapon'?'weapon':'tree'):'empty')+(a?' filled':'')} title={a?getAbilityDesc(a,weaponProg.level):'Empty'}>{a?<><span className="hb-icon">{a.icon}</span><span className="hb-name">{a.name}</span></>:<span className="hb-empty">Empty</span>}</div>))}</div>
        </div>
        <div className="hub-toolbar hub-toolbar-collapsed">
          <div className="hub-toolbar-group">
            <span className="hub-toolbar-label">BUILD</span>
            <button className="hub-btn primary" onClick={()=>setPhase('loadout')} title="Loadout — Armory · Tree · Hotbar · Pets · Passives">🛠️<span>Loadout{sp>0?` · ${sp} SP`:''}</span></button>
            <button className="hub-btn" onClick={()=>setPhase('workshop')} title="Workshop — Forge · Librarian · Exchange">⚒️<span>Workshop{(state.inventory?.shards||0)>0?` · ${state.inventory.shards}`:''}</span></button>
          </div>
          <div className="hub-toolbar-group">
            <span className="hub-toolbar-label">PLAY</span>
            <button className="hub-btn" onClick={()=>setPhase('cram')} title="Blitz — ability-draft wave survival">⚡<span>Blitz</span></button>
            <button className="hub-btn" onClick={()=>setPhase('raids')} title="Raids — 4-phase boss chains">🔥<span>Raids</span></button>
          </div>
        </div>
      </div>

      <WorldView mod={mod} state={state} setState={setState} arena={arena} prestigeRank={prestigeRank} prestigeScaling={prestigeScaling}
        onPickFight={({fight,mode,conceptFilter})=>{setFight({boss:{...fight, conceptFilter},mode,levelId:fight.levelId,conceptFilter});setPhase('combat');}}
        onOpenDojo={()=>{if(onNavigate)onNavigate('library');}}/>

      <h3 style={{marginTop:18}}>Subject mastery</h3>
      <div className="card">
        <div className="muted" style={{marginBottom:8,fontSize:12.5}}>Mastery grows at 7-day spaced-rep intervals. Higher mastery = more damage on that module's boss.</div>
        <div className="skills-grid">{skills.map(({mod:m,level,mastered,total})=>(<div key={m.id} className={'skill-row'+(m.id===mod.id?' current':'')}><div className="skill-name">{m.id}</div><div className="skill-level">Lv {level}</div><div className="skill-bar"><div className="skill-fill" style={{width:Math.min(100,(mastered/Math.max(1,total))*100)+'%'}}/></div><div className="tiny">{mastered}/{total}</div></div>))}</div>
      </div>
    </div>
  );
}

/* ---------- ARMORY ---------- */
function ArmoryView({ arena, state, setState, mod, onPick, onBack }){
  const equipped = arena.equipped||'blade';
  const [selected, setSelected] = useState(equipped);
  const active = WEAPONS.find(w=>w.id===selected)||WEAPONS[0];
  const prog = getWeaponProgress(arena, active.id);
  const nextNeed = weaponXpNeeded(prog.level);
  const pct = Math.max(0,Math.min(100,Math.round((prog.xp/nextNeed)*100)));
  const lvl = levelFromXp(state.xp||0).level;
  const sockets = arena.sockets||[];
  // Socket cap progression: start at 2, +1 every 5 levels, hard cap at 6
  const socketCount = Math.min(6, 2 + Math.floor(lvl/5));
  const nextSocketLvl = socketCount < 6 ? (Math.floor(lvl/5)+1)*5 : null;
  const inv = state.inventory||{}; const equip = inv.equipment||{};
  const socketableAugs = Object.keys(equip).filter(id=>LOOT_TABLE[id]?.effect?.augment&&!(sockets.includes(id))&&(equip[id]?.quantity||0)>0);

  return (
    <div>
      <h2>🛠️ Armory</h2>
      <div className="muted" style={{marginBottom:14}}>Weapon Mastery + Socket Augments for permanent bonuses.</div>
      <div className="card socket-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div className="tiny" style={{color:'var(--accent)',fontWeight:700,letterSpacing:'.06em'}}>⚙️ WEAPON SOCKETS · {sockets.filter(Boolean).length}/{socketCount}</div>
          {nextSocketLvl ? <span className="tiny muted">Next slot at Lv.{nextSocketLvl}</span> : <span className="chip ok">Max sockets</span>}
        </div>
        <div className="socket-row">
          {Array.from({length:socketCount},(_,i)=>{
            const augId=sockets[i];
            const aug=augId?LOOT_TABLE[augId]:null;
            return (
              <div key={i} className={'socket-slot tier-'+(aug?.tier||'empty')+(aug?' filled':'')}>
                {aug ? (
                  <>
                    <div className="socket-icon">{aug.icon}</div>
                    <div className="socket-name">{aug.name}</div>
                    <div className="socket-desc tiny">{aug.desc}</div>
                    <button className="btn ghost sm socket-remove" onClick={()=>{const ns=[...sockets];ns.splice(i,1);setState({...state,arena:{...arena,sockets:ns}});}}>✕ Remove</button>
                  </>
                ) : (
                  <div className="socket-empty">
                    <div style={{fontSize:22,opacity:0.3}}>＋</div>
                    <div className="tiny muted">Empty Slot</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {sockets.filter(Boolean).length<socketCount && socketableAugs.length>0 && (
          <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--line)'}}>
            <div className="tiny muted" style={{marginBottom:6}}>Available augments — click to socket:</div>
            <div className="row" style={{gap:6,flexWrap:'wrap'}}>
              {socketableAugs.map(id=>{
                const aug=LOOT_TABLE[id];
                return (
                  <button key={id} className={'btn sm aug-pick tier-'+aug?.tier} onClick={()=>{const ns=[...sockets,id];setState({...state,arena:{...arena,sockets:ns}});}} title={aug?.desc}>
                    <span style={{fontSize:14,marginRight:4}}>{aug?.icon}</span>{aug?.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {sockets.filter(Boolean).length===0 && socketableAugs.length===0 && (
          <div className="tiny muted" style={{marginTop:6}}>No augments yet. Win fights to drop them.</div>
        )}
      </div>
      <div className="card dynamic-card armory-shell">
        <div className="armory-grid">
          <div className="armory-list">{WEAPONS.map(w=>{const wp=getWeaponProgress(arena,w.id);const need=weaponXpNeeded(wp.level);const fill=Math.max(0,Math.min(100,Math.round((wp.xp/need)*100)));const isEq=equipped===w.id;const isSel=selected===w.id;return(<button key={w.id} className={'armory-item'+(isSel?' selected':'')+(isEq?' equipped':'')} onClick={()=>setSelected(w.id)}><div className="row" style={{justifyContent:'space-between',alignItems:'center'}}><div><span style={{fontSize:18,marginRight:6}}>{w.icon}</span><b>{w.name}</b></div><span className="armory-mono">Lv {wp.level}</span></div><div className="tiny" style={{marginTop:4}}>{w.kind}</div><div className="armory-wxp"><div className="armory-wxp-fill" style={{width:fill+'%'}}/></div><div className="armory-mono tiny">WXP {wp.xp}/{need}</div></button>);})}</div>
          <div className="armory-detail">
            <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}><h3 style={{marginBottom:0}}>{active.icon} {active.name}</h3>{equipped===active.id?<span className="chip ok">✓ Equipped</span>:<button className="btn sm" onClick={()=>onPick(active.id)}>Equip</button>}</div>
            <div className="muted" style={{margin:'6px 0 10px'}}>{active.desc}</div>
            <div className="weapon-stats"><span className={'stat-pill '+(active.atk>0?'pos':active.atk<0?'neg':'')}>ATK {active.atk>=0?'+':''}{active.atk}</span><span className={'stat-pill '+(active.def>0?'pos':active.def<0?'neg':'')}>DEF {active.def>=0?'+':''}{active.def}</span><span className={'stat-pill '+(active.xpMul>1?'pos':'')}>XP ×{active.xpMul.toFixed(1)}</span><span className="stat-pill">W-LVL {prog.level}</span></div>
            <div className="armory-wxp" style={{marginTop:10}}><div className="armory-wxp-fill" style={{width:pct+'%'}}/></div>
            <div className="armory-mono tiny">WXP {prog.xp}/{nextNeed} to next level</div>
            <div className="armory-ability-grid">{weaponAbilityIds(active).map(id=>{const a=ABILITIES[id];if(!a)return null;const req=a.reqWeaponLvl||1;const unlocked=prog.level>=req;return(<div key={id} className={'armory-ab '+(unlocked?'unlocked':'locked')}><div className="row" style={{justifyContent:'space-between'}}><div><span style={{marginRight:6}}>{a.icon}</span><b>{a.name}</b></div><span className="armory-mono tiny">Lv {req}</span></div><div className="tiny">{getAbilityDesc(a,prog.level)}</div></div>);})}</div>
            <div className="tiny" style={{marginTop:8,fontStyle:'italic',color:'var(--muted)'}}>"{active.flavor}"</div>
          </div>
        </div>
      </div>
      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- SKILL TREE ---------- */
function SkillTreeView({ arena, state, setState, onBack }){
  const sp = availableSP(state, arena);
  const owned = arena.unlockedSkills||[];
  const allAbs = TREE_ABILITIES;
  const unlock = a=>{if(owned.includes(a.id))return;if(sp<a.cost)return;setState({...state,arena:{...arena,unlockedSkills:[...owned,a.id],spSpent:(arena.spSpent||0)+a.cost}});};

  return (
    <div>
      <h2>🌳 Skill Tree</h2>
      <div className="muted" style={{marginBottom:14}}>Earn 1 SP per 50 XP. Unlock abilities, then equip them in your Hotbar.</div>
      <div className="card sp-bank"><div className="row" style={{justifyContent:'space-between',alignItems:'center'}}><div><div className="tiny">SP AVAILABLE</div><div style={{fontSize:28,fontWeight:700,color:'var(--accent)'}}>{sp}</div></div><div style={{textAlign:'right'}}><div className="tiny">{totalSP(state)} earned · {arena.spSpent||0} spent</div><div className="tiny">{owned.length}/{allAbs.length} unlocked</div></div></div></div>
      <div className="grid2" style={{marginTop:14}}>{allAbs.map(a=>{const isOwned=owned.includes(a.id);const canAfford=sp>=a.cost;return(<div key={a.id} className={'card tree-skill '+(isOwned?'owned':canAfford?'available':'locked')}><div className="row" style={{justifyContent:'space-between'}}><div className="row" style={{gap:8}}><span style={{fontSize:22}}>{a.icon}</span><div><h3 style={{marginBottom:0}}>{a.name}</h3><div className="tiny">{a.kind==='active'?'Active · '+(a.cooldown||0)+'-turn CD':'Passive'}</div></div></div><div style={{textAlign:'right'}}><div className="sp-cost">{a.cost} SP</div>{isOwned?<span className="chip ok" style={{marginTop:4}}>✓ Owned</span>:<button className="btn sm" disabled={!canAfford} onClick={()=>unlock(a)} style={{marginTop:4}}>{canAfford?'Unlock':'Not enough SP'}</button>}</div></div><div className="prose" style={{marginTop:8,fontSize:13}}>{a.desc}</div></div>);})}</div>
      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- HOTBAR EDITOR ---------- */
function HotbarView({ arena, onSave, onBack }){
  const owned = arena.unlockedSkills||[];
  const ownedAbs = owned.map(id=>ABILITIES[id]).filter(Boolean);
  const [slots, setSlots] = useState([...(arena.hotbar||[null,null,null,null])]);
  const setSlot=(i,id)=>{const ns=[...slots];if(id)ns.forEach((v,idx)=>{if(v===id&&idx!==i)ns[idx]=null;});ns[i]=id;setSlots(ns);};
  const firstEmpty=()=>slots.findIndex(s=>!s);

  return (
    <div>
      <h2>🎮 Hotbar</h2>
      <div className="muted" style={{marginBottom:14}}>Pick up to 4 tree abilities. They join your weapon abilities in combat.</div>
      <div className="card"><h3>Tree slots (4)</h3><div className="loadout-row">{[0,1,2,3].map(i=>{const a=slots[i]?ABILITIES[slots[i]]:null;return(<div key={i} className={'loadout-slot'+(a?' filled':'')}>{a?<><div className="loadout-icon">{a.icon}</div><div className="loadout-name">{a.name}</div><div className="tiny" style={{textAlign:'center',padding:'0 6px'}}>{a.desc}</div><button className="btn ghost sm" onClick={()=>setSlot(i,null)}>Remove</button></>:<div className="loadout-empty">Empty slot {i+1}</div>}</div>);})}</div></div>
      <div className="card"><h3>Unlocked tree abilities</h3>{ownedAbs.length===0?<div className="muted">No tree abilities unlocked yet. Visit the Skill Tree to spend SP.</div>:<div className="grid2">{ownedAbs.map(a=>{const equipped=slots.includes(a.id);const empty=firstEmpty();return(<div key={a.id} className={'ability-card'+(equipped?' equipped':'')}><div className="row" style={{justifyContent:'space-between'}}><div><span className="ability-icon">{a.icon}</span><b>{a.name}</b></div><span className="tiny">{a.kind==='active'?'Active':'Passive'}</span></div><div className="muted" style={{margin:'4px 0 8px',fontSize:12}}>{a.desc}</div>{equipped?<button className="btn ghost sm" onClick={()=>setSlot(slots.indexOf(a.id),null)}>Unequip</button>:empty>=0?<button className="btn sm" onClick={()=>setSlot(empty,a.id)}>Equip → slot {empty+1}</button>:<span className="tiny">Hotbar full</span>}</div>);})}</div>}</div>
      <div className="row"><button className="btn ghost" onClick={onBack}>Cancel</button><button className="btn" onClick={()=>onSave(slots)}>Save hotbar</button></div>
    </div>
  );
}

/* ---------- LIBRARIAN (Forbidden Exchange + Augment Smelter + Codex) ---------- */
function LibrarianView({ state, setState, arena, mod, onBack }){
  const inv = state.inventory||{};
  const equip = inv.equipment||{};
  const sockets = arena.sockets||[];
  const discovered = Object.keys(equip).filter(id=>equip[id]?.discovered);
  const collectionPct = Math.round((discovered.length/30)*100);
  const [forgeTarget, setForgeTarget] = useState(null);
  const fragments = inv.fragments||[];
  const chips = (inv.equipment?.overclock_chip?.quantity||0);

  /* Forbidden Exchange: gamble 3 items for 1 random */
  const doForbiddenExchange=()=>{
    const consumables = inv.consumables||[];
    if(consumables.length<3){setFeedback('Need 3 items to exchange!');return;}
    const newCons = [...consumables];
    newCons.splice(0,3);
    setState({...state,inventory:{...inv,consumables:newCons}});
    /* 1% corruption */
    if(Math.random()<0.01){
      setFeedback('💀 DATA CORRUPTION - Everything lost!');
      setState({...state,inventory:{...inv,consumables:[],equipment:{...inv.equipment,overclock_chip:{id:'overclock_chip',quantity:0}}}});
    } else {
      /* 90% epic+, 10% legendary+ */
      const roll = Math.random();
      const tier = roll<0.05?'legendary':roll<0.95?'epic':'rare';
      const cfg = LOOT_TIERS[tier];
      if(cfg?.pool.length){
        const id = cfg.pool[Math.floor(Math.random()*cfg.pool.length)];
        const item = LOOT_TABLE[id];
        if(item){
          const newEquip = {...inv.equipment,[id]:{id,quantity:(inv.equipment?.[id]?.quantity||0)+1,discovered:true}};
          setState({...state,inventory:{...inv,equipment:newEquip}});
          setFeedback('🎉 '+item.icon+' '+item.name+' (Tier: '+tier+')');
        }
      }
    }
  };

  /* Augment Smelter: 5 common/rare → 1 epic 90% chance */
  const doSmelt=()=>{
    const socketable = Object.keys(equip).filter(id=>LOOT_TABLE[id]?.effect?.augment&&(equip[id]?.quantity||0)>0&&!(sockets.includes(id)));
    if(socketable.length<5){setFeedback('Need 5 augments to smelt!');return;}
    let newEquip = {...inv.equipment};
    socketable.slice(0,5).forEach(id=>{if(newEquip[id]?.quantity>1)newEquip[id]={...newEquip[id],quantity:newEquip[id].quantity-1};else delete newEquip[id];});
    setState({...state,inventory:{...inv,equipment:newEquip}});
    if(Math.random()<0.90){
      const pool=['buffer_overflow','logic_leak','chain_reaction','recoil_spring','momentum_battery','auto_save','dark_web_proxy','safe_mode','executioner','data_miner','insight_loop','scholars_eye','scavenger_script'];
      const id=pool[Math.floor(Math.random()*pool.length)];
      const item=LOOT_TABLE[id];
      if(item){
        newEquip={...newEquip,[id]:{id,quantity:(newEquip[id]?.quantity||0)+1,discovered:true}};
        setState({...state,inventory:{...inv,equipment:newEquip}});
        setFeedback('⚒️ '+item.icon+' '+item.name+' forged!');
      }
    } else {
      setFeedback('⚒️ Smelt failed - materials lost!');
    }
  };

  /* Neural Forge: Lore Fragments + Overclock Chips → Legacy weapon */
  const doForge=()=>{
    if(!forgeTarget)return;
    const recipe=FORGE_RECIPES[forgeTarget];
    if(!recipe){setFeedback('No recipe for this weapon!');return;}
    if(fragments.length<recipe.fragments){setFeedback('Need '+recipe.fragments+' Lore Fragments!');return;}
    if(chips<recipe.chips){setFeedback('Need '+recipe.chips+' Overclock Chips!');return;}
    const newFrags=fragments.slice(recipe.fragments);
    const newEquip={...inv.equipment,overclock_chip:{id:'overclock_chip',quantity:Math.max(0,chips-recipe.chips)}};
    setState({...state,inventory:{...inv,fragments:newFrags,equipment:newEquip}});
    setFeedback('🔥 '+recipe.legacyIcon+' '+recipe.legacyName+' forged! Weapon ascended!');
  };

  const [feedback, setFeedback] = useState('');

  return (
    <div>
      <h2>📖 Librarian</h2>
      <div className="muted" style={{marginBottom:14}}>Trade, smelt, and collect augments. Use fragments and chips at the Neural Forge.</div>

      {/* Augment Codex */}
      {(()=>{
        const codexIds = ['silicon_skin','overclock_chip','firewall_dll','anti_virus','grounding_wire','brute_force','safe_mode','executioner','data_miner','insight_loop','scholars_eye','scavenger_script','buffer_overflow','logic_leak','chain_reaction','recoil_spring','momentum_battery','auto_save','dark_web_proxy','black_box','null_pointer','system_admin','capacitor_404','ocular_lens','reinforced_grip','thorned_pommel','infinite_loop','silver_bullet','god_mode','overflowing_chalice'];
        const ownedInCodex = codexIds.filter(id => (equip[id]?.quantity||0) > 0).length;
        const codexPct = Math.round((ownedInCodex/codexIds.length)*100);
        return (
          <div className="card" style={{marginBottom:12}}>
            <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3 style={{marginBottom:0}}>📖 Augment Codex</h3>
              <span className="chip">{ownedInCodex}/{codexIds.length} discovered</span>
            </div>
            <div className="hp-bar" style={{marginBottom:12}}><div className="hp-fill" style={{width:codexPct+'%',background:'linear-gradient(90deg,var(--accent),var(--accent-2))'}}/></div>
            <div className="codex-filters tiny" style={{marginBottom:10,color:'var(--muted)'}}>Click any card to see full effect. Locked entries are still readable.</div>
            <div className="codex-grid">
              {codexIds.map(augId=>{
                const item=LOOT_TABLE[augId];
                if(!item) return null;
                const owned=(equip[augId]?.quantity||0);
                const isOwned=owned>0;
                return (
                  <div key={augId} className={'codex-card tier-'+item.tier+(isOwned?' owned':' locked')}>
                    <div className="codex-head">
                      <span className="codex-icon">{item.icon}</span>
                      <div className="codex-meta">
                        <div className="codex-name">{item.name}</div>
                        <div className="codex-tier-row">
                          <span className={'codex-tier-pill tier-'+item.tier}>{item.tier}</span>
                          {isOwned ? <span className="codex-count">×{owned}</span> : <span className="codex-locked-tag">🔒 locked</span>}
                        </div>
                      </div>
                    </div>
                    <div className="codex-desc">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Bestiary */}
      <BestiarySection state={state} mod={mod}/>

      {/* Forbidden Exchange */}
      <div className="card" style={{marginBottom:12,background:'var(--warn-soft)',border:'1px solid var(--warn)'}}>
        <h3 style={{color:'var(--warn)'}}>🔄 Forbidden Exchange</h3>
        <div className="tiny muted" style={{marginBottom:8}}>Sacrifice 3 items → 90% epic+, 10% legendary. ⚠️ 1% DATA CORRUPTION chance (lose everything)!</div>
        <button className="btn" onClick={doForbiddenExchange}>Exchange 3 Items</button>
      </div>

      {/* Augment Smelter */}
      <div className="card" style={{marginBottom:12,background:'rgba(0,200,255,0.05)',border:'1px solid #0ff'}}>
        <h3 style={{color:'#0ff'}}>⚒️ Augment Smelter</h3>
        <div className="tiny muted" style={{marginBottom:8}}>Feed 5 common/rare augments → 90% chance at epic!</div>
        <button className="btn" style={{background:'#0ff',color:'#000'}} onClick={doSmelt}>Smelt 5 Augments</button>
      </div>

      {/* Neural Forge */}
      <div className="card" style={{marginBottom:12,background:'rgba(255,100,0,0.08)',border:'1px solid #f60'}}>
        <h3 style={{color:'#f60'}}>🔥 Neural Forge</h3>
        <div className="tiny muted" style={{marginBottom:8}}>Use Lore Fragments + Overclock Chips to ascend weapons to Legacy forms!</div>
        <div className="row" style={{gap:4,flexWrap:'wrap',marginBottom:8}}>
          {Object.entries(FORGE_RECIPES).map(([id,recipe])=>(
            <button key={id} className={'btn sm '+(forgeTarget===id?'selected':'')} style={forgeTarget===id?{border:'2px solid #f60'}:{}} onClick={()=>setForgeTarget(id)}>
              {(WEAPONS[id]?.icon || recipe.legacyIcon)} {recipe.legacyName}<br/><span className="tiny">{recipe.fragments}f + {recipe.chips}c</span>
            </button>
          ))}
        </div>
        {forgeTarget&&(<div className="tiny muted" style={{marginBottom:8}}>Fragments: {fragments.length}/{FORGE_RECIPES[forgeTarget]?.fragments} · Chips: {chips}/{FORGE_RECIPES[forgeTarget]?.chips}</div>)}
        <button className="btn" style={{background:'#f60'}} onClick={doForge} disabled={!forgeTarget}>Forge Legacy Weapon</button>
      </div>

      {feedback&&(<div className="card" style={{background:'var(--accent-soft)'}}><b>{feedback}</b></div>)}

      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- PET SANCTUARY ---------- */
function PetSanctuaryView({ state, setState, onBack }){
  const equipped = state.pet || null;
  const choose = (id)=> setState({ ...state, pet: id });
  const release = ()=> setState({ ...state, pet: null });
  const pets = typeof PET_LIST !== 'undefined' ? PET_LIST : Object.values(PET_REGISTRY || {});
  return (
    <div>
      <h2>🐾 Pet Sanctuary</h2>
      <div className="muted" style={{marginBottom:14}}>One companion can join you in combat. Each has a different combat hook. Swap any time.</div>
      {equipped && PET_REGISTRY[equipped] && (
        <div className="card pet-equipped-banner">
          <div className="row" style={{gap:12,alignItems:'center'}}>
            <div className="pet-banner-icon">{PET_REGISTRY[equipped].icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>Currently bonded: {PET_REGISTRY[equipped].name}</div>
              <div className="tiny" style={{color:'var(--text-2)'}}>{PET_REGISTRY[equipped].desc}</div>
            </div>
            <button className="btn ghost sm" onClick={release}>✕ Release</button>
          </div>
        </div>
      )}
      <div className="pet-grid">
        {pets.map(p => {
          const isEq = p.id === equipped;
          const xpData = (state.petXp || {})[p.id] || { xp: 0 };
          const prog = typeof petXpProgress === 'function' ? petXpProgress(xpData.xp) : { level: 1, pct: 0, max: false };
          return (
            <div key={p.id} className={'pet-card tier-'+p.tier+(isEq?' equipped':'')}>
              <div className="pet-card-icon">{p.icon}</div>
              <div className="pet-card-name">{p.name}</div>
              <div className="row" style={{gap:6,justifyContent:'center'}}>
                <span className={'codex-tier-pill tier-'+p.tier}>{p.tier}</span>
                <span className="chip pet-level-chip">Lv {prog.level}{prog.max?' MAX':''}</span>
              </div>
              <div className="pet-card-desc">{p.desc}</div>
              {!prog.max ? (
                <div className="pet-xp-bar"><div className="pet-xp-fill" style={{width:prog.pct+'%'}}/></div>
              ) : (
                <div className="pet-xp-bar"><div className="pet-xp-fill max" style={{width:'100%'}}/></div>
              )}
              <div className="tiny pet-xp-tip">{prog.max ? 'Maxed' : `${prog.intoCurrent} / ${prog.span} XP`}</div>
              <button className={'btn '+(isEq?'ghost':'')+' sm'} disabled={isEq} onClick={()=>choose(p.id)} style={{marginTop:8,width:'100%'}}>
                {isEq ? '✓ Bonded' : 'Bond'}
              </button>
            </div>
          );
        })}
      </div>
      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- LEVEL-UP MODAL ---------- */
function LevelUpModal({ state, setState }){
  const [choices, setChoices] = useState(()=> typeof rollRewardChoices === 'function' ? rollRewardChoices(state) : []);
  const [rerolled, setRerolled] = useState(false);
  const newLevel = levelFromXp(state.xp || 0).level;
  const remaining = state.pendingLevelUps || 0;

  const pick = (choice)=>{
    setState(s => ({
      ...s,
      unlockedRewards: [...(s.unlockedRewards || []), { ...choice, takenAt: Date.now() }],
      pendingLevelUps: Math.max(0, (s.pendingLevelUps || 0) - 1),
    }));
    if (remaining > 1){
      setChoices(typeof rollRewardChoices === 'function' ? rollRewardChoices(state) : []);
      setRerolled(false);
    }
  };

  const reroll = ()=>{
    if ((state.insights || 0) < 1 || rerolled) return;
    setState(s => ({ ...s, insights: Math.max(0, (s.insights || 0) - 1) }));
    setChoices(typeof rollRewardChoices === 'function' ? rollRewardChoices(state) : []);
    setRerolled(true);
  };

  return (
    <div className="levelup-overlay">
      <div className="levelup-modal">
        <div className="levelup-header">
          <div className="levelup-rank">⬆ LEVEL {newLevel}</div>
          <h2>Level Up</h2>
          <div className="muted">Pick one. {remaining > 1 ? `${remaining} level-ups pending.` : 'This is permanent.'}</div>
        </div>
        <div className="levelup-choices">
          {choices.map(c => (
            <button key={c.id} className={'levelup-choice'+(c.tier?(' tier-'+c.tier):'')} onClick={()=>pick(c)}>
              <div className="levelup-choice-icon">{c.icon}</div>
              <div className="levelup-choice-name">{c.name}</div>
              <div className="levelup-choice-desc">{c.desc}</div>
              {c.tier && <span className={'codex-tier-pill tier-'+c.tier}>{c.tier}</span>}
            </button>
          ))}
        </div>
        <div className="row" style={{justifyContent:'space-between',marginTop:16,alignItems:'center'}}>
          <span className="tiny muted">💡 Balance: {state.insights || 0}</span>
          <button className="btn ghost sm" disabled={(state.insights || 0) < 1 || rerolled} onClick={reroll}>
            {rerolled ? 'Already rerolled' : '🎲 Reroll (1 💡)'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- FORGE VIEW ---------- */
function ForgeView({ state, setState, onBack }){
  const [tab, setTab] = useState('shard');
  const [feedback, setFeedback] = useState('');
  const [craftTier, setCraftTier] = useState('rare');
  const inv = state.inventory || {};
  const eq = inv.equipment || {};
  const shards = inv.shards || 0;
  const insights = state.insights || 0;
  const sockets = state.arena?.sockets || [];

  const ownedNonSocketed = Object.keys(eq).filter(id => {
    const item = eq[id];
    if (!item || (item.quantity || 0) <= 0) return false;
    if (sockets.includes(id)) return false;
    return !!LOOT_TABLE[id];
  });

  const doShard = (id)=>{
    if (typeof forgeShardAugment !== 'function') return;
    const next = forgeShardAugment(state, id);
    setState(next);
    const tier = LOOT_TABLE[id]?.tier || 'common';
    setFeedback(`🔹 Sharded ${LOOT_TABLE[id]?.name} for ${FORGE_SHARD_VALUE[tier]||1} shards.`);
  };

  const doCraft = ()=>{
    if (typeof forgeCraftAugment !== 'function') return;
    const r = forgeCraftAugment(state, craftTier);
    if (r.error){ setFeedback('⚠ ' + r.error); return; }
    setState(r.state);
    setFeedback(`✨ Forged ${r.item.icon} ${r.item.name}!`);
  };

  const doUpgrade = (id)=>{
    if (typeof forgeUpgradeAugment !== 'function') return;
    const r = forgeUpgradeAugment(state, id);
    if (r.error){ setFeedback('⚠ ' + r.error); return; }
    setState(r.state);
    setFeedback(`⬆ Upgraded ${LOOT_TABLE[id]?.name} to +${r.state.inventory.equipment[id].upgradeLvl*20}%.`);
  };

  return (
    <div>
      <h2>⚒️ Forge</h2>
      <div className="muted" style={{marginBottom:14}}>Shard duplicate augments for raw materials. Spend shards + insights to craft new gear or upgrade what you have.</div>

      <div className="card forge-balance-card">
        <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div className="row" style={{gap:14}}>
            <div className="forge-stat"><div className="tiny">SHARDS</div><div className="forge-stat-num">🔹 {shards}</div></div>
            <div className="forge-stat"><div className="tiny">INSIGHTS</div><div className="forge-stat-num">💡 {insights}</div></div>
          </div>
          <div className="row" style={{gap:6}}>
            <button className={'btn '+(tab==='shard'?'':'ghost')+' sm'} onClick={()=>setTab('shard')}>Shard</button>
            <button className={'btn '+(tab==='craft'?'':'ghost')+' sm'} onClick={()=>setTab('craft')}>Craft</button>
            <button className={'btn '+(tab==='upgrade'?'':'ghost')+' sm'} onClick={()=>setTab('upgrade')}>Upgrade</button>
          </div>
        </div>
      </div>

      {feedback && <div className="card" style={{background:'var(--accent-soft)',marginBottom:12}}><b>{feedback}</b></div>}

      {tab === 'shard' && (
        <div>
          <div className="tiny muted" style={{marginBottom:8}}>Pick an augment to dismantle. Socketed augments can't be sharded.</div>
          {ownedNonSocketed.length === 0 ? (
            <div className="card" style={{textAlign:'center',padding:20}}><div className="muted">No augments to shard. Win fights to drop them.</div></div>
          ) : (
            <div className="forge-grid">
              {ownedNonSocketed.map(id => {
                const item = LOOT_TABLE[id];
                const owned = eq[id]?.quantity || 0;
                const tier = item.tier;
                const value = FORGE_SHARD_VALUE[tier] || 1;
                return (
                  <div key={id} className={'forge-card tier-'+tier}>
                    <div className="forge-card-head">
                      <span className="forge-card-icon">{item.icon}</span>
                      <div>
                        <div className="forge-card-name">{item.name}</div>
                        <span className={'codex-tier-pill tier-'+tier}>{tier}</span>
                      </div>
                      <span className="chip">×{owned}</span>
                    </div>
                    <div className="forge-card-desc tiny">{item.desc}</div>
                    <button className="btn warn sm" style={{marginTop:8,width:'100%'}} onClick={()=>doShard(id)}>🔹 Shard for {value}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'craft' && (
        <div>
          <div className="tiny muted" style={{marginBottom:8}}>Spend shards + insights to roll a random augment of the chosen tier.</div>
          <div className="row" style={{gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {Object.keys(FORGE_CRAFT_COST).map(tier => (
              <button key={tier} className={'btn '+(craftTier===tier?'':'ghost')+' sm'} onClick={()=>setCraftTier(tier)}>
                <span className={'codex-tier-pill tier-'+tier} style={{marginRight:6}}>{tier}</span>
                {FORGE_CRAFT_COST[tier].shards}🔹 + {FORGE_CRAFT_COST[tier].insights}💡
              </button>
            ))}
          </div>
          <div className="card forge-craft-preview">
            <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div className="tiny muted">Rolling</div>
                <div className="forge-craft-tier"><span className={'codex-tier-pill tier-'+craftTier}>{craftTier}</span></div>
                <div className="tiny" style={{marginTop:6}}>Possible drops: {(LOOT_TIERS[craftTier]?.pool || []).slice(0,5).map(id=>LOOT_TABLE[id]?.icon).join(' ')}</div>
              </div>
              <button className="btn"
                disabled={shards < FORGE_CRAFT_COST[craftTier].shards || insights < FORGE_CRAFT_COST[craftTier].insights}
                onClick={doCraft}>
                ✨ Craft {craftTier}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'upgrade' && (
        <div>
          <div className="tiny muted" style={{marginBottom:8}}>Each upgrade level boosts the augment's effect by +20% (max +60%). Upgraded augments work in or out of sockets.</div>
          {Object.keys(eq).filter(id => (eq[id]?.quantity || 0) > 0 && LOOT_TABLE[id]).length === 0 ? (
            <div className="card" style={{textAlign:'center',padding:20}}><div className="muted">No augments to upgrade.</div></div>
          ) : (
            <div className="forge-grid">
              {Object.keys(eq).filter(id => (eq[id]?.quantity || 0) > 0 && LOOT_TABLE[id]).map(id => {
                const item = LOOT_TABLE[id];
                const lvl = eq[id].upgradeLvl || 0;
                const cost = forgeUpgradeCost(item.tier, lvl);
                const atMax = lvl >= FORGE_UPGRADE_MAX;
                return (
                  <div key={id} className={'forge-card tier-'+item.tier}>
                    <div className="forge-card-head">
                      <span className="forge-card-icon">{item.icon}</span>
                      <div>
                        <div className="forge-card-name">{item.name}</div>
                        <span className={'codex-tier-pill tier-'+item.tier}>{item.tier}</span>
                      </div>
                      <div className="forge-upgrade-pips">
                        {[0,1,2].map(i => <span key={i} className={'upgrade-pip'+(i<lvl?' filled':'')}>◆</span>)}
                      </div>
                    </div>
                    <div className="forge-card-desc tiny">{item.desc}{lvl>0 && ` (currently +${lvl*20}%)`}</div>
                    <button className="btn sm" style={{marginTop:8,width:'100%'}} disabled={atMax || shards < cost} onClick={()=>doUpgrade(id)}>
                      {atMax ? '✓ Maxed' : `⬆ +20% for ${cost}🔹`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- PASSIVES VIEW ---------- */
function PassivesView({ state, setState, arena, onBack }){
  const inv = state.inventory || {};
  const eq = inv.equipment || {};
  const sockets = arena?.sockets || [];
  const unlockedSkills = arena?.unlockedSkills || [];

  const treePassives = unlockedSkills
    .map(id => ABILITIES[id])
    .filter(a => a && a.kind === 'passive');

  const socketAugs = sockets.filter(Boolean).map(id => LOOT_TABLE[id]).filter(Boolean);
  const equippedPet = state.pet ? PET_REGISTRY[state.pet] : null;
  const rewards = state.unlockedRewards || [];
  const prestigePerk = state.prestigePerk && typeof PRESTIGE_PERKS !== 'undefined'
    ? PRESTIGE_PERKS.find(p => p.id === state.prestigePerk)
    : null;

  const Section = ({ title, count, children, empty }) => (
    <div className="card passives-section">
      <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <h3 style={{marginBottom:0}}>{title}</h3>
        <span className="chip">{count}</span>
      </div>
      {count === 0 ? <div className="tiny muted">{empty}</div> : children}
    </div>
  );

  return (
    <div>
      <h2>📜 Active Passives</h2>
      <div className="muted" style={{marginBottom:14}}>Everything currently buffing your fights, no matter the source. Tree passives are auto-active — you don't need them in the hotbar.</div>

      <Section title="🌳 Skill Tree (auto-active)" count={treePassives.length} empty="No tree passives unlocked yet. Spend SP in the Skill Tree.">
        <div className="passives-grid">
          {treePassives.map(a => (
            <div key={a.id} className="passives-row">
              <span className="passives-icon">{a.icon}</span>
              <div style={{flex:1}}>
                <div className="passives-name">{a.name}</div>
                <div className="tiny passives-desc">{a.desc || (typeof a.getDesc === 'function' ? a.getDesc(1) : '')}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="⚙️ Socketed Augments" count={socketAugs.length} empty="No augments socketed. Equip them in the Armory.">
        <div className="passives-grid">
          {socketAugs.map((aug,i) => {
            const upgrade = eq[aug.id]?.upgradeLvl || 0;
            return (
              <div key={i} className={'passives-row tier-'+aug.tier}>
                <span className="passives-icon">{aug.icon}</span>
                <div style={{flex:1}}>
                  <div className="passives-name">{aug.name}{upgrade > 0 && <span className="chip ok" style={{marginLeft:6,fontSize:9}}>+{upgrade*20}%</span>}</div>
                  <div className="tiny passives-desc">{aug.desc}</div>
                </div>
                <span className={'codex-tier-pill tier-'+aug.tier}>{aug.tier}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="🐾 Pet Companion" count={equippedPet ? 1 : 0} empty="No pet bonded. Pick one in the Pet Sanctuary.">
        {equippedPet && (
          <div className={'passives-row tier-'+(equippedPet.tier || 'common')}>
            <span className="passives-icon">{equippedPet.icon}</span>
            <div style={{flex:1}}>
              <div className="passives-name">{equippedPet.name}</div>
              <div className="tiny passives-desc">{equippedPet.desc}</div>
            </div>
            <span className={'codex-tier-pill tier-'+(equippedPet.tier || 'common')}>{equippedPet.tier}</span>
          </div>
        )}
      </Section>

      <Section title="⬆ Level-up Rewards" count={rewards.length} empty="Hit a level-up to earn permanent reward picks.">
        <div className="passives-grid">
          {rewards.map((r,i) => (
            <div key={i} className="passives-row">
              <span className="passives-icon">{r.icon}</span>
              <div style={{flex:1}}>
                <div className="passives-name">{r.name}</div>
                <div className="tiny passives-desc">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {prestigePerk && (
        <Section title="⚡ Prestige Perk" count={1} empty="">
          <div className="passives-row">
            <span className="passives-icon">{prestigePerk.icon}</span>
            <div style={{flex:1}}>
              <div className="passives-name">{prestigePerk.name}</div>
              <div className="tiny passives-desc">{prestigePerk.desc}</div>
            </div>
          </div>
        </Section>
      )}

      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- FORBIDDEN EXCHANGE v2 ---------- */
function ExchangeView({ state, setState, onBack }){
  const [feedback, setFeedback] = useState('');
  const [confirming, setConfirming] = useState(null);
  const offers = typeof EXCHANGE_OFFERS !== 'undefined' ? EXCHANGE_OFFERS : [];

  const doApply = (offerId)=>{
    if (typeof applyExchangeOffer !== 'function') return;
    const r = applyExchangeOffer(state, offerId);
    if (r.error){ setFeedback('⚠ ' + r.error); setConfirming(null); return; }
    setState(r.state);
    if (r.corrupted){
      setFeedback('💀 DATA CORRUPTION — the exchange went wrong. Cost paid, no reward.');
    } else {
      const o = offers.find(x => x.id === offerId);
      setFeedback(`${o?.icon} ${o?.name} sealed — ${o?.reward}`);
    }
    setConfirming(null);
  };

  return (
    <div>
      <h2>🩸 Forbidden Exchange</h2>
      <div className="muted" style={{marginBottom:14}}>Sacrifice something you have for something you need. Each offer carries a <span style={{color:'var(--err)',fontWeight:700}}>1% data corruption chance</span> — cost paid, no reward. The Exchange remembers what you traded.</div>

      {feedback && <div className="card" style={{background:'var(--accent-soft)',marginBottom:12}}><b>{feedback}</b></div>}

      <div className="exchange-grid">
        {offers.map(o => {
          const can = o.canApply(state);
          const isConfirming = confirming === o.id;
          return (
            <div key={o.id} className={'card exchange-card'+(can?'':' disabled')+(isConfirming?' confirming':'')}>
              <div className="exchange-card-head">
                <span className="exchange-icon">{o.icon}</span>
                <h3 style={{marginBottom:0}}>{o.name}</h3>
              </div>
              <div className="exchange-trade">
                <div className="exchange-trade-side cost">
                  <div className="tiny" style={{color:'var(--err)',fontWeight:700,letterSpacing:'.06em'}}>YOU PAY</div>
                  <div>{o.cost}</div>
                </div>
                <div className="exchange-arrow">→</div>
                <div className="exchange-trade-side reward">
                  <div className="tiny" style={{color:'var(--ok)',fontWeight:700,letterSpacing:'.06em'}}>YOU GET</div>
                  <div>{o.reward}</div>
                </div>
              </div>
              {!can && <div className="tiny muted" style={{marginTop:8}}>Not eligible yet.</div>}
              {isConfirming ? (
                <div className="row" style={{gap:6,marginTop:10}}>
                  <button className="btn err sm" style={{flex:1}} onClick={()=>doApply(o.id)}>⚠ Confirm Exchange</button>
                  <button className="btn ghost sm" onClick={()=>setConfirming(null)}>Cancel</button>
                </div>
              ) : (
                <button className="btn warn sm" style={{marginTop:10,width:'100%'}} disabled={!can} onClick={()=>setConfirming(o.id)}>
                  {can ? 'Offer Trade' : '🔒 Locked'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{marginTop:14,padding:'10px 14px'}}>
        <div className="tiny muted">Lifetime exchanges: {state.exchangeHistory?.length || 0}{state.exchangeHistory?.some(e=>e.corrupted) ? ` · Corruptions: ${state.exchangeHistory.filter(e=>e.corrupted).length}` : ''}</div>
      </div>

      <div className="row" style={{marginTop:14}}><button className="btn ghost" onClick={onBack}>Back to Arena</button></div>
    </div>
  );
}

/* ---------- BESTIARY (in Librarian) ---------- */
function BestiarySection({ state, mod }){
  const [expanded, setExpanded] = useState(null);
  const beasts = state.bestiary || {};
  const entries = Object.entries(beasts);
  if (entries.length === 0){
    return (
      <div className="card" style={{marginBottom:12}}>
        <h3>📜 Bestiary</h3>
        <div className="tiny muted">No enemies catalogued yet. Win or lose a fight and they show up here — including which questions you got wrong against them.</div>
      </div>
    );
  }
  // Build a question lookup from current module so we can show prompts for past mistakes
  const allConcepts = (mod?.levels || []).flatMap(l => l.concepts.map(c => ({...c, levelName: l.name})));
  const allQs = allConcepts.flatMap(c => c.questions.map(q => ({...q, conceptName: c.name, levelName: c.levelName})));
  const qById = Object.fromEntries(allQs.map(q => [q.id, q]));

  entries.sort((a,b) => (b[1].encounters||0) - (a[1].encounters||0));

  return (
    <div className="card" style={{marginBottom:12}}>
      <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h3 style={{marginBottom:0}}>📜 Bestiary</h3>
        <span className="chip">{entries.length} catalogued</span>
      </div>
      <div className="tiny muted" style={{marginBottom:10}}>Every enemy you've fought, what they tend to throw at you, and the questions you missed against them. Click to expand.</div>
      <div className="bestiary-grid">
        {entries.map(([k, b]) => {
          const isOpen = expanded === k;
          const winRate = b.encounters ? Math.round((b.defeats / b.encounters) * 100) : 0;
          const topAbilities = Object.entries(b.patterns || {}).sort((a,c) => c[1] - a[1]).slice(0, 4);
          return (
            <div key={k} className={'bestiary-card tier-'+(b.tier||'minion')+(isOpen?' open':'')}>
              <button className="bestiary-card-head" onClick={()=>setExpanded(isOpen ? null : k)}>
                <span className="bestiary-emoji">{b.emoji || '👾'}</span>
                <div style={{flex:1,textAlign:'left'}}>
                  <div className="bestiary-name">{b.name}</div>
                  <div className="bestiary-tier-row">
                    <span className={'codex-tier-pill tier-'+(b.tier||'minion')}>{b.tier || 'minion'}</span>
                    <span className="tiny muted">{b.encounters || 0} seen · {b.defeats || 0} killed · {winRate}% win</span>
                  </div>
                </div>
                <span className="bestiary-toggle">{isOpen?'▾':'▸'}</span>
              </button>
              {isOpen && (
                <div className="bestiary-body">
                  {topAbilities.length > 0 && (
                    <div className="bestiary-section">
                      <div className="tiny" style={{color:'var(--muted)',marginBottom:6,fontWeight:700,letterSpacing:'.06em'}}>FAVOURITE MOVES</div>
                      <div className="row" style={{gap:4,flexWrap:'wrap'}}>
                        {topAbilities.map(([id, count]) => {
                          const ab = (typeof ENEMY_ABILITIES !== 'undefined') ? ENEMY_ABILITIES[id] : null;
                          if (!ab) return <span key={id} className="chip">{id} ×{count}</span>;
                          return <span key={id} className="chip" title={ab.name}>{ab.icon} {ab.name} ×{count}</span>;
                        })}
                      </div>
                    </div>
                  )}
                  {(b.passives && b.passives.length > 0) && (
                    <div className="bestiary-section">
                      <div className="tiny" style={{color:'var(--muted)',marginBottom:6,fontWeight:700,letterSpacing:'.06em'}}>PASSIVES SEEN</div>
                      <div className="row" style={{gap:4,flexWrap:'wrap'}}>
                        {b.passives.map(id => {
                          const p = (typeof ENEMY_PASSIVES !== 'undefined') ? ENEMY_PASSIVES[id] : null;
                          return <span key={id} className="chip" title={p?.desc || ''}>● {p?.name || id}</span>;
                        })}
                      </div>
                    </div>
                  )}
                  {b.mistakes && b.mistakes.length > 0 && (
                    <div className="bestiary-section">
                      <div className="tiny" style={{color:'var(--err)',marginBottom:6,fontWeight:700,letterSpacing:'.06em'}}>YOU GOT WRONG VS {b.name.toUpperCase()}</div>
                      <div className="bestiary-mistakes">
                        {b.mistakes.slice(0,5).map(qid => {
                          const q = qById[qid];
                          if (!q) return <div key={qid} className="bestiary-mistake-row tiny muted">(question from another module: {qid})</div>;
                          return (
                            <div key={qid} className="bestiary-mistake-row">
                              <div className="bestiary-mistake-q">{q.prompt || q.question || '(no prompt)'}</div>
                              <div className="tiny" style={{color:'var(--ok)',marginTop:2}}>Answer: {String(q.answer)}</div>
                              <div className="tiny muted" style={{marginTop:2}}>{q.conceptName} · {q.levelName}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {(b.lastSeen) && <div className="tiny muted" style={{marginTop:6}}>Last seen: {new Date(b.lastSeen).toLocaleString()}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ LOADOUT (Armory · Tree · Hotbar · Pets · Passives) ============ *
 * Tabbed wrapper that consolidates the five loadout-related views into one
 * screen. Each tab renders the existing standalone component unchanged — the
 * only difference is the back button stays inside the tab strip instead of
 * jumping all the way back to the Arena hub.
 */
function LoadoutView({ initialTab, arena, state, setState, mod, onEquipWeapon, onSaveHotbar, onBack }){
  const [tab, setTab] = useState(initialTab || 'armory');
  const sp = availableSP(state, arena);
  const tabs = [
    { id:'armory',   label:'Armory',   icon:'🛠️' },
    { id:'tree',     label:'Tree',     icon:'🌳', badge: sp > 0 ? sp + ' SP' : null },
    { id:'hotbar',   label:'Hotbar',   icon:'🎮' },
    { id:'pets',     label:'Pets',     icon:'🐾' },
    { id:'passives', label:'Passives', icon:'📜' },
  ];
  // Each tab renders its existing view but we swallow the inner Back button by
  // passing onBack=null; the tab strip already provides "Back to Arena".
  const noopBack = ()=>{};
  return (
    <div className="loadout-view">
      <div className="view-tabs">
        <div className="view-tabs-strip">
          {tabs.map(t => (
            <button key={t.id}
              className={'view-tab'+(tab===t.id?' active':'')}
              onClick={()=>setTab(t.id)}>
              <span className="view-tab-icon">{t.icon}</span>
              <span className="view-tab-label">{t.label}</span>
              {t.badge && <span className="view-tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>
        <button className="btn ghost sm view-tabs-back" onClick={onBack}>← Back to Arena</button>
      </div>
      <div className="view-tab-body">
        {tab==='armory'   && <ArmoryView arena={arena} state={state} setState={setState} mod={mod}
          onPick={id=>{ if (onEquipWeapon) onEquipWeapon(id); }} onBack={noopBack}/>}
        {tab==='tree'     && <SkillTreeView arena={arena} state={state} setState={setState} onBack={noopBack}/>}
        {tab==='hotbar'   && <HotbarView arena={arena}
          onSave={hotbar=>{ if (onSaveHotbar) onSaveHotbar(hotbar); }} onBack={noopBack}/>}
        {tab==='pets'     && <PetSanctuaryView state={state} setState={setState} onBack={noopBack}/>}
        {tab==='passives' && <PassivesView state={state} setState={setState} arena={arena} onBack={noopBack}/>}
      </div>
    </div>
  );
}

/* ============ WORKSHOP (Forge · Librarian · Exchange) ============ *
 * Bestiary lives inside Librarian, so the Workshop only needs three tabs.
 */
function WorkshopView({ initialTab, state, setState, arena, mod, onBack }){
  const [tab, setTab] = useState(initialTab || 'forge');
  const shards = state.inventory?.shards || 0;
  const tabs = [
    { id:'forge',     label:'Forge',     icon:'⚒️', badge: shards > 0 ? shards + ' ◆' : null },
    { id:'librarian', label:'Librarian', icon:'📖' },
    { id:'exchange',  label:'Exchange',  icon:'🩸', tone:'warn' },
  ];
  const noopBack = ()=>{};
  return (
    <div className="workshop-view">
      <div className="view-tabs">
        <div className="view-tabs-strip">
          {tabs.map(t => (
            <button key={t.id}
              className={'view-tab'+(tab===t.id?' active':'')+(t.tone==='warn'?' warn':'')}
              onClick={()=>setTab(t.id)}>
              <span className="view-tab-icon">{t.icon}</span>
              <span className="view-tab-label">{t.label}</span>
              {t.badge && <span className="view-tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>
        <button className="btn ghost sm view-tabs-back" onClick={onBack}>← Back to Arena</button>
      </div>
      <div className="view-tab-body">
        {tab==='forge'     && <ForgeView state={state} setState={setState} onBack={noopBack}/>}
        {tab==='librarian' && <LibrarianView state={state} setState={setState} arena={arena} mod={mod} onBack={noopBack}/>}
        {tab==='exchange'  && <ExchangeView state={state} setState={setState} onBack={noopBack}/>}
      </div>
    </div>
  );
}
