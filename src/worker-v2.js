import baseWorker from './worker-quick.js';

const FIELD_HTML = `
<section class="card" id="huntingEnvironment">
  <h2>사냥 환경 <span class="tag">V2.0 DEV</span></h2>
  <div class="grid">
    <div>
      <label>사냥 환경</label>
      <select id="fieldMode">
        <option value="normal">일반 필드</option>
        <option value="rating" selected>레이팅 필드 · 보공 적용</option>
      </select>
      <div class="small">레이팅 필드에서는 보스 공격력 잠재가 적용되는 것으로 계산합니다.</div>
    </div>
    <div id="ratingFieldWrap">
      <label>레이팅 필드</label>
      <select id="ratingField">
        <option value="5">성벽 아래1 · 권장 5</option>
        <option value="20">성벽 아래2 · 권장 20</option>
        <option value="30">성벽 아래3 · 권장 30</option>
        <option value="40">성벽 아래4 · 권장 40</option>
        <option value="40">성벽 아래5 · 권장 40</option>
        <option value="60">낮은 성벽1 · 권장 60</option>
        <option value="60">낮은 성벽2 · 권장 60</option>
        <option value="60">낮은 성벽3 · 권장 60</option>
        <option value="75" selected>높은 성벽1 · 권장 75</option>
        <option value="75">높은 성벽2 · 권장 75</option>
        <option value="75">아주 높은 성벽 · 권장 75</option>
      </select>
    </div>
    <div id="currentRatingWrap">
      <label>현재 레이팅</label>
      <input id="currentRating" type="number" value="75" min="0" max="200" step="1">
      <div class="small">현재 캐릭터의 레이팅 수치를 입력하세요.</div>
    </div>
    <div id="guildBossWrap">
      <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:28px;cursor:pointer;color:var(--text)">
        <input id="guildBossToggle" type="checkbox" checked style="width:auto;transform:scale(1.2);margin:0">
        <span><b>길드스킬 보공 +5%</b><br><span class="small">일반적인 성벽 사냥 세팅은 ON</span></span>
      </label>
    </div>
  </div>
  <div class="metrics" id="ratingMetrics" style="margin-top:14px">
    <div class="metric"><span class="small">권장 레이팅</span><b id="recommendedRating">75</b></div>
    <div class="metric"><span class="small">현재 달성률</span><b id="ratingRatio">100.0%</b></div>
    <div class="metric"><span class="small">레이팅 피해 배율</span><b id="ratingDamage">100%</b></div>
  </div>
  <div class="metric" id="ratingAdvice" style="margin-top:10px">
    <span class="small">레이팅 안내</span>
    <b id="ratingGain">권장 레이팅 충족 · 피해 감소 없음</b>
    <span class="small">레이팅 피해 배율은 같은 필드에서 무기 A/B 비교 시 양쪽에 동일하게 적용되어 상대 순위에는 영향을 주지 않습니다.</span>
  </div>

  <div id="ratingGrowthWrap" style="margin-top:14px">
    <h3 style="margin:0 0 8px">레이팅 목표 도달 예상</h3>
    <div class="small" style="margin-bottom:10px;line-height:1.7">성장 포인트 <b>25</b>마다 레이팅이 <b>+5</b> 상승합니다. 일일 의뢰는 <b>+20</b>, 주간 의뢰는 <b>+40</b> 성장 포인트로 계산합니다.</div>
    <div class="grid">
      <div>
        <label>현재 성장 포인트 (0~24)</label>
        <input id="currentGrowthPoint" type="number" value="0" min="0" max="24" step="1">
      </div>
      <div>
        <label>목표 커트라인</label>
        <select id="ratingTargetMode">
          <option value="next" selected>다음 피해배율 커트라인</option>
          <option value="30">피해배율 30%</option>
          <option value="60">피해배율 60%</option>
          <option value="70">피해배율 70%</option>
          <option value="80">피해배율 80%</option>
          <option value="100">피해배율 100%</option>
          <option value="custom">목표 레이팅 직접 입력</option>
        </select>
        <input id="customTargetRating" type="number" value="75" min="0" max="200" step="1" style="display:none;margin-top:8px" placeholder="목표 레이팅">
      </div>
      <div>
        <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:10px;cursor:pointer;color:var(--text)">
          <input id="dailyDoneToggle" type="checkbox" style="width:auto;transform:scale(1.2);margin:0">
          <span><b>오늘 일퀘 이미 완료</b><br><span class="small">OFF면 오늘 +20부터 계산</span></span>
        </label>
      </div>
      <div>
        <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-top:10px;cursor:pointer;color:var(--text)">
          <input id="weeklyDoneToggle" type="checkbox" style="width:auto;transform:scale(1.2);margin:0">
          <span><b>이번 주 주간퀘 이미 완료</b><br><span class="small">OFF면 이번 주 +40을 오늘 획득 가능하다고 가정</span></span>
        </label>
      </div>
    </div>
    <div class="metrics" style="margin-top:12px">
      <div class="metric"><span class="small">목표 레이팅</span><b id="targetRatingDisplay">75</b></div>
      <div class="metric"><span class="small">필요 성장 포인트</span><b id="growthNeeded">0</b></div>
      <div class="metric"><span class="small">목표 피해배율</span><b id="targetDamageDisplay">100%</b></div>
    </div>
    <div class="metrics" style="margin-top:10px">
      <div class="metric"><span class="small">일퀘만 할 경우</span><b id="dailyOnlyEta">이미 달성</b></div>
      <div class="metric"><span class="small">일퀘 + 주간퀘</span><b id="fullEta">이미 달성</b></div>
      <div class="metric"><span class="small">예상 도달일</span><b id="ratingEtaDate">현재 달성</b></div>
    </div>
    <div class="small" id="ratingEtaExplain" style="margin-top:8px">선택한 목표 커트라인을 기준으로 계산합니다.</div>
  </div>
</section>`;

const V2_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const fieldMode=q('fieldMode'),ratingField=q('ratingField'),currentRating=q('currentRating'),guild=q('guildBossToggle');
  const growth=q('currentGrowthPoint'),targetMode=q('ratingTargetMode'),customTarget=q('customTargetRating'),dailyDone=q('dailyDoneToggle'),weeklyDone=q('weeklyDoneToggle');
  if(!fieldMode||!ratingField||!currentRating||!guild||!growth||!targetMode||!customTarget||!dailyDone||!weeklyDone)return;
  function ratingMultiplier(rate){if(rate<0.10)return 0.10;if(rate<0.30)return 0.30;if(rate<0.50)return 0.60;if(rate<0.70)return 0.70;if(rate<1)return 0.80;return 1.00}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function cutRating(req,damage){if(damage===30)return Math.ceil(req*0.10);if(damage===60)return Math.ceil(req*0.30);if(damage===70)return Math.ceil(req*0.50);if(damage===80)return Math.ceil(req*0.70);if(damage===100)return req;return 0}
  function damageAt(req,rating){return Math.round(ratingMultiplier(req>0?rating/req:1)*100)}
  function nextCut(req,cur){for(const dmg of [30,60,70,80,100]){const rating=cutRating(req,dmg);if(cur<rating)return {rating,damage:dmg}}return {rating:req,damage:100}}
  function targetInfo(req,cur){if(targetMode.value==='next')return nextCut(req,cur);if(targetMode.value==='custom'){const rating=clamp(parseInt(customTarget.value)||0,0,200);return {rating,damage:damageAt(req,rating)}}const dmg=parseInt(targetMode.value)||100;return {rating:cutRating(req,dmg),damage:dmg}}
  function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
  function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
  function dateLabel(d){return d.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'})}
  function pointsNeeded(target,cur,carry){if(cur>=target)return 0;const steps=Math.ceil((target-cur)/5);return Math.max(0,steps*25-carry)}
  function simulateEta(need,useWeekly){
    if(need<=0)return {days:0,date:startOfDay(new Date()),daily:0,weekly:0};
    let earned=0,dailyCount=0,weeklyCount=0;const today=startOfDay(new Date());
    for(let day=0;day<=730;day++){
      const date=addDays(today,day);
      if(day>0||!dailyDone.checked){earned+=20;dailyCount++;if(earned>=need)return {days:day,date,daily:dailyCount,weekly:weeklyCount}}
      if(useWeekly){const canWeekly=day===0?!weeklyDone.checked:date.getDay()===1;if(canWeekly){earned+=40;weeklyCount++;if(earned>=need)return {days:day,date,daily:dailyCount,weekly:weeklyCount}}}
    }
    return null;
  }
  function updateGrowth(req,cur){
    const carry=clamp(parseInt(growth.value)||0,0,24);const target=targetInfo(req,cur);customTarget.style.display=targetMode.value==='custom'?'block':'none';
    const need=pointsNeeded(target.rating,cur,carry);
    q('targetRatingDisplay').textContent=String(target.rating);q('growthNeeded').textContent=need.toLocaleString();q('targetDamageDisplay').textContent=target.damage+'%';
    if(need<=0){q('dailyOnlyEta').textContent='이미 달성';q('fullEta').textContent='이미 달성';q('ratingEtaDate').textContent='현재 달성';q('ratingEtaExplain').textContent='현재 레이팅 '+cur+'으로 선택한 목표 레이팅 '+target.rating+'을 이미 충족했습니다.';return}
    const daily=simulateEta(need,false),full=simulateEta(need,true);
    q('dailyOnlyEta').textContent=daily?daily.daily+'회 · '+(daily.days===0?'오늘':daily.days+'일 후'):'-';
    q('fullEta').textContent=full?((full.days===0?'오늘':full.days+'일 후')+' · 일퀘 '+full.daily+' / 주간 '+full.weekly):'-';
    q('ratingEtaDate').textContent=full?dateLabel(full.date):'-';
    q('ratingEtaExplain').textContent='현재 '+cur+' → 목표 '+target.rating+' ('+target.damage+'% 배율) · 필요 '+need+'포인트 · 오늘 일퀘 '+(dailyDone.checked?'완료':'미완료')+' / 이번 주 주간퀘 '+(weeklyDone.checked?'완료':'미완료')+' 기준';
  }
  function updateEnv(){
    const isRating=fieldMode.value==='rating';['ratingFieldWrap','currentRatingWrap','guildBossWrap','ratingMetrics','ratingAdvice','ratingGrowthWrap'].forEach(id=>{const el=q(id);if(el)el.style.display=isRating?'':'none'});if(!isRating)return;
    const req=parseFloat(ratingField.value)||0,cur=clamp(parseFloat(currentRating.value)||0,0,200),ratio=req>0?cur/req:1,m=ratingMultiplier(ratio);
    q('recommendedRating').textContent=String(req);q('ratingRatio').textContent=(ratio*100).toFixed(1)+'%';q('ratingDamage').textContent=(m*100).toFixed(0)+'%';
    q('ratingGain').textContent=m<1?'권장 레이팅 도달 시 현재 대비 실전 피해량 +'+((1/m-1)*100).toFixed(1)+'%':'권장 레이팅 충족 · 피해 감소 없음';
    updateGrowth(req,cur);
    try{localStorage.setItem('planet-v2-env',JSON.stringify({mode:fieldMode.value,field:ratingField.selectedIndex,rating:currentRating.value,guild:guild.checked,growth:growth.value,targetMode:targetMode.value,customTarget:customTarget.value,dailyDone:dailyDone.checked,weeklyDone:weeklyDone.checked}))}catch(e){}
  }
  try{const raw=localStorage.getItem('planet-v2-env');if(raw){const d=JSON.parse(raw);if(d.mode)fieldMode.value=d.mode;if(Number.isInteger(d.field)&&ratingField.options[d.field])ratingField.selectedIndex=d.field;if(d.rating!==undefined)currentRating.value=d.rating;if(d.guild!==undefined)guild.checked=!!d.guild;if(d.growth!==undefined)growth.value=d.growth;if(d.targetMode)targetMode.value=d.targetMode;if(d.customTarget!==undefined)customTarget.value=d.customTarget;if(d.dailyDone!==undefined)dailyDone.checked=!!d.dailyDone;if(d.weeklyDone!==undefined)weeklyDone.checked=!!d.weeklyDone}}catch(e){}
  [fieldMode,ratingField,currentRating,guild,growth,targetMode,customTarget,dailyDone,weeklyDone].forEach(el=>{el.addEventListener('input',updateEnv);el.addEventListener('change',updateEnv)});updateEnv();
})();
</script>`;

function patchV2(html){
  html=html.replace('메이플 플래닛 계산기 <span class="tag">V1.8 DEV</span>','메이플 플래닛 계산기 <span class="tag">V2.0 DEV</span>');
  html=html.replace('사자왕의 성 무기 잠재 비교 · 간편 / 심화 계산 지원','사자왕의 성 레이팅 필드 · 보공 포함 무기 잠재 비교');
  if(!html.includes('id="huntingEnvironment"'))html=html.replace('<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택">',FIELD_HTML+'<div class="mode-switch" role="tablist" aria-label="계산기 종류 선택">');
  html=html.replace('["총데미지 +9%","dmg",9],["주스탯 +6%"','["총데미지 +9%","dmg",9],["보스 공격력 +20%","boss",20],["보스 공격력 +30%","boss",30],["주스탯 +6%"');
  html=html.replace('let r={flat:0,atkPct:0,crit:0,statPct:0,statFlat:0};','let r={flat:0,atkPct:0,crit:0,statPct:0,statFlat:0,boss:0};');
  html=html.replace("if(o[1]==='statFlat')r.statFlat+=o[2]","if(o[1]==='statFlat')r.statFlat+=o[2];if(o[1]==='boss')r.boss+=o[2]");
  html=html.replace("w.dmgMult=1+w.dmg/100;w.score=w.attackIndex*w.critMult*w.dmgMult;","const ratingBoss=document.getElementById('fieldMode')?.value==='rating';const guildBoss=ratingBoss&&document.getElementById('guildBossToggle')?.checked?5:0;w.bossApplied=ratingBoss?(w.boss+guildBoss):0;w.dmgMult=1+(w.dmg+w.bossApplied)/100;w.score=w.attackIndex*w.critMult*w.dmgMult;");
  html=html.replace('<th>크리배율</th><th>총뎀배율</th>','<th>크리배율</th><th>무기보공</th><th>적용보공</th><th>총뎀+보공 배율</th>');
  html=html.replace('<td>×${fmt(w.critMult,4)}</td><td>×${fmt(w.dmgMult,4)}</td>','<td>×${fmt(w.critMult,4)}</td><td>${fmt(w.boss||0,0)}%</td><td>${fmt(w.bossApplied||0,0)}%</td><td>×${fmt(w.dmgMult,4)}</td>');
  html=html.replace('총데미지는 각 무기를 착용했을 때의 <b>최종 스탯창 총데미지</b>를 입력하세요.','총데미지는 각 무기를 착용했을 때의 <b>최종 스탯창 총데미지</b>를 입력하세요. 레이팅 필드 선택 시 잠재의 <b>보스 공격력 +20% / +30%</b>와 길드스킬 보공 +5%가 총데미지와 합산되어 적용됩니다.');
  html=html.replace("<label>현재 무기 총데미지 (%)</label>\n      <input id=\"quickCurrentDmg\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 15\">","<label>현재 무기 총데미지 (%)</label>\n      <input id=\"quickCurrentDmg\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 15\">\n      <label>현재 무기 보스 공격력 (%)</label>\n      <input id=\"quickCurrentBoss\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 60\">");
  html=html.replace("<label>비교 무기 총데미지 (%)</label>\n      <input id=\"quickCandidateDmg\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 9\">","<label>비교 무기 총데미지 (%)</label>\n      <input id=\"quickCandidateDmg\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 9\">\n      <label>비교 무기 보스 공격력 (%)</label>\n      <input id=\"quickCandidateBoss\" type=\"number\" min=\"0\" step=\"1\" placeholder=\"예: 60\">");
  html=html.replace("const s=num('quickMaxRange'),per=num('quickAtkPer1'),atk=num('quickAtkDelta'),d1=num('quickCurrentDmg'),d2=num('quickCandidateDmg');","const s=num('quickMaxRange'),per=num('quickAtkPer1'),atk=num('quickAtkDelta'),d1=num('quickCurrentDmg'),d2=num('quickCandidateDmg');const ratingBoss=document.getElementById('fieldMode')?.value==='rating';const guildBoss=ratingBoss&&document.getElementById('guildBossToggle')?.checked?5:0;const b1=ratingBoss?num('quickCurrentBoss')+guildBoss:0,b2=ratingBoss?num('quickCandidateBoss')+guildBoss:0;");
  html=html.replace("const rel=(changed/s)*((100+d2)/(100+d1));","const rel=(changed/s)*((100+d2+b2)/(100+d1+b1));");
  html=html.replace("const dmgDiff=d1-d2;\n    if(gain!==0&&dmgDiff!==0){const be=gain*(100+d2)/dmgDiff;","const dmgDiff=(d1+b1)-(d2+b2);\n    if(gain!==0&&dmgDiff!==0){const be=gain*(100+d2+b2)/dmgDiff;");
  html=html.replace("const atkPct=gain/s*100,dmgRatio=((100+d2)/(100+d1)-1)*100;","const atkPct=gain/s*100,dmgRatio=((100+d2+b2)/(100+d1+b1)-1)*100;");
  html=html.replace("['quickMaxRange','quickAtkPer1','quickAtkDelta','quickCurrentDmg','quickCandidateDmg']","['quickMaxRange','quickAtkPer1','quickAtkDelta','quickCurrentDmg','quickCandidateDmg','quickCurrentBoss','quickCandidateBoss']");
  html=html.replace('</body>',V2_SCRIPT+'</body>');return html;
}

export default {async fetch(request,env,ctx){const response=await baseWorker.fetch(request,env,ctx);const url=new URL(request.url);if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;const contentType=response.headers.get('content-type')||'';if(!contentType.includes('text/html'))return response;let html=await response.text();html=patchV2(html);const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');return new Response(html,{status:response.status,statusText:response.statusText,headers});}};