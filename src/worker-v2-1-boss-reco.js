import baseWorker from './worker-v2-1-common-reco.js';

function patchBossReco(html){
  html=html.replace(
`  function potentialPools(){
    const p=activeWeaponProfile();
    return {first:[['공'+p.firstFlat,'flat',p.firstFlat],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]],lower:[['공'+p.lowerFlat,'flat',p.lowerFlat],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]]};
  }`,
`  function bossFieldActive(){return q('fieldMode')?.value==='rating'}
  function baseBossBucket(){const p=activeWeaponProfile();return bossFieldActive()?((p.innateBoss||0)+(q('guildBossToggle')?.checked?5:0)):0}
  function potentialPools(){
    const p=activeWeaponProfile();
    const first=[['공'+p.firstFlat,'flat',p.firstFlat],['공9%','atkPct',9],['크9','crit',9],['총9','dmg',9]];
    const lower=[['공'+p.lowerFlat,'flat',p.lowerFlat],['공6%','atkPct',6],['크8','crit',8],['총6','dmg',6]];
    if(bossFieldActive()){first.push(['보30','boss',30]);lower.push(['보20','boss',20])}
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
`  function score(jobName,lines,measured){
    const base=basePureAtk(jobName);let flat=0,atkPct=0,crit=0,dmg=0,boss=0;
    lines.forEach(x=>{if(x[1]==='flat')flat+=x[2];if(x[1]==='atkPct')atkPct+=x[2];if(x[1]==='crit')crit+=x[2];if(x[1]==='dmg')dmg+=x[2];if(x[1]==='boss')boss+=x[2]});
    let attackMult;
    if(measured){const eqAtk=flat+(base+flat)*atkPct/100;attackMult=Math.max(.01,1+(eqAtk*measured.per)/measured.avg)}
    else attackMult=((base+flat)*(1+atkPct/100))/base;
    const baseBucket=baseBossBucket();
    const damageMult=bossFieldActive()?(1+(baseBucket+dmg+boss)/100)/(1+baseBucket/100):(1+dmg/100);
    return attackMult*damageMult*critGain(jobName,crit);
  }`
  );

  html=html.replace(
`  function combos(){const p=potentialPools(),out=[];p.first.forEach(a=>p.lower.forEach((b,bi)=>p.lower.slice(bi).forEach(c=>out.push([a,b,c]))));return out}`,
`  function combos(){
    const p=potentialPools(),out=[];
    const lowerNormal=p.lower.map(x=>[...x,false]);
    const lowerOff=p.first.map(x=>[...x,true]);
    const lowerAll=[...lowerNormal,...lowerOff];
    p.first.forEach(a=>{
      lowerAll.forEach((b,bi)=>{
        lowerAll.slice(bi).forEach(c=>{
          const offCount=(b[3]?1:0)+(c[3]?1:0);
          if(offCount>1)return;
          out.push([a,b.slice(0,3),c.slice(0,3)]);
        });
      });
    });
    return out;
  }`
  );

  html=html.replace(
`    q('recoWeaponNote').textContent='기본값: '+d.base+' + 작/성장 '+d.upgrade+' · 추천 잠재 등급 1줄 공'+p.firstFlat+' / 2·3줄 공'+p.lowerFlat+(p.innateBoss?' · 고유 보공 +20% (일반 필드 미적용)':'')+' · 위 캐릭터/장비 입력칸에서 직접 수정 가능';`,
`    q('recoWeaponNote').textContent='기본값: '+d.base+' + 작/성장 '+d.upgrade+' · 추천 잠재 등급 1줄 공'+p.firstFlat+' / 2·3줄 공'+p.lowerFlat+(p.innateBoss?' · 고유 보공 +20%':'')+(bossFieldActive()?' · 현재 보공 적용 필드: 보30/보20 후보 포함, 보공+총뎀 합연산':' · 일반 필드: 보공 후보 제외')+' · 이탈 옵션은 2·3줄 중 최대 1줄까지만 추천 후보에 포함 · 위 캐릭터/장비 입력칸에서 직접 수정 가능';`
  );

  html=html.replace(
`  ['curAtk','equipAtk','calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));`,
`  ['curAtk','equipAtk','calAtk1','calAtk2','calMin1','calMax1','calMin2','calMax2'].forEach(id=>q(id)?.addEventListener('input',render));
  ['fieldMode','guildBossToggle'].forEach(id=>{q(id)?.addEventListener('change',render);q(id)?.addEventListener('input',render)});`
  );

  html=html.replace('</body>',`<script>(()=>{const q=id=>document.getElementById(id);function sync(){const rating=q('fieldMode')?.value==='rating';const base=q('recoBaseTop')?.previousElementSibling;const measured=q('recoMeasuredTop')?.parentElement?.querySelector('h3');if(base)base.textContent=rating?'실전 추천 TOP 3 · 보공 적용':'실전 추천 TOP 3';if(measured)measured.textContent=rating?'내 실측 기준 TOP 3 · 보공 적용':'내 실측 기준 TOP 3';let note=q('recoOffTierRule');if(!note&&q('recoBaseTop')){note=document.createElement('div');note.id='recoOffTierRule';note.className='small';note.style.marginTop='8px';q('recoBaseTop').parentElement.appendChild(note)}if(note)note.innerHTML='※ 실제 획득 난이도를 고려해 <b>2·3줄 이탈 옵션은 최대 1줄까지만</b> 추천에 포함합니다. 이탈 2줄 이상 조합은 성능이 높아도 TOP3에서 제외합니다.'}q('fieldMode')?.addEventListener('change',()=>requestAnimationFrame(sync));sync()})();</script></body>`);
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
