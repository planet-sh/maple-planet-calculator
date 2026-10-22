import baseWorker from './worker-v2-1-release.js';

const COMMON_RECO_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const card=q('potentialRecommendCard');
  const job=q('job');
  const modeSwitch=document.querySelector('.mode-switch');
  if(!card||!job||!modeSwitch)return;

  // 모드 선택 바로 아래에 공통 추천 영역 배치
  const modeCard=modeSwitch.closest('section.card');
  if(modeCard&&card.previousElementSibling!==modeCard)modeCard.insertAdjacentElement('afterend',card);
  card.classList.add('common-recommend-card');

  // 초간단에서도 직업을 바로 고를 수 있도록 공통 직업 선택 추가
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
    commonJob.innerHTML=Array.from(job.options).map(o=>'<option value="'+o.value.replace(/"/g,'&quot;')+'">'+o.textContent+'</option>').join('');
    commonJob.value=current;
  }
  syncJobOptions();

  commonJob?.addEventListener('change',()=>{
    if(job.value===commonJob.value)return;
    job.value=commonJob.value;
    job.dispatchEvent(new Event('change',{bubbles:true}));
  });
  job.addEventListener('change',()=>{if(commonJob)commonJob.value=job.value});

  // 저/중/고스펙 흐름을 한눈에 읽히게 3칸 요약으로 보조 표시
  if(!q('recoTierFlow')){
    const flow=q('recoFlow');
    if(flow){
      const tier=document.createElement('div');
      tier.id='recoTierFlow';
      tier.className='reco-tier-flow';
      flow.insertAdjacentElement('afterend',tier);
      const paint=()=>{
        const parts=(flow.textContent||'').split(' · ').filter(Boolean);
        tier.innerHTML=parts.map(x=>{
          const m=x.match(/^(저스펙|중스펙|고스펙):\s*(.*)$/);
          return m?'<div class="metric"><span class="small">'+m[1]+'</span><b>'+m[2]+'</b></div>':'';
        }).join('');
      };
      const obs=new MutationObserver(paint);obs.observe(flow,{childList:true,characterData:true,subtree:true});paint();
    }
  }

  // 초간단에서는 일반/심화 실측값을 전제로 하는 영역을 숨김
  const breakpointDetails=Array.from(card.querySelectorAll('details')).find(d=>(d.querySelector('summary')?.textContent||'').includes('잠재 역전표'));
  function syncQuickRecoUi(){
    const quick=q('quickMode')?.classList.contains('active')||document.body.dataset.calcMode==='quick';
    if(breakpointDetails)breakpointDetails.style.display=quick?'none':'';
  }
  ['quickMode','simpleMode','advancedMode'].forEach(id=>q(id)?.addEventListener('click',()=>setTimeout(syncQuickRecoUi,0)));
  const bodyObs=new MutationObserver(syncQuickRecoUi);bodyObs.observe(document.body,{attributes:true,attributeFilter:['data-calc-mode']});
  syncQuickRecoUi();
})();
</script>`;

function patchCommonReco(html){
  html=html.replace('</style>',`\nbody[data-calc-mode="quick"] main>#potentialRecommendCard{display:block!important}\nbody[data-calc-mode="quick"] #recoMeasured{display:none!important}\nbody[data-calc-mode="quick"] .weapon:has(#recoBaseTop){grid-column:1/-1}\n.common-recommend-card{display:block}\n.reco-tier-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}\n.reco-tier-flow .metric b{font-size:14px;line-height:1.45}\n@media(max-width:720px){.reco-tier-flow{grid-template-columns:1fr}}\n</style>`);
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