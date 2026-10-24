import app from './worker-v2-2-direct-summary.js';

// V2.2 DEV - weapon comparison model
// Uses the measured current stat-attack level as the baseline, converts attack-index
// differences through the measured ATK1 efficiency, then applies crit/total-damage
// relative multipliers. This allows percentage-heavy weapons to overtake flat/ATK%
// weapons as the character's current stat-attack grows.

function patchWeaponBreakEven(html){
  if(html.includes('v22SpBreakEvenModel')) return html;

  const scoreAnchor='const base=cur.score||1;';
  if(!html.includes(scoreAnchor)) return html;

  const dynamicScore=`const measuredAvgSp=Math.max(1,(n('calMin1')+n('calMax1')+n('calMin2')+n('calMax2'))/4),measuredAtk1=(cal.min+cal.max)/2;Object.values(ws).forEach(w=>{const attackDelta=w.attackIndex-cur.attackIndex;w.spAttackDelta=attackDelta*measuredAtk1;w.spBeforeMultipliers=Math.max(1,measuredAvgSp+w.spAttackDelta);const dmgRelative=(1+w.dmg/100)/(1+cur.dmg/100);w.spRelativeMult=(w.critMult||1)*dmgRelative;w.score=w.spBeforeMultipliers*w.spRelativeMult;});const base=cur.score||1;`;
  html=html.replace(scoreAnchor,dynamicScore);

  const compareAnchor='compare.innerHTML=compareHtml;';
  if(html.includes(compareAnchor)){
    const breakEven=`const breakEvenItems=[['현재',ws.cur],...candidates];const breakEvenLines=[];const scoreAtSp=(w,s)=>Math.max(1,s+(w.attackIndex-cur.attackIndex)*measuredAtk1)*(w.spRelativeMult||1);for(let i=0;i<breakEvenItems.length;i++){for(let j=i+1;j<breakEvenItems.length;j++){const [ni,wi]=breakEvenItems[i],[nj,wj]=breakEvenItems[j];const di=(wi.attackIndex-cur.attackIndex)*measuredAtk1,dj=(wj.attackIndex-cur.attackIndex)*measuredAtk1,mi=wi.spRelativeMult||1,mj=wj.spRelativeMult||1,den=mi-mj;if(Math.abs(den)<1e-9)continue;const cross=(dj*mj-di*mi)/den;if(!Number.isFinite(cross)||cross<=0)continue;const above=Math.max(cross+Math.max(1000,cross*.02),cross*1.01),winnerAbove=scoreAtSp(wi,above)>=scoreAtSp(wj,above)?ni:nj,winnerBelow=scoreAtSp(wi,Math.max(1,cross*.8))>=scoreAtSp(wj,Math.max(1,cross*.8))?ni:nj;breakEvenLines.push('<b>'+ni+' ↔ '+nj+'</b>: 평균 스공 약 <b>'+Math.round(cross).toLocaleString()+'</b>에서 역전 · 이하 '+winnerBelow+' 우세 / 이상 '+winnerAbove+' 우세')}}if(breakEvenLines.length){compareHtml+='<br><br><b>현재 스공 기준 역전 예상</b><br><span class="small">기준 평균 스공 '+Math.round(measuredAvgSp).toLocaleString()+' · 공1당 평균 +'+measuredAtk1.toFixed(2)+'<br>'+breakEvenLines.join('<br>')+'<br>※ MIN/MAX 4개 실측값의 평균을 현재 스공 기준점으로 사용한 선형 추정입니다.</span>';}compare.innerHTML=compareHtml;`;
    html=html.replace(compareAnchor,breakEven);
  }

  // Explain the new model in the assumptions block without changing legacy inputs.
  html=html.replace(
    '<b>계산 전제</b><br>',
    '<b>계산 전제</b><br><span id="v22SpBreakEvenModel"><b>V2.2 DEV:</b> 공1 실측의 MIN/MAX 평균 스공을 현재 기준점으로 사용하고, 후보별 공격력 차이는 공1당 실측 상승량으로 환산한 뒤 크확·총데미지 상대배율을 적용합니다. 따라서 현재 스공이 높아질수록 %계열 옵션의 상대 가치가 커지며 매물 간 역전 예상 스공을 표시합니다.<br></span>'
  );
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
