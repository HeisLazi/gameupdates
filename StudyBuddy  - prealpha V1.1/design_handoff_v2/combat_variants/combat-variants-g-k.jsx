/* StudyBuddy — Combat HUD: 5 ADDITIONAL directions (G–K)
   Lateral lanes beyond the original Sleek/XCOM/Library/Arcade/Dossier set (A–F).
   Source: Claude Design output, captured 2026-05-09.

   Each component expects these globals from the canvas wrapper:
     window.ENEMIES   — array of {id, name, spr, tier, lv, hp, max, intent, intentDesc, intentVal}
     window.ABILITIES — array of {id, key, name, tier, cd, desc}
     window.SPR       — { [spriteId]: { rows, palette } }
     window.Sprite    — React component that renders SPR data as inline SVG <rect>s

   When porting to production combat.jsx, replace those globals with the real
   state shape (see ../README.md → "Port plan").

   Components:
     - CombatMissionControl : NASA telemetry, oscilloscopes, multi-monitor
     - CombatTerminal       : pure VT100/ANSI, all text, mono everything
     - CombatJRPG           : Pokémon-style battle box, sprites + dialog menu
     - CombatFightCard      : boxing VS poster, oversized type, weigh-in stats
     - CombatNotebook       : student moleskine, marginalia, sticky-note abilities
*/

/* ═══════════════════════════════════════════════════
   G — MISSION CONTROL
   Telemetry feeds, oscilloscope traces, NASA-style.
   Same blueprint vocab but more "ground-station" than tactical-arena.
   ═══════════════════════════════════════════════════ */
function CombatMissionControl(){
  const [target, setTarget] = React.useState(2);
  const [picked, setPicked] = React.useState(null);
  const enemies = window.ENEMIES;
  const abilities = window.ABILITIES;
  // Generate static-but-deterministic waveform points for each enemy.
  const wave = (seed, n=64, amp=18) => {
    const pts = [];
    for (let i=0;i<n;i++){
      const v = Math.sin(i*0.4+seed)*amp + Math.sin(i*0.13+seed*2)*amp*0.4;
      pts.push([i*(220/n), 28-v*0.6]);
    }
    return pts.map(p=>p.join(',')).join(' ');
  };
  const Monitor = ({label, code, color, children, footer}) => (
    <div style={{border:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', minHeight:0}}>
      <div style={{display:'flex', alignItems:'center', padding:'4px 8px', borderBottom:'1px solid var(--line)', background:'var(--bg-3)'}}>
        <span className="cap" style={{color: color || 'var(--fg-3)'}}>● {label}</span>
        <span style={{flex:1}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.18em', color:'var(--fg-3)'}}>{code}</span>
      </div>
      <div style={{flex:1, padding:'8px 10px', minHeight:0, position:'relative', display:'flex', flexDirection:'column'}}>{children}</div>
      {footer && <div style={{padding:'3px 8px', borderTop:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)'}}>{footer}</div>}
    </div>
  );
  return (
    <div style={{height:'100%', overflow:'hidden', background:'var(--bg-1)', display:'grid',
      gridTemplateRows:'30px 1fr 28px', gridTemplateColumns:'1fr',
      backgroundImage:`linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
      backgroundSize:'48px 48px'}}>
      {/* mission line */}
      <div style={{display:'flex', alignItems:'center', padding:'0 16px', gap:18, borderBottom:'1px solid var(--line)', background:'var(--bg-2)'}}>
        <span style={{display:'inline-block', width:7, height:7, background:'var(--accent)', boxShadow:'0 0 6px var(--accent)'}}/>
        <span className="cap" style={{color:'var(--accent)'}}>ENGAGED</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-3)'}}>MISSION SB-301 · CH02 · WAVE 03/05</span>
        <span style={{flex:1}}/>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-3)'}}>T+ 00:24:18</span>
        <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-2)'}}>ALL SYS NOMINAL</span>
      </div>
      {/* main grid */}
      <div style={{display:'grid', gridTemplateColumns:'260px 1fr 280px', gridTemplateRows:'1fr auto auto', gap:8, padding:8, minHeight:0, overflow:'hidden'}}>
        {/* LEFT: 4 telemetry monitors */}
        <div style={{display:'grid', gridTemplateRows:'1fr 1fr 1fr 1fr', gap:8, gridRow:'1 / span 3', minHeight:0}}>
          <Monitor label="OPERATOR · HP" code="VIT-01" color="var(--hp)" footer="84 / 100 · STABLE">
            <svg viewBox="0 0 220 56" preserveAspectRatio="none" style={{width:'100%', height:50}}>
              <defs>
                <linearGradient id="hpg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="rgba(217,69,69,0.4)"/><stop offset="1" stopColor="transparent"/>
                </linearGradient>
              </defs>
              {[0,14,28,42].map(y=><line key={y} x1="0" y1={y} x2="220" y2={y} stroke="rgba(255,255,255,0.04)"/>)}
              <polyline points={wave(1)} fill="none" stroke="var(--hp)" strokeWidth="1.2"/>
              <polygon points={wave(1)+' 220,56 0,56'} fill="url(#hpg)"/>
            </svg>
          </Monitor>
          <Monitor label="STREAK · MULT" code="STK-02" color="var(--insight)" footer="×12 · APEX">
            <div style={{display:'flex', alignItems:'baseline', gap:4}}>
              <span style={{fontFamily:'var(--font-display)', fontSize:30, fontWeight:600, color:'var(--insight)', letterSpacing:'-0.02em'}}>12</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.18em'}}>×MULT</span>
            </div>
            <div style={{display:'flex', gap:2, marginTop:6}}>
              {Array.from({length:14}).map((_,i)=>(
                <div key={i} style={{flex:1, height:6, background: i<12?'var(--insight)':'var(--bg-3)', border:'1px solid var(--line)'}}/>
              ))}
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.16em', marginTop:6}}>NEXT TIER · 15</div>
          </Monitor>
          <Monitor label="INSIGHT · POOL" code="INS-03" color="var(--insight)" footer="142 STORED">
            <div style={{display:'grid', gridTemplateColumns:'repeat(10, 1fr)', gap:1}}>
              {Array.from({length:30}).map((_,i)=>(
                <div key={i} style={{aspectRatio:'1', background: i<14?'var(--insight-2)':'var(--bg-3)', border:'1px solid', borderColor: i<14?'var(--insight)':'var(--line)'}}/>
              ))}
            </div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.16em', marginTop:6}}>+12 / TURN · DECAY 0</div>
          </Monitor>
          <Monitor label="MOMENTUM · ECG" code="MOM-04" color="var(--accent)" footer="3 / 5 · BUILDING">
            <svg viewBox="0 0 220 56" preserveAspectRatio="none" style={{width:'100%', height:50}}>
              <polyline points="0,28 30,28 38,28 44,8 50,48 56,28 90,28 130,28 138,28 144,8 150,48 156,28 220,28"
                fill="none" stroke="var(--accent)" strokeWidth="1.4"/>
            </svg>
          </Monitor>
        </div>
        {/* CENTER TOP: enemy lineup as docked craft cards */}
        <div style={{border:'1px solid var(--line)', background:'var(--bg-2)', minHeight:0, display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'center', padding:'4px 10px', borderBottom:'1px solid var(--line)', background:'var(--bg-3)'}}>
            <span className="cap" style={{color:'var(--accent)'}}>● TRACKED OBJECTS · 4</span>
            <span style={{flex:1}}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)'}}>RANGE 02-08AU · TARGETING : LOCKED</span>
          </div>
          <div style={{flex:1, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0}}>
            {enemies.map((en, i)=>{
              const isT = i===target;
              return (
                <div key={en.id} onClick={()=>setTarget(i)} style={{
                  borderRight: i<3?'1px solid var(--line)':'none',
                  padding:'12px 10px', cursor:'pointer',
                  background: isT ? 'rgba(125,216,125,0.06)' : 'transparent',
                  display:'flex', flexDirection:'column', gap:6, position:'relative'
                }}>
                  {isT && [['tl',0,0],['tr',0,1],['bl',1,0],['br',1,1]].map(([k,y,x])=>(
                    <div key={k} style={{position:'absolute', top:y?'auto':3, bottom:y?3:'auto', left:x?'auto':3, right:x?3:'auto', width:8, height:8,
                      borderTop: y?0:'1px solid var(--accent)', borderBottom:y?'1px solid var(--accent)':0,
                      borderLeft: x?0:'1px solid var(--accent)', borderRight:x?'1px solid var(--accent)':0}}/>
                  ))}
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="sprite" style={{width:36, height:36, background:'transparent', border:'none'}}>
                      <window.Sprite rows={window.SPR[en.spr].rows} palette={window.SPR[en.spr].palette}/>
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, letterSpacing:'-0.005em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{en.name}</div>
                      <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:`var(--t-${en.tier})`}}>{en.tier.toUpperCase()} · LV{en.lv}</div>
                    </div>
                  </div>
                  <div style={{height:4, background:'var(--bg-3)', border:'1px solid var(--line)', position:'relative'}}>
                    <div style={{position:'absolute', inset:0, width:`${en.hp/en.max*100}%`, background:'var(--hp)'}}/>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', color:'var(--fg-3)'}}>
                    <span>{en.hp}/{en.max}</span><span>HEAT 0%</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:6, padding:'4px 6px', border:'1px solid var(--line)', background:'var(--bg-1)'}}>
                    <span style={{width:6, height:6, background: en.intent==='fatal_dmg'?'var(--i-heavy)':en.intent==='light_dmg'?'var(--i-light)':en.intent==='debuff'?'var(--i-debuff)':'var(--i-utility)'}}/>
                    <span style={{flex:1, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-1)'}}>{en.intentDesc}</span>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: en.intentVal? 'var(--hp)':'var(--fg-3)', fontWeight:600}}>{en.intentVal||'—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* CENTER MID: question = "INCOMING TRANSMISSION" */}
        <div style={{border:'1px solid var(--line)', background:'var(--bg-2)'}}>
          <div style={{display:'flex', alignItems:'center', padding:'4px 10px', borderBottom:'1px solid var(--line)', background:'var(--bg-3)'}}>
            <span style={{display:'inline-block', width:6, height:6, background:'var(--accent)', marginRight:6, animation:'sb-blink 1s steps(1) infinite'}}/>
            <span className="cap" style={{color:'var(--accent)'}}>INCOMING TRANSMISSION · DECODE</span>
            <span style={{flex:1}}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>SIGNAL 87% · DELTA 0.4MS · CH 04</span>
          </div>
          <div style={{padding:'14px 18px'}}>
            <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:10}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-3)'}}>FREQ NEUR.301.SLEEP //</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>Q.03 / 12</span>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, lineHeight:1.35, color:'var(--fg)', textWrap:'pretty', letterSpacing:'-0.01em'}}>
              Which sleep stage is most strongly associated with declarative memory consolidation?
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6, marginTop:14}}>
              {['NREM 1 · light','NREM 3 · slow-wave','REM · paradoxical','Wakeful · resting'].map((opt, i)=>{
                const k = ['A','B','C','D'][i];
                const isP = picked===i;
                return (
                  <div key={i} onClick={()=>setPicked(i)} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                    border: `1px solid ${isP?'var(--accent)':'var(--line)'}`,
                    background: isP?'rgba(125,216,125,0.08)':'var(--bg-1)',
                    cursor:'pointer', transition:'all 100ms'
                  }}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color: isP?'var(--accent)':'var(--fg-3)', width:14}}>{k}</span>
                    <span style={{fontFamily:'var(--font-body)', fontSize:13, color: isP?'var(--fg)':'var(--fg-1)'}}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* CENTER BOTTOM: launch hotbar */}
        <div style={{border:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'stretch'}}>
          <div style={{padding:'8px 10px', borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', justifyContent:'center', minWidth:90}}>
            <span className="cap" style={{color:'var(--accent)'}}>LAUNCH</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>HOLD TO ARM</span>
          </div>
          {abilities.map((a, i)=>(
            <div key={a.id} style={{
              flex:1, padding:'8px 12px', borderRight: i<4?'1px solid var(--line)':'none',
              display:'flex', flexDirection:'column', gap:4, cursor:'pointer',
              background: i===0?'rgba(125,216,125,0.06)':'transparent'
            }}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)', border:'1px solid var(--line)', padding:'1px 4px', background:'var(--bg-1)'}}>{a.key}</span>
                <span style={{fontFamily:'var(--font-display)', fontSize:12, fontWeight:600}}>{a.name}</span>
                <span style={{flex:1}}/>
                <span style={{fontFamily:'var(--font-mono)', fontSize:9, color: a.tier==='basic'?'var(--t-common)':a.tier==='core'?'var(--t-rare)':'var(--t-epic)', letterSpacing:'0.18em'}}>{a.tier}</span>
              </div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.14em'}}>{a.desc}</div>
              <div style={{display:'flex', gap:3, marginTop:2}}>
                {Array.from({length:5}).map((_,j)=>(
                  <div key={j} style={{flex:1, height:2, background: a.cd>0 && j<a.cd?'var(--bg-3)':'var(--accent)'}}/>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* RIGHT: telemetry log */}
        <div style={{gridRow:'1 / span 3', border:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', minHeight:0}}>
          <div style={{padding:'4px 10px', borderBottom:'1px solid var(--line)', background:'var(--bg-3)', display:'flex', alignItems:'center'}}>
            <span className="cap" style={{color:'var(--accent)'}}>● MISSION LOG · LIVE</span>
            <span style={{flex:1}}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.16em'}}>tail -f</span>
          </div>
          <div style={{flex:1, overflow:'hidden', padding:'8px 10px', display:'flex', flexDirection:'column', gap:5}}>
            {[
              ['T+24:18', 'CH04 · Adjunct charges Exam Failure', 'var(--i-heavy)'],
              ['T+24:14', 'Hit Bookworm · 14 dmg · CRIT', 'var(--accent)'],
              ['T+24:10', 'Streak ↑ ×12 · Flurry primed', 'var(--insight)'],
              ['T+24:06', '+12 HP · Buffer pet heal', 'var(--accent)'],
              ['T+24:02', 'Pop Quiz spawned · 3 ahead', 'var(--fg-2)'],
              ['T+23:58', 'Cyberpunk biome · +15% active', 'var(--fg-2)'],
              ['T+23:52', 'Wave 02 cleared · 4 augments', 'var(--fg-2)'],
              ['T+23:46', 'Engaged Glitch Wraith · debuff', 'var(--i-debuff)'],
              ['T+23:38', 'Mistake · streak broken at 8', 'var(--hp)'],
              ['T+23:30', 'Engaged Bookworm Swarm', 'var(--fg-2)'],
            ].map(([t,m,c],i)=>(
              <div key={i} style={{display:'flex', gap:8, fontFamily:'var(--font-mono)', fontSize:10, lineHeight:1.4}}>
                <span style={{color:'var(--fg-3)', letterSpacing:'0.1em'}}>{t}</span>
                <span style={{color:c, flex:1, letterSpacing:'-0.005em'}}>{m}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 10px', borderTop:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)'}}>
            10 / 247 EVENTS · UPLINK STABLE
          </div>
        </div>
      </div>
      {/* status footer */}
      <div style={{display:'flex', alignItems:'center', padding:'0 16px', gap:14, borderTop:'1px solid var(--line)', background:'var(--bg-2)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)', textTransform:'uppercase'}}>
        <span style={{color:'var(--accent)'}}>● TRANSMITTING</span>
        <span>Q-A/B/C/D · 1-5 LAUNCH · TAB CYCLE</span>
        <span style={{flex:1}}/>
        <span>BIOME · CYBERPUNK +15%</span>
        <span>·</span>
        <span>FPS 60 · 17:42</span>
      </div>
      <style>{`@keyframes sb-blink{50%{opacity:0.2}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   H — TERMINAL
   Pure VT100 / ANSI text. No graphics. The whole HUD is a tail-log.
   ═══════════════════════════════════════════════════ */
function CombatTerminal(){
  const [picked, setPicked] = React.useState(1);
  const enemies = window.ENEMIES;
  const abilities = window.ABILITIES;
  const C = ({c, children}) => <span style={{color:'var(--'+c+')'}}>{children}</span>;
  const bar = (n, max=20) => '█'.repeat(Math.round(n/max*20)) + '░'.repeat(20-Math.round(n/max*20));
  return (
    <div style={{
      height:'100%', overflow:'hidden', background:'#06080a',
      fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.4, color:'var(--fg-1)',
      padding:'12px 18px', display:'flex', flexDirection:'column', gap:0,
      backgroundImage:'repeating-linear-gradient(0deg, transparent 0 2px, rgba(125,216,125,0.012) 2px 3px)'
    }}>
      <pre style={{margin:0, color:'var(--fg-3)'}}>{`╔═════════════════════════════════════════════════════════════════════════════╗`}</pre>
      <pre style={{margin:0}}><C c="accent">{` $ studybuddy --combat --biome=cyberpunk --module=NEUR-301 --ch=2`}</C></pre>
      <pre style={{margin:0, color:'var(--fg-3)'}}>{`  combat session 0xA9F4 started · wave 03/05 · t+00:24:18 · streak ×12`}</pre>
      <pre style={{margin:0, color:'var(--fg-3)'}}>{`╚═════════════════════════════════════════════════════════════════════════════╝`}</pre>
      <pre style={{margin:'10px 0 4px 0', color:'var(--fg-3)'}}>{`── operator ──────────────────────────────────────────────────────────────────`}</pre>
      <pre style={{margin:0}}>{`  CARETAKER-07 lv7   `}<C c="hp">{`HP [`}{bar(84,100)}{`] 84/100`}</C>{`   `}<C c="block">BLK 0</C>{`   `}<C c="insight">INS 142</C>{`   `}<C c="accent">×12</C></pre>
      <pre style={{margin:0, color:'var(--fg-3)'}}>{`  weapon caveman_club lv6 · atk +5 · xp ×0.90 · sockets [4/4]`}</pre>
      <pre style={{margin:'10px 0 4px 0', color:'var(--fg-3)'}}>{`── lineup ────────────────────────────────────────────────────────────────────`}</pre>
      {enemies.map((en, i)=>{
        const tColor = en.tier==='common'?'t-common':en.tier==='rare'?'t-rare':en.tier==='epic'?'t-epic':'t-mythic';
        const intColor = en.intent==='fatal_dmg'?'i-heavy':en.intent==='light_dmg'?'i-light':en.intent==='debuff'?'i-debuff':'i-utility';
        return (
          <pre key={en.id} style={{margin:0}}>
            {`  [${i+1}] `}<C c={tColor}>{en.tier.toUpperCase().padEnd(7)}</C>{` ${en.name.padEnd(16)} lv${en.lv} `}<C c="hp">{`[${bar(en.hp,en.max).slice(0,16)}]`}</C>{` ${en.hp.toString().padStart(3)}/${en.max} → `}<C c={intColor}>{`${en.intentDesc.padEnd(12)} ${en.intentVal||'—'}`}</C>
          </pre>
        );
      })}
      <pre style={{margin:'10px 0 4px 0', color:'var(--fg-3)'}}>{`── question · NEUR.301.CH02.Q03 ──────────────────────────────────────────────`}</pre>
      <pre style={{margin:0, color:'var(--fg)', textWrap:'pretty', whiteSpace:'pre-wrap'}}>{`  > Which sleep stage is most strongly associated with declarative memory`}</pre>
      <pre style={{margin:0, color:'var(--fg)'}}>{`    consolidation?`}</pre>
      <pre style={{margin:'8px 0 0 0'}}>
        {['NREM 1 · light sleep','NREM 3 · slow-wave','REM · paradoxical','Wakeful rest · baseline'].map((opt,i)=>{
          const k = ['a','b','c','d'][i];
          const isP = picked===i;
          return (
            <div key={i} onClick={()=>setPicked(i)} style={{cursor:'pointer'}}>
              <span style={{color: isP?'var(--accent)':'var(--fg-3)'}}>{isP?'  ▸ ':'    '}</span>
              <span style={{color: isP?'var(--accent)':'var(--fg-2)'}}>{`[${k}]`}</span>
              <span style={{color: isP?'var(--fg)':'var(--fg-1)'}}>{` ${opt}`}</span>
            </div>
          );
        })}
      </pre>
      <pre style={{margin:'10px 0 4px 0', color:'var(--fg-3)'}}>{`── hotbar ────────────────────────────────────────────────────────────────────`}</pre>
      <pre style={{margin:0}}>
        {abilities.map((a, i)=>{
          const tc = a.tier==='basic'?'t-common':a.tier==='core'?'t-rare':'t-epic';
          return (
            <span key={a.id}>
              <C c="accent">{`[${a.key}]`}</C>
              <C c={tc}>{` ${a.name.padEnd(16)}`}</C>
              <span style={{color:'var(--fg-3)'}}>{`${a.cd>0?` cd ${a.cd}`:'      '}`}</span>
              {i<abilities.length-1 && <span style={{color:'var(--fg-4)'}}>{`  │  `}</span>}
            </span>
          );
        })}
      </pre>
      <pre style={{margin:'10px 0 4px 0', color:'var(--fg-3)'}}>{`── log · tail -f ─────────────────────────────────────────────────────────────`}</pre>
      <div style={{flex:1, overflow:'hidden'}}>
        {[
          ['t+24:18', 'crit', 'CRIT · hit bookworm for 14 (×1.6 mult)'],
          ['t+24:14', 'sys',  'streak ↑ ×12 · flurry primed'],
          ['t+24:10', 'enemy','adjunct.charge_exam_failure() telegraphed'],
          ['t+24:06', 'sys',  'pet hoot-ini · +12 hp · 1 charge remaining'],
          ['t+24:02', 'biome','cyberpunk applied · +15% active dmg'],
          ['t+23:58', 'sys',  'wave 02 cleared · 4 augments offered'],
          ['t+23:52', 'mistake','streak broken at 8 · -18 hp'],
        ].map(([t,k,m],i)=>(
          <pre key={i} style={{margin:0}}>
            <span style={{color:'var(--fg-4)'}}>{` ${t} `}</span>
            <span style={{color: k==='crit'?'var(--accent)':k==='enemy'?'var(--i-heavy)':k==='mistake'?'var(--hp)':k==='biome'?'var(--insight)':'var(--fg-3)'}}>{`[${k.padEnd(7)}]`}</span>
            <span style={{color:'var(--fg-1)'}}>{` ${m}`}</span>
          </pre>
        ))}
      </div>
      <pre style={{margin:0, color:'var(--fg-3)'}}>{`──────────────────────────────────────────────────────────────────────────────`}</pre>
      <pre style={{margin:0, color:'var(--fg-3)'}}>
        {` `}<C c="accent">{`▸`}</C>{` ready · q-a/b/c/d to answer · 1-5 hotbar · tab cycle target · esc menu`}
        <span style={{float:'right'}}><C c="accent">●</C> uplink</span>
      </pre>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   I — JRPG / Pokémon battle box
   Sprites top-half, dialog box bottom-half with menu.
   On-brand for an answer-driven study game.
   ═══════════════════════════════════════════════════ */
function CombatJRPG(){
  const [target, setTarget] = React.useState(2);
  const [picked, setPicked] = React.useState(null);
  const [menuTab, setMenuTab] = React.useState('answer');
  const enemies = window.ENEMIES;
  const E = enemies[target];
  return (
    <div style={{
      height:'100%', overflow:'hidden', background:'#06090a', position:'relative',
      display:'grid', gridTemplateRows:'1fr 320px', fontFamily:'var(--font-display)'
    }}>
      {/* sky / arena */}
      <div style={{position:'relative', overflow:'hidden',
        background:`
          radial-gradient(40% 60% at 30% 30%, rgba(125,216,125,0.10), transparent 70%),
          radial-gradient(50% 70% at 80% 70%, rgba(176,118,255,0.06), transparent 70%),
          repeating-linear-gradient(0deg, transparent 0 24px, rgba(255,255,255,0.018) 24px 25px),
          var(--bg-1)`
      }}>
        {/* horizon line */}
        <div style={{position:'absolute', left:0, right:0, top:'62%', height:1, background:'var(--line-2)'}}/>
        {/* enemy lineup top — 4 sprites at varying x */}
        <div style={{position:'absolute', inset:0, padding:'40px 60px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          {enemies.map((en, i)=>{
            const isT = i===target;
            return (
              <div key={en.id} onClick={()=>setTarget(i)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer',
                opacity: en.hp<=0?0.25:1, transform: isT ? 'translateY(-4px)' : 'none', transition:'transform 200ms'
              }}>
                {/* nameplate */}
                <div style={{
                  border: `2px solid ${isT?'var(--accent)':'var(--line-2)'}`,
                  background:'rgba(10,13,14,0.85)', padding:'6px 10px', minWidth:160,
                  boxShadow: isT ? '0 0 0 2px var(--bg-1), 0 0 0 3px var(--accent)' : 'none'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                    <span style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, letterSpacing:'0.03em'}}>{en.name.toUpperCase()}</span>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)'}}>:Lv{en.lv}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4}}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-3)', letterSpacing:'0.16em'}}>HP</span>
                    <div style={{flex:1, height:5, background:'var(--bg-3)', border:'1px solid var(--line)'}}>
                      <div style={{height:'100%', width:`${en.hp/en.max*100}%`, background: en.hp/en.max<0.3?'var(--hp)':en.hp/en.max<0.6?'var(--insight)':'var(--accent)'}}/>
                    </div>
                  </div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.14em', marginTop:3, display:'flex', justifyContent:'space-between'}}>
                    <span>{en.hp}/{en.max}</span>
                    <span style={{color:`var(--t-${en.tier})`}}>{en.tier.toUpperCase()}</span>
                  </div>
                </div>
                {/* sprite — bigger if targeted */}
                <div className="sprite" style={{
                  width: isT ? 96 : 72, height: isT ? 96 : 72, background:'transparent', border:'none',
                  filter: isT ? 'drop-shadow(0 0 12px rgba(125,216,125,0.5))' : 'none', transition:'all 200ms'
                }}>
                  <window.Sprite rows={window.SPR[en.spr].rows} palette={window.SPR[en.spr].palette}/>
                </div>
                {isT && (
                  <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.2em', textTransform:'uppercase'}}>
                    ▼ TARGET
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* player back-sprite bottom-left */}
        <div style={{position:'absolute', left:80, bottom:10, display:'flex', flexDirection:'column', alignItems:'flex-start', gap:8}}>
          <div className="sprite" style={{width:120, height:120, background:'transparent', border:'none', transform:'scaleX(-1)'}}>
            <window.Sprite rows={window.SPR.bookworm.rows} palette={window.SPR.bookworm.palette}/>
          </div>
        </div>
        {/* player nameplate bottom-right */}
        <div style={{position:'absolute', right:60, bottom:20, border:'2px solid var(--line-2)', background:'rgba(10,13,14,0.85)', padding:'10px 14px', minWidth:240}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <span style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, letterSpacing:'0.03em'}}>CARETAKER-07</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)'}}>:Lv7</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:6}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:8, color:'var(--accent)', letterSpacing:'0.16em'}}>HP</span>
            <div style={{flex:1, height:6, background:'var(--bg-3)', border:'1px solid var(--line)'}}>
              <div style={{height:'100%', width:'84%', background:'var(--accent)'}}/>
            </div>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent)', fontWeight:600}}>84/100</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:5}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:8, color:'var(--insight)', letterSpacing:'0.16em'}}>XP</span>
            <div style={{flex:1, height:3, background:'var(--bg-3)', border:'1px solid var(--line)'}}>
              <div style={{height:'100%', width:'56%', background:'var(--insight)'}}/>
            </div>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--insight)'}}>680/1200</span>
          </div>
        </div>
      </div>
      {/* bottom dialog box — the iconic Pokémon prompt with menu */}
      <div style={{
        background:'#0c1011', border:'4px double var(--line-3)', margin:'0 12px 12px',
        display:'grid', gridTemplateColumns:'1fr 280px', boxShadow:'inset 0 0 0 2px var(--bg-1)'
      }}>
        {/* left: prompt */}
        <div style={{padding:'18px 24px', borderRight:'2px solid var(--line-2)', display:'flex', flexDirection:'column', gap:10, justifyContent:'space-between'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <span style={{display:'inline-block', width:8, height:8, background:'var(--accent)'}}/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>{E.name.toUpperCase()} ASKS:</span>
              <span style={{flex:1, height:1, background:'var(--line)'}}/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>Q.03/12</span>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:21, fontWeight:600, lineHeight:1.32, color:'var(--fg)', textWrap:'pretty', letterSpacing:'-0.01em'}}>
              Which sleep stage is most strongly associated with declarative memory consolidation?
              <span style={{display:'inline-block', width:10, height:14, background:'var(--accent)', marginLeft:6, verticalAlign:'baseline', animation:'sb-jrpg-blink 0.6s steps(1) infinite'}}/>
            </div>
          </div>
          {menuTab==='answer' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
              {['NREM 1','NREM 3 · slow-wave','REM','Wakeful rest'].map((opt, i)=>{
                const k = ['A','B','C','D'][i];
                const isP = picked===i;
                return (
                  <div key={i} onClick={()=>setPicked(i)} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                    border:'1px solid var(--line)',
                    background: isP?'var(--accent)':'var(--bg-2)',
                    color: isP?'var(--bg-1)':'var(--fg-1)',
                    cursor:'pointer',
                    fontFamily:'var(--font-display)', fontSize:14, fontWeight:600
                  }}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: isP?'var(--bg-1)':'var(--accent)', minWidth:14}}>{isP?'▸':' '}{k}</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
          )}
          {menuTab==='ability' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
              {window.ABILITIES.slice(0,4).map(a=>(
                <div key={a.id} style={{padding:'10px 12px', border:'1px solid var(--line)', background:'var(--bg-2)', cursor:'pointer'}}>
                  <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600}}>{a.name}</div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.14em', marginTop:2}}>{a.desc}</div>
                </div>
              ))}
            </div>
          )}
          {menuTab==='item' && (
            <div style={{padding:14, fontFamily:'var(--font-display)', fontSize:13, color:'var(--fg-2)', textAlign:'center', border:'1px dashed var(--line)'}}>
              No items in pouch. Visit Workshop to forge.
            </div>
          )}
          {menuTab==='run' && (
            <div style={{padding:14, fontFamily:'var(--font-display)', fontSize:13, color:'var(--hp)', textAlign:'center', border:'1px dashed var(--hp)'}}>
              Cannot escape — wave gauntlet locked.
            </div>
          )}
        </div>
        {/* right: menu */}
        <div style={{padding:'14px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'auto auto', gap:6, alignContent:'start'}}>
          {[
            ['answer','ANSWER','▶'],
            ['ability','ABILITY','✱'],
            ['item','ITEM','◆'],
            ['run','RUN','✕'],
          ].map(([k, l, ic])=>{
            const isA = menuTab===k;
            return (
              <div key={k} onClick={()=>setMenuTab(k)} style={{
                padding:'14px 12px', border:'1px solid var(--line-2)',
                background: isA?'var(--accent)':'var(--bg-2)', color: isA?'var(--bg-1)':'var(--fg-1)',
                cursor:'pointer', fontFamily:'var(--font-display)', fontSize:14, fontWeight:700,
                letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:8
              }}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:14}}>{isA?'▸':' '}</span>
                <span>{l}</span>
                <span style={{flex:1}}/>
                <span style={{opacity:0.5, fontSize:12}}>{ic}</span>
              </div>
            );
          })}
          <div style={{gridColumn:'1 / span 2', borderTop:'1px solid var(--line)', paddingTop:8, marginTop:4, display:'flex', flexDirection:'column', gap:4}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>STREAK ×12 · INSIGHT 142 · BIOME +15%</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--accent)'}}>● A/B/C/D · 1-5 ABILITY · TAB TARGET</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes sb-jrpg-blink{50%{opacity:0}}`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   J — FIGHT CARD
   Boxing VS poster. Two slabs left/right, oversized type, bell-round timer.
   ═══════════════════════════════════════════════════ */
function CombatFightCard(){
  const [picked, setPicked] = React.useState(null);
  const enemies = window.ENEMIES;
  const opp = enemies[2]; // glitch wraith as featured
  const Slab = ({side, name, sub, record, lv, weight, sprite, color}) => (
    <div style={{
      padding:'24px 20px', display:'flex', flexDirection:'column', justifyContent:'space-between',
      background: side==='L' ? 'linear-gradient(135deg, #0f1314 0%, #14181a 100%)' : 'linear-gradient(225deg, #14101a 0%, #0f0c14 100%)',
      borderRight: side==='L' ? '1px solid var(--line)' : 'none',
      position:'relative', overflow:'hidden', minHeight:0
    }}>
      {/* corner brackets */}
      {[['tl',0,0],['tr',0,1],['bl',1,0],['br',1,1]].map(([k,y,x])=>(
        <div key={k} style={{position:'absolute', top:y?'auto':12, bottom:y?12:'auto', left:x?'auto':12, right:x?12:'auto', width:20, height:20,
          borderTop: y?0:`2px solid ${color}`, borderBottom:y?`2px solid ${color}`:0,
          borderLeft: x?0:`2px solid ${color}`, borderRight:x?`2px solid ${color}`:0}}/>
      ))}
      {/* big number */}
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.24em', color:'var(--fg-3)'}}>{side==='L'?'BLUE CORNER':'RED CORNER'}</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color, marginTop:4}}>{record}</div>
        </div>
        <div style={{fontFamily:'var(--font-display)', fontSize:48, fontWeight:700, color, lineHeight:1, letterSpacing:'-0.04em'}}>{lv}</div>
      </div>
      {/* sprite */}
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', flex:1, padding:'12px 0'}}>
        <div className="sprite" style={{
          width:200, height:200, background:'transparent', border:'none',
          filter:`drop-shadow(0 0 24px ${color}40)`,
          transform: side==='L' ? 'none' : 'scaleX(-1)'
        }}>
          <window.Sprite rows={window.SPR[sprite].rows} palette={window.SPR[sprite].palette}/>
        </div>
      </div>
      {/* name */}
      <div>
        <div style={{fontFamily:'var(--font-display)', fontSize:34, fontWeight:700, lineHeight:1, letterSpacing:'-0.03em', textWrap:'balance'}}>{name}</div>
        <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.2em', color:'var(--fg-2)', marginTop:6, textTransform:'uppercase'}}>"{sub}"</div>
        <div style={{display:'flex', gap:6, marginTop:14, flexWrap:'wrap'}}>
          {weight.map(([k,v])=>(
            <div key={k} style={{padding:'4px 8px', border:`1px solid ${color}`, background:'var(--bg-1)'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.18em', color:'var(--fg-3)'}}>{k}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color, marginLeft:6, fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{
      height:'100%', overflow:'hidden', background:'#08090a',
      backgroundImage:`
        radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 60%),
        radial-gradient(40% 30% at 50% 100%, rgba(125,216,125,0.05), transparent 60%)
      `,
      display:'grid', gridTemplateRows:'56px 1fr 220px', gridTemplateColumns:'1fr',
      position:'relative'
    }}>
      {/* top: round + bell + crowd */}
      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', padding:'0 24px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span className="cap" style={{color:'var(--accent)'}}>● MAIN CARD</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-3)'}}>NEUR-301 · ARENA · CH 2</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:18, padding:'0 32px', borderLeft:'1px solid var(--line)', borderRight:'1px solid var(--line)'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.24em', color:'var(--fg-3)'}}>ROUND</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--accent)', letterSpacing:'-0.02em'}}>03 / 12</div>
          </div>
          <div style={{width:1, height:30, background:'var(--line)'}}/>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.24em', color:'var(--fg-3)'}}>BELL IN</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:22, fontWeight:600, color:'var(--insight)', fontVariantNumeric:'tabular-nums'}}>00:18</div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, justifyContent:'flex-end'}}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--fg-3)'}}>CROWD ROAR ▮▮▮▮▮▯▯</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color:'var(--accent)'}}>STREAK ×12</span>
        </div>
      </div>
      {/* slabs + giant VS */}
      <div style={{position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:0}}>
        <Slab side="L"
          name="CARETAKER-07" sub="The Caveman"
          record="14W · 3L · 1D"
          lv="L7"
          weight={[['HP','100'],['ATK','+5'],['CRIT','18%'],['STREAK','×12']]}
          sprite="bookworm" color="var(--accent)"/>
        <Slab side="R"
          name="GLITCH WRAITH" sub="Anti-Magic Phantom"
          record="ELITE · 6 KILLS"
          lv={`L${opp.lv}`}
          weight={[['HP',`${opp.hp}/${opp.max}`],['INT','GARBLE'],['DEF','-5'],['TIER','EPIC']]}
          sprite="glitch" color="var(--t-epic)"/>
        {/* center VS */}
        <div style={{position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
          <div style={{
            width:78, height:78, border:'2px solid var(--accent)', background:'var(--bg-1)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontSize:34, fontWeight:700, color:'var(--accent)',
            boxShadow:'0 0 0 4px var(--bg-1), 0 0 0 5px var(--accent), 0 0 60px rgba(125,216,125,0.4)',
            letterSpacing:'-0.02em'
          }}>VS</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.3em', color:'var(--fg-3)'}}>ROUND 03</div>
        </div>
      </div>
      {/* bottom: question slab + corner stools (hotbar) */}
      <div style={{display:'grid', gridTemplateColumns:'120px 1fr 120px', borderTop:'1px solid var(--line)', background:'var(--bg-2)'}}>
        {/* blue corner stool */}
        <div style={{padding:14, borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:6}}>
          <span className="cap" style={{color:'var(--accent)'}}>BLUE</span>
          {window.ABILITIES.slice(0,3).map(a=>(
            <div key={a.id} style={{display:'flex', alignItems:'center', gap:6, padding:'4px 6px', border:'1px solid var(--line)', background:'var(--bg-1)', cursor:'pointer'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--accent)'}}>{a.key}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</span>
            </div>
          ))}
        </div>
        {/* question — bell-round prompt */}
        <div style={{padding:'14px 22px', display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.24em', color:'var(--accent)'}}>● BELL · ROUND 03 QUESTION</span>
            <span style={{flex:1, height:1, background:'var(--line)'}}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color:'var(--fg-3)'}}>NEUR.301.CH02.Q03</span>
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, lineHeight:1.3, color:'var(--fg)', textWrap:'pretty', letterSpacing:'-0.01em'}}>
            Which sleep stage is most strongly associated with declarative memory consolidation?
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:5}}>
            {['NREM 1','NREM 3','REM','Wakeful'].map((opt, i)=>{
              const k = ['A','B','C','D'][i];
              const isP = picked===i;
              return (
                <div key={i} onClick={()=>setPicked(i)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                  border: `1px solid ${isP?'var(--accent)':'var(--line)'}`,
                  background: isP?'rgba(125,216,125,0.08)':'var(--bg-1)',
                  cursor:'pointer'
                }}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:10, color: isP?'var(--accent)':'var(--fg-3)', letterSpacing:'0.18em'}}>{k}</span>
                  <span style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600}}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* red corner stool */}
        <div style={{padding:14, borderLeft:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end'}}>
          <span className="cap" style={{color:'var(--t-epic)'}}>RED</span>
          {window.ABILITIES.slice(2,5).map(a=>(
            <div key={a.id} style={{display:'flex', alignItems:'center', gap:6, padding:'4px 6px', border:'1px solid var(--line)', background:'var(--bg-1)', cursor:'pointer', width:'100%', justifyContent:'flex-end'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--accent)'}}>{a.key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   K — NOTEBOOK
   Student moleskine — lined paper, marginalia, sticky-note hotbar.
   On-brand for "studying turns into combat".
   ═══════════════════════════════════════════════════ */
function CombatNotebook(){
  const [picked, setPicked] = React.useState(null);
  const enemies = window.ENEMIES.slice(0,3);
  return (
    <div style={{
      height:'100%', overflow:'hidden', position:'relative',
      background:`
        repeating-linear-gradient(0deg, transparent 0 27px, rgba(91,141,239,0.07) 27px 28px),
        linear-gradient(90deg, transparent 0 79px, rgba(217,69,69,0.18) 79px 80px, transparent 80px 100%),
        #f6efe3
      `,
      backgroundColor:'#f6efe3', color:'#1a1716',
      display:'grid', gridTemplateColumns:'90px 1fr 320px', gridTemplateRows:'1fr',
      fontFamily:'"Caveat", "Patrick Hand", "Bricolage Grotesque", serif'
    }}>
      {/* spiral binding */}
      <div style={{position:'absolute', left:0, top:0, bottom:0, width:30, display:'flex', flexDirection:'column', justifyContent:'space-around', padding:'20px 0', zIndex:5}}>
        {Array.from({length:18}).map((_,i)=>(
          <div key={i} style={{width:10, height:10, borderRadius:'50%', background:'#aaa', boxShadow:'inset 1px 1px 2px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)', marginLeft:10}}/>
        ))}
      </div>
      {/* margin: enemy doodles */}
      <div style={{padding:'30px 8px 12px 36px', display:'flex', flexDirection:'column', gap:20}}>
        <div style={{fontFamily:'"Patrick Hand", cursive', fontSize:14, color:'#5b3a1e', transform:'rotate(-3deg)'}}>NEUR-301<br/><span style={{fontSize:11, color:'#9b6a3e'}}>ch.2 sleep</span></div>
      </div>
      {/* center: page with question */}
      <div style={{padding:'40px 60px 20px 36px', position:'relative', overflow:'hidden'}}>
        {/* date scrawl */}
        <div style={{position:'absolute', top:14, right:30, fontFamily:'"Caveat", cursive', fontSize:18, color:'#5b3a1e', transform:'rotate(2deg)'}}>
          tue 09 may · pg 24
        </div>
        {/* question header — circled q-number */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
          <div style={{
            width:48, height:48, border:'2.5px solid #c44', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'"Caveat", cursive', fontSize:28, fontWeight:600, color:'#c44',
            transform:'rotate(-4deg)'
          }}>Q3</div>
          <div style={{fontFamily:'"Patrick Hand", cursive', fontSize:18, color:'#3a2e1e', flex:1}}>
            <span style={{textDecoration:'underline'}}>sleep stages & memory</span>
            <span style={{color:'#9b6a3e', marginLeft:12, fontSize:14}}>← important!! ★</span>
          </div>
        </div>
        {/* the prompt — handwritten */}
        <div style={{fontFamily:'"Caveat", "Patrick Hand", cursive', fontSize:28, lineHeight:'56px', color:'#1a1716', textWrap:'pretty', letterSpacing:'0.005em'}}>
          which sleep stage is most strongly associated w/ <span style={{background:'rgba(231,193,75,0.5)', padding:'0 4px'}}>declarative</span> memory consolidation?
        </div>
        {/* options — with hand-drawn checkboxes */}
        <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:10}}>
          {[
            ['NREM 1','light sleep'],
            ['NREM 3','slow-wave (SWS)'],
            ['REM','rapid-eye / paradoxical'],
            ['Wakeful rest','baseline'],
          ].map(([t, sub], i)=>{
            const isP = picked===i;
            return (
              <div key={i} onClick={()=>setPicked(i)} style={{display:'flex', alignItems:'center', gap:14, cursor:'pointer'}}>
                {/* checkbox sketch */}
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <rect x="3" y="3" width="18" height="18" fill="none" stroke="#1a1716" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-2 12 12)"/>
                  {isP && <path d="M 5 12 L 11 17 L 19 6" fill="none" stroke="#c44" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>}
                </svg>
                <div style={{display:'flex', alignItems:'baseline', gap:10, flex:1, fontFamily:'"Caveat", cursive', fontSize:24, lineHeight:1.1}}>
                  <span style={{color: isP?'#c44':'#3a2e1e', fontWeight:600}}>({['a','b','c','d'][i]})</span>
                  <span style={{color: isP?'#1a1716':'#3a2e1e', textDecoration: isP?'underline':'none'}}>{t}</span>
                  <span style={{fontFamily:'"Patrick Hand", cursive', fontSize:14, color:'#9b6a3e', marginLeft:6}}>— {sub}</span>
                </div>
                {isP && <div style={{fontFamily:'"Caveat", cursive', fontSize:18, color:'#3a8a3a', transform:'rotate(-4deg)'}}>← my pick!</div>}
              </div>
            );
          })}
        </div>
        {/* bottom margin doodle */}
        <div style={{position:'absolute', bottom:18, left:60, display:'flex', alignItems:'center', gap:14, fontFamily:'"Patrick Hand", cursive', fontSize:14, color:'#9b6a3e'}}>
          <span>streak ×12</span>
          <span style={{display:'inline-flex', gap:4}}>
            {Array.from({length:12}).map((_,i)=><span key={i} style={{width:6, height:6, background:'#3a8a3a', borderRadius:'50%'}}/>)}
          </span>
          <span style={{transform:'rotate(-2deg)'}}>!! 💪</span>
        </div>
      </div>
      {/* RIGHT: index-card lineup + sticky-note hotbar */}
      <div style={{
        background:'#efe5d2', borderLeft:'1px dashed rgba(40,40,40,0.2)',
        padding:'20px 18px 14px', display:'flex', flexDirection:'column', gap:18, position:'relative', overflow:'hidden'
      }}>
        <div style={{fontFamily:'"Caveat", cursive', fontSize:22, color:'#3a2e1e', borderBottom:'2px solid #c44', paddingBottom:6}}>opponents:</div>
        {/* enemy index-card stack */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {enemies.map((en, i)=>(
            <div key={en.id} style={{
              padding:'10px 12px', background:'#fafafa',
              boxShadow:`${i*2-2}px ${i*2}px 0 rgba(0,0,0,0.08), ${i*2-1}px ${i*2+1}px 4px rgba(0,0,0,0.18)`,
              transform:`rotate(${i%2?1.4:-1.6}deg)`, position:'relative',
              borderTop:'2px solid #b09563'
            }}>
              <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                <div style={{width:32, height:32, flexShrink:0}}>
                  <div className="sprite" style={{width:'100%', height:'100%', background:'transparent', border:'none'}}>
                    <window.Sprite rows={window.SPR[en.spr].rows} palette={window.SPR[en.spr].palette}/>
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'"Caveat", cursive', fontSize:18, fontWeight:600, color:'#1a1716', lineHeight:1.1}}>{en.name}</div>
                  <div style={{fontFamily:'"Patrick Hand", cursive', fontSize:12, color:'#9b6a3e'}}>lv{en.lv} · "{en.intentDesc.toLowerCase()}"</div>
                  <div style={{height:3, background:'#e6dcc8', marginTop:6, position:'relative'}}>
                    <div style={{position:'absolute', inset:0, width:`${en.hp/en.max*100}%`, background:'#c44'}}/>
                  </div>
                  <div style={{fontFamily:'"Patrick Hand", cursive', fontSize:11, color:'#3a2e1e', marginTop:2}}>{en.hp}/{en.max} hp</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* sticky-note hotbar */}
        <div style={{position:'absolute', bottom:14, left:14, right:14, display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:4}}>
          {[
            {n:'Flash', k:'1', c:'#ffe066'},
            {n:'Recall', k:'2', c:'#ffb3c1'},
            {n:'Fill', k:'3', c:'#9bd0a0'},
            {n:'Cram', k:'4', c:'#a3c4f3'},
            {n:'Crit', k:'5', c:'#f5b7b1'},
          ].map((s, i)=>(
            <div key={i} style={{
              padding:'8px 4px', background:s.c,
              transform:`rotate(${(i%2?-2:2)+(i-2)*0.5}deg)`,
              boxShadow:'1px 2px 0 rgba(0,0,0,0.15), 2px 4px 6px rgba(0,0,0,0.15)',
              textAlign:'center', cursor:'pointer'
            }}>
              <div style={{fontFamily:'"Caveat", cursive', fontSize:10, color:'#3a2e1e', letterSpacing:'0.1em'}}>[{s.k}]</div>
              <div style={{fontFamily:'"Caveat", cursive', fontSize:14, fontWeight:600, color:'#1a1716'}}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>
      {/* google fonts inline */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&display=swap"/>
    </div>
  );
}

window.CombatMissionControl = CombatMissionControl;
window.CombatTerminal = CombatTerminal;
window.CombatJRPG = CombatJRPG;
window.CombatFightCard = CombatFightCard;
window.CombatNotebook = CombatNotebook;
