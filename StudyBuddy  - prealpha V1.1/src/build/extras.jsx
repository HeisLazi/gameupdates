/* ==========================================================================
 * extras.jsx · Splash screen + Library/PDF + Insights + Prestige constants
 *
 * Splice position: 1st helper after the React destructure in app.jsx.
 * Defines:  PRESTIGE_PERKS, PRESTIGE_RANKS, INSIGHT_CAP_DAILY,
 *           INSIGHT_SECONDS_PER, INSIGHT_MAX_BALANCE, insightsToday,
 *           grantInsight, SplashScreen, LibraryView.
 * Reads:    levelFromXp, dayKey, savePdfBlob, loadPdfBlob, pdfEntryKey
 *           (declared above the splice point in app.jsx).
 *
 * Edit when: tweaking the splash mode picker, the in-Arena Library/PDF
 * tracker, or the insight earn/cap math.
 * ========================================================================== */
/* ============ SPLASH SCREEN + LIBRARY + INSIGHTS ============ */

/* ---------- PRESTIGE DATA ---------- */
const PRESTIGE_PERKS = [
  { id: 'photographic_memory', name: 'Photographic Memory', icon: '🧠',
    desc: 'First 2 questions show correct answer instantly.' },
  { id: 'double_major', name: 'Double Major', icon: '🎓',
    desc: 'Equip two weapons, switch mid-fight (0 momentum).' },
  { id: 'funding_secured', name: 'Funding Secured', icon: '💰',
    desc: 'Librarian trades & Gamble costs -50%.' },
  { id: 'speed_learner', name: 'Speed Learner', icon: '🏃',
    desc: 'All skill tree ability cooldowns -1 turn permanently.' },
];
const PRESTIGE_RANKS = [
  { rank: 1, numeral: 'I',   name: 'Ascended Scholar',   color: '#cd7f32' },
  { rank: 2, numeral: 'II',  name: 'Honors Graduate',    color: '#c0c0c0' },
  { rank: 3, numeral: 'III', name: 'Dean\'s List',        color: '#ffd700' },
  { rank: 4, numeral: 'IV',  name: 'Valedictorian',       color: '#e5e4e2' },
  { rank: 5, numeral: 'V',   name: 'Lifetime Scholar',     color: '#b9f2ff' },
  { rank: 6, numeral: 'VI', name: 'Eternal Learner',     color: '#ff69b4' },
  { rank: 7, numeral: 'VII', name: 'Archmage of Study',  color: '#9d4edd' },
  { rank: 8, numeral: 'VIII',name: 'Supreme Polymath',   color: '#00ff88' },
  { rank: 9, numeral: 'IX', name: 'Cosmic Academic',     color: '#ff4500' },
  { rank: 10, numeral: 'X', name: 'Omniscient',          color: '#ffffff' },
];

/* ---------- INSIGHTS HELPERS ---------- */
const INSIGHT_CAP_DAILY = 3;       // max insights from Library per day
const INSIGHT_SECONDS_PER = 300;   // 5 minutes of reading = 1 insight
const INSIGHT_MAX_BALANCE = 10;    // hard cap on total balance

function insightsToday(state){
  const dk = dayKey();
  const t = state.library || {};
  if (t.dayKey !== dk) return { dayKey:dk, secondsRead:0, insightsEarned:0 };
  return t;
}

function grantInsight(state, n){
  const cur = Math.min(INSIGHT_MAX_BALANCE, (state.insights||0) + n);
  return {...state, insights:cur};
}

/* ---------- SPLASH SCREEN ---------- */
function SplashScreen({ state, setState }){
  const lvl = levelFromXp(state.xp||0).level;
  const hasProgress = (state.xp||0) > 0 || (state.streak?.count||0) > 0;

  const choose = (mode)=>{
    setState({...state, appMode:mode});
  };

  return (
    <div className="splash">
      <div className="splash-bg"/>
      <div className="splash-card">
        <div className="splash-brand">
          <div className="splash-logo">
            <div className="splash-logo-inner"/>
          </div>
          <h1 className="splash-title">StudyBuddy</h1>
          <div className="splash-tagline">Learn deeply. Test honestly. Level up.</div>
        </div>

        {hasProgress && (
          <div className="splash-status">
            <span className="chip accent">Level {lvl}</span>
            <span className="chip">🔥 {state.streak.count} day streak</span>
            <span className="chip">{state.xp||0} XP</span>
            {state.insights>0 && <span className="chip ok">💡 {state.insights} insights</span>}
          </div>
        )}

        <div className="splash-modes">
          <button className="splash-mode normal" onClick={()=>choose('normal')}>
            <div className="splash-mode-icon">📚</div>
            <h3>Study Mode</h3>
            <div className="muted">The classic flow. Topics, study, exam, daily plan, deadlines, stats.</div>
            <div className="splash-mode-tags">
              <span className="chip">Notes-first</span>
              <span className="chip">Spaced rep</span>
              <span className="chip">Exam timer</span>
            </div>
          </button>
          <button className="splash-mode arena" onClick={()=>choose('arena')}>
            <div className="splash-mode-icon">⚔️</div>
            <h3>Arena Mode</h3>
            <div className="muted">Same questions, gamified. Pick a weapon, fight bosses, climb a skill tree.</div>
            <div className="splash-mode-tags">
              <span className="chip accent">Combat</span>
              <span className="chip accent">Loadouts</span>
              <span className="chip accent">Insights</span>
            </div>
          </button>
        </div>

        <div className="splash-foot">
          <div className="tiny">You can switch modes any time from the top bar.</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- LIBRARY ---------- */
function LibraryView({ state, setState, mod }){
  const ALL_MODS = [...BUILTIN, ...((state.customModules)||[])];
  const [activeModuleId, setActiveModuleId] = useState(mod.id);
  const [activeConceptId, setActiveConceptId] = useState(null);
  const [tick, setTick] = useState(0); // forces re-render every second
  const [pdfs, setPdfs] = useState(state.libraryPdfs || []);
  const [pdfViewing, setPdfViewing] = useState(null);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [pdfBlobUrls, setPdfBlobUrls] = useState({});
  const [showAllPdfs, setShowAllPdfs] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState(state.prestigePerk || null);
  const [prestigeConfirm, setPrestigeConfirm] = useState(false);
  
  const intRef = useRef(null);
  const visRef = useRef(true);
  const pdfUrlsRef = useRef({});

  const pdfKey = (p)=>pdfEntryKey(p);
  const pdfSrc = (p)=>{
    const key = pdfKey(p);
    return (key && (pdfBlobUrls[key] || pdfUrlsRef.current[key])) || p?.dataUrl || '';
  };
  const isPdfFile = (file)=>!!file && (((file.type || '').toLowerCase().includes('pdf')) || /\.pdf$/i.test(file.name || ''));
  const makePdfEntry = (file, moduleId)=>({
    id:'pdf_'+Date.now()+'_'+Math.random().toString(36).slice(2),
    name:file.name,
    moduleId,
    addedAt:Date.now(),
    size:file.size || 0,
    type:file.type || 'application/pdf',
  });
  const registerPdfFiles = (files, moduleId)=>{
    const entries = [];
    const urls = {};
    Array.from(files || []).filter(isPdfFile).forEach(file=>{
      const entry = makePdfEntry(file, moduleId);
      const url = URL.createObjectURL(file);
      entries.push(entry);
      urls[entry.id] = url;
      savePdfBlob(entry.id, file, entry).catch(()=>{});
    });
    if (Object.keys(urls).length){
      pdfUrlsRef.current = {...pdfUrlsRef.current, ...urls};
      setPdfBlobUrls(prev=>({...prev, ...urls}));
    }
    return entries;
  };

  // Track focus / visibility
  useEffect(()=>{
    const onVis = ()=>{ visRef.current = document.visibilityState === 'visible' && document.hasFocus(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    window.addEventListener('blur', onVis);
    onVis();
    return ()=>{
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onVis);
      window.removeEventListener('blur', onVis);
    };
  },[]);

  useEffect(()=>{
    setPdfs(state.libraryPdfs || []);
  }, [state.libraryPdfs]);

  useEffect(()=>{
    return ()=>{
      Object.values(pdfUrlsRef.current || {}).forEach(url=>URL.revokeObjectURL(url));
      pdfUrlsRef.current = {};
    };
  }, []);

  useEffect(()=>{
    let cancelled = false;
    (pdfs || []).forEach(p=>{
      const key = pdfKey(p);
      if (!key || pdfUrlsRef.current[key] || p?.dataUrl) return;
      loadPdfBlob(key).then(blob=>{
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        pdfUrlsRef.current = {...pdfUrlsRef.current, [key]:url};
        setPdfBlobUrls(prev=>({...prev, [key]:url}));
      }).catch(()=>{});
    });
    return ()=>{ cancelled = true; };
  }, [pdfs]);

  useEffect(()=>{
    const migrated = [];
    const urlUpdates = {};
    (pdfs || []).forEach(p=>{
      const key = pdfKey(p);
      if (!key || !p?.dataUrl || pdfUrlsRef.current[key]) return;
      try {
        const blob = dataUrlToBlob(p.dataUrl);
        const url = URL.createObjectURL(blob);
        urlUpdates[key] = url;
        migrated.push(key);
        savePdfBlob(key, blob, {...p, size:blob.size, type:blob.type}).catch(()=>{});
      } catch(e){}
    });
    if (!migrated.length) return;
    pdfUrlsRef.current = {...pdfUrlsRef.current, ...urlUpdates};
    setPdfBlobUrls(prev=>({...prev, ...urlUpdates}));
    const next = (pdfs || []).map(p => migrated.includes(pdfKey(p)) ? serializeLibraryPdf(p) : p);
    setPdfs(next);
    setState(prev=>({...prev, libraryPdfs:serializeLibraryPdfs(next)}));
  }, [pdfs]);

  useEffect(()=>{
    if (!pdfViewing && pdfFullscreen) setPdfFullscreen(false);
  }, [pdfViewing, pdfFullscreen]);

  const exitPdfFullscreen = ()=>{ setPdfFullscreen(false); };
  useEffect(()=>{
    const onKey = (e)=>{ if (e.key === 'Escape' && pdfFullscreen) exitPdfFullscreen(); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [pdfFullscreen]);

  // Time tracker — only ticks when concept is open AND tab is focused
  useEffect(()=>{
    intRef.current = setInterval(()=>{
      if (!activeConceptId && !pdfViewing) return;
      if (!visRef.current) return;
      setTick(t=>t+1);
      // increment seconds + grant insight using the latest state snapshot
      setState(prev=>{
        const today = insightsToday(prev);
        // Always tick lifetime reading ms (no daily cap on this stat)
        const lifetimeMs = (prev.stats?.totalReadingMs || 0) + 1000;
        const baseStats = { ...(prev.stats || {}), totalReadingMs: lifetimeMs };
        if (today.insightsEarned >= INSIGHT_CAP_DAILY) return { ...prev, stats: baseStats };
        const newSeconds = today.secondsRead + 1;
        let newEarned = today.insightsEarned;
        let newSinceLast = newSeconds - (today.insightsEarned * INSIGHT_SECONDS_PER);
        let nextState = {...prev, stats: baseStats, library:{dayKey:today.dayKey, secondsRead:newSeconds, insightsEarned:today.insightsEarned}};
        if (newSinceLast >= INSIGHT_SECONDS_PER && newEarned < INSIGHT_CAP_DAILY){
          newEarned += 1;
          nextState = grantInsight({...nextState, library:{...nextState.library, insightsEarned:newEarned}}, 1);
        }
        return nextState;
      });
    }, 1000);
    return ()=> clearInterval(intRef.current);
  // eslint-disable-next-line
  },[activeConceptId, pdfViewing]);
  
  // Check if player can prestige (all modules mastered, max level)
  const canPrestige = (() => {
    const lvl = levelFromXp(state.xp || 0);
    if (lvl.level < 20) return false;
    const arena = state.arena || {};
    const weapons = arena.weapons || {};
    const allMaxed = Object.values(weapons).every(w => w.level >= 10);
    return allMaxed && lvl.level >= 20;
  })();
  
  // Perform prestige
  const doPrestige = () => {
    if (!selectedPerk) return;
    const nextRank = (state.prestigeRank || 0) + 1;
    const newArena = defaultArenaState();
    setState(prev => ({
      ...prev,
      xp: 0,
      prestigeRank: nextRank,
      prestigePerk: selectedPerk,
      arena: newArena,
    }));
    setShowPrestigeModal(false);
    setPrestigeConfirm(false);
    setSelectedPerk(null);
  };
  
  const today = insightsToday(state);
  const fmt = (s)=>{
    const m = Math.floor(s/60), ss = s%60;
    return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0');
  };
  const nextInsightIn = today.insightsEarned >= INSIGHT_CAP_DAILY
    ? 'Daily cap reached'
    : fmt(INSIGHT_SECONDS_PER - (today.secondsRead - today.insightsEarned*INSIGHT_SECONDS_PER));

  const activeModule = ALL_MODS.find(m=>m.id===activeModuleId) || mod;
  const activeConcept = activeConceptId
    ? activeModule.levels.flatMap(l=>l.concepts).find(c=>c.id===activeConceptId)
    : null;

  // PDF upload — tagged with current module
  const handlePdf = (e)=>{
    const files = e.target.files;
    if (!files || files.length===0) return;
    const tagModule = activeModuleId;
    const entries = registerPdfFiles(files, tagModule);
    if (entries.length){
      const next = [...pdfs, ...entries];
      setPdfs(next);
      setState(prev=>({...prev, libraryPdfs:serializeLibraryPdfs(next)}));
      if (entries.length===1) setPdfViewing(entries[0]);
    }
    e.target.value = '';
  };

  // Folder import: PDFs are auto-assigned to the currently selected module.
  const importFolder = async ()=>{
    if (!window.showDirectoryPicker){
      alert('Folder import needs a recent Chrome/Edge browser.');
      return;
    }
    try {
      const dir = await window.showDirectoryPicker();
      const found = [];
      const walk = async (directory)=>{
        for await (const entry of directory.values()){
          if (entry.kind==='directory'){
            await walk(entry);
          } else if (entry.kind==='file' && /\.pdf$/i.test(entry.name)){
            const file = await entry.getFile();
            found.push(file);
          }
        }
      };
      await walk(dir);
      if (!found.length){ alert('No PDFs found.'); return; }
      const entries = registerPdfFiles(found, activeModuleId);
      const next = [...pdfs, ...entries];
      setPdfs(next);
      setState(prev=>({...prev, libraryPdfs:serializeLibraryPdfs(next)}));
      alert('Imported '+entries.length+' PDF(s) into '+activeModuleId+'.');
    } catch(err){ /* user cancelled */ }
  };

  const removePdf = (entry)=>{
    const key = pdfKey(entry);
    if (key && pdfUrlsRef.current[key]){
      URL.revokeObjectURL(pdfUrlsRef.current[key]);
      const nextUrls = {...pdfUrlsRef.current};
      delete nextUrls[key];
      pdfUrlsRef.current = nextUrls;
      setPdfBlobUrls(nextUrls);
    }
    if (key) deletePdfBlob(key).catch(()=>{});
    const next = pdfs.filter(p=>pdfKey(p)!==key);
    setPdfs(next);
    setState(prev=>({...prev, libraryPdfs:serializeLibraryPdfs(next)}));
    if (pdfKey(pdfViewing)===key) {
      setPdfViewing(null);
      setPdfFullscreen(false);
    }
  };

  const setPdfModule = (entry, moduleId)=>{
    const key = pdfKey(entry);
    const next = pdfs.map(p=> pdfKey(p)===key ? {...p, moduleId} : p);
    setPdfs(next);
    setState(prev=>({...prev, libraryPdfs:serializeLibraryPdfs(next)}));
    if (pdfKey(pdfViewing)===key) setPdfViewing(prev=>prev ? {...prev, moduleId} : prev);
  };

  const renderPdfViewer = (fullscreen=false)=>{
    if (!pdfViewing) return null;
    const src = pdfSrc(pdfViewing);
    return (
      <>
        <div className="row library-pdf-toolbar" style={{justifyContent:'space-between',marginBottom:8,gap:8}}>
          <h3>📄 {pdfViewing.name}</h3>
          <div className="row" style={{gap:6}}>
            {fullscreen && <button className="btn ghost sm" onClick={exitPdfFullscreen}>✕ Close</button>}
            <button className="btn ghost sm" onClick={()=>setPdfFullscreen(v=>!v)}>
              {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
            <button className="btn ghost sm" onClick={()=>{setPdfViewing(null);setPdfFullscreen(false);}}>Close PDF</button>
            <button className="btn ghost sm" onClick={()=>removePdf(pdfViewing)}>Delete</button>
          </div>
        </div>
        {src ? (
          <iframe src={src} className={'library-pdf'+(fullscreen?' fullscreen':'')} title={pdfViewing.name}/>
        ) : (
          <div className={'library-empty pdf-missing'+(fullscreen?' fullscreen':'')}>
            <div style={{fontSize:34,opacity:0.35,marginBottom:10}}>📄</div>
            <h3>PDF file data is not loaded</h3>
            <div className="muted">Re-upload this PDF to view it again. New large PDFs are stored outside the save file so the game does not hit browser storage limits.</div>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <h2>📚 Library</h2>
      <div className="muted" style={{marginBottom:12}}>
        Read concept notes or your uploaded PDFs. Stay focused for 5 minutes to earn an insight (max {INSIGHT_CAP_DAILY}/day, {INSIGHT_MAX_BALANCE} total balance). Time only counts when this tab is in focus.
      </div>

      {/* Insight tracker */}
      <div className="card library-tracker">
        <div className="row" style={{justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <div className="row" style={{gap:14}}>
            <div>
              <div className="tiny">READING TIME TODAY</div>
              <div style={{font:'600 22px/1 "JetBrains Mono", monospace',color:'var(--text)'}}>{fmt(today.secondsRead)}</div>
            </div>
            <div>
              <div className="tiny">NEXT INSIGHT IN</div>
              <div style={{font:'600 16px/1 "JetBrains Mono", monospace',color:'var(--accent)'}}>{nextInsightIn}</div>
            </div>
            <div>
              <div className="tiny">TODAY</div>
              <div style={{font:'600 16px/1 "JetBrains Mono", monospace',color:'var(--text)'}}>{today.insightsEarned} / {INSIGHT_CAP_DAILY}</div>
            </div>
            <div>
              <div className="tiny">BALANCE</div>
              <div style={{font:'600 16px/1 "JetBrains Mono", monospace',color:'var(--ok)'}}>💡 {state.insights||0} / {INSIGHT_MAX_BALANCE}</div>
            </div>
          </div>
          {(activeConcept || pdfViewing) ? (
            <span className="chip ok">⏱ counting…</span>
          ) : (
            <span className="chip warn">Open a concept or PDF to start counting</span>
          )}
        </div>
      </div>
      
      {/* PRESTIGE TERMINAL */}
      <div className="card" style={{marginTop:12,background:'#1a1a2a',border:'2px solid var(--warn)'}}>
        <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h3 style={{color:'var(--warn)',margin:0}}>⚡ Ascended Scholar Terminal</h3>
          <span className="chip" style={{background:'var(--panel2)',fontSize:11}}>Rank {state.prestigeRank || 0}</span>
        </div>
        
        {state.prestigeRank > 0 ? (
          <div>
            <div className="row" style={{gap:12,marginBottom:8}}>
              <div className="card" style={{flex:1,textAlign:'center',padding:8}}>
                <div style={{fontSize:24,color:PRESTIGE_RANKS.find(r=>r.rank===state.prestigeRank)?.color || '#fff'}}>{PRESTIGE_RANKS.find(r=>r.rank===state.prestigeRank)?.numeral || '0'}</div>
                <div className="tiny">Prestige Rank</div>
              </div>
              <div className="card" style={{flex:1,textAlign:'center',padding:8}}>
                <div style={{fontSize:20}}>{state.prestigePerk ? PRESTIGE_PERKS.find(p=>p.id===state.prestigePerk)?.icon : '❌'}</div>
                <div className="tiny">{state.prestigePerk ? PRESTIGE_PERKS.find(p=>p.id===state.prestigePerk)?.name : 'No perk selected'}</div>
              </div>
              <div className="card" style={{flex:1,textAlign:'center',padding:8}}>
                <div style={{fontSize:20}}>+{(state.prestigeRank || 0) * 20}%</div>
                <div className="tiny">XP & Lore Bonus</div>
              </div>
            </div>
            
            {/* Hall of Fame */}
            <div style={{marginTop:8,padding:8,background:'var(--panel)',borderRadius:6}}>
              <div className="tiny muted" style={{marginBottom:4}}>🏆 Hall of Fame (Rank {state.prestigeRank} records):</div>
              {Object.keys(state.prestigeTimes || {}).length === 0 ? (
                <div className="tiny muted">No records yet. Complete raids to set times!</div>
              ) : (
                Object.entries(state.prestigeTimes).map(([key, time], i) => (
                  <div key={i} className="row" style={{justifyContent:'space-between',fontSize:11}}>
                    <span>{key}</span>
                    <span style={{color:'var(--accent)'}}>{Math.floor(time/60)}m {time%60}s</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="tiny muted" style={{marginBottom:8}}>
              Unlock new prestige rewards when you master all modules and reach the maximum level.
            </div>
            <div className="row" style={{gap:6,flexWrap:'wrap',marginBottom:8}}>
              {PRESTIGE_PERKS.map(p => (
                <div key={p.id} className="card" style={{padding:6,flex:'1 1 45%',border:'1px solid var(--line)',opacity:0.7}}>
                  <div style={{fontSize:18}}>{p.icon}</div>
                  <div className="tiny" style={{fontWeight:600}}>{p.name}</div>
                  <div className="tiny muted">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {canPrestige && (
          <div className="card" style={{marginTop:8,background:'rgba(255,200,0,0.08)',border:'1px solid var(--warn)',textAlign:'center'}}>
            <div className="tiny" style={{marginBottom:6}}>You are ready to ascend to the next rank!</div>
            <button className="btn" style={{background:'var(--warn)',color:'#000',fontWeight:700}} onClick={()=>setShowPrestigeModal(true)}>
              ⚡ PRESTIGE — RANK {(state.prestigeRank||0)+1}
            </button>
          </div>
        )}
      </div>
      
      {showPrestigeModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={(e)=>{ if(e.target===e.currentTarget)setShowPrestigeModal(false); }}>
          <div className="card" style={{maxWidth:500,width:'90%',background:'#1a1a2a',border:'2px solid var(--warn)'}}>
            <div className="row" style={{justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h3 style={{color:'var(--warn)',margin:0}}>⚡ Ascend to Rank {(state.prestigeRank||0)+1}</h3>
              <button className="btn ghost sm" onClick={()=>setShowPrestigeModal(false)}>×</button>
            </div>
            <div style={{marginBottom:12,padding:8,background:'rgba(255,100,0,0.1)',borderRadius:6,border:'1px solid rgba(255,100,0,0.3)'}}>
              <div className="tiny warn" style={{fontWeight:700,marginBottom:4}}>⚠️ ASCENSION COSTS:</div>
              <div className="tiny" style={{marginBottom:2}}>• Level resets to 1 (all XP lost)</div>
              <div className="tiny" style={{marginBottom:2}}>• All weapons reset to Level 1</div>
              <div className="tiny" style={{marginBottom:2}}>• Skill Tree wiped (SP refunded)</div>
              <div className="tiny">• Insights & progress retained</div>
            </div>
            <div className="tiny" style={{marginBottom:8}}>Choose your Prestige Perk:</div>
            <div className="grid auto" style={{marginBottom:12}}>
              {PRESTIGE_PERKS.map(p => (
                <div key={p.id} onClick={()=>setSelectedPerk(p.id)}
                  className="card" style={{padding:8,cursor:'pointer',border:'2px solid',borderColor:selectedPerk===p.id?'var(--warn)':'var(--line)',background:selectedPerk===p.id?'rgba(255,200,0,0.1)':'transparent',textAlign:'center'}}>
                  <div style={{fontSize:28,marginBottom:4}}>{p.icon}</div>
                  <div className="tiny" style={{fontWeight:700}}>{p.name}</div>
                  <div className="tiny muted">{p.desc}</div>
                </div>
              ))}
            </div>
            <div className="row" style={{gap:8,justifyContent:'center'}}>
              {prestigeConfirm ? (
                <>
                  <button className="btn" style={{background:'var(--warn)',color:'#000'}} onClick={doPrestige} disabled={!selectedPerk}>⚡ CONFIRM ASCENSION</button>
                  <button className="btn ghost" onClick={()=>setPrestigeConfirm(false)}>Cancel</button>
                </>
              ) : (
                <button className="btn" style={{background:'var(--warn)',color:'#000'}} onClick={()=>setPrestigeConfirm(true)} disabled={!selectedPerk}>Choose Perk & Ascend</button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="library-layout">
        {/* Left rail — module + concept browser */}
        <div className="card library-rail">
          <h3>Modules</h3>
          <div style={{maxHeight:'280px',overflow:'auto',marginBottom:12}}>
            {ALL_MODS.map(m=>(
              <button key={m.id}
                className={'library-mod-btn'+(activeModuleId===m.id?' active':'')}
                onClick={()=>{ setActiveModuleId(m.id); setActiveConceptId(null); setPdfViewing(null); }}>
                <span>{m.id}</span>
                <span className="tiny">{m.levels.reduce((a,l)=>a+l.concepts.length,0)} concepts</span>
              </button>
            ))}
          </div>
          <h3>{activeModule.id} concepts</h3>
          <div style={{maxHeight:'380px',overflow:'auto'}}>
            {activeModule.levels.map(lv=>(
              <React.Fragment key={lv.id}>
                <div className="library-lvl">{lv.name}</div>
                {lv.concepts.map(c=>(
                  <button key={c.id}
                    className={'library-concept-btn'+(activeConceptId===c.id?' active':'')}
                    onClick={()=>{ setActiveConceptId(c.id); setPdfViewing(null); }}>
                    {c.name}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Center — content reader */}
        <div className="card library-content">
          {pdfViewing ? (
            pdfFullscreen ? (
              <div className="library-empty">
                <div style={{fontSize:34,opacity:0.35,marginBottom:10}}>📄</div>
                <h3>{pdfViewing.name}</h3>
                <div className="muted">PDF is open fullscreen.</div>
              </div>
            ) : renderPdfViewer(false)
          ) : activeConcept ? (
            <>
              <div className="row" style={{justifyContent:'space-between',marginBottom:8}}>
                <div>
                  <div className="tiny">{activeModule.id}</div>
                  <h3 style={{marginBottom:0}}>{activeConcept.name}</h3>
                </div>
                <button className="btn ghost sm" onClick={()=>setActiveConceptId(null)}>Close</button>
              </div>
              {activeConcept.summary && <div className="prose" style={{fontStyle:'italic',color:'var(--muted)',marginBottom:10}}>{activeConcept.summary}</div>}
              {activeConcept.notes
                ? renderNotes(activeConcept.notes)
                : <div className="muted">No notes for this concept yet.</div>}
            </>
          ) : (
            <div className="library-empty">
              <div style={{fontSize:42,opacity:0.25,marginBottom:10}}>📖</div>
              <h3>Pick a concept or open a PDF</h3>
              <div className="muted">Time only counts while you have something open.</div>
            </div>
          )}
        </div>

        {pdfFullscreen && pdfViewing && (
          <div className="pdf-fullscreen-shell" onClick={(e)=>{ if(e.target===e.currentTarget) exitPdfFullscreen(); }}>
            <div className="pdf-fullscreen-inner">
              {renderPdfViewer(true)}
            </div>
          </div>
        )}

        {/* Right rail — PDFs */}
        <div className="card library-pdfs">
          <h3>PDFs · {activeModule.id}</h3>
          <div className="muted" style={{fontSize:12,marginBottom:8}}>
            Uploads get tagged with the module currently open here. Switch the module on the left to see its PDFs.
          </div>
          <div className="row" style={{gap:6,marginBottom:6,flexWrap:'wrap'}}>
            <label className="btn sm" style={{cursor:'pointer'}}>
              📄 Upload
              <input type="file" accept="application/pdf,.pdf" multiple onChange={handlePdf} style={{display:'none'}}/>
            </label>
            <button className="btn ghost sm" onClick={importFolder} title="Pick a folder; all imported PDFs will be assigned to the module currently selected on the left">📂 Import folder</button>
            <label className="row" style={{gap:4,marginLeft:'auto'}}>
              <input type="checkbox" checked={showAllPdfs} onChange={e=>setShowAllPdfs(e.target.checked)} style={{width:'auto'}}/>
              <span className="tiny">All modules</span>
            </label>
          </div>
          <div style={{marginTop:8,maxHeight:'420px',overflow:'auto'}}>
            {(()=>{
              const filtered = showAllPdfs ? pdfs : pdfs.filter(p => p.moduleId===activeModuleId);
              if (filtered.length===0) {
                return <div className="tiny" style={{padding:'8px 0'}}>
                  {pdfs.length===0 ? 'No PDFs yet — upload some above.' : 'No PDFs tagged for '+activeModule.id+'. Toggle "All modules" to see others.'}
                </div>;
              }
              return filtered.map((p,i)=>(
                <div key={pdfKey(p) || i} className={'library-pdf-row'+(pdfKey(pdfViewing)===pdfKey(p)?' active':'')}>
                  <button className="library-pdf-name" onClick={()=>{ setPdfViewing(p); setActiveConceptId(null); }}>📄 {p.name}</button>
                  <select className="pdf-mod-select" value={p.moduleId||''} onChange={e=>setPdfModule(p, e.target.value||null)} title="Reassign to module">
                    <option value="">(no module)</option>
                    {ALL_MODS.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
                  </select>
                  <button className="btn ghost sm" onClick={()=>removePdf(p)}>×</button>
                </div>
              ));
            })()}
          </div>
          <div className="tiny" style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--line)'}}>
            <b>Tip:</b> <b>Import folder</b> now tags every imported PDF to the module currently selected in the left Modules list.
          </div>
        </div>
      </div>
    </div>
  );
}
