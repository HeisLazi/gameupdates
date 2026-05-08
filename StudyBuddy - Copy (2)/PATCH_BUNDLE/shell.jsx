/* StudyBuddy — App shell · routes between all screens */

function App() {
  const [route, setRoute] = React.useState(() => {
    const h = location.hash.replace('#','');
    return h || 'splash';
  });

  React.useEffect(()=>{
    location.hash = route;
  }, [route]);

  React.useEffect(()=>{
    const onHash = () => {
      const h = location.hash.replace('#','') || 'splash';
      setRoute(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const onNav = (id) => setRoute(id);

  // keyboard quick-nav: g + letter
  React.useEffect(()=>{
    let primed = false;
    const map = { w:'world', s:'study', c:'cram', e:'exam', a:'arsenal', k:'skills',
      p:'pets', l:'library', r:'raid', t:'stats', d:'deadlines', h:'splash', x:'combat' };
    const onKey = (ev) => {
      if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') return;
      if (ev.key === 'g') { primed = true; setTimeout(()=>{primed=false;}, 800); return; }
      if (primed && map[ev.key.toLowerCase()]) {
        setRoute(map[ev.key.toLowerCase()]);
        primed = false;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  let Screen = null;
  const navMap = {
    splash: window.ScreenSplash,
    world:  window.ScreenWorld,
    study:  window.ScreenStudy,
    cram:   window.ScreenCram,
    exam:   window.ScreenExam,
    result: window.ScreenResult,
    arsenal:window.ScreenArsenal,
    skills: window.ScreenSkills,
    pets:   window.ScreenPets,
    library:window.ScreenLibrary,
    raid:   window.ScreenRaid,
    stats:  window.ScreenStats,
    deadlines: window.ScreenDeadlines,
    combat: window.CombatHUD,
  };
  Screen = navMap[route] || navMap.splash;

  // splash is full-bleed (no chrome)
  if (route === 'splash') {
    return (
      <div style={{height:'100vh', overflow:'hidden', background:'var(--bg-1)'}}>
        <Screen onNav={onNav}/>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg-1)'}}>
      <window.TopBar active={route} onNav={onNav}/>
      <div style={{flex:1, minHeight:0, overflow:'hidden'}}>
        {Screen ? <Screen onNav={onNav}/> : <div style={{padding:40, fontFamily:'var(--font-mono)', color:'var(--fg-3)'}}>Screen not found: {route}</div>}
      </div>
      <window.StatusBar note={`READY · ${route.toUpperCase()} · g+letter to nav`}/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
