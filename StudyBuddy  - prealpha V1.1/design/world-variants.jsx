/* World Map — 4 variant artboards for selection */

const Bracket = ({ children }) => (
  <div className="panel panel-corners" style={{padding:0}}>{children}</div>
);

/* ───────── Shared bits ───────── */
const Chip = ({ children, color }) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em',
    textTransform:'uppercase', padding:'1px 5px',
    border:`1px solid ${color || 'var(--line-2)'}`,
    color: color || 'var(--fg-2)', background:'var(--bg-1)'
  }}>{children}</span>
);

const Bar = ({ pct, color }) => (
  <div style={{height:4, background:'var(--bg-3)', border:'1px solid var(--line)', position:'relative'}}>
    <div style={{height:'100%', width:`${pct}%`, background: color || 'var(--accent)'}} />
  </div>
);

/* ──────────────────────────────────────────────
   VARIANT A — Tactical node graph (FM fixture)
   ────────────────────────────────────────────── */
function VariantA() {
  // Module: NEUR-301 // Memory & Cognition. Nodes form a branching path.
  const nodes = [
    { id:'n1', x: 80,  y: 240, type:'start',  label:'INTAKE',     status:'cleared' },
    { id:'n2', x: 220, y: 160, type:'study',  label:'CH.1 Encoding', status:'cleared' },
    { id:'n3', x: 220, y: 320, type:'fight',  label:'CH.1 Recall',   status:'cleared' },
    { id:'n4', x: 360, y: 100, type:'fight',  label:'CH.2 Storage',  status:'active'  },
    { id:'n5', x: 360, y: 240, type:'event',  label:'EVENT: Cache',  status:'open'    },
    { id:'n6', x: 360, y: 380, type:'study',  label:'CH.2 Retrieval',status:'open'    },
    { id:'n7', x: 500, y: 160, type:'elite',  label:'ELITE: Glitch', status:'open'    },
    { id:'n8', x: 500, y: 320, type:'shop',   label:'ARMORY',        status:'open'    },
    { id:'n9', x: 640, y: 240, type:'boss',   label:'BOSS: Forgetting', status:'locked' },
  ];
  const edges = [
    ['n1','n2'],['n1','n3'],['n2','n4'],['n2','n5'],['n3','n5'],['n3','n6'],
    ['n4','n7'],['n5','n7'],['n5','n8'],['n6','n8'],['n7','n9'],['n8','n9']
  ];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const typeIco = {
    start: '◆', study: '◊', fight: '✕', event: '?', elite: '✺', shop: '$', boss: '☠'
  };
  const typeColor = {
    start:'var(--fg-1)', study:'var(--accent)', fight:'var(--hp)',
    event:'var(--insight)', elite:'var(--t-epic)', shop:'var(--insight)', boss:'var(--t-mythic)'
  };
  return (
    <div style={{width:'100%', height:'100%', display:'grid', gridTemplateColumns:'240px 1fr 240px', gridTemplateRows:'40px 1fr 28px', background:'var(--bg-1)'}}>
      {/* topbar */}
      <div style={{gridColumn:'1 / -1', display:'flex', alignItems:'center', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--fg-2)'}}>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)', color:'var(--accent)'}}>◢ STUDYBUDDY <span style={{color:'var(--fg-3)', marginLeft:8}}>v0.7.4</span></div>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)', color:'var(--fg)'}}>WORLD</div>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)'}}>ARSENAL</div>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)'}}>STUDY</div>
        <div style={{padding:'0 16px'}}>STATS</div>
        <div style={{flex:1}}/>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg)'}}>HP <b style={{color:'var(--accent)'}}>84/100</b></div>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg)'}}>STREAK <b style={{color:'var(--accent)'}}>×12</b></div>
      </div>

      {/* left rail — modules */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', padding:'14px'}}>
        <div className="cap cap-line" style={{marginBottom:10}}>MODULES <span/></div>
        {[
          ['NEUR-301', 'Memory & Cognition', 64, true],
          ['BIO-204',  'Cell Biology', 32, false],
          ['HIST-110', 'Modernity', 18, false],
          ['MATH-220', 'Linear Algebra', 0, false],
        ].map(([code, name, prog, active], i) => (
          <div key={i} style={{
            padding:'10px 10px', marginBottom:6,
            background: active ? 'linear-gradient(90deg, var(--accent-soft), transparent 70%)' : 'var(--bg-3)',
            border:`1px solid ${active ? 'var(--accent-line)' : 'var(--line)'}`,
            cursor:'pointer'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', color: active ? 'var(--accent)' : 'var(--fg-3)'}}>{code}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>{prog}%</div>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:2, marginBottom:6}}>{name}</div>
            <Bar pct={prog} color={active?'var(--accent)':'var(--fg-3)'} />
          </div>
        ))}

        <div className="cap cap-line" style={{marginTop:18, marginBottom:10}}>LEGEND <span/></div>
        {[['◊','STUDY','var(--accent)'],['✕','FIGHT','var(--hp)'],['?','EVENT','var(--insight)'],['✺','ELITE','var(--t-epic)'],['$','ARMORY','var(--insight)'],['☠','BOSS','var(--t-mythic)']].map(([g,l,c],i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:8, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', padding:'2px 0'}}>
            <span style={{width:14, textAlign:'center', color:c}}>{g}</span>{l}
          </div>
        ))}
      </div>

      {/* main map */}
      <div style={{position:'relative', overflow:'hidden', background:'radial-gradient(60% 60% at 50% 40%, rgba(125,216,125,0.04), transparent 70%), var(--bg-1)'}}>
        {/* breadcrumbs / header */}
        <div style={{position:'absolute', top:14, left:18, right:18, display:'flex', justifyContent:'space-between', alignItems:'flex-start', zIndex:3}}>
          <div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>NEUR-301 // CHAPTER 2</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginTop:2}}>Memory Storage Mechanisms</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.08em', marginTop:4}}>
              MIDTERM IN <b style={{color:'var(--insight)'}}>11 DAYS</b> · 38 / 64 NODES CLEARED
            </div>
          </div>
          <div style={{display:'flex', gap:6}}>
            <Chip>OFFLINE</Chip>
            <Chip color="var(--accent-line)">SYNC OK</Chip>
          </div>
        </div>

        {/* map grid */}
        <svg viewBox="0 0 720 460" preserveAspectRatio="xMidYMid meet" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
          <defs>
            <pattern id="vag" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="720" height="460" fill="url(#vag)"/>
          {/* edges */}
          {edges.map(([a,b],i)=>{
            const A = byId[a], B = byId[b];
            const cleared = A.status==='cleared' && (B.status==='cleared'||B.status==='active');
            return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke={cleared?'var(--accent)':'var(--line-2)'}
              strokeWidth={cleared?1.5:1}
              strokeDasharray={cleared?'':'3 3'}/>
          })}
          {/* nodes */}
          {nodes.map(n=>{
            const c = typeColor[n.type];
            const isActive = n.status === 'active';
            const isLocked = n.status === 'locked';
            const isCleared = n.status === 'cleared';
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                {isActive && <circle r="22" fill="none" stroke={c} strokeOpacity="0.3" strokeWidth="1"><animate attributeName="r" from="18" to="28" dur="1.6s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite"/></circle>}
                <rect x="-14" y="-14" width="28" height="28"
                  transform="rotate(45)"
                  fill={isCleared?'var(--bg-3)':isActive?'var(--bg-2)':isLocked?'var(--bg-1)':'var(--bg-2)'}
                  stroke={isLocked?'var(--line-2)':c}
                  strokeWidth={isActive?2:1}
                  opacity={isLocked?0.4:1}/>
                <text x="0" y="5" textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="14" fontWeight="600"
                  fill={isLocked?'var(--fg-3)':c}>{typeIco[n.type]}</text>
                <text x="0" y="34" textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9" letterSpacing="2"
                  fill={isActive?'var(--fg)':isLocked?'var(--fg-3)':'var(--fg-2)'}>
                  {n.label.toUpperCase()}
                </text>
                {isCleared && <text x="0" y="-22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--accent)" letterSpacing="2">✓ CLEAR</text>}
              </g>
            );
          })}
        </svg>

        {/* watermark */}
        <div style={{position:'absolute', bottom:14, left:18, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-4)'}}>
          MAP.NEUR-301.CH02 / SECTOR_05 · GRID 20PX
        </div>
      </div>

      {/* right rail — selected node detail */}
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', padding:'14px', display:'flex', flexDirection:'column'}}>
        <div className="cap cap-line" style={{marginBottom:10}}>SELECTED <span/></div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.18em'}}>FIGHT · ACTIVE</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>CH.2 Storage</div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', marginTop:4, letterSpacing:'0.06em'}}>4 enemies · est. 6 turns · drops 240 XP</div>

        <div style={{
          marginTop:12, height:120, border:'1px solid var(--line)',
          background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10
        }}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>ENEMY PREVIEW</span>
        </div>

        <div style={{marginTop:14}}>
          <div className="cap cap-line" style={{marginBottom:8}}>ROSTER <span/></div>
          {[['Bookworm','LV.4','common'],['Bookworm','LV.4','common'],['Paper Imp','LV.5','rare'],['Glitch Wraith','LV.6','epic']].map((r,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
              <span>{r[0]}</span>
              <span style={{display:'flex', gap:6, alignItems:'center'}}>
                <span style={{color:'var(--fg-3)', fontSize:9, letterSpacing:'0.1em'}}>{r[1]}</span>
                <Chip color={`var(--t-${r[2]})`}>{r[2].toUpperCase()}</Chip>
              </span>
            </div>
          ))}
        </div>

        <div style={{marginTop:14}}>
          <div className="cap cap-line" style={{marginBottom:8}}>REWARDS <span/></div>
          {[['XP','+240'],['Insight','+12'],['Augment Slot','×1'],['Concept: Engram','UNLOCK']].map((r,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)'}}>
              <span style={{color:'var(--fg-3)'}}>{r[0]}</span>
              <span>{r[1]}</span>
            </div>
          ))}
        </div>

        <div style={{flex:1}}/>
        <button style={{
          marginTop:14, padding:'12px', background:'var(--accent)', color:'var(--bg-1)',
          border:'none', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600,
          letterSpacing:'0.18em', cursor:'pointer'
        }}>► ENGAGE</button>
      </div>

      {/* status bar */}
      <div style={{gridColumn:'1 / -1', borderTop:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', padding:'0 16px', gap:18, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)', textTransform:'uppercase'}}>
        <span><span className="blink" style={{display:'inline-block', width:6, height:6, background:'var(--accent)', marginRight:6}}/>READY</span>
        <span>NODE n4 · CH.2 STORAGE</span>
        <span style={{flex:1}}/>
        <span>VARIANT A · NODE GRAPH</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   VARIANT B — Vertical chapter timeline (lightdash)
   ────────────────────────────────────────────── */
function VariantB() {
  const chapters = [
    { num:1, name:'Encoding', status:'cleared', nodes:[1,1,1,1], xp:480 },
    { num:2, name:'Storage Mechanisms', status:'active',  nodes:[1,1,'•',0], xp:240 },
    { num:3, name:'Retrieval Cues',  status:'open',     nodes:[0,0,0,0], xp:0 },
    { num:4, name:'Forgetting Curves',status:'open',     nodes:[0,0,0,0], xp:0 },
    { num:5, name:'Distortion',      status:'open',     nodes:[0,0,0,0], xp:0 },
    { num:6, name:'Final Boss: Synthesis', status:'locked', nodes:[0,0,0], xp:0 },
  ];
  return (
    <div style={{width:'100%', height:'100%', display:'grid', gridTemplateColumns:'260px 1fr', gridTemplateRows:'40px 1fr', background:'var(--bg-1)'}}>
      {/* topbar */}
      <div style={{gridColumn:'1 / -1', display:'flex', alignItems:'center', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase'}}>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)', color:'var(--accent)'}}>◢ STUDYBUDDY</div>
        <div style={{padding:'0 16px', color:'var(--fg)'}}>WORLD / NEUR-301</div>
        <div style={{flex:1}}/>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg-2)'}}>HP 84/100</div>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg-2)'}}>×12</div>
      </div>

      {/* left nav — chapter sidebar */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto'}}>
        <div style={{padding:'18px 16px 12px', borderBottom:'1px solid var(--line)'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.22em', color:'var(--fg-3)'}}>MODULE</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:4}}>NEUR-301</div>
          <div style={{fontFamily:'var(--font-body)', fontSize:11, color:'var(--fg-2)', marginTop:2}}>Memory & Cognition</div>
          <div style={{marginTop:10, display:'flex', alignItems:'center', gap:8, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>
            <span>59%</span>
            <Bar pct={59} />
          </div>
        </div>

        {chapters.map(c=>{
          const sel = c.status==='active';
          return (
            <div key={c.num} style={{
              padding:'12px 14px', borderBottom:'1px solid var(--line)',
              background: sel ? 'linear-gradient(90deg, var(--accent-soft), transparent 80%)' : 'transparent',
              cursor:'pointer', position:'relative'
            }}>
              {sel && <div style={{position:'absolute', left:0, top:0, bottom:0, width:2, background:'var(--accent)'}}/>}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color: sel?'var(--accent)':'var(--fg-3)'}}>CH.{String(c.num).padStart(2,'0')}</div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.1em'}}>
                  {c.status === 'cleared' && <span style={{color:'var(--accent)'}}>✓ CLEAR</span>}
                  {c.status === 'active'  && <span style={{color:'var(--accent)'}}>⌬ ACTIVE</span>}
                  {c.status === 'open'    && <span>OPEN</span>}
                  {c.status === 'locked'  && <span>LOCKED</span>}
                </div>
              </div>
              <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:3, color: c.status==='locked'?'var(--fg-3)':'var(--fg)'}}>{c.name}</div>
              <div style={{display:'flex', gap:3, marginTop:8}}>
                {c.nodes.map((n,i)=>(
                  <div key={i} style={{
                    flex:1, height:4,
                    background: n===1?'var(--accent)':n==='•'?'var(--insight)':'var(--bg-3)',
                    border:'1px solid var(--line)'
                  }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* main — current chapter dashboard */}
      <div style={{padding:'24px 28px', overflow:'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18}}>
          <div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>CHAPTER 2 / 6 · ACTIVE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, marginTop:4, letterSpacing:'-0.01em'}}>Storage Mechanisms</div>
            <div style={{fontFamily:'var(--font-body)', fontSize:13, color:'var(--fg-2)', marginTop:6, maxWidth:520}}>
              Long-term consolidation, hippocampal indexing, sleep-dependent transfer. 4 nodes total — 2 cleared, 1 in progress.
            </div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <Chip>11D TO MIDTERM</Chip>
            <Chip color="var(--accent-line)">SYNCED</Chip>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:'1px solid var(--line)', marginBottom:18}}>
          {[
            ['NODES CLEARED','2/4','var(--accent)'],
            ['BEST STREAK','×24','var(--fg)'],
            ['INSIGHT','142','var(--insight)'],
            ['MISTAKES','7 → 2','var(--hp)'],
          ].map(([k,v,c],i)=>(
            <div key={i} style={{padding:'14px 16px', borderRight: i<3?'1px solid var(--line)':'none', background:'var(--bg-2)'}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>{k}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, marginTop:2, color:c}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Node list */}
        <div className="cap cap-line" style={{marginBottom:10}}>NODES <span/></div>
        <div style={{border:'1px solid var(--line)', background:'var(--bg-2)'}}>
          {[
            { n:'2.1', name:'Encoding → Storage', type:'STUDY', status:'CLEARED', xp:'+80', acc:'94%' },
            { n:'2.2', name:'Hippocampal Indexing', type:'FIGHT', status:'CLEARED', xp:'+160', acc:'88%' },
            { n:'2.3', name:'Sleep Consolidation', type:'FIGHT', status:'ACTIVE', xp:'+240', acc:'—' },
            { n:'2.4', name:'Retrieval Pathways', type:'ELITE', status:'LOCKED', xp:'+400', acc:'—' },
          ].map((r,i)=>{
            const active = r.status==='ACTIVE';
            const cleared = r.status==='CLEARED';
            return (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'48px 80px 1fr 100px 80px 80px 100px',
                alignItems:'center', padding:'12px 16px',
                borderBottom: i<3?'1px solid var(--line)':'none',
                background: active?'linear-gradient(90deg, var(--accent-soft), transparent 60%)':'transparent',
                cursor:'pointer'
              }}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: active?'var(--accent)':'var(--fg-3)', letterSpacing:'0.1em'}}>{r.n}</span>
                <Chip color={r.type==='STUDY'?'var(--accent-line)':r.type==='FIGHT'?'var(--line-3)':'var(--t-epic)'}>{r.type}</Chip>
                <span style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color: r.status==='LOCKED'?'var(--fg-3)':'var(--fg)'}}>{r.name}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: cleared?'var(--accent)':active?'var(--accent)':'var(--fg-3)', letterSpacing:'0.14em'}}>
                  {cleared && '✓ '}{r.status}
                </span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)'}}>{r.xp} XP</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: parseFloat(r.acc) >= 90?'var(--accent)':'var(--fg-2)'}}>{r.acc}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: active?'var(--accent)':'var(--fg-3)', letterSpacing:'0.18em', textAlign:'right'}}>
                  {active ? '► ENGAGE' : cleared ? 'REPLAY' : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   VARIANT C — 3-column board (modules / chapter / preview)
   ────────────────────────────────────────────── */
function VariantC() {
  return (
    <div style={{width:'100%', height:'100%', display:'grid', gridTemplateColumns:'260px 1fr 320px', gridTemplateRows:'40px 1fr', background:'var(--bg-1)'}}>
      <div style={{gridColumn:'1 / -1', display:'flex', alignItems:'center', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase'}}>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)', color:'var(--accent)'}}>◢ STUDYBUDDY</div>
        <div style={{padding:'0 16px', color:'var(--fg)'}}>WORLD</div>
        <div style={{flex:1}}/>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg-2)'}}>HP 84 · ×12 · 142 INS</div>
      </div>

      {/* col 1 — modules */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', padding:'14px', overflow:'auto'}}>
        <div className="cap cap-line" style={{marginBottom:10}}>MODULES <span/></div>
        {['NEUR-301','BIO-204','HIST-110','MATH-220','PHIL-150'].map((m,i)=>(
          <div key={i} style={{
            padding:'12px 12px', marginBottom:6,
            background: i===0 ? 'linear-gradient(90deg, var(--accent-soft), transparent 80%)' : 'var(--bg-3)',
            border:`1px solid ${i===0 ? 'var(--accent-line)' : 'var(--line)'}`,
            cursor:'pointer'
          }}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color: i===0?'var(--accent)':'var(--fg-3)'}}>{m}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:3}}>
              {['Memory & Cognition','Cell Biology','Modernity','Linear Algebra','Ethics I'][i]}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>
              <span>{[59,32,18,0,12][i]}%</span>
              <span style={{color:'var(--fg-3)'}}>{['11d','24d','—','3d','7d'][i]}</span>
            </div>
            <Bar pct={[59,32,18,0,12][i]} color={i===0?'var(--accent)':'var(--fg-3)'} />
          </div>
        ))}
      </div>

      {/* col 2 — chapter board */}
      <div style={{padding:'18px 20px', overflow:'auto'}}>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>NEUR-301 / 6 CHAPTERS</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, marginTop:2, marginBottom:14}}>Memory & Cognition</div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {[
            { n:1, name:'Encoding', s:'cleared', p:100 },
            { n:2, name:'Storage', s:'active', p:50 },
            { n:3, name:'Retrieval', s:'open', p:0 },
            { n:4, name:'Forgetting', s:'open', p:0 },
            { n:5, name:'Distortion', s:'open', p:0 },
            { n:6, name:'Synthesis', s:'locked', p:0 },
          ].map(c=>{
            const active = c.s==='active';
            return (
              <div key={c.n} style={{
                border:`1px solid ${active?'var(--accent-line)':'var(--line)'}`,
                background: active?'linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--bg-2)':'var(--bg-2)',
                padding:'14px', cursor:'pointer', position:'relative'
              }}>
                {active && <span style={{position:'absolute', top:8, right:8, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--accent)'}}>● ACTIVE</span>}
                {c.s==='cleared' && <span style={{position:'absolute', top:8, right:8, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--accent)'}}>✓ CLEAR</span>}
                {c.s==='locked' && <span style={{position:'absolute', top:8, right:8, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>⌧ LOCK</span>}
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color:'var(--fg-3)'}}>CH.{String(c.n).padStart(2,'0')}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:6, color: c.s==='locked'?'var(--fg-3)':'var(--fg)'}}>{c.name}</div>
                <div style={{display:'flex', gap:3, marginTop:14}}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{
                      flex:1, height:6,
                      background: i < (c.p/25) ? (active?'var(--accent)':'var(--fg-2)') : 'var(--bg-3)',
                      border:'1px solid var(--line)'
                    }}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* col 3 — preview */}
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', padding:'14px', display:'flex', flexDirection:'column'}}>
        <div className="cap cap-line" style={{marginBottom:10}}>NEXT FIGHT <span/></div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color:'var(--accent)'}}>CH.2 · NODE 2.3</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>Sleep Consolidation</div>

        <div style={{
          marginTop:12, height:140, border:'1px solid var(--line)',
          background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>BIOME PREVIEW</span>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, marginTop:12, border:'1px solid var(--line)'}}>
          {[['ENEMIES','4'],['EST. TURNS','6'],['XP','+240'],['DROP','RARE+']].map(([k,v],i)=>(
            <div key={i} style={{padding:'8px 10px', borderRight:i%2===0?'1px solid var(--line)':'none', borderBottom:i<2?'1px solid var(--line)':'none'}}>
              <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)'}}>{k}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:14, color:'var(--fg)', marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{flex:1}}/>
        <button style={{padding:'12px', background:'var(--accent)', color:'var(--bg-1)', border:'none', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600, letterSpacing:'0.18em'}}>► ENGAGE</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   VARIANT D — Isometric pixel-art map
   ────────────────────────────────────────────── */
function VariantD() {
  // Iso tiles using simple 2.5D CSS transforms
  const tiles = [];
  for (let y=0; y<8; y++) for (let x=0; x<10; x++){
    const isPath = [
      [0,3],[1,3],[2,3],[2,2],[3,2],[3,1],[4,1],[4,2],[5,2],[5,3],[6,3],[6,4],[7,4],[8,4],[8,3],[9,3]
    ].some(([px,py])=>px===x && py===y);
    tiles.push({ x, y, path:isPath });
  }
  const nodes = [
    { x:0, y:3, type:'start', label:'START' },
    { x:2, y:3, type:'study', label:'CH.1', cleared:true },
    { x:3, y:1, type:'fight', label:'CH.2', active:true },
    { x:5, y:2, type:'event', label:'EVENT' },
    { x:6, y:4, type:'elite', label:'ELITE' },
    { x:8, y:3, type:'shop',  label:'ARMORY' },
    { x:9, y:3, type:'boss',  label:'BOSS' },
  ];
  const TILE = 56;
  return (
    <div style={{width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1fr 280px', gridTemplateRows:'40px 1fr', background:'var(--bg-1)'}}>
      <div style={{gridColumn:'1 / -1', display:'flex', alignItems:'center', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase'}}>
        <div style={{padding:'0 16px', borderRight:'1px solid var(--line)', color:'var(--accent)'}}>◢ STUDYBUDDY</div>
        <div style={{padding:'0 16px', color:'var(--fg)'}}>WORLD / NEUR-301 / CH.2</div>
        <div style={{flex:1}}/>
        <div style={{padding:'0 16px', borderLeft:'1px solid var(--line)', color:'var(--fg-2)'}}>HP 84 · ×12</div>
      </div>

      <div style={{position:'relative', overflow:'hidden', background:'radial-gradient(60% 60% at 50% 50%, rgba(125,216,125,0.06), transparent 70%), var(--bg-1)'}}>
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%, -50%) rotateX(60deg) rotateZ(-45deg)',
          transformStyle:'preserve-3d',
          width: TILE * 10, height: TILE * 8
        }}>
          {/* tiles */}
          {tiles.map(t=>(
            <div key={t.x+','+t.y} style={{
              position:'absolute',
              left: t.x * TILE,
              top: t.y * TILE,
              width: TILE - 2,
              height: TILE - 2,
              background: t.path ? 'linear-gradient(180deg, var(--bg-3), var(--bg-2))' : 'var(--bg-1)',
              border: t.path ? '1px solid var(--accent-line)' : '1px solid var(--line)',
              boxShadow: t.path ? 'inset 0 0 0 1px rgba(125,216,125,0.05)' : 'none'
            }}/>
          ))}
          {/* nodes */}
          {nodes.map((n,i)=>(
            <div key={i} style={{
              position:'absolute',
              left: n.x * TILE + TILE/2 - 14,
              top: n.y * TILE + TILE/2 - 14,
              width:28, height:28,
              transform:'translateZ(20px) rotateZ(45deg) rotateX(-60deg)',
              background: n.active ? 'var(--accent)' : n.cleared ? 'var(--bg-3)' : 'var(--bg-2)',
              border:`2px solid ${n.active?'var(--accent)':n.type==='boss'?'var(--t-mythic)':n.type==='elite'?'var(--t-epic)':'var(--line-3)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700,
              color: n.active ? 'var(--bg-1)' : n.cleared?'var(--accent)':'var(--fg-2)'
            }}>
              {n.type==='start'?'◆':n.type==='study'?'◊':n.type==='fight'?'✕':n.type==='event'?'?':n.type==='elite'?'✺':n.type==='shop'?'$':'☠'}
            </div>
          ))}
        </div>

        <div style={{position:'absolute', top:14, left:18, zIndex:3}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>NEUR-301 / SECTOR 02</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginTop:2}}>Storage Mechanisms</div>
        </div>
        <div style={{position:'absolute', bottom:14, left:18, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-4)'}}>
          ISO_45 · 10×8 GRID
        </div>
      </div>

      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', padding:'14px'}}>
        <div className="cap cap-line" style={{marginBottom:10}}>SELECTED <span/></div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.18em'}}>CH.2 · ACTIVE</div>
        <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>Storage</div>
        <div style={{
          marginTop:12, height:120, border:'1px solid var(--line)',
          background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>SCENE PREVIEW</span>
        </div>
        <div style={{marginTop:12}}>
          {[['Enemies','4'],['Turns','~6'],['XP','+240']].map((r,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
              <span style={{color:'var(--fg-3)'}}>{r[0]}</span><span>{r[1]}</span>
            </div>
          ))}
        </div>
        <button style={{
          marginTop:14, padding:'12px', width:'100%', background:'var(--accent)', color:'var(--bg-1)',
          border:'none', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600,
          letterSpacing:'0.18em'
        }}>► ENGAGE</button>
      </div>
    </div>
  );
}

window.VariantA = VariantA;
window.VariantB = VariantB;
window.VariantC = VariantC;
window.VariantD = VariantD;
