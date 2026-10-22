import baseWorker from './worker-v2.js';

const BUFF_HTML = `
<div id="huntingBuffWrap" style="margin-top:14px">
  <h3 style="margin:0 0 8px">사냥 버프</h3>
  <div class="grid">
    <div>
      <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0;cursor:pointer;color:var(--text)">
        <input id="sprinkleToggle" type="checkbox" checked style="width:auto;transform:scale(1.2);margin:0">
        <span><b>뿌리기 · 공격력 +20</b><br><span class="small">일반/정밀 계산의 버프 깡공에 +20 적용</span></span>
      </label>
    </div>
    <div>
      <label style="display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0;cursor:pointer;color:var(--text)">
        <input id="heroEchoToggle" type="checkbox" style="width:auto;transform:scale(1.2);margin:0">
        <span><b>영웅의 메아리 · 공격력 +4%</b><br><span class="small">잠재 공격력%와 같은 계열로 합산하여 적용</span></span>
      </label>
    </div>
  </div>
  <div class="small" style="margin-top:8px;line-height:1.7">
    ※ 빠른 비교는 입력한 실측 최대스공·공1 효율에 버프 효과가 이미 포함된 것으로 봅니다. <b>실측 당시와 같은 버프 상태</b>로 비교해주세요.<br>
    ※ 메이플 용사처럼 순수 주스탯에 적용되는 버프는 별도 계산하지 않습니다. 공1/주스탯 실측 시 실제 사냥 상태와 동일하게 유지해주세요.
  </div>
</div>`;

const BUFF_SCRIPT = `
<script>
(()=>{
  const sprinkle=document.getElementById('sprinkleToggle');
  const echo=document.getElementById('heroEchoToggle');
  if(!sprinkle||!echo)return;
  try{
    const raw=localStorage.getItem('planet-v2-buffs');
    if(raw){const d=JSON.parse(raw);if(d.sprinkle!==undefined)sprinkle.checked=!!d.sprinkle;if(d.echo!==undefined)echo.checked=!!d.echo}
  }catch(e){}
  function save(){try{localStorage.setItem('planet-v2-buffs',JSON.stringify({sprinkle:sprinkle.checked,echo:echo.checked}))}catch(e){}}
  sprinkle.addEventListener('change',save);echo.addEventListener('change',save);
})();
</script>`;

const QUICK_BOSS_FIX_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const num=id=>{const v=parseFloat(q(id)?.value);return Number.isFinite(v)?v:0};
  function recalcQuickV2(){
    if(!q('quickCompareSection'))return;
    const s=num('quickMaxRange'),per=num('quickAtkPer1'),atk=num('quickAtkDelta');
    const d1=num('quickCurrentDmg'),d2=num('quickCandidateDmg');
    const isRating=q('fieldMode')?.value==='rating';
    const guildBoss=isRating&&q('guildBossToggle')?.checked?5:0;
    const b1=isRating?num('quickCurrentBoss')+guildBoss:0;
    const b2=isRating?num('quickCandidateBoss')+guildBoss:0;
    const gain=per*atk;
    if(q('quickAtkGain'))q('quickAtkGain').textContent=(gain>=0?'+':'')+(Number.isFinite(gain)?gain.toFixed(0):'0');
    if(s<=0||per<=0){if(q('quickRelative'))q('quickRelative').textContent='-';if(q('quickBreakEven'))q('quickBreakEven').textContent='-';if(q('quickVerdict'))q('quickVerdict').textContent='최대 스공과 공1 효율을 입력해주세요.';return}
    const changed=s+gain;
    if(changed<=0)return;
    const rel=(changed/s)*((100+d2+b2)/(100+d1+b1));
    const pct=(rel-1)*100;
    if(q('quickRelative'))q('quickRelative').textContent=(rel*100).toFixed(2)+'%';
    let beText='해당 없음';
    const dmgDiff=(d1+b1)-(d2+b2);
    if(gain!==0&&dmgDiff!==0){const be=gain*(100+d2+b2)/dmgDiff;if(be>0&&Number.isFinite(be))beText=Math.round(be).toLocaleString()}
    if(q('quickBreakEven'))q('quickBreakEven').textContent=beText;
    if(q('quickVerdict')){
      if(Math.abs(pct)<0.05)q('quickVerdict').textContent='거의 동일 · 오차 범위 수준';
      else if(pct>0)q('quickVerdict').textContent='비교 무기 우세 · 현재 대비 +'+pct.toFixed(2)+'%';
      else q('quickVerdict').textContent='현재 무기 우세 · 비교 무기 '+pct.toFixed(2)+'%';
    }
    const atkPct=gain/s*100,dmgRatio=((100+d2+b2)/(100+d1+b1)-1)*100;
    if(q('quickExplain'))q('quickExplain').textContent='스공 변화 '+(atkPct>=0?'+':'')+atkPct.toFixed(2)+'% · 총뎀+보공 배율 변화 '+(dmgRatio>=0?'+':'')+dmgRatio.toFixed(2)+'% · 길드보공 '+(guildBoss?'+5%':'OFF')+' · 두 배율을 곱해 최종 비교';
  }
  ['quickMaxRange','quickAtkPer1','quickAtkDelta','quickCurrentDmg','quickCandidateDmg','quickCurrentBoss','quickCandidateBoss','fieldMode','guildBossToggle'].forEach(id=>{
    const el=q(id);if(!el)return;el.addEventListener('input',recalcQuickV2);el.addEventListener('change',recalcQuickV2);
  });
  recalcQuickV2();
})();
</script>`;

function patchBuffs(html){
  if(!html.includes('id="huntingBuffWrap"')){
    html=html.replace('<div class="metrics" id="ratingMetrics" style="margin-top:14px">',BUFF_HTML+'<div class="metrics" id="ratingMetrics" style="margin-top:14px">');
  }

  html=html.replace(
    "const equip=n('equipAtk'),baseCrit=n('crit'),cd=jobs[job.value].cd||0,sharpCrit=jobs[job.value].sharpCrit??15,sharpCd=jobs[job.value].sharpCd??140,buffV=buff.value==='custom'?n('buffCustom'):+buff.value;const ws=",
    "const equip=n('equipAtk'),baseCrit=n('crit'),cd=jobs[job.value].cd||0,sharpCrit=jobs[job.value].sharpCrit??15,sharpCd=jobs[job.value].sharpCd??140,buffBase=buff.value==='custom'?n('buffCustom'):+buff.value,sprinkle=document.getElementById('sprinkleToggle')?.checked?20:0,buffV=buffBase+sprinkle;const ws="
  );

  html=html.replace(
    'const pure=equip-cur.atk+w.atk,pctBase=pure+w.flat,pctGain=pctBase*w.atkPct/100;',
    "const pure=equip-cur.atk+w.atk,pctBase=pure+w.flat,echoAtkPct=document.getElementById('heroEchoToggle')?.checked?4:0,pctGain=pctBase*(w.atkPct+echoAtkPct)/100;"
  );

  html=html.replace(
    '직업 자체 크뎀 ${cd}%p + 찐샾 ${sharpCd}%p / 찐샾 크확 +${sharpCrit}%p / 버프공 +${buffV}<br>',
    "직업 자체 크뎀 ${cd}%p + 찐샾 ${sharpCd}%p / 찐샾 크확 +${sharpCrit}%p / 버프공 +${buffV} (뿌리기 ${document.getElementById('sprinkleToggle')?.checked?'ON':'OFF'}) / 영메 공% ${document.getElementById('heroEchoToggle')?.checked?'+4%':'OFF'}<br>"
  );

  html=html.replace(
    '<b>측정 조건: 리프레 대기 상태 · 혼테일 버프만 적용</b><br>',
    '<b>측정 조건: 리프레 대기 상태 · 실제 사냥 버프 상태 고정</b><br>'
  );
  html=html.replace(
    '다른 공격력 버프·소비 아이템·일시 버프는 끄고, 같은 상태에서 최대 스공과 공1당 최대 스공 상승량을 측정하세요.<br>',
    '혼테일 버프를 기본으로 하되 뿌리기·영메를 사용한다면 <b>두 실측 모두 같은 ON/OFF 상태</b>로 최대 스공과 공1당 최대 스공 상승량을 측정하세요.<br>'
  );

  html=html.replace('</body>',BUFF_SCRIPT+QUICK_BOSS_FIX_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request, env, ctx) {
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();
    html=patchBuffs(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};