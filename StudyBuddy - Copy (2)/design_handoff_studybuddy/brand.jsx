/* STUDYBUDDY brand kit — wordmark, mark, favicon helpers */

/* The mark: an angular shield/chevron evoking both "academic" and "tactical".
   Dual-tone: outer plate + inner glyph. */
const SBMark = ({ size = 32, glow = false, mono = false }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges"
       style={{ filter: glow ? 'drop-shadow(0 0 12px var(--accent-glow))' : undefined }}>
    {/* outer plate — angled hexagonal */}
    <path d="M 4 4 L 28 4 L 28 22 L 22 28 L 4 28 Z"
          fill={mono ? 'currentColor' : 'var(--accent)'} />
    {/* inner cut */}
    <path d="M 8 8 L 24 8 L 24 20 L 20 24 L 8 24 Z"
          fill="var(--bg-1)" />
    {/* SB monogram (pixel-block) */}
    <rect x="11" y="12" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="14" y="12" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="11" y="15" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="17" y="15" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="14" y="18" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="17" y="18" width="3" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    {/* corner notch ticks */}
    <rect x="2" y="2" width="3" height="1" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="2" y="2" width="1" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="27" y="29" width="3" height="1" fill={mono ? 'currentColor' : 'var(--accent)'}/>
    <rect x="29" y="27" width="1" height="3" fill={mono ? 'currentColor' : 'var(--accent)'}/>
  </svg>
);

const SBWordmark = ({ size = 18, ver = 'v0.7.4', mono = false }) => (
  <div style={{display:'flex', alignItems:'center', gap:10}}>
    <SBMark size={size + 14} mono={mono}/>
    <div style={{display:'flex', flexDirection:'column', lineHeight:1}}>
      <div style={{
        fontFamily:'var(--font-display)',
        fontWeight: 700,
        fontSize: size,
        letterSpacing:'0.02em',
        color: mono ? 'currentColor' : 'var(--fg)',
      }}>
        STUDY<span style={{color: mono ? 'currentColor' : 'var(--accent)'}}>BUDDY</span>
      </div>
      <div style={{
        fontFamily:'var(--font-mono)', fontSize: Math.max(8, size*0.45),
        letterSpacing:'0.28em', marginTop:4,
        color: 'var(--fg-3)'
      }}>
        TACTICAL · STUDY · OS &nbsp;//&nbsp; {ver}
      </div>
    </div>
  </div>
);

window.SBMark = SBMark;
window.SBWordmark = SBWordmark;
