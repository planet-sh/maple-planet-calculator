import baseWorker from './worker-v2-release.js';

const GUIDE_HTML = `
<details class="details ui-guide" id="quickGuide" style="margin:12px 0 14px;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--panel)">
  <summary style="font-weight:800">처음이라면? 사용법 30초 보기</summary>
  <div class="small" style="margin-top:10px;line-height:1.8">
    <b>1.</b> 먼저 <b>초간단 / 일반 / 심화</b> 중 계산 방식을 선택합니다.<br>
    <b>2.</b> <b>초간단</b>은 깡공↔총뎀, <b>일반</b>은 대부분의 무기 매물, <b>심화</b>는 실측 기반 정밀 비교용입니다.<br>
    <b>3.</b> 일반/심화 계산에서는 사냥 환경과 필요한 버프를 설정한 뒤 현재 무기와 비교 매물을 입력합니다.<br>
    <b>4.</b> 레이팅 성장·도달일 계산은 필요할 때만 펼쳐서 사용하세요.
  </div>
</details>`;

const UI_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);

  function wrapCollapsible(targetId, detailsId, title, subtitle){
    const target=q(targetId);if(!target||q(detailsId))return;
    const details=document.createElement('details');
    details.id=detailsId;details.className='details ui-collapse';
    details.style.cssText='margin-top:14px;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--panel2)';
    const summary=document.createElement('summary');
    summary.style.cssText='font-weight:800;color:var(--text)';
    summary.innerHTML=title+(subtitle?' <span class="small" style="font-weight:400">· '+subtitle+'</span>':'');
    target.parentNode.insertBefore(details,target);details.appendChild(summary);details.appendChild(target);
    const heading=target.querySelector(':scope > h3');if(heading)heading.style.display='none';
  }

  wrapCollapsible('huntingBuffWrap','huntingBuffDetails','사냥 버프 설정','필요할 때만 변경');
  wrapCollapsible('ratingGrowthWrap','ratingGrowthDetails','레이팅 성장 / 도달일 계산','기본 접힘');

  const ratingDetails=q('ratingGrowthDetails');
  const ratingWrap=q('ratingGrowthWrap');
  if(ratingDetails&&ratingWrap){
    const syncRatingVisibility=()=>{ratingDetails.style.display=ratingWrap.style.display==='none'?'none':''};
    const observer=new MutationObserver(syncRatingVisibility);observer.observe(ratingWrap,{attributes:true,attributeFilter:['style']});syncRatingVisibility();
  }

  // 첫 진입 순서: 계산 방식 선택 → 설명/사용법 → 사냥 환경 → 실제 입력
  const modeSwitch=document.querySelector('.mode-switch');
  const modeDesc=q('modeDesc');
  const guide=q('quickGuide');
  const env=q('huntingEnvironment');
  if(modeSwitch&&env){
    const parent=modeSwitch.parentNode;
    const anchor=modeDesc||modeSwitch;
    if(guide)anchor.insertAdjacentElement('afterend',guide);
    const envAnchor=guide||anchor;
    envAnchor.insertAdjacentElement('afterend',env);
  }

  // 초간단은 사냥 환경이 핵심 계산 조건이 아니므로 시각적으로 부가 설정임을 표시
  function syncModeUi(){
    const quick=q('quickMode')?.classList.contains('active')||document.body.dataset.calcMode==='quick';
    if(env){
      env.classList.toggle('secondary-env',quick);
      const h2=env.querySelector('h2');
      if(h2)h2.innerHTML=quick?'사냥 환경 <span class="tag">부가 기능</span>':'사냥 환경 <span class="tag">V2.0 DEV</span>';
    }
  }
  ['quickMode','simpleMode','advancedMode'].forEach(id=>q(id)?.addEventListener('click',()=>setTimeout(syncModeUi,0)));
  syncModeUi();

  const topActions=document.querySelector('.top-actions');
  if(topActions&&!q('fontSizeControls')){
    const box=document.createElement('div');box.id='fontSizeControls';box.className='font-size-controls';box.setAttribute('aria-label','글씨 크기');
    box.innerHTML='<button type="button" data-font="small" title="글씨 작게">A−</button><button type="button" data-font="normal" title="기본 글씨">A</button><button type="button" data-font="large" title="글씨 크게">A+</button>';
    topActions.insertBefore(box,topActions.firstChild);
  }
  function setFontSize(size){
    if(!['small','normal','large'].includes(size))size='normal';
    document.body.dataset.fontSize=size;
    document.querySelectorAll('#fontSizeControls button').forEach(b=>b.classList.toggle('active',b.dataset.font===size));
    try{localStorage.setItem('planet-font-size',size)}catch(e){}
  }
  let saved='normal';try{saved=localStorage.getItem('planet-font-size')||'normal'}catch(e){}
  setFontSize(saved);
  q('fontSizeControls')?.addEventListener('click',e=>{const b=e.target.closest('button[data-font]');if(b)setFontSize(b.dataset.font)});

  function updateBuffSummary(){
    const details=q('huntingBuffDetails');if(!details)return;
    const s=q('sprinkleToggle')?.checked?'뿌리기 ON':'뿌리기 OFF';
    const e=q('heroEchoToggle')?.checked?'영메 ON':'영메 OFF';
    const summary=details.querySelector('summary');if(summary)summary.innerHTML='사냥 버프 설정 <span class="small" style="font-weight:400">· '+s+' / '+e+'</span>';
  }
  ['sprinkleToggle','heroEchoToggle'].forEach(id=>q(id)?.addEventListener('change',updateBuffSummary));updateBuffSummary();
})();
</script>`;

function patchUi(html){
  if(!html.includes('id="quickGuide"')){
    html=html.replace('<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택">','<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택">');
    html=html.replace('<div class="small mode-desc" id="modeDesc">',GUIDE_HTML+'<div class="small mode-desc" id="modeDesc">');
  }
  html=html.replace('</style>',`
.font-size-controls{display:flex;gap:4px;align-items:center;padding:3px;background:var(--panel);border:1px solid var(--line);border-radius:10px}
.font-size-controls button{width:auto;min-width:34px;padding:7px 8px;border-radius:7px;background:transparent;color:var(--muted);font-size:13px}
.font-size-controls button.active{background:var(--accent);color:var(--accentText)}
body[data-font-size="small"] .small{font-size:11px}body[data-font-size="small"] label,body[data-font-size="small"] table{font-size:12px}body[data-font-size="small"] input,body[data-font-size="small"] select,body[data-font-size="small"] button{font-size:14px}body[data-font-size="small"] h1{font-size:23px}body[data-font-size="small"] .metric b{font-size:18px}
body[data-font-size="large"] .small{font-size:14px}body[data-font-size="large"] label,body[data-font-size="large"] table{font-size:15px}body[data-font-size="large"] input,body[data-font-size="large"] select,body[data-font-size="large"] button{font-size:18px}body[data-font-size="large"] h1{font-size:30px}body[data-font-size="large"] .metric b{font-size:23px}body[data-font-size="large"] .winner{font-size:25px}
.ui-collapse>summary,.ui-guide>summary{list-style-position:inside}.ui-collapse[open]>summary,.ui-guide[open]>summary{margin-bottom:8px}
.secondary-env{opacity:.92}.secondary-env>h2{color:var(--muted)}
@media(max-width:760px){.topbar{flex-wrap:wrap}.top-actions{flex-wrap:wrap;justify-content:flex-end}.font-size-controls{order:-1}}
</style>`);
  html=html.replace('</body>',UI_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchUi(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};