import app from './worker-v2-2-direct-summary.js';

// V2.2 DEV - weapon comparison model
// Uses the measured current stat-attack level as the baseline, converts attack-index
// differences through the measured ATK1 efficiency, then applies crit/total-damage
// relative multipliers. This allows percentage-heavy weapons to overtake flat/ATK%
// weapons as the character's current stat-attack grows.

const ARAN_HUNTING_STYLE = `
<style id="v22AranHuntingStyle">
.v22-aran-weapon-field{margin-top:10px}
.v22-recommend-details{margin-top:14px;border:1px solid var(--line);border-radius:12px;background:var(--panel);overflow:hidden}
.v22-recommend-details>summary{padding:12px 14px;font-weight:800;cursor:pointer;color:var(--text)}
.v22-recommend-details>#potentialRecommendCard{margin:0;border:0;border-top:1px solid var(--line);border-radius:0}
.v22-aran-speed-result{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
.v22-aran-speed-result h3{margin:0 0 10px;font-size:16px}
.v22-aran-speed-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px}
.v22-aran-speed-toggle{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--input);cursor:pointer;margin:0}
.v22-aran-speed-toggle input{width:auto;margin:0;transform:scale(1.15)}
.v22-aran-speed-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:10px}
.v22-aran-speed-item{padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--input)}
.v22-aran-speed-item b{display:block;margin-bottom:4px}
.v22-aran-speed-winner{margin-top:10px;font-weight:800;color:var(--good)}
.v22-aran-speed-note{margin-top:9px;font-size:12px;line-height:1.65;color:var(--muted)}
.v22-aran-muted{opacity:.58}
@media(max-width:760px){.v22-aran-speed-controls{grid-template-columns:1fr}}
</style>`;

const ARAN_HUNTING_SCRIPT = `
<script id="v22AranHuntingScript">
(()=>{
  const q=id=>document.getElementById(id);
  const job=q('job');
  if(!job)return;
  const ARAN_VALUE='아란 (풀콤보 기준)';
  const STORAGE_KEY='planet-v22-aran-hunting-ui-v2';
  const weaponIds=['cur','a','b','c'];
  const weaponNames={cur:'현재',a:'매물 A',b:'매물 B',c:'매물 C'};

  function renameAranDisplay(){
    const opt=Array.from(job.options).find(o=>o.value===ARAN_VALUE);
    if(opt&&opt.textContent!=='아란 (사냥 기준)')opt.textContent='아란 (사냥 기준)';
    const recoJob=q('recoCommonJob');
    if(recoJob){
      const ropt=Array.from(recoJob.options).find(o=>o.value===ARAN_VALUE);
      if(ropt&&ropt.textContent!=='아란 (사냥 기준)')ropt.textContent='아란 (사냥 기준)';
    }
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

  function addResultPanel(){
    const result=q('result'),compare=q('compare');
    if(!result||!compare||q('v22AranSpeedResult'))return;
    const panel=document.createElement('div');
    panel.id='v22AranSpeedResult';
    panel.className='v22-aran-speed-result';
    panel.innerHTML='<h3>아란 공속 보정 비교</h3>'+
      '<div class="v22-aran-speed-controls">'+
        '<label class="v22-aran-speed-toggle"><input id="aranSpeedCorrection" type="checkbox" checked><span><b>공속 보정 ON</b><br><span class="small">OFF 시 기존 공격력·잠재 비교 결과 그대로</span></span></label>'+
        '<label class="v22-aran-speed-toggle" id="aranWindBoosterLabel"><input id="aranWindBooster" type="checkbox"><span><b>윈드부스터 ON</b><br><span class="small">디에스(핼버드)와 비교할 때만 의미가 있습니다.</span></span></label>'+
      '</div>'+
      '<div id="v22AranSpeedSummary" class="small"></div>'+
      '<div id="v22AranSpeedGrid" class="v22-aran-speed-grid"></div>'+
      '<div id="v22AranSpeedWinner" class="v22-aran-speed-winner"></div>'+
      '<div class="v22-aran-speed-note"><b>1차 추정 공속 배율</b> · 윈부 OFF: 보핑 ×1.263 / 디에스 ×1.000 · 윈부 ON: 보핑 ×1.105 / 디에스 ×1.000<br>※ 순수 공격속도에 따른 공격 횟수 차이만 반영합니다. 콤보 수급 속도 및 콤보 템페스트 사이클 변화는 제외합니다. 기타 무기는 공속 보정을 적용하지 않습니다.</div>';
    compare.insertAdjacentElement('afterend',panel);
  }

  function isAran(){return job.value===ARAN_VALUE}
  function visibleWeapon(id){const card=q(id+'Card');return !!card&&!card.classList.contains('hidden')}
  function typeOf(id){return q('aranWeaponType_'+id)?.value||'other'}
  function typeLabel(type){return type==='bopping'?'보핑':type==='ds'?'디에스(핼버드)':'기타'}
  function anyDs(){return weaponIds.some(id=>visibleWeapon(id)&&typeOf(id)==='ds')}

  function speedMultiplier(id){
    if(!q('aranSpeedCorrection')?.checked)return 1;
    const type=typeOf(id);
    if(type==='bopping')return q('aranWindBooster')?.checked?1.105:1.263;
    return 1;
  }

  function metricRelative(name){
    if(name==='현재')return 100;
    const metrics=Array.from(document.querySelectorAll('#metrics .metric'));
    const target=metrics.find(el=>(el.textContent||'').trim().startsWith(name));
    if(!target)return null;
    const b=target.querySelector('b');
    const m=(b?.textContent||'').match(/(-?[0-9.]+)%/);
    return m?parseFloat(m[1]):null;
  }

  function renderSpeedResult(){
    const panel=q('v22AranSpeedResult');
    if(!panel)return;
    const show=isAran()&&q('result')?.style.display!=='none';
    panel.style.display=show?'':'none';
    if(!show)return;

    const speedOn=!!q('aranSpeedCorrection')?.checked;
    const wb=!!q('aranWindBooster')?.checked;
    const wbLabel=q('aranWindBoosterLabel');
    if(wbLabel)wbLabel.classList.toggle('v22-aran-muted',!anyDs());

    const currentMult=speedMultiplier('cur')||1;
    const rows=[];
    let best={id:'cur',value:100};
    weaponIds.forEach(id=>{
      if(id!=='cur'&&!visibleWeapon(id))return;
      const name=weaponNames[id];
      const raw=metricRelative(name);
      if(raw===null)return;
      const mult=speedMultiplier(id);
      const adjusted=raw*(mult/currentMult);
      if(adjusted>best.value)best={id,value:adjusted};
      rows.push('<div class="v22-aran-speed-item"><b>'+name+' · '+typeLabel(typeOf(id))+'</b><span class="small">공속 무보정 '+raw.toFixed(2)+'%<br>적용 배율 ×'+mult.toFixed(3)+'<br><strong>공속 반영 '+adjusted.toFixed(2)+'%</strong></span></div>');
    });

    q('v22AranSpeedSummary').innerHTML=speedOn
      ?'공속 보정 <b>ON</b> · 윈드부스터 <b>'+(wb?'ON':'OFF')+'</b> · 현재 무기의 공속 배율을 100% 기준으로 상대 환산합니다.'
      :'공속 보정 <b>OFF</b> · 기존 공격력 / 공% / 총데미지 / 크확 비교값만 표시합니다.';
    q('v22AranSpeedGrid').innerHTML=rows.join('');
    const bestName=weaponNames[best.id];
    q('v22AranSpeedWinner').textContent=speedOn?'공속 보정 반영 최종 우세: '+bestName+' · '+best.value.toFixed(2)+'%':'공속 보정 OFF · 기존 비교 결과를 사용합니다.';
  }

  function sync(){
    renameAranDisplay();
    const on=isAran();
    document.querySelectorAll('[data-aran-weapon-field="1"]').forEach(el=>{el.style.display=on?'':'none'});
    const panel=q('v22AranSpeedResult');
    if(panel&&!on)panel.style.display='none';
    renderSpeedResult();
  }

  function save(){
    try{
      const data={speedCorrection:!!q('aranSpeedCorrection')?.checked,windBooster:!!q('aranWindBooster')?.checked,weapons:{}};
      weaponIds.forEach(id=>{data.weapons[id]=typeOf(id)});
      localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
    }catch(e){}
  }

  function restore(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
      const data=JSON.parse(raw);
      if(q('aranSpeedCorrection')&&typeof data.speedCorrection==='boolean')q('aranSpeedCorrection').checked=data.speedCorrection;
      if(q('aranWindBooster')&&typeof data.windBooster==='boolean')q('aranWindBooster').checked=data.windBooster;
      weaponIds.forEach(id=>{
        const el=q('aranWeaponType_'+id),v=data.weapons?.[id];
        if(el&&['bopping','ds','other'].includes(v))el.value=v;
      });
    }catch(e){}
  }

  renameAranDisplay();
  addWeaponSelectors();
  wrapRecommendation();
  addResultPanel();
  restore();
  sync();

  job.addEventListener('change',sync);
  document.addEventListener('change',e=>{
    if(e.target.id==='aranSpeedCorrection'||e.target.id==='aranWindBooster'||e.target.id?.startsWith('aranWeaponType_')){save();renderSpeedResult();}
  });
  q('calc')?.addEventListener('click',()=>setTimeout(renderSpeedResult,0));
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
