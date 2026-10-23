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

/* Compact input UI: helper copy moves into tooltips, except representative skill guidance. */
.desktop-input-grid>.card>.small,
.desktop-input-grid>.card>.grid .small,
.desktop-input-grid>.card .weapon>.small,
.desktop-input-grid>.card .weapon label+input+.small,
.desktop-input-grid>.card .weapon label+select+.small{display:none!important}
.desktop-input-grid>.card .metric .small,
.desktop-input-grid>.card .check,
.desktop-input-grid>.card [id$="Preview"],
.desktop-input-grid>.card [id$="Hint"],
.desktop-input-grid .simple-only>.small,
#recoSkillAutoNote{display:block!important}
#jobNote{display:none!important}
#recoSkillAutoNote{margin-top:7px!important;color:var(--tagText)!important;font-weight:700}
.desktop-input-grid .simple-only>.small{margin-top:6px;color:var(--muted);line-height:1.55}

.field-help{display:inline-grid;place-items:center;width:17px;height:17px;margin-left:6px;padding:0;border:1px solid var(--line);border-radius:50%;background:var(--panel2);color:var(--muted);font-size:11px;font-weight:900;line-height:1;vertical-align:1px;cursor:help;position:relative;overflow:visible}
.field-help:hover,.field-help:focus,.field-help.open{color:var(--text);border-color:var(--accent);outline:none}
.field-help::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 9px);transform:translateX(-50%);width:max-content;max-width:min(360px,70vw);padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:var(--input);color:var(--text);font-size:12px;font-weight:500;line-height:1.55;text-align:left;white-space:normal;box-shadow:0 10px 28px rgba(0,0,0,.28);opacity:0;visibility:hidden;pointer-events:none;z-index:1000}
.field-help::before{content:'';position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);border:5px solid transparent;border-top-color:var(--line);opacity:0;visibility:hidden;z-index:1001}
.field-help:hover::after,.field-help:focus::after,.field-help.open::after,.field-help:hover::before,.field-help:focus::before,.field-help.open::before{opacity:1;visibility:visible}

.recommend-collapse{margin:16px 0;border:1px solid var(--line);border-radius:14px;background:var(--panel);overflow:hidden}.recommend-collapse>summary{padding:15px 17px;font-weight:850;cursor:pointer;list-style-position:inside}.recommend-collapse>summary:hover{background:var(--panel2)}.recommend-collapse[open]>summary{border-bottom:1px solid var(--line);background:var(--panel2)}.recommend-collapse>.card{margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}.recommend-summary-note{font-size:12px;font-weight:500;color:var(--muted);margin-left:5px}

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
@media(min-width:1680px){main{max-width:1680px!important}.desktop-input-grid{gap:20px}.card{padding:20px}}
@media(max-width:1179px){.desktop-input-grid{display:block}.desktop-input-grid>.card{margin:14px 0}}
@media(max-width:720px){.calc-purpose-head{display:block}.calc-purpose-head .small{text-align:left;margin-top:6px}.purpose-switch{grid-template-columns:1fr}.mode-switch{grid-template-columns:1fr 1fr!important}.field-help::after{left:auto;right:-8px;transform:none;max-width:280px}.field-help::before{left:auto;right:2px;transform:none}}
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

  Array.from(document.querySelectorAll('details,section.card,div')).forEach(el=>{
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(text.includes('처음이라면? 사용법 30초 보기')||text.includes('사용법 30초 보기')){
      const target=el.closest('details')||el.closest('section.card')||el;
      if(target&&target!==document.body&&target!==document.querySelector('main'))target.remove();
    }
  });

  if(!Array.from(field.options).some(o=>o.value==='boss')){const o=document.createElement('option');o.value='boss';o.textContent='보스';field.appendChild(o)}

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
    const boss=kind==='boss';document.body.dataset.combatPurpose=kind;
    document.querySelectorAll('.purpose-btn').forEach(b=>b.classList.toggle('active',b.dataset.purpose===kind));
    if(boss){if(field.value!=='boss'&&field.value!=='')lastHuntMode=field.value==='rating'?'rating':'normal';field.value='boss';details.style.display='none'}else{field.value=lastHuntMode||'normal';details.style.display=''}
    emitField();try{localStorage.setItem('planet-combat-purpose',kind)}catch(e){}
  }
  document.querySelectorAll('.purpose-btn').forEach(b=>b.addEventListener('click',()=>setPurpose(b.dataset.purpose)));
  field.addEventListener('change',()=>{if(document.body.dataset.combatPurpose!=='boss'&&field.value!=='boss')lastHuntMode=field.value});
  let saved='hunt';try{saved=localStorage.getItem('planet-combat-purpose')||'hunt'}catch(e){}setPurpose(saved==='boss'?'boss':'hunt');

  const desc=q('modeDesc');function updateModeCopy(){if(!desc)return;desc.innerHTML=advanced.classList.contains('active')?'<b>심화 계산</b> · 공1·주스탯 실측과 실전 스킬 비중까지 반영하는 정밀 비교입니다.':'<b>일반 계산</b> · 직업 프리셋과 대표 주력기 기준으로 대부분의 실매물을 빠르게 비교합니다.'}
  simple.addEventListener('click',()=>requestAnimationFrame(updateModeCopy));advanced.addEventListener('click',()=>requestAnimationFrame(updateModeCopy));updateModeCopy();

  function cardByTitle(prefix){return Array.from(document.querySelectorAll('main>section.card')).find(s=>(s.querySelector(':scope>h2')?.textContent||'').trim().startsWith(prefix))}
  const characterCard=cardByTitle('1. 캐릭터 / 장비'),atkCard=cardByTitle('2. 공1당 스공 효율 측정'),statCard=q('statCalSection'),pctCard=q('pctCalSection');
  if(characterCard&&atkCard&&!q('desktopInputGrid')){const grid=document.createElement('div');grid.id='desktopInputGrid';grid.className='desktop-input-grid';characterCard.parentNode.insertBefore(grid,characterCard);[characterCard,atkCard,statCard,pctCard].filter(Boolean).forEach(card=>grid.appendChild(card))}

  const fallbackTips={job:'직업 프리셋에 따라 기본 크리티컬 확률과 대표 주력기 수치가 자동 적용됩니다.',crit:'직업의 기본 크리티컬 확률입니다. 다른 상시 크확 효과가 있다면 직접 수정할 수 있습니다.',simpleSkillPct:'사냥에서 주로 사용하는 스킬의 1타당 데미지%입니다. 타수는 입력하지 않습니다.',advancedBaseSkillPct:'심화 계산에서 실전 스킬 비중을 끈 경우 사용할 대표 주력기의 1타당 데미지%입니다.',equipAtk:'무기와 공격력이 붙은 장비의 순수 공격력을 합산합니다. 잠재 깡공은 제외합니다.',buff:'혼테일·핑크빈·요괴대사 등 공격력 버프입니다. 버프 공격력은 공% 적용 대상에서 제외됩니다.',calAtk1:'첫 번째 테스트 장비의 공격력 수치입니다.',calAtk2:'두 번째 테스트 장비의 공격력 수치입니다.',calMin1:'측정 ① 상태의 MIN 스공입니다.',calMax1:'측정 ① 상태의 MAX 스공입니다.',calMin2:'측정 ② 상태의 MIN 스공입니다.',calMax2:'측정 ② 상태의 MAX 스공입니다.'};
  function cleanTip(text){return (text||'').replace(/\s+/g,' ').replace(/^※\s*/,'').trim()}
  function helperFor(label){const parent=label.parentElement;if(!parent)return '';const control=parent.querySelector('input,select');const own=Array.from(parent.querySelectorAll(':scope>.small')).filter(x=>x.id!=='recoSkillAutoNote').map(x=>cleanTip(x.textContent)).filter(Boolean).join(' ');return own||fallbackTips[control?.id]||''}
  q('desktopInputGrid')?.querySelectorAll('label').forEach(label=>{if(label.querySelector('.field-help'))return;const tip=helperFor(label);if(!tip)return;const help=document.createElement('button');help.type='button';help.className='field-help';help.textContent='?';help.dataset.tip=tip;help.setAttribute('aria-label','입력 도움말');help.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.querySelectorAll('.field-help.open').forEach(x=>{if(x!==help)x.classList.remove('open')});help.classList.toggle('open')});label.appendChild(help)});
  document.addEventListener('click',e=>{if(!e.target.closest('.field-help'))document.querySelectorAll('.field-help.open').forEach(x=>x.classList.remove('open'))});

  const reco=Array.from(document.querySelectorAll('section.card')).find(s=>s.id==='potentialRecommendCard'||s.classList.contains('common-recommend-card')||(s.textContent||'').includes('추천 TOP3'));
  if(reco&&!reco.closest('.recommend-collapse')){const wrap=document.createElement('details');wrap.className='recommend-collapse';wrap.id='potentialRecommendationDetails';const sum=document.createElement('summary');sum.innerHTML='무기 잠재 추천 <span class="recommend-summary-note">· 직업별 실전 추천 TOP3 보기</span>';reco.parentNode.insertBefore(wrap,reco);wrap.appendChild(sum);wrap.appendChild(reco)}
})();
</script>`;

function patchUx(html){
  html=html.replace("const ratingBoss=document.getElementById('fieldMode')?.value==='rating';", "const fieldModeValue=document.getElementById('fieldMode')?.value;const ratingBoss=fieldModeValue==='rating'||fieldModeValue==='boss';");
  html=html.replace('</head>',UX_STYLE+'</head>');html=html.replace('</body>',UX_SCRIPT+'</body>');return html;
}

export default {async fetch(request,env,ctx){const response=await baseWorker.fetch(request,env,ctx);const url=new URL(request.url);if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;const contentType=response.headers.get('content-type')||'';if(!contentType.includes('text/html'))return response;let html=await response.text();html=patchUx(html);const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');return new Response(html,{status:response.status,statusText:response.statusText,headers})}};
