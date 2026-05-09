<script type="text/babel" data-presets="react">
const { useState, useEffect, useMemo, useRef } = React;

/* ============ DATA LOAD ============ */
const BUILTIN = JSON.parse(document.getElementById('modules-data').textContent).modules;
const DEADLINES = JSON.parse(document.getElementById('deadlines-data').textContent);
const GRADES = JSON.parse(document.getElementById('grades-data').textContent);

const STORAGE_KEY = 'studybuddy_v3';
const SESSION_KEY = 'studybuddy_v3_session';
const PDF_DB_NAME = 'studybuddy_pdf_store_v1';

function pdfEntryKey(p){
  if (!p) return '';
  if (p.id) return p.id;
  return ('pdf_'+(p.name || 'file')+'_'+(p.addedAt || 0)+'_'+(p.size || 0)).replace(/[^a-z0-9_-]+/gi, '_');
}
function serializeLibraryPdf(p){
  if (!p) return null;
  const src = p || {};
  const out = {
    id: pdfEntryKey(src),
    name: src.name || 'PDF',
    moduleId: src.moduleId || null,
    addedAt: src.addedAt || Date.now(),
    size: src.size || 0,
    type: src.type || 'application/pdf',
  };
  if (src.dataUrl && typeof src.dataUrl === 'string' && src.dataUrl.length < 450000){
    out.dataUrl = src.dataUrl;
  }
  return out;
}
function serializeLibraryPdfs(list){
  return (Array.isArray(list) ? list : []).map(serializeLibraryPdf).filter(Boolean);
}
function openPdfDb(){
  return new Promise((resolve, reject)=>{
    if (!window.indexedDB){
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(PDF_DB_NAME, 1);
    req.onupgradeneeded = ()=>{
      const db = req.result;
      if (!db.objectStoreNames.contains('pdfs')) db.createObjectStore('pdfs', { keyPath:'id' });
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error || new Error('PDF store failed to open'));
  });
}
function savePdfBlob(id, blob, meta){
  if (!id || !blob) return Promise.resolve(false);
  return openPdfDb().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction('pdfs', 'readwrite');
    tx.objectStore('pdfs').put({
      id,
      blob,
      name: meta?.name || 'PDF',
      type: meta?.type || blob.type || 'application/pdf',
      size: meta?.size || blob.size || 0,
      updatedAt:Date.now(),
    });
    tx.oncomplete = ()=>{ db.close(); resolve(true); };
    tx.onerror = ()=>{ db.close(); reject(tx.error || new Error('PDF save failed')); };
    tx.onabort = tx.onerror;
  }));
}
function loadPdfBlob(id){
  if (!id) return Promise.resolve(null);
  return openPdfDb().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction('pdfs', 'readonly');
    const req = tx.objectStore('pdfs').get(id);
    req.onsuccess = ()=>resolve(req.result?.blob || null);
    req.onerror = ()=>reject(req.error || new Error('PDF load failed'));
    tx.oncomplete = ()=>db.close();
    tx.onerror = ()=>db.close();
  }));
}
function deletePdfBlob(id){
  if (!id) return Promise.resolve(false);
  return openPdfDb().then(db => new Promise((resolve, reject)=>{
    const tx = db.transaction('pdfs', 'readwrite');
    tx.objectStore('pdfs').delete(id);
    tx.oncomplete = ()=>{ db.close(); resolve(true); };
    tx.onerror = ()=>{ db.close(); reject(tx.error || new Error('PDF delete failed')); };
    tx.onabort = tx.onerror;
  }));
}
function dataUrlToBlob(dataUrl){
  const parts = String(dataUrl || '').split(',');
  const meta = parts[0] || '';
  const b64 = parts[1] || '';
  const type = (meta.match(/data:([^;]+)/) || [])[1] || 'application/pdf';
  const raw = atob(b64);
  const chunks = [];
  for (let i=0; i<raw.length; i+=8192){
    const slice = raw.slice(i, i+8192);
    const bytes = new Uint8Array(slice.length);
    for (let j=0; j<slice.length; j++) bytes[j] = slice.charCodeAt(j);
    chunks.push(bytes);
  }
  return new Blob(chunks, { type });
}
function defaultArenaState(){
  return {
    equipped:'blade',
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
    sockets:['silicon_skin','overclock_chip'], // Starter kit: 2 sockets
    spSpent:0,
    bossesBeaten:{},
    runStats:{wins:0,losses:0},
    mistakePool:[],
    cram: typeof defaultCramState === 'function' ? defaultCramState() : null,
  };
}
function normalizeArena(raw){
  const base = defaultArenaState();
  const old = raw || {};
  const oldEquipped = old.weapon || old.equipped || base.equipped;
  const oldUnlocked = Array.isArray(old.unlockedWeapons) ? old.unlockedWeapons : [];
  const weapons = {...base.weapons};
  if (old.weapons){
    for (const [wid, wdata] of Object.entries(old.weapons)){
      weapons[wid] = {...base.weapons[wid], ...wdata, unlocked:true};
    }
  }
  for (const id of oldUnlocked){
    weapons[id] = {...(weapons[id]||{level:1,xp:0}), unlocked:true};
  }
  if (oldEquipped && !weapons[oldEquipped]){
    weapons[oldEquipped] = {...(weapons[oldEquipped]||{level:1,xp:0}), unlocked:true};
  }
  return {
    ...base,
    ...old,
    equipped: oldEquipped,
    weapons,
    unlockedSkills: Array.isArray(old.unlockedSkills) ? old.unlockedSkills : [],
    hotbar: Array.isArray(old.hotbar) ? [...old.hotbar,null,null,null,null].slice(0,4) : [null,null,null,null],
    sockets: Array.isArray(old.sockets) ? old.sockets : ['silicon_skin','overclock_chip'],
    spSpent: typeof old.spSpent === 'number' ? old.spSpent : 0,
    bossesBeaten: old.bossesBeaten || {},
    runStats: old.runStats || {wins:0,losses:0},
    mistakePool: Array.isArray(old.mistakePool) ? old.mistakePool : [],
    cram: old.cram || base.cram || (typeof defaultCramState === 'function' ? defaultCramState() : null),
  };
}
function loadState(){
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (!r) return defaultState();
    const parsed = JSON.parse(r);
    const base = defaultState();
    const merged = {
      ...base,
      sr: parsed.sr || {},
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      streak: parsed.streak || {last:null,count:0},
      daily: parsed.daily || {},
      seenConcepts: parsed.seenConcepts || {},
      customModules: Array.isArray(parsed.customModules) ? parsed.customModules : [],
      customDeadlines: Array.isArray(parsed.customDeadlines) ? parsed.customDeadlines : [],
      examResults: Array.isArray(parsed.examResults) ? parsed.examResults : [],
      insights: typeof parsed.insights === 'number' ? parsed.insights : 0,
      library: parsed.library || {dayKey:null,secondsRead:0,insightsEarned:0},
      libraryPdfs: Array.isArray(parsed.libraryPdfs) ? parsed.libraryPdfs : [],
      pomodoro: parsed.pomodoro || {},
      currentModuleId: parsed.currentModuleId || base.currentModuleId,
      appMode: parsed.appMode || null,
      inventory: parsed.inventory ? { ...base.inventory, ...parsed.inventory, equipment: { ...(base.inventory.equipment || {}), ...(parsed.inventory.equipment || {}) }, shards: parsed.inventory.shards || 0 } : base.inventory,
      pet: parsed.pet || null,
      prestigeRank: parsed.prestigeRank || 0,
      prestigePerk: parsed.prestigePerk || null,
      prestigeTimes: parsed.prestigeTimes || {},
      unlockedRewards: Array.isArray(parsed.unlockedRewards) ? parsed.unlockedRewards : [],
      pendingLevelUps: typeof parsed.pendingLevelUps === 'number' ? parsed.pendingLevelUps : 0,
      lastSeenLevel: typeof parsed.lastSeenLevel === 'number' ? parsed.lastSeenLevel : (parsed.xp ? levelFromXp(parsed.xp).level : 0),
      stats: { ...base.stats, ...(parsed.stats || {}) },
      petXp: parsed.petXp && typeof parsed.petXp === 'object' ? parsed.petXp : {},
      exchangeHistory: Array.isArray(parsed.exchangeHistory) ? parsed.exchangeHistory : [],
      bestiary: parsed.bestiary && typeof parsed.bestiary === 'object' ? parsed.bestiary : {},
      arena: normalizeArena(parsed.arena),
    };
    return merged;
  }
  catch(e){ return defaultState(); }
}
function saveState(s){
  try{
    // Persist EVERYTHING that's not transient. Fields whitelisted here got dropped
    // before — that's why augments / pets / stats / level-up rewards weren't saving.
    const toSave = {
      sr: s.sr || {},
      xp: s.xp || 0,
      streak: s.streak || {last:null,count:0},
      daily: s.daily || {},
      pomodoro: s.pomodoro || {},
      seenConcepts: s.seenConcepts || {},
      customModules: s.customModules || [],
      customDeadlines: s.customDeadlines || [],
      examResults: s.examResults || [],
      insights: s.insights || 0,
      library: s.library || {dayKey:null,secondsRead:0,insightsEarned:0},
      libraryPdfs: serializeLibraryPdfs(s.libraryPdfs),
      arena: s.arena,
      currentModuleId: s.currentModuleId,
      appMode: s.appMode,
      inventory: s.inventory,
      pet: s.pet,
      petXp: s.petXp || {},
      prestigeRank: s.prestigeRank || 0,
      prestigePerk: s.prestigePerk || null,
      prestigeTimes: s.prestigeTimes || {},
      unlockedRewards: s.unlockedRewards || [],
      pendingLevelUps: s.pendingLevelUps || 0,
      lastSeenLevel: s.lastSeenLevel || 0,
      stats: s.stats || {},
      exchangeHistory: s.exchangeHistory || [],
      bestiary: s.bestiary || {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }catch(e){}
}
function loadSession(){
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e){ return null; }
}
function saveSession(session){
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e){}
}
function clearSession(){ try { localStorage.removeItem(SESSION_KEY); } catch(e){} }
function defaultState(){ return { sr:{}, xp:0, streak:{last:null,count:0}, daily:{}, pomodoro:{}, seenConcepts:{}, customModules:[], customDeadlines:[], examResults:[], currentModuleId: BUILTIN[0].id, appMode: null, insights: 0, library: { dayKey:null, secondsRead:0, insightsEarned:0 }, libraryPdfs: [], inventory: { fragments: [], consumables: [], passives: [], permBuffs: {}, equipment: { silicon_skin: { id: 'silicon_skin', quantity: 1, discovered: true }, overclock_chip: { id: 'overclock_chip', quantity: 1, discovered: true }, firewall_dll: { id: 'firewall_dll', quantity: 1, discovered: true } }, aura: null, shards: 0 }, pet: null, prestigeRank: 0, prestigePerk: null, prestigeTimes: {}, unlockedRewards: [], pendingLevelUps: 0, lastSeenLevel: 0, stats: { totalCorrect: 0, totalIncorrect: 0, totalKills: 0, totalFightsWon: 0, totalFightsLost: 0, totalReadingMs: 0, totalDmgDealt: 0, totalDmgTaken: 0 }, petXp: {}, exchangeHistory: [], bestiary: {}, arena: defaultArenaState() }; }

/* ============ UTIL ============ */
const DAY_MS = 86400000;
function dayKey(ts){ return new Date(ts||Date.now()).toISOString().slice(0,10); }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; }
function updateStreak(s){ const today=dayKey(); if (s.streak.last===today) return s;
  const y=dayKey(Date.now()-DAY_MS);
  const count=s.streak.last===y?s.streak.count+1:1;
  return {...s, streak:{last:today,count}};
}
function scheduleNext(prev, rating){
  let ease=(prev&&prev.ease)||2.5, interval=(prev&&prev.interval)||0;
  if (rating===0){ interval=0; ease=Math.max(1.3,ease-0.2); }
  else if (rating===1){ interval=Math.max(1,Math.ceil((interval||1)*1.2)); ease=Math.max(1.3,ease-0.15); }
  else if (rating===2){ interval=interval<1?1:Math.ceil(interval*ease); }
  else { interval=interval<1?3:Math.ceil(interval*ease*1.3); ease=Math.min(3.0,ease+0.1); }
  return { ease, interval, due: Date.now()+interval*DAY_MS, lastRating:rating, lastAt:Date.now() };
}
function xpForRating(r, marks){ if(r===0)return 1; if(r===1)return Math.max(2,Math.floor(marks/2)); if(r===2)return marks; return Math.ceil(marks*1.5); }
function levelFromXp(xp){ let n=0; while ((50*n*(n+1)/2)<=xp) n++; const prev=50*(n-1)*n/2, next=50*n*(n+1)/2; return {level:n-1, into:xp-prev, span:next-prev}; }

/* text matching */
const STOP=new Set("the a an is are was were and or but of to in on at for by with from as it its this that these those be been being have has had do does did will would could should may might can cannot not no yes if then so such than which who whom whose what when where why how".split(/\s+/));
function tokens(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>=3&&!STOP.has(w)); }
function keywordScore(text,kws){ if(!kws||!kws.length)return 0; const t=new Set(tokens(text)); let h=0; for(const k of kws) if(t.has((k||'').toLowerCase())) h++; return h/kws.length; }

/* markdown-lite: bold **x**, code `x`, code blocks ```, lists, line breaks */
function renderNotes(md){
  if(!md) return null;
  const lines = md.split('\n');
  const out = [];
  let inCode=false, codeBuf=[], listBuf=[];
  const flushList=()=>{ if(listBuf.length){ out.push(<ul key={'u'+out.length} style={{margin:'4px 0 8px',paddingLeft:18}}>{listBuf.map((x,i)=><li key={i}>{inline(x)}</li>)}</ul>); listBuf=[]; } };
  const inline=(s)=>{
    const parts=[];
    let i=0,key=0;
    while (i<s.length){
      if (s.startsWith('**',i)){
        const e=s.indexOf('**',i+2);
        if (e>-1){ parts.push(<strong key={key++}>{s.slice(i+2,e)}</strong>); i=e+2; continue; }
      }
      if (s[i]==='`'){
        const e=s.indexOf('`',i+1);
        if (e>-1){ parts.push(<code key={key++}>{s.slice(i+1,e)}</code>); i=e+1; continue; }
      }
      // plain char run until next special
      let j=i;
      while (j<s.length && !s.startsWith('**',j) && s[j]!=='`') j++;
      parts.push(s.slice(i,j));
      i=j;
    }
    return parts;
  };
  for (const raw of lines){
    const line=raw.replace(/\s+$/,'');
    if (line.startsWith('```')){
      if (!inCode){ inCode=true; codeBuf=[]; }
      else { out.push(<pre key={'p'+out.length}>{codeBuf.join('\n')}</pre>); inCode=false; }
      continue;
    }
    if (inCode){ codeBuf.push(line); continue; }
    if (/^\s*[-•]\s+/.test(line)){ listBuf.push(line.replace(/^\s*[-•]\s+/,'')); continue; }
    flushList();
    if (!line.trim()){ out.push(<div key={'br'+out.length} style={{height:6}}/>); continue; }
    out.push(<p key={'p'+out.length} style={{margin:'4px 0'}}>{inline(line)}</p>);
  }
  flushList();
  if (inCode) out.push(<pre key={'pc'+out.length}>{codeBuf.join('\n')}</pre>);
  return <div className="prose">{out}</div>;
}

/* ============ CODE RUNNER ============ */
let pyodidePromise = null;
function loadPyodide(){
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise((resolve, reject)=>{
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    s.onload = async ()=>{
      try { const py = await window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'}); resolve(py); }
      catch(e){ reject(e); }
    };
    s.onerror = ()=> reject(new Error('failed to load pyodide script'));
    document.head.appendChild(s);
  });
  return pyodidePromise;
}
async function runCode(lang, code){
  if (lang === 'javascript' || lang === 'js'){
    let out=[]; const orig=console.log; console.log=(...a)=>out.push(a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' '));
    try { const fn = new Function(code); const r = fn(); if (r!==undefined) out.push('=> '+String(r)); }
    catch(e){ out.push('ERROR: '+e.message); }
    finally { console.log=orig; }
    return out.join('\n');
  }
  if (lang === 'python' || lang === 'py'){
    try {
      const py = await loadPyodide();
      py.runPython(`
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
`);
      try { py.runPython(code); } catch(e){ return 'ERROR: '+e.message; }
      const output = py.runPython('_buf.getvalue()');
      py.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
      return output || '(no output)';
    } catch(e){ return 'Python runtime error: '+e.message; }
  }
  return `Can't run ${lang} in-browser. Trace it mentally and type your answer.`;
}

/* ============ POMODORO + STREAK ============ */
function PomodoroWidget({ onComplete }){
  const [mode,setMode]=useState('work'); const [rem,setRem]=useState(25*60); const [run,setRun]=useState(false); const [cy,setCy]=useState(0);
  const r=useRef(null);
  useEffect(()=>{
    if(!run) return;
    r.current=setInterval(()=>{
      setRem(x=>{ if(x<=1){ clearInterval(r.current); setRun(false);
        const nc = mode==='work'? cy+1 : cy; setCy(nc);
        if (mode==='work'){ onComplete&&onComplete(); if(nc%4===0){setMode('long'); return 15*60;} setMode('break'); return 5*60; }
        else { setMode('work'); return 25*60; } } return x-1; });
    },1000);
    return ()=> clearInterval(r.current);
  },[run,mode,cy,onComplete]);
  const mm=String(Math.floor(rem/60)).padStart(2,'0'), ss=String(rem%60).padStart(2,'0');
  const lab = mode==='work'?'Focus':mode==='break'?'Break':'Long break';
  return (
    <div className="card card-sub" style={{padding:10}}>
      <div className="tiny">{lab} · cycle {cy}</div>
      <div className="pomo">
        <div className="time">{mm}:{ss}</div>
        <button className="btn ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>setRun(v=>!v)}>{run?'Pause':'Start'}</button>
        <button className="btn ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>{setRun(false);setMode('work');setRem(25*60);}}>Reset</button>
      </div>
    </div>
  );
}
function StreakXp({ state }){
  const l=levelFromXp(state.xp||0); const pct=Math.max(2,Math.round((l.into/l.span)*100));
  return (
    <div className="card card-sub" style={{padding:10}}>
      <div className="streak"><span className="flame">🔥</span><b>{state.streak.count}</b><span className="tiny">day streak</span></div>
      <div style={{marginTop:8}}>
        <div className="tiny">Level {l.level} · {state.xp||0} XP</div>
        <div className="xp-bar"><div style={{width:pct+'%'}}/></div>
      </div>
    </div>
  );
}
function DeadlinesWidget({ state }){
  const today=new Date(); today.setHours(0,0,0,0);
  const items = [...DEADLINES, ...(state.customDeadlines||[])].map(d=>{
    const dt=new Date(d.date+'T00:00:00'); const diff=Math.ceil((dt-today)/DAY_MS); return {...d,diff};
  }).filter(d=>d.diff>=-1 && d.diff<=14).sort((a,b)=>a.diff-b.diff);
  return (
    <div className="card card-sub" style={{padding:10}}>
      <h3 style={{margin:'0 0 6px'}}>Upcoming (14d)</h3>
      {items.length===0 && <div className="tiny">Nothing in the next 2 weeks</div>}
      {items.slice(0,6).map((d,i)=>(
        <div key={i} className="deadline-item">
          <span className={(d.module==='ARI711S'||d.module==='DTN611S')?'ari':''}>{d.event}</span>
          <span className={d.diff<=1?'hot':d.diff<=3?'soon':'deadline-date'}>{d.diff<0?'past':d.diff===0?'today':d.diff===1?'tmrw':`${d.diff}d`}</span>
        </div>
      ))}
    </div>
  );
}

/* ============ COMPACT TOPBAR WIDGETS ============ */
function StreakChip({ state }){
  const l = levelFromXp(state.xp||0);
  return (
    <div className="hdr-chip" title={'Level '+l.level+' · '+(state.xp||0)+' XP'}>
      <span className="hdr-chip-icon">🔥</span>
      <span className="hdr-chip-num">{state.streak.count}</span>
      <span className="hdr-chip-sub">L{l.level}</span>
    </div>
  );
}
function PomoChip({ onComplete }){
  const [mode,setMode]=useState('work'); const [rem,setRem]=useState(25*60);
  const [run,setRun]=useState(false); const [cy,setCy]=useState(0);
  const r=useRef(null);
  useEffect(()=>{
    if(!run) return;
    r.current=setInterval(()=>{
      setRem(x=>{
        if(x<=1){ clearInterval(r.current); setRun(false);
          const nc = mode==='work'? cy+1 : cy; setCy(nc);
          if (mode==='work'){ onComplete&&onComplete(); if(nc%4===0){setMode('long'); return 15*60;} setMode('break'); return 5*60; }
          else { setMode('work'); return 25*60; }
        }
        return x-1;
      });
    },1000);
    return ()=> clearInterval(r.current);
  },[run,mode,cy,onComplete]);
  const mm=String(Math.floor(rem/60)).padStart(2,'0'), ss=String(rem%60).padStart(2,'0');
  const lab = mode==='work'?'Focus':mode==='break'?'Break':'Long';
  return (
    <div className={'hdr-chip pomo-chip'+(run?' running':'')} title={lab+' · cycle '+cy}>
      <span className="hdr-chip-icon">{mode==='work'?'🎯':'☕'}</span>
      <span className="hdr-chip-time">{mm}:{ss}</span>
      <button className="hdr-chip-btn" onClick={()=>setRun(v=>!v)}>{run?'❚❚':'▶'}</button>
      <button className="hdr-chip-btn" onClick={()=>{setRun(false);setMode('work');setRem(25*60);}}>↺</button>
    </div>
  );
}

/* ============ CONCEPT TEACH (Study Mode) ============ */
function ConceptTeach({ concept, moduleLabel, onStartStudy, onStartFeynman, state, setState }){
  useEffect(()=>{
    setState({...state, seenConcepts:{...(state.seenConcepts||{}), [concept.id]: Date.now()}});
    // eslint-disable-next-line
  },[concept.id]);
  return (
    <div>
      <div className="row" style={{marginBottom:10}}>
        <span className="chip">{moduleLabel}</span>
        <span className="chip">{concept.questions.length} questions</span>
      </div>
      <h2>{concept.name}</h2>

      {concept.notes && (
        <div className="card">
          <h3>Notes</h3>
          {renderNotes(concept.notes)}
        </div>
      )}
      <div className="teach-pane">
        <div className="card">
          <h3>Definition</h3>
          <div className="prose"><p>{concept.definition}</p></div>
          {concept.analogy && <><h3>Analogy</h3><div className="prose"><p>{concept.analogy}</p></div></>}
        </div>
        <div className="card">
          <h3>Key breakdown</h3>
          <ul style={{margin:0,paddingLeft:18,lineHeight:1.7}}>
            {(concept.breakdown||[]).map((b,i)=><li key={i}>{b}</li>)}
          </ul>
        </div>
      </div>
      {concept.exam_text && (
        <div className="card">
          <h3>Exam-style summary</h3>
          <div className="prose"><p>{concept.exam_text}</p></div>
        </div>
      )}
      <div className="row" style={{marginTop:8}}>
        <button className="btn" onClick={onStartStudy} disabled={!concept.questions.length}>Quiz me (Study mode)</button>
        <button className="btn ghost" onClick={onStartFeynman}>Teach it back (Feynman)</button>
      </div>
    </div>
  );
}

/* ============ QUIZ RUNNER (shared by Study + Exam) ============ */
function QuizRunner({ questions, title, mode, durationMin, onExit, state, setState }){
  const [idx,setIdx]=useState(0);
  const [revealed,setRevealed]=useState(false);
  const [text,setText]=useState('');
  const [sel,setSel]=useState(null);
  const [codeOut,setCodeOut]=useState('');
  const [userCode,setUserCode]=useState('');
  const [stats,setStats]=useState({correct:0,partial:0,wrong:0,skipped:0,marksEarned:0,marksTotal:0});
  const [examLog,setExamLog]=useState([]); // for exam summary
  const [summary,setSummary]=useState(null);
  const [tleft,setTleft]=useState((durationMin||0)*60);
  const [started]=useState(Date.now());
  // Read-then-recall: start with the focused notes visible; user clicks
  // "Hide notes & answer" to enter active-recall on this question.
  const [studyPhase,setStudyPhase] = useState('read'); // 'read' | 'recall'

  const q = questions[idx];
  const examMode = mode==='exam';

  useEffect(()=>{
    setRevealed(false); setText(''); setSel(null); setCodeOut('');
    if (q && q.starter) setUserCode(q.starter); else setUserCode('');
    // Start each new study question in 'read' phase if it has notes; otherwise
    // skip straight to recall.
    if (!examMode){
      const hasNote = !!(q && (q.note || q.explanation || q.conceptNotes));
      setStudyPhase(hasNote ? 'read' : 'recall');
    } else {
      setStudyPhase('recall');
    }
  },[idx,q,examMode]);

  // Exam timer
  useEffect(()=>{
    if (!examMode || !durationMin) return;
    const t = setInterval(()=> setTleft(x=>{
      if (x<=1){ clearInterval(t); finishExam(); return 0; }
      return x-1;
    }),1000);
    return ()=> clearInterval(t);
    // eslint-disable-next-line
  },[examMode, durationMin]);

  const finishExam = ()=>{
    // grade every un-graded question based on its recorded rating / auto-grade
    setSummary(true);
  };

  if (summary){
    const totalMarks = questions.reduce((s,q)=>s+(q.marks||0),0);
    const pct = totalMarks? Math.round(stats.marksEarned/totalMarks*100):0;
    return (
      <div>
        <h2>{examMode?'Exam complete':'Session complete'} — {title}</h2>
        <div className="row">
          <span className="chip ok">correct {stats.correct}</span>
          <span className="chip warn">partial {stats.partial}</span>
          <span className="chip err">wrong {stats.wrong}</span>
          <span className="chip">skipped {stats.skipped}</span>
          {examMode && <span className="chip accent">{stats.marksEarned}/{totalMarks} · {pct}%</span>}
        </div>
        {examMode && (
          <div className="card" style={{marginTop:10}}>
            <h3>Per-question breakdown</h3>
            <table className="tbl">
              <thead><tr><th>#</th><th>Type</th><th>Marks</th><th>Earned</th><th>Your answer</th></tr></thead>
              <tbody>
                {examLog.map((e,i)=>(
                  <tr key={i}>
                    <td>{i+1}</td><td>{e.type}</td><td>{e.marks}</td>
                    <td className={e.earned===e.marks?'ok':e.earned>0?'soon':'hot'} style={{color:e.earned===e.marks?'var(--ok)':e.earned>0?'var(--warn)':'var(--err)'}}>{e.earned}</td>
                    <td style={{maxWidth:320,overflow:'hidden',textOverflow:'ellipsis'}}>{String(e.answer||'').slice(0,80)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button className="btn" onClick={()=>{
          if (examMode){
            // persist result
            const totalMarks = questions.reduce((s,q)=>s+(q.marks||0),0);
            const res = {title, date:Date.now(), earned:stats.marksEarned, total:totalMarks, pct};
            setState({...state, examResults:[...(state.examResults||[]), res]});
          }
          onExit();
        }}>Back</button>
      </div>
    );
  }
  if (!q){ return <div>No questions. <button className="btn ghost" onClick={onExit}>Back</button></div>; }

  const autoGrade = (q, userAnswer)=>{
    const marks = q.marks || 1;
    if (q.type==='mcq') return userAnswer===q.answer ? marks : 0;
    if (q.type==='tf') return userAnswer===q.answer ? marks : 0;
    if (q.type==='code_output' && q.choices) return userAnswer===q.answer ? marks : 0;
    // free-text "what does it print?" — match the answer string after trim
    if (q.type==='code_output' && !q.choices){
      const norm = s => String(s||'').replace(/\r/g,'').trim();
      if (norm(userAnswer) === norm(q.answer)) return marks;
      // partial credit for keyword overlap
      const kw = q.keywords||[];
      if (kw.length) return Math.round(marks * keywordScore(userAnswer, kw));
      return 0;
    }
    // code_write: did the program produce the expected stdout?
    if (q.type==='code_write'){
      const norm = s => String(s||'').replace(/\r/g,'').trim();
      if (q.expectedOutput && codeOut && norm(codeOut) === norm(q.expectedOutput)) return marks;
      const kw = q.keywords||[];
      if (kw.length) return Math.round(marks * keywordScore(userAnswer, kw));
      return 0;
    }
    // essays, define, explain, code_bug, code_fill, code_trace: keyword coverage
    const kw = q.keywords||[];
    if (kw.length){
      const score = keywordScore(userAnswer, kw);
      return Math.round(marks * score);
    }
    return 0; // conservative default for ungradeable
  };

  const recordAnswer = (ratingOrNull)=>{
    const userAnswer = (q.type==='mcq' || q.type==='tf' || (q.type==='code_output' && q.choices)) ? sel : (q.type==='code_write' ? userCode : text);
    const earned = autoGrade(q, userAnswer);
    const marks = q.marks||0;
    const rating = ratingOrNull!=null ? ratingOrNull : (earned===marks?2:earned>0?1:0);

    // SR + XP
    const prev = state.sr[q.id];
    const next = scheduleNext(prev, rating);
    const gain = xpForRating(rating, marks);
    let s = {...state, sr:{...state.sr,[q.id]:next}, xp:(state.xp||0)+gain};
    const dk = dayKey();
    const d = s.daily[dk] || {answered:0,correct:0};
    d.answered++; if (rating>=2) d.correct++;
    s.daily = {...s.daily,[dk]:d};
    s = updateStreak(s);
    // Lifetime stats: count correct/incorrect for Study Mode answers too
    const statKey = rating >= 2 ? 'totalCorrect' : 'totalIncorrect';
    s.stats = { ...(s.stats || {}), [statKey]: ((s.stats && s.stats[statKey]) || 0) + 1 };
    setState(s);

    const ns = {...stats};
    if (rating===0) {
      ns.wrong++;
      // Add to mistake pool (for Ghost spawning)
      const pool = s.arena?.mistakePool || [];
      if (q.id && !pool.includes(q.id)){
        s.arena = {...s.arena, mistakePool: [...pool, q.id]};
      }
    } else if (rating===1) ns.partial++; else ns.correct++;
    ns.marksEarned += earned; ns.marksTotal += marks;
    setStats(ns);

    if (examMode){
      setExamLog([...examLog, {type:q.type, marks, earned, answer:userAnswer}]);
    }

    if (idx+1>=questions.length) setSummary(true); else setIdx(idx+1);
  };

  const showCheck = ()=> setRevealed(true);

  const doRunCode = async ()=>{
    setCodeOut('running...');
    const lang = q.language || 'python';
    const out = await runCode(lang, userCode);
    setCodeOut(out);
  };

  const renderInput = ()=>{
    if (q.type==='mcq' || (q.type==='code_output' && q.choices)){
      return (
        <div>
          {q.choices.map((c,i)=>{
            let cls='mcq-opt';
            if (revealed){
              if (c===q.answer) cls+=' correct';
              else if (c===sel) cls+=' wrong';
            } else if (c===sel) cls+=' sel';
            return <div key={i} className={cls} onClick={()=>!revealed && setSel(c)}>{c}</div>;
          })}
        </div>
      );
    }
    if (q.type==='tf'){
      return (
        <div>
          {[true,false].map(v=>{
            let cls='mcq-opt';
            if (revealed){ if (v===q.answer) cls+=' correct'; else if (v===sel) cls+=' wrong'; }
            else if (v===sel) cls+=' sel';
            return <div key={String(v)} className={cls} onClick={()=>!revealed && setSel(v)}>{v?'True':'False'}</div>;
          })}
        </div>
      );
    }
    if (q.type==='code_write' || (q.type==='code_fill')){
      return (
        <div>
          {q.code && <pre className="prose" style={{marginBottom:8}}>{q.code}</pre>}
          <textarea className="code-ed" value={userCode} onChange={e=>setUserCode(e.target.value)} spellCheck={false}/>
          <div className="row" style={{marginTop:8}}>
            <button className="btn ghost" onClick={doRunCode}>▶ Run {q.language||'python'}</button>
            {q.expectedOutput && <span className="tiny">Expected output: <code>{q.expectedOutput}</code></span>}
          </div>
          {codeOut && <div className="out-box" style={{marginTop:6}}>{codeOut}</div>}
        </div>
      );
    }
    if (q.type==='code_bug'){
      return (
        <div>
          {q.code && <pre className="prose">{q.code}</pre>}
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe what's wrong and how to fix it..."/>
        </div>
      );
    }
    if (q.type==='code_trace'){
      return (
        <div>
          {q.code && <pre className="prose">{q.code}</pre>}
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Trace through the execution. List the value of each variable at each step, and the final output." style={{minHeight:140}}/>
          <div className="row" style={{marginTop:8}}>
            <button className="btn ghost" onClick={async ()=>{
              setCodeOut('running...');
              const out = await runCode(q.language||'python', q.code||'');
              setCodeOut(out);
            }}>▶ Reveal actual output (after attempting)</button>
          </div>
          {codeOut && <div className="out-box" style={{marginTop:6}}>{codeOut}</div>}
        </div>
      );
    }
    if (q.type==='code_output' && !q.choices){
      return (
        <div>
          {q.code && <pre className="prose">{q.code}</pre>}
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What does this print?"/>
          <div className="row" style={{marginTop:8}}>
            <button className="btn ghost" onClick={async ()=>{
              setCodeOut('running...');
              const out = await runCode(q.language||'python', q.code||'');
              setCodeOut(out);
            }}>▶ Check by running</button>
          </div>
          {codeOut && <div className="out-box" style={{marginTop:6}}>{codeOut}</div>}
        </div>
      );
    }
    // define / explain / short_essay / long_essay
    return <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={
      q.type==='define'?'Write the definition...': q.type==='explain'?'Explain in 2–4 sentences...':
      q.type==='short_essay'?'Write a short answer (4–8 sentences)...':'Write a full answer...'
    }/>;
  };

  const canCheck = ()=>{
    if (q.type==='mcq'||q.type==='tf'||(q.type==='code_output'&&q.choices)) return sel!==null;
    if (q.type==='code_write') return userCode.trim().length>3;
    return text.trim().length>=3;
  };

  const pct = Math.round((idx/questions.length)*100);
  const mm = String(Math.floor(tleft/60)).padStart(2,'0'), ss=String(tleft%60).padStart(2,'0');
  const timerDanger = examMode && tleft<=60;

  return (
    <div>
      {examMode && (
        <div className="exam-bar row">
          <span className="chip err">EXAM</span>
          <div className="progress" style={{flex:1}}><div style={{width:pct+'%'}}/></div>
          <span className="muted">{idx+1}/{questions.length}</span>
          <span className={'timer'+(timerDanger?' danger':'')}>{mm}:{ss}</span>
          <button className="btn ghost" onClick={()=> confirm('End exam now?') && finishExam()}>Submit</button>
        </div>
      )}
      {!examMode && (
        <div className="row" style={{marginBottom:8}}>
          <button className="btn ghost" onClick={onExit}>← Exit</button>
          <div className="progress" style={{flex:1}}><div style={{width:pct+'%'}}/></div>
          <span className="muted">{idx+1}/{questions.length}</span>
        </div>
      )}
      <h2 style={{marginBottom:4}}>{title}</h2>
      <div className="muted" style={{marginBottom:12}}>{q.conceptName} · {q.levelName}</div>

      {/* READ PHASE — only in study mode, before the user has clicked "answer" */}
      {!examMode && studyPhase==='read' && (q.note || q.explanation || q.conceptNotes) && (
        <div className="card" style={{borderLeft:'3px solid var(--accent)'}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <h3 style={{margin:0}}>📖 Read first — focused notes</h3>
            <span className="chip accent">study mode</span>
          </div>
          <div className="muted" style={{marginBottom:8,fontSize:12}}>You'll be asked about this in a moment. Read it, then hide it and try to recall the answer on your own.</div>
          {q.note && renderNotes(q.note)}
          {!q.note && q.explanation && <div className="prose"><p>{q.explanation}</p></div>}
          {q.conceptNotes && (
            <details style={{marginTop:8}}>
              <summary className="muted" style={{cursor:'pointer',fontSize:12}}>Full concept notes</summary>
              <div style={{marginTop:8}}>{renderNotes(q.conceptNotes)}</div>
            </details>
          )}
          <div className="row" style={{marginTop:10}}>
            <button className="btn" onClick={()=>setStudyPhase('recall')}>Hide notes & try to answer →</button>
            <span className="tiny">{idx+1} of {questions.length}</span>
          </div>
        </div>
      )}

      <div className="card" style={!examMode && studyPhase==='read' ? {opacity:0.45,filter:'blur(2px)',pointerEvents:'none'} : null}>
        <div className="q-type">{(q.type||'').replace('_',' ')} · {q.marks} mark{q.marks!==1?'s':''} · {q.difficulty||'medium'}</div>
        <h3 style={{color:'var(--text)',fontSize:16,textTransform:'none',letterSpacing:0,margin:'6px 0 10px'}}>{q.prompt}</h3>

        {/* In recall phase, allow a "peek" back at notes once you've committed */}
        {!examMode && studyPhase==='recall' && (q.note || q.conceptNotes) && (
          <details className="study-notes" style={{marginBottom:8}}>
            <summary>👀 Peek at the notes (small XP penalty)</summary>
            <div style={{marginTop:8}}>
              {q.note && renderNotes(q.note)}
              {!q.note && q.conceptNotes && renderNotes(q.conceptNotes)}
            </div>
          </details>
        )}

        {renderInput()}

        {revealed && !examMode && (
          <div className="card card-sub" style={{marginTop:10}}>
            <h3>Model answer</h3>
            <div className="prose"><p>{String(q.answer)}</p></div>
            {q.explanation && <>
              <h3>Why</h3>
              <div className="prose"><p>{q.explanation}</p></div>
            </>}
            {q.expectedOutput && (
              <><h3>Expected output</h3><pre className="prose">{q.expectedOutput}</pre></>
            )}
            {q.keywords && q.keywords.length>0 && (q.type!=='mcq'&&q.type!=='tf') && (
              <div className="tiny">Keyword coverage: <b style={{color:'var(--text)'}}>{Math.round(keywordScore(q.type==='code_write'?userCode:text, q.keywords)*100)}%</b></div>
            )}
            {q.note && (
              <details style={{marginTop:8}}>
                <summary className="muted" style={{cursor:'pointer'}}>Re-read focused notes for this question</summary>
                <div style={{marginTop:8}}>{renderNotes(q.note)}</div>
              </details>
            )}
          </div>
        )}

        {!revealed && !examMode && (
          <div className="row" style={{marginTop:10}}>
            <button className="btn" onClick={showCheck} disabled={!canCheck()}>Check answer</button>
            <button className="btn ghost" onClick={()=>{ setStats({...stats,skipped:stats.skipped+1}); if(idx+1>=questions.length) setSummary(true); else setIdx(idx+1); }}>Skip</button>
          </div>
        )}
        {revealed && !examMode && (
          <div className="rating">
            <button className="again" onClick={()=>recordAnswer(0)}>Again</button>
            <button className="hard" onClick={()=>recordAnswer(1)}>Hard</button>
            <button className="good" onClick={()=>recordAnswer(2)}>Good</button>
            <button className="easy" onClick={()=>recordAnswer(3)}>Easy</button>
          </div>
        )}
        {examMode && (
          <div className="row" style={{marginTop:10}}>
            <button className="btn" onClick={()=>recordAnswer(null)} disabled={!canCheck()}>Submit & next</button>
            <button className="btn ghost" onClick={()=>{ setStats({...stats,skipped:stats.skipped+1}); if(idx+1>=questions.length) finishExam(); else setIdx(idx+1); }}>Skip</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ FEYNMAN ============ */
function FeynmanSession({ concept, onExit, state, setState }){
  const [text,setText]=useState(''); const [revealed,setRevealed]=useState(false);
  const targets = (concept.breakdown||[]).map(b=>{
    const kw=(b.match(/\b[A-Za-z]{4,}\b/g)||[]).slice(0,3).map(s=>s.toLowerCase());
    return {line:b, kw};
  });
  const toks = new Set(tokens(text));
  const hits = targets.map(t=>({...t, hit: t.kw.some(k=>toks.has(k))}));
  const score = hits.length? Math.round(hits.filter(h=>h.hit).length/hits.length*100):0;
  return (
    <div>
      <button className="btn ghost" onClick={onExit}>← Exit</button>
      <h2 style={{marginTop:8}}>Teach: {concept.name}</h2>
      {concept.notes && <details className="study-notes"><summary>Peek notes</summary><div style={{marginTop:8}}>{renderNotes(concept.notes)}</div></details>}
      <div className="card">
        <label>Explain it to a 12-year-old. Use your own words.</label>
        <textarea value={text} onChange={e=>setText(e.target.value)} style={{minHeight:180}}/>
        <div className="row" style={{marginTop:8}}>
          <button className="btn" onClick={()=>{
            setRevealed(true);
            const gain = Math.max(3, Math.round(score/10));
            setState(updateStreak({...state, xp:(state.xp||0)+gain}));
          }} disabled={text.trim().length<30}>Check gaps</button>
        </div>
      </div>
      {revealed && (
        <div className="card">
          <h3>Coverage · {score}%</h3>
          <ul style={{margin:0,paddingLeft:18,lineHeight:1.7}}>
            {hits.map((h,i)=><li key={i} style={{color: h.hit?'var(--ok)':'var(--warn)'}}>{h.hit?'✓':'✗'} {h.line}</li>)}
          </ul>
          <div className="card card-sub" style={{marginTop:10}}>
            <h3>Model definition</h3>
            <div className="prose"><p>{concept.definition}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ HOME ============ */
function Home({ mod, setView, state, goConcept }){
  const today=dayKey(); const d=state.daily[today]||{answered:0,correct:0};
  const all = mod.levels.flatMap(lv=> lv.concepts.map(c=>({...c, levelId:lv.id, levelName:lv.name})));
  const allQ = all.flatMap(c=> c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:c.levelName})));
  const dueCount = allQ.filter(q => state.sr[q.id] && state.sr[q.id].due <= Date.now()).length;
  const seen = all.filter(c=> state.seenConcepts[c.id]).length;
  
  const equippedPet = state.pet ? (PET_REGISTRY[state.pet] || null) : null;

  return (
    <div>
      {equippedPet && (
        <div className="tiny" style={{marginBottom:8}}>🐾 Companion: {equippedPet.icon} {equippedPet.name} <span className="muted">— manage in Arena → Pet Sanctuary</span></div>
      )}
      {!equippedPet && (
        <div className="tiny" style={{marginBottom:8,color:'var(--muted)'}}>🐾 No companion. Pick one in Arena → Pet Sanctuary for combat bonuses.</div>
      )}
      <h2>{mod.name}</h2>
      <div className="muted" style={{marginBottom:12}}>{mod.description}</div>
      <div className="grid three">
        <div className="card"><div className="tiny">Today</div><div style={{fontSize:22,fontWeight:700}}>{d.answered}</div><div className="tiny">{d.correct} correct</div></div>
        <div className="card"><div className="tiny">Due</div><div style={{fontSize:22,fontWeight:700}}>{dueCount}</div><button className="btn" disabled={!dueCount} onClick={()=>setView('due')}>Review</button></div>
        <div className="card"><div className="tiny">Concepts seen</div><div style={{fontSize:22,fontWeight:700}}>{seen}/{all.length}</div></div>
      </div>
      <h3 style={{marginTop:16}}>Modes</h3>
      <div className="grid auto">
        <button className="card" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>setView('study')}>
          <b>📚 Study Mode</b><div className="tiny">Read notes, quiz, feedback after each</div>
        </button>
        <button className="card" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>setView('pass')}>
          <b>🚦 Pass Mode</b><div className="tiny">Exam rescue: triage, priority map, focused drills</div>
        </button>
        <button className="card" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>setView('exam')}>
          <b>📝 Exam Mode</b><div className="tiny">Timed, no hints, full mock test</div>
        </button>
        <button className="card" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>setView('daily')}>
          <b>📅 Daily plan</b><div className="tiny">Teach → recall → test → review</div>
        </button>
        <button className="card" style={{textAlign:'left',cursor:'pointer'}} onClick={()=>setView('interleaved')}>
          <b>🔀 Interleaved</b><div className="tiny">Mix across topics & types</div>
        </button>
      </div>
      <h3 style={{marginTop:16}}>Topics</h3>
      <div className="grid auto">
        {mod.levels.map(lv=>(
          <div key={lv.id} className="card">
            <b>{lv.name}</b><div className="tiny" style={{marginBottom:8}}>{lv.concepts.length} concepts</div>
            {lv.concepts.map(c=>(
              <button key={c.id} className="btn ghost" style={{width:'100%',marginBottom:4,textAlign:'left',padding:'6px 10px',fontSize:12.5}} onClick={()=>goConcept(c.id)}>{c.name}</button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ STUDY MODE picker ============ */
function StudyPicker({ mod, onStart, goConcept }){
  const [openLevel,setOpenLevel] = useState(mod.levels[0]?.id);
  const startLevelStudy = (lv) => {
    const qs = lv.concepts.flatMap(c => c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:lv.name, conceptNotes:c.notes})));
    if (!qs.length){ alert('No questions in this topic yet.'); return; }
    onStart({questions: shuffle(qs), title:`Study — ${lv.name}`, mode:'study'});
  };
  return (
    <div>
      <h2>Study Mode — {mod.name}</h2>
      <p className="muted">Read-then-recall. Each question first shows you a focused note. When you click "Hide notes & try", the notes disappear and you have to recall the answer on your own. Then you check yourself, see why, and rate it. This is the highest-retention way to study.</p>
      {mod.levels.map(lv=>(
        <div key={lv.id} className="card">
          <div className="row" style={{justifyContent:'space-between'}}>
            <div>
              <b style={{fontSize:15}}>{lv.name}</b>
              <div className="tiny">{lv.summary || `${lv.concepts.length} concepts`}</div>
            </div>
            <div className="row">
              <button className="btn ghost" onClick={()=>setOpenLevel(openLevel===lv.id?null:lv.id)}>{openLevel===lv.id?'Hide':'Show'} topic</button>
              <button className="btn" onClick={()=>startLevelStudy(lv)}>Study whole topic</button>
            </div>
          </div>
          {openLevel===lv.id && (
            <div style={{marginTop:10}}>
              {lv.notes && (
                <div className="card card-sub">
                  <h3>📚 Topic overview</h3>
                  {renderNotes(lv.notes)}
                </div>
              )}
              <div className="grid auto">
                {lv.concepts.map(c=>(
                  <div key={c.id} className="card card-sub">
                    <b>{c.name}</b>
                    <div className="tiny" style={{marginBottom:6}}>{c.questions.length} Qs · {c.summary||''}</div>
                    <div className="row">
                      <button className="btn" onClick={()=>goConcept(c.id)}>Read + Quiz</button>
                      <button className="btn ghost" onClick={()=>{
                        const qs = c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:lv.name, conceptNotes:c.notes}));
                        onStart({questions:qs, title:`Study — ${c.name}`, mode:'study'});
                      }} disabled={!c.questions.length}>Quiz only</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============ EXAM MODE ============ */
function ExamPicker({ mod, onStart }){
  const tmpl = mod.examTemplate || {durationMin:90, composition:[
    {type:'mcq',count:8,marks:2},{type:'tf',count:6,marks:1},{type:'define',count:4,marks:2},{type:'explain',count:3,marks:4},{type:'short_essay',count:2,marks:6}
  ]};
  const [duration,setDuration] = useState(tmpl.durationMin||90);
  const all = mod.levels.flatMap(lv=> lv.concepts.map(c=>({...c, levelName:lv.name}))).flatMap(c=> c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:c.levelName, conceptNotes:c.notes})));
  const [levelsSel,setLevelsSel] = useState(()=> new Set(mod.levels.map(l=>l.id)));
  const toggleLevel = id=>{ const n=new Set(levelsSel); n.has(id)?n.delete(id):n.add(id); setLevelsSel(n); };

  const build = ()=>{
    const filtered = all.filter(q => {
      const lv = mod.levels.find(l => l.concepts.some(c=>c.id===q.conceptId));
      return lv && levelsSel.has(lv.id);
    });
    const selected = [];
    for (const part of tmpl.composition){
      const bucket = filtered.filter(q=> q.type===part.type);
      const picked = shuffle(bucket).slice(0, part.count);
      selected.push(...picked);
    }
    if (!selected.length){ alert('Not enough questions in the selected topics for this template.'); return; }
    onStart({questions:selected, title:`Exam — ${mod.name}`, mode:'exam', durationMin:duration});
  };
  return (
    <div>
      <h2>Exam Mode — {mod.name}</h2>
      <p className="muted">Timed, no notes, no "Show answer" until you submit each question. Mimics the real test.</p>
      <div className="card">
        <h3>Composition</h3>
        <table className="tbl"><thead><tr><th>Type</th><th>Count</th><th>Marks each</th><th>Total</th></tr></thead><tbody>
          {tmpl.composition.map((p,i)=>(
            <tr key={i}><td>{p.type.replace('_',' ')}</td><td>{p.count}</td><td>{p.marks}</td><td>{p.count*p.marks}</td></tr>
          ))}
        </tbody></table>
        <div className="row" style={{marginTop:10}}>
          <div style={{flex:1}}>
            <label>Duration (minutes)</label>
            <input type="number" value={duration} onChange={e=>setDuration(Math.max(5, Math.min(180, +e.target.value||90)))} />
          </div>
          <div style={{flex:2}}>
            <label>Topics to include</label>
            <div className="row">
              {mod.levels.map(lv=>(
                <label key={lv.id} className="chip" style={{cursor:'pointer', background: levelsSel.has(lv.id)?'#1b2542':'var(--chip)', color: levelsSel.has(lv.id)?'var(--text)':'var(--muted)'}}>
                  <input type="checkbox" checked={levelsSel.has(lv.id)} onChange={()=>toggleLevel(lv.id)} style={{marginRight:4}}/>{lv.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <button className="btn" style={{marginTop:12}} onClick={build}>Start exam</button>
      </div>
    </div>
  );
}

/* ============ DAILY / DUE / INTERLEAVED / FEYNMAN pickers ============ */
function DueReview({ mod, onStart, state }){
  const all = mod.levels.flatMap(lv=> lv.concepts.map(c=>({...c, levelName:lv.name}))).flatMap(c=> c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:c.levelName, conceptNotes:c.notes})));
  const due = all.filter(q => state.sr[q.id] && state.sr[q.id].due <= Date.now());
  if (!due.length) return <div><h2>Review</h2><p className="muted">Nothing due. Answer more questions first.</p></div>;
  return (
    <div>
      <h2>Due for review</h2>
      <p className="muted">{due.length} due · will show up to 20</p>
      <button className="btn" onClick={()=>onStart({questions:shuffle(due).slice(0,20), title:'Due review', mode:'study'})}>Start</button>
    </div>
  );
}
function InterleavedView({ mod, onStart }){
  const [count,setCount]=useState(20);
  const [types,setTypes]=useState({mcq:true,tf:true,define:true,explain:true,short_essay:true,long_essay:false,code_output:true,code_bug:true,code_write:true,code_fill:true,code_trace:true});
  const all = mod.levels.flatMap(lv=> lv.concepts.map(c=>({...c, levelName:lv.name}))).flatMap(c=> c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:c.levelName, conceptNotes:c.notes})));
  const start = ()=>{
    const pool = all.filter(q=> types[q.type]);
    onStart({questions:shuffle(pool).slice(0,count), title:`Interleaved ×${Math.min(pool.length,count)}`, mode:'study'});
  };
  return (
    <div>
      <h2>Interleaved — {mod.name}</h2>
      <p className="muted">Mixing topics & types builds retention far better than drilling one area.</p>
      <div className="card">
        <label>Questions</label>
        <input type="number" value={count} min="5" max="60" onChange={e=>setCount(Math.max(5,Math.min(60,+e.target.value||20)))}/>
        <div style={{marginTop:10}}>
          <label>Include types</label>
          <div className="row">
            {Object.keys(types).map(t=>(
              <label key={t} className="chip" style={{cursor:'pointer',background:types[t]?'#1b2542':'var(--chip)',color:types[t]?'var(--text)':'var(--muted)'}}>
                <input type="checkbox" checked={types[t]} onChange={e=>setTypes({...types,[t]:e.target.checked})} style={{marginRight:4}}/>{t.replace('_',' ')}
              </label>
            ))}
          </div>
        </div>
        <button className="btn" style={{marginTop:10}} onClick={start}>Start</button>
      </div>
    </div>
  );
}
function DailyView({ mod, onStart, setView, state, goConcept }){
  const all = mod.levels.flatMap(lv=> lv.concepts.map(c=>({...c, levelName:lv.name})));
  const unseen = all.find(c=> !state.seenConcepts[c.id]) || all[0];
  const allQ = all.flatMap(c=> c.questions.map(q=>({...q, conceptId:c.id, conceptName:c.name, levelName:c.levelName, conceptNotes:c.notes})));
  const plan = [
    { title:'Teach', body: unseen?.name||'', action:()=> unseen && goConcept(unseen.id) },
    { title:'Active recall (6)', body:'On the concept you just read', action:()=>{
        const qs = (unseen?.questions||[]).map(q=>({...q, conceptId:unseen.id, conceptName:unseen.name, conceptNotes:unseen.notes, levelName:unseen.levelName}));
        onStart({questions:shuffle(qs).slice(0,6), title:`Recall — ${unseen?.name||''}`, mode:'study'});
      }},
    { title:'Practice test (10)', body:'Mixed MCQ / T-F / define / explain', action:()=>{
        const pool = allQ.filter(q=>['mcq','tf','define','explain'].includes(q.type));
        onStart({questions:shuffle(pool).slice(0,10), title:'Practice test', mode:'study'});
      }},
    { title:'Review due', body:'Spaced repetition', action:()=> setView('due') },
  ];
  return (
    <div>
      <h2>Daily plan — {mod.name}</h2>
      {plan.map((s,i)=>(
        <div key={i} className="card row" style={{justifyContent:'space-between'}}>
          <div><b>Step {i+1}: {s.title}</b><div className="tiny">{s.body}</div></div>
          <button className="btn" onClick={s.action}>Go</button>
        </div>
      ))}
    </div>
  );
}

/* ============ STATS / DEADLINES / GRADES ============ */
function Stats({ state }){
  const days = Object.keys(state.daily||{}).sort();
  const stats = state.stats || {};
  // Lifetime answered/accuracy — counts BOTH Study Mode and Arena combat answers.
  // Falls back to daily aggregate for old saves that have no `stats` field yet.
  const lifetimeAns = (stats.totalCorrect || 0) + (stats.totalIncorrect || 0);
  const dailyAns = days.reduce((s,d)=>s+(state.daily[d].answered||0),0);
  const dailyCor = days.reduce((s,d)=>s+(state.daily[d].correct||0),0);
  const tot = lifetimeAns > 0 ? lifetimeAns : dailyAns;
  const cor = lifetimeAns > 0 ? (stats.totalCorrect || 0) : dailyCor;
  const acc = tot ? Math.round(cor/tot*100) : 0;
  const today = state.daily?.[dayKey()] || { answered: 0, correct: 0 };
  const tiers = typeof STAT_BUFF_TIERS !== 'undefined' ? STAT_BUFF_TIERS : [];
  const fmtMs = (ms)=>{ const m = Math.floor(ms/60000); const h = Math.floor(m/60); return h ? `${h}h ${m%60}m` : `${m}m`; };
  return (
    <div>
      <h2>Stats</h2>
      <div className="grid three">
        <div className="card"><div className="tiny">Total answered</div><div style={{fontSize:22,fontWeight:700}}>{tot}</div><div className="tiny muted">{cor} correct · today {today.answered}</div></div>
        <div className="card"><div className="tiny">Accuracy (lifetime)</div><div style={{fontSize:22,fontWeight:700}}>{acc}%</div><div className="tiny muted">{today.answered ? Math.round((today.correct/today.answered)*100)+'% today' : 'no answers today'}</div></div>
        <div className="card"><div className="tiny">Active days</div><div style={{fontSize:22,fontWeight:700}}>{days.length}</div><div className="tiny muted">🔥 {state.streak?.count || 0} day streak</div></div>
      </div>

      {tiers.length > 0 && (
        <div className="card">
          <h3>📊 Lifetime Stats → Combat Buffs</h3>
          <div className="tiny muted" style={{marginBottom:10}}>Every threshold you cross grants a permanent in-fight bonus. Caps shown on the right.</div>
          <div className="stat-buff-list">
            {tiers.map(t => {
              const prog = (typeof statBuffProgress === 'function') ? statBuffProgress(stats, t) : { tiersUnlocked:0, nextThreshold:t.per, intoCurrent:0, atMax:false, current:0 };
              const isMs = t.stat === 'totalReadingMs';
              const cur = isMs ? fmtMs(prog.current) : prog.current;
              const next = isMs ? fmtMs(prog.nextThreshold) : prog.nextThreshold;
              const into = isMs ? fmtMs(prog.intoCurrent) : prog.intoCurrent;
              const span = isMs ? fmtMs(t.per) : t.per;
              const pct = prog.atMax ? 100 : Math.min(100, Math.round((prog.intoCurrent / t.per) * 100));
              return (
                <div key={t.stat} className="stat-buff-row">
                  <div className="stat-buff-head">
                    <span className="stat-buff-icon">{t.icon}</span>
                    <div style={{flex:1}}>
                      <div className="stat-buff-label">{t.label}</div>
                      <div className="tiny muted">{t.stat}: {cur}{prog.atMax?'':' / '+next}</div>
                    </div>
                    <span className={'chip '+(prog.tiersUnlocked>0?'ok':'')}>{prog.tiersUnlocked}/{t.max/t.value}{prog.atMax?' MAX':''}</span>
                  </div>
                  <div className="hp-bar" style={{marginTop:6}}><div className="hp-fill" style={{width:pct+'%',background:prog.atMax?'linear-gradient(90deg,var(--ok),#22c55e)':'linear-gradient(90deg,var(--accent),var(--accent-2))'}}/></div>
                  {!prog.atMax && <div className="tiny muted" style={{marginTop:4}}>Next tier: {into} / {span}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(stats.totalKills || stats.totalFightsWon || stats.totalDmgDealt || stats.totalDmgTaken) > 0 && (
        <div className="card">
          <h3>⚔️ Combat Stats</h3>
          <div className="grid three">
            <div className="stat"><div className="tiny">Fights won</div><div style={{fontSize:18,fontWeight:700}}>{stats.totalFightsWon || 0}</div></div>
            <div className="stat"><div className="tiny">Fights lost</div><div style={{fontSize:18,fontWeight:700}}>{stats.totalFightsLost || 0}</div></div>
            <div className="stat"><div className="tiny">Total kills</div><div style={{fontSize:18,fontWeight:700}}>{stats.totalKills || 0}</div></div>
            <div className="stat"><div className="tiny">Damage dealt</div><div style={{fontSize:18,fontWeight:700}}>{(stats.totalDmgDealt || 0).toLocaleString()}</div></div>
            <div className="stat"><div className="tiny">Damage taken</div><div style={{fontSize:18,fontWeight:700}}>{(stats.totalDmgTaken || 0).toLocaleString()}</div></div>
            <div className="stat"><div className="tiny">Reading time</div><div style={{fontSize:18,fontWeight:700}}>{fmtMs(stats.totalReadingMs || 0)}</div></div>
          </div>
        </div>
      )}
      <div className="card">
        <h3>Exam history</h3>
        {(state.examResults||[]).length===0 && <div className="tiny">No exams taken yet.</div>}
        <table className="tbl"><thead><tr><th>When</th><th>Exam</th><th>Score</th></tr></thead><tbody>
          {(state.examResults||[]).slice().reverse().map((r,i)=>(
            <tr key={i}><td>{new Date(r.date).toLocaleString()}</td><td>{r.title}</td><td>{r.earned}/{r.total} · {r.pct}%</td></tr>
          ))}
        </tbody></table>
      </div>
      <div className="card">
        <h3>Daily log</h3>
        <table className="tbl"><thead><tr><th>Day</th><th>Answered</th><th>Correct</th></tr></thead><tbody>
          {days.slice().reverse().slice(0,14).map(d=>(<tr key={d}><td>{d}</td><td>{state.daily[d].answered||0}</td><td>{state.daily[d].correct||0}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  );
}
function DeadlinesView({ state, setState }){
  const today=new Date(); today.setHours(0,0,0,0);
  const all = [...DEADLINES, ...(state.customDeadlines||[])].map(d=>{ const dt=new Date(d.date+'T00:00:00'); const diff=Math.ceil((dt-today)/DAY_MS); return {...d,diff}; }).sort((a,b)=>a.date.localeCompare(b.date));
  const [ev,setEv]=useState(''); const [dt,setDt]=useState('');
  return (
    <div>
      <h2>Deadlines</h2>
      <div className="card">
        <h3>Add your own</h3>
        <div className="row">
          <input type="text" placeholder="Event" value={ev} onChange={e=>setEv(e.target.value)} style={{flex:2}}/>
          <input type="text" placeholder="YYYY-MM-DD" value={dt} onChange={e=>setDt(e.target.value)} style={{flex:1}}/>
          <button className="btn" onClick={()=>{ if(!ev||!dt)return; setState({...state, customDeadlines:[...(state.customDeadlines||[]),{event:ev,date:dt,module:'Custom',type:'Custom',notes:''}]}); setEv(''); setDt(''); }}>Add</button>
        </div>
      </div>
      <div className="card">
        <table className="tbl"><thead><tr><th>Date</th><th>Event</th><th>Module</th><th>Type</th><th>Countdown</th></tr></thead><tbody>
          {all.map((d,i)=>(
            <tr key={i}><td>{d.date}</td><td className={d.module==='ARI711S'||d.module==='DTN611S'?'ari':''}>{d.event}</td><td>{d.module}</td><td>{d.type}</td><td className={d.diff<0?'muted':d.diff<=1?'hot':d.diff<=3?'soon':''}>{d.diff<0?'past':d.diff===0?'TODAY':d.diff===1?'tomorrow':`${d.diff}d`}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
function GradesView(){
  const [rows,setRows] = useState(GRADES.map(g=>({...g, plannedExam:60})));
  const compute=(g)=>{
    const sem=g.semesterMark, pe=g.plannedExam;
    const final = g.hasExam==='Yes'? Math.round((sem*0.5 + pe*0.5)*10)/10 : sem;
    const need = g.hasExam==='Yes'? Math.max(0,(50 - sem*0.5)*2) : null;
    return {final, need};
  };
  return (
    <div>
      <h2>Grade calculator</h2>
      <p className="muted">Assumes 50/50 semester/exam for exam-weighted modules. Override per module by editing the planned exam score.</p>
      <div className="card">
        <table className="tbl"><thead><tr><th>Module</th><th>Semester</th><th>Status</th><th>Planned exam</th><th>Projected</th><th>Pass req.</th></tr></thead><tbody>
          {rows.map((g,i)=>{const {final,need}=compute(g); return (
            <tr key={i}>
              <td className={g.module.startsWith('ARI711S')||g.module.startsWith('DTN611S')?'ari':''}>{g.module}</td>
              <td>{g.semesterMark}</td>
              <td><span className="pill" style={{background:g.qualified==='Yes'?'#13311f':'#2d2414',color:g.qualified==='Yes'?'var(--ok)':'var(--warn)'}}>{g.status}</span></td>
              <td>{g.hasExam==='Yes'? <input type="number" min="0" max="100" value={g.plannedExam} onChange={e=>{const v=Math.max(0,Math.min(100,+e.target.value||0));setRows(rows.map((r,j)=>j===i?{...r,plannedExam:v}:r));}} style={{width:80}}/>:<span className="muted">n/a</span>}</td>
              <td><b>{final}</b></td>
              <td className={need!=null&&need>100?'hot':''}>{need==null?'—':need>100?'impossible':`${Math.round(need)}% exam`}</td>
            </tr>
          );})}
        </tbody></table>
      </div>
    </div>
  );
}

/* ============ MODULE UPLOAD ============ */
function Modules({ state, setState, BUILTIN, setCurrent }){
  const [pasted,setPasted]=useState('');
  const [err,setErr]=useState('');
  const customs = state.customModules||[];
  const addModule = (obj)=>{
    if (!obj.id || !obj.name || !Array.isArray(obj.levels)){ setErr('Module needs id, name, and levels[]'); return; }
    setState({...state, customModules:[...customs, obj]});
    setErr('');
  };
  const doPaste = ()=>{
    try {
      let obj = JSON.parse(pasted);
      if (obj.modules && Array.isArray(obj.modules)){
        const cm = obj.modules;
        setState({...state, customModules:[...customs, ...cm]});
      } else {
        addModule(obj);
      }
      setPasted('');
    } catch(e){ setErr('Invalid JSON: '+e.message); }
  };
  const doFile = async (e)=>{
    const f = e.target.files[0]; if (!f) return;
    const t = await f.text();
    try { addModule(JSON.parse(t)); } catch(err){ setErr('Invalid JSON file'); }
  };
  const delMod = (id)=> setState({...state, customModules: customs.filter(m=>m.id!==id)});
  return (
    <div>
      <h2>Modules</h2>
      <p className="muted">Add your own module JSON (same schema as built-in). Works for any subject — paste your notes into a module and the app treats it like the others.</p>

      <div className="card">
        <h3>Upload JSON</h3>
        <input type="file" accept="application/json,.json" onChange={doFile} />
      </div>
      <div className="card">
        <h3>Paste JSON</h3>
        <textarea value={pasted} onChange={e=>setPasted(e.target.value)} style={{minHeight:160}} placeholder='{"id":"mymod","name":"My Module","levels":[{"id":"l1","name":"Level 1","concepts":[{"id":"c1","name":"Concept","notes":"Full notes...","definition":"...","breakdown":["..."],"questions":[]}]}]}'/>
        <div className="row" style={{marginTop:8}}><button className="btn" onClick={doPaste}>Add module</button>{err && <span className="chip err">{err}</span>}</div>
      </div>

      <h3>Built-in</h3>
      <div className="grid auto">
        {BUILTIN.map(m=>(
          <div key={m.id} className="card">
            <b>{m.name}</b>
            <div className="tiny">{m.description}</div>
            <div className="tiny" style={{marginTop:4}}>{m.levels.length} levels · {m.levels.reduce((s,l)=>s+l.concepts.length,0)} concepts · {m.levels.reduce((s,l)=>s+l.concepts.reduce((t,c)=>t+c.questions.length,0),0)} Qs</div>
            <button className="btn" style={{marginTop:8}} onClick={()=>{ setCurrent(m.id); }}>Select</button>
          </div>
        ))}
      </div>
      {customs.length>0 && <>
        <h3>Your custom modules</h3>
        <div className="grid auto">
          {customs.map(m=>(
            <div key={m.id} className="card">
              <b>{m.name}</b>
              <div className="tiny">{m.description||'Custom'}</div>
              <div className="row" style={{marginTop:6}}>
                <button className="btn" onClick={()=>setCurrent(m.id)}>Select</button>
                <button className="btn ghost" onClick={()=>delMod(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </>}
      <div className="card">
        <h3>Schema (with read-then-recall fields)</h3>
        <pre className="prose">{SCHEMA_DOC}</pre>
      </div>
    </div>
  );
}

const SCHEMA_DOC = [
  '{',
  '  "id": "mod_id",',
  '  "name": "Module Name",',
  '  "description": "...",',
  '  "examTemplate": { "durationMin":90, "composition":[{"type":"mcq","count":6,"marks":2}] },',
  '  "levels": [',
  '    {',
  '      "id":"l1","name":"Topic 1",',
  '      "summary":"One-line topic summary",',
  '      "notes":"Markdown-lite topic-level notes shown as the overview",',
  '      "concepts":[',
  '        {',
  '          "id":"c1","name":"Concept",',
  '          "summary":"Quick recall summary",',
  '          "notes":"Full markdown-lite concept notes",',
  '          "definition":"one sentence","analogy":"optional",',
  '          "breakdown":["point 1","point 2"],',
  '          "questions":[',
  '            { "id":"q1","type":"mcq","marks":2,"difficulty":"easy",',
  '              "prompt":"...","choices":["a","b"],"answer":"a",',
  '              "explanation":"why",',
  '              "keywords":["kw"],',
  '              "note":"Focused study note shown BEFORE the question in study mode." },',
  '            { "id":"q2","type":"code_write","marks":8,"language":"python",',
  '              "prompt":"Write a function...","starter":"def f(): pass",',
  '              "answer":"def f(): return 1","expectedOutput":"1",',
  '              "note":"Read this — what is the base case? what is recursive?",',
  '              "explanation":"..." },',
  '            { "id":"q3","type":"code_output","language":"python","marks":3,',
  '              "prompt":"What does this print?","code":"print(2**4)",',
  '              "answer":"16","note":"Python ** is exponent." },',
  '            { "id":"q4","type":"code_bug","language":"python","marks":4,',
  '              "prompt":"What is wrong?","code":"def f(n): print(n); f(n-1)",',
  '              "answer":"Missing base case → infinite recursion.",',
  '              "keywords":["base","case","overflow"] },',
  '            { "id":"q5","type":"code_fill","language":"python","marks":4,',
  '              "prompt":"Fill in the blanks","code":"def fact(n):\\n  if n<=1: return ___\\n  return n*fact(___)",',
  '              "answer":"1; n-1","keywords":["1","n-1"] }',
  '          ]',
  '        }',
  '      ]',
  '    }',
  '  ]',
  '}',
  '',
  'Question types: mcq, tf, define, explain, short_essay, long_essay,',
  'code_output, code_write, code_bug, code_fill, code_trace'
].join('\n');

/* ============ APP SHELL ============ */
function App(){
  const [state,setStateRaw] = useState(loadState);
  const setState=(s)=>{
    if (typeof s === 'function'){
      setStateRaw(prev=>{
        const next = s(prev);
        saveState(next);
        return next;
      });
    } else {
      setStateRaw(s);
      saveState(s);
    }
  };
  const [bootSession] = useState(()=> loadSession() || {});
  const [view,setView] = useState(bootSession.view || 'home');
  const [conceptId,setConceptId] = useState(bootSession.conceptId || null);
  const [quiz,setQuiz] = useState(bootSession.quiz || null);
  const [feynmanId,setFeynmanId] = useState(bootSession.feynmanId || null);
  const [saveMsg, setSaveMsg] = useState('');
  const [toasts, setToasts] = useState([]);

  const ALL_MODULES = [...BUILTIN, ...(state.customModules||[])];
  const mod = ALL_MODULES.find(m=>m.id===state.currentModuleId) || ALL_MODULES[0];
  const playerLvl = levelFromXp(state.xp||0).level;

  const addToast = (msg, type='info')=>{
    const id = Date.now() + Math.random();
    setToasts(prev=>[...prev, {id, msg, type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)), 2800);
  };
  const showXpChip = (amount)=> addToast('+'+amount+' XP', 'xp');

  const goConcept = (cid)=>{ setConceptId(cid); setView('concept'); };
  const startQuiz = ({questions,title,mode,durationMin})=>{
    setQuiz({questions,title,mode: mode||'study', durationMin}); setView('quiz');
  };

  const concept = conceptId ? mod.levels.flatMap(l=>l.concepts).find(c=>c.id===conceptId) : null;
  const conceptLevel = concept ? mod.levels.find(l=>l.concepts.some(c=>c.id===concept.id)) : null;
  const feynmanConcept = feynmanId ? mod.levels.flatMap(l=>l.concepts).find(c=>c.id===feynmanId) : null;

  const onPomoComplete = ()=>{
    const dk=dayKey(); const s={...state, pomodoro:{...(state.pomodoro||{}), [dk]:(state.pomodoro?.[dk]||0)+1}};
    setState(updateStreak(s));
  };

  useEffect(()=>{
    saveSession({ view, conceptId, quiz, feynmanId });
  }, [view, conceptId, quiz, feynmanId]);

  // Level-up watcher: bump pendingLevelUps when level transitions upward
  useEffect(()=>{
    const cur = levelFromXp(state.xp || 0).level;
    const last = state.lastSeenLevel || 0;
    if (cur > last){
      const gained = cur - last;
      setState(s => ({...s, pendingLevelUps: (s.pendingLevelUps || 0) + gained, lastSeenLevel: cur}));
    }
  }, [state.xp]);

  const manualSave = ()=>{
    saveState(state);
    saveSession({ view, conceptId, quiz, feynmanId });
    setSaveMsg('Saved');
    setTimeout(()=>setSaveMsg(''), 1600);
  };

  // Splash screen on first launch (or when user requests mode pick)
  if (!state.appMode){
    return <SplashScreen state={state} setState={setState}/>;
  }

  const isArena = state.appMode==='arena';
  const mainView = isArena && ['home','study','pass','exam','daily','due','interleaved','concept','quiz','feynmanSession'].includes(view)
    ? 'arena'
    : view;
  const switchMode = ()=>{
    // Land on a safe view in the new mode
    setView('home');
    setConceptId(null);
    setState({...state, appMode: isArena ? 'normal' : 'arena'});
  };
  const goSplash = ()=>{ setState({...state, appMode:null}); clearSession(); };

  return (
    <div className={`app ${isArena ? 'theme-tactical' : 'theme-premium'}`}>
      <header className={'topbar'+(isArena?' mode-arena':' mode-normal')}>
        <div className="topbar-main">
          <div className="brand" onClick={goSplash} style={{cursor:'pointer'}} title="Back to mode picker">
            <div className="dot"/><h1>StudyBuddy{isArena && <span className="brand-badge">ARENA</span>}</h1>
          </div>
          <select className="module-select" value={state.currentModuleId} onChange={e=>{ setState({...state, currentModuleId:e.target.value}); setView('home'); setConceptId(null); }}>
            {ALL_MODULES.map(m=> <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <nav className="topnav">
            {!isArena && (()=>{
              // Study side: 4 parent groups, sub-tab strip rendered below the topbar.
              const STUDY_NAV = [
                { id:'learn',    label:'Learn',    icon:'📚', def:'home',
                  children:[
                    {id:'home',        label:'Home',   icon:'🏠'},
                    {id:'study',       label:'Study',  icon:'📚'},
                    {id:'daily',       label:'Daily',  icon:'📅'},
                    {id:'due',         label:'Review', icon:'🔁'},
                    {id:'interleaved', label:'Mixed',  icon:'🔀'},
                  ]},
                { id:'exam',     label:'Exam',     icon:'📝', def:'exam',
                  children:[
                    {id:'exam', label:'Exam',        icon:'📝'},
                    {id:'pass', label:'Pass Sprint', icon:'🚦'},
                  ]},
                { id:'library',  label:'Library',  icon:'📖', def:'library',
                  children:[ {id:'library', label:'Library', icon:'📖'} ]},
                { id:'progress', label:'Progress', icon:'📊', def:'stats',
                  children:[
                    {id:'stats',     label:'Stats',     icon:'📈'},
                    {id:'deadlines', label:'Deadlines', icon:'⏰'},
                    {id:'grades',    label:'Grades',    icon:'📊'},
                    {id:'modules',   label:'Modules',   icon:'📦'},
                  ]},
              ];
              const activeParent = STUDY_NAV.find(p => p.children.some(c => c.id === view)) || STUDY_NAV[0];
              return STUDY_NAV.map(p => (
                <button key={p.id}
                  className={p.id===activeParent.id ? 'active' : ''}
                  onClick={()=>setView(p.def)}>
                  <span className="emoji">{p.icon}</span>{p.label}
                </button>
              ));
            })()}
            {isArena && <>
              <button className={mainView==='arena'?'active':''} onClick={()=>setView('arena')}><span className="emoji">⚔️</span>Arena</button>
              <button className={view==='library'?'active':''} onClick={()=>setView('library')}><span className="emoji">📚</span>Library</button>
              <button className={view==='stats'?'active':''} onClick={()=>setView('stats')}><span className="emoji">📈</span>Stats</button>
              <button className={view==='deadlines'?'active':''} onClick={()=>setView('deadlines')}><span className="emoji">⏰</span>Deadlines</button>
              <button className={view==='modules'?'active':''} onClick={()=>setView('modules')}><span className="emoji">📦</span>Modules</button>
            </>}
          </nav>
          <div className="topbar-status">
            {isArena && <span className="hdr-chip" title="Insights — earned by reading in the Library">💡 <span className="hdr-chip-num">{state.insights||0}</span></span>}
            <StreakChip state={state}/>
            <PomoChip onComplete={onPomoComplete}/>
            <button className="btn ghost sm" onClick={manualSave} title="Save now">💾 Save</button>
            {saveMsg && <span className="tiny" style={{color:'var(--ok)'}}>{saveMsg}</span>}
            <button className="btn ghost sm" onClick={switchMode} title="Switch mode">{isArena?'📚 Study':'⚔️ Arena'}</button>
          </div>
        </div>
        {!isArena && (()=>{
          // Sub-tab strip — children of the active parent group. Hidden when only one child.
          const STUDY_SUBNAV = {
            home:        ['home','study','daily','due','interleaved'],
            study:       ['home','study','daily','due','interleaved'],
            daily:       ['home','study','daily','due','interleaved'],
            due:         ['home','study','daily','due','interleaved'],
            interleaved: ['home','study','daily','due','interleaved'],
            exam: ['exam','pass'],
            pass: ['exam','pass'],
            stats:     ['stats','deadlines','grades','modules'],
            deadlines: ['stats','deadlines','grades','modules'],
            grades:    ['stats','deadlines','grades','modules'],
            modules:   ['stats','deadlines','grades','modules'],
          };
          const SUBLABELS = {
            home:'🏠 Home', study:'📚 Study', daily:'📅 Daily', due:'🔁 Review', interleaved:'🔀 Mixed',
            exam:'📝 Exam', pass:'🚦 Pass Sprint',
            stats:'📈 Stats', deadlines:'⏰ Deadlines', grades:'📊 Grades', modules:'📦 Modules',
          };
          const children = STUDY_SUBNAV[view];
          if (!children || children.length < 2) return null;
          return (
            <div className="topbar-subnav">
              {children.map(id => (
                <button key={id}
                  className={'topbar-subnav-btn'+(view===id?' active':'')}
                  onClick={()=>setView(id)}>{SUBLABELS[id] || id}</button>
              ))}
            </div>
          );
        })()}
        <div className="topbar-topics">
          <span className="topbar-topics-label">Topics</span>
          <div className="topics-strip">
            {mod.levels.map(lv=>(
              <React.Fragment key={lv.id}>
                <span className="topics-group">{lv.name}</span>
                {lv.concepts.map(c=>(
                  <button key={c.id} className={'topic-pill'+(conceptId===c.id?' active':'')} onClick={()=>goConcept(c.id)}>{c.name}</button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>
      <main>
        {mainView==='home' && <Home mod={mod} setView={setView} state={state} goConcept={goConcept}/>}
        {mainView==='study' && <StudyPicker mod={mod} onStart={startQuiz} goConcept={goConcept}/>}
        {mainView==='pass' && <StudyPassHub mod={mod} state={state} onStart={startQuiz} onBack={()=>setView('home')}/>}
        {mainView==='exam' && <ExamPicker mod={mod} onStart={startQuiz}/>}
        {mainView==='arena' && <ArenaView mod={mod} state={state} setState={setState} onNavigate={setView}/>}
        {mainView==='library' && <LibraryView mod={mod} state={state} setState={setState}/>}
        {mainView==='daily' && <DailyView mod={mod} onStart={startQuiz} setView={setView} state={state} goConcept={goConcept}/>}
        {mainView==='due' && <DueReview mod={mod} onStart={startQuiz} state={state}/>}
        {mainView==='interleaved' && <InterleavedView mod={mod} onStart={startQuiz}/>}
        {mainView==='concept' && concept && conceptLevel && (
          <ConceptTeach concept={concept} moduleLabel={mod.name+' \u00B7 '+conceptLevel.name}
            onStartStudy={()=>{
              const qs = concept.questions.map(q=>({...q, conceptId:concept.id, conceptName:concept.name, levelName:conceptLevel.name, conceptNotes:concept.notes}));
              startQuiz({questions:qs, title:'Study \u2014 '+concept.name, mode:'study'});
            }}
            onStartFeynman={()=>{ setFeynmanId(concept.id); setView('feynmanSession'); }}
            state={state} setState={setState}/>
        )}
        {mainView==='feynmanSession' && feynmanConcept && <FeynmanSession concept={feynmanConcept} onExit={()=>setView('home')} state={state} setState={setState}/>}
        {mainView==='quiz' && quiz && <QuizRunner questions={quiz.questions} title={quiz.title} mode={quiz.mode} durationMin={quiz.durationMin} onExit={()=>{ setQuiz(null); setView('home'); }} state={state} setState={setState}/>}
        {mainView==='stats' && <Stats state={state}/>}
        {mainView==='deadlines' && <DeadlinesView state={state} setState={setState}/>}
        {mainView==='grades' && <GradesView/>}
        {mainView==='modules' && <Modules state={state} setState={setState} BUILTIN={BUILTIN} setCurrent={(id)=>{setState({...state,currentModuleId:id}); setView('home'); setConceptId(null);}}/>}
      </main>
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t=>(
            <div key={t.id} className={'toast '+t.type}>{t.msg}</div>
          ))}
        </div>
      )}
      {(state.pendingLevelUps || 0) > 0 && <LevelUpModal state={state} setState={setState}/>}
    </div>
  );
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
} catch(e){
  document.getElementById('root').innerHTML = '<div style="padding:40px;color:#fff;background:#1a1a2e;font-family:monospace;font-size:14px;line-height:1.6"><h2 style="color:#f87171">Boot Error</h2><pre style="white-space:pre-wrap;color:#fbbf24">'+(e && e.stack ? e.stack : String(e))+'</pre></div>';
  throw e;
}
window.addEventListener('error', function(ev){
  if (document.getElementById('root') && !document.getElementById('root').children.length){
    document.getElementById('root').innerHTML = '<div style="padding:40px;color:#fff;background:#1a1a2e;font-family:monospace;font-size:14px;line-height:1.6"><h2 style="color:#f87171">Runtime Error</h2><pre style="white-space:pre-wrap;color:#fbbf24">'+(ev.error && ev.error.stack ? ev.error.stack : ev.message)+'</pre></div>';
  }
});
</script>
</body>
</html>
