import app from './worker-v2-2-entry.js';

const DIRECT_SUMMARY_STYLE = `
<style id="v22DirectSummaryStyle">
.v22-direct-summary-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(380px,.85fr);gap:12px;align-items:start;margin-top:8px}
.v22-direct-summary-layout>#directResult{margin:0!important;min-width:0}
.v22-direct-summary-panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}
.v22-direct-summary-panel h2{margin:0 0 5px}
.v22-direct-summary-panel textarea{width:100%;min-height:240px;resize:vertical;line-height:1.5;font-size:13px;white-space:pre-wrap;background:var(--input);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-family:inherit;box-shadow:none;outline:none}
.v22-direct-summary-panel textarea:focus{border-color:var(--accent)}
.v22-direct-summary-copy{width:100%;margin-top:7px;background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.v22-direct-summary-copy:hover{background:var(--accent);color:var(--accentText)}
.v22-direct-summary-copy.copied{background:var(--good);color:#081126}
@media(max-width:1180px){.v22-direct-summary-layout{grid-template-columns:1fr}.v22-direct-summary-panel textarea{min-height:220px}}
</style>`;

const DIRECT_SUMMARY_SCRIPT = `
<script id="v22DirectSummaryScript">
window.v22DirectSummary=(function(){
  const q=id=>document.getElementById(id);
  const num=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;
  const fmt=n=>Math.floor(Number(n)||0).toLocaleString('ko-KR')+' mesos';
  const url=()=>location.origin+'/captain';

  function text(){
    const market=Math.max(0,+(q('marketPrice')?.value||0));
    const budget=num(q('directBudget')?.textContent);
    const seller=num(q('directSellerNet')?.textContent);
    if(market<=0&&budget<=0&&seller<=0)return '';

    const members=Math.max(1,Math.floor(+(q('directMembers')?.value||1)));
    const route=q('paymentRoute')?.value||'directMail';
    const routeLabel=route==='representativeTrade'
      ?'구매자 → 대표자 교환 후 재분배'
      :'구매자 → 공대원 직접 택배';

    const lines=[
      '📊 플래닛정산 직거래 결과','',
      '💰 경매장 기준가 '+fmt(market),
      '🤝 직거래 합의금액 '+fmt(budget),
      '🧭 거래 방식 '+routeLabel,
      '👥 총 분배 인원 '+members+'명'
    ];

    if(route==='representativeTrade'){
      const repRate=Math.max(0,+(q('representativeRate')?.value||0));
      lines.push('👤 대표자 분배율 '+repRate.toFixed(0)+'%');
    }

    if(q('directWeightedToggle')?.checked){
      const wm=Math.max(1,Math.floor(+(q('directWeightedMembers')?.value||1)));
      const rate=Math.max(0,+(q('directWeightedRate')?.value||0));
      lines.push('⚖️ 차등 분배 '+wm+'명 · '+rate.toFixed(0)+'%');
    }else{
      lines.push('⚖️ 분배 방식 균등 분배');
    }

    lines.push(
      '✅ 판매자 실수령 '+fmt(seller),
      '💸 구매자 절감 '+fmt(num(q('directSave')?.textContent)),
      '📦 총 택배 수수료 '+fmt(num(q('directFee')?.textContent)),
      '🧮 총 지분 '+String(q('directShares')?.textContent||'-'),
      '',url()
    );
    return lines.join('\\n');
  }

  function paint(){
    const ta=q('v22DirectSummaryText');if(!ta)return;
    const value=text();
    ta.value=value||'직거래 정산을 계산하면 거래 방식까지 포함한 디스코드용 요약이 여기에 자동 생성됩니다.';
    ta.dataset.ready=value?'1':'0';
  }

  function copy(){
    const ta=q('v22DirectSummaryText');
    const btn=q('v22DirectSummaryCopy');
    if(!ta||ta.dataset.ready!=='1')return alert('먼저 직거래 정산을 계산해주세요.');
    ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
    let ok=false;try{ok=document.execCommand('copy')===true}catch(e){ok=false}
    const done=()=>{const old=btn.textContent;btn.textContent='✅ 복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)};
    if(ok){done();return;}
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(ta.value).then(done).catch(()=>{ta.focus();ta.select();alert('자동 복사가 막혀 있습니다. 선택된 텍스트를 Ctrl+C로 복사해주세요.')});}
    else alert('선택된 텍스트를 Ctrl+C로 복사해주세요.');
  }

  function init(){
    const result=q('directResult');
    if(!result||q('v22DirectSummaryPanel'))return;
    const wrap=document.createElement('div');
    wrap.className='v22-direct-summary-layout';
    wrap.id='v22DirectSummaryLayout';
    result.parentNode.insertBefore(wrap,result);
    wrap.appendChild(result);

    const panel=document.createElement('section');
    panel.className='v22-direct-summary-panel';
    panel.id='v22DirectSummaryPanel';
    panel.innerHTML='<h2>📋 직거래 디스코드 요약</h2><div class="small">직거래 금액뿐 아니라 실제 돈 전달 방식과 차등 조건까지 함께 정리합니다.</div><textarea id="v22DirectSummaryText" readonly>직거래 정산을 계산하면 거래 방식까지 포함한 디스코드용 요약이 여기에 자동 생성됩니다.</textarea><button type="button" id="v22DirectSummaryCopy" class="v22-direct-summary-copy" onclick="window.v22DirectSummary&&window.v22DirectSummary.copy()">📋 직거래 요약 복사</button>';
    wrap.appendChild(panel);

    q('calcDirect')?.addEventListener('click',()=>setTimeout(paint,0));
    ['paymentRoute','directMembers','representativeRate','directWeightedToggle','directWeightedMembers','directWeightedRate'].forEach(id=>q(id)?.addEventListener('change',paint));
    new MutationObserver(paint).observe(result,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
    paint();
  }

  return {init,paint,copy,text};
})();
window.v22DirectSummary.init();
</script>`;

function patchCaptain(html){
  if(!html.includes('id="v22DirectSummaryStyle"')) html=html.replace('</head>',DIRECT_SUMMARY_STYLE+'</head>');
  html=html.replace(/<script id="v22DirectSummaryScript">[\s\S]*?<\/script>/i,'');
  html=html.replace('</body>',DIRECT_SUMMARY_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    const captainPath=url.pathname==='/captain'||url.pathname==='/captain/'||url.pathname==='/captain.html';
    if(!captainPath) return response;
    let html=await response.text();
    html=patchCaptain(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-direct-summary','v22');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
