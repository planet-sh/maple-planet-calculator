import app from './worker-v2-2-aran-convert.js';

const WEAPON_REPAIR_STYLE=`
<style id="v22WeaponTopRepairStyle">
@media(min-width:1180px){
  #v22CharacterTopCard{margin:10px 0!important;padding:14px!important}
  #v22CharacterTopCard>.grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
  #v22CharacterTopCard label{margin:4px 0 3px!important}
  #v22CharacterTopCard input,#v22CharacterTopCard select{padding:8px 9px!important;font-size:14px!important}
  #v22CharacterTopCard .small{font-size:11px!important;line-height:1.45!important}
}
</style>`;

const WEAPON_REPAIR_SCRIPT=`
<script id="v22WeaponTopRepairScript">
(()=>{
  const q=id=>document.getElementById(id);
  function findCharacterCard(){
    return Array.from(document.querySelectorAll('section.card')).find(card=>
      (card.querySelector(':scope>h2')?.textContent||'').trim().startsWith('1. 캐릭터 / 장비')
    );
  }
  function repair(){
    const card=findCharacterCard();
    if(!card)return;
    card.id='v22CharacterTopCard';
    card.classList.remove('advanced-only');
    card.style.display='';

    const modeSwitch=document.querySelector('.mode-switch');
    const castle=q('castleExtra');
    const inputGrid=q('desktopInputGrid');
    if(castle){
      if(card.nextElementSibling!==castle)castle.parentNode.insertBefore(card,castle);
    }else if(inputGrid){
      if(card.nextElementSibling!==inputGrid)inputGrid.parentNode.insertBefore(card,inputGrid);
    }else if(modeSwitch){
      modeSwitch.insertAdjacentElement('afterend',card);
    }

    if(inputGrid){
      const children=Array.from(inputGrid.children);
      if(children.length===0)inputGrid.remove();
    }
  }
  repair();
  requestAnimationFrame(repair);
  setTimeout(repair,30);
})();
</script>`;

const CONVERT_ARAN_STYLE=`
<style id="v22ConvertAranWeaponStyle">
.aran-weapon-field{display:none}
.aran-weapon-note{display:none;margin-top:7px;padding:7px 9px;border:1px solid var(--line);border-radius:9px;background:var(--input);font-size:11px;line-height:1.5;color:var(--muted)}
.aran-weapon-note b{color:var(--good)}
@media(min-width:821px){
  #convertTopGrid>.card:first-child .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
</style>`;

const CONVERT_ARAN_SCRIPT=`
<script id="v22ConvertAranWeaponScript">
(()=>{
  const q=id=>document.getElementById(id);
  const job=q('job');
  const stat=q('stat');
  const calc=q('calc');
  const converted=q('converted');
  if(!job||!stat||!calc||!converted)return;

  const SPEED={bopping:1,dsWb:.905,dsNoWb:.792};
  const fmt=n=>Math.round(n).toLocaleString('ko-KR');
  const isAran=()=>String(job.value||'').includes('아란')||String(job.selectedOptions?.[0]?.textContent||'').includes('아란');
  const num=text=>Number(String(text||'').replace(/[^0-9.-]/g,''))||0;

  function ensureFields(){
    if(q('aranCurrentWeapon'))return;
    const grid=stat.closest('.grid');
    if(!grid)return;
    const weaponWrap=document.createElement('div');
    weaponWrap.className='aran-weapon-field';
    weaponWrap.id='aranWeaponWrap';
    weaponWrap.innerHTML='<label>현재 무기</label><select id="aranCurrentWeapon"><option value="bopping">보핑</option><option value="ds">디에스</option></select>';
    const wbWrap=document.createElement('div');
    wbWrap.className='aran-weapon-field';
    wbWrap.id='aranWbWrap';
    wbWrap.innerHTML='<label>윈드부스터</label><select id="aranCurrentWb"><option value="on">적용</option><option value="off">미적용</option></select>';
    grid.append(weaponWrap,wbWrap);
    const note=document.createElement('div');
    note.id='aranWeaponNote';
    note.className='aran-weapon-note';
    q('presetNote')?.insertAdjacentElement('afterend',note);
    q('aranCurrentWeapon')?.addEventListener('change',sync);
    q('aranCurrentWb')?.addEventListener('change',sync);
  }

  function currentSpeed(){
    const type=q('aranCurrentWeapon')?.value||'bopping';
    if(type==='bopping')return SPEED.bopping;
    return q('aranCurrentWb')?.value==='off'?SPEED.dsNoWb:SPEED.dsWb;
  }

  function sync(){
    ensureFields();
    const on=isAran();
    Array.from(job.options).forEach(opt=>{
      if(String(opt.value||'').includes('아란')||String(opt.textContent||'').includes('아란'))opt.textContent='아란 (사냥 기준)';
    });
    document.querySelectorAll('.aran-weapon-field').forEach(el=>el.style.display=on?'':'none');
    const wbWrap=q('aranWbWrap');
    if(wbWrap)wbWrap.style.display=on&&q('aranCurrentWeapon')?.value==='ds'?'':'none';
    const note=q('aranWeaponNote');
    if(note){
      note.style.display=on?'block':'none';
      if(on){
        const type=q('aranCurrentWeapon')?.value||'bopping';
        const speed=currentSpeed();
        note.innerHTML=type==='bopping'
          ?'<b>보핑 기준</b> · 입력한 표시 스공을 그대로 보핑 기준 사냥 환산스공으로 사용합니다.'
          :'<b>디에스 기준</b> · 입력한 표시 스공에 공속 배율 ×'+speed.toFixed(3)+'을 적용해 보핑 기준 사냥 환산스공으로 정규화합니다.';
      }
    }
  }

  function repaintAranResult(){
    if(!isAran())return;
    const raw=num(converted.textContent);
    if(raw<=0)return;
    const base=raw*currentSpeed();
    const dsWb=base/SPEED.dsWb;
    const dsNo=base/SPEED.dsNoWb;

    converted.textContent=fmt(base);
    const heroLabel=converted.previousElementSibling;
    if(heroLabel)heroLabel.textContent='사냥 환산스공 · 보핑 환산';

    const gain=q('gain');
    const inputStat=Math.max(0,+stat.value||0);
    if(gain&&inputStat>0)gain.textContent='현재 무기 표시 스공 '+fmt(inputStat)+' → 보핑 기준 환산 '+fmt(base);

    const grid=q('aranConvertGrid');
    const box=q('aranConvertResult');
    const summary=q('aranConvertSummary');
    if(box)box.style.display='block';
    if(summary)summary.innerHTML='현재 무기 조건을 반영한 <b>보핑 기준 사냥 환산 '+fmt(base)+'</b>을 기준으로 동급 스공을 역산합니다.';
    if(grid)grid.innerHTML=''
      +'<div class="aran-convert-item"><span class="small">보핑 동급</span><b>'+fmt(base)+'</b><em>×1.000</em></div>'
      +'<div class="aran-convert-item"><span class="small">디에스 동급 · 바이퍼 O</span><b>'+fmt(dsWb)+'</b><em>보핑 대비 +10.5% 필요</em></div>'
      +'<div class="aran-convert-item"><span class="small">디에스 동급 · 바이퍼 X</span><b>'+fmt(dsNo)+'</b><em>보핑 대비 +26.3% 필요</em></div>';

    const live=q('aranSpeedLive');
    if(live)live.innerHTML='보핑 기준 <b>'+fmt(base)+'</b><br>→ 바이퍼 O <b>'+fmt(dsWb)+'</b> / 바이퍼 X <b>'+fmt(dsNo)+'</b>';

    const share=q('shareText');
    if(share){
      const type=q('aranCurrentWeapon')?.value==='ds'?'디에스':'보핑';
      const wb=type==='디에스'?(q('aranCurrentWb')?.value==='off'?' · 윈부 X':' · 윈부 O'):'';
      share.textContent=share.textContent.replace('아란 (풀콤보 기준)','아란 (사냥 기준)')+' · 현재무기 '+type+wb+' · 보핑환산 '+fmt(base);
    }
  }

  ensureFields();
  sync();
  job.addEventListener('change',()=>requestAnimationFrame(sync));
  calc.addEventListener('click',()=>setTimeout(repaintAranResult,0));
})();
</script>`;

function patchWeapon(html){
  if(!html.includes('id="v22WeaponTopRepairStyle"'))html=html.replace('</head>',WEAPON_REPAIR_STYLE+'</head>');
  if(!html.includes('id="v22WeaponTopRepairScript"'))html=html.replace('</body>',WEAPON_REPAIR_SCRIPT+'</body>');
  return html;
}

function patchConvert(html){
  if(!html.includes('id="v22ConvertAranWeaponStyle"'))html=html.replace('</head>',CONVERT_ARAN_STYLE+'</head>');
  if(!html.includes('id="v22ConvertAranWeaponScript"'))html=html.replace('</body>',CONVERT_ARAN_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const convert=url.pathname==='/convert'||url.pathname==='/convert.html';
    if(convert){
      const assetUrl=new URL('/convert.html',url.origin);
      const assetReq=new Request(assetUrl.toString(),request);
      const response=await env.ASSETS.fetch(assetReq);
      const type=response.headers.get('content-type')||'';
      if(!type.includes('text/html'))return response;
      const html=patchConvert(await response.text());
      const headers=new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('etag');
      headers.set('x-planet-route-isolation','convert-static-aran-weapon');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }

    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    const weapon=url.pathname==='/'||url.pathname==='/index.html';
    if(!weapon||!type.includes('text/html'))return response;
    const html=patchWeapon(await response.text());
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-route-isolation','weapon-flow-repaired');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
