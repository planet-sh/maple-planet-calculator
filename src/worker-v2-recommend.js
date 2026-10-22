import baseWorker from './worker-v2-ui.js';

const RECO_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const timelessAtk={
    '나이트로드':56,'바이퍼':84,'캡틴':84,'섀도어':105,'보우마스터':107,'신궁':110,
    '히어로':112,'팔라딘':112,'다크나이트':114,'아란 (풀콤보 기준)':114
  };
  const lv100Weapon={
    '나이트로드':{name:'레드 크리븐',atk:46},'바이퍼':{name:'킹 센트',atk:74},'캡틴':{name:'콘체르토',atk:74},
    '섀도어':{name:'블러드 대거',atk:93},'보우마스터':{name:'화이트 니스록',atk:95},'신궁':{name:'골든 네쉐르',atk:98},
    '히어로':{name:'참화도',atk:100},'팔라딘':{name:'배틀해머',atk:98},'다크나이트':{name:'피나카',atk:102},
    '아란 (풀콤보 기준)':{name:'제드버그',atk:102}
  };
  const jobCrit={
    '나이트로드':{crit:50,cd:200,sharpCrit:15,sharpCd:40},'보우마스터':{crit:50,cd:110,sharpCrit:15,sharpCd:140},
    '신궁':{crit:50,cd:110,sharpCrit:15,sharpCd:140},'아란 (풀콤보 기준)':{crit:70,cd:200,sharpCrit:15,sharpCd:140},
    '바이퍼':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'캡틴':{crit:0,cd:0,sharpCrit:15,sharpCd:140},
    '섀도어':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'히어로':{crit:0,cd:0,sharpCrit:15,sharpCd:140},
    '팔라딘':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'다크나이트':{crit:0,cd:0,sharpCrit:15,sharpCd:140}
  };
  const jobSkill={
    '바이퍼':{name:'드래곤 스트라이크',pct:420,note:'420% × 2타 중 1타당'},
    '캡틴':{name:'배틀쉽 토르페도',pct:780},
    '나이트로드':{name:'트리플 스로우',pct:150,note:'3타 중 1타당'},
    '섀도어':{name:'부메랑 스텝',pct:500,note:'2타 중 1타당'},
    '히어로':{name:'브랜디쉬',pct:290},
    '다크나이트':{name:'스피어 버스터',pct:170,note:'3타 중 1타당'},
    '팔라딘':{name:'차지 블로우',pct:350,note:'어드밴스드 차지 M 적용'},
    '아란 (풀콤보 기준)':{name:'파이널 블로우',pct:700},
    '보우마스터':{name:'폭풍의 시',pct:100,note:'1발당'},
    '신궁':{name:'스트레이프 + 스나이핑',mix:[{name:'스트레이프',pct:120,weight:.5},{name:'스나이핑',pct:1500,weight:.5}],note:'실전 딜 비중 50:50 · 스트레이프 120% × 4타, 스나이핑 1500% × 2타의 1타당 수치'}
  };
  const weaponProfiles={
    timeless:{label:'타임리스/리버스급',firstFlat:16,lowerFlat:14},
    lv100:{label:'100제 무기',firstFlat:14,lowerFlat:12},
    bopping:{label:'보핑',firstFlat:14,lowerFlat:12,innateBoss:20}
  };
  const OTHER_ATK=20;

  function activeWeaponProfile(){return weaponProfiles[q('recoWeaponPreset')?.value]||weaponProfiles.timeless}
  function representativeSkillPct(jobName){
    const s=jobSkill[jobName]||{pct:420};
    if(s.mix&&s.mix.length)return s.mix.reduce((sum,x)=>sum+x.pct*x.weight,0);
    return s.pct||420;
  }
  function syncRepresentativeSkill(){
    const jobName=q('job')?.value;if(!jobName)return;
    const pct=representativeSkillPct(jobName),s=jobSkill[jobName];
    ['simpleSkillPct','advancedBaseSkillPct'].forEach(id=>{const el=q(id);if(el)el.value=Math.round(pct)});
    const input=q('simpleSkillPct');
    if(input){
      const label=input.previousElementSibling;
      if(label&&label.tagName==='LABEL')label.textContent=s?.mix?'대표 주력기 가중 1타당 스킬 데미지 (%)':'대표 주력기 1타당 스킬 데미지 (%)';
      let note=q('recoSkillAutoNote');
      if(!note){note=document.createElement('div');note.id='recoSkillAutoNote';note.className='small';note.style.marginTop='6px';input.insertAdjacentElement('afterend',note)}
      note.textContent=s?.mix?'자동값: '+s.name+' 실전 비중 반영 가중 대표값 '+Math.round(pct)+'% · 추천 TOP3는 두 스킬을 각각 계산합니다.':'자동값: '+(s?.name||'대표 스킬')+' M '+Math.round(pct)+'%';
    }
  }
  function syncWeaponPresetOptions(){
    const el=q('recoWeaponPreset'),jobName=q('job')?.value;if(!el||!jobName)return;
    const prev=el.value||'timeless';
    const options=[['timeless','타임리스/리버스급 (공16 / 공14)'],['lv100','100제 무기 (공14 / 공12 · 작 +15)']];
    if(jobName==='아란 (풀콤보 기준)')options.push(['bopping','보핑 (공14 / 공12 · 보공20 · 작 +12)']);
    el.innerHTML=options.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join('');
    el.value=Array.from(el.options).some(o=>o.value===prev)?prev:'timeless';
  }
  function presetDefaults(jobName,preset){
    if(preset==='lv100'){
      const w=lv100Weapon[jobName];
      return w?{name:w.name,base:w.atk,upgrade:15}:{name:'100제 무기',base:100,upgrade:15};
    }
    if(preset==='bopping')return {name:'보라색 서핑보드',base:99,upgrade:12};
    return {name:'타임리스/리버스급',base:timelessAtk[jobName]||100,upgrade:20};
  }
  function applyPresetDefaults(){
    const jobName=q('job')?.value,preset=q('recoWeaponPreset')?.value||'timeless';if(!jobName)return;
    const d=presetDefaults(jobName,preset),weaponAtk=d.base+d.upgrade;
    if(q('curAtk'))q('curAtk').value=weaponAtk;
    if(q('equipAtk'))q('equipAtk').value=weaponAtk+OTHER_ATK;
    try{q('curAtk')?.dispatchEvent(new Event('input',{bubbles:true}));q('equipAtk')?.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}
  }
  function potentialPools(){
    const p=activeWeaponProfile();
    return {first:[['공'+p.firstFlat,'flat',p.firstFlat],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]],lower:[['공'+p.lowerFlat,'flat',p.lowerFlat],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]]};
  }
  function critGain(jobName,bonus){
    const j=jobCrit[jobName]||jobCrit['바이퍼'],skill=jobSkill[jobName]||{pct:420};
    const c0=Math.min(100,j.crit+j.sharpCrit)/100,c1=Math.min(100,j.crit+j.sharpCrit+bonus)/100,cd=j.cd+j.sharpCd;
    const one=pct=>(pct+c1*cd)/(pct+c0*cd);
    if(skill.mix&&skill.mix.length)return skill.mix.reduce((sum,s)=>sum+s.weight*one(s.pct),0);
    return one(skill.pct||420);
  }
  function weaponPureAtk(jobName){
    const actual=parseFloat(q('curAtk')?.value);if(Number.isFinite(actual)&&actual>0)return actual;
    const d=presetDefaults(jobName,q('recoWeaponPreset')?.value||'timeless');return d.base+d.upgrade;
  }
  function basePureAtk(jobName){
    const equip=parseFloat(q('equipAtk')?.value);if(Number.isFinite(equip)&&equip>0)return equip;
    return weaponPureAtk(jobName)+OTHER_ATK;
  }
  function score(jobName,lines,measured){
    const base=basePureAtk(jobName);let flat=0,atkPct=0,crit=0,dmg=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2]});
    let attackMult;
    if(measured){const eqAtk=flat+(base+flat)*atkPct/100;attackMult=Math.max(.01,1+(eqAtk*measured.per)/measured.avg)}
    else attackMult=((base+flat)*(1+atkPct/100))/base;
    return attackMult*(1+dmg/100)*critGain(jobName,crit);
  }
  function combos(){const p=potentialPools(),out=[];p.first.forEach(a=>p.lower.forEach((b,bi)=>p.lower.slice(bi).forEach(c=>out.push([a,b,c]))));return out}
  function label(lines){return lines.map(x=>x[0]).join(' / ')}
  function top3(jobName,measured){return combos().map(lines=>({lines,score:score(jobName,lines,measured)})).sort((a,b)=>b.score-a.score).slice(0,3)}
  function calibrationNow(){
    const ids=['calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'],v=ids.map(id=>parseFloat(q(id)?.value));
    if(!v.every(Number.isFinite)||v[0]===v[1])return null;const d=v[1]-v[0],perMin=(v[4]-v[2])/d,perMax=(v[5]-v[3])/d,per=(perMin+perMax)/2,avg=((v[2]+v[3])/2+(v[4]+v[5])/2)/2;
    return per>0&&avg>0?{per,avg}:null;
  }
  function breakEven(flat,per,gain){return gain>1?(flat*per)/(gain-1):Infinity}
  function fmt(v){return Number.isFinite(v)?Math.round(v).toLocaleString():'-'}
  function skillDescription(jobName){const s=jobSkill[jobName]||{name:'대표 스킬',pct:420};if(s.mix)return s.mix.map(x=>x.name+' '+x.pct+'% × '+Math.round(x.weight*100)+'%').join(' + ')+(s.note?' ('+s.note+')':'');return s.name+' M '+s.pct+'%'+(s.note?' ('+s.note+')':'')}
  function verdict(avg,threshold,better,worse){return avg>=threshold?better+' 우세':worse+' 우세'}
  function render(){
    const card=q('potentialRecommendCard'),jobName=q('job')?.value;if(!card||!jobName||!timelessAtk[jobName]){if(card)card.style.display='none';return}
    card.style.display='block';q('recoJobName').textContent=jobName;
    const preset=q('recoWeaponPreset')?.value||'timeless',p=activeWeaponProfile(),d=presetDefaults(jobName,preset),weaponAtk=weaponPureAtk(jobName),equipAtk=basePureAtk(jobName);
    q('recoWeaponAtk').textContent=d.name+' · 현재 입력 무기공 '+weaponAtk+' / 장비공합 '+equipAtk;
    q('recoWeaponNote').textContent='기본값: '+d.base+' + 작/성장 '+d.upgrade+' · 추천 잠재 등급 1줄 공'+p.firstFlat+' / 2·3줄 공'+p.lowerFlat+(p.innateBoss?' · 고유 보공 +20% (일반 필드 미적용)':'')+' · 위 캐릭터/장비 입력칸에서 직접 수정 가능';
    const base=top3(jobName,null),best=base[0].score;q('recoBaseTop').innerHTML=base.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/best*100).toFixed(2)+'%</span></div>').join('');
    const measured=calibrationNow();
    if(measured){const m=top3(jobName,measured),mb=m[0].score;q('recoMeasured').style.display='block';q('recoMeasuredInfo').textContent='평균 스공 '+fmt(measured.avg)+' · 공1당 평균 +'+measured.per.toFixed(1);q('recoMeasuredTop').innerHTML=m.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/mb*100).toFixed(2)+'%</span></div>').join('')}else q('recoMeasured').style.display='none';
    const crit8=critGain(jobName,8),flat=p.lowerFlat,rows=[250,200,150,100].map(per=>{const t=flat*per/.09,c=breakEven(flat,per,crit8);return '<tr><td>공1당 +'+per+'</td><td>스공 '+fmt(t)+' 이상 → <b>총9 우세</b><br><span class="small">미만 → 공'+flat+' 우세</span></td><td>스공 '+fmt(c)+' 이상 → <b>크8 우세</b><br><span class="small">미만 → 공'+flat+' 우세</span></td></tr>'}).join('');
    q('recoBreakRows').innerHTML=rows;q('recoBreakTotalHead').textContent='공'+flat+' vs 총9';q('recoBreakCritHead').textContent='공'+flat+' vs 크8';q('recoCritNote').textContent='찐샾 상시 · '+skillDescription(jobName)+' 기준 크8 기대효율 약 +'+((crit8-1)*100).toFixed(2)+'%';
    const box=q('recoMyVerdict');if(measured&&box){const t=flat*measured.per/.09,c=breakEven(flat,measured.per,crit8);box.style.display='block';box.innerHTML='<b>내 실측 판정</b> · 평균 스공 '+fmt(measured.avg)+' / 공1당 +'+measured.per.toFixed(1)+'<br>공'+flat+' vs 총9 → <b>'+verdict(measured.avg,t,'총9','공'+flat)+'</b> · 공'+flat+' vs 크8 → <b>'+verdict(measured.avg,c,'크8','공'+flat)+'</b>'}else if(box)box.style.display='none';
    const type=jobName==='나이트로드'?'저스펙: 공공 계열 강세 · 중스펙: 총9 vs 깡공 경쟁 · 고스펙: 총뎀 우세, 크확도 깡공 추월 가능':(jobName==='아란 (풀콤보 기준)'||jobName==='보우마스터'||jobName==='신궁'?'저스펙: 깡공 강세 · 중스펙: 총뎀 우세 전환 · 고스펙: 크확도 깡공과 경쟁 가능':'저스펙: 깡공 강세 · 중스펙: 총뎀 우세 전환 · 고스펙: 총뎀 중심, 크확은 후순위');q('recoFlow').textContent=type;
  }

  const job=q('job');if(!job)return;const host=job.closest('section.card');
  if(host&&!q('potentialRecommendCard')){const card=document.createElement('section');card.className='card';card.id='potentialRecommendCard';card.innerHTML='<div class="weapon-head"><h2 style="margin:0">직업별 추천 잠재 <span class="tag">참고</span></h2><span class="small" id="recoWeaponAtk"></span></div><div class="grid" style="margin-top:10px"><div><label>사냥용 무기 프리셋</label><select id="recoWeaponPreset"></select><div class="small" id="recoWeaponNote"></div></div></div><div class="small" style="margin-top:8px">프리셋 선택 시 위 캐릭터/장비 영역의 <b>무기 순수 공격력</b>과 <b>장착 장비 순수 공격력 합</b>에 기본값을 자동 입력합니다. 입력 후에는 실제 작·성장치에 맞게 직접 수정할 수 있습니다.</div><div class="metric" style="margin-top:12px"><span class="small" id="recoJobName"></span><b id="recoFlow" style="font-size:16px;line-height:1.5"></b></div><div class="grid" style="margin-top:12px"><div class="weapon"><h3>기본 추천 TOP 3</h3><div id="recoBaseTop"></div></div><div class="weapon" id="recoMeasured" style="display:none"><h3>내 실측 기준 TOP 3</h3><div class="small" id="recoMeasuredInfo"></div><div id="recoMeasuredTop"></div></div></div><details class="details"><summary>잠재 역전표 보기</summary><div class="small" style="margin-top:8px">내 <b>공1당 평균 스공 상승량</b>과 가까운 행을 찾고, 현재 평균 스공이 기준 이상이면 오른쪽 옵션이 우세합니다.</div><div class="metric" id="recoMyVerdict" style="display:none;margin-top:10px"></div><div style="overflow:auto"><table><thead><tr><th>공1당 평균 스공</th><th id="recoBreakTotalHead">깡공 vs 총9</th><th id="recoBreakCritHead">깡공 vs 크8</th></tr></thead><tbody id="recoBreakRows"></tbody></table></div><div class="small" id="recoCritNote"></div></details><div class="small" style="margin-top:10px">※ 기본 추천은 참고용이며, 공1 실측을 입력하면 현재 스공 기준 TOP3와 판정이 자동 보정됩니다.</div>';host.insertAdjacentElement('afterend',card)}
  syncWeaponPresetOptions();syncRepresentativeSkill();
  const initialPreset=q('recoWeaponPreset')?.value||'timeless';if(!q('recoWeaponPreset')?.dataset.initialized){applyPresetDefaults();q('recoWeaponPreset').dataset.initialized='1'}
  q('recoWeaponPreset')?.addEventListener('change',()=>{applyPresetDefaults();render()});
  job.addEventListener('change',()=>{syncWeaponPresetOptions();syncRepresentativeSkill();applyPresetDefaults();setTimeout(render,0)});
  ['curAtk','equipAtk','calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));
  render();
})();
</script>`;

function patchRecommend(html){
  html=html.replace('</style>',`\n.reco-rank{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)}.reco-rank:last-child{border-bottom:0}.reco-rank span{color:var(--good);font-weight:700;white-space:nowrap}\n</style>`);
  html=html.replace('</body>',RECO_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx),url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchRecommend(html);const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};