/* ============ CAVEMAN ARCHETYPE — 7th Weapon ============ *
 * Splice AFTER skills.jsx so it can extend ABILITIES, WEAPONS, and
 * WEAPON_MASTERY_BONUSES without redefining them.
 *
 * Theme: Primal / Berserker. Low IQ, high damage, regen-tank.
 *   "Hit thing. Thing dies. Eat. Repeat."
 *
 * Why it matters: Rampage (advanced) hits ALL living enemies — the only
 * weapon ability in the game that scales with enemy count. Synergizes
 * directly with multi-mob combat and Cram waves.
 */

ABILITIES.club_bonk = {
  id:'club_bonk', name:'Club Bonk', icon:'🪨', source:'weapon', kind:'active', tier:'basic',
  getDesc:(w)=>`Smash for ${10+(w*2)} flat damage. Big rock = big ouch.`,
  onAttack:(dmg,w)=> dmg + 10 + (w*2)
};

ABILITIES.gnaw = {
  id:'gnaw', name:'Gnaw', icon:'🦷', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:3,
  getDesc:(w)=>`Bite for ${12+(w*2)} dmg, heal half the damage dealt.`,
  onAttack:(dmg,w)=> dmg + 12 + (w*2),
  onHeal:(w)=> Math.floor((12 + (w*2)) * 0.5)
};

ABILITIES.war_cry = {
  id:'war_cry', name:'War Cry', icon:'🗣️', source:'weapon', kind:'active', tier:'core', reqWeaponLvl:7,
  getDesc:()=>`No damage. Buff: next attack also hits adjacent enemy for 50% dmg.`,
  onAttack:(dmg)=> dmg,
  onBuff:()=> 'cleave_next'
};

ABILITIES.rampage = {
  id:'rampage', name:'Rampage', icon:'🦣', source:'weapon', kind:'active', tier:'advanced', reqWeaponLvl:10,
  getDesc:(w)=>`Smash ALL living enemies for ${15+(w*3)} damage each.`,
  onAttack:(dmg,w)=> dmg + 15 + (w*3),
  hitsAll: true
};

WEAPONS.caveman = {
  id:'caveman', name:'Caveman Club', icon:'🪨', kind:'Primal',
  atk:+5, def:-1, xpMul:0.9, unlockLvl:1,
  desc:'Pure brute force. No tactics, just wreck. Regenerates between hits.',
  flavor:'"Hit thing. Thing die. Eat. Repeat."',
  basic:'club_bonk', abilities:['gnaw','war_cry','rampage']
};

WEAPON_MASTERY_BONUSES.caveman = [
  { level:3,  desc:'Regen +2 HP per turn',          stats:{ flatHeal:2 } },
  { level:5,  desc:'+5 Max HP',                       stats:{ hpBonusRatio:0.05 } },
  { level:7,  desc:'HP < 30% → +25% damage (Berserker)', stats:{ dmgMult:0.0 } },
  { level:10, desc:'Rampage hits each enemy TWICE',    stats:{ rampageDoubleHit:true } },
];

window.__baseGetCombinedStats = getCombinedStats;
window.getCombinedStats = function(state){
  const combined = window.__baseGetCombinedStats(state);
  const arena = state.arena || {};
  const wId = arena.equipped;
  const wLvl = arena.weapons?.[wId]?.level || 1;
  if (wId === 'caveman'){
    combined.regenPerTurn = (combined.regenPerTurn || 0) + (wLvl >= 3 ? 2 : 0);
    if (wLvl >= 7){
      combined.berserkThreshold = Math.max(combined.berserkThreshold || 0, 0.30);
      combined.berserkMult = (combined.berserkMult || 0) + 0.25;
    }
    combined.rampageDoubleHit = wLvl >= 10;
  }
  return combined;
};
