const SUPPORT_HTML = `
<section class="card" id="projectHub">
  <h2>업데이트 · 문의</h2>
  <div class="grid">
    <div class="weapon">
      <h3>📌 업데이트 내역</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">
        <b>V1.8 · 2026-10-22</b><br>
        · 간편 계산기 / 심화 계산기 분리<br>
        · 심화 계산기 직업별 사냥 스킬 프리셋 추가<br>
        · 심화 계산기 실전 스킬 비중·DPS 선택 토글 추가 (기본 OFF)<br>
        · 심화 스킬 입력: 기본 1개 + 필요 시 추가 방식으로 개선<br>
        · 무기 기본 주스탯 비교 입력 추가<br>
        · 간편 계산기: 대표 주력기 1타당 스킬 데미지% 기반 크확 효율 반영<br>
        · 심화 계산기: 실전 사냥 스킬별 딜 비중 기반 크확 효율 반영<br>
        · 심화 계산기에 주스탯1 · 주스탯1% 실측 효율 추가<br>
        · 아란: 풀콤보 기준 크리티컬 데미지 +240%p 반영<br>
        · 나이트로드 샤프아이즈: 크확 +15%p / 크뎀 +40%p 반영<br>
        · 보우마스터·신궁 패시브 반영: 기본 크확 50% / 크뎀 110%, 찐샾 적용 후 65% / 250%<br>
        · GitHub → Cloudflare Preview 배포 구조 적용
      </div>
      <details class="details">
        <summary>이전 버전 보기</summary>
        <div class="small" style="margin-top:10px;line-height:1.8">
          <b>V1.7</b> · 무기 잠재 비교, 공1 실측, 직업 프리셋, 자동 저장, 다크/라이트 모드<br>
          <b>초기 버전</b> · 사자왕의 성 사냥용 무기 잠재 상대 효율 비교
        </div>
      </details>
    </div>

    <div class="weapon">
      <h3>🛠️ 오류 제보 · 건의사항</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">
        계산 오류, 직업 스킬 수치 제보, UI 개선, 신규 기능 요청을 받고 있습니다.<br>
        재현 가능한 경우 <b>직업 / 현재 무기 / 비교 매물 / 입력값 / 결과 화면</b>을 함께 남겨주세요.
      </div>
      <a href="https://github.com/planet-sh/maple-planet-calculator/issues/new" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--accent);color:var(--accentText);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">GitHub로 오류·건의 제보</a>
      <div class="small" style="margin-top:8px">GitHub 이용이 어려우면 아래 유튜브 채널 댓글로 남겨주셔도 됩니다.</div>
    </div>
  </div>

  <div class="grid" style="margin-top:12px">
    <div class="weapon">
      <h3>📺 유튜브 / 보조 문의 채널</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">계산기 업데이트 안내, 계산 예시, 메이플 플래닛 관련 영상은 유튜브 채널에서 확인할 수 있습니다.</div>
      <a href="https://www.youtube.com/@planet_sh/featured" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--panel);color:var(--tagText);border:1px solid var(--line);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">플래닛 공대장 서현 YouTube</a>
    </div>

    <div class="weapon">
      <h3>❓ FAQ · 공지</h3>
      <details class="details" open>
        <summary>간편 계산기와 심화 계산기의 차이는?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">간편 계산기는 대표 주력기의 1타당 스킬 데미지%와 러프 스탯 환산을 사용합니다. 심화 계산기는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고, 필요할 때 <b>실전 스킬 비중·DPS 반영</b>을 켜 더 정밀하게 계산할 수 있습니다.</div>
      </details>
      <details class="details">
        <summary>무기에 붙은 기본 주스탯은 어떻게 계산하나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">각 무기의 기본 주스탯은 잠재의 깡 주스탯과 합산해 반영합니다. 간편 계산은 주스탯 5 = 공1로 환산하고, 심화 계산은 직접 측정한 주스탯 1당 스공 효율을 사용합니다.</div>
      </details>
      <details class="details">
        <summary>크리티컬 데미지는 어떻게 계산하나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">현재 DEV에서는 크리티컬 데미지 수치가 <b>각 타격의 스킬 데미지%에 +%p로 더해지는 방식</b>으로 가정합니다. 예: 420% × 2타 스킬에 +140%p 적용 시 각 타격이 560%가 되며, 타수 자체는 상대 크확 효율에 영향을 주지 않습니다.</div>
      </details>
      <details class="details">
        <summary>심화 계산기의 실전 딜량은 어떻게 쓰나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7"><b>실전 스킬 비중·DPS 반영</b> 토글을 켠 뒤, 동일 사냥터에서 가능하면 30분~1시간 이상 측정한 스킬별 DPS 또는 누적 딜량을 입력하세요. 입력값은 절대 데미지로 다시 계산하지 않고, <b>각 스킬이 실제 사냥딜에서 차지한 비중</b>을 구하는 용도로만 사용합니다. 주력 스킬이 하나라면 한 줄만 입력하면 자동으로 100% 비중으로 처리됩니다.</div>
      </details>
      <details class="details">
        <summary>계산값이 실제 사냥 딜과 완전히 같나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">아닙니다. 장비 후보 간 상대 효율을 비교하기 위한 도구이며, 몬스터 이동·젠 손실·공격 실패·버프 공백 등 실제 전투 요소에 따라 차이가 날 수 있습니다.</div>
      </details>
      <details class="details">
        <summary>올스탯% 잠재는 어떻게 계산하나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">올스탯% 잠재는 현재 계산에서 <b>동일 수치의 주스탯%</b>로 환산합니다. 부스탯 상승분은 반영하지 않습니다.</div>
      </details>
      <details class="details">
        <summary>계산식이나 스킬 수치가 틀린 것 같아요.</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">오류 제보에 근거 자료와 함께 남겨주세요. 확인 후 dev Preview에서 먼저 검증하고 production에 반영합니다.</div>
      </details>
    </div>
  </div>
</section>`;

const STAT_INPUT_HELP = `<div class="small" style="margin:8px 0 10px;line-height:1.8"><b>입력 방법 안내</b><br>스탯창의 주스탯은 <b>총합 (A + B)</b> 형태로 표시됩니다.<br>예: <b>STR 3231 (977 + 2254)</b> → <b>A = 977</b>, <b>B = 2254</b></div>`;

const SIMPLE_SKILL_HTML = `<div class="simple-only">
  <label>대표 주력기 1타당 스킬 데미지 (%)</label>
  <input id="simpleSkillPct" type="number" value="420" min="1" step="1" placeholder="예: 420">
  <div class="small">사냥 시 가장 많이 사용하는 대표 주력기의 <b>1타당 스킬 데미지%</b>를 입력하세요.<br>예) 420% 데미지로 2회 공격 → <b>420</b> 입력<br>※ 여러 스킬을 섞어 사용하는 직업은 간편 계산 결과가 실제 사냥과 차이날 수 있습니다. 정확한 계산은 심화 계산기의 실전 스킬 비중·DPS 반영을 이용해주세요.<br>※ 크리티컬 데미지는 각 타격의 스킬 데미지%에 +%p로 적용되는 것으로 가정합니다. 타수는 상대적인 크확 효율에 영향을 주지 않습니다.</div>
</div>`;

const ADVANCED_SKILL_HTML = `<section class="card advanced-only" id="skillMixSection">
  <h2>5. 실전 스킬 데이터 <span class="tag">선택</span></h2>
  <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0;cursor:pointer;color:var(--text)">
    <input id="advancedSkillToggle" type="checkbox" style="width:auto;transform:scale(1.2);margin:0">
    <span><b>실전 스킬 비중·DPS 반영</b><br><span class="small">끄면 대표 주력기 1개 기준으로 계산하고, 켜면 실제 스킬별 딜 비중을 반영합니다.</span></span>
  </label>
  <div id="advancedBaseSkillWrap" style="margin-top:12px">
    <label>대표 주력기 1타당 스킬 데미지 (%)</label>
    <input id="advancedBaseSkillPct" type="number" value="420" min="1" step="1" placeholder="예: 420">
    <div class="small">토글 OFF 상태의 기본 크리티컬 효율 계산에 사용합니다. 사냥에서 가장 많이 사용하는 대표 주력기의 1타당 데미지%를 입력하세요.</div>
  </div>
  <div id="advancedSkillFields" style="display:none;margin-top:12px">
    <div class="small" style="margin-bottom:10px;line-height:1.8">
      동일 사냥터에서 가능하면 <b>30분~1시간 이상</b> 사냥하며 측정한 스킬별 DPS 또는 누적 딜량을 입력해주세요.<br>
      주로 사용하는 스킬이 하나라면 <b>1개만 입력하면 됩니다.</b> 여러 스킬을 사용하는 경우 아래 <b>+ 스킬 추가</b> 버튼으로 필요한 만큼 추가해주세요.<br>
      각 스킬의 <b>1타당 스킬 데미지%</b>와 측정 딜량을 입력하면 실제 사냥 딜 비중을 자동으로 반영합니다.<br>
      <b style="color:var(--warn)">※ 측정 딜량은 절대 데미지 계산에 다시 사용하지 않고, 스킬별 딜 비중을 구하는 용도로만 사용합니다.</b>
    </div>
    <div id="skillMixRows">
      ${[1,2,3,4,5].map(i => `<div class="skill-mix-row" id="advSkillRow${i}"${i>1?' style="display:none"':''}><div><label>스킬 ${i} 프리셋</label><select id="advSkillPreset${i}"></select></div><div><label>1타당 스킬 데미지 (%)</label><input id="advSkillPct${i}" type="number" min="0" step="1" placeholder="예: 420"></div><div><label>실전 측정 딜량</label><input id="advSkillDamage${i}" type="number" min="0" step="any" placeholder="DPS 또는 누적 딜"></div></div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" id="addSkillRowBtn">+ 스킬 추가</button><button type="button" id="removeSkillRowBtn" style="display:none">− 마지막 스킬 제거</button></div>
    <div class="metric" style="margin-top:12px"><span class="small">입력된 스킬 딜 비중</span><b id="skillMixPreview">-</b><span class="small">딜량 단위는 자유입니다. 같은 측정 기준의 숫자라면 비율로 자동 환산됩니다.</span></div>
  </div>
</section>`;

const CRIT_HELPERS = `const huntingSkillPresets={"팔라딘":["차지블로우","생츄어리"],"히어로":["브랜디쉬"],"다크나이트":["스피어 버스터"],"아란 (풀콤보 기준)":["더블스윙","트리플스윙","파이널블로우","콤보템페스트"],"캡틴":["토르페도","캐논"],"바이퍼":["드래곤 스트라이크"],"신궁":["피어싱","스나이핑","스트레이프"],"보우마스터":["폭풍의시"],"섀도어":["부메랑스텝"],"나이트로드":["트리플스로우"],"불독":["페럴라이즈","메테오"],"썬콜":["체인라이트닝","블리자드"],"비숍":["제네시스","엔젤레이"],"에반":["플레임 휠","다크포그"]};let visibleSkillRows=1;function currentSkillPreset(){return huntingSkillPresets[job.value]||[]}function fillSkillSelect(el,rowIndex=1,includeDirect=true){if(!el)return;const prev=el.value;const list=currentSkillPreset();el.innerHTML='';list.forEach(name=>el.add(new Option(name,name)));if(includeDirect)el.add(new Option('직접 입력','__custom__'));if(prev&&Array.from(el.options).some(o=>o.value===prev))el.value=prev;else if(list.length)el.value=list[Math.min(rowIndex-1,list.length-1)]}function advancedSkillMixEnabled(){const el=document.getElementById('advancedSkillToggle');return !!(el&&el.checked)}function updateAdvancedSkillToggle(){const on=advancedSkillMixEnabled(),fields=document.getElementById('advancedSkillFields'),baseWrap=document.getElementById('advancedBaseSkillWrap');if(fields)fields.style.display=on?'block':'none';if(baseWrap)baseWrap.style.display=on?'none':'block';updateSkillMixPreview()}function updateSkillRowControls(){for(let i=1;i<=5;i++){const row=document.getElementById('advSkillRow'+i);if(row)row.style.display=i<=visibleSkillRows?'grid':'none'}const add=document.getElementById('addSkillRowBtn'),remove=document.getElementById('removeSkillRowBtn');if(add)add.style.display=visibleSkillRows<5?'inline-block':'none';if(remove)remove.style.display=visibleSkillRows>1?'inline-block':'none'}function inferSkillRows(){let used=1;for(let i=2;i<=5;i++){if(n('advSkillPct'+i)>0||n('advSkillDamage'+i)>0)used=i}visibleSkillRows=used;updateSkillRowControls()}function syncSkillPresets(){for(let i=1;i<=5;i++)fillSkillSelect(document.getElementById('advSkillPreset'+i),i);inferSkillRows();updateAdvancedSkillToggle()}function skillMixData(){const rows=[];for(let i=1;i<=5;i++){const pct=n('advSkillPct'+i),damage=n('advSkillDamage'+i);const preset=document.getElementById('advSkillPreset'+i);const name=preset&&preset.value&&preset.value!=='__custom__'?preset.value:('스킬 '+i);if(pct>0&&damage>0)rows.push({name,pct,damage})}const total=rows.reduce((s,r)=>s+r.damage,0);return total>0?rows.map(r=>({...r,weight:r.damage/total})):[]}function critRelativeMultiplier(appliedCrit,baseAppliedCrit,critBonus){const c=Math.max(0,Math.min(100,appliedCrit))/100,c0=Math.max(0,Math.min(100,baseAppliedCrit))/100;if(calcMode==='advanced'&&advancedSkillMixEnabled()){const rows=skillMixData();if(rows.length){return rows.reduce((sum,r)=>{const base=r.pct+c0*critBonus;if(base<=0)return sum;return sum+r.weight*((r.pct+c*critBonus)/base)},0)}}const pct=Math.max(1,calcMode==='advanced'?(n('advancedBaseSkillPct')||420):(n('simpleSkillPct')||420));return (pct+c*critBonus)/(pct+c0*critBonus)}function updateSkillMixPreview(){const el=document.getElementById('skillMixPreview');if(!el)return;if(!advancedSkillMixEnabled()){el.innerHTML='-';return}const rows=skillMixData();el.innerHTML=rows.length?rows.map(r=>\`${'${'}r.name} ${'${'}(r.weight*100).toFixed(1)}%\`).join(' · '):'-'};`;

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/index.html") return response;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();

    if (!html.includes(".simple-only")) {
      html = html.replace(
        'body[data-calc-mode="advanced"] .advanced-only{display:block}',
        'body[data-calc-mode="advanced"] .advanced-only{display:block}.simple-only{display:block}body[data-calc-mode="advanced"] .simple-only{display:none}.skill-mix-row{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}@media(max-width:760px){.skill-mix-row{grid-template-columns:1fr}}'
      );
    }

    if (!html.includes('id="simpleSkillPct"')) {
      html = html.replace(
        '</div></div><div><label>장착 장비 순수 공격력 합</label>',
        '</div>' + SIMPLE_SKILL_HTML + '</div><div><label>장착 장비 순수 공격력 합</label>'
      );
    }

    if (!html.includes('id="skillMixSection"')) {
      html = html.replace(
        '<section class="card"><h2 id="weaponSectionTitle">3. 현재 무기 / 비교 매물</h2>',
        ADVANCED_SKILL_HTML + '<section class="card"><h2 id="weaponSectionTitle">3. 현재 무기 / 비교 매물</h2>'
      );
    }

    if (!html.includes("스탯창의 주스탯은 <b>총합 (A + B)</b>")) {
      html = html.replace(
        '<section class="card advanced-only" id="statCalSection"><h2>3. 주스탯 1당 스공 효율 측정</h2>',
        '<section class="card advanced-only" id="statCalSection"><h2>3. 주스탯 1당 스공 효율 측정</h2>' + STAT_INPUT_HELP
      );
      html = html.replace(
        '<section class="card advanced-only" id="pctCalSection"><h2>4. 주스탯 1%당 스공 효율 측정</h2>',
        '<section class="card advanced-only" id="pctCalSection"><h2>4. 주스탯 1%당 스공 효율 측정</h2>' + STAT_INPUT_HELP
      );
    }

    if (!html.includes('올스탯% 잠재는 현재 계산에서 <b>동일 수치의 주스탯%</b>로 환산')) {
      html = html.replace(
        '※ 3번과 4번 측정도 가능한 한 같은 장비·버프·스킬 조건을 유지해주세요.</b>',
        '※ 3번과 4번 측정도 가능한 한 같은 장비·버프·스킬 조건을 유지해주세요.<br>※ 올스탯% 잠재는 현재 계산에서 <b>동일 수치의 주스탯%</b>로 환산하며, <b>부스탯 상승분은 반영하지 않습니다.</b></b>'
      );
    }

    html = html.replace(
      "weaponSectionTitle.textContent=(advanced?'5':'3')+'. 현재 무기 / 비교 매물';",
      "weaponSectionTitle.textContent=(advanced?'6':'3')+'. 현재 무기 / 비교 매물';"
    );

    html = html.replace(
      "modeDesc.innerHTML=advanced?'<b>심화 계산기</b> · 공1 / 주스탯1 / 주스탯1%를 직접 실측해 현재 캐릭터 세팅 기준으로 비교합니다.':'<b>간편 계산기</b> · 빠른 매물 비교용입니다. 깡 주스탯 5 = 공1, 주스탯 1.5% = 공1의 러프 환산을 사용합니다.';",
      "modeDesc.innerHTML=advanced?'<b>심화 계산기</b> · 공1 / 주스탯1 / 주스탯1% 실측을 기본으로 사용하며, 필요 시 실전 스킬 비중·DPS 반영을 켤 수 있습니다.':'<b>간편 계산기</b> · 대표 주력기 1타당 스킬 데미지%와 러프 스탯 환산으로 빠르게 비교합니다.';"
    );

    html = html.replace(
      '"아란 (풀콤보 기준)":{crit:70,cd:200,note:"아란은 풀콤보 기준으로 계산합니다."}',
      '"아란 (풀콤보 기준)":{crit:70,cd:200,sharpCd:40,note:"아란은 풀콤보 기준이며, 크리티컬 발생 시 기본 스킬 데미지에 +240%p가 적용됩니다."}'
    );

    if (!html.includes("function skillMixData()")) {
      html = html.replace('function calc(){', CRIT_HELPERS + 'function calc(){');
    }

    if (!html.includes("id=\"${w.id}Stat\"")) {
      html = html.replace(
        '<label>무기 순수 공격력</label><input id="${w.id}Atk" type="number" value="${atkValue}" min="0" step="1" placeholder="공격력 입력"><label>잠재 1</label>',
        '<label>무기 순수 공격력</label><input id="${w.id}Atk" type="number" value="${atkValue}" min="0" step="1" placeholder="공격력 입력"><label>무기 기본 주스탯</label><input id="${w.id}Stat" type="number" value="0" min="0" step="1" placeholder="STR / DEX / LUK 등"><label>잠재 1</label>'
      );
    }

    html = html.replace(
      "function clearWeapon(id){document.getElementById(id+'Atk').value='';for(let k=1;k<=3;k++)",
      "function clearWeapon(id){document.getElementById(id+'Atk').value='';document.getElementById(id+'Stat').value='0';for(let k=1;k<=3;k++)"
    );

    html = html.replace(
      "function copyWeapon(from,to){document.getElementById(to+'Atk').value=document.getElementById(from+'Atk').value;for(let k=1;k<=3;k++)",
      "function copyWeapon(from,to){document.getElementById(to+'Atk').value=document.getElementById(from+'Atk').value;document.getElementById(to+'Stat').value=document.getElementById(from+'Stat').value;for(let k=1;k<=3;k++)"
    );

    html = html.replace(
      "const PRESET_KEY='planet-calculator-preset-v1';const presetIds=['job','crit','equipAtk','buff','buffCustom',...calibrationIds,...statIds,...pctIds];",
      "const PRESET_KEY='planet-calculator-preset-v1';const skillMixIds=['simpleSkillPct','advancedBaseSkillPct',...Array.from({length:5},(_,i)=>['advSkillPreset'+(i+1),'advSkillPct'+(i+1),'advSkillDamage'+(i+1)]).flat()];const presetIds=['job','crit','equipAtk','buff','buffCustom',...calibrationIds,...statIds,...pctIds,...skillMixIds];"
    );

    html = html.replace(
      "function savePreset(){try{const data={compareCount,calcMode};presetIds.forEach(id=>{const el=document.getElementById(id);if(el)data[id]=el.value});localStorage.setItem(PRESET_KEY,JSON.stringify(data))}catch(e){}}",
      "function savePreset(){try{const toggle=document.getElementById('advancedSkillToggle');const data={compareCount,calcMode,advancedSkillToggle:!!(toggle&&toggle.checked)};presetIds.forEach(id=>{const el=document.getElementById(id);if(el)data[id]=el.value});localStorage.setItem(PRESET_KEY,JSON.stringify(data))}catch(e){}}"
    );

    html = html.replace(
      "if(data.job&&jobs[data.job]&&!jobs[data.job].magic)job.value=data.job;presetIds.forEach(id=>{if(id==='job'||!(id in data))return;const el=document.getElementById(id);if(el)el.value=data[id]});compareCount=",
      "if(data.job&&jobs[data.job]&&!jobs[data.job].magic)job.value=data.job;presetIds.forEach(id=>{if(id==='job'||!(id in data))return;const el=document.getElementById(id);if(el)el.value=data[id]});const advToggle=document.getElementById('advancedSkillToggle');if(advToggle)advToggle.checked=!!data.advancedSkillToggle;compareCount="
    );

    html = html.replace(
      "W.forEach(w=>{presetIds.push(w.id+'Atk',w.id+'O1',w.id+'O2',w.id+'O3',w.id+'Dmg');",
      "W.forEach(w=>{presetIds.push(w.id+'Atk',w.id+'Stat',w.id+'O1',w.id+'O2',w.id+'O3',w.id+'Dmg');"
    );

    html = html.replace(
      "r.atk=n(id+'Atk');r.dmg=n(id+'Dmg');",
      "r.atk=n(id+'Atk');r.weaponStat=n(id+'Stat');r.dmg=n(id+'Dmg');"
    );

    html = html.replace(
      "function statEquivalents(cal,statCal,pctCal,w){let minEq=0,maxEq=0;if(w.statFlat){if(!statCal)return null;minEq+=w.statFlat*statCal.min/cal.min;maxEq+=w.statFlat*statCal.max/cal.max}",
      "function statEquivalents(cal,statCal,pctCal,w){let minEq=0,maxEq=0;const totalFlat=(w.weaponStat||0)+w.statFlat;if(totalFlat){if(!statCal)return null;minEq+=totalFlat*statCal.min/cal.min;maxEq+=totalFlat*statCal.max/cal.max}"
    );

    html = html.replace(
      "const needsFlat=Object.values(ws).some(w=>w.statFlat>0),needsPct=Object.values(ws).some(w=>w.statPct>0);",
      "const needsFlat=Object.values(ws).some(w=>w.statFlat>0||w.weaponStat>0),needsPct=Object.values(ws).some(w=>w.statPct>0);"
    );

    html = html.replace(
      "if(calcMode==='advanced'&&needsFlat&&!statCal){alert('심화 계산에서 주스탯 +12/+14 잠재를 비교하려면 3번 주스탯1 실측값이 필요합니다.');return}",
      "if(calcMode==='advanced'&&needsFlat&&!statCal){alert('심화 계산에서 무기 기본 주스탯 또는 주스탯 +12/+14 잠재를 비교하려면 3번 주스탯1 실측값이 필요합니다.');return}"
    );

    html = html.replace(
      ":{min:w.statFlat/5+w.statPct/1.5,max:w.statFlat/5+w.statPct/1.5,avg:w.statFlat/5+w.statPct/1.5};",
      ":{min:((w.weaponStat||0)+w.statFlat)/5+w.statPct/1.5,max:((w.weaponStat||0)+w.statFlat)/5+w.statPct/1.5,avg:((w.weaponStat||0)+w.statFlat)/5+w.statPct/1.5};"
    );

    html = html.replace(
      "job.addEventListener('change',syncJobPreset);critInput.addEventListener('input',updateSharpPreview);syncJobPreset();",
      "job.addEventListener('change',()=>{syncJobPreset();syncSkillPresets()});critInput.addEventListener('input',updateSharpPreview);syncJobPreset();setTimeout(syncSkillPresets,0);"
    );

    html = html.replace(
      "updatePctPreview();return true}catch(e){return false}}restorePreset();",
      "updatePctPreview();syncSkillPresets();updateAdvancedSkillToggle();updateSkillMixPreview();return true}catch(e){return false}}restorePreset();"
    );

    html = html.replace(
      "document.addEventListener('input',e=>{if(e.target.matches('input,select'))savePreset()});",
      "document.addEventListener('input',e=>{if(e.target.matches('input,select'))savePreset();if(e.target.id&&e.target.id.startsWith('advSkill'))updateSkillMixPreview()});document.addEventListener('change',e=>{if(e.target.id==='advancedSkillToggle'){updateAdvancedSkillToggle();savePreset()}});document.addEventListener('click',e=>{if(e.target.id==='addSkillRowBtn'){visibleSkillRows=Math.min(5,visibleSkillRows+1);updateSkillRowControls()}if(e.target.id==='removeSkillRowBtn'&&visibleSkillRows>1){const i=visibleSkillRows;const pct=document.getElementById('advSkillPct'+i),damage=document.getElementById('advSkillDamage'+i);if(pct)pct.value='';if(damage)damage.value='';visibleSkillRows--;updateSkillRowControls();updateSkillMixPreview();savePreset()}});"
    );

    html = html.replace(
      "const cur=ws.cur;Object.entries(ws).forEach(([key,w])=>{",
      "const cur=ws.cur;const nonWeaponCrit=baseCrit;const baseAppliedCrit=Math.max(0,Math.min(100,nonWeaponCrit+cur.crit+sharpCrit));Object.entries(ws).forEach(([key,w])=>{"
    );

    html = html.replace(
      "const nonWeaponCrit=baseCrit-cur.crit;w.appliedCrit=Math.max(0,Math.min(100,nonWeaponCrit+w.crit+sharpCrit));w.critMult=(1-w.appliedCrit/100)+(w.appliedCrit/100)*((cd+sharpCd)/100);",
      "w.appliedCrit=Math.max(0,Math.min(100,nonWeaponCrit+w.crit+sharpCrit));w.critMult=critRelativeMultiplier(w.appliedCrit,baseAppliedCrit,cd+sharpCd);"
    );

    html = html.replace(
      "<br>직업 자체 크뎀 ${cd}%p + 찐샾 ${sharpCd}%p / 찐샾 크확 +${sharpCrit}%p / 버프공 +${buffV}<br>",
      "<br>직업 자체 크뎀 ${cd}%p + 찐샾 ${sharpCd}%p / 찐샾 크확 +${sharpCrit}%p / 버프공 +${buffV}<br>크리티컬 데미지는 각 타격의 스킬 데미지%에 +%p로 적용되는 것으로 가정합니다.<br>${calcMode==='advanced'?(advancedSkillMixEnabled()?'실전 스킬 비중·DPS 반영 ON':'실전 스킬 비중·DPS 반영 OFF · 대표 주력기 '+fmt(n('advancedBaseSkillPct')||420,0)+'% 기준'):''}<br>"
    );

    html = html.replace(
      "<td>${fmt(w.statFlat,0)}</td><td>${fmt(w.statPct,0)}%</td>",
      "<td>${fmt(w.weaponStat||0,0)}</td><td>${fmt(w.statFlat,0)}</td><td>${fmt(w.statPct,0)}%</td>"
    );

    html = html.replace(
      "<th>잠재깡공</th><th>공%베이스</th><th>공%증가</th><th>깡주스탯</th><th>주스탯%</th>",
      "<th>잠재깡공</th><th>공%베이스</th><th>공%증가</th><th>무기주스탯</th><th>잠재깡주스탯</th><th>주스탯%</th>"
    );

    if (!html.includes('id="projectHub"')) {
      html = html.replace("</main>", `${SUPPORT_HTML}</main>`);
    }

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("etag");

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};