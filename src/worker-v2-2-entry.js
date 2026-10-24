import app from './worker-v2-2.js';

const CAPTAIN_SHARE_STYLE = `
<style id="v22CaptainShareStyle">
.v22-share-copy{width:100%;margin:8px 0 14px;background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.v22-share-copy:hover{background:var(--accent);color:var(--accentText)}
.v22-share-copy.copied{background:var(--good);color:#081126}
.v22-copy-fallback{position:fixed;inset:0;z-index:100000;background:rgba(2,6,23,.72);display:flex;align-items:center;justify-content:center;padding:20px}
.v22-copy-fallback>div{width:min(680px,100%);background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.v22-copy-fallback textarea{width:100%;min-height:280px;margin-top:10px;resize:vertical;line-height:1.6}
.v22-copy-fallback-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
</style>`;

const CAPTAIN_SHARE_SCRIPT = `
<script id="v22CaptainShareScript">
(()=>{
  const q=id=>document.getElementById(id);
  const num=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;
  const fmt=n=>Math.floor(Number(n)||0).toLocaleString('ko-KR')+' mesos';
  const url=()=>location.origin+'/captain';

  function legacyCopy(text){
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.left='-9999px';
    ta.style.top='0';
    ta.style.opacity='0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0,ta.value.length);
    let ok=false;
    try{ok=document.execCommand('copy')===true}catch(e){ok=false}
    ta.remove();
    return ok;
  }

  function showSummaryPopup(text){
    q('v22CopyFallback')?.remove();
    const overlay=document.createElement('div');
    overlay.id='v22CopyFallback';
    overlay.className='v22-copy-fallback';
    overlay.innerHTML='<div><b>📊 디스코드용 정산 요약</b><div class="small" style="margin-top:5px">아래 내용을 확인한 뒤 복사하세요. 자동 복사가 막히면 텍스트가 전체 선택된 상태로 남습니다.</div><textarea id="v22CopyFallbackText" readonly></textarea><div class="v22-copy-fallback-actions"><button type="button" class="secondary" id="v22CopyClose">닫기</button><button type="button" class="primary" id="v22CopyRetry" style="width:auto;margin:0">📋 복사</button></div></div>';
    document.body.appendChild(overlay);
    const ta=q('v22CopyFallbackText');
    ta.value=text;
    ta.focus();
    ta.select();
    ta.setSelectionRange(0,ta.value.length);
    q('v22CopyClose').onclick=()=>overlay.remove();
    q('v22CopyRetry').onclick=()=>{
      ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
      if(legacyCopy(text)){
        q('v22CopyRetry').textContent='✅ 복사됨';
        setTimeout(()=>overlay.remove(),700);
        return;
      }
      if(navigator.clipboard?.writeText){
        navigator.clipboard.writeText(text).then(()=>{
          q('v22CopyRetry').textContent='✅ 복사됨';
          setTimeout(()=>overlay.remove(),700);
        }).catch(()=>{
          ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
          q('v22CopyRetry').textContent='Ctrl+C로 복사';
        });
      }else{
        ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
        q('v22CopyRetry').textContent='Ctrl+C로 복사';
      }
    };
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
  }

  function hasCalculatedNormal(){
    return num(q('normalTake')?.textContent)>0||num(q('saleItemTotal')?.textContent)>0||num(q('receivedAmount')?.value)>0;
  }

  function hasCalculatedDirect(){
    return num(q('directSellerNet')?.textContent)>0||num(q('directBudget')?.textContent)>0||num(q('marketPrice')?.value)>0;
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
  normalBtn?.addEventListener('click',()=>{
    if(!hasCalculatedNormal()) return alert('먼저 일반 정산을 계산해주세요.');
    showSummaryPopup(normalSummary());
  });
  directBtn?.addEventListener('click',()=>{
    if(!hasCalculatedDirect()) return alert('먼저 직거래 정산을 계산해주세요.');
    showSummaryPopup(directSummary());
  });
})();
</script>`;

function patchCaptain(html){
  if(!html.includes('id="v22CaptainShareStyle"')) html=html.replace('</head>',CAPTAIN_SHARE_STYLE+'</head>');
  if(!html.includes('id="copySettlementSummary"')){
    html=html.replace(/(<button[^>]*id="calc"[^>]*>[\s\S]*?<\/button>)/i,'$1<button id="copySettlementSummary" type="button" class="v22-share-copy">📋 디스코드용 정산 요약 복사</button>');
  }else{
    html=html.replace(/(<button[^>]*id="copySettlementSummary"[^>]*)\sdisabled(>)/i,'$1$2');
  }
  if(!html.includes('id="copyDirectSummary"')){
    html=html.replace(/(<button[^>]*id="calcDirect"[^>]*>[\s\S]*?<\/button>)/i,'$1<button id="copyDirectSummary" type="button" class="v22-share-copy">📋 디스코드용 직거래 요약 복사</button>');
  }else{
    html=html.replace(/(<button[^>]*id="copyDirectSummary"[^>]*)\sdisabled(>)/i,'$1$2');
  }
  if(!html.includes('id="v22CaptainShareScript"')) html=html.replace('</body>',CAPTAIN_SHARE_SCRIPT+'</body>');
  return html;
}

function previewLabel(hostname){
  if(!hostname.endsWith('.workers.dev')) return null;
  const prefix=hostname.split('.')[0];
  if(prefix.startsWith('dev-maple-planet-calculator')) return 'DEV · branch';
  const m=prefix.match(/^([a-f0-9]{8})-maple-planet-calculator$/i);
  if(m) return 'DEV · '+m[1].toLowerCase();
  return null;
}

function patchPreviewBadge(html,label){
  if(!label||html.includes('id="v22DevBadge"')) return html;
  const badge='<div id="v22DevBadge" style="position:fixed;right:14px;bottom:14px;z-index:99999;padding:7px 10px;border-radius:999px;background:rgba(9,15,30,.92);border:1px solid rgba(148,163,184,.35);color:#cbd5e1;font:700 11px/1.2 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;letter-spacing:.02em;box-shadow:0 4px 18px rgba(0,0,0,.28);pointer-events:none">'+label+'</div>';
  return html.replace('</body>',badge+'</body>');
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;

    const captainPath=url.pathname==='/captain'||url.pathname==='/captain/'||url.pathname==='/captain.html';
    let html=await response.text();
    if(captainPath) html=patchCaptain(html);
    html=patchPreviewBadge(html,previewLabel(url.hostname));

    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    if(captainPath){
      headers.set('x-planet-captain-share','v22');
      headers.set('x-planet-route','captain-worker-first');
    }
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
