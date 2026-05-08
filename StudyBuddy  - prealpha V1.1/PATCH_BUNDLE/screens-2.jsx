/* StudyBuddy — Screens batch 2: Cram, Exam, Result */

/* ═══════════════════════════════════════════════════
   CRAM — iso nav (D) → ability draft → combat
   ═══════════════════════════════════════════════════ */
function ScreenCram({ onNav }) {
  const [phase, setPhase] = React.useState('nav'); // nav | draft | run
  const [picked, setPicked] = React.useState([]);
  const [selectedNode, setSelectedNode] = React.useState('n3');

  const TILE = 50;
  const tiles = [];
  for (let y=0; y<7; y++) for (let x=0; x<10; x++){
    const isPath = [
      [0,3],[1,3],[2,3],[2,2],[3,2],[4,2],[4,3],[5,3],[5,4],[6,4],[7,4],[7,3],[8,3],[9,3]
    ].some(([px,py])=>px===x && py===y);
    tiles.push({ x, y, path:isPath });
  }
  const nodes = [
    { id:'n1', x:0, y:3, type:'start',  label:'GATE',     status:'cleared' },
    { id:'n2', x:2, y:3, type:'wave',    label:'W.1 ×3',  status:'cleared' },
    { id:'n3', x:4, y:2, type:'wave',    label:'W.2 ×4',  status:'active'  },
    { id:'n4', x:5, y:4, type:'cache',   label:'CACHE',   status:'open'    },
    { id:'n5', x:7, y:3, type:'wave',    label:'W.3 ×5',  status:'open'    },
    { id:'n6', x:9, y:3, type:'final',   label:'FINAL',   status:'locked'  },
  ];
  const typeIco = { start:'◆', wave:'⚡', cache:'$', final:'☠' };
  const typeColor = { start:'var(--fg-1)', wave:'var(--hp)', cache:'var(--insight)', final:'var(--t-mythic)' };

  if (phase === 'nav') {
    return (
      <div style={{display:'grid', gridTemplateColumns:'1fr 300px', height:'100%', overflow:'hidden'}}>
        <div style={{position:'relative', overflow:'hidden', background:'radial-gradient(60% 60% at 50% 50%, rgba(217,69,69,0.06), transparent 70%), var(--bg-1)'}}>
          <div style={{position:'absolute', top:18, left:24, zIndex:5}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--hp)'}}>CRAM · WAVE SURVIVAL</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, marginTop:4}}>10-Minute Gauntlet</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', marginTop:6, letterSpacing:'0.1em'}}>NEUR-301 · WEAK SPOTS POOL · 24 CARDS</div>
          </div>
          <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%) rotateX(60deg) rotateZ(-45deg)', transformStyle:'preserve-3d', width: TILE*10, height: TILE*7}}>
            {tiles.map(t=>(
              <div key={t.x+','+t.y} style={{
                position:'absolute', left:t.x*TILE, top:t.y*TILE, width:TILE-2, height:TILE-2,
                background: t.path ? 'linear-gradient(180deg, var(--bg-3), var(--bg-2))' : 'var(--bg-1)',
                border: t.path ? '1px solid rgba(217,69,69,0.35)' : '1px solid var(--line)',
              }}/>
            ))}
            {nodes.map(n=>{
              const c = typeColor[n.type];
              const sel = n.id === selectedNode;
              return (
                <div key={n.id}
                  onClick={()=> n.status!=='locked' && setSelectedNode(n.id)}
                  style={{
                    position:'absolute', left:n.x*TILE+TILE/2-14, top:n.y*TILE+TILE/2-14,
                    width:28, height:28, transform:'translateZ(20px) rotateZ(45deg) rotateX(-60deg)',
                    background: n.status==='active'?c:n.status==='cleared'?'var(--bg-3)':'var(--bg-2)',
                    border:`2px solid ${sel?'var(--accent)':n.status==='locked'?'var(--line-2)':c}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700,
                    color: n.status==='active'?'var(--bg-1)':n.status==='cleared'?'var(--accent)':'var(--fg-2)',
                    cursor: n.status==='locked'?'not-allowed':'pointer',
                    opacity: n.status==='locked'?0.5:1
                  }}>{typeIco[n.type]}</div>
              );
            })}
          </div>
          <div style={{position:'absolute', bottom:14, left:24, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-4)'}}>
            ISO_45 · CRAM_ROUTE · 6 STEPS TO FINAL
          </div>
        </div>

        <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', overflow:'auto'}}>
          <PanelHeader>SELECTED</PanelHeader>
          <div style={{padding:14}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color:'var(--hp)'}}>WAVE 2 · ACTIVE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>4 enemies, 90s cap</div>
            <div style={{height:120, marginTop:12, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>WAVE PREVIEW</span>
            </div>
            <div style={{marginTop:14}}>
              <div className="cap cap-line" style={{marginBottom:8}}>RULES</div>
              {['NO RETRIES','TIMER ALWAYS RUNS','3 ABILITY DRAFT','PERMA-MISS = -HP'].map((r,i)=>(
                <div key={i} style={{padding:'4px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', display:'flex', gap:8}}>
                  <span style={{color:'var(--hp)'}}>!</span>{r}
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{padding:14, borderTop:'1px solid var(--line)'}}>
            <Btn primary full onClick={()=>setPhase('draft')}>► PROCEED TO DRAFT</Btn>
            <div style={{height:8}}/>
            <Btn full size="sm" onClick={()=>onNav('splash')}>◂ ABORT</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'draft') {
    const pool = ABILITIES.concat([
      { id:'cram1', name:'Spaced Burst', tier:'core', desc:'+4 dmg/correct on this wave', dmg:8, cd:0, key:'6' },
      { id:'cram2', name:'Adrenaline', tier:'advanced', desc:'+15s on every kill', dmg:0, cd:0, key:'7' },
      { id:'cram3', name:'Triage', tier:'core', desc:'Heal 6 on wave clear', dmg:0, cd:1, key:'8' },
    ]);
    const toggle = (a) => {
      if (picked.includes(a.id)) setPicked(picked.filter(p=>p!==a.id));
      else if (picked.length < 3) setPicked([...picked, a.id]);
    };
    return (
      <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100%'}}>
        <div style={{padding:'18px 28px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', gap:18}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--hp)'}}>DRAFT · 3 OF {pool.length}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, marginTop:2}}>Pick your loadout</div>
            <div style={{fontFamily:'var(--font-body)', fontSize:12, color:'var(--fg-2)', marginTop:4}}>You can't change abilities mid-cram. Choose carefully.</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{
                width:88, height:64, border:`1px solid ${picked[i]?'var(--accent)':'var(--line-2)'}`,
                background: picked[i]?'var(--bg-3)':'transparent', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-mono)', fontSize:10, color: picked[i]?'var(--accent)':'var(--fg-3)', letterSpacing:'0.1em', textAlign:'center', padding:8
              }}>{picked[i] ? pool.find(a=>a.id===picked[i]).name : `SLOT ${i+1}`}</div>
            ))}
          </div>
        </div>

        <div style={{padding:'24px 28px', overflow:'auto', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, alignContent:'flex-start'}}>
          {pool.map(a=>{
            const sel = picked.includes(a.id);
            const disabled = !sel && picked.length>=3;
            const tierColor = a.tier==='basic'?'var(--fg-3)':a.tier==='core'?'var(--block)':'var(--t-epic)';
            return (
              <div key={a.id} onClick={()=>!disabled && toggle(a)} style={{
                padding:14, border:`1px solid ${sel?'var(--accent)':'var(--line)'}`, background: sel?'linear-gradient(180deg, var(--accent-soft), var(--bg-2))':'var(--bg-2)',
                cursor: disabled?'not-allowed':'pointer', opacity: disabled?0.4:1,
                position:'relative', display:'flex', flexDirection:'column', gap:8, minHeight:140
              }}>
                {sel && <span style={{position:'absolute', top:-1, left:-1, width:10, height:10, borderTop:'1px solid var(--accent)', borderLeft:'1px solid var(--accent)'}}/>}
                {sel && <span style={{position:'absolute', bottom:-1, right:-1, width:10, height:10, borderBottom:'1px solid var(--accent)', borderRight:'1px solid var(--accent)'}}/>}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <Chip color={tierColor}>{a.tier}</Chip>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: a.dmg?'var(--hp)':'var(--fg-3)'}}>{a.dmg?`${a.dmg} DMG`:'UTIL'}</span>
                </div>
                <div className="sprite lg" style={{alignSelf:'center'}}>
                  <Sprite rows={(ABISPR[Object.keys(ABISPR)[Math.floor(Math.random()*9)]]||ABISPR.blade).rows} palette={(ABISPR.blade).palette}/>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600, textAlign:'center'}}>{a.name}</div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', textAlign:'center', lineHeight:1.4}}>{a.desc}</div>
              </div>
            );
          })}
        </div>

        <div style={{padding:14, borderTop:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:14}}>
          <Btn size="sm" onClick={()=>setPhase('nav')}>◂ BACK TO NAV</Btn>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color: picked.length===3?'var(--accent)':'var(--fg-3)', letterSpacing:'0.16em'}}>{picked.length}/3 SELECTED</div>
          <Btn primary disabled={picked.length<3} onClick={()=>setPhase('run')}>► START WAVE 2</Btn>
        </div>
      </div>
    );
  }

  // RUN — combat with cram chrome
  return <CramRun onNav={onNav} onExit={()=>setPhase('nav')}/>;
}

function CramRun({ onNav, onExit }) {
  const [t, setT] = React.useState(540); // 9:00 left
  const [wave, setWave] = React.useState(2);
  const [score, setScore] = React.useState(186);
  const [streak, setStreak] = React.useState(7);
  React.useEffect(()=>{
    const i = setInterval(()=>setT(v=>v>0?v-1:0), 1000);
    return ()=>clearInterval(i);
  },[]);
  const mins = String(Math.floor(t/60)).padStart(2,'0'), secs = String(t%60).padStart(2,'0');

  return (
    <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100%', background:'var(--bg-1)', position:'relative'}}>
      {/* Top urgency bar */}
      <div style={{
        padding:'14px 28px', borderBottom:'2px solid var(--hp)',
        background:'linear-gradient(180deg, rgba(217,69,69,0.18), transparent)',
        display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:24
      }}>
        <div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--hp)'}}>WAVE {wave}/3 · ENEMIES 2/4</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}>SLEEP STAGES POOL</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.3em', color: t<60?'var(--hp)':'var(--fg-3)'}}>TIME REMAINING</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:48, fontWeight:700, color: t<60?'var(--hp)':'var(--fg)', letterSpacing:'-0.02em', lineHeight:1}}>
            {mins}:{secs}
          </div>
          <div style={{height:3, background:'var(--bg-3)', marginTop:6, position:'relative', overflow:'hidden'}}>
            <div style={{height:'100%', width:`${(t/600)*100}%`, background: t<60?'var(--hp)':'var(--accent)', transition:'width 1s linear'}}/>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--fg-3)'}}>SCORE / STREAK</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2}}><span style={{color:'var(--accent)'}}>{score}</span> · <span style={{color:'var(--insight)'}}>×{streak}</span></div>
        </div>
      </div>

      {/* Stage */}
      <div style={{position:'relative', overflow:'hidden', display:'grid', gridTemplateRows:'auto 1fr', padding:'18px 24px', gap:14}}>
        <div style={{display:'flex', gap:10, justifyContent:'center'}}>
          {ENEMIES.slice(0,4).map((e,i)=>(
            <div key={e.id} style={{
              width:140, padding:8, border:`1px solid ${i===1?'var(--hp)':'var(--line-2)'}`, background:'var(--bg-2)',
              display:'flex', flexDirection:'column', gap:6, opacity: i===0?0.35:1
            }}>
              <div style={{height:80, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div className="sprite lg" style={{background:'transparent', border:'none'}}>
                  <Sprite rows={SPR[e.spr].rows} palette={SPR[e.spr].palette}/>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize:11}}>
                <span style={{fontFamily:'var(--font-display)', fontWeight:600, fontSize:12}}>{e.name}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>{e.hp}/{e.max}</span>
              </div>
              <Bar pct={(e.hp/e.max)*100} color="var(--hp)" height={3}/>
            </div>
          ))}
        </div>

        <div style={{padding:'16px 20px', background:'var(--bg-2)', border:'1px solid var(--line)', alignSelf:'center', maxWidth:720, margin:'0 auto', width:'100%'}}>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <Chip color="var(--accent-line)">MCQ</Chip>
            <Chip color="var(--insight)">SLEEP STAGES</Chip>
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, marginTop:10, lineHeight:1.3, textWrap:'pretty'}}>
            Which sleep stage is most associated with declarative memory consolidation?
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:14}}>
            {[['A','REM sleep'],['B','NREM3 (slow-wave)'],['C','Stage 1 light'],['D','Wakefulness']].map(([k,l],i)=>(
              <div key={i} className="q-opt" style={{cursor:'pointer'}}>
                <span className="key">{k}</span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotbar */}
      <div style={{display:'flex', borderTop:'1px solid var(--line)', background:'var(--bg-2)'}}>
        {ABILITIES.map((a,i)=>(
          <div key={a.id} style={{flex:1, padding:'12px 14px', borderRight: i<ABILITIES.length-1?'1px solid var(--line)':'none', cursor:'pointer'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 4px', background:'var(--bg-1)', border:'1px solid var(--line-2)', color:'var(--fg-3)'}}>{a.key}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg)'}}>{a.name}</span>
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', marginTop:4}}>{a.desc}</div>
          </div>
        ))}
        <div style={{width:120, padding:14, display:'flex', flexDirection:'column', gap:6, borderLeft:'1px solid var(--line)'}}>
          <Btn size="sm" full danger onClick={onExit}>◂ BAIL</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EXAM — timed mixed-format
   ═══════════════════════════════════════════════════ */
function ScreenExam({ onNav }) {
  const [t, setT] = React.useState(2700); // 45:00
  const [qIdx, setQIdx] = React.useState(7);
  const total = 32;
  React.useEffect(()=>{ const i = setInterval(()=>setT(v=>v>0?v-1:0), 1000); return ()=>clearInterval(i); },[]);
  const m = String(Math.floor(t/60)).padStart(2,'0'), s = String(t%60).padStart(2,'0');
  const answered = [1,1,1,2,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 0=unanswered, 1=answered, 2=flagged

  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr 280px', height:'100%', overflow:'hidden'}}>
      {/* left — question grid */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto'}}>
        <PanelHeader>QUESTION GRID</PanelHeader>
        <div style={{padding:14}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:3}}>
            {answered.map((s,i)=>(
              <div key={i} onClick={()=>setQIdx(i)} style={{
                aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-mono)', fontSize:10, fontWeight:600,
                background: i===qIdx?'var(--accent)':s===1?'var(--bg-3)':s===2?'var(--insight)':'var(--bg-1)',
                color: i===qIdx?'var(--bg-1)':s===1?'var(--fg)':s===2?'var(--bg-1)':'var(--fg-3)',
                border:`1px solid ${i===qIdx?'var(--accent)':s>0?'var(--line-2)':'var(--line)'}`,
                cursor:'pointer'
              }}>{i+1}</div>
            ))}
          </div>
          <div style={{marginTop:18, display:'flex', flexDirection:'column', gap:6, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{width:10, height:10, background:'var(--bg-3)', border:'1px solid var(--line-2)'}}/>ANSWERED ({answered.filter(s=>s===1).length})</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{width:10, height:10, background:'var(--insight)'}}/>FLAGGED ({answered.filter(s=>s===2).length})</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{width:10, height:10, background:'var(--bg-1)', border:'1px solid var(--line)'}}/>BLANK ({answered.filter(s=>s===0).length})</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}><span style={{width:10, height:10, background:'var(--accent)'}}/>CURRENT</div>
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', overflow:'hidden'}}>
        <div style={{padding:'14px 28px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', gap:18}}>
          <Chip color="var(--block)">MIDTERM · NEUR-301</Chip>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)', letterSpacing:'0.12em'}}>QUESTION {qIdx+1} OF {total}</span>
          <span style={{flex:1}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.22em', color: t<300?'var(--hp)':'var(--fg-3)'}}>TIME LEFT</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:24, fontWeight:600, color: t<300?'var(--hp)':'var(--fg)', letterSpacing:'-0.01em'}}>{m}:{s}</span>
        </div>

        <div style={{padding:'32px 48px', overflow:'auto', maxWidth:900, width:'100%', justifySelf:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <Chip color="var(--accent-line)">SHORT ANSWER · 4 PTS</Chip>
            <Chip>CH.2 · LTP</Chip>
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, marginTop:16, lineHeight:1.3, textWrap:'pretty', maxWidth:760}}>
            Describe the molecular cascade by which long-term potentiation is induced at hippocampal CA1 synapses, including the role of NMDA receptors and CaMKII.
          </div>
          <div style={{marginTop:24, padding:14, background:'var(--bg-2)', border:'1px solid var(--line)', minHeight:200, fontFamily:'var(--font-mono)', fontSize:13, color:'var(--fg-1)', lineHeight:1.7}}>
            Glutamate binds AMPA receptors at the post-synapse, depolarizing the membrane. With sufficient depolarization, magnesium blocks are expelled from NMDA receptors, allowing calcium influx_<span style={{animation:'blink 1s infinite', color:'var(--accent)'}}>|</span>
          </div>
          <div style={{marginTop:8, display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.12em'}}>
            <span>WORD COUNT: 28 / ~120 RECOMMENDED</span>
            <span>AUTOSAVED 0.4s AGO</span>
          </div>
        </div>

        <div style={{padding:'12px 28px', borderTop:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', gap:12}}>
          <Btn size="sm" onClick={()=>setQIdx(Math.max(0,qIdx-1))}>◂ PREV</Btn>
          <Btn size="sm">⚑ FLAG</Btn>
          <span style={{flex:1}}/>
          <Btn size="sm" danger>◂ EXIT (LOSE PROGRESS)</Btn>
          <Btn primary onClick={()=>setQIdx(Math.min(total-1,qIdx+1))}>NEXT ►</Btn>
        </div>
      </div>

      {/* right — proctor */}
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto'}}>
        <PanelHeader>PROCTOR</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:14}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:'1px solid var(--line)'}}>
            {[['ANSWERED',answered.filter(s=>s===1).length],['FLAGGED',answered.filter(s=>s===2).length],['BLANK',answered.filter(s=>s===0).length],['EST GRADE','—']].map(([k,v],i)=>(
              <div key={i} style={{padding:10, borderRight:i%2===0?'1px solid var(--line)':'none', borderBottom:i<2?'1px solid var(--line)':'none'}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.18em'}}>{k}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="cap cap-line" style={{marginBottom:6}}>SECTIONS</div>
            {[
              ['I. MCQ', '6/12'],
              ['II. SHORT', '1/8'],
              ['III. ESSAY', '0/2'],
            ].map((r,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
                <span style={{color:'var(--fg-2)'}}>{r[0]}</span><span>{r[1]}</span>
              </div>
            ))}
          </div>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--insight)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--insight)'}}>WARDEN</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', marginTop:4, lineHeight:1.5}}>
              You have 16 questions remaining and 4 minutes per question average. Pace acceptable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RESULT — post-fight loot screen
   ═══════════════════════════════════════════════════ */
function ScreenResult({ onNav }) {
  return (
    <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100%', background:'radial-gradient(60% 50% at 50% 30%, rgba(125,216,125,0.08), transparent 60%), var(--bg-1)'}}>
      <div style={{padding:'24px 32px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:24}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.28em', color:'var(--accent)'}}>VICTORY · ENGAGEMENT COMPLETE</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, marginTop:6, letterSpacing:'-0.01em'}}>CH.2 STORAGE — CLEARED</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)', marginTop:6, letterSpacing:'0.1em'}}>NEUR-301 · 6 TURNS · 4 ENEMIES DOWN · 0 RETRIES</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
          <Chip color="var(--accent-line)">S RANK</Chip>
          <Chip>NEW PB · 6 TURNS</Chip>
        </div>
      </div>

      <div style={{padding:'24px 32px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24, overflow:'auto'}}>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div className="cap cap-line">PERFORMANCE</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:'1px solid var(--line)'}}>
            {[['ACCURACY','94%','var(--accent)'],['STREAK PB','×24','var(--insight)'],['DMG DEALT','187','var(--fg)'],['DMG TAKEN','12','var(--hp)']].map(([k,v,c],i)=>(
              <div key={i} style={{padding:'14px 16px', borderRight: i<3?'1px solid var(--line)':'none', background:'var(--bg-2)'}}>
                <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>{k}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, marginTop:2, color:c}}>{v}</div>
              </div>
            ))}
          </div>

          <div className="cap cap-line">LOOT</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
            {[
              { name:'Recall Vector', tier:'legendary', kind:'AUGMENT' },
              { name:'Concept: Engram', tier:'rare',     kind:'CONCEPT' },
              { name:'Pet egg: Echo',   tier:'epic',     kind:'PET' },
            ].map((l,i)=>(
              <div key={i} style={{padding:14, background:'var(--bg-2)', border:`1px solid var(--t-${l.tier})`, position:'relative'}}>
                <span style={{position:'absolute', top:-1, left:-1, width:10, height:10, borderTop:`1px solid var(--t-${l.tier})`, borderLeft:`1px solid var(--t-${l.tier})`}}/>
                <span style={{position:'absolute', bottom:-1, right:-1, width:10, height:10, borderBottom:`1px solid var(--t-${l.tier})`, borderRight:`1px solid var(--t-${l.tier})`}}/>
                <Chip color={`var(--t-${l.tier})`}>{l.tier.toUpperCase()}</Chip>
                <div style={{height:80, marginTop:10, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.2em'}}>{l.kind}</span>
                </div>
                <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:8}}>{l.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div className="cap cap-line">XP & PROGRESSION</div>
          <div style={{padding:14, background:'var(--bg-2)', border:'1px solid var(--line)'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)', marginBottom:6}}>
              <span>LV.12 → LV.13</span>
              <span><span style={{color:'var(--insight)'}}>+240 XP</span> (480/600)</span>
            </div>
            <Bar pct={80} color="var(--xp)" height={8}/>
          </div>

          <div className="cap cap-line">MASTERY DELTA</div>
          <div>
            {[['Hippocampal Indexing',62,82],['LTP Cascade',28,54],['Sleep Stages',71,76]].map(([k,a,b],i)=>(
              <div key={i} style={{padding:'8px 0', borderBottom:'1px dashed var(--line)'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11}}>
                  <span style={{color:'var(--fg-1)'}}>{k}</span>
                  <span><span style={{color:'var(--fg-3)'}}>{a}%</span> → <span style={{color:'var(--accent)'}}>{b}%</span></span>
                </div>
                <div style={{position:'relative', height:4, marginTop:4, background:'var(--bg-3)', border:'1px solid var(--line)'}}>
                  <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${a}%`, background:'var(--fg-3)'}}/>
                  <div style={{position:'absolute', left:`${a}%`, top:0, bottom:0, width:`${b-a}%`, background:'var(--accent)'}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="cap cap-line">PETS</div>
          <div style={{padding:12, background:'var(--bg-2)', border:'1px solid var(--line)', display:'flex', gap:14, alignItems:'center'}}>
            <div className="sprite lg"><Sprite rows={PETSPR.owl.rows} palette={PETSPR.owl.palette}/></div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600}}>Athena</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', marginTop:4}}>BOND ↑ +2 → ★★★★★★★ &nbsp;·&nbsp; +8% XP earned</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:18, borderTop:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', gap:10, justifyContent:'center'}}>
        <Btn size="md" onClick={()=>onNav('study')}>↻ REVIEW NOTES</Btn>
        <Btn size="md" onClick={()=>onNav('arsenal')}>⚒ EQUIP LOOT</Btn>
        <Btn size="md" primary onClick={()=>onNav('world')}>► CONTINUE TO MAP</Btn>
      </div>
    </div>
  );
}

window.ScreenCram = ScreenCram;
window.ScreenExam = ScreenExam;
window.ScreenResult = ScreenResult;
