// V2.2 canonical job/combat presets.
// New V2.2 code should read job/skill/critical defaults from this module only.
// Legacy V2.1 workers are frozen compatibility code and will be migrated incrementally.

export const JOB_PRESETS = Object.freeze({
  '바이퍼': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'드래곤 스트라이크', pct:420, note:'420% × 2타 중 1타당'})}),
  '캡틴': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'배틀쉽 캐논', pct:380, note:'380% × 4타 중 1타당'})}),
  '나이트로드': Object.freeze({crit:50, critDamage:200, sharpCrit:15, sharpCritDamage:40, skill:Object.freeze({name:'트리플 스로우', pct:150, note:'3타 중 1타당'})}),
  '섀도어': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'부메랑 스텝', pct:500, note:'2타 중 1타당'})}),
  '히어로': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'브랜디쉬', pct:290})}),
  '다크나이트': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'스피어 버스터', pct:170, note:'3타 중 1타당'})}),
  '팔라딘': Object.freeze({crit:0, critDamage:0, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'차지 블로우', pct:350, note:'어드밴스드 차지 M 적용'})}),
  '보우마스터': Object.freeze({crit:50, critDamage:110, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'폭풍의 시', pct:100, note:'1발당'})}),
  '신궁': Object.freeze({crit:50, critDamage:110, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'스트레이프 + 스나이핑', representativePct:810, mix:Object.freeze([
    Object.freeze({name:'스트레이프', pct:120, weight:0.5}),
    Object.freeze({name:'스나이핑', pct:1500, weight:0.5})
  ]), note:'실전 딜 비중 50:50 러프 가중'})}),
  '아란 (풀콤보 기준)': Object.freeze({crit:70, critDamage:200, sharpCrit:15, sharpCritDamage:140, skill:Object.freeze({name:'기본공격 + 더블 스윙 + 트리플 스윙', representativePct:356, mix:Object.freeze([
    Object.freeze({name:'기본공격', pct:100, weight:0.16752}),
    Object.freeze({name:'더블 스윙', pct:360, weight:0.39069}),
    Object.freeze({name:'트리플 스윙', pct:450, weight:0.44179})
  ]), note:'높은 성벽 우2 약 6분 DPS 실측 비중 · 바디 프레셔 제외'})})
});

export const WEAPON_BASE_ATTACK = Object.freeze({
  timeless:Object.freeze({'나이트로드':56,'바이퍼':84,'캡틴':84,'섀도어':105,'보우마스터':107,'신궁':110,'히어로':112,'팔라딘':112,'다크나이트':114,'아란 (풀콤보 기준)':114}),
  lv100:Object.freeze({'나이트로드':46,'바이퍼':74,'캡틴':74,'섀도어':93,'보우마스터':95,'신궁':98,'히어로':100,'팔라딘':98,'다크나이트':102,'아란 (풀콤보 기준)':102})
});

export function representativeSkillPct(jobName){
  const skill=JOB_PRESETS[jobName]?.skill;
  if(!skill)return 420;
  if(Number.isFinite(skill.representativePct))return skill.representativePct;
  if(Array.isArray(skill.mix))return skill.mix.reduce((sum,row)=>sum+row.pct*row.weight,0);
  return skill.pct||420;
}
