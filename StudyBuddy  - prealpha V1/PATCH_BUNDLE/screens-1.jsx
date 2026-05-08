/* StudyBuddy — Screens batch 1: Splash, World (B+A+D), Study, Cram, Exam */

/* ═══════════════════════════════════════════════════
   SPLASH / OPS — mode selection moment
   ═══════════════════════════════════════════════════ */
function ScreenSplash({ onNav }) {
  const [hover, setHover] = React.useState(null);
  const modes = [
    { id:'study',  k:'1', name:'STUDY',  tag:'INTAKE',  desc:'Notes → recall → mastery. Build the loadout.', stat:'~30 MIN', color:'var(--accent)', go:'study' },
    { id:'world',  k:'2', name:'CAMPAIGN', tag:'OPS',   desc:'Module run. Pick chapter, fight to boss.',     stat:'~45 MIN', color:'var(--insight)', go:'world' },
    { id:'cram',   k:'3', name:'CRAM',   tag:'WAVES',   desc:'10-minute survival. All your weak topics.',    stat:'10 MIN',  color:'var(--hp)', go:'cram' },
    { id:'exam',   k:'4', name:'EXAM',   tag:'TIMED',   desc:'Timed mixed-format. No retries.',              stat:'STRICT',  color:'var(--block)', go:'exam' },
    { id:'raid',   k:'5', name:'RAID',   tag:'CO-OP',   desc:'Boss chain. Bring 3 friends.',                  stat:'45+ MIN', color:'var(--t-mythic)', go:'raid' },
  ];
  return (
    <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100%'}}>
      <div style={{padding:'18px 28px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:16}}>
        <SBMark size={42} glow/>
        <div>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, letterSpacing:'0.02em'}}>STUDY<span style={{color:'var(--accent)'}}>BUDDY</span></div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.28em', color:'var(--fg-3)', marginTop:2}}>TACTICAL · STUDY · OS  //  v0.7.4 / SECTOR_05</div>
        </div>
        <div style={{flex:1}}/>
        <Chip color="var(--accent-line)">SYNC OK</Chip>
        <Chip>09:42:11 LOCAL</Chip>
        <Chip color="var(--insight)">CMDR_RIN</Chip>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:0, overflow:'hidden'}}>
        {/* left — mode list */}
        <div style={{padding:'28px 36px', display:'flex', flexDirection:'column', gap:14, overflow:'auto'}}>
          <div className="cap cap-line" style={{marginBottom:0}}>SELECT OPERATION</div>
          {modes.map(m=>{
            const active = hover === m.id;
            return (
              <div key={m.id}
                onMouseEnter={()=>setHover(m.id)} onMouseLeave={()=>setHover(null)}
                onClick={()=>onNav(m.go)}
                style={{
                  display:'grid', gridTemplateColumns:'56px 1fr auto', alignItems:'center', gap:18,
                  padding:'18px 18px',
                  border:`1px solid ${active?m.color:'var(--line)'}`,
                  background: active ? `linear-gradient(90deg, ${m.color}11, transparent 70%)` : 'var(--bg-2)',
                  cursor:'pointer', transition:'all 110ms', position:'relative'
                }}>
                <div style={{
                  width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${active?m.color:'var(--line-2)'}`, background:'var(--bg-1)',
                  fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color:active?m.color:'var(--fg-2)'
                }}>{m.k}</div>
                <div>
                  <div style={{display:'flex', gap:8, alignItems:'baseline'}}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:m.color}}>{m.tag}</span>
                    <span style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, letterSpacing:'-0.005em', color:active?'var(--fg)':'var(--fg-1)'}}>{m.name}</span>
                  </div>
                  <div style={{fontFamily:'var(--font-body)', fontSize:13, color:'var(--fg-2)', marginTop:4}}>{m.desc}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                  <Chip color={active?m.color:'var(--line-2)'}>{m.stat}</Chip>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: active?m.color:'var(--fg-3)', letterSpacing:'0.2em'}}>► ENTER</span>
                </div>
                {active && <span style={{position:'absolute', top:-1, left:-1, width:10, height:10, borderTop:`1px solid ${m.color}`, borderLeft:`1px solid ${m.color}`}}/>}
                {active && <span style={{position:'absolute', bottom:-1, right:-1, width:10, height:10, borderBottom:`1px solid ${m.color}`, borderRight:`1px solid ${m.color}`}}/>}
              </div>
            );
          })}
        </div>

        {/* right — daily briefing */}
        <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', overflow:'auto'}}>
          <PanelHeader>DAILY BRIEFING — 6 MAY 2026</PanelHeader>
          <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:18}}>
            <div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>UPCOMING</div>
              <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:8}}>
                {DEADLINES.slice(0,3).map(d=>(
                  <div key={d.id} style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'center', padding:'8px 10px', background:'var(--bg-3)', border:'1px solid var(--line)'}}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700, color: d.days<=3?'var(--hp)':d.days<=7?'var(--insight)':'var(--fg-2)'}}>{d.days}<small style={{fontSize:9, marginLeft:2}}>D</small></span>
                    <span style={{display:'flex', flexDirection:'column'}}>
                      <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>{d.module}</span>
                      <span style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600}}>{d.label}</span>
                    </span>
                    <Chip color={d.days<=3?'var(--hp)':'var(--line-2)'}>{d.kind.toUpperCase()}</Chip>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>TODAY'S TARGETS</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, marginTop:8, border:'1px solid var(--line)'}}>
                {[
                  ['XP GOAL','480 / 800','60%'],
                  ['STREAK','×12','BEST'],
                  ['MASTERY','+3','TOPICS'],
                ].map(([k,v,sub],i)=>(
                  <div key={i} style={{padding:'10px 12px', borderRight: i<2?'1px solid var(--line)':'none', background:'var(--bg-3)'}}>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>{k}</div>
                    <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginTop:2}}>{v}</div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.12em', marginTop:2}}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>BUDDY ON DUTY</div>
              <div style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:14, alignItems:'center', padding:'12px', background:'var(--bg-3)', border:'1px solid var(--line)', marginTop:8}}>
                <div className="sprite lg"><Sprite rows={PETSPR.owl.rows} palette={PETSPR.owl.palette}/></div>
                <div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600}}>Athena</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>+8% XP · BOND ★★★★★★★</div>
                </div>
                <Chip color="var(--accent-line)">EAGER</Chip>
              </div>
            </div>

            <div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>SYSTEM</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', lineHeight:1.7, marginTop:8}}>
                <div>&gt; LAST_SYNC ........... 0.4s ago</div>
                <div>&gt; PENDING_REVIEWS ..... 12 cards</div>
                <div>&gt; FORGETTING_RISK .... <span style={{color:'var(--insight)'}}>MEDIUM</span></div>
                <div>&gt; AUGMENT_SLOT_OPEN .. <span style={{color:'var(--accent)'}}>YES (CHARM)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', height:28, padding:'0 18px', gap:18, background:'var(--bg-2)', borderTop:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)', textTransform:'uppercase'}}>
        <span><span className="blink" style={{display:'inline-block', width:6, height:6, background:'var(--accent)', marginRight:6}}/>STANDBY</span>
        <span>PRESS 1-5 OR CLICK</span>
        <span style={{flex:1}}/>
        <span>SECTOR_05 / NEUR-301 ACTIVE</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   WORLD — B (chapter sidebar) + A (elite node graph) + D (cram iso)
   ═══════════════════════════════════════════════════ */
function ScreenWorld({ onNav, onEngage }) {
  const [moduleCode, setModuleCode] = React.useState('NEUR-301');
  const [chapter, setChapter] = React.useState(2);
  const [view, setView] = React.useState('topics'); // topics | elite
  const chapters = CHAPTERS[moduleCode] || [];
  const topics = TOPICS[chapter] || [];

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', height:'100%', overflow:'hidden'}}>
      {/* left rail — modules + chapters (B sidebar) */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto', display:'flex', flexDirection:'column'}}>
        <PanelHeader>MODULES</PanelHeader>
        <div style={{padding:'10px'}}>
          {MODULES.map(m=>{
            const sel = m.code === moduleCode;
            return (
              <div key={m.code} onClick={()=>setModuleCode(m.code)} style={{
                padding:'10px 10px', marginBottom:6,
                background: sel ? 'linear-gradient(90deg, var(--accent-soft), transparent 70%)' : 'var(--bg-3)',
                border:`1px solid ${sel ? 'var(--accent-line)' : 'var(--line)'}`,
                cursor:'pointer'
              }}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color: sel?'var(--accent)':'var(--fg-3)'}}>{m.code}</span>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>{m.prog}%</span>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:2, marginBottom:6}}>{m.name}</div>
                <Bar pct={m.prog} color={sel?'var(--accent)':'var(--fg-3)'} />
                <div style={{fontFamily:'var(--font-mono)', fontSize:9, color: m.due<=7?'var(--hp)':'var(--fg-3)', letterSpacing:'0.16em', marginTop:6}}>
                  ▸ {m.due}D TO {m.due<=7?'EXAM':'NEXT'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{borderTop:'1px solid var(--line)'}}>
          <PanelHeader>CHAPTERS</PanelHeader>
          <div>
            {chapters.map(c=>{
              const sel = c.n === chapter;
              return (
                <div key={c.n} onClick={()=>{ if(c.status!=='locked'){ setChapter(c.n); setView('topics'); }}} style={{
                  padding:'10px 14px', borderBottom:'1px solid var(--line)',
                  background: sel ? 'linear-gradient(90deg, var(--accent-soft), transparent 80%)' : 'transparent',
                  cursor: c.status==='locked'?'not-allowed':'pointer', position:'relative',
                  opacity: c.status==='locked'?0.45:1
                }}>
                  {sel && <div style={{position:'absolute', left:0, top:0, bottom:0, width:2, background:'var(--accent)'}}/>}
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color: sel?'var(--accent)':'var(--fg-3)'}}>CH.{String(c.n).padStart(2,'0')}</span>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color: c.status==='cleared'?'var(--accent)':c.status==='active'?'var(--accent)':c.status==='locked'?'var(--fg-3)':'var(--fg-2)'}}>
                      {c.status==='cleared'?'✓':c.status==='active'?'⌬':c.status==='locked'?'⌧':'○'} {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:2}}>{c.name}</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', marginTop:4, letterSpacing:'0.1em'}}>{c.mastered}/{c.topics} MASTERED</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{display:'grid', gridTemplateRows:'auto 1fr', overflow:'hidden'}}>
        <div style={{padding:'18px 24px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'flex-end', gap:24, background:'var(--bg-1)'}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>{moduleCode} · CH.{String(chapter).padStart(2,'0')} · ACTIVE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, marginTop:4, letterSpacing:'-0.01em'}}>{chapters.find(c=>c.n===chapter)?.name}</div>
            <div style={{fontFamily:'var(--font-body)', fontSize:13, color:'var(--fg-2)', marginTop:4, maxWidth:600}}>
              Long-term consolidation, hippocampal indexing, sleep-dependent transfer. Choose how you train.
            </div>
          </div>
          <div style={{display:'flex', gap:0, border:'1px solid var(--line-2)'}}>
            {[['topics','TOPICS · DOJO/STREET'],['elite','ELITE GAUNTLET']].map(([id,l])=>(
              <button key={id} onClick={()=>setView(id)} style={{
                padding:'10px 16px',
                background: view===id?'var(--accent)':'transparent',
                color: view===id?'var(--bg-1)':'var(--fg-1)',
                border:'none', borderRight: id==='topics'?'1px solid var(--line-2)':'none',
                fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em',
                fontWeight:600, cursor:'pointer'
              }}>{l}</button>
            ))}
          </div>
        </div>

        {view==='topics' && <WorldTopicsList topics={topics} onEngage={onEngage}/>}
        {view==='elite'  && <WorldEliteGraph onEngage={onEngage}/>}
      </div>
    </div>
  );
}

function WorldTopicsList({ topics, onEngage }) {
  return (
    <div style={{padding:'20px 24px', overflow:'auto'}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:'1px solid var(--line)', marginBottom:18}}>
        {[
          ['TOPICS', `${topics.filter(t=>t.status==='CLEARED').length}/${topics.length}`,'var(--accent)'],
          ['BEST ACC','94%','var(--accent)'],
          ['XP EARNED','240','var(--insight)'],
          ['STREAK PB','×24','var(--fg)'],
        ].map(([k,v,c],i)=>(
          <div key={i} style={{padding:'12px 16px', borderRight: i<3?'1px solid var(--line)':'none', background:'var(--bg-2)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>{k}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, marginTop:2, color:c}}>{v}</div>
          </div>
        ))}
      </div>

      <div className="cap cap-line" style={{marginBottom:10}}>TOPICS — DOJO PRACTICE / STREET FIGHTS</div>
      <div style={{border:'1px solid var(--line)', background:'var(--bg-2)'}}>
        {topics.map((r,i)=>{
          const active = r.status==='ACTIVE';
          const cleared = r.status==='CLEARED';
          const locked = r.status==='LOCKED';
          const typeColor = r.type==='STUDY'?'var(--accent-line)':r.type==='STREET'?'var(--line-3)':r.type==='DOJO'?'var(--block)':'var(--t-epic)';
          return (
            <div key={r.id}
              onClick={()=>!locked && onEngage(r)}
              style={{
              display:'grid', gridTemplateColumns:'56px 100px 1fr 110px 80px 90px 110px',
              alignItems:'center', padding:'14px 18px',
              borderBottom: i<topics.length-1?'1px solid var(--line)':'none',
              background: active?'linear-gradient(90deg, var(--accent-soft), transparent 50%)':'transparent',
              cursor: locked?'not-allowed':'pointer',
              opacity: locked?0.5:1,
              transition:'background 110ms'
            }}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: active?'var(--accent)':'var(--fg-3)', letterSpacing:'0.1em'}}>{r.id}</span>
              <Chip color={typeColor}>{r.type}</Chip>
              <span style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, color: locked?'var(--fg-3)':'var(--fg)'}}>{r.name}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: cleared?'var(--accent)':active?'var(--accent)':'var(--fg-3)', letterSpacing:'0.16em'}}>
                {cleared && '✓ '}{r.status}
              </span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--insight)'}}>+{r.xp} XP</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: r.acc>=90?'var(--accent)':r.acc?'var(--fg-2)':'var(--fg-3)'}}>{r.acc?r.acc+'%':'—'}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: locked?'var(--fg-3)':active?'var(--accent)':'var(--fg-2)', letterSpacing:'0.18em', textAlign:'right', fontWeight:600}}>
                {locked ? '⌧ LOCKED' : active ? '► ENGAGE' : cleared ? '↻ REPLAY' : '○ START'}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{marginTop:18, padding:'14px 18px', border:'1px dashed var(--line-2)', display:'flex', alignItems:'center', gap:14}}>
        <Chip color="var(--t-epic)">ELITE GAUNTLET</Chip>
        <span style={{fontFamily:'var(--font-body)', fontSize:12, color:'var(--fg-2)', flex:1}}>
          Clear all street fights to unlock the elite branch — earn your way to the boss through harder, branching nodes.
        </span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.18em'}}>2 / 3 STREETS CLEARED</span>
      </div>
    </div>
  );
}

function WorldEliteGraph({ onEngage }) {
  // Variant A node graph
  const nodes = [
    { id:'n1', x: 80,  y: 200, type:'start',  label:'INTAKE',     status:'cleared' },
    { id:'n2', x: 220, y: 130, type:'fight',  label:'EL.1 GLITCH', status:'cleared' },
    { id:'n3', x: 220, y: 280, type:'fight',  label:'EL.1 BUG',    status:'cleared' },
    { id:'n4', x: 360, y: 80,  type:'event',  label:'CACHE',       status:'open'  },
    { id:'n5', x: 360, y: 200, type:'elite',  label:'EL.2 WRAITH', status:'active'    },
    { id:'n6', x: 360, y: 320, type:'shop',   label:'ARMORY',      status:'open'    },
    { id:'n7', x: 500, y: 130, type:'elite',  label:'EL.3 SCHOLAR',status:'open' },
    { id:'n8', x: 500, y: 280, type:'event',  label:'TRIAL',       status:'open' },
    { id:'n9', x: 640, y: 200, type:'boss',   label:'PROF. HARDMAN', status:'locked' },
  ];
  const edges = [['n1','n2'],['n1','n3'],['n2','n4'],['n2','n5'],['n3','n5'],['n3','n6'],['n4','n7'],['n5','n7'],['n5','n8'],['n6','n8'],['n7','n9'],['n8','n9']];
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const typeIco = { start: '◆', fight: '✕', event: '?', elite: '✺', shop: '$', boss: '☠' };
  const typeColor = { start:'var(--fg-1)', fight:'var(--hp)', event:'var(--insight)', elite:'var(--t-epic)', shop:'var(--insight)', boss:'var(--t-mythic)' };
  const [sel, setSel] = React.useState('n5');
  const selN = byId[sel];

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 280px', overflow:'hidden'}}>
      <div style={{position:'relative', overflow:'hidden', background:'radial-gradient(60% 60% at 50% 50%, rgba(176,118,255,0.04), transparent 70%), var(--bg-1)'}}>
        <svg viewBox="0 0 720 400" preserveAspectRatio="xMidYMid meet" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
          <defs>
            <pattern id="vag2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="720" height="400" fill="url(#vag2)"/>
          {edges.map(([a,b],i)=>{
            const A = byId[a], B = byId[b];
            const cleared = A.status==='cleared' && (B.status==='cleared'||B.status==='active');
            return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={cleared?'var(--accent)':'var(--line-2)'} strokeWidth={cleared?1.5:1} strokeDasharray={cleared?'':'3 3'}/>
          })}
          {nodes.map(n=>{
            const c = typeColor[n.type];
            const isActive = n.status === 'active';
            const isLocked = n.status === 'locked';
            const isCleared = n.status === 'cleared';
            const isSel = n.id === sel;
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`} style={{cursor:isLocked?'not-allowed':'pointer'}} onClick={()=>!isLocked && setSel(n.id)}>
                {isActive && <circle r="22" fill="none" stroke={c} strokeOpacity="0.3" strokeWidth="1"><animate attributeName="r" from="18" to="28" dur="1.6s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite"/></circle>}
                {isSel && <rect x="-20" y="-20" width="40" height="40" transform="rotate(45)" fill="none" stroke="var(--accent)" strokeDasharray="2 3"/>}
                <rect x="-14" y="-14" width="28" height="28" transform="rotate(45)"
                  fill={isCleared?'var(--bg-3)':isActive?'var(--bg-2)':isLocked?'var(--bg-1)':'var(--bg-2)'}
                  stroke={isLocked?'var(--line-2)':c} strokeWidth={isActive?2:1} opacity={isLocked?0.4:1}/>
                <text x="0" y="5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="600" fill={isLocked?'var(--fg-3)':c}>{typeIco[n.type]}</text>
                <text x="0" y="34" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="2" fill={isActive?'var(--fg)':isLocked?'var(--fg-3)':'var(--fg-2)'}>{n.label.toUpperCase()}</text>
                {isCleared && <text x="0" y="-22" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--accent)" letterSpacing="2">✓ CLEAR</text>}
              </g>
            );
          })}
        </svg>
        <div style={{position:'absolute', bottom:14, left:18, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-4)'}}>ELITE_GRAPH · BRANCHING / EARN_BOSS</div>
      </div>
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', overflow:'auto'}}>
        <PanelHeader>NODE INTEL</PanelHeader>
        <div style={{padding:'14px'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color: typeColor[selN.type]}}>
            {selN.type.toUpperCase()} · {selN.status.toUpperCase()}
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>{selN.label}</div>
          <div style={{height:120, marginTop:12, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>SCENE PREVIEW</span>
          </div>
          <div style={{marginTop:12}}>
            {[['Difficulty','ELITE'],['Branch','UPPER'],['XP','+480'],['Drop','EPIC+']].map((r,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
                <span style={{color:'var(--fg-3)'}}>{r[0]}</span><span>{r[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1}}/>
        <div style={{padding:14, borderTop:'1px solid var(--line)'}}>
          <Btn primary full disabled={selN.status!=='active'} onClick={()=>onEngage(selN)}>
            {selN.status==='active'?'► ENGAGE':selN.status==='locked'?'⌧ LOCKED':'○ NOT YET'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STUDY — terminal lab notebook (notes left, recall right)
   ═══════════════════════════════════════════════════ */
function ScreenStudy({ onNav }) {
  const [pageIdx, setPageIdx] = React.useState(2);
  const [recallIdx, setRecallIdx] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [scroll, setScroll] = React.useState(0);

  const notes = [
    { h:'1. ENCODING', body:'Information enters via sensory registers (echoic ~3s, iconic ~0.5s). Selective attention determines what reaches short-term memory.' },
    { h:'2. CONSOLIDATION', body:'Hippocampal indexing binds distributed cortical features into a retrievable episode. Sleep — particularly slow-wave — drives transfer.' },
    { h:'3. STORAGE MECHANISMS', body:'Long-term potentiation (LTP) strengthens synaptic connections through repeated co-activation. NMDA receptors gate calcium influx; CaMKII triggers AMPA insertion.' },
    { h:'4. RETRIEVAL', body:'Cues reactivate distributed traces. Recognition relies on familiarity + recollection (dual-process).' },
  ];

  const recallCards = [
    { q:'Which receptor gates calcium influx during LTP?', a:'NMDA receptors — voltage- and ligand-gated, requiring concurrent depolarization and glutamate.', tag:'CONCEPT', diff:'CORE' },
    { q:'What sleep stage drives memory consolidation?', a:'Slow-wave (NREM3) — delta oscillations couple hippocampal ripples with cortical spindles.', tag:'FACT', diff:'CORE' },
    { q:'Define "engram" in one sentence.', a:'The physical substrate of a stored memory — a sparse pattern of neurons whose synaptic weights have been altered by experience.', tag:'DEFN', diff:'BASIC' },
  ];

  const card = recallCards[recallIdx];

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr 1fr 280px', height:'100%', overflow:'hidden'}}>
      {/* left rail — TOC */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto'}}>
        <PanelHeader>STUDY DECK</PanelHeader>
        <div style={{padding:14}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--accent)'}}>NEUR-301 / CH.2</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600, marginTop:2}}>Storage Mechanisms</div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <Chip>14 PAGES</Chip>
            <Chip color="var(--accent-line)">SOURCE: PDF</Chip>
          </div>
        </div>
        <div style={{borderTop:'1px solid var(--line)'}}>
          <PanelHeader>SECTIONS</PanelHeader>
          <div>
            {['1. Encoding','2. Consolidation','3. Storage Mechanisms','4. Retrieval','5. Forgetting','6. Distortion'].map((s,i)=>{
              const sel = i===2;
              const done = i<2;
              return (
                <div key={i} style={{padding:'8px 14px', borderBottom:'1px solid var(--line)', cursor:'pointer',
                  background: sel?'linear-gradient(90deg, var(--accent-soft), transparent 80%)':'transparent', position:'relative',
                  fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.04em',
                  color: sel?'var(--fg)':done?'var(--fg-2)':'var(--fg-3)'
                }}>
                  {sel && <div style={{position:'absolute', left:0, top:0, bottom:0, width:2, background:'var(--accent)'}}/>}
                  {done?'✓ ':sel?'▸ ':'○ '}{s}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* notes pane */}
      <div style={{background:'var(--bg-1)', display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--line)'}}>
        <PanelHeader right={<span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)'}}>PAGE 03 / 14</span>}>NOTES.MD — STORAGE_MECHANISMS</PanelHeader>
        <div style={{padding:'18px 22px', overflow:'auto', flex:1, fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.7, color:'var(--fg-1)'}}>
          {notes.map((n,i)=>(
            <div key={i} style={{marginBottom:24, opacity: i===2?1:0.55}}>
              <div style={{
                fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color: i===2?'var(--accent)':'var(--fg-2)',
                letterSpacing:'-0.005em', marginBottom:6, display:'flex', alignItems:'center', gap:10
              }}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)'}}>§ {n.h.split('.')[0]}</span>
                <span>{n.h.replace(/^\d+\.\s*/,'')}</span>
                {i===2 && <Chip color="var(--accent-line)">ACTIVE</Chip>}
              </div>
              <div style={{textWrap:'pretty', maxWidth:560}}>
                {n.body}
              </div>
              {i===2 && (
                <div style={{marginTop:14, padding:'10px 14px', background:'var(--bg-2)', border:'1px solid var(--line)', borderLeft:'2px solid var(--accent)'}}>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', color:'var(--accent)'}}>// HIGHLIGHT</div>
                  <div style={{marginTop:4, fontSize:12}}>NMDA + CaMKII + AMPA = the trinity. Tested in 7 of 9 NEUR midterms.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* recall pane */}
      <div style={{background:'var(--bg-1)', display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--line)'}}>
        <PanelHeader right={<span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.16em'}}>{recallIdx+1} / {recallCards.length}</span>}>RECALL.QUEUE</PanelHeader>
        <div style={{padding:'24px', display:'flex', flexDirection:'column', gap:18, overflow:'auto', flex:1}}>
          <div style={{display:'flex', gap:8}}>
            <Chip color="var(--accent-line)">{card.tag}</Chip>
            <Chip>{card.diff}</Chip>
            <span style={{flex:1}}/>
            <Chip color="var(--insight)">SRS · DUE 0H</Chip>
          </div>

          <div style={{padding:'24px', background:'var(--bg-2)', border:'1px solid var(--line)', position:'relative'}}>
            <span style={{position:'absolute', top:-1, left:-1, width:12, height:12, borderTop:'1px solid var(--accent)', borderLeft:'1px solid var(--accent)'}}/>
            <span style={{position:'absolute', bottom:-1, right:-1, width:12, height:12, borderBottom:'1px solid var(--accent)', borderRight:'1px solid var(--accent)'}}/>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>PROMPT</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, marginTop:8, lineHeight:1.3, textWrap:'pretty'}}>
              {card.q}
            </div>
          </div>

          <div style={{padding:'18px', background: revealed?'var(--bg-2)':'var(--bg-3)', border:'1px solid var(--line)', minHeight:120, opacity:revealed?1:0.7, transition:'opacity 200ms'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:revealed?'var(--accent)':'var(--fg-3)'}}>{revealed?'ANSWER':'YOUR RECALL'}</div>
            {revealed ? (
              <div style={{fontFamily:'var(--font-body)', fontSize:14, color:'var(--fg-1)', marginTop:8, lineHeight:1.5, textWrap:'pretty'}}>{card.a}</div>
            ) : (
              <div style={{marginTop:8, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)', height:60, border:'1px dashed var(--line-2)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                _ TYPE OR THINK · TAB TO REVEAL
              </div>
            )}
          </div>

          {!revealed ? (
            <Btn primary full onClick={()=>setRevealed(true)}>► REVEAL ANSWER</Btn>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6}}>
              {[['AGAIN','var(--hp)','5m'],['HARD','var(--insight)','1d'],['GOOD','var(--accent)','3d'],['EASY','var(--block)','7d']].map(([l,c,t],i)=>(
                <button key={i} onClick={()=>{ setRevealed(false); setRecallIdx((recallIdx+1)%recallCards.length); }} style={{
                  padding:'12px 8px', background:'var(--bg-3)', border:`1px solid ${c}`, color:c,
                  fontFamily:'var(--font-mono)', fontSize:11, fontWeight:600, letterSpacing:'0.16em', cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2
                }}>
                  <span>{l}</span>
                  <span style={{fontSize:9, color:'var(--fg-3)', letterSpacing:'0.1em'}}>+{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* right rail — session telemetry */}
      <div style={{background:'var(--bg-2)', borderLeft:'1px solid var(--line)', overflow:'auto'}}>
        <PanelHeader>SESSION</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:14}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid var(--line)'}}>
            {[['REVIEWED','24'],['ACC','88%'],['STREAK','×7'],['TIME','12:48']].map(([k,v],i)=>(
              <div key={i} style={{padding:10, borderRight:i%2===0?'1px solid var(--line)':'none', borderBottom:i<2?'1px solid var(--line)':'none'}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>{k}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginTop:2, color:k==='ACC'?'var(--accent)':'var(--fg)'}}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="cap cap-line" style={{marginBottom:6}}>WEAK SPOTS</div>
            {[['LTP receptor types',82],['Sleep stages',56],['Engram vs schema',42]].map(([k,v],i)=>(
              <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
                <span style={{color:'var(--fg-1)'}}>{k}</span>
                <span style={{display:'flex', gap:6, alignItems:'center'}}>
                  <span style={{width:50}}><Bar pct={v} color={v>=70?'var(--accent)':v>=50?'var(--insight)':'var(--hp)'}/></span>
                  <span style={{color:'var(--fg-2)', minWidth:30, textAlign:'right'}}>{v}%</span>
                </span>
              </div>
            ))}
          </div>
          <div>
            <div className="cap cap-line" style={{marginBottom:6}}>FORGE LOOT</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)', lineHeight:1.7}}>
              <div>+ <span style={{color:'var(--insight)'}}>+ 240 XP</span></div>
              <div>+ <span style={{color:'var(--accent)'}}>+ 8 INS</span></div>
              <div>+ flashcard pack ×3</div>
              <div style={{color:'var(--fg-3)'}}>○ augment unlock @ 500 XP</div>
            </div>
          </div>
          <Btn full primary onClick={()=>onNav('world')}>► READY FOR FIGHT</Btn>
          <Btn full size="sm" onClick={()=>onNav('splash')}>◂ EXIT TO OPS</Btn>
        </div>
      </div>
    </div>
  );
}

window.ScreenSplash = ScreenSplash;
window.ScreenWorld = ScreenWorld;
window.ScreenStudy = ScreenStudy;
