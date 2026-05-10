/* StudyBuddy — Combat HUD prototype.
   Tactical FM-24-meets-blueprint layout: left rail (build), center stage (enemies + Q + abilities),
   right rail (intel/log/weakness). Fully interactive. */

const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ──────────────────────────────────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────────────────────────────────── */

const TIER_COLOR = {
  basic:'#8b958d', core:'#5b8def', advanced:'#b076ff', elite:'#e7c14b'
};

const INTENT_LABEL = {
  light_dmg:'STRIKE', med_dmg:'STRIKE', heavy_dmg:'HEAVY', fatal_dmg:'LETHAL',
  defend:'DEFEND', heal:'HEAL', buff:'BUFF', debuff:'DEBUFF',
  utility:'UTILITY', summon:'SUMMON', telegraph:'CHARGE'
};

const ENEMY_ABILITIES = {
  mob_scratch:    { name:'Scratch',     intent:'light_dmg', getDmg:l=>5+l, desc:'Light slash. Pure pressure.' },
  mob_bite:       { name:'Bite',        intent:'med_dmg',   getDmg:l=>8+l*2, desc:'Standard bite. Mid damage.' },
  mob_defend:     { name:'Hunker',      intent:'defend',    getDmg:_=>0, getBlock:l=>10+l, desc:'Generates block. No damage.' },
  mob_distract:   { name:'Distract',    intent:'utility',   getDmg:_=>0, desc:'Drains 1 momentum.' },
  mob_poison:     { name:'Poison Dart', intent:'debuff',    getDmg:_=>0, desc:'Applies 3 poison stacks.' },
  mob_kamikaze:   { name:'Cram Crash',  intent:'heavy_dmg', getDmg:l=>25+l*2, desc:'Self-destructs for huge damage.' },
  mob_leech:      { name:'Leech',       intent:'heal',      getDmg:l=>5+l, desc:'Damages player and self-heals.' },
  mob_taunt:      { name:'Taunt',       intent:'utility',   getDmg:_=>0, desc:'Forces target to itself.' },

  elite_cleave:   { name:'Cleave',      intent:'heavy_dmg', getDmg:l=>15+l*3, desc:'Wide swing. Heavy damage.' },
  elite_rally:    { name:'Rallying Cry',intent:'buff',      getDmg:_=>0, desc:'Buffs allies +5 damage.' },
  elite_amnesia:  { name:'Amnesia',     intent:'debuff',    getDmg:l=>5+l, desc:'Resets your streak. Hurts.' },
  elite_brain_fog:{ name:'Brain Fog',   intent:'debuff',    getDmg:_=>0, desc:'Cooldowns +1 turn.' },
  elite_barrier:  { name:'Group Barrier', intent:'buff',    getDmg:_=>0, desc:'Shields all allies for 15.' },
  elite_vampiric: { name:'Vampiric',    intent:'heavy_dmg', getDmg:l=>20+l*2, desc:'Damages player, heals all allies.' },

  boss_charge:    { name:'Charging…',   intent:'telegraph', getDmg:_=>0, desc:'Telegraphing massive attack next turn.' },
  boss_nuke:      { name:'Exam Failure',intent:'fatal_dmg', getDmg:l=>40+l*5, desc:'CATACLYSMIC. Block or perish.' },
  boss_summon:    { name:'Call Backup', intent:'summon',    getDmg:_=>0, desc:'Summons 2 minion adds.' },
  boss_silence:   { name:'Mental Blank',intent:'debuff',    getDmg:_=>0, desc:'Locks advanced abilities for 1 turn.' },
  boss_gravity:   { name:'Exam Stress', intent:'fatal_dmg', getDmg:_=>0, desc:'Halves player HP.' },
};

const ENEMY_PASSIVES = {
  swarm:        { lbl:'Swarm', desc:'+2 dmg per other living enemy' },
  pack:         { lbl:'Pack',  desc:'+5 max HP per ally at spawn' },
  thorns:       { lbl:'Thorns',desc:'reflects 20% melee damage' },
  thick_hide:   { lbl:'Hide',  desc:'reduces incoming dmg by 5' },
  anti_magic:   { lbl:'A-Mag', desc:'tree damage halved' },
  regenerator:  { lbl:'Regen', desc:'heals 5 HP each turn' },
  unstoppable:  { lbl:'Unstop',desc:'immune to skip-turn effects' },
  adaptive:     { lbl:'Adapt', desc:'same ability twice = -50% dmg' },
  second_phase: { lbl:'2nd-P', desc:'revives at 50% HP once' },
};

/* Pre-built enemy lineup for the demo */
const initialEnemies = () => [
  {
    id:'e1', sprite:'bookworm', name:'Bookworm Swarm',
    tier:'minion', level:3,
    hp:32, maxHp:42, block:0,
    pattern:['mob_scratch','mob_bite','mob_defend','mob_poison'],
    patternIndex:0,
    passives:['swarm']
  },
  {
    id:'e2', sprite:'paper_imp', name:'Pop Quiz',
    tier:'minion', level:3,
    hp:38, maxHp:42, block:6,
    pattern:['mob_distract','mob_bite','mob_kamikaze'],
    patternIndex:1,
    passives:['pack']
  },
  {
    id:'e3', sprite:'glitch', name:'Syntax Wraith',
    tier:'elite', level:4,
    hp:118, maxHp:140, block:0,
    pattern:['elite_cleave','elite_amnesia','elite_brain_fog','elite_vampiric'],
    patternIndex:2,
    passives:['anti_magic','thick_hide']
  },
  {
    id:'e4', sprite:'professor', name:'Adjunct Professor',
    tier:'boss', level:5,
    hp:240, maxHp:300, block:30,
    pattern:['boss_charge','boss_nuke','boss_summon','boss_silence'],
    patternIndex:0,
    passives:['adaptive','second_phase']
  },
];

/* Hotbar abilities for the demo (player has Caveman + tree picks) */
const HOTBAR = [
  { key:'1', id:'quick_slash',  name:'Quick Slash',  tier:'basic',    sprite:'blade',   desc:'Deal 9 dmg to target.', cd:0, src:'weapon' },
  { key:'2', id:'flurry',       name:'Flurry',       tier:'core',     sprite:'fire',    desc:'5 dmg per Streak point.', cd:0, src:'weapon', minStreak:2 },
  { key:'3', id:'fatal_error',  name:'Fatal Error',  tier:'advanced', sprite:'bolt',    desc:'Crit for 32 dmg.',  cd:2, src:'weapon', minStreak:4 },
  { key:'4', id:'tree_skim',    name:'Skim Reading', tier:'basic',    sprite:'book',    desc:'5 dmg, ignores block.', cd:0, src:'tree' },
  { key:'5', id:'tree_eureka',  name:'Eureka',       tier:'core',     sprite:'crystal', desc:'+3 Momentum instantly.', cd:1, src:'tree', minStreak:2 },
];

const QUESTIONS = [
  {
    id:'q1', concept:'NEURAL · activation',
    prompt:'Which activation function outputs strictly between 0 and 1, and is most associated with the vanishing-gradient problem?',
    options:[
      'ReLU (Rectified Linear Unit)',
      'Sigmoid (logistic)',
      'Tanh (hyperbolic tangent)',
      'Leaky ReLU',
    ],
    correct:1, kind:'mcq'
  },
  {
    id:'q2', concept:'NEURAL · backprop',
    prompt:'Backpropagation computes the gradient of the loss with respect to weights using the chain rule of calculus.',
    options:['True','False'],
    correct:0, kind:'tf'
  },
  {
    id:'q3', concept:'NEURAL · regularisation',
    prompt:'Which technique randomly zeroes activations during training to reduce co-adaptation between neurons?',
    options:[
      'L2 weight decay',
      'Batch normalisation',
      'Dropout',
      'Early stopping',
    ],
    correct:2, kind:'mcq'
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   PIXEL SPRITE COMPONENT (small wrapper over <Sprite/>)
   ────────────────────────────────────────────────────────────────────────── */

function Pix({ id, kind='enemy', size=32, className='', tier }){
  const lib = kind==='enemy' ? window.SPR : kind==='ability' ? window.ABISPR : window.PETSPR;
  const data = lib?.[id];
  const tierClass = tier ? ' tier-'+tier : '';
  return (
    <span className={'sprite '+className+tierClass} style={{width:size, height:size}}>
      {data && <window.Sprite rows={data.rows} palette={data.palette} />}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   INTENT BADGE
   ────────────────────────────────────────────────────────────────────────── */

function IntentIcon({ intent }){
  // Tiny SVG glyph
  switch(intent){
    case 'heavy_dmg':
    case 'fatal_dmg':
    case 'med_dmg':
    case 'light_dmg':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="2" y="2" width="2" height="2" fill="currentColor"/>
        <rect x="4" y="4" width="2" height="2" fill="currentColor"/>
        <rect x="6" y="6" width="2" height="2" fill="currentColor"/>
        <rect x="8" y="8" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="10" width="2" height="2" fill="currentColor"/>
        <rect x="12" y="12" width="2" height="2" fill="currentColor"/>
        <rect x="11" y="11" width="3" height="1" fill="currentColor"/>
        <rect x="11" y="13" width="3" height="1" fill="currentColor"/>
      </svg>;
    case 'defend':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="4" y="2" width="8" height="1" fill="currentColor"/>
        <rect x="3" y="3" width="10" height="1" fill="currentColor"/>
        <rect x="3" y="4" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1"/>
        <rect x="4" y="10" width="8" height="1" fill="currentColor"/>
        <rect x="5" y="11" width="6" height="1" fill="currentColor"/>
        <rect x="6" y="12" width="4" height="1" fill="currentColor"/>
        <rect x="7" y="13" width="2" height="1" fill="currentColor"/>
      </svg>;
    case 'buff':
    case 'heal':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="6" y="3" width="4" height="10" fill="currentColor"/>
        <rect x="3" y="6" width="10" height="4" fill="currentColor"/>
      </svg>;
    case 'debuff':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="3" y="3" width="2" height="2" fill="currentColor"/>
        <rect x="11" y="3" width="2" height="2" fill="currentColor"/>
        <rect x="5" y="5" width="2" height="2" fill="currentColor"/>
        <rect x="9" y="5" width="2" height="2" fill="currentColor"/>
        <rect x="7" y="7" width="2" height="2" fill="currentColor"/>
        <rect x="5" y="9" width="2" height="2" fill="currentColor"/>
        <rect x="9" y="9" width="2" height="2" fill="currentColor"/>
        <rect x="3" y="11" width="2" height="2" fill="currentColor"/>
        <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
      </svg>;
    case 'summon':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="7" y="2" width="2" height="12" fill="currentColor"/>
        <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
        <rect x="4" y="4" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="4" width="2" height="2" fill="currentColor"/>
        <rect x="4" y="10" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="10" width="2" height="2" fill="currentColor"/>
      </svg>;
    case 'telegraph':
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="4" y="2" width="8" height="1" fill="currentColor"/>
        <rect x="4" y="13" width="8" height="1" fill="currentColor"/>
        <rect x="5" y="3" width="6" height="1" fill="currentColor"/>
        <rect x="6" y="4" width="4" height="2" fill="currentColor"/>
        <rect x="7" y="6" width="2" height="4" fill="currentColor"/>
        <rect x="6" y="10" width="4" height="2" fill="currentColor"/>
        <rect x="5" y="12" width="6" height="1" fill="currentColor"/>
      </svg>;
    default:
      return <svg viewBox="0 0 16 16" width="14" height="14" shapeRendering="crispEdges">
        <rect x="6" y="3" width="4" height="3" fill="currentColor"/>
        <rect x="6" y="9" width="4" height="2" fill="currentColor"/>
        <rect x="6" y="12" width="4" height="2" fill="currentColor"/>
      </svg>;
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   HUD pieces
   ────────────────────────────────────────────────────────────────────────── */

function Topbar({ player, accent, onTabSwitch, tab }){
  const tabs = ['Combat','World','Study','Library','Codex','Stats'];
  return (
    <header className="topbar">
      <div className="tb-brand">
        <div className="tb-mark" />
        <div className="tb-title">STUDY<span style={{color:'var(--accent)'}}>BUDDY</span><span className="ver">v0.6 // ARENA</span></div>
      </div>
      <nav className="tb-tabs">
        {tabs.map((t,i)=>(
          <div key={t} className={'tb-tab '+(t.toLowerCase()===tab?'is-active':'')} onClick={()=>onTabSwitch(t.toLowerCase())}>
            <span className="key">{i+1}</span>{t}
          </div>
        ))}
      </nav>
      <div className="tb-spacer" />
      <div className="tb-stats">
        <div className="tb-stat"><div className="k">HP</div><div className="v"><span style={{color:'var(--hp)'}}>{player.hp}</span><small>/{player.maxHp}</small></div></div>
        <div className="tb-stat"><div className="k">XP · LV {player.level}</div><div className="v">{player.xp}<small>/{player.xpNext}</small></div></div>
        <div className="tb-stat"><div className="k">Insight</div><div className="v" style={{color:'var(--insight)'}}>{player.insight}</div></div>
        <div className="tb-stat"><div className="k">Streak</div><div className="v" style={{color:'var(--accent)'}}>×{player.streak}</div></div>
        <div className="tb-stat"><div className="k">Run</div><div className="v">07:24</div></div>
      </div>
    </header>
  );
}

function LeftRail({ player, weapon, sockets, pet, hotbar, selected, onSelect }){
  return (
    <aside className="left">
      <div className="rail-section">
        <h4>Operator <span className="grow"/><span className="pill">LV {player.level}</span></h4>
        <div className="slot is-active">
          <Pix id="bookworm" size={40} />
          <div className="meta">
            <div className="name">{player.codename}</div>
            <div className="sub">PRESTIGE 0 · CAVEMAN PATH</div>
          </div>
        </div>

        <div style={{marginTop:10}}>
          <div className="stat-row"><span className="k">HP MAX</span><span className="v">{player.maxHp}</span></div>
          <div className="stat-row"><span className="k">ATK</span><span className="v up">+{weapon.atk}</span></div>
          <div className="stat-row"><span className="k">DEF</span><span className="v">{weapon.def>=0?'+':''}{weapon.def}</span></div>
          <div className="stat-row"><span className="k">CRIT</span><span className="v">{player.crit}%</span></div>
          <div className="stat-row"><span className="k">XP MUL</span><span className="v up">×{weapon.xpMul.toFixed(2)}</span></div>
          <div className="stat-row"><span className="k">MOM CAP</span><span className="v">{player.maxMomentum}</span></div>
        </div>
      </div>

      <div className="rail-section">
        <h4>Weapon · {weapon.id.toUpperCase()} <span className="grow"/><span className="pill">LV {weapon.level}</span></h4>
        <div className="slot is-active">
          <Pix id={weapon.sprite} kind="ability" size={40} />
          <div className="meta">
            <div className="name">{weapon.name}</div>
            <div className="sub">{weapon.tagline}</div>
          </div>
        </div>
        <div className="bar xp" style={{marginTop:8}}><span style={{width: (weapon.xp/weapon.xpNext*100)+'%'}}/></div>
        <div className="stat-row" style={{marginTop:6}}>
          <span className="k">MASTERY · NEXT</span>
          <span className="v">{weapon.xp}/{weapon.xpNext}</span>
        </div>
      </div>

      <div className="rail-section">
        <h4>Sockets <span className="grow"/><span className="pill">{sockets.length}/4</span></h4>
        {sockets.map((s,i)=>(
          <div className="slot" key={i}>
            <Pix id={s.sprite} kind="ability" size={28} tier={s.tier} />
            <div className="meta">
              <div className="name">{s.name}</div>
              <div className="sub" style={{color: 'var(--t-'+s.tier+')'}}>{s.tier.toUpperCase()} · {s.effect}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <h4>Pet</h4>
        <div className="slot is-active">
          <Pix id={pet.sprite} kind="pet" size={40} tier={pet.tier} />
          <div className="meta">
            <div className="name">{pet.name}</div>
            <div className="sub">{pet.desc}</div>
          </div>
          <div className="right-num">LV {pet.level}</div>
        </div>
      </div>
    </aside>
  );
}

function EnemyCard({ enemy, isTarget, onTarget, hit }){
  if (!enemy) return null;
  const ability = ENEMY_ABILITIES[enemy.pattern[enemy.patternIndex % enemy.pattern.length]] || {};
  const lvl = enemy.level || 1;
  const dmg = ability.getDmg ? ability.getDmg(lvl) : 0;
  const block = ability.getBlock ? ability.getBlock(lvl) : 0;
  const dead = enemy.hp <= 0;
  const intentVal = block ? '+'+block : (dmg ? dmg : '–');

  return (
    <div
      className={'enemy-card '+(isTarget?'is-target ':'')+(dead?'is-dead ':'')+(hit?'is-hit ':'')}
      onClick={()=>!dead && onTarget(enemy.id)}
    >
      <div className="enemy-portrait">
        <span className="tier-tag">{enemy.tier}</span>
        <span className="lv-tag">LV {lvl}</span>
        <Pix id={enemy.sprite} size={64} className="" />
      </div>
      <div className="enemy-name">
        <span>{enemy.name}</span>
        <span className="hp-num"><b>{Math.max(0,enemy.hp)}</b>/{enemy.maxHp}</span>
      </div>
      <div className="bar hp"><span style={{width: Math.max(0,enemy.hp)/enemy.maxHp*100+'%'}} /></div>
      <div className="enemy-passives">
        {(enemy.passives||[]).map(p=>(
          <span className="passive-chip" key={p} title={ENEMY_PASSIVES[p]?.desc}>{ENEMY_PASSIVES[p]?.lbl||p}</span>
        ))}
        {enemy.block>0 && <span className="passive-chip" style={{borderColor:'var(--block)', color:'var(--block)'}}>BLK {enemy.block}</span>}
      </div>
      <div className={'enemy-intent '+(ability.intent||'utility')} title={ability.desc}>
        <span className="ico" style={{color: 'var(--i-'+(ability.intent||'utility').replace('_dmg','').replace('fatal','heavy')+')'}}>
          <IntentIcon intent={ability.intent} />
        </span>
        <div className="lbl">
          <div className="nm">{ability.name||'…'}</div>
          <div className="ds">{INTENT_LABEL[ability.intent]||'–'}</div>
        </div>
        <div className="v">{intentVal}</div>
      </div>
    </div>
  );
}

function EnemyRow({ enemies, targetId, onTarget, hitId, floats }){
  return (
    <div className="enemy-row">
      {enemies.map(e=>(
        <div key={e.id} style={{position:'relative'}}>
          <EnemyCard enemy={e} isTarget={e.id===targetId} onTarget={onTarget} hit={e.id===hitId} />
          {floats.filter(f=>f.targetId===e.id).map(f=>(
            <div className={'fx-float '+(f.kind||'')} key={f.id}
              style={{ left: f.x, top: f.y }}>{f.text}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function StageHeader({ chapter, biome, streak, momentum, maxMom, turn }){
  return (
    <div className="stage-hdr">
      <div className="sh-left">
        <div className="chap">{chapter.code}</div>
        <div className="name">{chapter.name}</div>
      </div>
      <div className="sh-mid">
        <div className="sh-streak">
          <span className="cap">STREAK</span>
          <div className="pips">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className={'pip '+(i<streak?'on':'')} />
            ))}
          </div>
          <span className="num" style={{color:'var(--accent)', marginLeft:4}}>×{streak}</span>
        </div>
        <div style={{width:1, height:20, background:'var(--line)'}} />
        <div className="sh-mom">
          <span className="cap">MOM</span>
          {Array.from({length:maxMom}).map((_,i)=>(
            <div key={i} className={'dot '+(i<momentum?'on':'')} />
          ))}
        </div>
      </div>
      <div className="sh-right">
        <div className="turn">TURN · {turn.toString().padStart(2,'0')}</div>
        <div className="biome">// {biome}</div>
      </div>
    </div>
  );
}

function QuestionSlab({ question, onAnswer, eliminated, locked, answer }){
  if (!question) return null;
  return (
    <div className="q-slab panel-corners">
      <div className="q-slab-hdr">
        <div className="left">
          <span className="q-tag">{question.kind}</span>
          <span className="q-concept">{question.concept}</span>
        </div>
        <div className="right">
          <span>Q {question.id.toUpperCase()}</span>
          <span style={{color:'var(--accent)'}}>● LIVE</span>
        </div>
      </div>
      <div className="q-body">
        <div className="q-prompt">{question.prompt}</div>
        <div className="q-options">
          {question.options.map((opt, i)=>{
            const isCorrect = answer!=null && i===question.correct;
            const isWrong = answer!=null && i===answer && answer!==question.correct;
            const isEl = eliminated.includes(i);
            const cls = isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : isEl ? 'is-eliminated' : '';
            return (
              <button key={i} className={'q-opt '+cls} disabled={locked||isEl} onClick={()=>onAnswer(i)}>
                <span className="key">{String.fromCharCode(65+i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Hotbar({ slots, selected, onSelect, cooldowns, streak }){
  return (
    <div className="hotbar">
      {slots.map(s=>{
        const cd = cooldowns[s.id]||0;
        const minStreak = s.minStreak||0;
        const locked = cd>0 || streak<minStreak;
        return (
          <div
            key={s.id}
            className={'hb-slot '+(selected===s.id?'is-selected ':'')+(locked?'is-locked ':'')}
            onClick={()=>!locked && onSelect(s.id)}
          >
            <div className="hb-top">
              <span className="hb-key">{s.key}</span>
              <Pix id={s.sprite} kind="ability" size={20} />
              <span className="hb-name">{s.name}</span>
              <span className={'hb-tier '+s.tier}>{s.tier}</span>
            </div>
            <div className="hb-bottom">
              <span className="desc">{s.desc}</span>
              {cd>0 && <span className="cd">CD {cd}</span>}
              {!cd && minStreak>streak && <span className="cd">≥{minStreak}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RightRail({ log, weak, build, augments }){
  return (
    <aside className="right">
      <div className="rail-section">
        <h4>Build · Active <span className="grow"/><span className="pill">{build.length}</span></h4>
        {build.map((b,i)=>(
          <div className="stat-row" key={i}>
            <span className="k">{b.k}</span>
            <span className={'v '+(b.up?'up':'')}>{b.v}</span>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <h4>Augments · Drop Pool</h4>
        {augments.map((a,i)=>(
          <div className="slot" key={i}>
            <Pix id={a.sprite} kind="ability" size={28} tier={a.tier} />
            <div className="meta">
              <div className="name">{a.name}</div>
              <div className="sub" style={{color:'var(--t-'+a.tier+')'}}>{a.tier.toUpperCase()} · {a.chance}%</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rail-section" style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        <h4>Combat Log <span className="grow"/><span className="pill">live</span></h4>
        <div className="rail-scroll" style={{margin:'-2px -4px 0 -4px'}}>
          {log.length===0 && <div className="intel-row"><span className="msg" style={{color:'var(--fg-3)'}}>· awaiting first action</span></div>}
          {log.map(l=>(
            <div className={'intel-row '+(l.kind||'')} key={l.id}>
              <span className="ts">{l.t}</span>
              <span className="msg" dangerouslySetInnerHTML={{__html: l.text}} />
            </div>
          ))}
        </div>
      </div>

      <div className="rail-section">
        <h4>Weak Concepts <span className="grow"/><span className="pill">mistake pool</span></h4>
        {weak.map((w,i)=>(
          <div className="weak-row" key={i}>
            <span className="lbl">{w.lbl}</span>
            <div className="bar-mini"><span style={{width: w.miss*100+'%'}} /></div>
            <span className="x">{Math.round(w.miss*100)}%</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   APP
   ────────────────────────────────────────────────────────────────────────── */

function App(){
  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#7dd87d",
    "density": "high",
    "scanlines": true,
    "showBlueprintGrid": true,
    "fontDisplay": "Space Grotesk",
    "layout": "tactical"
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, ()=>{}];

  // Apply accent
  useEffect(()=>{
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    // derive companions
    const c = tweaks.accent;
    document.documentElement.style.setProperty('--accent-soft', c+'1f');
    document.documentElement.style.setProperty('--accent-line', c+'59');
    document.documentElement.style.setProperty('--accent-glow', c+'73');
  }, [tweaks.accent]);

  useEffect(()=>{
    document.body.style.fontSize = tweaks.density==='ultra' ? '12px' : tweaks.density==='high' ? '13px' : '14px';
  }, [tweaks.density]);

  // Player state
  const [player, setPlayer] = useState({
    codename:'CARETAKER-07',
    level:7, xp:680, xpNext:1200,
    hp:84, maxHp:120, block:0,
    insight:4, streak:3, maxMomentum:3, momentum:1, crit:18,
  });

  const weapon = {
    id:'caveman', sprite:'fire',
    name:'Caveman Club',
    tagline:'PRIMAL · BERSERKER',
    atk:5, def:-1, xpMul:0.9,
    level:6, xp:240, xpNext:400
  };

  const sockets = [
    { sprite:'shield',  name:'Silicon Skin',     tier:'common', effect:'+20 max HP' },
    { sprite:'fire',    name:'Overclock Chip',   tier:'rare',   effect:'+10% damage' },
    { sprite:'crystal', name:'Buffer Overflow',  tier:'epic',   effect:'cap any single hit at 10' },
    { sprite:'book',    name:'Proctor Lens',     tier:'legendary', effect:'highlight correct answer' },
  ];

  const pet = { sprite:'owl', name:'Hoot-ini', tier:'common', desc:'spend Insight → reveal answer (1×/fight)', level:2 };

  const buildSummary = [
    { k:'BIOME · CYBERPUNK', v:'+15% ACTIVE DMG', up:true },
    { k:'SAME-ABI PENALTY',  v:'-50%' },
    { k:'BOSS HP MULT',      v:'×1.05' },
    { k:'INSIGHT DISC',      v:'-50%' , up:true },
    { k:'CRIT BONUS',        v:'+10%', up:true },
    { k:'TREE: ANTI-MAGIC',  v:'ENEMY' },
  ];

  const augmentsPool = [
    { sprite:'crystal', name:'Capacitor 404',  tier:'legendary', chance: 4 },
    { sprite:'fire',    name:'God-Mode.exe',   tier:'legendary', chance: 4 },
    { sprite:'shield',  name:'Firewall DLL',   tier:'rare',      chance: 28 },
    { sprite:'book',    name:'Scholar Eye',    tier:'rare',      chance: 28 },
    { sprite:'bolt',    name:'Insight Loop',   tier:'epic',      chance: 12 },
  ];

  const weak = [
    { lbl:'NEURAL · activation',  miss:0.62 },
    { lbl:'NEURAL · loss func',   miss:0.41 },
    { lbl:'CNN · pooling',        miss:0.34 },
    { lbl:'OPT · adam',           miss:0.28 },
    { lbl:'REG · dropout',        miss:0.16 },
  ];

  // Combat state
  const [enemies, setEnemies] = useState(initialEnemies());
  const [targetId, setTargetId] = useState('e1');
  const [turn, setTurn] = useState(3);
  const [selectedSkill, setSelectedSkill] = useState('quick_slash');
  const [cooldowns, setCooldowns] = useState({});
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [hitId, setHitId] = useState(null);
  const [floats, setFloats] = useState([]);
  const [log, setLog] = useState([
    {id:1, t:'T03', text:'<b>Adjunct Professor</b> begins charging Exam Failure', kind:''},
    {id:2, t:'T02', text:'<b>+12 HP</b> · Buffer pet heal', kind:'heal'},
    {id:3, t:'T02', text:'You hit Bookworm Swarm for <b>14</b>', kind:'dmg'},
    {id:4, t:'T01', text:'Streak ↑ ×3 · Flurry primed', kind:''},
    {id:5, t:'T01', text:'You entered combat — Cyberpunk biome', kind:''},
  ]);
  const logSeq = useRef(10);
  const floatSeq = useRef(0);

  const pushLog = (text, kind='') => {
    logSeq.current += 1;
    setLog(L => [{id: logSeq.current, t:'T'+turn.toString().padStart(2,'0'), text, kind}, ...L].slice(0,40));
  };

  const spawnFloat = (targetId, text, kind='') => {
    floatSeq.current += 1;
    const id = floatSeq.current;
    const x = 80 + Math.random()*40;
    const y = 30 + Math.random()*20;
    setFloats(F => [...F, {id, targetId, text, kind, x, y}]);
    setTimeout(()=>setFloats(F => F.filter(f=>f.id!==id)), 900);
  };

  const triggerHit = (id) => {
    setHitId(id);
    setTimeout(()=>setHitId(null), 350);
  };

  const tab = 'combat';

  // Answer handler — kicks off the resolution sequence
  const onAnswer = (i) => {
    if (answer != null) return;
    const q = QUESTIONS[qIdx];
    const correct = i === q.correct;
    setAnswer(i);

    if (correct){
      // resolve attack
      const skill = HOTBAR.find(s=>s.id===selectedSkill);
      const base = 6 + weapon.atk;
      let dmg = base + (skill?.id==='flurry' ? 5*player.streak : skill?.id==='fatal_error' ? 32 : skill?.id==='quick_slash' ? 9 : skill?.id==='tree_skim' ? 5 : 0);
      const isCrit = Math.random()*100 < player.crit;
      if (isCrit) dmg = Math.floor(dmg*1.6);
      const tgt = enemies.find(e=>e.id===targetId) || enemies.find(e=>e.hp>0);
      if (tgt){
        const newHp = Math.max(0, tgt.hp - dmg);
        setEnemies(E => E.map(e => e.id===tgt.id ? {...e, hp:newHp} : e));
        triggerHit(tgt.id);
        spawnFloat(tgt.id, '-'+dmg, isCrit?'crit':'');
        pushLog(`Hit <b>${tgt.name}</b> for <b>${dmg}</b>${isCrit?' · CRIT':''}`, isCrit?'crit':'dmg');
      }
      setPlayer(p=>({...p, streak: Math.min(6, p.streak+1)}));
      // CD on the skill
      if (skill?.cd>0) setCooldowns(c => ({...c, [skill.id]: skill.cd}));
    } else {
      // wrong — take damage from current intent
      const live = enemies.filter(e=>e.hp>0);
      let totalDmg = 0;
      live.forEach(e => {
        const ab = ENEMY_ABILITIES[e.pattern[e.patternIndex % e.pattern.length]];
        const d = ab?.getDmg ? ab.getDmg(e.level||1) : 0;
        totalDmg += d;
      });
      setPlayer(p=>({...p, hp: Math.max(0, p.hp - totalDmg), streak:0}));
      spawnFloat(targetId, '-'+totalDmg, '');
      pushLog(`Wrong answer · took <b>${totalDmg}</b> dmg · streak broken`, 'dmg');
    }

    // advance turn after a beat
    setTimeout(()=>{
      // tick CDs
      setCooldowns(c => {
        const n = {};
        Object.keys(c).forEach(k => { if (c[k]>1) n[k]=c[k]-1 });
        return n;
      });
      // advance enemy patterns
      setEnemies(E => E.map(e => e.hp>0 ? {...e, patternIndex: (e.patternIndex+1)%e.pattern.length} : e));
      setTurn(t => t+1);
      // next question
      setQIdx(q => (q+1) % QUESTIONS.length);
      setAnswer(null);
      setEliminated([]);
    }, 1100);
  };

  // Keyboard
  useEffect(()=>{
    const h = (e) => {
      if (e.key>='1' && e.key<='5'){
        const slot = HOTBAR.find(s=>s.key===e.key);
        if (slot) setSelectedSkill(slot.id);
      }
      if (e.key>='a' && e.key<='d'){
        const i = e.key.charCodeAt(0) - 97;
        if (answer==null) onAnswer(i);
      }
      if (e.key>='A' && e.key<='D'){
        const i = e.key.charCodeAt(0) - 65;
        if (answer==null) onAnswer(i);
      }
      if (e.key==='Tab'){
        e.preventDefault();
        const live = enemies.filter(en=>en.hp>0);
        const idx = live.findIndex(en=>en.id===targetId);
        const next = live[(idx+1)%live.length];
        if (next) setTargetId(next.id);
      }
    };
    window.addEventListener('keydown', h);
    return ()=>window.removeEventListener('keydown', h);
  }, [answer, enemies, targetId]);

  return (
    <>
      <div className="app">
        {!window.__SB_NESTED && <Topbar
          player={{...player, level:player.level, xp:player.xp, xpNext:player.xpNext, hp:player.hp, maxHp:player.maxHp, insight:player.insight, streak:player.streak}}
          accent={tweaks.accent}
          tab={tab}
          onTabSwitch={()=>{}}
        />}
        <LeftRail
          player={player}
          weapon={weapon}
          sockets={sockets}
          pet={pet}
          hotbar={HOTBAR}
          selected={selectedSkill}
          onSelect={setSelectedSkill}
        />
        <main className="stage" data-screen-label="Combat">
          <StageHeader
            chapter={{ code:'CHAPTER 04 · ELITE', name:'Lecture Hall — Final Approach' }}
            biome={<>biome <b>cyberpunk</b> · +15% active dmg</>}
            streak={player.streak}
            momentum={player.momentum}
            maxMom={player.maxMomentum}
            turn={turn}
          />
          <EnemyRow enemies={enemies} targetId={targetId} onTarget={setTargetId} hitId={hitId} floats={floats} />
          <QuestionSlab
            question={QUESTIONS[qIdx]}
            onAnswer={onAnswer}
            eliminated={eliminated}
            locked={answer!=null}
            answer={answer}
          />
          <Hotbar
            slots={HOTBAR}
            selected={selectedSkill}
            onSelect={setSelectedSkill}
            cooldowns={cooldowns}
            streak={player.streak}
          />
        </main>
        <RightRail log={log} weak={weak} build={buildSummary} augments={augmentsPool} />
        <footer className="statusbar">
          <span><span className="blink"/>READY · Q-A/B/C/D · 1-5 ABILITIES · TAB CYCLE TARGET</span>
          <span className="grow" />
          <span>SAVE · studybuddy_v3</span>
          <span style={{color:'var(--accent)'}}>● connected</span>
          <span>FPS 60</span>
          <span>26 May 2026 · 19:42</span>
        </footer>
      </div>

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Accent">
            <window.TweakColor
              label="Accent color"
              value={tweaks.accent}
              onChange={v=>setTweak('accent', v)}
              options={['#7dd87d','#5cb8d8','#e7c14b','#ff6b35','#b076ff','#5b8def']}
            />
          </window.TweakSection>
          <window.TweakSection title="Density">
            <window.TweakRadio
              label="Information density"
              value={tweaks.density}
              onChange={v=>setTweak('density', v)}
              options={[
                {value:'normal',label:'Normal'},
                {value:'high',label:'High'},
                {value:'ultra',label:'Ultra'},
              ]}
            />
          </window.TweakSection>
          <window.TweakSection title="Effects">
            <window.TweakToggle label="Scanline overlay" value={tweaks.scanlines} onChange={v=>setTweak('scanlines', v)} />
            <window.TweakToggle label="Blueprint grid" value={tweaks.showBlueprintGrid} onChange={v=>setTweak('showBlueprintGrid', v)} />
          </window.TweakSection>
          <window.TweakSection title="Type">
            <window.TweakSelect
              label="Display family"
              value={tweaks.fontDisplay}
              onChange={v=>{
                setTweak('fontDisplay', v);
                document.documentElement.style.setProperty('--font-display', "'"+v+"', 'Inter', sans-serif");
              }}
              options={['Space Grotesk','JetBrains Mono','IBM Plex Sans','Inter','Bricolage Grotesque']}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
}

window.CombatHUD = function CombatHUDWrapped(props){
  window.__SB_NESTED = true;
  return <App {...props}/>;
};
