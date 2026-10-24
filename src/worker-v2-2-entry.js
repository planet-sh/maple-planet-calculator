import app from './worker-v2-2.js';

const CAPTAIN_SHARE_STYLE = `
<style id="v22CaptainShareStyle">
.v22-summary-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(320px,.85fr);gap:16px;align-items:start;margin-top:14px}
.v22-summary-layout>#result{margin:0!important}
.v22-summary-panel{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;min-width:0}
.v22-summary-panel h2{margin-top:0}
.v22-summary-panel textarea{width:100%;min-height:310px;resize:vertical;line-height:1.65;font-size:14px;white-space:pre-wrap}
.v22-summary-copy{width:100%;margin-top:10px;background:var(--panel2);color:var(--text);border:1px solid var(--line)}
.v22-summary-copy:hover{background:var(--accent);color:var(--accentText)}
.v22-summary-copy.copied{background:var(--good);color:#081126}
@media(max-width:1050px){.v22-summary-layout{grid-template-columns:1fr}.v22-summary-panel textarea{min-height:220px}}
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

  function init(){
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
    if(captainPath){headers.set('x-planet-captain-share','v22-inline-panel');headers.set('x-planet-route','captain-worker-first');}
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
