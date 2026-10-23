(()=>{
  const q=id=>document.getElementById(id);
  const directCard=q('calcDirect')?.closest('section.card');
  if(!directCard||q('directMembers'))return;

  const grid=directCard.querySelector('.grid');
  if(grid){
    const wrap=document.createElement('div');
    wrap.innerHTML='<label>분배 인원 (N명)</label><input id="directMembers" type="number" min="1" step="1" value="1"><div class="small">내부 구매자가 보낸 직거래 정산금을 몇 명에게 동일하게 나눌지 입력합니다.</div>';
    grid.appendChild(wrap);
  }

  const result=q('directResult');
  const metrics=result?.querySelector('.grid');
  if(metrics){
    const gross=document.createElement('div');
    gross.className='metric';
    gross.innerHTML='<span class="small">1인당 분배금</span><b id="directPerGross">-</b>';
    metrics.appendChild(gross);

    const net=document.createElement('div');
    net.className='metric';
    net.innerHTML='<span class="small">1인당 택배 실수령</span><b id="directPerNet">-</b>';
    metrics.appendChild(net);
  }

  const fmt=n=>Math.floor(n).toLocaleString('ko-KR')+' 메소';
  function updateSplit(){
    const market=+(q('marketPrice')?.value||0);
    if(market<=0)return;
    const directRate=Math.max(0,+(q('directRate')?.value||0))/100;
    const mailRate=Math.max(0,+(q('directMailRate')?.value||0))/100;
    const mode=q('directMode')?.value||'direct';
    const auctionRate=Math.max(0,+(q('auctionRate')?.value||10))/100;
    const basisRate=mode==='direct'?directRate:auctionRate;
    const members=Math.max(1,Math.floor(+(q('directMembers')?.value||1)));
    const budget=market*(1-basisRate);
    const send=budget/(1+mailRate);
    const perGross=send/members;
    const perNet=perGross*(1-mailRate);
    if(q('directPerGross'))q('directPerGross').textContent=fmt(perGross);
    if(q('directPerNet'))q('directPerNet').textContent=fmt(perNet);
    const desc=q('directDesc');
    if(desc){
      const base=mode==='direct'?`직거래 기준 총 부담액 ${fmt(budget)}`:`경매장 실수령 기준 총 부담액 ${fmt(budget)}`;
      desc.textContent=`${base} · 구매자 실제 택배 송금액 ${fmt(send)} · ${members}명 균등 분배 시 1인당 ${fmt(perGross)} 송금, 택배 8% 차감 후 약 ${fmt(perNet)} 수령.`;
    }
  }

  q('calcDirect')?.addEventListener('click',()=>requestAnimationFrame(updateSplit));
  q('directMembers')?.addEventListener('input',()=>{if(result&&result.style.display==='block')updateSplit()});
})();
