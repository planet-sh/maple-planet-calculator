import baseWorker from './worker-v2-1-release.js';

const COMMON_RECO_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const card=q('potentialRecommendCard');
  const job=q('job');
  const modeSwitch=document.querySelector('.mode-switch');
  if(!card||!job||!modeSwitch)return;

  const modeCard=modeSwitch.closest('section.card');
  if(modeCard&&card.previousElementSibling!==modeCard)modeCard.insertAdjacentElement('afterend',card);
  card.classList.add('common-recommend-card');

  if(!q('recoCommonJob')){
    const wrap=document.createElement('div');
    wrap.id='recoCommonJobWrap';
    wrap.className='grid reco-common-job';
    wrap.style.marginTop='10px';
    wrap.innerHTML='<div><label>추천 직업</label><select id="recoCommonJob"></select><div class="small">초간단·일반·심화 공통 추천 기준입니다. 일반/심화의 직업 선택과 자동 동기화됩니다.</div></div>';
    const firstGrid=card.querySelector('.grid');
    if(firstGrid)card.insertBefore(wrap,firstGrid);else card.prepend(wrap);
  }

  const commonJob=q('recoCommonJob');
  function syncJobOptions(){
    if(!commonJob)return;
    const current=job.value;
    const html=Array.from(job.options).map(o=>'<option value="'+o.value.replace(/"/g,'&quot;')+'">'+o.textContent+'</option>').join('');
    if(commonJob.innerHTML!==html)commonJob.innerHTML=html;
    if(commonJob.value!==current)commonJob.value=current;
  }
  syncJobOptions();

  commonJob?.addEventListener('change',()=>{
    if(job.value===commonJob.value)return;
    job.value=commonJob.value;
    job.dispatchEvent(new Event('change',{bubbles:true}));
  });
  job.addEventListener('change',()=>{if(commonJob&&commonJob.value!==job.value)commonJob.value=job.value});

  if(!q('recoTierFlow')){
    const flow=q('recoFlow');
    if(flow){
      const tier=document.createElement('div');
      tier.id='recoTierFlow';
      tier.className='reco-tier-flow';
      flow.insertAdjacentElement('afterend',tier);
      let paintRaf=0;
      let lastText='';
      const paint=()=>{
        paintRaf=0;
        const text=flow.textContent||'';
        if(text===lastText)return;
        lastText=text;
        const parts=text.split(' · ').filter(Boolean);
        const html=parts.map(x=>{
          const m=x.match(/^(저스펙|중스펙|고스펙):\s*(.*)$/);
          return m?'<div class="metric"><span class="small">'+m[1]+'</span><b>'+m[2]+'</b></div>':'';
        }).join('');
        if(tier.innerHTML!==html)tier.innerHTML=html;
      };
      const schedulePaint=()=>{
        if(paintRaf)return;
        paintRaf=requestAnimationFrame(paint);
      };
      const obs=new MutationObserver(schedulePaint);
      obs.observe(flow,{childList:true,characterData:true,subtree:true});
      paint();
    }
  }

  if(!q('recoOffMetaNote')){
    const note=document.createElement('div');
    note.id='recoOffMetaNote';
    note.className='small reco-offmeta-note';
    note.innerHTML='※ TOP3는 <b>정옵 조합 기준 추천</b>입니다. 총뎀18%·크확8% 등 이탈옵이 포함된 실제 매물은 현재 스펙에 따라 효율이 달라질 수 있으므로, <b>매물간 비교 기능으로 직접 비교</b>하는 것을 권장합니다.';
    const measured=q('recoMeasured');
    if(measured)measured.insertAdjacentElement('afterend',note);else card.appendChild(note);
  }

  const breakpointDetails=Array.from(card.querySelectorAll('details')).find(d=>(d.querySelector('summary')?.textContent||'').includes('잠재 역전표'));
  let lastQuick=null;
  function syncQuickRecoUi(){
    const quick=q('quickMode')?.classList.contains('active')||document.body.dataset.calcMode==='quick';
    if(quick===lastQuick)return;
    lastQuick=quick;
    if(breakpointDetails)breakpointDetails.style.display=quick?'none':'';
  }
  const bodyObs=new MutationObserver(syncQuickRecoUi);
  bodyObs.observe(document.body,{attributes:true,attributeFilter:['data-calc-mode']});
  syncQuickRecoUi();

  // UX 레이어가 추천 영역을 details 토글로 감싼 뒤, 첫 진입은 항상 접힘 상태로 시작합니다.
  function collapseRecommendationOnce(){
    const details=q('potentialRecommendationDetails');
    if(!details)return false;
    details.open=false;
    details.removeAttribute('open');
    return true;
  }
  if(!collapseRecommendationOnce()){
    const collapseObserver=new MutationObserver(()=>{
      if(collapseRecommendationOnce())collapseObserver.disconnect();
    });
    collapseObserver.observe(document.body,{childList:true,subtree:true});
  }

  // V2.2에서 중복 업데이트 카드를 정리하더라도 오류 제보 / YouTube / FAQ는 유지합니다.
  const supportHtml='<section class="card" id="projectHub"><h2>업데이트 · 문의</h2><div class="grid"><div class="weapon"><h3>🛠️ 오류 제보 · 건의사항</h3><div class="small" style="margin-top:8px;line-height:1.8">계산 오류, 직업 스킬 수치 제보, UI 개선, 신규 기능 요청을 받고 있습니다.<br>재현 가능한 경우 <b>직업 / 현재 무기 / 비교 매물 / 입력값 / 결과 화면</b>을 함께 남겨주세요.</div><a href="https://github.com/planet-sh/maple-planet-calculator/issues/new" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--accent);color:var(--accentText);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">GitHub로 오류·건의 제보</a><div class="small" style="margin-top:8px">GitHub 이용이 어려우면 아래 유튜브 채널 댓글로 남겨주셔도 됩니다.</div></div><div class="weapon"><h3>📺 유튜브 / 보조 문의 채널</h3><div class="small" style="margin-top:8px;line-height:1.8">계산기 업데이트 안내, 계산 예시, 메이플 플래닛 관련 영상은 유튜브 채널에서 확인할 수 있습니다.</div><a href="https://www.youtube.com/@planet_sh/featured" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--panel);color:var(--tagText);border:1px solid var(--line);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">플래닛 공대장 서현 YouTube</a></div></div><div class="weapon" style="margin-top:12px"><h3>❓ FAQ · 공지</h3><details class="details" open><summary>일반 계산기와 심화 계산기의 차이는?</summary><div class="small" style="margin-top:8px;line-height:1.7">일반 계산기는 대표 주력기와 직업 프리셋을 사용합니다. 심화 계산기는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고, 필요할 때 <b>실전 스킬 비중·DPS 반영</b>을 켜 더 정밀하게 계산할 수 있습니다.</div></details><details class="details"><summary>무기에 붙은 기본 주스탯은 어떻게 계산하나요?</summary><div class="small" style="margin-top:8px;line-height:1.7">각 무기의 기본 주스탯은 잠재의 깡 주스탯과 합산해 반영합니다. 일반 계산은 러프 환산을 사용하고, 심화 계산은 직접 측정한 주스탯 1당 스공 효율을 사용합니다.</div></details><details class="details"><summary>크리티컬 데미지는 어떻게 계산하나요?</summary><div class="small" style="margin-top:8px;line-height:1.7">현재 계산기는 크리티컬 데미지 수치가 <b>각 타격의 스킬 데미지%에 +%p로 더해지는 방식</b>을 기준으로 계산합니다.</div></details><details class="details"><summary>심화 계산기의 실전 딜량은 어떻게 쓰나요?</summary><div class="small" style="margin-top:8px;line-height:1.7"><b>실전 스킬 비중·DPS 반영</b>을 켠 뒤 동일 사냥터에서 측정한 스킬별 DPS 또는 누적 딜량을 입력하면, 각 스킬이 실제 사냥딜에서 차지한 비중 계산에 사용합니다.</div></details><details class="details"><summary>계산값이 실제 사냥 딜과 완전히 같나요?</summary><div class="small" style="margin-top:8px;line-height:1.7">아닙니다. 장비 후보 간 상대 효율을 비교하기 위한 도구이며, 몬스터 이동·젠 손실·공격 실패·버프 공백 등 실제 전투 요소에 따라 차이가 날 수 있습니다.</div></details><details class="details"><summary>올스탯% 잠재는 어떻게 계산하나요?</summary><div class="small" style="margin-top:8px;line-height:1.7">올스탯% 잠재는 현재 계산에서 <b>동일 수치의 주스탯%</b>로 환산하며 부스탯 상승분은 반영하지 않습니다.</div></details><details class="details"><summary>계산식이나 스킬 수치가 틀린 것 같아요.</summary><div class="small" style="margin-top:8px;line-height:1.7">오류 제보에 근거 자료와 함께 남겨주세요. 확인 후 dev Preview에서 먼저 검증하고 production에 반영합니다.</div></details></div></section>';
  function ensureSupportHub(){
    if(q('projectHub'))return;
    const main=document.querySelector('main');if(!main)return;
    const temp=document.createElement('div');temp.innerHTML=supportHtml;
    const hub=temp.firstElementChild;
    const history=q('releaseHistory');
    if(history)history.parentNode.insertBefore(hub,history);else main.appendChild(hub);
  }
  const supportObserver=new MutationObserver(()=>requestAnimationFrame(ensureSupportHub));
  supportObserver.observe(document.body,{childList:true,subtree:true});
  requestAnimationFrame(ensureSupportHub);
})();
</script>`;

function patchCommonReco(html){
  html=html.replace('</style>',`\nbody[data-calc-mode="quick"] main>#potentialRecommendCard{display:block!important}\nbody[data-calc-mode="quick"] #recoMeasured{display:none!important}\nbody[data-calc-mode="quick"] .weapon:has(#recoBaseTop){grid-column:1/-1}\n.common-recommend-card{display:block}\n.reco-tier-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}\n.reco-tier-flow .metric b{font-size:14px;line-height:1.45}\n.reco-offmeta-note{margin-top:10px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel2)}\n@media(max-width:720px){.reco-tier-flow{grid-template-columns:1fr}}\n</style>`);
  html=html.replace('</body>',COMMON_RECO_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchCommonReco(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};