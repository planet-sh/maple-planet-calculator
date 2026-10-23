import baseWorker from './worker-v2-1-common-reco.js';

function patchBossReco(html){
  html=html.replace(
`  function potentialPools(){
    const p=activeWeaponProfile();
    return {first:[['공'+p.firstFlat,'flat',p.firstFlat],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]],lower:[['공'+p.lowerFlat,'flat',p.lowerFlat],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]]};
  }`,
`  function bossFieldActive(){return q('fieldMode')?.value==='rating'}
  function baseBossBucket(mode){const p=activeWeaponProfile();return mode==='boss'?((p.innateBoss||0)+(q('guildBossToggle')?.checked?5:0)):0}
  function potentialPools(mode){
    const p=activeWeaponProfile();
    const first=[['공'+p.firstFlat,'flat',p.firstFlat],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]];
    const lower=[['공'+p.lowerFlat,'flat',p.lowerFlat],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]];
    if(mode==='boss'){first.push(['보30','boss',30]);lower.push(['보20','boss',20])}
    return {first,lower};
  }`
  );

  html=html.replace(
`  function score(jobName,lines,measured){
    const base=basePureAtk(jobName);let flat=0,atkPct=0,crit=0,dmg=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2]});
    let attackMult;
    if(measured){const eqAtk=flat+(base+flat)*atkPct/100;attackMult=Math.max(.01,1+(eqAtk*measured.per)/measured.avg)}
    else attackMult=((base+flat)*(1+atkPct/100))/base;
    return attackMult*(1+dmg/100)*critGain(jobName,crit);
  }`,
`  function score(jobName,lines,measured,mode='normal'){
    const base=basePureAtk(jobName);let flat=0,atkPct=0,crit=0,dmg=0,boss=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2];if(x[1]==='boss')boss+=x[2]});
    let attackMult;
    if(measured){const eqAtk=flat+(base+flat)*atkPct/100;attackMult=Math.max(.01,1+(eqAtk*measured.per)/measured.avg)}
    else attackMult=((base+flat)*(1+atkPct/100))/base;
    const baseBucket=baseBossBucket(mode);
    const damageMult=mode==='boss'?(1+(baseBucket+dmg+boss)/100)/(1+baseBucket/100):(1+dmg/100);
    return attackMult*damageMult*critGain(jobName,crit);
  }`
  );

  html=html.replace(
`  function combos(){const p=potentialPools(),out=[];p.first.forEach(a=>p.lower.forEach((b,bi)=>p.lower.slice(bi).forEach(c=>out.push([a,b,c]))));return out}`,
`  function combos(mode='normal'){
    const p=potentialPools(mode),out=[];
    const lowerNormal=p.lower.map(x=>[...x,false]);
    const lowerOff=p.first.map(x=>[...x,true]);
    const lowerAll=[...lowerNormal,...lowerOff];
    p.first.forEach(a=>{
      lowerAll.forEach((b,bi)=>{
        lowerAll.slice(bi).forEach(c=>{
          const offCount=(b[3]?1:0)+(c[3]?1:0);
          if(offCount>1)return;
          const lines=[a,b.slice(0,3),c.slice(0,3)];
          const bossTotal=lines.reduce((sum,x)=>sum+(x[1]==='boss'?x[2]:0),0);
          if(mode==='boss'&&bossTotal>70)return;
          out.push(lines);
        });
      });
    });
    return out;
  }`
  );

  html=html.replace(
`  function top3(jobName,measured){return combos().map(lines=>({lines,score:score(jobName,lines,measured)})).sort((a,b)=>b.score-a.score).slice(0,3)}`,
`  function top3(jobName,measured,mode='normal'){return combos(mode).map(lines=>({lines,score:score(jobName,lines,measured,mode)})).sort((a,b)=>b.score-a.score).slice(0,3)}`
  );

  html=html.replace(
`    q('recoWeaponNote').textContent='기본값: '+d.base+' + 작/성장 '+d.upgrade+' · 추천 잠재 등급 1줄 공'+p.firstFlat+' / 2·3줄 공'+p.lowerFlat+(p.innateBoss?' · 고유 보공 +20% (일반 필드 미적용)':'')+' · 위 캐릭터/장비 입력칸에서 직접 수정 가능';`,
`    q('recoWeaponNote').textContent='기본값: '+d.base+' + 작/성장 '+d.upgrade+' · 추천 잠재 등급 1줄 공'+p.firstFlat+' / 2·3줄 공'+p.lowerFlat+(p.innateBoss?' · 고유 보공 +20%':'')+' · 일반 필드/보공 적용 몬스터 TOP3를 각각 계산 · 보공 적용 추천은 잠재 보공 합계 최대 70까지만 허용 · 이탈 옵션은 2·3줄 중 최대 1줄까지만 추천 후보에 포함 · 위 캐릭터/장비 입력칸에서 직접 수정 가능';`
  );

  html=html.replace(
`    const base=top3(jobName,null),best=base[0].score;q('recoBaseTop').innerHTML=base.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/best*100).toFixed(2)+'%</span></div>').join('');`,
`    const normalTop=top3(jobName,null,'normal'),bossTop=top3(jobName,null,'boss');
    const normalBest=normalTop[0]?.score||1,bossBest=bossTop[0]?.score||1;
    const renderRows=(list,best)=>list.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/best*100).toFixed(2)+'%</span></div>').join('');
    q('recoBaseTop').innerHTML='<div class="reco-dual-grid"><div class="reco-field-box"><h4>일반 필드 몬스터</h4>'+renderRows(normalTop,normalBest)+'</div><div class="reco-field-box"><h4>보공 적용 몬스터</h4>'+renderRows(bossTop,bossBest)+'<div class="small" style="margin-top:7px">잠재 보공 합계 최대 70까지만 추천</div></div></div>';`
  );

  html=html.replace(
`    if(measured){const m=top3(jobName,measured),mb=m[0].score;q('recoMeasured').style.display='block';q('recoMeasuredInfo').textContent='평균 스공 '+fmt(measured.avg)+' · 공1당 평균 +'+measured.per.toFixed(1);q('recoMeasuredTop').innerHTML=m.map((x,i)=>'<div class="reco-rank"><b>'+(i+1)+'위 '+label(x.lines)+'</b><span>'+(x.score/mb*100).toFixed(2)+'%</span></div>').join('')}else q('recoMeasured').style.display='none';`,
`    if(measured){const mn=top3(jobName,measured,'normal'),mbs=top3(jobName,measured,'boss'),mnb=mn[0]?.score||1,mbb=mbs[0]?.score||1;q('recoMeasured').style.display='block';q('recoMeasuredInfo').textContent='평균 스공 '+fmt(measured.avg)+' · 공1당 평균 +'+measured.per.toFixed(1);q('recoMeasuredTop').innerHTML='<div class="reco-dual-grid"><div class="reco-field-box"><h4>일반 필드 몬스터</h4>'+renderRows(mn,mnb)+'</div><div class="reco-field-box"><h4>보공 적용 몬스터</h4>'+renderRows(mbs,mbb)+'</div></div>'}else q('recoMeasured').style.display='none';`
  );

  html=html.replace(
`  ['curAtk','equipAtk','calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));`,
`  ['curAtk','equipAtk','calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));
  ['fieldMode','guildBossToggle'].forEach(id=>{q(id)?.addEventListener('change',render);q(id)?.addEventListener('input',render)});`
  );

  html=html.replace('</style>',`\n.reco-dual-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.reco-field-box{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px}.reco-field-box h4{margin:0 0 6px;font-size:14px}@media(max-width:720px){.reco-dual-grid{grid-template-columns:1fr}}\n</style>`);

  html=html.replace('</body>',`<script>(()=>{const q=id=>document.getElementById(id);function sync(){const base=q('recoBaseTop')?.previousElementSibling;const measured=q('recoMeasuredTop')?.parentElement?.querySelector('h3');if(base)base.textContent='실전 추천 TOP 3 · 필드별';if(measured)measured.textContent='내 실측 기준 TOP 3 · 필드별';let note=q('recoOffTierRule');if(!note&&q('recoBaseTop')){note=document.createElement('div');note.id='recoOffTierRule';note.className='small';note.style.marginTop='8px';q('recoBaseTop').parentElement.appendChild(note)}if(note)note.innerHTML='※ 실제 획득 난이도를 고려해 <b>2·3줄 이탈 옵션은 최대 1줄까지만</b> 추천에 포함합니다. 보공 적용 몬스터 추천은 비현실적인 보90 조합을 제외하고 <b>잠재 보공 합계 70 이하</b>만 표시합니다.'}sync()})();</script></body>`);
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchBossReco(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
