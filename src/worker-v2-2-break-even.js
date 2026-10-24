import app from './worker-v2-2-direct-summary.js';

// V2.2 DEV - weapon comparison model
// Uses the measured current stat-attack level as the baseline, converts attack-index
// differences through the measured ATK1 efficiency, then applies crit/total-damage
// relative multipliers. This allows percentage-heavy weapons to overtake flat/ATK%
// weapons as the character's current stat-attack grows.

const ARAN_HUNTING_STYLE = `
<style id="v22AranHuntingStyle">
.v22-aran-hunting-box{margin-top:12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
.v22-aran-hunting-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:end}
.v22-aran-hunting-note{margin-top:8px;font-size:12px;line-height:1.65;color:var(--muted)}
.v22-aran-weapon-field{margin-top:10px}
.v22-aran-wb-muted{opacity:.55}
.v22-recommend-details{margin-top:14px;border:1px solid var(--line);border-radius:12px;background:var(--panel);overflow:hidden}
.v22-recommend-details>summary{padding:12px 14px;font-weight:800;cursor:pointer;color:var(--text)}
.v22-recommend-details>#potentialRecommendCard{margin:0;border:0;border-top:1px solid var(--line);border-radius:0}
@media(max-width:760px){.v22-aran-hunting-grid{grid-template-columns:1fr}}
</style>`;

const ARAN_HUNTING_SCRIPT = `
<script id="v22AranHuntingScript">
(()=>{
  const q=id=>document.getElementById(id);
  const job=q('job');
  if(!job)return;
  const ARAN_VALUE='아란 (풀콤보 기준)';
  const STORAGE_KEY='planet-v22-aran-hunting-ui';
  const weaponIds=['cur','a','b','c'];

  function renameAranDisplay(){
    const opt=Array.from(job.options).find(o=>o.value===ARAN_VALUE);
    if(opt&&opt.textContent!=='아란 (사냥 기준)')opt.textContent='아란 (사냥 기준)';
    const recoJob=q('recoCommonJob');
    if(recoJob){
      const ropt=Array.from(recoJob.options).find(o=>o.value===ARAN_VALUE);
      if(ropt&&ropt.textContent!=='아란 (사냥 기준)')ropt.textContent='아란 (사냥 기준)';
    }
  }

  function addAranBox(){
    if(q('v22AranHuntingBox'))return;
    const card=job.closest('section.card');
    if(!card)return;
    const box=document.createElement('div');
    box.id='v22AranHuntingBox';
    box.className='v22-aran-hunting-box';
    box.innerHTML='<div class="v22-aran-hunting-grid"><div><label>아란 공속 비교</label><div class="small">각 무기 카드에서 보핑 / 디에스(핼버드) / 기타를 선택합니다.</div></div><label id="v22AranWindBoosterLabel" style="display:flex;align-items:center;gap:10px;margin:0;cursor:pointer"><input id="aranWindBooster" type="checkbox" checked style="width:auto;transform:scale(1.15);margin:0"><span><b>윈드부스터 ON</b><br><span class="small">디에스(핼버드) 선택 시에만 의미가 있습니다.</span></span></label></div><div class="v22-aran-hunting-note"><b>안내</b> · 보핑은 자버프로 풀공속으로 계산합니다. 공속 보정은 순수 공격 횟수 차이만 반영하며 콤보 수급 및 템페스트 사이클 변화는 제외합니다.</div>';
    card.appendChild(box);
  }

  function addWeaponSelectors(){
    weaponIds.forEach(id=>{
      const card=q(id+'Card');
      if(!card||q('aranWeaponType_'+id))return;
      const wrap=document.createElement('div');
      wrap.className='v22-aran-weapon-field';
      wrap.dataset.aranWeaponField='1';
      wrap.innerHTML='<label>아란 무기 종류</label><select id="aranWeaponType_'+id+'"><option value="bopping">보핑</option><option value="ds">디에스(핼버드)</option><option value="other">기타</option></select>';
      card.appendChild(wrap);
    });
  }

  function wrapRecommendation(){
    const card=q('potentialRecommendCard');
    if(!card||q('v22PotentialRecommendDetails'))return;
    const details=document.createElement('details');
    details.id='v22PotentialRecommendDetails';
    details.className='v22-recommend-details';
    const summary=document.createElement('summary');
    summary.innerHTML='무기 잠재 추천 <span class="small">· 필요할 때 펼치기</span>';
    card.parentNode.insertBefore(details,card);
    details.appendChild(summary);
    details.appendChild(card);
    details.open=false;
  }

  function isAran(){return job.value===ARAN_VALUE}
  function visibleWeapon(id){const card=q(id+'Card');return !!card&&!card.classList.contains('hidden')}
  function anyDs(){return weaponIds.some(id=>visibleWeapon(id)&&q('aranWeaponType_'+id)?.value==='ds')}

  function sync(){
    renameAranDisplay();
    const on=isAran();
    const box=q('v22AranHuntingBox');
    if(box)box.style.display=on?'':'none';
    document.querySelectorAll('[data-aran-weapon-field="1"]').forEach(el=>{el.style.display=on?'':'none'});
    const wb=q('aranWindBooster'),label=q('v22AranWindBoosterLabel');
    if(wb&&label){
      const relevant=on&&anyDs();
      wb.disabled=!relevant;
      label.classList.toggle('v22-aran-wb-muted',!relevant);
    }
  }

  function save(){
    try{
      const data={windBooster:!!q('aranWindBooster')?.checked,weapons:{}};
      weaponIds.forEach(id=>{data.weapons[id]=q('aranWeaponType_'+id)?.value||'bopping'});
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
    }catch(e){}
  }

  function restore(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
      const data=JSON.parse(raw);
      if(q('aranWindBooster')&&typeof data.windBooster==='boolean')q('aranWindBooster').checked=data.windBooster;
      weaponIds.forEach(id=>{
        const el=q('aranWeaponType_'+id),v=data.weapons?.[id];
        if(el&&['bopping','ds','other'].includes(v))el.value=v;
      });
    }catch(e){}
  }

  renameAranDisplay();
  addAranBox();
  addWeaponSelectors();
  wrapRecommendation();
  restore();
  sync();

  job.addEventListener('change',sync);
  document.addEventListener('change',e=>{
    if(e.target.id==='aranWindBooster'||e.target.id?.startsWith('aranWeaponType_')){save();sync();}
  });
  q('addCompare')?.addEventListener('click',()=>requestAnimationFrame(sync));
  document.querySelector('#weapons')?.addEventListener('click',()=>requestAnimationFrame(sync));
})();
</script>`;

function patchWeaponBreakEven(html){
  if(!html.includes('v22SpBreakEvenModel')){
    const scoreAnchor='const base=cur.score||1;';
    if(html.includes(scoreAnchor)){
      const dynamicScore=`const measuredAvgSp=Math.max(1,(n('calMin1')+n('calMax1')+n('calMin2')+n('calMax2'))/4),measuredAtk1=(cal.min+cal.max)/2;Object.values(ws).forEach(w=>{const attackDelta=w.attackIndex-cur.attackIndex;w.spAttackDelta=attackDelta*measuredAtk1;w.spBeforeMultipliers=Math.max(1,measuredAvgSp+w.spAttackDelta);const dmgRelative=(1+w.dmg/100)/(1+cur.dmg/100);w.spRelativeMult=(w.critMult||1)*dmgRelative;w.score=w.spBeforeMultipliers*w.spRelativeMult;});const base=cur.score||1;`;
      html=html.replace(scoreAnchor,dynamicScore);
    }

    const compareAnchor='compare.innerHTML=compareHtml;';
    if(html.includes(compareAnchor)){
      const breakEven=`const breakEvenItems=[['현재',ws.cur],...candidates];const breakEvenLines=[];const scoreAtSp=(w,s)=>Math.max(1,s+(w.attackIndex-cur.attackIndex)*measuredAtk1)*(w.spRelativeMult||1);for(let i=0;i<breakEvenItems.length;i++){for(let j=i+1;j<breakEvenItems.length;j++){const [ni,wi]=breakEvenItems[i],[nj,wj]=breakEvenItems[j];const di=(wi.attackIndex-cur.attackIndex)*measuredAtk1,dj=(wj.attackIndex-cur.attackIndex)*measuredAtk1,mi=wi.spRelativeMult||1,mj=wj.spRelativeMult||1,den=mi-mj;if(Math.abs(den)<1e-9)continue;const cross=(dj*mj-di*mi)/den;if(!Number.isFinite(cross)||cross<=0)continue;const above=Math.max(cross+Math.max(1000,cross*.02),cross*1.01),winnerAbove=scoreAtSp(wi,above)>=scoreAtSp(wj,above)?ni:nj,winnerBelow=scoreAtSp(wi,Math.max(1,cross*.8))>=scoreAtSp(wj,Math.max(1,cross*.8))?ni:nj;breakEvenLines.push('<b>'+ni+' ↔ '+nj+'</b>: 평균 스공 약 <b>'+Math.round(cross).toLocaleString()+'</b>에서 역전 · 이하 '+winnerBelow+' 우세 / 이상 '+winnerAbove+' 우세')}}if(breakEvenLines.length){compareHtml+='<br><br><b>현재 스공 기준 역전 예상</b><br><span class="small">기준 평균 스공 '+Math.round(measuredAvgSp).toLocaleString()+' · 공1당 평균 +'+measuredAtk1.toFixed(2)+'<br>'+breakEvenLines.join('<br>')+'<br>※ MIN/MAX 4개 실측값의 평균을 현재 스공 기준점으로 사용한 선형 추정입니다.</span>';}compare.innerHTML=compareHtml;`;
      html=html.replace(compareAnchor,breakEven);
    }

    html=html.replace(
      '<b>계산 전제</b><br>',
      '<b>계산 전제</b><br><span id="v22SpBreakEvenModel"><b>V2.2 DEV:</b> 공1 실측의 MIN/MAX 평균 스공을 현재 기준점으로 사용하고, 후보별 공격력 차이는 공1당 실측 상승량으로 환산한 뒤 크확·총데미지 상대배율을 적용합니다. 따라서 현재 스공이 높아질수록 %계열 옵션의 상대 가치가 커지며 매물 간 역전 예상 스공을 표시합니다.<br></span>'
    );
  }

  if(!html.includes('id="v22AranHuntingStyle"'))html=html.replace('</head>',ARAN_HUNTING_STYLE+'</head>');
  if(!html.includes('id="v22AranHuntingScript"'))html=html.replace('</body>',ARAN_HUNTING_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const weaponPath=url.pathname==='/'||url.pathname==='/index.html';
    if(!weaponPath) return response;
    let html=await response.text();
    html=patchWeaponBreakEven(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-weapon-model','sp-break-even-v22');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
