import baseWorker from './worker-v2-1-spec-aranswing.js';

const UX_STYLE = `
<style>
.calc-purpose{margin:0 0 14px;padding:16px;background:linear-gradient(180deg,var(--panel),var(--panel2));border:1px solid var(--line);border-radius:16px}
.calc-purpose-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:12px}.calc-purpose-head h2{margin:0;font-size:18px}.calc-purpose-head .small{max-width:620px;text-align:right}
.purpose-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:5px;background:var(--input);border:1px solid var(--line);border-radius:12px}.purpose-btn{border:0;border-radius:9px;padding:13px 12px;font-weight:900;background:transparent;color:var(--muted);cursor:pointer}.purpose-btn.active{background:var(--accent);color:var(--accentText)}
.mode-switch{grid-template-columns:repeat(2,minmax(0,1fr))!important;margin-top:0!important}.mode-switch .mode-btn{font-weight:850}.mode-switch #quickMode{display:none!important}
#quickCompareSection{display:none!important}
#huntingEnvironment{margin:0!important;border:0!important;background:transparent!important;padding:0!important}
#huntingEnvironment>h2{display:none!important}
.castle-extra{margin:14px 0 18px;border:1px solid var(--line);border-radius:14px;background:var(--panel);overflow:hidden}.castle-extra>summary{padding:14px 16px;font-weight:850;cursor:pointer;list-style-position:inside}.castle-extra[open]>summary{border-bottom:1px solid var(--line);background:var(--panel2)}.castle-extra-body{padding:16px}
.card{box-shadow:0 6px 24px rgba(0,0,0,.08)}
.card>h2{font-size:19px;letter-spacing:-.02em}.card>h2::before{content:'';display:inline-block;width:4px;height:18px;border-radius:4px;background:var(--accent);vertical-align:-3px;margin-right:8px}
label{font-weight:700;color:var(--text)!important}.small{line-height:1.65}.metric{border:1px solid color-mix(in srgb,var(--line) 82%,transparent)}
.common-recommend-card{border-width:2px!important}.common-recommend-card>h2,.common-recommend-card .weapon-head h2{font-size:20px}
.reco-field-box{background:color-mix(in srgb,var(--panel2) 88%,var(--bg))!important}.reco-rank b{letter-spacing:-.02em}
#modeDesc{display:none!important}
.calc-section-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--accent);text-transform:uppercase;margin-bottom:4px}

/* Input-first UI: hide long helper copy, keep only live result / validation text */
.desktop-input-grid>.card>.small,
.desktop-input-grid>.card>.grid .small,
.desktop-input-grid>.card .weapon>.small,
.desktop-input-grid>.card .weapon label+input+.small,
.desktop-input-grid>.card .weapon label+select+.small{display:none!important}
.desktop-input-grid>.card .metric .small,
.desktop-input-grid>.card .check,
.desktop-input-grid>.card [id$="Preview"],
.desktop-input-grid>.card [id$="Hint"]{display:block!important}
#jobNote,#recoSkillAutoNote{display:none!important}

/* Desktop / ultrawide workspace */
@media(min-width:1180px){
  main{max-width:1540px!important;padding-left:28px!important;padding-right:28px!important}
  .desktop-input-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start;margin:14px 0 18px}
  .desktop-input-grid>.card{margin:0;height:100%}
  .desktop-input-grid>.card .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .desktop-input-grid>.advanced-only{align-self:stretch}
  .common-recommend-card{margin-top:18px!important}
  .reco-dual-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .weapons{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(min-width:1680px){
  main{max-width:1680px!important}
  .desktop-input-grid{gap:20px}
  .card{padding:20px}
}
@media(max-width:1179px){.desktop-input-grid{display:block}.desktop-input-grid>.card{margin:14px 0}}
@media(max-width:720px){.calc-purpose-head{display:block}.calc-purpose-head .small{text-align:left;margin-top:6px}.purpose-switch{grid-template-columns:1fr}.mode-switch{grid-template-columns:1fr 1fr!important}}
</style>`;

const UX_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const modeSwitch=document.querySelector('.mode-switch');
  const simple=q('simpleMode'),advanced=q('advancedMode'),quick=q('quickMode');
  const env=q('huntingEnvironment'),field=q('fieldMode');
  if(!modeSwitch||!simple||!advanced||!env||!field)return;

  quick?.remove();
  q('quickCompareSection')?.remove();
  if(document.body.dataset.calcMode==='quick'||(!simple.classList.contains('active')&&!advanced.classList.contains('active'))){simple.click()}
  simple.textContent='일반 계산';advanced.textContent='심화 계산';

  // Remove the old onboarding copy that references the deleted quick mode.
  Array.from(document.querySelectorAll('details,section.card,div')).forEach(el=>{
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(text.includes('처음이라면? 사용법 30초 보기')||text.includes('사용법 30초 보기')){
      const target=el.closest('details')||el.closest('section.card')||el;
      if(target&&target!==document.body&&target!==document.querySelector('main'))target.remove();
    }
  });

  if(!Array.from(field.options).some(o=>o.value==='boss')){
    const o=document.createElement('option');o.value='boss';o.textContent='보스';field.appendChild(o);
  }

  const purpose=document.createElement('section');purpose.className='calc-purpose';purpose.id='calcPurpose';
  purpose.innerHTML='<div class="calc-purpose-head"><div><div class="calc-section-kicker">STEP 1</div><h2>무엇을 비교하나요?</h2></div></div><div class="purpose-switch"><button type="button" class="purpose-btn active" data-purpose="hunt">사냥용 무기 비교</button><button type="button" class="purpose-btn" data-purpose="boss">보스용 무기 비교</button></div>';
  modeSwitch.parentNode.insertBefore(purpose,modeSwitch);

  const modeTitle=document.createElement('div');modeTitle.innerHTML='<div class="calc-section-kicker" style="margin-top:14px">STEP 2</div><div style="font-weight:850;margin-bottom:7px">계산 정밀도</div>';
  modeSwitch.parentNode.insertBefore(modeTitle,modeSwitch);

  const details=document.createElement('details');details.className='castle-extra';details.id='castleExtra';
  const summary=document.createElement('summary');summary.innerHTML='사자왕의 성벽 레이팅 추가 설정 <span class="small" style="font-weight:500">· 필요할 때만 펼치기</span>';
  const body=document.createElement('div');body.className='castle-extra-body';
  env.parentNode.insertBefore(details,env);details.appendChild(summary);details.appendChild(body);body.appendChild(env);

  const normalOpt=Array.from(field.options).find(o=>o.value==='normal');if(normalOpt)normalOpt.textContent='일반 사냥 · 레이팅 미적용';
  const ratingOpt=Array.from(field.options).find(o=>o.value==='rating');if(ratingOpt)ratingOpt.textContent='사자왕의 성벽 · 레이팅/보공 적용';
  const bossOpt=Array.from(field.options).find(o=>o.value==='boss');if(bossOpt)bossOpt.hidden=true;

  let lastHuntMode=field.value==='rating'?'rating':'normal';
  function emitField(){field.dispatchEvent(new Event('change',{bubbles:true}));field.dispatchEvent(new Event('input',{bubbles:true}))}
  function setPurpose(kind){
    const boss=kind==='boss';
    document.body.dataset.combatPurpose=kind;
    document.querySelectorAll('.purpose-btn').forEach(b=>b.classList.toggle('active',b.dataset.purpose===kind));
    if(boss){
      if(field.value!=='boss'&&field.value!=='')lastHuntMode=field.value==='rating'?'rating':'normal';
      field.value='boss';details.style.display='none';
    }else{
      field.value=lastHuntMode||'normal';details.style.display='';
    }
    emitField();
    try{localStorage.setItem('planet-combat-purpose',kind)}catch(e){}
  }
  document.querySelectorAll('.purpose-btn').forEach(b=>b.addEventListener('click',()=>setPurpose(b.dataset.purpose)));
  field.addEventListener('change',()=>{if(document.body.dataset.combatPurpose!=='boss'&&field.value!=='boss')lastHuntMode=field.value});

  let saved='hunt';try{saved=localStorage.getItem('planet-combat-purpose')||'hunt'}catch(e){}
  setPurpose(saved==='boss'?'boss':'hunt');

  const desc=q('modeDesc');
  function updateModeCopy(){if(!desc)return;desc.innerHTML=advanced.classList.contains('active')?'<b>심화 계산</b> · 공1·주스탯 실측과 실전 스킬 비중까지 반영하는 정밀 비교입니다.':'<b>일반 계산</b> · 직업 프리셋과 대표 주력기 기준으로 대부분의 실매물을 빠르게 비교합니다.'}
  simple.addEventListener('click',()=>requestAnimationFrame(updateModeCopy));advanced.addEventListener('click',()=>requestAnimationFrame(updateModeCopy));updateModeCopy();

  function cardByTitle(prefix){return Array.from(document.querySelectorAll('main>section.card')).find(s=>(s.querySelector(':scope>h2')?.textContent||'').trim().startsWith(prefix))}
  const characterCard=cardByTitle('1. 캐릭터 / 장비');
  const atkCard=cardByTitle('2. 공1당 스공 효율 측정');
  const statCard=q('statCalSection');
  const pctCard=q('pctCalSection');
  if(characterCard&&atkCard&&!q('desktopInputGrid')){
    const grid=document.createElement('div');grid.id='desktopInputGrid';grid.className='desktop-input-grid';
    characterCard.parentNode.insertBefore(grid,characterCard);
    [characterCard,atkCard,statCard,pctCard].filter(Boolean).forEach(card=>grid.appendChild(card));
  }
})();
</script>`;

function patchUx(html){
  html=html.replace("const ratingBoss=document.getElementById('fieldMode')?.value==='rating';", "const fieldModeValue=document.getElementById('fieldMode')?.value;const ratingBoss=fieldModeValue==='rating'||fieldModeValue==='boss';");
  html=html.replace('</head>',UX_STYLE+'</head>');
  html=html.replace('</body>',UX_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchUx(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
