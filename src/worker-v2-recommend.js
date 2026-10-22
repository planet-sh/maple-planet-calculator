import baseWorker from './worker-v2-ui.js';

const RECO_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const timelessAtk={
    '나이트로드':56,'바이퍼':84,'캡틴':84,'섀도어':105,'보우마스터':107,'신궁':110,
    '히어로':112,'팔라딘':112,'다크나이트':114,'아란 (풀콤보 기준)':114
  };
  const jobCrit={
    '나이트로드':{crit:50,cd:200,sharpCrit:15,sharpCd:40},
    '보우마스터':{crit:50,cd:110,sharpCrit:15,sharpCd:140},
    '신궁':{crit:50,cd:110,sharpCrit:15,sharpCd:140},
    '아란 (풀콤보 기준)':{crit:70,cd:200,sharpCrit:15,sharpCd:140},
    '바이퍼':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'캡틴':{crit:0,cd:0,sharpCrit:15,sharpCd:140},
    '섀도어':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'히어로':{crit:0,cd:0,sharpCrit:15,sharpCd:140},
    '팔라딘':{crit:0,cd:0,sharpCrit:15,sharpCd:140},'다크나이트':{crit:0,cd:0,sharpCrit:15,sharpCd:140}
  };
  const firstLines=[['공16','flat',16],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]];
  const lowerLines=[['공14','flat',14],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]];
  const WEAPON_UP_ATK=20, OTHER_ATK=20, SKILL=420;

  function critGain(jobName,bonus){
    const j=jobCrit[jobName]||jobCrit['바이퍼'];
    const c0=Math.min(100,j.crit+j.sharpCrit)/100;
    const c1=Math.min(100,j.crit+j.sharpCrit+bonus)/100;
    const cd=j.cd+j.sharpCd;
    return (SKILL+c1*cd)/(SKILL+c0*cd);
  }
  function basePureAtk(jobName){
    return (timelessAtk[jobName]||100)+WEAPON_UP_ATK+OTHER_ATK;
  }
  function theoreticalScore(jobName,lines){
    const base=basePureAtk(jobName);
    let flat=0,atkPct=0,crit=0,dmg=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2]});
    const attack=(base+flat)*(1+atkPct/100);
    return attack*(1+dmg/100)*critGain(jobName,crit);
  }
  function measuredScore(jobName,lines,avgSp,perAtk){
    const base=basePureAtk(jobName);
    let flat=0,atkPct=0,crit=0,dmg=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2]});
    const eqAtk=flat+(base+flat)*atkPct/100;
    const attackMult=Math.max(.01,1+(eqAtk*perAtk)/avgSp);
    return attackMult*(1+dmg/100)*critGain(jobName,crit);
  }
  function combos(){
    const out=[];
    firstLines.forEach(a=>lowerLines.forEach((b,bi)=>lowerLines.slice(bi).forEach(c=>out.push([a,b,c]))));
    return out;
  }
  const ALL=combos();
  function label(lines){return lines.map(x=>x[0]).join(' / ')}
  function top3(jobName,measured){
    return ALL.map(lines=>({lines,score:measured?measuredScore(jobName,lines,measured.avg,measured.per):theoreticalScore(jobName,lines)}))
      .sort((a,b)=>b.score-a.score).slice(0,3);
  }
  function calibrationNow(){
    const a1=parseFloat(q('calAtk1')?.value),a2=parseFloat(q('calAtk2')?.value);
    const min1=parseFloat(q('calMin1')?.value),max1=parseFloat(q('calMax1')?.value),min2=parseFloat(q('calMin2')?.value),max2=parseFloat(q('calMax2')?.value);
    if(![a1,a2,min1,max1,min2,max2].every(Number.isFinite)||a1===a2)return null;
    const perMin=(min2-min1)/(a2-a1),perMax=(max2-max1)/(a2-a1),per=(perMin+perMax)/2;
    const avg=((min1+max1)/2+(min2+max2)/2)/2;
    if(per<=0||avg<=0)return null;
    return {per,avg};
  }
  function breakEven(per,gain){return gain>1?(14*per)/(gain-1):Infinity}
  function fmt(v){return Number.isFinite(v)?Math.round(v).toLocaleString():'-'}
  function render(){
    const card=q('potentialRecommendCard'),job=q('job')?.value;if(!card||!job||!timelessAtk[job]){if(card)card.style.display='none';return}
    card.style.display='block';q('recoJobName').textContent=job;
    q('recoWeaponAtk').textContent='타임리스 기본공 '+timelessAtk[job]+' + 무기 작/성장 +20 + 기타 장비공 +20 기준';
    const base=top3(job,null),best=base[0].score;
    q('recoBaseTop').innerHTML=base.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/best*100).toFixed(2)+'%</span></div>').join('');
    const measured=calibrationNow();
    if(measured){
      const m=top3(job,measured),mb=m[0].score;
      q('recoMeasured').style.display='block';
      q('recoMeasuredInfo').textContent='평균 스공 '+fmt(measured.avg)+' · 공1당 평균 +'+measured.per.toFixed(1);
      q('recoMeasuredTop').innerHTML=m.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/mb*100).toFixed(2)+'%</span></div>').join('');
    }else q('recoMeasured').style.display='none';
    const crit8=critGain(job,8);
    const rows=[250,200,150,100].map(per=>'<tr><td>+'+per+'</td><td>'+fmt(14*per/.09)+'</td><td>'+fmt(breakEven(per,crit8))+'</td></tr>').join('');
    q('recoBreakRows').innerHTML=rows;
    const critPct=(crit8-1)*100;
    q('recoCritNote').textContent='찐샾 상시 · 대표 스킬 420% 가정에서 크8 기대효율 약 +'+critPct.toFixed(2)+'%';
    const type=job==='나이트로드'?'저스펙: 공공 계열 강세 · 중스펙: 총9 vs 공16 경쟁 · 고스펙: 총뎀 우세, 크확도 깡공 추월 가능':
      (job==='아란 (풀콤보 기준)'||job==='보우마스터'||job==='신궁'?'저스펙: 깡공 강세 · 중스펙: 총뎀 우세 전환 · 고스펙: 크확도 깡공과 경쟁 가능':'저스펙: 깡공 강세 · 중스펙: 총뎀 우세 전환 · 고스펙: 총뎀 중심, 크확은 후순위');
    q('recoFlow').textContent=type;
  }

  const job=q('job');if(!job)return;
  const host=job.closest('section.card');
  if(host&&!q('potentialRecommendCard')){
    const card=document.createElement('section');card.className='card';card.id='potentialRecommendCard';
    card.innerHTML='<div class="weapon-head"><h2 style="margin:0">직업별 추천 잠재 <span class="tag">참고</span></h2><span class="small" id="recoWeaponAtk"></span></div><div class="small" style="margin-top:8px">선택 직업의 일반 필드 사냥용 참고표입니다. <b>타임리스 기본 무기공 + 주문서 작·성장치 평균 +20 + 기타 공격력 장비 합 +20</b>, 기본 총데미지 0%, 찐샾 상시를 기준으로 합니다.</div><div class="metric" style="margin-top:12px"><span class="small" id="recoJobName"></span><b id="recoFlow" style="font-size:16px;line-height:1.5"></b></div><div class="grid" style="margin-top:12px"><div class="weapon"><h3>기본 추천 TOP 3</h3><div id="recoBaseTop"></div></div><div class="weapon" id="recoMeasured" style="display:none"><h3>내 실측 기준 TOP 3</h3><div class="small" id="recoMeasuredInfo"></div><div id="recoMeasuredTop"></div></div></div><details class="details"><summary>잠재 역전표 보기</summary><div class="small" style="margin-top:8px">현재 평균 스공이 아래 값을 넘으면 동일 조건에서 <b>공14보다 총9/크8의 기대효율이 높아지는</b> 대략적인 경계입니다.</div><div style="overflow:auto"><table><thead><tr><th>공1당 평균 스공</th><th>공14 → 총9 역전</th><th>공14 → 크8 역전</th></tr></thead><tbody id="recoBreakRows"></tbody></table></div><div class="small" id="recoCritNote"></div></details><div class="small" style="margin-top:10px">※ 추천은 참고용입니다. 실제 캐릭터는 공1 실측값·주력기 구성·버프 상태에 따라 달라질 수 있으며, 공1 실측 완료 시 위 카드가 현재 입력값 기준으로 자동 보정됩니다.</div>';
    host.insertAdjacentElement('afterend',card);
  }
  job.addEventListener('change',()=>setTimeout(render,0));
  ['calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));
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
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchRecommend(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};