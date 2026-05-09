/* ============ PLAYER ABILITIES + WEAPON MASTERY ============ *
 * Splice into build_html.py BEFORE arena.jsx, AFTER bonuses.jsx.
 */

const TIER = {
  basic:    { minStreak: 0, cooldown: 0, label: 'Basic',    color: '#6b7287' },
  core:     { minStreak: 2, cooldown: 1, label: 'Core',     color: '#8b9eff' },
  advanced: { minStreak: 4, cooldown: 2, label: 'Advanced', color: '#a78bfa' },
};

const ABILITIES = {

  /* ===== SYNTAX BLADE ===== */
  quick_slash:   { id:'quick_slash',   name:'Quick Slash',     icon:'🗡️', source:'weapon', kind:'active', tier:'basic',
                   getDesc:(w)=>`Deal ${5+(w*2)} damage.`,
                   onAttack:(dmg,w)=> dmg + 5 + (w*2) },
  parry:         { id:'parry',         name:'Parry',           icon:'⚔️', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
                   getDesc:(w)=>`Block ${8+w} and heal 2 HP.`,
                   onBlock:(b,w)=> b + 8 + w, onHeal:()=> 2 },
  flurry:        { id:'flurry',        name:'Flurry',          icon:'🌪️', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
                   getDesc:(w)=>`Deal ${4+w} damage per Streak point.`,
                   onAttack:(dmg,w,state)=> dmg + ((4+w) * Math.max(1, state?.streak?.count || 1)) },
  fatal_error:   { id:'fatal_error',   name:'Fatal Error',     icon:'☠️', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
                   getDesc:(w)=>`Critical strike for ${25+(w*3)} damage.`,
                   onAttack:(dmg,w)=> dmg + 25 + (w*3) },

  /* ===== LOGIC HAMMER ===== */
  heavy_smash:    { id:'heavy_smash',    name:'Heavy Smash',    icon:'🔨', source:'weapon', kind:'active', tier:'basic',
                    getDesc:(w)=>`Deal ${8+(w*3)} damage.`,
                    onAttack:(dmg,w)=> dmg + 8 + (w*3) },
  iron_clad:      { id:'iron_clad',      name:'Iron Clad',      icon:'🛡️', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
                    getDesc:(w)=>`Block ${15+(w*2)}.`,
                    onBlock:(b,w)=> b + 15 + (w*2) },
  reckless_swing: { id:'reckless_swing', name:'Reckless Swing', icon:'💥', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
                    getDesc:(w)=>`Deal ${20+(w*4)} damage, take 5 self-damage.`,
                    onAttack:(dmg,w)=> dmg + 20 + (w*4), onSelfDamage:()=> 5 },
  null_pointer:   { id:'null_pointer',   name:'Null Pointer',   icon:'🛑', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
                    getDesc:(w)=>`Shatter the enemy for ${40+(w*5)} damage.`,
                    onAttack:(dmg,w)=> dmg + 40 + (w*5) },

  /* ===== AEGIS PROTOCOL ===== */
  shield_bash:    { id:'shield_bash',    name:'Shield Bash',    icon:'🏏', source:'weapon', kind:'active', tier:'basic',
                    getDesc:(w)=>`Deal ${3+w} dmg & block ${5+w}.`,
                    onAttack:(dmg,w)=> dmg + 3 + w, onBlock:(b,w)=> b + 5 + w },
  remedy:         { id:'remedy',         name:'Remedy',         icon:'💖', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
                    getDesc:(w)=>`Heal ${10+(w*2)} HP.`,
                    onAttack:(dmg)=> dmg, onHeal:(w)=> 10 + (w*2) },
  phalanx:        { id:'phalanx',        name:'Phalanx',        icon:'🏛️', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
                    getDesc:(w)=>`Block ${25+(w*3)}.`,
                    onBlock:(b,w)=> b + 25 + (w*3) },
  system_restore: { id:'system_restore', name:'System Restore', icon:'🔄', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
                    getDesc:(w)=>`Heal ${20+w} & block ${20+w}.`,
                    onBlock:(b,w)=> b + 20 + w, onHeal:(w)=> 20 + w },

  /* ===== FOCUS PRISM ===== */
  energy_bolt: { id:'energy_bolt', name:'Energy Bolt', icon:'✨', source:'weapon', kind:'active', tier:'basic',
                 getDesc:(w)=>`Deal ${6+(w*2)} damage.`,
                 onAttack:(dmg,w)=> dmg + 6 + (w*2) },
  meditate:    { id:'meditate',    name:'Meditate',    icon:'🧘', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
                 getDesc:(w)=>`Gain 1 Momentum, block ${5+w}.`,
                 onBlock:(b,w)=> b + 5 + w, onMomentum:()=> 1 },
  siphon:      { id:'siphon',      name:'Siphon',      icon:'🧛', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
                 getDesc:(w)=>`Deal ${8+(w*2)} damage, heal same.`,
                 onAttack:(dmg,w)=> dmg + 8 + (w*2), onHeal:(w)=> 8 + (w*2) },
  overclock:   { id:'overclock',   name:'Overclock',   icon:'⚡', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
                 getDesc:(w)=>`Spend all Momentum. ${10+(w*2)} dmg per Momentum spent.`,
                 onAttack:(dmg,w,state)=> dmg + ((10+(w*2)) * (state?.momentum || 1)),
                 onMomentum:(cur)=> -(cur || 0) },

  /* ===== ORACLE CODEX ===== */
  paper_cut: { id:'paper_cut', name:'Paper Cut', icon:'📖', source:'weapon', kind:'active', tier:'basic',
               getDesc:(w)=>`Deal ${3+w} damage.`,
               onAttack:(dmg,w)=> dmg + 3 + w },
  epiphany:  { id:'epiphany',  name:'Epiphany',  icon:'💡', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
               getDesc:()=>`No damage. Generate +1 Insight.`,
               onAttack:(dmg)=> dmg, onInsight:()=> 1 },
  deduction: { id:'deduction', name:'Deduction', icon:'🔍', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
               getDesc:(w)=>`Deal ${10+w} dmg & eliminate 1 wrong answer.`,
               onAttack:(dmg,w)=> dmg + 10 + w, onEliminate:()=> 1 },
  open_book: { id:'open_book', name:'Open Book', icon:'👁️', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
               getDesc:()=>`Grant +3 Insights instantly.`,
               onAttack:(dmg)=> dmg, onInsight:()=> 3 },

  /* ===== VANGUARD STANDARD ===== */
  rally_strike:  { id:'rally_strike',  name:'Rally Strike',  icon:'🚩', source:'weapon', kind:'active', tier:'basic',
                   getDesc:(w)=>`Deal ${5+(w*2)} damage.`,
                   onAttack:(dmg,w)=> dmg + 5 + (w*2) },
  tutor:         { id:'tutor',         name:'Tutor',         icon:'🤝', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
                   getDesc:(w)=>`+2 Momentum, block ${5+w}.`,
                   onBlock:(b,w)=> b + 5 + w, onMomentum:()=> 2 },
  cram_session:  { id:'cram_session',  name:'Cram Session',  icon:'📈', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
                   getDesc:()=>`Buff: next correct answer deals 2× damage.`,
                   onAttack:(dmg)=> dmg, onBuff:()=> 'double_dmg_next' },
  second_chance: { id:'second_chance', name:'Second Chance', icon:'🛡️', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
                   getDesc:()=>`Buff: next miss → 0 dmg, keep streak.`,
                   onAttack:(dmg)=> dmg, onBuff:()=> 'forgive_next_miss' },

  /* ===== SKILL TREE — TIER 1 ===== */
  tree_brainstorm:    { id:'tree_brainstorm',    name:'Brainstorm',          icon:'🤔', source:'tree', kind:'active', tier:'basic', cost:0,
                        desc:'Free utility. 0 dmg, +1 Momentum.',
                        onAttack:()=> 0, onMomentum:()=> 1 },
  tree_snack:         { id:'tree_snack',         name:'Study Snack',         icon:'🍎', source:'tree', kind:'active', tier:'basic', cost:1,
                        desc:'Heal 5 HP, +1 Momentum.',
                        onAttack:()=> 0, onHeal:()=> 5, onMomentum:()=> 1 },
  tree_muscle_memory: { id:'tree_muscle_memory', name:'Muscle Memory',       icon:'💪', source:'tree', kind:'passive', cost:1,
                        desc:'Passive — all attacks +2 damage.',
                        passiveFlatDmg:2 },
  tree_guess:         { id:'tree_guess',         name:'Educated Guess',      icon:'🎲', source:'tree', kind:'active', tier:'basic', cost:1,
                        desc:'Take 2 self-damage, generate +1 Insight.',
                        onAttack:()=> 0, onSelfDamage:()=> 2, onInsight:()=> 1 },
  tree_skim:          { id:'tree_skim',          name:'Skim Reading',        icon:'📄', source:'tree', kind:'active', tier:'basic', cost:2,
                        desc:'Deal 5 dmg ignoring enemy block (100% pierce).',
                        onAttack:(dmg)=> dmg + 5, pierce:1.0 },
  tree_cram:          { id:'tree_cram',          name:'Cramming',            icon:'⏱️', source:'tree', kind:'active', tier:'core', cost:2,
                        desc:'Deal 15 damage, lose 1 Momentum.',
                        onAttack:(dmg)=> dmg + 15, onMomentum:()=> -1 },

  /* ===== SKILL TREE — TIER 2 ===== */
  tree_caffeine:      { id:'tree_caffeine',      name:'Caffeine Hit',        icon:'☕', source:'tree', kind:'active', tier:'core', cost:1,
                        desc:'Take 5 self-dmg, +2 Momentum.',
                        onAttack:()=> 0, onSelfDamage:()=> 5, onMomentum:()=> 2 },
  tree_process_elim:  { id:'tree_process_elim',  name:'Process of Elimination', icon:'❌', source:'tree', kind:'active', tier:'core', cost:1,
                        desc:'Eliminate 1 wrong answer next question.',
                        onAttack:()=> 0, onEliminate:()=> 1 },
  tree_eureka:        { id:'tree_eureka',        name:'Eureka',              icon:'🤯', source:'tree', kind:'active', tier:'core', cost:3,
                        desc:'Instantly gain +3 Momentum.',
                        onAttack:()=> 0, onMomentum:()=> 3 },
  tree_deep_breath:   { id:'tree_deep_breath',   name:'Deep Breath',         icon:'🧘', source:'tree', kind:'active', tier:'core', cost:3,
                        desc:'Heal 25 HP. Resets your streak.',
                        onAttack:()=> 0, onHeal:()=> 25, onStreakReset:()=> true },
  tree_extra_credit:  { id:'tree_extra_credit',  name:'Extra Credit',        icon:'💯', source:'tree', kind:'passive', cost:4,
                        desc:'Passive — +15% Combat XP.',
                        passiveXpBonus:0.15 },
  tree_open_notes:    { id:'tree_open_notes',    name:'Open Notes',          icon:'📝', source:'tree', kind:'active', tier:'core', cost:4,
                        desc:'Eliminate 1 wrong answer & block 5.',
                        onAttack:()=> 0, onBlock:(b)=> b + 5, onEliminate:()=> 1 },
  tree_study_group:   { id:'tree_study_group',   name:'Study Group',         icon:'🧑‍🤝‍🧑', source:'tree', kind:'active', tier:'core', cost:4,
                        desc:'+2 Insights, block 10.',
                        onAttack:()=> 0, onBlock:(b)=> b + 10, onInsight:()=> 2 },
  tree_syllabus:      { id:'tree_syllabus',      name:'Syllabus Shock',      icon:'📋', source:'tree', kind:'passive', cost:3,
                        desc:'Passive — start fights with +1 Momentum & +1 Insight.',
                        passiveStartMomentum:1, passiveStartInsight:1 },
  tree_speed_reader:  { id:'tree_speed_reader',  name:'Speed Reader',        icon:'📖', source:'tree', kind:'passive', cost:2,
                        desc:'Passive — Insight cap +3.',
                        passiveInsightCapBonus:3 },
  tree_caffeine_tol:  { id:'tree_caffeine_tol',  name:'Caffeine Tolerance',  icon:'☕', source:'tree', kind:'passive', cost:4,
                        desc:'Passive — +3 Block on every correct answer.',
                        passiveBlockOnCorrect:3 },

  /* ===== SKILL TREE — TIER 3 ===== */
  tree_photographic:  { id:'tree_photographic',  name:'Photographic Mem',    icon:'📸', source:'tree', kind:'active', tier:'advanced', cost:5,
                        desc:'Eliminate 2 wrong answers next question.',
                        onAttack:()=> 0, onEliminate:()=> 2 },
  tree_triage:        { id:'tree_triage',        name:'Triage',              icon:'❤️‍🩹', source:'tree', kind:'active', tier:'advanced', cost:6,
                        desc:'Damage = your missing HP.',
                        onAttack:(dmg,w,state)=> dmg + Math.max(0, (state?.maxHp || 100) - (state?.hp || 100)) },
  tree_flow_state:    { id:'tree_flow_state',    name:'Flow State',          icon:'🌊', source:'tree', kind:'passive', cost:6,
                        desc:'Passive — heal 5 HP on every correct answer.',
                        passiveHealOnCorrect:5 },
  tree_curve_wrecker: { id:'tree_curve_wrecker', name:'Curve Wrecker',       icon:'🔥', source:'tree', kind:'active', tier:'advanced', cost:7,
                        desc:'Deal 40 dmg. Resets streak.',
                        onAttack:(dmg)=> dmg + 40, onStreakReset:()=> true },
  tree_hyperactive:   { id:'tree_hyperactive',   name:'Hyperactive',         icon:'⚡', source:'tree', kind:'passive', cost:5,
                        desc:'Passive — Momentum cap +1.',
                        passiveMaxMomentumBonus:1 },
  tree_snowball:      { id:'tree_snowball',      name:'Snowball Effect',     icon:'⛄', source:'tree', kind:'passive', cost:7,
                        desc:'Passive — +1 dmg per current Streak.',
                        passiveStreakFlatDmg:1 },
  tree_curve_setter:  { id:'tree_curve_setter',  name:'Curve Setter',        icon:'📊', source:'tree', kind:'passive', cost:7,
                        desc:'Passive — +10% Crit chance.',
                        passiveCritChance:0.10 },
  tree_peer_review:   { id:'tree_peer_review',   name:'Peer Review',         icon:'👀', source:'tree', kind:'active', tier:'core', cost:5,
                        desc:'Deal 15 damage, heal 15 HP.',
                        onAttack:(dmg)=> dmg + 15, onHeal:()=> 15 },
  tree_galaxy_brain:  { id:'tree_galaxy_brain',  name:'Galaxy Brain',        icon:'🌌', source:'tree', kind:'active', tier:'advanced', cost:8,
                        desc:'Deal 10 damage per Insight you currently hold.',
                        onAttack:(dmg,w,state)=> dmg + (10 * (state?.insights || 0)) },

  /* ===== SKILL TREE — GOD TIER ===== */
  tree_calculated_risk: { id:'tree_calculated_risk', name:'Calculated Risk', icon:'📈', source:'tree', kind:'active', tier:'advanced', cost:9,
                          desc:'Buff: next correct answer deals 3× damage.',
                          onAttack:()=> 0, onBuff:()=> 'triple_dmg_next' },
  tree_academic_weapon: { id:'tree_academic_weapon', name:'Academic Weapon', icon:'🔱', source:'tree', kind:'passive', cost:10,
                          desc:'Passive — Max HP +25, attacks ignore 20% boss block.',
                          passiveMaxHp:25, passivePierce:0.20 },
  tree_tenure:          { id:'tree_tenure',          name:'Tenure',          icon:'🎓', source:'tree', kind:'active', tier:'advanced', cost:12,
                          desc:'Heal 100 HP, +3 Momentum, +3 Insights.',
                          onAttack:()=> 0, onHeal:()=> 100, onMomentum:()=> 3, onInsight:()=> 3 },
  tree_plot_armor:      { id:'tree_plot_armor',      name:'Plot Armor',      icon:'🛡️', source:'tree', kind:'passive', cost:11,
                          desc:'Passive — once per fight, revive at 50 HP if fatal damage.',
                          passiveRevive:1 },
  tree_valedictorian:   { id:'tree_valedictorian',   name:'Valedictorian',   icon:'🥇', source:'tree', kind:'passive', cost:12,
                          desc:'Passive — 1 free missed-question forgiveness per boss.',
                          passiveForgiveCount:1 },
  tree_all_nighter:     { id:'tree_all_nighter',     name:'All Nighter',     icon:'🌙', source:'tree', kind:'active', tier:'advanced', cost:3,
                          desc:'Spend all Momentum. Heal 10 + 15 dmg per Momentum spent.',
                          onAttack:(dmg,w,state)=> dmg + (15 * (state?.momentum || 1)),
                          onHeal:()=> 10, onMomentum:(cur)=> -(cur || 0) },

  /* ===== SKILL TREE — BUILD-IDENTITY ===== */
  tree_arrogance:        { id:'tree_arrogance',        name:'Arrogance',         icon:'😤', source:'tree', kind:'passive', cost:4,
                           desc:'Passive — +20% Crit chance, take 1.5× damage.',
                           passiveCritChance:0.20, passiveDmgTakenMult:1.5 },
  tree_momentum_builder: { id:'tree_momentum_builder', name:'Momentum Builder',  icon:'⚙️', source:'tree', kind:'passive', cost:5,
                           desc:'Passive — +1 Momentum every 3 correct answers in a row.',
                           passiveMomentumOnStreak:3 },
  tree_unstoppable:      { id:'tree_unstoppable',      name:'Unstoppable',       icon:'🚂', source:'tree', kind:'passive', cost:8,
                           desc:'Passive — Streak ≥ 5 → +15 Block per turn automatically.',
                           passiveBlockOnStreak5:15 },
  tree_victory_lap:      { id:'tree_victory_lap',      name:'Victory Lap',       icon:'🏁', source:'tree', kind:'active', tier:'advanced', cost:10,
                           desc:'Streak ≥ 10 only. Heal to full HP.',
                           onAttack:()=> 0, onHeal:(w,state)=> (state?.maxHp || 100), reqStreak:10 },
  tree_masochist:        { id:'tree_masochist',        name:'Masochist',         icon:'🩸', source:'tree', kind:'passive', cost:4,
                           desc:'Passive — gain +1 Momentum whenever the boss damages you.',
                           passiveMomentumOnDmgTaken:1 },
  tree_adrenaline:       { id:'tree_adrenaline',       name:'Adrenaline',        icon:'💉', source:'tree', kind:'passive', cost:7,
                           desc:'Passive — HP < 30% → all attacks +50% damage.',
                           passiveBerserkThreshold:0.30, passiveBerserkMult:0.50 },
  tree_blood_pact:       { id:'tree_blood_pact',       name:'Blood Pact',        icon:'📜', source:'tree', kind:'active', tier:'core', cost:5,
                           desc:'Take 20 self-dmg → +5 base damage permanently this fight (stacks).',
                           onAttack:()=> 0, onSelfDamage:()=> 20, onBuff:()=> 'blood_pact_stack' },
  tree_all_or_nothing:   { id:'tree_all_or_nothing',   name:'All or Nothing',    icon:'🎲', source:'tree', kind:'active', tier:'advanced', cost:8,
                           desc:'Deal 75 damage. If boss survives, take 30 dmg.',
                           onAttack:(dmg)=> dmg + 75, onBuff:()=> 'all_or_nothing_check' },
  tree_thick_skull:      { id:'tree_thick_skull',      name:'Thick Skull',       icon:'🧱', source:'tree', kind:'passive', cost:5,
                           desc:'Passive — incoming boss damage -5.',
                           passiveDmgReduction:5 },
  tree_kinetic_energy:   { id:'tree_kinetic_energy',   name:'Kinetic Energy',    icon:'🔋', source:'tree', kind:'passive', cost:6,
                           desc:'Passive — heal 2 HP whenever you gain Momentum.',
                           passiveHealOnMomentum:2 },
  tree_procrastination:  { id:'tree_procrastination',  name:'Procrastination',   icon:'🥱', source:'tree', kind:'active', tier:'core', cost:6,
                           desc:'Skip boss next turn. Their attack after deals 2× damage.',
                           onAttack:()=> 0, onBuff:()=> 'boss_skip_turn' },
  tree_lucky_guess:      { id:'tree_lucky_guess',      name:'Lucky Guess',       icon:'🍀', source:'tree', kind:'passive', cost:12,
                           desc:'Passive — 5% chance a wrong answer is graded correct.',
                           passiveLuckyGuess:0.05 },
  tree_shower_thoughts:  { id:'tree_shower_thoughts',  name:'Shower Thoughts',   icon:'🚿', source:'tree', kind:'passive', cost:3,
                           desc:'Passive — start every fight with +2 Insights.',
                           passiveStartInsight:2 },
  tree_epiphanic_strike: { id:'tree_epiphanic_strike', name:'Epiphanic Strike',  icon:'💡', source:'tree', kind:'passive', cost:6,
                           desc:'Passive — attacks deal +3 damage per Insight you hold.',
                           passiveDmgPerInsight:3 },
  tree_bribe:            { id:'tree_bribe',            name:'Bribe',             icon:'🪙', source:'tree', kind:'passive', cost:9,
                           desc:'Passive — 25% chance to consume 1 Insight to dodge a wrong-answer penalty.',
                           passiveInsightDodgeChance:0.25 },
  tree_flashcard_barrage:{ id:'tree_flashcard_barrage',name:'Flashcard Barrage', icon:'🎴', source:'tree', kind:'active', tier:'advanced', cost:7,
                           desc:'Spend all Insights. Deal 12 damage per Insight spent.',
                           onAttack:(dmg,w,state)=> dmg + (12 * (state?.insights || 0)),
                           onInsight:(cur)=> -(cur || 0) },
};

const TREE_ABILITIES = Object.values(ABILITIES).filter(a => a.source === 'tree');

const WEAPONS = {
  blade:     { id:'blade',     name:'Syntax Blade',     icon:'⚔️', kind:'Aggressive',
               atk:+4, def:-2, xpMul:1.0, unlockLvl:1,
               desc:'High damage, low defense. Streaks burn brighter.',
               flavor:'Each correct answer cuts deeper than the last.',
               basic:'quick_slash', abilities:['parry','flurry','fatal_error'] },
  hammer:    { id:'hammer',    name:'Logic Hammer',     icon:'🔨', kind:'Heavy',
               atk:+6, def:0,  xpMul:1.0, unlockLvl:1,
               desc:'High risk, high reward. Trades HP for raw output.',
               flavor:'Smashing through with sheer force.',
               basic:'heavy_smash', abilities:['iron_clad','reckless_swing','null_pointer'] },
  shield:    { id:'shield',    name:'Aegis Protocol',   icon:'🛡️', kind:'Defensive',
               atk:-2, def:+5, xpMul:1.0, unlockLvl:1,
               desc:'Lower damage, but you survive longer.',
               flavor:'When you don\'t know, you don\'t bleed.',
               basic:'shield_bash', abilities:['remedy','phalanx','system_restore'] },
  focus:     { id:'focus',     name:'Focus Prism',      icon:'⚡', kind:'Utility',
               atk:0,  def:0,  xpMul:1.5, unlockLvl:1,
               desc:'+50% XP gain. Manipulate the economy.',
               flavor:'Tactics > brute force.',
               basic:'energy_bolt', abilities:['meditate','siphon','overclock'] },
  oracle:    { id:'oracle',    name:'Oracle Codex',     icon:'📖', kind:'Hint Manipulation',
               atk:-1, def:0,  xpMul:1.2, unlockLvl:1,
               desc:'Generates Insights. Bends quiz rules.',
               flavor:'Knowledge is the truest weapon.',
               basic:'paper_cut', abilities:['epiphany','deduction','open_book'] },
  vanguard:  { id:'vanguard',  name:'Vanguard Standard',icon:'🚩', kind:'Support',
               atk:+1, def:+2, xpMul:1.1, unlockLvl:1,
               desc:'Buffs and safety nets. Future raid-leader weapon.',
               flavor:'Lift your team. Hold the line.',
               basic:'rally_strike', abilities:['tutor','cram_session','second_chance'] },
};

const WEAPON_MASTERY_BONUSES = {
  blade: [
    { level:3,  desc:'+5% Crit Chance',      stats:{ critChance:0.05 } },
    { level:5,  desc:'+1 Damage per Streak', stats:{ streakFlatDmg:1 } },
    { level:7,  desc:'+20% Crit Damage',     stats:{ critDmgMult:0.20 } },
    { level:10, desc:'+10% Crit Chance',     stats:{ critChance:0.10 } },
  ],
  hammer: [
    { level:3,  desc:'+2 Base Damage',          stats:{ flatDmg:2 } },
    { level:5,  desc:'+10% Boss Block Pierce',  stats:{ pierce:0.10 } },
    { level:7,  desc:'+3 Base Damage',          stats:{ flatDmg:3 } },
    { level:10, desc:'+15% Total Damage',       stats:{ dmgMult:0.15 } },
  ],
  shield: [
    { level:3,  desc:'+2 Base Block', stats:{ flatBlock:2 } },
    { level:5,  desc:'+2 Base Heal',  stats:{ flatHeal:2 } },
    { level:7,  desc:'+5% Max HP',    stats:{ hpBonusRatio:0.05 } },
    { level:10, desc:'+5 Base Block', stats:{ flatBlock:5 } },
  ],
  focus: [
    { level:3,  desc:'+10% XP',                  stats:{ xpBonus:0.10 } },
    { level:5,  desc:'Start fight with +1 Momentum', stats:{ startMomentum:1 } },
    { level:7,  desc:'+20% XP (30% total)',      stats:{ xpBonus:0.20 } },
    { level:10, desc:'Start fight with +2 Momentum', stats:{ startMomentum:1 } },
  ],
  oracle: [
    { level:3,  desc:'Start fight with +1 Insight',  stats:{ startInsight:1 } },
    { level:5,  desc:'+15% XP',                       stats:{ xpBonus:0.15 } },
    { level:7,  desc:'Start fight with +2 Insights', stats:{ startInsight:1 } },
    { level:10, desc:'Insight Cap +3',                 stats:{ insightCapBonus:3 } },
  ],
  vanguard: [
    { level:3,  desc:'Start fight with +1 Momentum',  stats:{ startMomentum:1 } },
    { level:5,  desc:'+10% Max HP',                    stats:{ hpBonusRatio:0.10 } },
    { level:7,  desc:'+3 Base Block',                  stats:{ flatBlock:3 } },
    { level:10, desc:'+1 Free-Miss Forgiveness/boss',  stats:{ forgiveCount:1 } },
  ],
};

function getWeaponMasteryBonuses(weaponId, currentLevel){
  const totals = {
    critChance: 0, critDmgMult: 1.5, streakFlatDmg: 0,
    flatBlock: 0, flatHeal: 0, flatDmg: 0, dmgMult: 0,
    hpBonusRatio: 0, xpBonus: 0, startMomentum: 0, pierce: 0,
    startInsight: 0, insightCapBonus: 0, forgiveCount: 0,
  };
  const path = WEAPON_MASTERY_BONUSES[weaponId] || [];
  for (const milestone of path){
    if ((currentLevel || 1) >= milestone.level){
      for (const k of Object.keys(milestone.stats)) totals[k] += milestone.stats[k];
    }
  }
  return totals;
}

function getTreePassives(unlockedSkillIds){
  const totals = {
    passiveFlatDmg: 0, passiveMaxHp: 0, passivePierce: 0, passiveXpBonus: 0,
    passiveHealOnCorrect: 0, passiveStartMomentum: 0, passiveStartInsight: 0,
    passiveInsightCapBonus: 0, passiveBlockOnCorrect: 0, passiveMaxMomentumBonus: 0,
    passiveStreakFlatDmg: 0, passiveRevive: 0, passiveForgiveCount: 0,
    passiveCritChance: 0, passiveDmgTakenMult: 1.0,
    passiveMomentumOnStreak: 0, passiveBlockOnStreak5: 0, passiveMomentumOnDmgTaken: 0,
    passiveBerserkThreshold: 0, passiveBerserkMult: 0,
    passiveDmgReduction: 0, passiveHealOnMomentum: 0,
    passiveLuckyGuess: 0, passiveDmgPerInsight: 0, passiveInsightDodgeChance: 0,
  };
  for (const id of (unlockedSkillIds || [])){
    const a = ABILITIES[id];
    if (!a || a.kind !== 'passive') continue;
    for (const k of Object.keys(totals)){
      if (typeof a[k] === 'number'){
        if (k === 'passiveDmgTakenMult') totals[k] *= a[k];
        else totals[k] += a[k];
      }
    }
  }
  return totals;
}

function getCombinedStats(state){
  const arena = state.arena || {};
  const weaponId = arena.equipped || 'blade';
  const weaponLvl = arena.weapons?.[weaponId]?.level || 1;
  const mastery   = getWeaponMasteryBonuses(weaponId, weaponLvl);
  const passives  = getTreePassives(arena.unlockedSkills);
  const augments  = (typeof getAugmentBonuses === 'function') ? getAugmentBonuses(state) : {};
  return {
    weaponId, weaponLvl, mastery, passives, augments,
    critChance:    (mastery.critChance || 0) + (passives.passiveCritChance || 0),
    critDmgMult:    mastery.critDmgMult || 1.5,
    flatDmg:       (mastery.flatDmg || 0) + (passives.passiveFlatDmg || 0),
    streakFlatDmg: (mastery.streakFlatDmg || 0) + (passives.passiveStreakFlatDmg || 0),
    dmgMult:       (mastery.dmgMult || 0) + (augments.dmgMult || 0),
    pierce:        (mastery.pierce || 0) + (passives.passivePierce || 0),
    xpBonus:       (mastery.xpBonus || 0) + (passives.passiveXpBonus || 0) + (augments.xpBonus || 0),
    flatBlock:      mastery.flatBlock || 0,
    flatHeal:       mastery.flatHeal || 0,
    startMomentum: (mastery.startMomentum || 0) + (passives.passiveStartMomentum || 0),
    startInsight:  (mastery.startInsight || 0) + (passives.passiveStartInsight || 0),
    insightCapBonus:(mastery.insightCapBonus || 0) + (passives.passiveInsightCapBonus || 0),
    maxMomentumBonus: passives.passiveMaxMomentumBonus || 0,
    forgiveCount:  (mastery.forgiveCount || 0) + (passives.passiveForgiveCount || 0),
    revivesAvailable: passives.passiveRevive || 0,
    healOnCorrect: passives.passiveHealOnCorrect || 0,
    blockOnCorrect: passives.passiveBlockOnCorrect || 0,
    healOnMomentum: passives.passiveHealOnMomentum || 0,
    momentumOnStreak: passives.passiveMomentumOnStreak || 0,
    blockOnStreak5: passives.passiveBlockOnStreak5 || 0,
    momentumOnDmgTaken: passives.passiveMomentumOnDmgTaken || 0,
    dmgReduction:  (passives.passiveDmgReduction || 0) + (augments.capLargeHits || 0),
    dmgTakenMult:  passives.passiveDmgTakenMult || 1.0,
    berserkThreshold: passives.passiveBerserkThreshold || 0,
    berserkMult:    passives.passiveBerserkMult || 0,
    luckyGuess:     passives.passiveLuckyGuess || 0,
    dmgPerInsight:  passives.passiveDmgPerInsight || 0,
    insightDodgeChance: passives.passiveInsightDodgeChance || 0,
    maxHpBonus:    (augments.maxHpBonus || 0) + (passives.passiveMaxHp || 0),
    hpCap:          augments.hpCap || null,
    blockPerTurn:   augments.blockPerTurn || 0,
    thornsRatio:    augments.thornsRatio || 0,
  };
}
