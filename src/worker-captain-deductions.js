import app from './worker-tools-nav.js';

const DEDUCTION_STYLE = `
<style>
.deduction-row{display:grid;grid-template-columns:1.2fr 1fr auto;gap:8px;align-items:end;margin-top:8px}
.share-copy-btn{width:100%;margin-top:12px;background:var(--accent);color:var(--accentText)}
.share-copy-btn.copied{background:var(--good);color:#081126}
@media(max-width:700px){.deduction-row{grid-template-columns:1fr}.deduction-row .danger{width:100%}}
</style>`;

const DEDUCTION_SECTION = `
<section class="card" id="fundDeductionCard">
  <h2>2. 공금 차감 항목 <span class="small">선택</span></h2>
  <div class="small">뿌리기, 불의 눈, 소모품 등 <b>공대 공금으로 먼저 처리하고 분배금에서 제외할 비용</b>을 입력합니다. 여러 항목을 추가하면 자동 합산됩니다.</div>
  <div id="fundDeductionItems" style="margin-top:12px"></div>
  <button id="addFundDeduction" type="button" class="secondary" style="margin-top:10px">＋ 차감 항목 추가</button>
  <div class="metric"><span class="small">공금 차감 총액</span><b id="fundDeductionTotal">0 메소</b></div>
  <div class="small" style="margin-top:8px">계산 순서: 판매/수령금액 → 경매장 수수료 → 가위값 → <b>공금 차감</b> → N빵/차등 분배.</div>
</section>`;

const DEDUCTION_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const wrap=q('fundDeductionItems');
  const add=q('addFundDeduction');
  const totalEl=q('fundDeductionTotal');
  if(!wrap||!add||!totalEl)return;
  let seq=0;
  const fmt=n=>Math.floor(n).toLocaleString('ko-KR')+' 메소';
  const discordFmt=n=>Math.floor(n).toLocaleString('ko-KR')+' mesos';
  const numberFromText=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;
  window.fundDeductionTotal=()=>Array.from(wrap.querySelectorAll('.fund-deduction-amount')).reduce((sum,el)=>sum+(Math.max(0,+el.value)||0),0);
  const paint=()=>{totalEl.textContent=fmt(window.fundDeductionTotal())};
  const addRow=(name='',amount='')=>{
    seq++;
    const row=document.createElement('div');
    row.className='deduction-row';
    row.innerHTML='<div><label>항목명</label><input class="fund-deduction-name" type="text" value="'+String(name).replace(/"/g,'&quot;')+'" placeholder="예: 뿌리기 / 불의 눈 / 기타"></div><div><label>차감 금액 (메소)</label><input class="fund-deduction-amount" type="number" min="0" step="1" value="'+amount+'" placeholder="예: 2000000"></div><button type="button" class="danger fund-deduction-remove">삭제</button>';
    wrap.appendChild(row);
    paint();
  };
  add.addEventListener('click',()=>addRow());
  wrap.addEventListener('input',e=>{if(e.target.classList.contains('fund-deduction-amount'))paint()});
  wrap.addEventListener('click',e=>{
    if(!e.target.classList.contains('fund-deduction-remove'))return;
    e.target.closest('.deduction-row')?.remove();
    paint();
  });
  addRow();

  function calculatorUrl(){return location.origin+'/captain.html'}
  async function copyText(text,button){
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
      else{
        const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      }
      const old=button.textContent;button.textContent='✅ 복사됨';button.classList.add('copied');setTimeout(()=>{button.textContent=old;button.classList.remove('copied')},1400);
    }catch(e){alert('복사에 실패했습니다. 브라우저의 클립보드 권한을 확인해주세요.')}
  }

  function ensureCopyButtons(){
    const result=q('result');
    if(result&&!q('copySettlementSummary')){
      const b=document.createElement('button');b.type='button';b.id='copySettlementSummary';b.className='share-copy-btn';b.textContent='📋 디스코드용 정산 요약 복사';result.appendChild(b);
      b.addEventListener('click',()=>{
        const mode=q('amountMode')?.value||'sale';
        const raw=mode==='sale'?numberFromText(q('saleItemTotal')?.textContent):Math.max(0,+(q('receivedAmount')?.value||0));
        const members=Math.max(1,Math.floor(+(q('members')?.value||1)));
        const scissors=Math.max(0,+(q('scissors')?.value||0));
        const fund=window.fundDeductionTotal?window.fundDeductionTotal():0;
        const normal=numberFromText(q('normalTake')?.textContent);
        const lines=['📊 플래닛정산 결과','',
          '💰 '+discordFmt(raw),
          '👥 '+members+'명',
          '✂️ 가위값 '+discordFmt(scissors)];
        if(fund>0)lines.push('🧾 공금 차감 '+discordFmt(fund));
        lines.push('🧮 '+(mode==='sale'?'판매금액 기준':'수령금액 기준'));
        lines.push('✅ 정상 참여자 1인 '+discordFmt(normal));
        if(q('weightedToggle')?.checked){
          const wm=Math.max(1,Math.floor(+(q('weightedMembers')?.value||1)));
          const rate=Math.max(0,+(q('weightedRate')?.value||0));
          const weighted=numberFromText(q('weightedTake')?.textContent);
          lines.push('⚖️ 차등 '+wm+'명 · '+rate.toFixed(0)+'% → 1인 '+discordFmt(weighted));
        }
        lines.push('',calculatorUrl());
        copyText(lines.join('\\n'),b);
      });
    }

    const direct=q('directResult');
    if(direct&&!q('copyDirectSummary')){
      const b=document.createElement('button');b.type='button';b.id='copyDirectSummary';b.className='share-copy-btn';b.textContent='📋 디스코드용 직거래 요약 복사';direct.appendChild(b);
      b.addEventListener('click',()=>{
        const market=Math.max(0,+(q('marketPrice')?.value||0));
        const members=Math.max(1,Math.floor(+(q('directMembers')?.value||1)));
        const budget=numberFromText(q('directBudget')?.textContent);
        const seller=numberFromText(q('directSellerNet')?.textContent);
        const save=numberFromText(q('directSave')?.textContent);
        const fee=numberFromText(q('directFee')?.textContent);
        const route=q('paymentRoute')?.value==='representativeTrade'?'대표자 교환 후 재분배':'공대원 직접 택배';
        const lines=['📊 플래닛정산 직거래 결과','',
          '💰 경매장 최저가 '+discordFmt(market),
          '🤝 직거래 교환금액 '+discordFmt(budget),
          '👥 '+members+'명 · '+route,
          '✅ 판매자 실수령 '+discordFmt(seller),
          '💸 구매자 절감 '+discordFmt(save),
          '📦 총 택배 수수료 '+discordFmt(fee),
          '',calculatorUrl()];
        copyText(lines.join('\\n'),b);
      });
    }
  }
  ensureCopyButtons();
})();
</script>`;

function patchCaptain(html){
  if(html.includes('id="fundDeductionCard"')) return html;

  html = html.replace('</head>', DEDUCTION_STYLE + '</head>');
  html = html.replace(
    '</section>\n\n<section class="card"><h2>2. 일반 정산 차등 분배',
    '</section>\n\n' + DEDUCTION_SECTION + '\n\n<section class="card"><h2>3. 일반 정산 차등 분배'
  );
  html = html.replace('<section class="card"><h2>3. 일반 정산 택배 수수료', '<section class="card"><h2>4. 일반 정산 택배 수수료');
  html = html.replace('<h2>4. 직거래 · 내부구매 정산</h2>', '<h2>5. 직거래 · 내부구매 정산</h2>');

  html = html.replace(
    "let net=(mode==='sale'?raw*(1-auctionRate):raw)-scissors;",
    "const fundDeductions=window.fundDeductionTotal?window.fundDeductionTotal():0;let net=(mode==='sale'?raw*(1-auctionRate):raw)-scissors-fundDeductions;"
  );
  html = html.replace(
    "if(net<0){alert('수수료/가위값 차감 후 금액이 0보다 작습니다.');return}",
    "if(net<0){alert('수수료/가위값/공금 차감 후 금액이 0보다 작습니다.');return}"
  );
  html = html.replace(
    "$('check').textContent=`분배 전 검산: ${fmt(grossCheck)} / 분배 대상 총액 ${fmt(net)} · 차이 ${fmt(Math.abs(net-grossCheck))}`;",
    "$('check').textContent=`공금 차감 ${fmt(fundDeductions)} · 분배 전 검산: ${fmt(grossCheck)} / 분배 대상 총액 ${fmt(net)} · 차이 ${fmt(Math.abs(net-grossCheck))}`;"
  );

  html = html.replace('</body>', DEDUCTION_SCRIPT + '</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/captain.html') return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html')) return response;
    let html=await response.text();
    html=patchCaptain(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};