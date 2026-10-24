import app from './worker-v2-2-aran-result-banner.js';

const ARAN_CONVERT_STYLE=`
<style id="v22AranConvertStyle">
#aranConvertField{display:none}
#aranConvertResult{display:none;margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
#aranConvertResult h3{margin:0 0 8px;font-size:16px}
.aran-convert-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.aran-convert-item{padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--input)}
.aran-convert-item b{display:block;font-size:20px;margin-top:4px;color:var(--good)}
.aran-convert-note{margin-top:10px;font-size:12px;line-height:1.65;color:var(--muted)}
@media(max-width:700px){.aran-convert-grid{grid-template-columns:1fr}}
</style>`;

const ARAN_CONVERT_SCRIPT=`
<script id="v22AranConvertScript">
(()=>{
  const $=id=>document.getElementById(id);
  const ARAN_VALUE='아란 (풀콤보 기준)';
  const fmt=n=>Math.round(n).toLocaleString('ko-KR');
  const SPEED={bopping:1,dsNoWb:.792,dsWb:.905};
  const job=$('job');
  if(!job)return;

  function isAran(){return job.value===ARAN_VALUE}
  function renameAran(){
    const opt=Array.from(job.options).find(o=>o.value===ARAN_VALUE);
    if(opt)opt.textContent='아란 (사냥 기준)';
  }
  function addField(){
    if($('aranConvertField'))return;
    const sharp=$('sharp');
    const grid=sharp?.closest('.grid');
    if(!grid)return;
    const wrap=document.createElement('div');
    wrap.id='aranConvertField';
    wrap.innerHTML='<label>현재 무기 기준</label><select id="aranConvertWeapon"><option value="bopping">보핑</option><option value="ds">디에스(핼버드)</option></select>';
    grid.appendChild(wrap);
  }
  function addGuide(){
    if($('aranConvertGuide'))return;
    const note=$('presetNote');
    if(!note)return;
    const guide=document.createElement('div');
    guide.id='aranConvertGuide';
    guide.className='note small';
    guide.style.display='none';
    guide.innerHTML='<b>아란 무기 공속 환산</b> · 현재 입력한 무기를 기준으로, 보핑/디에스의 공격속도 차이를 반영해 <b>동일 기대화력이 되는 상대 무기의 환산스공</b>을 역산합니다.<br>보핑은 자버프로 풀공속 기준이며, 디에스는 바이퍼(윈드부스터) 유무를 나누어 표시합니다. 순수 공격 횟수 차이만 반영하며 콤보 수급 및 템페스트 사이클 변화는 제외합니다.';
    note.insertAdjacentElement('afterend',guide);
  }
  function addResult(){
    if($('aranConvertResult'))return;
    const hero=$('converted')?.closest('.hero');
    if(!hero)return;
    const box=document.createElement('div');
    box.id='aranConvertResult';
    box.innerHTML='<h3>아란 무기별 동급 환산</h3><div id="aranConvertSummary" class="small"></div><div id="aranConvertGrid" class="aran-convert-grid"></div><div class="aran-convert-note">※ 보핑 ×1.000 · 디에스(바이퍼 X) ×0.792 · 디에스(바이퍼 O) ×0.905 기준의 1차 추정치입니다.</div>';
    hero.insertAdjacentElement('afterend',box);
  }
  function baseConverted(){
    const text=($('converted')?.textContent||'').replace(/[^0-9.-]/g,'');
    const n=Number(text);return Number.isFinite(n)?n:0;
  }
  function render(){
    const on=isAran();
    const field=$('aranConvertField'),guide=$('aranConvertGuide'),box=$('aranConvertResult');
    if(field)field.style.display=on?'':'none';
    if(guide)guide.style.display=on?'':'none';
    if(!box)return;
    const result=$('result');
    const show=on&&result&&result.style.display!=='none'&&baseConverted()>0;
    box.style.display=show?'':'none';
    if(!show)return;
    const base=baseConverted();
    const weapon=$('aranConvertWeapon')?.value||'bopping';
    let summary='',items=[];
    if(weapon==='bopping'){
      const dsNo=base/SPEED.dsNoWb,dsWb=base/SPEED.dsWb;
      summary='현재 무기 기준: <b>보핑</b> · 현재 보핑 환산을 기준점으로 동일 기대화력의 디에스 환산을 역산합니다.';
      items=[
        ['현재 보핑 환산',base],
        ['디에스 환산 · 바이퍼 X',dsNo],
        ['디에스 환산 · 바이퍼 O',dsWb]
      ];
    }else{
      const bopFromNo=base*SPEED.dsNoWb,bopFromWb=base*SPEED.dsWb;
      summary='현재 무기 기준: <b>디에스(핼버드)</b> · 현재 디에스 환산을 기준점으로 바이퍼 유무별 동급 보핑 환산을 역산합니다.';
      items=[
        ['현재 디에스 환산',base],
        ['동급 보핑 · 바이퍼 X 기준',bopFromNo],
        ['동급 보핑 · 바이퍼 O 기준',bopFromWb]
      ];
    }
    $('aranConvertSummary').innerHTML=summary;
    $('aranConvertGrid').innerHTML=items.map(([label,value])=>'<div class="aran-convert-item"><span class="small">'+label+'</span><b>'+fmt(value)+'</b></div>').join('');
  }

  renameAran();addField();addGuide();addResult();render();
  job.addEventListener('change',()=>{renameAran();render()});
  $('aranConvertWeapon')?.addEventListener('change',render);
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
    headers.set('x-planet-aran-convert','weapon-speed-draft');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
