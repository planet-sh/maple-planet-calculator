import baseWorker from './worker.js';

const QUICK_HTML = `
<section class="card quick-only" id="quickCompareSection">
  <h2>초간단 비교 <span class="tag">러프 계산</span></h2>
  <div class="small" style="margin-bottom:12px;line-height:1.8">
    <b>측정 조건: 리프레 대기 상태 · 혼테일 버프만 적용</b><br>
    다른 공격력 버프·소비 아이템·일시 버프는 끄고, 같은 상태에서 최대 스공과 공1당 최대 스공 상승량을 측정하세요.<br>
    <b style="color:var(--warn)">※ 깡공과 총데미지만 달라지는 매물의 빠른 비교용입니다. 공%, 크확, 주스탯, 무기 순공까지 달라지면 간편/심화 계산기를 이용하세요.</b>
  </div>
  <div class="grid">
    <div>
      <label>혼벞 상태 현재 최대 스공</label>
      <input id="quickMaxRange" type="number" min="1" step="1" placeholder="예: 36300">
      <div class="small">현재 무기를 낀 상태에서 혼테일 버프만 받고 측정한 MAX 스공</div>
    </div>
    <div>
      <label>공격력 1당 최대 스공 상승량</label>
      <input id="quickAtkPer1" type="number" min="0.01" step="any" placeholder="예: 160">
      <div class="small">동일한 혼벞 상태에서 공격력 차이 장비로 실측</div>
    </div>
    <div>
      <label>비교 무기의 공격력 차이</label>
      <input id="quickAtkDelta" type="number" step="1" placeholder="예: 14">
      <div class="small">현재 무기 대비 비교 무기가 공14 높으면 14, 공12 낮으면 -12</div>
    </div>
    <div>
      <label>현재 무기 총데미지 (%)</label>
      <input id="quickCurrentDmg" type="number" min="0" step="1" placeholder="예: 15">
    </div>
    <div>
      <label>비교 무기 총데미지 (%)</label>
      <input id="quickCandidateDmg" type="number" min="0" step="1" placeholder="예: 9">
    </div>
  </div>
  <div class="metrics" style="margin-top:14px">
    <div class="metric"><span class="small">공격력 차이 스공 환산</span><b id="quickAtkGain">-</b></div>
    <div class="metric"><span class="small">비교 무기 기대 화력</span><b id="quickRelative">-</b></div>
    <div class="metric"><span class="small">손익분기 최대 스공</span><b id="quickBreakEven">-</b></div>
  </div>
  <div class="metric" style="margin-top:10px">
    <span class="small">판정</span>
    <b id="quickVerdict">값을 입력하면 자동 계산됩니다.</b>
    <span class="small" id="quickExplain">계산식: (변경 후 스공 ÷ 현재 스공) × (변경 후 총뎀 배율 ÷ 현재 총뎀 배율)</span>
  </div>
</section>`;

const QUICK_SCRIPT = `
<script>
(()=>{
  const root=document.getElementById('quickCompareSection');
  const quickMode=document.getElementById('quickMode');
  const simple=document.getElementById('simpleMode');
  const advanced=document.getElementById('advancedMode');
  if(!root||!quickMode||!simple||!advanced)return;
  const q=id=>document.getElementById(id);
  const num=id=>{const v=parseFloat(q(id)?.value);return Number.isFinite(v)?v:0};
  function leaveQuick(){quickMode.classList.remove('active');quickMode.setAttribute('aria-selected','false')}
  simple.addEventListener('click',leaveQuick);
  advanced.addEventListener('click',leaveQuick);
  quickMode.addEventListener('click',()=>{
    document.body.dataset.calcMode='quick';
    simple.classList.remove('active');advanced.classList.remove('active');quickMode.classList.add('active');
    simple.setAttribute('aria-selected','false');advanced.setAttribute('aria-selected','false');quickMode.setAttribute('aria-selected','true');
    const desc=q('modeDesc');if(desc)desc.innerHTML='<b>초간단 비교</b> · 리프레에서 혼벞만 받은 상태의 최대스공과 공1 실측값으로 깡공 ↔ 총데미지를 빠르게 비교합니다.';
    try{localStorage.setItem('planet-quick-mode','1')}catch(e){}
  });
  function calcQuick(){
    const s=num('quickMaxRange'),per=num('quickAtkPer1'),atk=num('quickAtkDelta'),d1=num('quickCurrentDmg'),d2=num('quickCandidateDmg');
    const gain=per*atk;
    q('quickAtkGain').textContent=(gain>=0?'+':'')+(Number.isFinite(gain)?gain.toFixed(0):'0');
    if(s<=0||per<=0){q('quickRelative').textContent='-';q('quickBreakEven').textContent='-';q('quickVerdict').textContent='최대 스공과 공1 효율을 입력해주세요.';return}
    const changed=s+gain;
    if(changed<=0){q('quickRelative').textContent='-';q('quickBreakEven').textContent='-';q('quickVerdict').textContent='공격력 차이 입력값을 확인해주세요.';return}
    const rel=(changed/s)*((100+d2)/(100+d1));
    const pct=(rel-1)*100;
    q('quickRelative').textContent=(rel*100).toFixed(2)+'%';
    let beText='해당 없음';
    const dmgDiff=d1-d2;
    if(gain!==0&&dmgDiff!==0){const be=gain*(100+d2)/dmgDiff;if(be>0&&Number.isFinite(be))beText=Math.round(be).toLocaleString()}
    q('quickBreakEven').textContent=beText;
    if(Math.abs(pct)<0.05)q('quickVerdict').textContent='거의 동일 · 오차 범위 수준';
    else if(pct>0)q('quickVerdict').textContent='비교 무기 우세 · 현재 대비 +'+pct.toFixed(2)+'%';
    else q('quickVerdict').textContent='현재 무기 우세 · 비교 무기 '+pct.toFixed(2)+'%';
    const atkPct=gain/s*100,dmgRatio=((100+d2)/(100+d1)-1)*100;
    q('quickExplain').textContent='스공 변화 '+(atkPct>=0?'+':'')+atkPct.toFixed(2)+'% · 총뎀 배율 변화 '+(dmgRatio>=0?'+':'')+dmgRatio.toFixed(2)+'% · 두 배율을 곱해 최종 비교';
  }
  ['quickMaxRange','quickAtkPer1','quickAtkDelta','quickCurrentDmg','quickCandidateDmg'].forEach(id=>q(id)?.addEventListener('input',calcQuick));
  calcQuick();
})();
</script>`;

function patchV19Copy(html){
  html=html.replace(
    '<b>V1.8 · 2026-10-22</b><br>',
    '<b>V1.9 · 2026-10-23</b><br>\n        · 초간단 비교 모드 추가 — 깡공 ↔ 총데미지 빠른 비교<br>\n        · 초간단 측정 조건 표준화: 리프레 대기 상태 · 혼테일 버프만 적용<br>\n        · 공1당 최대 스공 실측값과 현재 최대 스공으로 기대 화력 자동 계산<br>\n        · 공격력/총데미지 교환의 손익분기 최대 스공 자동 표시<br>\n        · 단순 상승률 차감이 아닌 공격력 배율 × 총데미지 배율 방식 적용<br>\n        <br><b>V1.8 · 2026-10-22</b><br>'
  );
  html=html.replace(
    '<b>V1.7</b> · 무기 잠재 비교, 공1 실측, 직업 프리셋, 자동 저장, 다크/라이트 모드<br>',
    '<b>V1.8</b> · 간편/심화 분리, 실전 스킬 비중·DPS, 주스탯 실측, 크리 계산 구조 개선<br>\n          <b>V1.7</b> · 무기 잠재 비교, 공1 실측, 직업 프리셋, 자동 저장, 다크/라이트 모드<br>'
  );
  html=html.replace(
    '<summary>간편 계산기와 심화 계산기의 차이는?</summary>\n        <div class="small" style="margin-top:8px;line-height:1.7">간편 계산기는 대표 주력기의 1타당 스킬 데미지%와 러프 스탯 환산을 사용합니다. 심화 계산기는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고, 필요할 때 <b>실전 스킬 비중·DPS 반영</b>을 켜 더 정밀하게 계산할 수 있습니다.</div>',
    '<summary>초간단 / 간편 / 심화 계산기의 차이는?</summary>\n        <div class="small" style="margin-top:8px;line-height:1.7"><b>초간단 비교</b>는 리프레에서 혼벞만 받은 상태의 최대 스공과 공1당 최대 스공 상승량으로 <b>깡공 ↔ 총데미지</b>를 빠르게 비교합니다. 공%, 크확, 주스탯, 무기 순공까지 달라지는 매물은 <b>간편 계산기</b>를 사용하세요. <b>심화 계산기</b>는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고, 필요할 때 <b>실전 스킬 비중·DPS 반영</b>을 켜 더 정밀하게 계산할 수 있습니다.</div>'
  );
  html=html.replace(
    '<details class="details">\n        <summary>무기에 붙은 기본 주스탯은 어떻게 계산하나요?</summary>',
    '<details class="details">\n        <summary>초간단 비교는 얼마나 정확한가요?</summary>\n        <div class="small" style="margin-top:8px;line-height:1.7">현재 무기와 비교 무기의 차이가 <b>깡공과 총데미지뿐이라면</b>, 같은 혼벞 상태에서 측정한 최대 스공과 공1 실측값을 사용하므로 빠른 비교치로 충분히 유효합니다. 다만 스공 표시 반올림, 공1 실측 오차가 남을 수 있으며, 다른 옵션까지 함께 바뀌면 간편/심화 계산기를 이용해주세요.</div>\n      </details>\n      <details class="details">\n        <summary>무기에 붙은 기본 주스탯은 어떻게 계산하나요?</summary>'
  );
  return html;
}

export default {
  async fetch(request, env, ctx) {
    const response = await baseWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/index.html') return response;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    let html = await response.text();
    html = patchV19Copy(html);
    if (!html.includes('id="quickMode"')) {
      html = html.replace(
        '<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택">',
        '<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택"><button class="mode-btn" id="quickMode" type="button" role="tab" aria-selected="false">초간단 비교</button>'
      );
      html = html.replace(
        '<section class="card"><h2>1. 캐릭터 / 장비</h2>',
        QUICK_HTML + '<section class="card"><h2>1. 캐릭터 / 장비</h2>'
      );
      html = html.replace(
        '</style>',
        '.mode-switch{grid-template-columns:repeat(3,minmax(0,1fr))}.quick-only{display:none}body[data-calc-mode="quick"] .quick-only{display:block}body[data-calc-mode="quick"] main>section.card:not(.quick-only):not(#projectHub),body[data-calc-mode="quick"] #calc{display:none}@media(max-width:520px){.mode-switch{grid-template-columns:1fr}.mode-btn{padding:10px 8px}}\n</style>'
      );
      html = html.replace('</body>', QUICK_SCRIPT + '</body>');
    }
    const headers = new Headers(response.headers);
    headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};