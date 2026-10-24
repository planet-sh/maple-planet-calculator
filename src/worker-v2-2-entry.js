import app from './worker-v2-2.js';

const CAPTAIN_SHARE_STYLE = `
<style id="v22CaptainShareStyle">
main{max-width:1540px!important;padding-left:24px!important;padding-right:24px!important}
.v22-summary-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(380px,.85fr);gap:12px;align-items:start;margin-top:8px}
.v22-summary-layout>#result{margin:0!important;min-width:0}
.v22-summary-panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}
.v22-summary-panel h2{margin:0 0 5px}
.v22-summary-panel textarea{width:100%;min-height:220px;resize:vertical;line-height:1.5;font-size:13px;white-space:pre-wrap;background:var(--input);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-family:inherit;box-shadow:none;outline:none}
.v22-summary-panel textarea:focus{border-color:var(--accent)}
.v22-summary-copy{width:100%;margin-top:7px;background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.v22-summary-copy:hover{background:var(--accent);color:var(--accentText)}
.v22-summary-copy.copied{background:var(--good);color:#081126}

@media(min-width:1181px){
  main{padding-top:12px!important;padding-bottom:28px!important}
  .topnav{margin-bottom:10px!important;padding:4px!important;gap:5px!important;border-radius:10px!important}
  .topnav a{padding:8px!important;border-radius:8px!important;font-size:13px!important}
  h1{font-size:22px!important;margin:0 0 2px!important}
  .sub{margin-bottom:10px!important;font-size:12px!important}
  .card{padding:12px!important;margin:8px 0!important;border-radius:12px!important}
  .card h2{font-size:18px!important;margin:0 0 8px!important}
  .card h3{font-size:15px!important;margin-top:12px!important;margin-bottom:6px!important}
  .grid{gap:8px!important}
  label{font-size:11px!important;margin:4px 0 3px!important}
  input,select{padding:8px 9px!important;font-size:14px!important;border-radius:8px!important;min-height:34px!important}
  button{padding:9px 13px!important;font-size:13px!important;border-radius:9px!important}
  .primary{margin-top:8px!important}
  .secondary{padding:8px 12px!important}
  .danger{padding:6px 8px!important;font-size:11px!important}
  .metric{padding:9px 10px!important;margin-top:6px!important;border-radius:9px!important}
  .metric b{font-size:18px!important;margin-top:2px!important}
  .small{font-size:11px!important;line-height:1.4!important}
  .toggle{padding:8px 10px!important;border-radius:9px!important;gap:8px!important}
  .item-row{gap:6px!important;margin-top:5px!important}
  .flow{gap:7px!important;margin:8px 0!important}
  .flow>div{padding:8px!important;border-radius:9px!important}
  .flow b{margin-bottom:2px!important}
  .section-note{padding:7px 9px!important;margin-top:6px!important;border-radius:6px!important}
  table{margin-top:6px!important;font-size:11px!important}
  th,td{padding:5px 6px!important}
  #weightedFields>.grid,#routeRepFields>.grid,#directWeightedFields>.grid{margin-top:7px!important}
  #directTradeCard h3[style]{margin-top:12px!important}
  .v22-summary-panel{padding:12px!important}

  .v22-sale-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:2px}
  .v22-sale-meta>div{min-width:0}
  .v22-sale-items{display:grid!important;grid-template-columns:minmax(0,1fr) auto 220px;gap:8px;align-items:end;margin-top:8px!important}
  .v22-sale-items>label{grid-column:1/-1;margin:0!important}
  .v22-sale-items>#saleItems{grid-column:1;min-width:0}
  .v22-sale-items>#addSaleItem{grid-column:2;margin:0!important;align-self:end;white-space:nowrap}
  .v22-sale-items>.metric{grid-column:3;margin:0!important;min-height:52px;display:flex;flex-direction:column;justify-content:center}
  .v22-sale-items .item-row{margin-top:0!important}
  .v22-precalc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0}
  .v22-precalc-grid>.card{margin:0!important;height:100%}
  .v22-precalc-grid .toggle{min-height:54px}
}

@media(max-width:1180px){
  main{max-width:980px!important;padding-left:16px!important;padding-right:16px!important}
  .v22-summary-layout{grid-template-columns:1fr}
  .v22-summary-panel textarea{min-height:220px}
}
</style>`;

const CAPTAIN_SHARE_SCRIPT = `
<script id="v22CaptainShareScript">
window.v22CaptainSummary=(function(){
  const q=id=>document.getElementById(id);
  const num=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;
  const fmt=n=>Math.floor(Number(n)||0).toLocaleString('ko-KR')+' mesos';
  const url=()=>location.origin+'/captain';

  function normalText(){
    const mode=q('amountMode')?.value||'sale';
    const raw=mode==='sale'?num(q('saleItemTotal')?.textContent):Math.max(0,+(q('receivedAmount')?.value||0));
    const normalTake=num(q('normalTake')?.textContent);
    if(normalTake<=0&&raw<=0)return '';
    const members=Math.max(1,Math.floor(+(q('members')?.value||1)));
    const scissors=Math.max(0,+(q('scissors')?.value||0));
    const fund=window.fundDeductionTotal?window.fundDeductionTotal():0;
    const lines=['📊 플래닛정산 결과','','💰 '+fmt(raw),'👥 '+members+'명','✂️ 가위값 '+fmt(scissors)];
    if(fund>0)lines.push('🧾 공금 차감 '+fmt(fund));
    lines.push('🧮 '+(mode==='sale'?'판매금액 기준':'수령금액 기준'));
    lines.push('✅ 정상 참여자 1인 '+fmt(normalTake));
    if(q('weightedToggle')?.checked){
      const wm=Math.max(1,Math.floor(+(q('weightedMembers')?.value||1)));
      const rate=Math.max(0,+(q('weightedRate')?.value||0));
      lines.push('⚖️ 차등 '+wm+'명 · '+rate.toFixed(0)+'% → 1인 '+fmt(num(q('weightedTake')?.textContent)));
    }
    lines.push('',url());
    return lines.join('\\n');
  }

  function paint(){
    const ta=q('v22SummaryText');if(!ta)return;
    const text=normalText();
    ta.value=text||'일반 정산을 계산하면 디스코드용 요약이 여기에 자동 생성됩니다.';
    ta.dataset.ready=text?'1':'0';
  }

  function copy(){
    const ta=q('v22SummaryText');const btn=q('v22SummaryCopy');
    if(!ta||ta.dataset.ready!=='1')return alert('먼저 일반 정산을 계산해주세요.');
    ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
    let ok=false;try{ok=document.execCommand('copy')===true}catch(e){ok=false}
    if(ok){const old=btn.textContent;btn.textContent='✅ 복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200);return;}
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(ta.value).then(()=>{const old=btn.textContent;btn.textContent='✅ 복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)}).catch(()=>{ta.focus();ta.select();alert('자동 복사가 막혀 있습니다. 선택된 텍스트를 Ctrl+C로 복사해주세요.')});}
    else alert('선택된 텍스트를 Ctrl+C로 복사해주세요.');
  }

  function compactDesktop(){
    const saleItemsWrap=q('saleItemsWrap');
    const members=q('members');
    if(!saleItemsWrap||!members||q('v22SaleMeta'))return;
    const saleCard=saleItemsWrap.closest('.card');
    if(!saleCard)return;
    const grids=Array.from(saleCard.children).filter(el=>el.classList&&el.classList.contains('grid'));
    if(grids.length>=2){
      const meta=document.createElement('div');meta.id='v22SaleMeta';meta.className='v22-sale-meta';
      Array.from(grids[0].children).forEach(el=>meta.appendChild(el));
      Array.from(grids[1].children).forEach(el=>meta.appendChild(el));
      grids[0].remove();grids[1].remove();
      saleCard.insertBefore(meta,saleItemsWrap);
    }
    saleItemsWrap.classList.add('v22-sale-items');

    const cards=Array.from(document.querySelectorAll('main > section.card'));
    const compactCards=cards.filter(card=>{
      const t=card.querySelector('h2')?.textContent||'';
      return /공금 차감|차등 분배|택배 수수료/.test(t);
    });
    if(compactCards.length>=2&&!q('v22PrecalcGrid')){
      const wrap=document.createElement('div');wrap.id='v22PrecalcGrid';wrap.className='v22-precalc-grid';
      const first=compactCards[0];first.parentNode.insertBefore(wrap,first);
      compactCards.forEach(card=>wrap.appendChild(card));
    }
  }

  function init(){
    compactDesktop();
    const result=q('result');if(!result||q('v22SummaryPanel'))return;
    const wrap=document.createElement('div');wrap.className='v22-summary-layout';wrap.id='v22SummaryLayout';
    result.parentNode.insertBefore(wrap,result);wrap.appendChild(result);
    const panel=document.createElement('section');panel.className='v22-summary-panel';panel.id='v22SummaryPanel';
    panel.innerHTML='<h2>📋 디스코드 정산 요약</h2><div class="small">계산 결과와 함께 자동 생성됩니다. 그대로 확인 후 복사할 수 있습니다.</div><textarea id="v22SummaryText" readonly>일반 정산을 계산하면 디스코드용 요약이 여기에 자동 생성됩니다.</textarea><button type="button" id="v22SummaryCopy" class="v22-summary-copy" onclick="window.v22CaptainSummary&&window.v22CaptainSummary.copy()">📋 요약 복사</button>';
    wrap.appendChild(panel);
    q('calc')?.addEventListener('click',()=>setTimeout(paint,0));
    new MutationObserver(paint).observe(result,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
    paint();
  }

  return {init,paint,copy,normalText};
})();
window.v22CaptainSummary.init();
</script>`;

function patchCaptain(html){
  if(!html.includes('id="v22CaptainShareStyle"')) html=html.replace('</head>',CAPTAIN_SHARE_STYLE+'</head>');
  html=html.replace(/<button[^>]*id="copySettlementSummary"[^>]*>[\s\S]*?<\/button>/i,'');
  html=html.replace(/<button[^>]*id="copyDirectSummary"[^>]*>[\s\S]*?<\/button>/i,'');
  html=html.replace(/<script id="v22CaptainShareScript">[\s\S]*?<\/script>/i,'');
  html=html.replace('</body>',CAPTAIN_SHARE_SCRIPT+'</body>');
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
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    if(captainPath){headers.set('x-planet-captain-share','v22-dashboard-layout');headers.set('x-planet-route','captain-worker-first');}
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
