import app from './worker-v2-2-break-even.js';

const ARAN_RESULT_BANNER_STYLE = `
<style id="v22AranResultBannerStyle">
#v22AranFinalBanner{display:none;margin:0 0 12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
#v22AranFinalBanner .title{font-weight:900;font-size:16px;margin-bottom:6px}
#v22AranFinalBanner .verdict{font-weight:900;font-size:18px;line-height:1.45;color:var(--good)}
#v22AranFinalBanner .meta{margin-top:6px;font-size:12px;line-height:1.55;color:var(--muted)}
</style>`;

const ARAN_RESULT_BANNER_SCRIPT = `
<script id="v22AranResultBannerScript">
(()=>{
  const q=id=>document.getElementById(id);
  const ARAN_VALUE='아란 (풀콤보 기준)';
  const weaponIds=['cur','a','b','c'];
  const names={cur:'현재',a:'매물 A',b:'매물 B',c:'매물 C'};

  function ensureBanner(){
    const result=q('result');
    if(!result)return null;
    let banner=q('v22AranFinalBanner');
    if(!banner){
      banner=document.createElement('div');
      banner.id='v22AranFinalBanner';
      result.insertBefore(banner,result.firstChild);
    }
    return banner;
  }

  function visibleWeapon(id){
    if(id==='cur')return true;
    const card=q(id+'Card');
    return !!card&&!card.classList.contains('hidden');
  }

  function metricRelative(name){
    if(name==='현재')return 100;
    const metrics=Array.from(document.querySelectorAll('#metrics .metric'));
    const target=metrics.find(el=>(el.textContent||'').trim().startsWith(name));
    if(!target)return null;
    const b=target.querySelector('b');
    const m=(b?.textContent||'').match(/(-?[0-9.]+)%/);
    return m?parseFloat(m[1]):null;
  }

  function typeOf(id){return q('aranWeaponType_'+id)?.value||'other'}
  function mult(id){
    const speedOn=!!q('aranSpeedCorrection')?.checked;
    if(!speedOn)return 1;
    const type=typeOf(id);
    if(type==='bopping')return q('aranWindBooster')?.checked?1.105:1.263;
    return 1;
  }

  function paint(){
    const banner=ensureBanner();
    const result=q('result');
    if(!banner||!result)return;
    const active=q('job')?.value===ARAN_VALUE&&result.style.display!=='none';
    banner.style.display=active?'':'none';
    if(!active)return;

    const speedOn=!!q('aranSpeedCorrection')?.checked;
    const wb=!!q('aranWindBooster')?.checked;
    const currentMult=mult('cur')||1;
    let best={id:'cur',value:100};
    const rows=[];

    weaponIds.forEach(id=>{
      if(!visibleWeapon(id))return;
      const raw=metricRelative(names[id]);
      if(raw===null)return;
      const adjusted=raw*(mult(id)/currentMult);
      rows.push(names[id]+' '+adjusted.toFixed(2)+'%');
      if(adjusted>best.value)best={id,value:adjusted};
    });

    banner.innerHTML='<div class="title">아란 공속 보정 최종 판정</div>'+
      '<div class="verdict">'+(speedOn?names[best.id]+' 우세 · '+best.value.toFixed(2)+'%':'공속 보정 OFF · 기존 잠재 비교 결과 사용')+'</div>'+
      '<div class="meta">공속 보정 <b>'+(speedOn?'ON':'OFF')+'</b> · 윈드부스터 <b>'+(wb?'ON':'OFF')+'</b>'+
      (speedOn?' · '+rows.join(' / '):'')+'<br>※ 아래 기존 결과는 공격력·공%·총데미지·크확만 반영한 공속 무보정 참고값입니다.</div>';
  }

  q('calc')?.addEventListener('click',()=>setTimeout(paint,0));
  q('job')?.addEventListener('change',()=>requestAnimationFrame(paint));
  document.addEventListener('change',e=>{
    if(e.target.id==='aranSpeedCorrection'||e.target.id==='aranWindBooster'||e.target.id?.startsWith('aranWeaponType_'))requestAnimationFrame(paint);
  });
  q('addCompare')?.addEventListener('click',()=>requestAnimationFrame(paint));
  document.querySelector('#weapons')?.addEventListener('click',()=>requestAnimationFrame(paint));
  paint();
})();
</script>`;

function patch(html){
  if(!html.includes('id="v22AranResultBannerStyle"'))html=html.replace('</head>',ARAN_RESULT_BANNER_STYLE+'</head>');
  if(!html.includes('id="v22AranResultBannerScript"'))html=html.replace('</body>',ARAN_RESULT_BANNER_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')||(url.pathname!=='/'&&url.pathname!=='/index.html'))return response;
    let html=await response.text();
    html=patch(html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-aran-result-banner','final-first');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
