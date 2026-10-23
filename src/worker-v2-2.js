import legacyApp from './worker-captain-deductions.js';
import { validateHtml, regressionHeader } from './v2-2/regression.js';

// V2.2 migration entrypoint.
// V2.1 workers below this file are treated as frozen compatibility code.
// New V2.2 behavior belongs here (or in ./v2-2 modules), not in another
// compatibility worker.

const COMMON_SHELL_STYLE = `
<style id="v22CommonShellStyle">
.v22-tool-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin:0 0 18px;width:100%}
.v22-tool-nav a{text-align:center;text-decoration:none;padding:12px 8px;border-radius:10px;color:var(--muted);font-weight:800;min-width:0}
.v22-tool-nav a.active{background:var(--accent);color:var(--accentText)}
.v22-boss-note{margin-top:8px;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--input);font-size:12px;line-height:1.55;color:var(--muted)}
.v22-boss-note.applied{color:var(--good)}
.v22-boss-note.ignored{color:var(--warn)}
#releaseHistory .release-history-body{padding:16px 18px}
#releaseHistory .release-version{padding:12px 0;border-bottom:1px solid var(--line)}
#releaseHistory .release-version:last-child{border-bottom:0}
#releaseHistory .release-version b{color:var(--tagText)}
#releaseHistory .release-version .small{margin-top:5px;line-height:1.75}
@media(min-width:1180px){main{max-width:1540px!important;padding-left:28px!important;padding-right:28px!important}}
@media(min-width:1680px){main{max-width:1680px!important}}
@media(max-width:720px){.v22-tool-nav a{font-size:13px;padding:11px 4px}}
</style>`;

const WEAPON_FLOW_SCRIPT = `
<script id="v22WeaponFlowScript">
(()=>{
  const q=id=>document.getElementById(id);
  const inputGrid=q('desktopInputGrid');
  const advancedGrid=q('desktopAdvancedGrid');
  const skillMix=q('skillMixSection');
  const weaponCard=q('weaponSectionTitle')?.closest('section.card');
  const calc=q('calc');
  if(!inputGrid||!weaponCard||!calc)return;

  function placeAfter(anchor,node){
    if(!anchor||!node||anchor===node)return anchor;
    anchor.insertAdjacentElement('afterend',node);
    return node;
  }

  function normalizeFlow(){
    const advanced=document.body.dataset.calcMode==='advanced';
    let anchor=inputGrid;
    if(advanced){
      if(advancedGrid)anchor=placeAfter(anchor,advancedGrid);
      if(skillMix)anchor=placeAfter(anchor,skillMix);
      anchor=placeAfter(anchor,weaponCard);
    }else{
      anchor=placeAfter(anchor,weaponCard);
    }
    anchor=placeAfter(anchor,calc);
    const result=q('result');
    if(result)placeAfter(anchor,result);
  }

  q('simpleMode')?.addEventListener('click',()=>requestAnimationFrame(normalizeFlow));
  q('advancedMode')?.addEventListener('click',()=>requestAnimationFrame(normalizeFlow));
  new MutationObserver(normalizeFlow).observe(document.body,{attributes:true,attributeFilter:['data-calc-mode']});
  normalizeFlow();
})();
</script>`;

const WEAPON_V22_UI_SCRIPT = `
<script id="v22WeaponUiScript">
(()=>{
  const q=id=>document.getElementById(id);
  const weaponIds=['cur','a','b','c'];

  function annotateBossOptions(){
    document.querySelectorAll('select option').forEach(o=>{
      const t=(o.textContent||'').trim();
      if(/^보스 공격력 \\+\\d+%$/.test(t))o.textContent=t+' · 보공 적용 몬스터 전용';
    });
  }

  function bossAmountFromSelect(select){
    const text=(select?.selectedOptions?.[0]?.textContent||'');
    const m=text.match(/보스 공격력 \\+(\\d+)%/);
    return m?Number(m[1]):0;
  }

  function totalDamageFromSelect(select){
    const text=(select?.selectedOptions?.[0]?.textContent||'');
    const m=text.match(/총데미지 \\+(\\d+)%/);
    return m?Number(m[1]):0;
  }

  function syncAutoTotalDamage(){
    weaponIds.forEach(id=>{
      const input=q(id+'Dmg');
      if(!input)return;
      let total=0;
      for(let k=1;k<=3;k++)total+=totalDamageFromSelect(q(id+'O'+k));
      const next=String(total);
      if(input.value!==next){
        input.value=next;
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
      input.type='hidden';
      const label=input.previousElementSibling;
      if(label&&label.tagName==='LABEL'&&(label.textContent||'').includes('총데미지'))label.style.display='none';
    });

    const card=q('weaponSectionTitle')?.closest('section.card');
    if(card){
      const note=Array.from(card.querySelectorAll(':scope>.small')).find(el=>(el.textContent||'').includes('총데미지는 각 무기를 착용했을 때'));
      if(note)note.innerHTML='총데미지는 <b>무기 잠재에서 선택한 총데미지 +6% / +9%</b>를 자동 합산해 반영합니다. 별도 입력은 필요하지 않습니다.<br>※ <b>무기 순수 공격력을 입력하지 않은 매물은 계산 결과에서 제외</b>됩니다. 가격은 억 메소 단위이며 현재 무기는 가격을 입력하지 않습니다.';
    }
  }

  function bossApplies(){
    const field=q('fieldMode')?.value;
    return document.body.dataset.combatPurpose==='boss'||field==='rating'||field==='boss';
  }

  function updateBossNotes(){
    const applies=bossApplies();
    document.querySelectorAll('.weapon').forEach(card=>{
      const selects=Array.from(card.querySelectorAll('select'));
      if(!selects.some(s=>Array.from(s.options).some(o=>(o.textContent||'').includes('보스 공격력 +'))))return;
      const total=selects.reduce((sum,s)=>sum+bossAmountFromSelect(s),0);
      let note=card.querySelector('.v22-boss-note');
      if(!note){note=document.createElement('div');note.className='v22-boss-note';card.appendChild(note)}
      if(total<=0){note.style.display='none';return}
      note.style.display='block';
      note.classList.toggle('applied',applies);note.classList.toggle('ignored',!applies);
      note.innerHTML=applies
        ?'<b>현재 환경: 보공 +'+total+'% 적용</b> · 보공 적용 몬스터/보스 기준으로 계산됩니다.'
        :'<b>현재 환경: 보공 0% 적용</b> · 일반 사냥에서는 선택한 보공 +'+total+'%가 데미지 계산에 반영되지 않습니다.';
    });
  }

  function removeLegacyUpdateBlock(){
    const heading=Array.from(document.querySelectorAll('h2,h3')).find(el=>(el.textContent||'').replace(/\\s+/g,' ').trim()==='업데이트 · 문의');
    if(!heading)return;
    const block=heading.closest('section.card')||heading.parentElement;
    if(block&&!block.closest('#releaseHistory'))block.remove();
  }

  function normalizeReleaseHistory(){
    const history=q('releaseHistory');if(!history)return;
    const summary=history.querySelector(':scope>summary');
    if(summary)summary.innerHTML='업데이트 내역 <span class="recommend-summary-note">· 주요 버전 변경사항 보기</span>';
    let body=history.querySelector('.release-history-body');
    if(!body){body=document.createElement('div');body.className='release-history-body';history.appendChild(body)}
    body.innerHTML=''
      +'<div class="release-version"><b>V2.2 · 2026-10-24</b><div class="small">구조 리팩터링. V2.2 단일 엔트리 도입, 직업/스킬 프리셋 기준 파일과 회귀검사 추가, 환산스공·무기 계산기·공대장 계산기 공통 네비/PC 폭 통일. 일반/심화 계산 서순 재정리, 입력 도움말 툴팁과 심화 실측 도움말 보강, 업데이트 내역을 V2.2 기준으로 통합 관리. 무기 잠재의 총데미지는 선택값을 자동 합산하도록 단순화.</div></div>'
      +'<div class="release-version"><b>V2.1 · 2026-10-23~24</b><div class="small">직업별 무기 잠재 추천 TOP3 추가. 일반 필드/보공 적용 몬스터 추천 분리, 보공 잠재 합계 최대 70 및 2·3줄 이탈 옵션 최대 1줄 규칙 반영. 공% 계산에서 버프 공격력을 분리하고 영웅의 메아리와 잠재 공% 합산 로직 보정. 아란 기본공격/더블 스윙/트리플 스윙 실측 DPS 비중 반영. 초간단 모드 제거 및 입력 중심 UI·울트라와이드 레이아웃 정리.</div></div>'
      +'<div class="release-version"><b>V2.0 · 2026-10-23</b><div class="small">사자왕의 성 레이팅 필드 지원. 사냥터별 권장 레이팅/현재 달성률/피해 배율, 다음 피해배율 커트라인과 목표 레이팅 도달 예상일 계산 추가. 보스 공격력 +20%/+30% 잠재, 길드 보공 +5%, 뿌리기 공 +20, 영웅의 메아리 공 +4% 설정 추가.</div></div>'
      +'<div class="release-version"><b>V1.8 · 2026-10-22</b><div class="small">일반/심화 계산 분리. 대표 주력기 1타당 스킬 데미지% 기준 크리티컬 기대값 계산, 실전 스킬 비중/DPS 반영 기능 추가. 주스탯1·주스탯1% 실측 계산 도입. 노크리 직업 크확 계산 보정 및 나이트로드/궁수 샤프아이즈 패시브 수치 정정.</div></div>'
      +'<div class="release-version"><b>V1.4~V1.7 · 2026-10-19~22</b><div class="small">공1 효율 실측을 2세트 MIN/MAX 방식으로 확장. 직업/월묘/장비공합/버프/현재 무기/매물 수/테마 프리셋 저장, 비교 매물 추가·삭제, 입력값 로컬 자동 저장, 제작자/유튜브 링크와 UI 안내 정리.</div></div>'
      +'<div class="release-version"><b>V1.0~V1.3 · 초기 버전</b><div class="small">사냥용 무기 잠재 효율 비교 계산기 기반 구축. 공%/깡공/총데미지/크리티컬 확률/주스탯 잠재 비교, 직업별 크리 프리셋, 정수 입력 UI와 라이트/다크 테마, 기본 프리셋 저장 기능을 순차 추가.</div></div>';
  }

  function moveReleaseHistoryToBottom(){
    const history=q('releaseHistory');
    const main=document.querySelector('main');
    if(!history||!main)return;
    const footer=main.querySelector('footer');
    if(footer)footer.parentNode.insertBefore(history,footer);
    else main.appendChild(history);
  }

  annotateBossOptions();
  removeLegacyUpdateBlock();
  normalizeReleaseHistory();
  moveReleaseHistoryToBottom();
  syncAutoTotalDamage();
  updateBossNotes();

  document.addEventListener('change',e=>{
    if(e.target.matches('.weapon select'))syncAutoTotalDamage();
    requestAnimationFrame(updateBossNotes);
  },true);
  q('calc')?.addEventListener('click',syncAutoTotalDamage,true);
  document.querySelectorAll('.purpose-btn').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(updateBossNotes)));
  new MutationObserver(()=>requestAnimationFrame(updateBossNotes)).observe(document.body,{attributes:true,attributeFilter:['data-combat-purpose']});
})();
</script>`;

function routeKind(pathname){
  if(pathname==='/'||pathname==='/index.html')return 'weapon';
  if(pathname==='/convert.html')return 'convert';
  if(pathname==='/captain.html')return 'captain';
  return null;
}

function commonNav(kind){
  const items=[
    ['convert','/convert.html','환산스공'],
    ['weapon','/','무기 계산기'],
    ['captain','/captain.html','공대장 계산기']
  ];
  return '<nav class="v22-tool-nav" id="v22ToolNav" aria-label="계산기 메뉴">'+items.map(([key,href,label])=>'<a href="'+href+'"'+(key===kind?' class="active" aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>';
}

function normalizeShell(kind,html){
  if(!html.includes('id="v22CommonShellStyle"'))html=html.replace('</head>',COMMON_SHELL_STYLE+'</head>');
  const nav=commonNav(kind);
  const legacyNav=/<nav[^>]*class="[^"]*(?:tool-nav|topnav)[^"]*"[^>]*>[\\s\\S]*?<\\/nav>/i;
  if(legacyNav.test(html))html=html.replace(legacyNav,nav);
  else html=html.replace(/<main([^>]*)>/i,m=>m+nav);
  if(kind==='weapon'){
    html=html.replace(/메이플 플래닛 계산기 <span class="tag">V[^<]+<\\/span>/,'메이플 플래닛 계산기 <span class="tag">V2.2</span>');
    if(!html.includes('id="v22WeaponFlowScript"'))html=html.replace('</body>',WEAPON_FLOW_SCRIPT+'</body>');
    if(!html.includes('id="v22WeaponUiScript"'))html=html.replace('</body>',WEAPON_V22_UI_SCRIPT+'</body>');
  }
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await legacyApp.fetch(request,env,ctx);
    const kind=routeKind(new URL(request.url).pathname);
    const contentType=response.headers.get('content-type')||'';
    if(!kind||!contentType.includes('text/html'))return response;

    let html=await response.text();
    html=normalizeShell(kind,html);

    const regression=validateHtml(kind,html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-version','2.2-dev');
    headers.set('x-planet-regression',regressionHeader(regression));

    let output=html;
    if(!regression.ok){
      const msg='V2.2 회귀 검사: 누락 감지 · '+regression.missing.join(' / ');
      const banner=`<div id="v22RegressionWarning" style="position:sticky;top:0;z-index:99999;padding:9px 12px;background:#7a271a;color:#fff;font:700 12px system-ui;text-align:center">${msg}</div>`;
      output=output.replace(/<body([^>]*)>/,m=>m+banner);
    }
    return new Response(output,{status:response.status,statusText:response.statusText,headers});
  }
};
