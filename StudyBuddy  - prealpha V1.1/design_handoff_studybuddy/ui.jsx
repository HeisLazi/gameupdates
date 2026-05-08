/* StudyBuddy — UI primitives shared across screens */

const Chip = ({ children, color, bg }) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em',
    textTransform:'uppercase', padding:'1px 6px',
    border:`1px solid ${color || 'var(--line-2)'}`,
    color: color || 'var(--fg-2)', background: bg || 'var(--bg-1)',
    whiteSpace:'nowrap'
  }}>{children}</span>
);

const Bar = ({ pct, color, height=4 }) => (
  <div style={{height, background:'var(--bg-3)', border:'1px solid var(--line)', position:'relative', overflow:'hidden'}}>
    <div style={{height:'100%', width:`${Math.max(0,Math.min(100,pct))}%`, background: color || 'var(--accent)', transition:'width 200ms ease'}} />
  </div>
);

const PanelHeader = ({ children, right }) => (
  <div style={{display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderBottom:'1px solid var(--line)', background:'var(--bg-3)'}}>
    <span className="cap">{children}</span>
    <span style={{flex:1, height:1, background:'var(--line)'}}/>
    {right}
  </div>
);

const Btn = ({ children, primary, danger, onClick, full, size='md', disabled }) => {
  const pad = size==='sm'?'6px 10px':'12px 16px';
  const fontSize = size==='sm'?10:12;
  let bg = 'var(--bg-3)', color = 'var(--fg)', border = '1px solid var(--line-2)';
  if (primary){ bg = 'var(--accent)'; color='var(--bg-1)'; border='1px solid var(--accent)'; }
  if (danger){ bg = 'var(--bg-3)'; color='var(--hp)'; border='1px solid var(--hp)'; }
  if (disabled){ bg='var(--bg-2)'; color='var(--fg-3)'; border='1px solid var(--line)'; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: pad, background: bg, color, border,
      fontFamily:'var(--font-mono)', fontSize, fontWeight:600,
      letterSpacing:'0.18em', textTransform:'uppercase',
      cursor: disabled?'not-allowed':'pointer',
      width: full?'100%':'auto',
      transition:'background 110ms, transform 110ms'
    }}>{children}</button>
  );
};

const TopBar = ({ active, onNav, hp=84, hpMax=100, streak=12, insight=142, gold=320 }) => {
  const primary = [
    { id:'splash', l:'OPS' },
    { id:'world',  l:'WORLD' },
    { id:'combat', l:'FIGHT' },
    { id:'study',  l:'STUDY' },
    { id:'cram',   l:'CRAM' },
    { id:'exam',   l:'EXAM' },
    { id:'arsenal',l:'ARSNL' },
    { id:'skills', l:'SKILL' },
    { id:'library',l:'LIB' },
  ];
  const overflow = [
    { id:'pets',   l:'PETS' },
    { id:'raid',   l:'RAIDS' },
    { id:'stats',  l:'STATS' },
    { id:'deadlines', l:'DEADLINES' },
  ];
  const [moreOpen, setMoreOpen] = React.useState(false);
  React.useEffect(()=>{
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    setTimeout(()=>document.addEventListener('click', close, { once:true }), 0);
  }, [moreOpen]);
  const inOverflow = overflow.some(t=>t.id===active);
  return (
    <div style={{display:'flex', alignItems:'stretch', height:44, borderBottom:'1px solid var(--line)', background:'var(--bg-2)', position:'relative'}}>
      <div onClick={()=>onNav('splash')} style={{display:'flex', alignItems:'center', gap:8, padding:'0 12px', borderRight:'1px solid var(--line)', cursor:'pointer', flexShrink:0}}>
        <SBMark size={20}/>
        <div style={{display:'flex', flexDirection:'column', lineHeight:1.1}}>
          <span style={{fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, letterSpacing:'0.04em'}}>STUDY<span style={{color:'var(--accent)'}}>BUDDY</span></span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.2em', color:'var(--fg-3)', marginTop:1}}>v0.7.4</span>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'stretch', minWidth:0, flexShrink:1}}>
        {primary.map(t=>(
          <div key={t.id}
            onClick={()=>onNav(t.id)}
            className={'tb-tab '+(active===t.id?'is-active':'')}
            style={{padding:'0 10px'}}>
            {t.l}
          </div>
        ))}
        <div
          onClick={(e)=>{ e.stopPropagation(); setMoreOpen(o=>!o); }}
          className={'tb-tab '+(inOverflow||moreOpen?'is-active':'')}
          style={{padding:'0 10px', position:'relative'}}>
          MORE ▾
          {moreOpen && (
            <div style={{position:'absolute', top:'100%', right:0, background:'var(--bg-2)', border:'1px solid var(--line)', minWidth:140, zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
              {overflow.map(t=>(
                <div key={t.id} onClick={()=>onNav(t.id)} style={{padding:'10px 12px', fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.18em', color: active===t.id?'var(--accent)':'var(--fg-1)', borderBottom:'1px solid var(--line)', cursor:'pointer'}}>{t.l}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{flex:1, minWidth:8}}/>
      <div style={{display:'flex', alignItems:'stretch', borderLeft:'1px solid var(--line)', flexShrink:0}}>
        {[
          ['HP', `${hp}/${hpMax}`, 'var(--accent)'],
          ['STRK', `×${streak}`, streak>=10?'var(--insight)':'var(--fg)'],
          ['INS', insight, 'var(--insight)'],
          ['CR', gold, 'var(--fg)'],
        ].map(([k,v,c],i)=>(
          <div key={i} style={{padding:'0 10px', display:'flex', flexDirection:'column', justifyContent:'center', borderLeft: i?'1px solid var(--line)':'none', minWidth:54}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.18em', color:'var(--fg-3)'}}>{k}</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:c, fontWeight:600}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBar = ({ note='READY · NEUR-301 · CH.2' }) => (
  <div style={{display:'flex', alignItems:'center', height:24, padding:'0 14px', gap:18, background:'var(--bg-2)', borderTop:'1px solid var(--line)', fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.2em', color:'var(--fg-3)', textTransform:'uppercase'}}>
    <span><span className="blink" style={{display:'inline-block', width:6, height:6, background:'var(--accent)', marginRight:6}}/>{note}</span>
    <span style={{flex:1}}/>
    <span>SYNC OK</span>
    <span>·</span>
    <span>17:42:08 LOCAL</span>
  </div>
);

const ASCIIBox = ({ children, style }) => (
  <div style={{position:'relative', ...style}}>
    <div style={{position:'absolute', inset:0, pointerEvents:'none',
      background:'repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.012) 3px 4px)'}}/>
    {children}
  </div>
);

window.Chip = Chip;
window.Bar = Bar;
window.PanelHeader = PanelHeader;
window.Btn = Btn;
window.TopBar = TopBar;
window.StatusBar = StatusBar;
window.ASCIIBox = ASCIIBox;
