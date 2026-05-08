/* ============ LOCK IN MODE (minimal) ============ */
// Lightweight "lock in" run — single focused combat session.
// Minimal UI that shells up a boss and launches the regular CombatScreen.
function LockInHub({ mod, state, setState, onLaunch, onBack }){
  const [difficulty, setDifficulty] = useState('standard');
  const [notes, setNotes] = useState('');

  return (
    <div className="lockin-run">
      <div className="lockin-hero">
        <div>
          <div className="tiny lockin-kicker">ARENA SPRINT</div>
          <h2>🔒 LOCK IN — Quick Focus Run</h2>
          <div className="muted">Short, focused recall under pressure. Minimal setup, fast feedback.</div>
        </div>
        <span className="chip warn">single fight</span>
      </div>

      <div className="card lockin-panel">
        <label>Difficulty</label>
        <div className="row" style={{gap:8, marginTop:6}}>
          <button className={"btn "+(difficulty==='casual'?'':'ghost')} onClick={()=>setDifficulty('casual')}>Casual</button>
          <button className={"btn "+(difficulty==='standard'?'':'ghost')} onClick={()=>setDifficulty('standard')}>Standard</button>
          <button className={"btn "+(difficulty==='nightmare'?'':'ghost')} onClick={()=>setDifficulty('nightmare')}>Nightmare</button>
        </div>

        <div style={{marginTop:10}}>
          <label>Optional focus</label>
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What to focus on (optional)" />
        </div>

        <div style={{marginTop:10}}>
          <button className="btn" onClick={()=>{
            const hp = difficulty==='nightmare' ? 180 : difficulty==='standard' ? 120 : 80;
            const boss = {
              id: mod.id + '_lockin_' + Date.now(),
              name: 'Lock-In Challenger',
              emoji: '🔒',
              hp: hp,
              maxHp: hp,
              dmg: { light: 10, heavy: 18 },
              pattern: ['light','heavy','light'],
              levelId: null,
            };
            if (typeof onLaunch === 'function') onLaunch({ boss, difficulty, notes });
          }}>Start Lock In</button>
          <button className="btn ghost" onClick={onBack} style={{marginLeft:8}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
