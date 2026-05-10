CHANGES 


read and understand this project wh.txt

Untitled.txt
Game StudioGame Studio
understand this project wholey as i just added a new ui but it was botched and i added crams new updated modes and stuff use these txt docs for extra context
Friday 11:48 PM


Worked for 5m 18s
I read the project docs, both context txt files, the GDD/schema, the design handoff bundle, and the current source.

I also fixed one concrete botched-UI bug: Arena mode was showing the Arena topbar while still rendering Study Home. The fix is in app.jsx (line 1513): Arena now normalizes Study-only views to the Arena hub, so launching Arena or switching from Pass Mode lands correctly.

What I now understand:

StudyBuddy.html is generated from studybuddy_src/build/*.jsx by studybuddy_src/build_html.py.
No bundler, no node modules; JSX is compiled in-browser by Babel.
Study side = calm learning: Study, Exam, Daily, Review, Pass Mode.
Arena side = game systems: World fights, weapons, augments, pets, raids, Blitz, LOCK IN.
Your cram split is partly implemented:
study_pass.jsx = Study-side emergency Pass Mode.
cram.jsx = Arena-side Blitz / “The Night Before” wave draft mode.
lockin.jsx = lightweight Arena sprint.
The design handoff was not fully integrated. The current app only has partial tactical CSS fragments; tokens.css, brand.jsx, ui.jsx, and sprite primitives have not really been ported as the new design system.
Verification passed:

python build_html.py
duplicate top-level declaration scan
Babel standalone transform in Node
headless Chrome smoke test:
Arena from splash now opens Arena hub
Pass Mode still opens
switching from Pass Mode to Arena now opens Arena hub
no runtime errors except Babel’s normal in-browser warning
Main remaining issue: the reskin needs a real integration pass, not more patchy CSS. Next best move is to port tokens.css + minimal UI primitives first, then reskin Combat/Blitz/Pass one screen at a time.

2 files changed
+41
-35
Undo

Review

studybuddy_src/build/app.jsx
studybuddy_src/build/app.jsx




Friday 11:53 PM
amazing now lets start with the ui changesGame StudioGame Studio
12:08 AM

I’ll use the Game Studio UI workflow for this, because the work is now about making the game surfaces readable, thematic, and consistent rather than adding mechanics. I’m going to do one quick non-mutating pass over the current UI files and handoff bundle before locking the first implementation slice.


Ran 5 commands
I found the important shape: the handoff is a full tactical reskin, but the current app still has the old rounded-card system and emoji-heavy markup with only partial tactical overrides. Before I write the implementation plan, three choices materially affect the first UI slice and prevent wasted work.


Asked 3 questions
Worked for 1m 31s
Foundation-first + desktop-only + keep emoji temporarily is the right low-risk slice. One technical note from inspection: the handoff’s tokens.css is not pure tokens; it also defines .app, .topbar, .stage, .left, and .right, so blindly inlining it would collide with the existing shell. I’m checking the exact collision points and then I can give a decision-complete plan.

# StudyBuddy UI Foundation Pass

## Summary
Implement the first UI slice as a tactical design-system foundation, not a full screen rewrite. The goal is to make the existing app feel aligned with the handoff while keeping behavior stable: desktop-first, emoji retained temporarily, no sprite migration yet, and no broad Combat/Pass redesign in this slice.

## Key Changes
- Port the safe parts of the handoff design system into the production app:
  - Add Space Grotesk to the font import.
  - Add handoff token variables: `--bg-0..4`, `--fg..4`, `--accent`, semantic HP/block/insight/XP/tier colors, `--font-display`, `--font-body`, `--font-mono`, sharp radius vars.
  - Keep compatibility aliases for existing code: `--bg`, `--panel`, `--panel2`, `--panel3`, `--text`, `--text-2`, `--ok`, `--err`, etc.
- Do **not** inline `design_handoff_studybuddy/tokens.css` verbatim, because it redefines `.app`, `.topbar`, `.stage`, `.left`, and `.right` in ways that would break the current shell.
- Restyle existing global primitives in `studybuddy_src/build/head.html`:
  - `.card`, `.btn`, `.chip`, form controls, table rows, topic pills, topnav, topbar status chips.
  - Move from rounded purple premium styling to sharp tactical panels, hairline borders, mono caps, chartreuse accents.
- Add extracted utility classes from the handoff:
  - `.cap`, `.cap-line`, `.mono`, `.num`, `.display`, `.panel`, `.panel-corners`, `.bar`.
- Clean up the current partial tactical overrides in `studybuddy_src/build/arena.css` so they inherit the new tokens instead of fighting them.
- Keep current JSX structure and routing intact. Only touch `app.jsx` if a small class hook is needed; no new state, no new screens, no schema changes.

## Public Interfaces
- No localStorage, module JSON, save-state, or gameplay API changes.
- New public CSS interface:
  - Handoff token vars available globally.
  - Existing app vars remain valid through aliases.
  - New utility classes are available for future screen ports.
- Build pipeline remains the same: `python build_html.py`.

## Test Plan
- Run `python build_html.py` from `studybuddy_src`.
- Run Babel standalone transform against generated `StudyBuddy.html` to catch duplicate declarations or JSX errors.
- Smoke test in browser:
  - Splash loads.
  - Study Home loads.
  - Pass Mode loads.
  - Arena from splash lands on Arena hub.
  - Switch Study ↔ Arena still works.
  - Library, Stats, Deadlines, Modules still render.
- Visual checks at desktop width:
  - Topbar is sharp, compact, readable.
  - Cards/buttons/chips no longer look like the old rounded purple skin.
  - Pass Mode and Arena hub remain usable.
  - No text overlaps or clipped topnav items.

## Assumptions
- First slice is foundation-first.
- Desktop-only for this UI pass.
- Emoji stay for now; sprite replacement is deferred to a later Combat-focused pass.
- Pixel-perfect screen recreation starts after this foundation is stable.


Implemented the UI foundation pass in-place.

Changed [head.html](</c:/Users/lazar/Downloads/StudyBuddy  - prealpha V1/studybuddy_src/build/head.html>) for the global tactical token layer, Space Grotesk import, compatibility aliases, sharp primitives, utilities, dark form/file inputs, and a Study-mode topbar wrap so desktop nav does not clip.

Changed [arena.css](</c:/Users/lazar/Downloads/StudyBuddy  - prealpha V1/studybuddy_src/build/arena.css>) with a final tactical bridge layer over the old Arena/Pass styling: sharper panels, chartreuse accents, tokenized bars/badges/intent colors, splash cleanup, and Arena hub/Pass Mode inheritance without touching gameplay or JSX.

Rebuilt both generated outputs:
- [StudyBuddy.html](</c:/Users/lazar/Downloads/StudyBuddy  - prealpha V1/StudyBuddy.html>)
- [studybuddy_src/StudyBuddy.html](</c:/Users/lazar/Downloads/StudyBuddy  - prealpha V1/studybuddy_src/StudyBuddy.html>)

Verification passed:
- `python build_html.py` OK: 5 modules, 9 levels, 21 concepts, 64 questions.
- Babel standalone transform OK.
- Browser smoke passed for Splash, Study Home, Pass Mode, Study ↔ Arena switching, Arena from splash, Library, Stats, Deadlines, and Modules.
- Desktop overlap checks passed for Study, Pass, and Arena topbars.
- Refreshed screenshots are in `qa_screens/foundation-*.png`.

Note: this folder is not a git repository, so `git status` is unavailable here.


<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  :root{
    --surface-bg: rgba(18, 20, 28, 0.6);
    --surface-blur: blur(16px);
    --font-primary: 'Inter', sans-serif;
  }
  .theme-premium{
    --surface-bg: rgba(18, 20, 28, 0.6);
    --surface-blur: blur(16px);
    --font-primary: 'Inter', sans-serif;
  }
  .theme-tactical{
    --surface-bg: #12141c;
    --surface-blur: none;
    --font-primary: 'JetBrains Mono', monospace;
  }
  .dynamic-card{
    background: var(--surface-bg);
    backdrop-filter: var(--surface-blur);
    -webkit-backdrop-filter: var(--surface-blur);
    font-family: var(--font-primary);
  }
  :root{
    --bg:#0a0b10; --bg-elev:#0f1117; --panel:#12141c; --panel2:#171a24; --panel3:#1c2030;
    --line:rgba(255,255,255,0.06); --line-2:rgba(255,255,255,0.10);
    --text:#e8eaf0; --text-2:#b8bdcc; --muted:#6b7287; --muted-2:#4a5063;
    --accent:#8b9eff; --accent-2:#a78bfa;
    --accent-soft:rgba(139,158,255,0.12); --accent-line:rgba(139,158,255,0.35);
    --ok:#4ade80; --ok-soft:rgba(74,222,128,0.10);
    --warn:#fbbf24; --warn-soft:rgba(251,191,36,0.10);
    --err:#f87171; --err-soft:rgba(248,113,113,0.10);
    --code-bg:#0c0e15; --code-line:rgba(255,255,255,0.05);
    --radius-sm:6px; --radius:10px; --radius-lg:14px; --radius-xl:18px;
    --shadow-sm:0 1px 2px rgba(0,0,0,0.3);
    --shadow:0 4px 14px rgba(0,0,0,0.35);
    --shadow-lg:0 12px 36px rgba(0,0,0,0.45);
    --t-fast:120ms cubic-bezier(.4,0,.2,1);
    --t-base:200ms cubic-bezier(.4,0,.2,1);
    --t-slow:320ms cubic-bezier(.4,0,.2,1);
    --topbar-h: 112px;
  }
  *{box-sizing:border-box}
    background-image:
      radial-gradient(1100px 600px at 80% -10%, rgba(139,158,255,0.08), transparent 60%),
      radial-gradient(900px 500px at -10% 110%, rgba(167,139,250,0.06), transparent 55%);
    background-attachment:fixed;
    color:var(--text);
    font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size:14px; line-height:1.55;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  ::selection{background:var(--accent-soft);color:var(--text)}
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:99px;border:2px solid var(--bg)}
  ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}

  .app{display:flex;flex-direction:column;min-height:100vh}
    position:sticky; top:0; z-index:50;
    background:rgba(15,17,23,0.85);
    backdrop-filter:blur(18px) saturate(140%);
    -webkit-backdrop-filter:blur(18px) saturate(140%);
    border-bottom:1px solid var(--line);
    box-shadow:0 1px 0 rgba(255,255,255,0.02), 0 8px 30px rgba(0,0,0,0.25);
  }
    display:flex; align-items:center; gap:14px;
    padding:10px 24px;
    max-width:1600px; margin:0 auto;
  .brand .dot{
    width:28px;height:28px;border-radius:8px;
    background:linear-gradient(135deg, var(--accent), var(--accent-2));
    position:relative;overflow:hidden;
    box-shadow:0 4px 12px rgba(139,158,255,0.3);
  }
    content:'';position:absolute;inset:0;
    background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%);
  }
  .brand h1{font-size:14.5px;font-weight:700;letter-spacing:-0.01em;margin:0}

    color:var(--text);
    border-radius:var(--radius-sm);
    padding:7px 32px 7px 12px;
    font:inherit; font-size:13px; font-weight:500;
    cursor:pointer;
    background:transparent; border:0;
    color:var(--text-2);
    padding:7px 12px;
    cursor:pointer;
    font:inherit; font-size:13px; font-weight:500;
    border-radius:var(--radius-sm);
    transition:all var(--t-fast);
    white-space:nowrap; flex-shrink:0;
    letter-spacing:-0.005em;
  }
  .topnav button .emoji{font-size:13px;opacity:.85}
  .topnav button:hover{color:var(--text);background:var(--panel2)}
  .topnav button.active{
    color:var(--accent);
    background:var(--accent-soft);
    box-shadow:inset 0 0 0 1px var(--accent-line);
  }
    border:1px solid var(--line);
    border-radius:99px;
    font-size:12px; font-weight:600;
    color:var(--text-2);
    background:transparent;border:0;color:var(--muted);
    cursor:pointer;font:inherit;font-size:11px;
    padding:2px 5px;border-radius:4px;
    transition:all var(--t-fast);
    display:flex; align-items:center; gap:14px;
    padding:8px 24px 10px;
    max-width:1600px; margin:0 auto;
    border-top:1px solid var(--line);
    background:rgba(10,11,16,0.4);
  }
  .topbar-topics-label{
    color:var(--muted-2);font-size:10px;
    text-transform:uppercase;letter-spacing:.12em;
  .topics-group{
    color:var(--muted);
    font-size:10.5px; font-weight:600;
    background:transparent; border:1px solid var(--line);
    color:var(--text-2);
    padding:4px 11px; border-radius:99px;
    cursor:pointer; font:inherit; font-size:12px; font-weight:500;
    white-space:nowrap; flex-shrink:0;

  h1,h2,h3,h4{margin:0;font-weight:600;letter-spacing:-0.02em;color:var(--text)}
  h2{font-size:24px;margin-bottom:14px;letter-spacing:-0.025em}
  h3{font-size:15px;color:var(--text);margin-bottom:8px}
  h4{font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600}

    background:var(--panel); border:1px solid var(--line);
    border-radius:var(--radius-lg); padding:18px 20px; margin-bottom:14px;
    box-shadow:var(--shadow-sm);
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:99px;
    background:var(--panel2);border:1px solid var(--line);
    font-size:11.5px;color:var(--text-2);font-weight:500;letter-spacing:0.01em;
  }
  .chip.ok{background:var(--ok-soft);color:var(--ok);border-color:rgba(74,222,128,0.25)}
  .chip.warn{background:var(--warn-soft);color:var(--warn);border-color:rgba(251,191,36,0.25)}
  .chip.err{background:var(--err-soft);color:var(--err);border-color:rgba(248,113,113,0.25)}
  .chip.accent{background:var(--accent-soft);color:var(--accent);border-color:var(--accent-line)}
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    background:linear-gradient(180deg, var(--accent), #7387f0);
    color:#0a0b10;border:0;
    padding:8px 16px;border-radius:var(--radius-sm);
    font:inherit;font-weight:600;font-size:13px;
    cursor:pointer;letter-spacing:0.005em;
    transition:transform var(--t-fast), box-shadow var(--t-fast), filter var(--t-fast);
    box-shadow:0 1px 2px rgba(0,0,0,0.2), 0 4px 14px rgba(139,158,255,0.2);
  }
  .btn:hover{transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,0.2), 0 8px 20px rgba(139,158,255,0.32);filter:brightness(1.05)}
  .btn:active{transform:translateY(0)}
  .btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line-2);box-shadow:none}
  .btn.ghost:hover{background:var(--panel2);border-color:var(--line-2);box-shadow:none}
  .btn.ok{background:linear-gradient(180deg, var(--ok), #3fb967);color:#0a0b10}
  .btn.warn{background:linear-gradient(180deg, var(--warn), #d99e1d);color:#0a0b10}
  .btn.err{background:linear-gradient(180deg, var(--err), #d65454);color:#fff}
  .btn.sm{padding:5px 11px;font-size:12px}

  label{font-size:12px;color:var(--muted);display:block;margin-bottom:6px;font-weight:500;letter-spacing:0.01em}
  input[type=text],input[type=number],input[type=url],input[type=file],input[type=date],select,textarea{
    width:100%; background:var(--panel2); border:1px solid var(--line); color:var(--text);
    border-radius:var(--radius-sm); padding:9px 12px; font:inherit;
    transition:border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
  .brand .dot::after{
    content:'';position:absolute;inset:0;
    inset:5px;
    background:var(--bg-2);
    background:var(--code-bg);color:var(--accent);
    padding:1px 6px;border-radius:4px;
    font:13px/1.5 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
  }
  .q-type::before{content:'';display:inline-block;width:5px;height:5px;background:var(--accent);border-radius:99px}
  .mcq-opt{

  .progress{height:5px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden}
  .progress>div{height:100%;background:linear-gradient(90deg, var(--accent), var(--accent-2));transition:width var(--t-slow);box-shadow:0 0 8px rgba(139,158,255,0.3)}
  .xp-bar{height:6px;background:rgba(255,255,255,0.05);border-radius:99px;overflow:hidden;margin-top:6px}
  .xp-bar>div{height:100%;background:linear-gradient(90deg, var(--accent), var(--ok));transition:width var(--t-slow);box-shadow:0 0 8px rgba(139,158,255,0.25)}


  .pill{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500}
  .pill.done{background:var(--ok-soft);color:var(--ok);border:1px solid rgba(74,222,128,0.25)}
  .pill.todo{background:var(--warn-soft);color:var(--warn);border:1px solid rgba(251,191,36,0.25)}
  .out-box{
    background:#070910;
    border:1px solid var(--code-line);
    position:sticky;top:114px;
    background:rgba(18,20,28,0.85);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    padding:12px 16px;

  /* ---------- RESPONSIVE ---------- */
  }
  input:focus,select:focus,textarea:focus{
  input[type=date],
  select,

  /* ---------- RESPONSIVE ---------- */
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  :root{
    --bg-0:#07090a; --bg-1:#0a0d0e; --bg-2:#0f1314; --bg-3:#141a1c; --bg-4:#1a2123;
    --line:rgba(255,255,255,0.06); --line-2:rgba(255,255,255,0.10); --line-3:rgba(255,255,255,0.18); --line-grid:rgba(255,255,255,0.035);
    --fg:#e8efe9; --fg-1:#c5cfc7; --fg-2:#8b958d; --fg-3:#5a635c; --fg-4:#3a423d;
    --accent:#7dd87d; --accent-2:#5cb85c;
    --accent-soft:rgba(125,216,125,0.10); --accent-line:rgba(125,216,125,0.35); --accent-glow:rgba(125,216,125,0.45);
    --hp:#d94545; --hp-2:rgba(217,69,69,0.14);
    --block:#5b8def; --block-2:rgba(91,141,239,0.14);
    --insight:#e7c14b; --insight-2:rgba(231,193,75,0.14);
    --xp:#c084fc; --warn:#f59e0b; --crit:#ffd24a;
    --t-common:#8b958d; --t-rare:#5b8def; --t-epic:#b076ff; --t-legendary:#e7c14b; --t-mythic:#ff5f6e;
    --i-heavy:#ff5f6e; --i-light:#ffb15c; --i-defend:#5b8def; --i-debuff:#b076ff; --i-buff:#7dd87d; --i-summon:#e7c14b; --i-utility:#8b958d; --i-telegraph:#ff5f6e;
    --font-display:'Space Grotesk','Inter',sans-serif;
    --font-body:'Inter',system-ui,sans-serif;
    --font-mono:'JetBrains Mono','IBM Plex Mono',ui-monospace,monospace;
    --r-0:0px; --r-1:2px; --r-2:4px; --r-3:6px;

    /* Compatibility aliases for the existing app CSS/JSX. */
    --bg:var(--bg-1); --bg-elev:var(--bg-2); --panel:var(--bg-2); --panel2:var(--bg-3); --panel3:var(--bg-4);
    --text:var(--fg); --text-2:var(--fg-1); --muted:var(--fg-2); --muted-2:var(--fg-3);
    --ok:var(--accent); --ok-soft:var(--accent-soft);
    --err:var(--hp); --err-soft:var(--hp-2);
    --warn-soft:rgba(245,158,11,0.12);
    --code-bg:var(--bg-0); --code-line:var(--line);
    --radius-sm:var(--r-1); --radius:var(--r-0); --radius-lg:var(--r-0); --radius-xl:var(--r-0);
    --shadow-sm:none; --shadow:none; --shadow-lg:0 18px 50px rgba(0,0,0,0.45);
    --surface-bg:var(--bg-2); --surface-blur:none; --font-primary:var(--font-body);
    --t-fast:110ms cubic-bezier(.4,0,.2,1); --t-base:200ms cubic-bezier(.4,0,.2,1); --t-slow:320ms cubic-bezier(.4,0,.2,1);
    --topbar-h:82px;
  }
  .theme-premium,.theme-tactical{--surface-bg:var(--bg-2);--surface-blur:none;--font-primary:var(--font-body)}
  .dynamic-card{background:var(--surface-bg);backdrop-filter:var(--surface-blur);-webkit-backdrop-filter:var(--surface-blur);font-family:var(--font-primary)}
  *{box-sizing:border-box}
    background-image:
      linear-gradient(var(--line-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-grid) 1px, transparent 1px),
      radial-gradient(1200px 700px at 50% -10%, rgba(125,216,125,0.04), transparent 60%);
    background-size:32px 32px,32px 32px,100% 100%;
    background-attachment:fixed;
    color:var(--text);
    font-family:var(--font-body);
    font-size:13px; line-height:1.45;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  ::selection{background:var(--accent-soft);color:var(--text)}
  ::-webkit-scrollbar{width:8px;height:8px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:0}
  ::-webkit-scrollbar-thumb:hover{background:var(--line-3)}

  .mono{font-family:var(--font-mono);font-feature-settings:"tnum","ss01";letter-spacing:0}
  .num{font-family:var(--font-mono);font-feature-settings:"tnum";font-weight:500}
  .display{font-family:var(--font-display);letter-spacing:0;font-weight:600}
  .cap{font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--fg-3);font-weight:500}
  .cap-line{display:flex;align-items:center;gap:8px}
  .cap-line::after{content:"";flex:1;height:1px;background:var(--line)}
  .panel{background:var(--bg-2);border:1px solid var(--line);position:relative}
  .panel-corners{position:relative}
  .panel-corners::before,.panel-corners::after{content:"";position:absolute;width:8px;height:8px;border:1px solid var(--accent);pointer-events:none}
  .panel-corners::before{top:-1px;left:-1px;border-right:none;border-bottom:none}
  .panel-corners::after{bottom:-1px;right:-1px;border-left:none;border-top:none}
  .bar{height:6px;background:var(--bg-3);position:relative;overflow:hidden;border:1px solid var(--line)}
  .bar>span{display:block;height:100%;background:var(--accent);transition:width var(--t-base)}
  .bar.hp>span{background:var(--hp)}
  .bar.xp>span{background:var(--xp)}

  .app{display:flex;flex-direction:column;min-height:100vh}
    position:sticky; top:0; z-index:50;
    background:var(--bg-2);
    border-bottom:1px solid var(--line);
    box-shadow:none;
  }
    display:flex; align-items:center; gap:14px;
    min-height:44px; padding:0 24px;
    max-width:1600px; margin:0 auto;
  .brand .dot{
    width:24px;height:24px;border-radius:0;
    background:var(--accent);
    position:relative;overflow:hidden;
    clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);
    box-shadow:0 0 16px var(--accent-glow);
  }
    content:'';position:absolute;inset:0;
    inset:5px;
    background:var(--bg-2);
    clip-path:polygon(0 0,100% 0,100% 60%,60% 100%,0 100%);
  }
  .brand h1{font-family:var(--font-display);font-size:14px;font-weight:700;letter-spacing:0.01em;margin:0}

    color:var(--text);
    border-radius:0;
    padding:7px 32px 7px 12px;
    font-family:var(--font-display); font-size:13px; font-weight:600;
    cursor:pointer;
    background:transparent; border:0;
    color:var(--fg-2);
    padding:10px 12px;
    cursor:pointer;
    font-family:var(--font-mono); font-size:10px; font-weight:600;
    border-radius:0;
    border:1px solid transparent;
    transition:all var(--t-fast);
    white-space:nowrap; flex-shrink:0;
    letter-spacing:0.14em;
    text-transform:uppercase;
  }
  .topnav button .emoji{font-size:13px;opacity:.85}
  .topnav button:hover{color:var(--text);background:var(--panel2);border-color:var(--line)}
  .topnav button.active{
    color:var(--text);
    background:var(--panel3);
    border-color:var(--line-2);
    box-shadow:inset 0 -2px 0 var(--accent);
  }
    border:1px solid var(--line);
    border-radius:0;
    font-family:var(--font-mono);font-size:10px;font-weight:600;
    letter-spacing:0.08em;
    color:var(--text-2);
    background:transparent;border:0;color:var(--muted);
    cursor:pointer;font:inherit;font-size:10px;
    padding:2px 5px;border-radius:0;
    transition:all var(--t-fast);
    display:flex; align-items:center; gap:14px;
    padding:7px 24px 8px;
    max-width:1600px; margin:0 auto;
    border-top:1px solid var(--line);
    background:var(--bg-1);
  }
  .topbar-topics-label{
    color:var(--fg-3);font-family:var(--font-mono);font-size:10px;
    text-transform:uppercase;letter-spacing:.12em;
  .topics-group{
    color:var(--fg-3);
    font-family:var(--font-mono);
    font-size:10.5px; font-weight:600;
    background:transparent; border:1px solid var(--line);
    color:var(--fg-2);
    padding:4px 9px; border-radius:0;
    cursor:pointer; font-family:var(--font-mono); font-size:10px; font-weight:500;
    white-space:nowrap; flex-shrink:0;

  h1,h2,h3,h4{margin:0;font-family:var(--font-display);font-weight:600;letter-spacing:0;color:var(--text)}
  h2{font-size:24px;margin-bottom:14px}
  h3{font-size:15px;color:var(--text);margin-bottom:8px}
  h4{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.16em;font-weight:600}

    background:var(--panel); border:1px solid var(--line);
    border-radius:0; padding:16px; margin-bottom:14px;
    box-shadow:var(--shadow-sm);
    display:inline-flex;align-items:center;gap:5px;
    padding:2px 7px;border-radius:0;
    background:var(--panel2);border:1px solid var(--line);
    font-family:var(--font-mono);font-size:10px;color:var(--text-2);font-weight:500;letter-spacing:0.08em;
  }
  .chip.ok{background:var(--ok-soft);color:var(--ok);border-color:var(--accent-line)}
  .chip.warn{background:var(--warn-soft);color:var(--warn);border-color:rgba(251,191,36,0.25)}
  .chip.err{background:var(--err-soft);color:var(--err);border-color:rgba(217,69,69,0.35)}
  .chip.accent{background:var(--accent-soft);color:var(--accent);border-color:var(--accent-line)}
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    background:var(--accent);
    color:var(--bg-1);border:1px solid var(--accent);
    padding:8px 14px;border-radius:0;
    font-family:var(--font-mono);font-weight:600;font-size:11px;
    cursor:pointer;letter-spacing:0.14em;text-transform:uppercase;
    transition:transform var(--t-fast), background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    box-shadow:none;
  }
  .btn:hover{transform:translateY(-1px);background:var(--accent-2);border-color:var(--accent-2);filter:none}
  .btn:active{transform:translateY(0)}
  .btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line-2);box-shadow:none}
  .btn.ghost:hover{background:var(--panel2);border-color:var(--line-3);box-shadow:none;color:var(--accent)}
  .btn.ok{background:var(--accent);border-color:var(--accent);color:var(--bg-1)}
  .btn.warn{background:var(--insight);border-color:var(--insight);color:var(--bg-1)}
  .btn.err{background:var(--hp);border-color:var(--hp);color:#fff}
  .btn.sm{padding:5px 11px;font-size:12px}

  label{font-family:var(--font-mono);font-size:10px;color:var(--muted);display:block;margin-bottom:6px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase}
  input[type=text],input[type=number],input[type=url],input[type=file],input[type=date],select,textarea{
    width:100%; background:var(--panel2); border:1px solid var(--line); color:var(--text);
    border-radius:0; padding:9px 12px; font:inherit;
    transition:border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
  .brand .dot::after{
    content:'';position:absolute;inset:5px;
    background:var(--bg-2);
    background:var(--code-bg);color:var(--accent);
    padding:1px 6px;border-radius:var(--radius-sm);
    font:13px/1.5 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
  }
  .q-type::before{content:'';display:inline-block;width:5px;height:5px;background:var(--accent);border-radius:0}
  .mcq-opt{

  .progress{height:5px;background:var(--bg-3);border:1px solid var(--line);border-radius:0;overflow:hidden}
  .progress>div{height:100%;background:linear-gradient(90deg, var(--accent), var(--accent-2));transition:width var(--t-slow);box-shadow:none}
  .xp-bar{height:6px;background:var(--bg-3);border:1px solid var(--line);border-radius:0;overflow:hidden;margin-top:6px}
  .xp-bar>div{height:100%;background:linear-gradient(90deg, var(--xp), var(--accent));transition:width var(--t-slow);box-shadow:none}


  .pill{display:inline-block;padding:3px 10px;border-radius:0;font-family:var(--font-mono);font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase}
  .pill.done{background:var(--ok-soft);color:var(--ok);border:1px solid var(--accent-line)}
  .pill.todo{background:var(--warn-soft);color:var(--warn);border:1px solid rgba(251,191,36,0.25)}
  .out-box{
    background:var(--bg-0);
    border:1px solid var(--code-line);
    position:sticky;top:114px;
    background:var(--bg-2);
    backdrop-filter:none; -webkit-backdrop-filter:none;
    padding:12px 16px;

  /* ---------- FOUNDATION SKIN OVERRIDES ---------- */
  .dynamic-card,
  .card,
  .card-sub,
  .mcq-opt,
  .rating button,
  .exam-bar,
  .note-block,
  details.study-notes,
  .timer,
  .code-ed,
  .out-box{
    border-radius:0;
  }
  .dynamic-card,
  .card,
  .exam-bar,
  details.study-notes{
    box-shadow:none;
  }
  .btn,
  .chip,
  .pill,
  .hdr-chip,
  .topic-pill,
  .module-select,
  input[type=text],
  input[type=number],
  input[type=url],
  input[type=file],
  input[type=date],
  select,
  textarea{
    border-radius:0;
  }
  .btn,
  .chip,
  .hdr-chip,
  .topic-pill,
  .pill,
  .tbl th{
    font-family:var(--font-mono);
  }
  .tbl th{
    letter-spacing:0.14em;
    color:var(--fg-3);
  }
  .tbl tr:hover td{
    background:var(--bg-3);
  }
  .progress,
  .xp-bar{
    border-radius:0;
  }
  .progress>div,
  .xp-bar>div{
    box-shadow:none;
  }

  /* ---------- RESPONSIVE ---------- */
  }
  input:not([type=checkbox]):not([type=radio]){
    width:100%; background:var(--panel2); border:1px solid var(--line); color:var(--text);
    border-radius:0; padding:9px 12px; font:inherit;
    transition:border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
  }
  input[type=file]{color:var(--muted);padding:7px 8px}
  input[type=file]::file-selector-button{
    margin-right:10px;
    background:var(--bg-3);
    color:var(--text);
    border:1px solid var(--line-2);
    border-radius:0;
    padding:5px 9px;
    font:600 10px var(--font-mono);
    letter-spacing:0.08em;
    text-transform:uppercase;
  }
  input:focus,select:focus,textarea:focus{
  input[type=date],
  input:not([type=checkbox]):not([type=radio]),
  select,

  @media(max-width:1500px){
    .topbar.mode-normal .topbar-main{
      padding:8px 18px;
      flex-wrap:wrap;
    }
    .topbar.mode-normal .topnav{
      order:3;
      flex-basis:100%;
      border-top:1px solid var(--line);
      padding-top:6px;
      margin-top:2px;
    }
    .topbar.mode-normal .topnav button{
      padding:7px 10px;
    }
    .topbar.mode-normal .topbar-status{
      margin-left:auto;
    }
  }

  /* ---------- RESPONSIVE ---------- */

  
  .arena-combat.biome-void     {--biome-tint:rgba(255,255,255,0.04); --biome-accent:#e8eaf0; background:radial-gradient(800px 500px at 50% 50%, rgba(255,255,255,0.02), transparent 60%), #000}
  .arena-combat.biome-default  {--biome-tint:rgba(139,158,255,0.06); --biome-accent:var(--accent)}
  .arena-combat.biome-sanctum::before{
.arena-combat{position:relative; overflow:hidden}
/* LOCK IN + STUDY PASS scoped styles (scoped to arena) */
.arena-combat[data-arena] .lockin-run,
.arena-combat[data-arena] .study-pass {
  background: linear-gradient(180deg,#0f1315,#0b0f11);
  border: 1px solid rgba(255,255,255,0.03);
  padding: 12px;
}
.arena-combat[data-arena] .study-pass .muted,
.arena-combat[data-arena] .lockin-run .muted {
  color: var(--muted);
}
  .arena-combat.biome-cathedral::before{
.arena-combat[data-arena] {
  --panel: #07090a;
  --panel2: #0f1314;
  --panel3: #141a1c;
  --line: rgba(255,255,255,0.06);
  --accent: #7dd87d;
  --accent-line: rgba(125,216,125,0.22);
  --muted-2: #5a635c;
}
}
.arena-combat[data-arena] .combat-hud .combat-side.boss .hp-bar{ height:8px; border-radius:8px; }

}
.action-locked-banner,
.loadout-slot,
.ability-card,
.armory-item,
.armory-item.equipped,
.ability-card.equipped,
.loadout-slot.filled,
}
.levelup-modal,
  .arena-combat.biome-void     {--biome-tint:rgba(255,255,255,0.04); --biome-accent:#e8eaf0; background:radial-gradient(800px 500px at 50% 50%, rgba(255,255,255,0.02), transparent 60%), #000}
  .arena-combat.biome-default  {--biome-tint:rgba(125,216,125,0.06); --biome-accent:var(--accent)}
  .arena-combat.biome-sanctum::before{
.arena-combat{position:relative; overflow:hidden}
  .arena-combat.biome-cathedral::before{
.arena-combat[data-arena] {
  background-color:var(--bg-1);
}
}
.arena-combat[data-arena] .combat-hud .combat-side.boss .hp-bar{ height:8px; border-radius:0; }

}

/* ===== UI FOUNDATION BRIDGE: tactical skin over legacy Arena CSS ===== */
.topbar.mode-arena{
  background:var(--bg-2);
  border-bottom:1px solid var(--line);
  box-shadow:none;
}
.brand-badge{
  border-radius:0;
  background:var(--accent);
  color:var(--bg-1);
  box-shadow:none;
  font-family:var(--font-mono);
  letter-spacing:0.12em;
}

.splash{
  background:
    linear-gradient(var(--line-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-grid) 1px, transparent 1px),
    var(--bg-1);
  background-size:32px 32px,32px 32px,100% 100%;
}
.splash-bg{
  background:radial-gradient(900px 540px at 50% -12%, rgba(125,216,125,0.08), transparent 65%);
}
.splash-card{
  background:var(--bg-2);
  border:1px solid var(--line-2);
  border-radius:0;
  box-shadow:none;
}
.splash-logo{
  border-radius:0;
  background:var(--accent);
  box-shadow:0 0 22px var(--accent-glow);
  clip-path:polygon(0 0,100% 0,100% 70%,70% 100%,0 100%);
}
.splash-logo::after{
  background:none;
}
.splash-logo-inner{
  border-radius:0;
  background:var(--bg-2);
  box-shadow:none;
  clip-path:polygon(0 0,100% 0,100% 60%,60% 100%,0 100%);
}
.splash-title{
  color:var(--text);
  background:none;
  -webkit-text-fill-color:currentColor;
}
.splash-mode{
  border-radius:0;
  background:var(--bg-3);
  border:1px solid var(--line);
  box-shadow:none;
}
.splash-mode:hover,
.splash-mode.arena:hover{
  background:var(--bg-4);
  border-color:var(--accent-line);
  box-shadow:none;
}

.char-card,
.boss-card,
.combat-hud,
.combat-q,
.action-card,
.action-btn,
.action-locked-banner,
.loadout-slot,
.ability-card,
.armory-item,
.armory-detail,
.armory-ab,
.sp-bank,
.socket-card,
.socket-slot,
.library-tracker,
.library-rail,
.library-content,
.library-pdfs,
.library-pdf-toolbar,
.pdf-missing,
.stage-card,
.stage-emoji,
.boss-stage,
.elite-card,
.insights-panel,
.practice-notes,
.biome-banner,
.pet-companion-strip,
.pet-equipped-banner,
.pet-card,
.raid-card,
.raid-phase-banner,
.raid-phases-row,
.levelup-modal,
.levelup-choice,
.forge-balance-card,
.forge-card,
.forge-craft-preview,
.passives-section,
.passives-row,
.exchange-card,
.exchange-trade-side,
.stat-buff-row,
.bestiary-card,
.bestiary-card-head,
.bestiary-body,
.bestiary-mistakes,
.bestiary-mistake-row,
.hub-toolbar,
.hub-btn,
.result-modal,
.result-empty,
.loot-card,
.codex-card,
.codex-icon,
.cram-timer-strip,
.cram-draft-card,
.cram-modal,
.cram-pick-card,
.study-pass-hero,
.lockin-hero,
.pass-topic-row,
.pass-steps div{
  border-radius:0;
  box-shadow:none;
}

.char-card,
.combat-hud,
.armory-detail,
.library-content,
.stage-card,
.levelup-modal,
.result-modal,
.cram-modal,
.study-pass-hero,
.lockin-hero{
  background:var(--bg-2);
  border-color:var(--line);
}
.card.dynamic-card,
.char-card.dynamic-card,
.armory-shell.dynamic-card{
  background:var(--bg-2);
  backdrop-filter:none;
  -webkit-backdrop-filter:none;
}

.char-avatar-ring,
.biome-banner-icon,
.stage-emoji,
.codex-icon,
.forge-card-icon,
.pet-comp-icon,
.pet-banner-icon,
.raid-phase-dot{
  border-radius:0;
}
.char-avatar-ring{
  background:var(--accent);
  color:var(--bg-1);
  border-color:var(--accent);
}
.weapon-name,
.skill-row.current .skill-name,
.sp-cost,
.hub-toolbar-label,
.pass-kicker,
.lockin-kicker,
.pass-rank,
.cram-draft-check{
  color:var(--accent);
}

.stat-label,
.hub-toolbar-label,
.intent-legend-label,
.pass-kicker,
.lockin-kicker{
  font-family:var(--font-mono);
  letter-spacing:0.14em;
}
.stat-pill,
.ab-pill,
.tier-badge,
.codex-tier-pill,
.biome-mod-chip,
.enemy-intent-pill,
.intent-legend-key,
.loot-new-badge,
.levelup-rank,
.xp-chip,
.pet-level-chip,
.action-locked-label,
.action-locked-est{
  border-radius:0;
  font-family:var(--font-mono);
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.skill-bar,
.hp-bar,
.armory-wxp,
.pet-xp-bar,
.cram-progress-bar{
  border-radius:0;
  background:var(--bg-3);
  border:1px solid var(--line);
}
.skill-fill,
.armory-wxp-fill,
.pet-xp-fill,
.cram-progress-fill{
  box-shadow:none;
}
.hp-fill.player{background:var(--accent)}
.hp-fill.boss{background:var(--hp)}
.pet-xp-fill.max{background:linear-gradient(90deg, var(--accent), var(--insight));box-shadow:none}

.arena-combat{
  --biome-tint:rgba(125,216,125,0.06);
  --biome-accent:var(--accent);
  border-radius:0;
}
.arena-combat[data-arena]{
  background:
    linear-gradient(var(--line-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-grid) 1px, transparent 1px),
    var(--bg-1);
  background-size:32px 32px,32px 32px,100% 100%;
}
.arena-combat[data-arena] .combat-q,
.arena-combat[data-arena] .action-card,
.arena-combat[data-arena] .combat-hud .combat-side.boss,
.arena-combat[data-arena] .enemies-grid > *.targeted{
  box-shadow:none;
}
.arena-combat[data-arena] .combat-q,
.arena-combat[data-arena] .action-card{
  background:var(--bg-2);
}
.arena-combat[data-arena] .action-row .action-btn.selected{
  background:var(--accent-soft);
  border-color:var(--accent);
  box-shadow:none;
}
.action-btn:hover:not(:disabled){
  box-shadow:none;
}
.action-btn.selected{
  background:var(--accent-soft);
  box-shadow:none;
}
.action-selected-check{
  text-shadow:none;
}
.same-warn{
  outline-color:var(--insight);
}
.momentum-chip,
.hub-btn.primary,
.action-locked-banner,
.socket-card,
.library-tracker,
.sp-bank{
  background:var(--accent-soft);
  border-color:var(--accent-line);
  color:var(--accent);
}
.hub-btn{
  font-family:var(--font-mono);
  font-size:11px;
  letter-spacing:0.08em;
  text-transform:uppercase;
}
.hub-btn.primary{
  color:var(--bg-1);
  background:var(--accent);
}
.hub-btn.warn{
  color:var(--hp);
  border-color:rgba(217,69,69,0.35);
}

.intent,
.enemy-intent-pill,
.intent-legend-key,
.biome-mod-chip{
  border-radius:0;
}
.intent-heavy_dmg,
.enemy-intent-pill.intent-heavy_dmg,
.intent-legend-key.intent-heavy_dmg,
.biome-mod-chip.intent-heavy_dmg,
.intent-fatal_dmg,
.enemy-intent-pill.intent-fatal_dmg,
.intent-legend-key.intent-fatal_dmg{
  color:var(--i-heavy);
  background:rgba(255,95,110,0.12);
  border-color:rgba(255,95,110,0.36);
}
.intent-light_dmg,
.enemy-intent-pill.intent-light_dmg,
.intent-legend-key.intent-light_dmg,
.intent-med_dmg,
.enemy-intent-pill.intent-med_dmg,
.intent-legend-key.intent-med_dmg{
  color:var(--i-light);
  background:rgba(255,177,92,0.12);
  border-color:rgba(255,177,92,0.34);
}
.intent-defend,
.enemy-intent-pill.intent-defend,
.intent-legend-key.intent-defend{
  color:var(--block);
  background:var(--block-2);
  border-color:rgba(91,141,239,0.36);
}
.intent-debuff,
.enemy-intent-pill.intent-debuff,
.intent-legend-key.intent-debuff{
  color:var(--i-debuff);
  background:rgba(176,118,255,0.12);
  border-color:rgba(176,118,255,0.36);
}
.intent-heal,
.intent-buff,
.enemy-intent-pill.intent-heal,
.enemy-intent-pill.intent-buff,
.intent-legend-key.intent-heal,
.intent-legend-key.intent-buff{
  color:var(--accent);
  background:var(--accent-soft);
  border-color:var(--accent-line);
}
.intent-summon,
.enemy-intent-pill.intent-summon,
.intent-legend-key.intent-summon{
  color:var(--insight);
  background:var(--insight-2);
  border-color:rgba(231,193,75,0.35);
}

.tier-badge.tier-basic,
.codex-tier-pill.tier-common,
.loot-card.tier-common{
  color:var(--t-common);
  border-color:rgba(139,149,141,0.45);
  background:rgba(139,149,141,0.12);
}
.tier-badge.tier-core,
.codex-tier-pill.tier-rare,
.loot-card.tier-rare{
  color:var(--t-rare);
  border-color:rgba(91,141,239,0.45);
  background:rgba(91,141,239,0.12);
}
.tier-badge.tier-advanced,
.codex-tier-pill.tier-epic,
.loot-card.tier-epic{
  color:var(--t-epic);
  border-color:rgba(176,118,255,0.45);
  background:rgba(176,118,255,0.12);
}
.codex-tier-pill.tier-legendary,
.loot-card.tier-legendary,
.loot-card.legendary{
  color:var(--t-legendary);
  border-color:rgba(231,193,75,0.48);
  background:var(--insight-2);
  animation:none;
}
.codex-tier-pill.tier-mythic,
.loot-card.tier-mythic{
  color:var(--t-mythic);
  border-color:rgba(255,95,110,0.48);
  background:rgba(255,95,110,0.12);
  animation:none;
}
.loot-card.rarity-mythic,
.loot-card.rarity-epic,
.loot-card.rarity-rare,
.loot-card.rarity-legendary,
.loot-card.rarity-raid_only,
.loot-card.rarity-ultra_rare{
  background:var(--bg-3);
  box-shadow:none;
}
.loot-card.new::before{
  border-radius:0;
  background:linear-gradient(90deg, transparent, rgba(125,216,125,0.18), transparent);
}
.loot-new-badge,
.levelup-rank{
  background:var(--accent);
  color:var(--bg-1);
  box-shadow:none;
}

.codex-card:hover,
.pet-card:hover,
.forge-card:hover,
.levelup-choice:hover,
.raid-card:hover,
.exchange-card:hover:not(.disabled),
.hub-btn:hover{
  box-shadow:none;
}
.codex-card.owned,
.pet-card.equipped,
.bestiary-card.open,
.armory-item.equipped,
.ability-card.equipped,
.loadout-slot.filled,
.cram-draft-card.picked{
  background:var(--accent-soft);
  border-color:var(--accent-line);
  box-shadow:none;
}
.levelup-modal,
.levelup-choice,
.result-modal,
.result-modal.win,
.result-modal.lose{
  box-shadow:none;
}

.study-pass-hero,
.lockin-hero,
.pass-topic-row,
.pass-steps div,
.cram-draft-card,
.cram-timer-strip{
  background:var(--bg-2);
  border-color:var(--line);
}
.pass-rank{
  border-color:var(--accent-line);
  background:var(--accent-soft);
}
.cram-timer-strip{
  border-left:3px solid var(--hp);
}
.cram-timer-strip.urgent{
  box-shadow:none;
  border-color:var(--hp);
}
.action-locked-banner,
.hotbar-slot.mini,
.weapon-card,
.tree-skill,
.loadout-slot,
.ability-card,
.reward-card,
.armory-item,
.armory-item.equipped,
.weapon-card.equipped,
.ability-card.equipped,
.hotbar-slot.mini.filled,
.loadout-slot.filled,
}
.hotbar-slot.mini.tree.filled,
.hotbar-slot.mini.weapon.filled{
  background:var(--accent-soft);
  border-color:var(--accent-line);
}
.levelup-modal,