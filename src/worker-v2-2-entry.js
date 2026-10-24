import app from './worker-v2-2.js';

const CAPTAIN_SHARE_STYLE = `
<style id="v22CaptainShareStyle">
.v22-share-copy{width:100%;margin:8px 0 14px;background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.v22-share-copy:not(:disabled):hover{background:var(--accent);color:var(--accentText)}
.v22-share-copy:disabled{opacity:.48;cursor:not-allowed}
.v22-share-copy.copied{background:var(--good);color:#081126}
</style>`;

const CAPTAIN_SHARE_SCRIPT = `
<script id="v22CaptainShareScript">
(()=>{
  const q=id=>document.getElementById(id);
  const num=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;
  const fmt=n=>Math.floor(Number(n)||0).toLocaleString('ko-KR')+' mesos';
  const url=()=>location.origin+'/captain.html';

  async function copy(text,button){
    try{
      if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta=document.createElement('textarea');
        ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      }
      const old=button.textContent;
      button.textContent='✅ 복사됨';button.classList.add('copied');
      setTimeout(()=>{button.textContent=old;button.classList.remove('copied')},1400);
    }catch(e){alert('복사에 실패했습니다. 브라우저의 클립보드 권한을 확인해주세요.')}
  }

  function normalSummary(){
    const mode=q('amountMode')?.value||'sale';
    const raw=mode==='sale'?num(q('saleItemTotal')?.textContent):Math.max(0,+(q('receivedAmount')?.value||0));
    const members=Math.max(1,Math.floor(+(q('members')?.value||1)));
    const scissors=Math.max(0,+(q('scissors')?.value||0));
    const fund=window.fundDeductionTotal?window.fundDeductionTotal():0;
    const normal=num(q('normalTake')?.textContent);
    const lines=['📊 플래닛정산 결과','','💰 '+fmt(raw),'👥 '+members+'명','✂️ 가위값 '+fmt(scissors)];
    if(fund>0) lines.push('🧾 공금 차감 '+fmt(fund));
    lines.push('🧮 '+(mode==='sale'?'판매금액 기준':'수령금액 기준'));
    lines.push('✅ 정상 참여자 1인 '+fmt(normal));
    if(q('weightedToggle')?.checked){
      const wm=Math.max(1,Math.floor(+(q('weightedMembers')?.value||1)));
      const rate=Math.max(0,+(q('weightedRate')?.value||0));
      lines.push('⚖️ 차등 '+wm+'명 · '+rate.toFixed(0)+'% → 1인 '+fmt(num(q('weightedTake')?.textContent)));
    }
    lines.push('',url());
    return lines.join('\n');
  }

  function directSummary(){
    const market=Math.max(0,+(q('marketPrice')?.value||0));
    const members=Math.max(1,Math.floor(+(q('directMembers')?.value||1)));
    const route=q('paymentRoute')?.value==='representativeTrade'?'대표자 교환 후 재분배':'공대원 직접 택배';
    return ['📊 플래닛정산 직거래 결과','',
      '💰 경매장 최저가 '+fmt(market),
      '🤝 직거래 교환금액 '+fmt(num(q('directBudget')?.textContent)),
      '👥 '+members+'명 · '+route,
      '✅ 판매자 실수령 '+fmt(num(q('directSellerNet')?.textContent)),
      '💸 구매자 절감 '+fmt(num(q('directSave')?.textContent)),
      '📦 총 택배 수수료 '+fmt(num(q('directFee')?.textContent)),
      '',url()].join('\n');
  }

  const normalBtn=q('copySettlementSummary');
  const directBtn=q('copyDirectSummary');
  const sync=()=>{
    if(normalBtn){const r=q('result');normalBtn.disabled=!(r&&getComputedStyle(r).display!=='none')}
    if(directBtn){const r=q('directResult');directBtn.disabled=!(r&&getComputedStyle(r).display!=='none')}
  };
  normalBtn?.addEventListener('click',()=>{if(!normalBtn.disabled)copy(normalSummary(),normalBtn)});
  directBtn?.addEventListener('click',()=>{if(!directBtn.disabled)copy(directSummary(),directBtn)});
  q('calc')?.addEventListener('click',()=>requestAnimationFrame(sync));
  q('calcDirect')?.addEventListener('click',()=>requestAnimationFrame(sync));
  sync();
})();
</script>`;

function patchCaptain(html){
  if(!html.includes('id="v22CaptainShareStyle"')) html=html.replace('</head>',CAPTAIN_SHARE_STYLE+'</head>');
  if(!html.includes('id="copySettlementSummary"')){
    html=html.replace(/(<button[^>]*id="calc"[^>]*>[\s\S]*?<\/button>)/i,'$1<button id="copySettlementSummary" type="button" class="v22-share-copy" disabled>📋 디스코드용 정산 요약 복사</button>');
  }
  if(!html.includes('id="copyDirectSummary"')){
    html=html.replace(/(<button[^>]*id="calcDirect"[^>]*>[\s\S]*?<\/button>)/i,'$1<button id="copyDirectSummary" type="button" class="v22-share-copy" disabled>📋 디스코드용 직거래 요약 복사</button>');
  }
  if(!html.includes('id="v22CaptainShareScript"')) html=html.replace('</body>',CAPTAIN_SHARE_SCRIPT+'</body>');
  return html;
}

function canonicalRequest(request){
  const url=new URL(request.url);
  if(url.pathname==='/captain'||url.pathname==='/captain/'){
    url.pathname='/captain.html';
    return new Request(url.toString(),request);
  }
  if(url.pathname==='/convert'||url.pathname==='/convert/'){
    url.pathname='/convert.html';
    return new Request(url.toString(),request);
  }
  return request;
}

export default {
  async fetch(request,env,ctx){
    const originalUrl=new URL(request.url);
    const upstreamRequest=canonicalRequest(request);
    const response=await app.fetch(upstreamRequest,env,ctx);
    const type=response.headers.get('content-type')||'';
    const captainPath=originalUrl.pathname==='/captain'||originalUrl.pathname==='/captain/'||originalUrl.pathname==='/captain.html';
    if(!captainPath||!type.includes('text/html')) return response;
    let html=await response.text();
    html=patchCaptain(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');headers.delete('etag');
    headers.set('x-planet-captain-share','v22');
    headers.set('x-planet-route','captain-worker-first');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
