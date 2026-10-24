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
    if(inputGrid&&inputGrid.children.length===0)inputGrid.remove();
  }
  repair();
  requestAnimationFrame(repair);
  setTimeout(repair,30);
})();
</script>`;

function patchWeapon(html){
  if(!html.includes('id="v22WeaponTopRepairStyle"'))html=html.replace('</head>',WEAPON_REPAIR_STYLE+'</head>');
  if(!html.includes('id="v22WeaponTopRepairScript"'))html=html.replace('</body>',WEAPON_REPAIR_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const type=response.headers.get('content-type')||'';
    const weapon=url.pathname==='/'||url.pathname==='/index.html';
    if(!weapon||!type.includes('text/html'))return response;
    const html=patchWeapon(await response.text());
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-route-isolation','weapon-only');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
