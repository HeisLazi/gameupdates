/* StudyBuddy — shared mock data: modules, chapters, abilities, enemies, deadlines, pets, augments. */

const MODULES = [
  { code:'NEUR-301', name:'Memory & Cognition', prog:59, due:11, color:'var(--accent)' },
  { code:'BIO-204',  name:'Cell Biology',       prog:32, due:24, color:'var(--block)' },
  { code:'HIST-110', name:'Modernity',          prog:18, due:38, color:'var(--insight)' },
  { code:'MATH-220', name:'Linear Algebra',     prog:0,  due:3,  color:'var(--t-mythic)' },
  { code:'PHIL-150', name:'Ethics I',           prog:12, due:7,  color:'var(--t-epic)' },
];

const CHAPTERS = {
  'NEUR-301': [
    { n:1, name:'Encoding',            status:'cleared', topics:4, mastered:4 },
    { n:2, name:'Storage Mechanisms',  status:'active',  topics:4, mastered:2 },
    { n:3, name:'Retrieval Cues',      status:'open',    topics:5, mastered:0 },
    { n:4, name:'Forgetting Curves',   status:'open',    topics:3, mastered:0 },
    { n:5, name:'Memory Distortion',   status:'open',    topics:4, mastered:0 },
    { n:6, name:'Synthesis (Boss)',    status:'locked',  topics:6, mastered:0 },
  ],
};

const TOPICS = {
  2: [
    { id:'2.1', name:'Encoding → Storage', type:'STUDY', status:'CLEARED', xp:80, acc:94 },
    { id:'2.2', name:'Hippocampal Indexing', type:'STREET', status:'CLEARED', xp:160, acc:88 },
    { id:'2.3', name:'Sleep Consolidation', type:'STREET', status:'ACTIVE', xp:240, acc:null },
    { id:'2.4', name:'Schema Integration', type:'DOJO', status:'OPEN', xp:120, acc:null },
    { id:'2.5', name:'Long-term Potentiation', type:'ELITE', status:'LOCKED', xp:480, acc:null },
  ]
};

const ABILITIES = [
  { id:'flashcard',  name:'Flashcard Strike', tier:'basic',    desc:'1 MCQ · 8 dmg + 4/streak', dmg:8,  cd:0, key:'1' },
  { id:'recall',     name:'Active Recall',    tier:'core',     desc:'Open recall · 12 dmg, +block', dmg:12, cd:0, key:'2' },
  { id:'fill',       name:'Fill Blank',       tier:'core',     desc:'Cloze · pierces armor',   dmg:14, cd:1, key:'3' },
  { id:'overload',   name:'Concept Overload', tier:'advanced', desc:'AOE · 6 dmg all',         dmg:6,  cd:2, key:'4' },
  { id:'crit',       name:'Critical Insight', tier:'advanced', desc:'2× on streak ≥ 5',        dmg:18, cd:3, key:'5' },
];

const ENEMIES = [
  { id:'bookworm',   name:'Bookworm',     hp:24, max:24, lv:4, tier:'common', spr:'bookworm', intent:'light_dmg', intentVal:6,  intentDesc:'STRIKE'},
  { id:'paper_imp',  name:'Paper Imp',    hp:32, max:32, lv:5, tier:'rare',   spr:'paper_imp', intent:'med_dmg',  intentVal:9,  intentDesc:'POP QUIZ'},
  { id:'glitch',     name:'Glitch Wraith',hp:48, max:60, lv:6, tier:'epic',   spr:'glitch',    intent:'debuff',   intentVal:0,  intentDesc:'GARBLE'},
  { id:'professor',  name:'Prof. Hardman',hp:120,max:140,lv:9, tier:'mythic', spr:'professor', intent:'fatal_dmg',intentVal:24, intentDesc:'CALL ON YOU'},
];

const DEADLINES = [
  { id:1, label:'MATH-220 Quiz',       module:'MATH-220', days:3, kind:'quiz' },
  { id:2, label:'PHIL-150 Essay',      module:'PHIL-150', days:7, kind:'essay' },
  { id:3, label:'NEUR-301 Midterm',    module:'NEUR-301', days:11, kind:'exam' },
  { id:4, label:'BIO-204 Lab Report',  module:'BIO-204',  days:24, kind:'paper' },
];

const AUGMENTS = [
  { id:'a1', name:'Engram Lens',     tier:'rare',      slot:'EYE',   desc:'+2 dmg per correct streak ≥3', equipped:true },
  { id:'a2', name:'Cortex Plate',    tier:'epic',      slot:'CHEST', desc:'+12 max HP, -1 dmg taken',     equipped:true },
  { id:'a3', name:'Recall Vector',   tier:'legendary', slot:'WPN',   desc:'Active Recall pierces 2 armor', equipped:true },
  { id:'a4', name:'Synapse Buckle',  tier:'rare',      slot:'BELT',  desc:'+5% insight gain',             equipped:false },
  { id:'a5', name:'Mnemonic Charm',  tier:'common',    slot:'CHARM', desc:'+1 starting block',            equipped:false },
  { id:'a6', name:'Forgetting Pact', tier:'mythic',    slot:'CHARM', desc:'+50% dmg, lose XP on miss',     equipped:false },
];

const PETS = [
  { id:'p1', name:'Athena',  spr:'owl',   bond:7, mood:'eager',    perk:'+8% XP' },
  { id:'p2', name:'Echo',    spr:'drone', bond:4, mood:'steady',   perk:'reveal 1 weak topic' },
  { id:'p3', name:'Glob',    spr:'slime', bond:2, mood:'distracted',perk:'+1 block on streak' },
];

const SKILLS = [
  // 5x5 grid of skills, with active states
  { id:'s11', name:'Steady Hand',   row:0, col:0, learned:true,  cost:1, branch:'A' },
  { id:'s12', name:'Quick Read',    row:0, col:2, learned:true,  cost:1, branch:'B' },
  { id:'s13', name:'Cold Recall',   row:0, col:4, learned:false, cost:1, branch:'C' },
  { id:'s21', name:'Pressure Calm', row:1, col:1, learned:true,  cost:2, branch:'A' },
  { id:'s22', name:'Pattern Match', row:1, col:3, learned:false, cost:2, branch:'B' },
  { id:'s31', name:'Deep Encode',   row:2, col:0, learned:false, cost:3, branch:'A' },
  { id:'s32', name:'Insight Surge', row:2, col:2, learned:false, cost:3, branch:'B' },
  { id:'s33', name:'Spaced Crit',   row:2, col:4, learned:false, cost:3, branch:'C' },
  { id:'s41', name:'Engram Forge',  row:3, col:1, learned:false, cost:4, branch:'A' },
  { id:'s42', name:'Memory Palace', row:3, col:3, learned:false, cost:4, branch:'B' },
  { id:'s51', name:'Total Recall',  row:4, col:2, learned:false, cost:6, branch:'X' },
];

window.MODULES = MODULES;
window.CHAPTERS = CHAPTERS;
window.TOPICS = TOPICS;
window.ABILITIES = ABILITIES;
window.ENEMIES = ENEMIES;
window.DEADLINES = DEADLINES;
window.AUGMENTS = AUGMENTS;
window.PETS = PETS;
window.SKILLS = SKILLS;
