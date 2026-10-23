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
          const m=x.match(/^(저스펙|중스펙|고스펙):\\s*(.*)$/);
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