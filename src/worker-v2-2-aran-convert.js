import app from './worker-v2-2-aran-result-banner.js';

const ARAN_CONVERT_STYLE=`
<style id="v22AranConvertStyle">
#aranConvertResult{display:none;margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
#aranConvertResult h3{margin:0 0 6px;font-size:15px}
.aran-convert-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}
.aran-convert-item{padding:9px 10px;border:1px solid var(--line);border-radius:10px;background:var(--input)}
.aran-convert-item b{display:block;font-size:19px;margin-top:3px;color:var(--good)}
.aran-convert-item em{display:block;margin-top:3px;font-size:11px;font-style:normal;color:var(--muted)}
.aran-convert-note{margin-top:8px;font-size:11px;line-height:1.55;color:var(--muted)}
#aranSpeedCard{display:none}
#aranSpeedCard .speed-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);font-size:12px}
#aranSpeedCard .speed-row:last-child{border-bottom:0}
#aranSpeedCard .speed-row b{color:var(--good)}
#aranSpeedCard .speed-hint{margin-top:8px;padding:7px 9px;border-left:3px solid var(--accent);background:var(--input);border-radius:8px;font-size:11px;line-height:1.45;color:var(--muted)}

/* 환산스공 PC 압축 레이아웃 */
@media(min-width:821px){
  body main{max-width:1240px;padding-top:14px}
  main>.topnav{margin-bottom:10px}
  main>h1{font-size:22px;margin-bottom:3px}
  main>.sub{margin-bottom:10px;font-size:13px}
  #convertTopGrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.9fr) minmax(240px,.72fr);gap:10px;align-items:stretch;margin-bottom:10px}
  #convertTopGrid>.card{margin:0;padding:13px}
  #convertTopGrid h2{font-size:18px;margin:0 0 8px}
  #convertTopGrid label{margin:5px 0 3px;font-size:12px}
  #convertTopGrid input,#convertTopGrid select{padding:8px 10px;font-size:14px}
  #convertTopGrid .grid{gap:8px 10px}
  #convertTopGrid .note{margin-top:7px;padding:7px 9px;line-height:1.45}
  #convertTopGrid .quick{margin-top:7px;gap:5px}
  #convertTopGrid .quick button{padding:6px 9px;font-size:12px}
  main>details.card{margin:8px 0;padding:10px 13px}
  main>#calc{margin-top:8px;padding:10px 16px}
  #result.card{margin-top:10px;padding:13px}
  #result h2{margin:0 0 8px;font-size:18px}
  #result .hero{padding:12px;margin-top:6px}
  #result .hero b{font-size:28px}
  #result .metric{padding:9px 10px}
  #result .metric b{font-size:18px}
  #result h3{font-size:15px;margin:10px 0 6px}
  #result .line{padding:6px 0}
  #result .formula{padding:8px 10px}
}
@media(max-width:820px){
  #convertTopGrid{display:block}
  #convertTopGrid>.card{margin:14px 0}
  .aran-convert-grid{grid-template-columns:1fr}
}
</style>`;

const ARAN_CONVERT_SCRIPT=`
<script id="v22AranConvertScript">
(()=>{
  const $=id=>document.getElementById(id);
  const ARAN_VALUE='아란 (풀콤보 기준)';
  const fmt=n=>Math.round(n).toLocaleString('ko-KR');
  const SPEED={bopping:1,dsWb:.905,dsNoWb:.792};
  const NEED={wb:(1/SPEED.dsWb-1)*100,noWb:(1/SPEED.dsNoWb-1)*100};
  const job=$('job');
  if(!job)return;

  const statLabel=$('stat')?.previousElementSibling;
  const originalStatLabel=statLabel?.textContent||'현재 표시 스공';

  function isAran(){return job.value===ARAN_VALUE}
  function renameAran(){
    const opt=Array.from(job.options).find(o=>o.value===ARAN_VALUE);
    if(opt)opt.textContent='아란 (사냥 기준)';
    if(statLabel)statLabel.textContent=isAran()?'현재 표시 스공 (보핑 기준)':originalStatLabel;
  }
  function addSpeedCard(){
    if($('aranSpeedCard'))return $('aranSpeedCard');
    const card=document.createElement('section');
    card.className='card';
    card.id='aranSpeedCard';
    card.innerHTML='<h2>3. 아란 공속 환산</h2>'+
      '<div class="speed-row"><span>보핑</span><b>×1.000</b></div>'+
      '<div class="speed-row"><span>디에스 · 바이퍼 O</span><b>×0.905</b></div>'+
      '<div class="speed-row"><span>디에스 · 바이퍼 X</span><b>×0.792</b></div>'+
      '<div class="speed-hint"><b>동일 화력 기준 필요 스공</b><br>바이퍼 O → 보핑 대비 <b>+'+NEED.wb.toFixed(1)+'%</b><br>바이퍼 X → 보핑 대비 <b>+'+NEED.noWb.toFixed(1)+'%</b><br><span id="aranSpeedLive">환산 결과 계산 후 실제 요구 스공이 표시됩니다.</span></div>';
    return card;
  }
  function compactLayout(){
    if($('convertTopGrid'))return;
    const cards=Array.from(document.querySelectorAll('main > section.card')).filter(el=>el.id!=='result');
    if(cards.length<2)return;
    const wrap=document.createElement('div');
    wrap.id='convertTopGrid';
    cards[0].before(wrap);
    wrap.append(cards[0],cards[1],addSpeedCard());
  }
  function addGuide(){
    if($('aranConvertGuide'))return;
    const note=$('presetNote');
    if(!note)return;
    const guide=document.createElement('div');
    guide.id='aranConvertGuide';
    guide.className='note small';
    guide.style.display='none';
    guide.innerHTML='<b>아란 공속 보정</b> · 보핑 ×1.000 기준, 디에스는 바이퍼 O ×0.905 / 바이퍼 X ×0.792로 역산합니다.<br>※ 콤보 수급 및 템페스트 사이클 변화는 제외합니다.';
    note.insertAdjacentElement('afterend',guide);
  }
  function addResult(){
    if($('aranConvertResult'))return;
    const hero=$('converted')?.closest('.hero');
    if(!hero)return;
    const box=document.createElement('div');
    box.id='aranConvertResult';
    box.innerHTML='<h3>아란 무기별 동급 환산</h3><div id="aranConvertSummary" class="small"></div><div id="aranConvertGrid" class="aran-convert-grid"></div><div class="aran-convert-note">※ 공속 기준: 보핑 ×1.000 · 디에스(바이퍼 O) ×0.905 · 디에스(바이퍼 X) ×0.792</div>';
    hero.insertAdjacentElement('afterend',box);
  }
  function baseConverted(){
    const text=($('converted')?.textContent||'').replace(/[^0-9.-]/g,'');
    const n=Number(text);return Number.isFinite(n)?n:0;
  }
  function render(){
    const on=isAran();
    renameAran();
    const guide=$('aranConvertGuide'),box=$('aranConvertResult'),speedCard=$('aranSpeedCard');
    if(guide)guide.style.display=on?'':'none';
    if(speedCard)speedCard.style.display=on?'':'none';

    const base=baseConverted();
    const dsWb=base>0?base/SPEED.dsWb:0;
    const dsNoWb=base>0?base/SPEED.dsNoWb:0;
    const live=$('aranSpeedLive');
    if(live){
      live.innerHTML=base>0
        ?'현재 보핑 환산 <b>'+fmt(base)+'</b><br>→ 바이퍼 O <b>'+fmt(dsWb)+'</b> / 바이퍼 X <b>'+fmt(dsNoWb)+'</b>'
        :'환산 결과 계산 후 실제 요구 스공이 표시됩니다.';
    }

    if(!box)return;
    const result=$('result');
    const show=on&&result&&result.style.display!=='none'&&base>0;
    box.style.display=show?'':'none';
    if(!show)return;

    $('aranConvertSummary').innerHTML='현재 계산된 <b>보핑 환산 '+fmt(base)+'</b>을 기준으로 동일 기대화력의 디에스 요구 환산스공을 역산합니다.';
    const items=[
      ['보핑 환산',base,'기준'],
      ['디에스 환산 · 바이퍼 O',dsWb,'보핑 대비 +'+NEED.wb.toFixed(1)+'% 필요'],
      ['디에스 환산 · 바이퍼 X',dsNoWb,'보핑 대비 +'+NEED.noWb.toFixed(1)+'% 필요']
    ];
    $('aranConvertGrid').innerHTML=items.map(([label,value,sub])=>'<div class="aran-convert-item"><span class="small">'+label+'</span><b>'+fmt(value)+'</b><em>'+sub+'</em></div>').join('');
  }

  compactLayout();renameAran();addGuide();addResult();render();
  job.addEventListener('change',render);
  $('calc')?.addEventListener('click',()=>setTimeout(render,0));
})();
</script>`;

function patch(html){
  if(!html.includes('id="v22AranConvertStyle"'))html=html.replace('</head>',ARAN_CONVERT_STYLE+'</head>');
  if(!html.includes('id="v22AranConvertScript"'))html=html.replace('</body>',ARAN_CONVERT_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')||(url.pathname!=='/convert'&&url.pathname!=='/convert.html'))return response;
    let html=await response.text();
    html=patch(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-aran-convert','bopping-baseline-three-column');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
