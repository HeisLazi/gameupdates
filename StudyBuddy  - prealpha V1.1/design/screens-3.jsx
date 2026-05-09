/* StudyBuddy — Screens batch 3: Arsenal, Skills, Pets, Library, Raid, Stats, Deadlines */

/* ═══════════════════════════════════════════════════
   ARSENAL — augment codex + paper-doll equipped
   ═══════════════════════════════════════════════════ */
function ScreenArsenal({ onNav }) {
  const [filter, setFilter] = React.useState('ALL');
  const [sel, setSel] = React.useState('a3');
  const tiers = ['ALL','common','rare','epic','legendary','mythic'];
  const list = filter==='ALL' ? AUGMENTS : AUGMENTS.filter(a=>a.tier===filter);
  const selected = AUGMENTS.find(a=>a.id===sel) || AUGMENTS[0];
  const slots = ['EYE','HEAD','CHEST','WPN','OFF','BELT','BOOT','CHARM'];
  return (
    <div style={{display:'grid', gridTemplateColumns:'320px 1fr 320px', height:'100%', overflow:'hidden'}}>
      {/* paper doll */}
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
        <PanelHeader>BUILD · LV.12</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:10}}>
          <div style={{height:200, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
            <div className="sprite xl" style={{background:'transparent', border:'none', width:120, height:120}}>
              <Sprite rows={SPR.bookworm.rows} palette={{'1':'#3a3a3a','2':'#7dd87d','3':'#0a0d0e'}}/>
            </div>
            <div style={{position:'absolute', top:6, left:6, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>OPERATOR.SPRITE</div>
          </div>
          <div className="cap cap-line">EQUIPPED</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4}}>
            {slots.map(s=>{
              const eq = AUGMENTS.find(a=>a.equipped && a.slot===s);
              return (
                <div key={s} style={{aspectRatio:'1', border:`1px solid ${eq?`var(--t-${eq.tier})`:'var(--line)'}`, background:eq?'var(--bg-3)':'var(--bg-1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:4, cursor:'pointer'}}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.16em', color: eq?`var(--t-${eq.tier})`:'var(--fg-3)'}}>{s}</span>
                  {eq && <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-1)', textAlign:'center', marginTop:2, lineHeight:1.1}}>{eq.name.split(' ')[0]}</span>}
                </div>
              );
            })}
          </div>
          <div className="cap cap-line">DERIVED STATS</div>
          {[['Max HP','100','+12','up'],['Block','3','+1','up'],['Crit Rate','12%','—',''],['Insight Gain','108%','+8%','up'],['Pet XP','+8%','—','']].map((r,i)=>(
            <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto auto', fontFamily:'var(--font-mono)', fontSize:11, padding:'4px 0', borderBottom:'1px dashed var(--line)'}}>
              <span style={{color:'var(--fg-3)'}}>{r[0]}</span>
              <span style={{color:'var(--fg)'}}>{r[1]}</span>
              <span style={{marginLeft:8, color: r[3]==='up'?'var(--accent)':'var(--fg-3)'}}>{r[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* codex grid */}
      <div style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{padding:'12px 18px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600}}>Augment Codex</span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.14em'}}>{list.length} ITEMS</span>
          <span style={{flex:1}}/>
          <div style={{display:'flex', gap:0, border:'1px solid var(--line-2)'}}>
            {tiers.map(t=>(
              <div key={t} onClick={()=>setFilter(t)} style={{padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', cursor:'pointer', background: filter===t?'var(--bg-3)':'transparent', color: filter===t?(t==='ALL'?'var(--accent)':`var(--t-${t})`):'var(--fg-2)', borderLeft: t!=='ALL'?'1px solid var(--line)':'none'}}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{padding:18, overflow:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10, alignContent:'flex-start'}}>
          {list.map(a=>(
            <div key={a.id} onClick={()=>setSel(a.id)} style={{
              padding:12, background:'var(--bg-2)',
              border:`1px solid ${sel===a.id?'var(--accent)':`var(--t-${a.tier})`}`,
              cursor:'pointer', position:'relative', display:'flex', flexDirection:'column', gap:8
            }}>
              {a.equipped && <span style={{position:'absolute', top:6, right:6, fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.2em', color:'var(--accent)'}}>● EQ</span>}
              <Chip color={`var(--t-${a.tier})`}>{a.tier}</Chip>
              <div className="sprite lg" style={{alignSelf:'center'}}><Sprite rows={ABISPR.crystal.rows} palette={ABISPR.crystal.palette}/></div>
              <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, textAlign:'center'}}>{a.name}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', textAlign:'center', letterSpacing:'0.14em'}}>{a.slot}</div>
            </div>
          ))}
        </div>
      </div>

      {/* detail */}
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
        <PanelHeader>DETAIL</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:10, flex:1}}>
          <Chip color={`var(--t-${selected.tier})`}>{selected.tier} · {selected.slot}</Chip>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600}}>{selected.name}</div>
          <div style={{height:140, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div className="sprite xl" style={{background:'transparent', border:'none'}}>
              <Sprite rows={ABISPR.crystal.rows} palette={ABISPR.crystal.palette}/>
            </div>
          </div>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:`2px solid var(--t-${selected.tier})`}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', lineHeight:1.5}}>{selected.desc}</div>
          </div>
          <div className="cap cap-line">DROP HISTORY</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', lineHeight:1.6}}>
            <div>↳ NEUR-301 / CH.2 / Boss Echo</div>
            <div>↳ Pity break · Aug 11</div>
            <div>↳ 1 of 4 owned</div>
          </div>
          <div style={{flex:1}}/>
          {selected.equipped
            ? <Btn full danger>◂ UNEQUIP</Btn>
            : <Btn full primary>► EQUIP</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SKILL TREE
   ═══════════════════════════════════════════════════ */
function ScreenSkills({ onNav }) {
  const branches = { A:'var(--accent)', B:'var(--block)', C:'var(--insight)', X:'var(--t-mythic)' };
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 320px', height:'100%', overflow:'hidden'}}>
      <div style={{position:'relative', overflow:'auto'}}>
        <div style={{padding:'16px 24px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--accent)'}}>NEURAL TREE · 4 PTS AVAILABLE</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, marginTop:2}}>Reflexes & Recall</div>
        </div>

        <svg viewBox="0 0 600 600" style={{width:'100%', maxWidth:760, display:'block', margin:'24px auto'}}>
          <defs>
            <pattern id="sg" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="600" height="600" fill="url(#sg)"/>

          {/* edges (manual chain) */}
          {[
            ['s11','s21'],['s12','s21'],['s12','s22'],['s13','s22'],
            ['s11','s31'],['s21','s32'],['s22','s32'],['s22','s33'],['s13','s33'],
            ['s31','s41'],['s32','s41'],['s32','s42'],['s33','s42'],
            ['s41','s51'],['s42','s51']
          ].map(([a,b],i)=>{
            const A = SKILLS.find(s=>s.id===a), B = SKILLS.find(s=>s.id===b);
            const ax = 60 + A.col*120, ay = 60 + A.row*120;
            const bx = 60 + B.col*120, by = 60 + B.row*120;
            const learned = A.learned && B.learned;
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={learned?'var(--accent)':'var(--line-2)'} strokeWidth="1" strokeDasharray={learned?'':'3 3'}/>;
          })}
          {/* nodes */}
          {SKILLS.map(s=>{
            const x = 60 + s.col*120, y = 60 + s.row*120;
            const c = branches[s.branch];
            return (
              <g key={s.id} transform={`translate(${x},${y})`}>
                <rect x="-22" y="-22" width="44" height="44" transform="rotate(45)"
                  fill={s.learned?'var(--bg-3)':'var(--bg-2)'}
                  stroke={s.learned?c:'var(--line-2)'}
                  strokeWidth={s.learned?2:1}/>
                <text x="0" y="5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fontWeight="700"
                  fill={s.learned?c:'var(--fg-3)'}>{s.cost}</text>
                <text x="0" y="46" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2"
                  fill={s.learned?'var(--fg)':'var(--fg-3)'}>{s.name.toUpperCase()}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
        <PanelHeader>SELECTED · INSIGHT SURGE</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:12, flex:1}}>
          <Chip color="var(--block)">CORE · BRANCH B · 3 PTS</Chip>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--block)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', lineHeight:1.5}}>
              On a 4-streak, your next Active Recall costs no cooldown and pierces 1 armor.
            </div>
          </div>
          <div className="cap cap-line">PREREQS</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11}}>
            <div style={{padding:'4px 0', borderBottom:'1px dashed var(--line)', display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--fg-1)'}}>Quick Read</span><span style={{color:'var(--accent)'}}>✓ MET</span></div>
            <div style={{padding:'4px 0', borderBottom:'1px dashed var(--line)', display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--fg-1)'}}>Pressure Calm</span><span style={{color:'var(--accent)'}}>✓ MET</span></div>
            <div style={{padding:'4px 0', display:'flex', justifyContent:'space-between'}}><span style={{color:'var(--fg-1)'}}>Skill points</span><span style={{color:'var(--accent)'}}>4/3</span></div>
          </div>
          <div style={{flex:1}}/>
          <Btn full primary>► UNLOCK · 3 PTS</Btn>
          <Btn full size="sm">↻ RESPEC ALL · 80 CRED</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PETS
   ═══════════════════════════════════════════════════ */
function ScreenPets({ onNav }) {
  const [sel, setSel] = React.useState('p1');
  const selected = PETS.find(p=>p.id===sel);
  return (
    <div style={{display:'grid', gridTemplateColumns:'280px 1fr 320px', height:'100%', overflow:'hidden'}}>
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
        <PanelHeader>STABLE · 3/8</PanelHeader>
        <div style={{padding:10, display:'flex', flexDirection:'column', gap:6, overflow:'auto'}}>
          {PETS.map(p=>(
            <div key={p.id} onClick={()=>setSel(p.id)} style={{
              padding:10, background:sel===p.id?'linear-gradient(90deg, var(--accent-soft), transparent 80%)':'var(--bg-3)',
              border:`1px solid ${sel===p.id?'var(--accent-line)':'var(--line)'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:10
            }}>
              <div className="sprite"><Sprite rows={PETSPR[p.spr].rows} palette={PETSPR[p.spr].palette}/></div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600}}>{p.name}</div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.1em'}}>BOND {('★').repeat(p.bond)}<span style={{color:'var(--fg-4)'}}>{('★').repeat(8-p.bond)}</span></div>
              </div>
            </div>
          ))}
          <div style={{padding:10, background:'var(--bg-1)', border:'1px dashed var(--line-2)', cursor:'pointer', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.18em', marginTop:8}}>+ EMPTY SLOT</div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'radial-gradient(60% 50% at 50% 60%, rgba(125,216,125,0.05), transparent 70%), var(--bg-1)'}}>
        <div style={{padding:'16px 24px'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--accent)'}}>SANCTUARY · {selected.mood.toUpperCase()}</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, marginTop:4, letterSpacing:'-0.01em'}}>{selected.name}</div>
        </div>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{width:280, height:280, border:'1px solid var(--line)', background:'repeating-linear-gradient(45deg, var(--bg-3) 0 4px, var(--bg-2) 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
            <div style={{width:200, height:200}} className="sprite"><Sprite rows={PETSPR[selected.spr].rows} palette={PETSPR[selected.spr].palette}/></div>
            <div style={{position:'absolute', top:6, left:6, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>HABITAT.{selected.spr.toUpperCase()}</div>
          </div>
        </div>
        <div style={{padding:'14px 24px', borderTop:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', gap:8, justifyContent:'center'}}>
          <Btn size="md">◯ PLAY (+BOND)</Btn>
          <Btn size="md">⌬ FEED · 5 CRED</Btn>
          <Btn size="md" primary>► SUMMON TO NEXT FIGHT</Btn>
        </div>
      </div>

      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column'}}>
        <PanelHeader>STATS · {selected.name.toUpperCase()}</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)'}}>
              <span>BOND · LV.{selected.bond}</span><span style={{color:'var(--accent)'}}>{selected.bond*120}/{(selected.bond+1)*120}</span>
            </div>
            <Bar pct={(selected.bond%1+0.6)*60} color="var(--accent)" height={6}/>
          </div>
          <div className="cap cap-line">PERKS</div>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--accent)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)'}}>{selected.perk}</div>
          </div>
          <div className="cap cap-line">EVOLUTION</div>
          {[['LV.5','Fledgling','done'],['LV.10','Adept','active'],['LV.15','Master','locked']].map((r,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
              <span style={{color:'var(--fg-3)'}}>{r[0]}</span>
              <span style={{color: r[2]==='done'?'var(--accent)':r[2]==='active'?'var(--insight)':'var(--fg-3)'}}>{r[1]} {r[2]==='done'?'✓':r[2]==='active'?'●':'⌧'}</span>
            </div>
          ))}
          <div className="cap cap-line">FAVORITE</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-2)'}}>NEUR-301 questions · prefers Recall ability</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LIBRARY — PDFs + insights
   ═══════════════════════════════════════════════════ */
function ScreenLibrary({ onNav }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'320px 1fr 320px', height:'100%', overflow:'hidden'}}>
      <div style={{borderRight:'1px solid var(--line)', background:'var(--bg-2)', overflow:'auto'}}>
        <PanelHeader>SOURCES · 14</PanelHeader>
        <div style={{padding:10}}>
          {[
            ['NEUR-301_chap_2.pdf','42p','82%','active'],
            ['NEUR-301_chap_1.pdf','38p','100%',''],
            ['Squire_2015_LTP.pdf','24p','64%',''],
            ['BIO-204_lab_protocols.pdf','12p','40%',''],
            ['HIST-110_modernity_intro.pdf','56p','18%',''],
            ['Lecture_05_notes.md','—','100%',''],
            ['MATH-220_review_sheet.pdf','8p','24%',''],
          ].map((r,i)=>(
            <div key={i} style={{
              padding:'10px 10px', marginBottom:4,
              background: r[3]==='active' ? 'linear-gradient(90deg, var(--accent-soft), transparent 80%)' : 'var(--bg-3)',
              border:`1px solid ${r[3]==='active' ? 'var(--accent-line)' : 'var(--line)'}`,
              cursor:'pointer'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:6}}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: r[3]==='active'?'var(--accent)':'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1}}>{r[0]}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.1em'}}>{r[1]}</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, marginTop:4, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)'}}>
                <span>EXTRACTED {r[2]}</span>
                <Bar pct={parseInt(r[2])} color={parseInt(r[2])===100?'var(--accent)':'var(--fg-2)'} height={3}/>
              </div>
            </div>
          ))}
          <div style={{padding:10, marginTop:6, border:'1px dashed var(--line-2)', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.16em', cursor:'pointer'}}>+ INGEST PDF</div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', overflow:'hidden'}}>
        <div style={{padding:'12px 18px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', alignItems:'center', gap:10}}>
          <Chip color="var(--accent-line)">PDF · CHAPTER 2</Chip>
          <span style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600}}>Storage Mechanisms — Squire et al.</span>
          <span style={{flex:1}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.14em'}}>PAGE 14 / 42</span>
          <Btn size="sm">↻ RE-EXTRACT</Btn>
          <Btn size="sm" primary>► STUDY THIS</Btn>
        </div>
        <div style={{flex:1, overflow:'auto', padding:'24px 32px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
          <div style={{background:'var(--bg-2)', border:'1px solid var(--line)', padding:'24px 28px', fontFamily:'Georgia, serif', fontSize:13, lineHeight:1.7, color:'var(--fg-1)'}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, color:'var(--fg)', marginBottom:14}}>2.3 Sleep-dependent Consolidation</div>
            <p style={{margin:'0 0 14px'}}>The hippocampus serves as a temporary index for declarative memories during initial encoding. Through sleep-dependent processes — particularly during slow-wave sleep — these memory traces undergo a gradual transfer to neocortical storage sites.</p>
            <p style={{margin:'0 0 14px', background:'rgba(125,216,125,0.06)', padding:'8px 10px', borderLeft:'2px solid var(--accent)'}}>
              <b style={{color:'var(--accent)'}}>HIGHLIGHTED ·</b> <span style={{color:'var(--fg)'}}>NREM3 (slow-wave sleep) is most strongly associated with declarative memory consolidation, while REM is implicated in procedural and emotional memory.</span>
            </p>
            <p style={{margin:'0 0 14px'}}>This two-stage model (Marr, 1971; McClelland et al., 1995) — fast hippocampal indexing followed by slow neocortical integration — explains why temporal lobe damage produces dense anterograde amnesia while sparing remote memories.</p>
            <p style={{margin:'0 0 14px'}}>Sharp-wave ripples in the hippocampus during NREM sleep "replay" recent activity at compressed timescales, driving cortical plasticity. This replay is bidirectional — reverse replay during rest may consolidate reward-linked associations.</p>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="cap cap-line">EXTRACTED CARDS · 18</div>
            {[
              ['Q','Which sleep stage consolidates declarative memory?'],
              ['Q','What is the role of sharp-wave ripples?'],
              ['T','Two-stage consolidation (Marr 1971)'],
              ['Q','Why does temporal lobe damage spare remote memory?'],
            ].map((r,i)=>(
              <div key={i} style={{padding:8, background:'var(--bg-2)', border:'1px solid var(--line)', borderLeft:`2px solid ${r[0]==='Q'?'var(--accent)':'var(--insight)'}`}}>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <Chip color={r[0]==='Q'?'var(--accent-line)':'var(--insight)'}>{r[0]==='Q'?'CARD':'CONCEPT'}</Chip>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)'}}>p.{14+i}</span>
                </div>
                <div style={{fontFamily:'var(--font-body)', fontSize:11, color:'var(--fg-1)', marginTop:6, lineHeight:1.4}}>{r[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', overflow:'auto'}}>
        <PanelHeader>INSIGHTS</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:12}}>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--insight)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--insight)'}}>WEAKNESS DETECTED</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', marginTop:6, lineHeight:1.5}}>
              You miss 40% on <b style={{color:'var(--hp)'}}>Sharp-wave Ripples</b>. Schedule a Study run before midterm.
            </div>
          </div>
          <div style={{padding:10, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--accent)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--accent)'}}>STRENGTH</div>
            <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-1)', marginTop:6, lineHeight:1.5}}>
              94% on Hippocampal indexing — tag mastered last 5 sessions.
            </div>
          </div>
          <div className="cap cap-line">RECENT TAGS</div>
          {[['Hippocampal Indexing',94,'up'],['NMDA Receptor',76,'up'],['Sharp-wave Ripples',40,'down'],['Schema Effects',62,'up']].map((r,i)=>(
            <div key={i} style={{padding:'5px 0', borderBottom:'1px dashed var(--line)', display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11}}>
              <span style={{color:'var(--fg-1)'}}>{r[0]}</span>
              <span style={{color: r[1]>=80?'var(--accent)':r[1]<50?'var(--hp)':'var(--fg-2)'}}>{r[1]}% {r[2]==='up'?'↑':'↓'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RAID HUB
   ═══════════════════════════════════════════════════ */
function ScreenRaid({ onNav }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 360px', height:'100%', overflow:'hidden'}}>
      <div style={{display:'flex', flexDirection:'column', overflow:'auto'}}>
        <div style={{padding:'18px 24px', borderBottom:'1px solid var(--line)', background:'linear-gradient(180deg, rgba(176,118,255,0.08), var(--bg-2))', display:'flex', alignItems:'flex-end', gap:18}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--t-epic)'}}>RAID HUB · WEEKLY ROTATION</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, marginTop:4, letterSpacing:'-0.01em'}}>The Synthesis Chain</div>
            <div style={{fontFamily:'var(--font-body)', fontSize:13, color:'var(--fg-2)', marginTop:6, maxWidth:560}}>
              Multi-module raid. Resets in <b style={{color:'var(--insight)'}}>3d 14h</b>. Each link demands cross-topic synthesis. Beating the chain unlocks Mythic augment slots.
            </div>
          </div>
          <Chip color="var(--t-mythic)">MYTHIC · 5 LINKS</Chip>
        </div>

        <div style={{padding:24, display:'flex', flexDirection:'column', gap:12}}>
          {[
            { n:1, name:'NEUR × BIO — Synaptic Plasticity',  mods:['NEUR-301','BIO-204'], status:'CLEARED', diff:3 },
            { n:2, name:'NEUR × HIST — History of Memory',   mods:['NEUR-301','HIST-110'], status:'CLEARED', diff:3 },
            { n:3, name:'BIO × MATH — Cell Math',            mods:['BIO-204','MATH-220'],  status:'ACTIVE', diff:4 },
            { n:4, name:'PHIL × NEUR — Identity & Memory',   mods:['PHIL-150','NEUR-301'], status:'LOCKED', diff:4 },
            { n:5, name:'BOSS — Synthesis Itself',           mods:['ALL'],                 status:'LOCKED', diff:5 },
          ].map(l=>{
            const cleared = l.status==='CLEARED', active = l.status==='ACTIVE';
            return (
              <div key={l.n} style={{
                padding:'14px 16px',
                background:'var(--bg-2)',
                border:`1px solid ${active?'var(--accent)':l.status==='LOCKED'?'var(--line)':'var(--accent-line)'}`,
                position:'relative',
                opacity: l.status==='LOCKED'?0.5:1
              }}>
                <div style={{display:'grid', gridTemplateColumns:'48px 1fr auto', alignItems:'center', gap:14}}>
                  <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:active?'var(--accent)':'var(--fg-3)'}}>{String(l.n).padStart(2,'0')}</div>
                  <div>
                    <div style={{display:'flex', gap:4, marginBottom:4}}>
                      {l.mods.map((m,i)=><Chip key={i}>{m}</Chip>)}
                    </div>
                    <div style={{fontFamily:'var(--font-display)', fontSize:16, fontWeight:600}}>{l.name}</div>
                    <div style={{display:'flex', gap:3, marginTop:6}}>
                      {[1,2,3,4,5].map(i=>(<span key={i} style={{width:8, height:8, background: i<=l.diff?'var(--t-mythic)':'var(--bg-3)', border:'1px solid var(--line)', transform:'rotate(45deg)'}}/>))}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                    <span style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.2em', color: cleared?'var(--accent)':active?'var(--accent)':'var(--fg-3)'}}>
                      {cleared && '✓ '}{l.status}
                    </span>
                    {active && <Btn size="sm" primary>► ENGAGE</Btn>}
                    {cleared && <Btn size="sm">↻ REPLAY</Btn>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', display:'flex', flexDirection:'column', overflow:'auto'}}>
        <PanelHeader>PARTY · SOLO</PanelHeader>
        <div style={{padding:14, display:'flex', flexDirection:'column', gap:12}}>
          <div style={{padding:14, border:'1px solid var(--line)', background:'var(--bg-3)', display:'flex', gap:10, alignItems:'center'}}>
            <div className="sprite lg" style={{background:'transparent', border:'none'}}>
              <Sprite rows={SPR.bookworm.rows} palette={SPR.bookworm.palette}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600}}>You · LV.12</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.1em'}}>OPERATOR</div>
            </div>
            <Chip color="var(--accent-line)">READY</Chip>
          </div>
          {[1,2,3].map(i=>(
            <div key={i} style={{padding:14, border:'1px dashed var(--line-2)', background:'transparent', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.18em'}}>
              + INVITE OR PUG · SLOT {i+1}
            </div>
          ))}
          <div className="cap cap-line">REWARDS · LINK 3</div>
          {[['XP','+1,200'],['Insight','+80'],['Mythic Shard','×1'],['Pet egg chance','12%']].map((r,i)=>(
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px dashed var(--line)', fontFamily:'var(--font-mono)', fontSize:11}}>
              <span style={{color:'var(--fg-3)'}}>{r[0]}</span><span>{r[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STATS / Prestige
   ═══════════════════════════════════════════════════ */
function ScreenStats({ onNav }) {
  return (
    <div style={{padding:'24px 32px', height:'100%', overflow:'auto', display:'flex', flexDirection:'column', gap:20}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:18}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--accent)'}}>OPERATOR DOSSIER · PRESTIGE 0</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, marginTop:4, letterSpacing:'-0.01em'}}>OPERATOR · LV.12</div>
        </div>
        <Chip color="var(--accent-line)">SEMESTER 02</Chip>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:0, border:'1px solid var(--line)'}}>
        {[
          ['HOURS LOGGED','142h','var(--fg)'],
          ['CARDS SEEN','3,820','var(--fg)'],
          ['BEST STREAK','×42','var(--insight)'],
          ['BOSSES DOWN','7','var(--accent)'],
          ['PERFECT RUNS','4','var(--accent)'],
          ['DEATHS','3','var(--hp)'],
        ].map(([k,v,c],i)=>(
          <div key={i} style={{padding:'18px 18px', borderRight:i<5?'1px solid var(--line)':'none', background:'var(--bg-2)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.22em', color:'var(--fg-3)'}}>{k}</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, marginTop:4, color:c, letterSpacing:'-0.01em'}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div>
          <div className="cap cap-line" style={{marginBottom:10}}>WEEKLY HEATMAP</div>
          <div style={{padding:14, background:'var(--bg-2)', border:'1px solid var(--line)'}}>
            <div style={{display:'grid', gridTemplateColumns:'auto repeat(24, 1fr)', gap:2, alignItems:'center'}}>
              {['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d,r)=>[
                <span key={d} style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', color:'var(--fg-3)', paddingRight:6}}>{d}</span>,
                ...Array.from({length:24}).map((_,c)=>{
                  const v = Math.random();
                  const intense = v > 0.85 ? 4 : v > 0.65 ? 3 : v > 0.4 ? 2 : v > 0.2 ? 1 : 0;
                  const colors = ['var(--bg-3)','rgba(125,216,125,0.18)','rgba(125,216,125,0.4)','rgba(125,216,125,0.7)','var(--accent)'];
                  return <div key={d+c} style={{aspectRatio:'1', background:colors[intense], border:'1px solid var(--line)'}} title={`${d} ${c}:00`}/>;
                })
              ]).flat()}
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center', marginTop:10, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.14em'}}>
              <span>LESS</span>
              {[0,1,2,3,4].map(i=>(
                <div key={i} style={{width:10, height:10, background:['var(--bg-3)','rgba(125,216,125,0.18)','rgba(125,216,125,0.4)','rgba(125,216,125,0.7)','var(--accent)'][i], border:'1px solid var(--line)'}}/>
              ))}
              <span>MORE</span>
              <span style={{flex:1}}/>
              <span>PEAK · TUE 21:00 · 64 CARDS</span>
            </div>
          </div>
        </div>
        <div>
          <div className="cap cap-line" style={{marginBottom:10}}>ACCURACY BY MODULE</div>
          <div style={{padding:14, background:'var(--bg-2)', border:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:8}}>
            {MODULES.map(m=>{
              const acc = [88,76,62,28,54][MODULES.indexOf(m)];
              return (
                <div key={m.code}>
                  <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11, marginBottom:3}}>
                    <span style={{color:'var(--fg-1)'}}>{m.code} · {m.name}</span>
                    <span style={{color: acc>=80?'var(--accent)':acc<50?'var(--hp)':'var(--fg-2)'}}>{acc}%</span>
                  </div>
                  <Bar pct={acc} color={acc>=80?'var(--accent)':acc<50?'var(--hp)':m.color} height={6}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="cap cap-line" style={{marginBottom:10}}>ACHIEVEMENTS · 14/64</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:8}}>
          {[
            ['Cold Open','First fight cleared','done'],
            ['Hot Streak','×20 streak','done'],
            ['Pacifist','No retries on a chapter','done'],
            ['Bookworm','100 cards in a day','done'],
            ['Cram Master','Beat 10:00 cram','locked'],
            ['Mythic','Equip mythic augment','locked'],
            ['Boss Hunter','Beat 5 bosses','done'],
            ['Synthesist','Clear a raid chain','locked'],
          ].map((a,i)=>(
            <div key={i} style={{padding:10, background:'var(--bg-2)', border:`1px solid ${a[2]==='done'?'var(--accent-line)':'var(--line)'}`, opacity: a[2]==='done'?1:0.5}}>
              <div style={{display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color: a[2]==='done'?'var(--accent)':'var(--fg-3)'}}>
                {a[2]==='done'?'✓ EARNED':'⌧ LOCKED'}
              </div>
              <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, marginTop:4}}>{a[0]}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', marginTop:2}}>{a[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DEADLINES (calendar + grade calc)
   ═══════════════════════════════════════════════════ */
function ScreenDeadlines({ onNav }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 360px', height:'100%', overflow:'hidden'}}>
      <div style={{display:'flex', flexDirection:'column', overflow:'auto', padding:'24px 32px', gap:18}}>
        <div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.22em', color:'var(--accent)'}}>DEADLINE SCHEDULE · SEM 02</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, marginTop:4}}>Next 6 weeks</div>
        </div>

        {/* Gantt-style timeline */}
        <div style={{padding:18, background:'var(--bg-2)', border:'1px solid var(--line)'}}>
          <div style={{display:'grid', gridTemplateColumns:'140px 1fr', gap:8, marginBottom:8}}>
            <span/>
            <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.18em', color:'var(--fg-3)'}}>
              {['W1','W2','W3','W4','W5','W6'].map(w=>(<span key={w}>{w}</span>))}
            </div>
          </div>
          {DEADLINES.map(d=>{
            const pct = (d.days/42)*100;
            return (
              <div key={d.id} style={{display:'grid', gridTemplateColumns:'140px 1fr', gap:8, alignItems:'center', padding:'8px 0', borderBottom:'1px dashed var(--line)'}}>
                <div>
                  <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)', letterSpacing:'0.14em'}}>{d.module}</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:13, fontWeight:600}}>{d.label}</div>
                </div>
                <div style={{position:'relative', height:22, background:'var(--bg-3)', border:'1px solid var(--line)'}}>
                  <div style={{position:'absolute', top:0, bottom:0, left:0, width:`${pct}%`, background:'linear-gradient(90deg, transparent, '+(d.days<7?'rgba(217,69,69,0.5)':d.days<14?'rgba(231,193,75,0.4)':'rgba(125,216,125,0.4)')+')'}}/>
                  <div style={{position:'absolute', top:'50%', left:`${pct}%`, transform:'translate(-50%,-50%)', width:14, height:14, background:d.days<7?'var(--hp)':d.days<14?'var(--insight)':'var(--accent)', border:'2px solid var(--bg-1)', boxShadow:'0 0 12px '+(d.days<7?'rgba(217,69,69,0.8)':d.days<14?'rgba(231,193,75,0.6)':'var(--accent-glow)')}}/>
                  <div style={{position:'absolute', top:'50%', right:8, transform:'translateY(-50%)', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-1)', letterSpacing:'0.1em'}}>
                    in {d.days}d
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cap cap-line">RECOMMENDED PLAN</div>
        <div style={{padding:14, background:'var(--bg-2)', border:'1px solid var(--line)', borderLeft:'2px solid var(--insight)', fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.6, color:'var(--fg-1)'}}>
          → <b>Today:</b> 30m Cram on MATH-220 (quiz in 3d)<br/>
          → <b>Tomorrow:</b> Study run NEUR-301 Ch.3 — Retrieval Cues<br/>
          → <b>Wed:</b> Library extract PHIL-150 reading<br/>
          → <b>Sat:</b> Mock exam · NEUR-301 timed
        </div>
      </div>

      {/* grade calculator */}
      <div style={{borderLeft:'1px solid var(--line)', background:'var(--bg-2)', padding:14, display:'flex', flexDirection:'column', gap:14, overflow:'auto'}}>
        <PanelHeader>GRADE CALCULATOR</PanelHeader>
        <div>
          <Chip color="var(--accent-line)">NEUR-301</Chip>
          <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:6}}>Memory & Cognition</div>
        </div>
        {[
          ['Quizzes (20%)','82%','LOCKED'],
          ['Midterm (30%)','—','11d'],
          ['Final (40%)','—','38d'],
          ['Participation (10%)','94%','LOCKED'],
        ].map((r,i)=>(
          <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:8, alignItems:'center', padding:'6px 0', borderBottom:'1px dashed var(--line)'}}>
            <div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.14em'}}>{r[0]}</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, marginTop:2, color: r[1]==='—'?'var(--fg-3)':'var(--fg)'}}>{r[1]}</div>
            </div>
            <Chip color={r[2]==='LOCKED'?'var(--line-2)':'var(--insight)'}>{r[2]}</Chip>
          </div>
        ))}
        <div className="cap cap-line">PROJECTION</div>
        <div style={{padding:12, background:'var(--bg-3)', border:'1px solid var(--line)', borderLeft:'2px solid var(--accent)'}}>
          <div style={{fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)'}}>EXPECTED FINAL GRADE</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:36, fontWeight:700, color:'var(--accent)', marginTop:4, letterSpacing:'-0.02em'}}>A− · 87%</div>
          <div style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-2)', marginTop:6, lineHeight:1.5}}>
            Hold ≥80% on midterm to keep this projection. Below 70% drops to B+.
          </div>
        </div>
        <div className="cap cap-line">WHAT-IF</div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.14em', marginBottom:4}}><span>MIDTERM SCORE</span><span style={{color:'var(--accent)'}}>85%</span></div>
            <input type="range" min="0" max="100" defaultValue={85} style={{width:'100%', accentColor:'var(--accent)'}}/>
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)', letterSpacing:'0.14em', marginBottom:4}}><span>FINAL SCORE</span><span style={{color:'var(--accent)'}}>88%</span></div>
            <input type="range" min="0" max="100" defaultValue={88} style={{width:'100%', accentColor:'var(--accent)'}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ScreenArsenal = ScreenArsenal;
window.ScreenSkills = ScreenSkills;
window.ScreenPets = ScreenPets;
window.ScreenLibrary = ScreenLibrary;
window.ScreenRaid = ScreenRaid;
window.ScreenStats = ScreenStats;
window.ScreenDeadlines = ScreenDeadlines;
