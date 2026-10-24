import app from './worker-v2-2-break-even.js';

const ARAN_RESULT_ORDER_STYLE = `
<style id="v22AranResultOrderStyle">
body[data-v22-aran-result="1"] #v22AranSpeedResult{margin-top:0;margin-bottom:14px}
body[data-v22-aran-result="1"] #winner{font-size:15px!important;color:var(--muted)!important;margin-top:12px}
body[data-v22-aran-result="1"] #winner::before{content:'공속 무보정 참고 · ';font-weight:800;color:var(--muted)}
body[data-v22-aran-result="1"] #metrics{opacity:.82}
body[data-v22-aran-result="1"] #compare{opacity:.82}
#v22AranSpeedResult .v22-aran-speed-winner{font-size:19px;line-height:1.5}
#v22AranSpeedResult .v22-aran-speed-summary-first{margin-bottom:10px;padding:9px 11px;border-radius:9px;background:var(--input);border:1px solid var(--line)}
</style>`;

const ARAN_RESULT_ORDER_SCRIPT = `
<script id="v22AranResultOrderScript">
(()=>{
  const q=id=>document.getElementById(id);
  const ARAN_VALUE='아란 (풀콤보 기준)';

  function isAran(){return q('job')?.value===ARAN_VALUE}

  function arrange(){
    const result=q('result'),panel=q('v22AranSpeedResult'),winner=q('winner');
    const active=isAran()&&result&&result.style.display!=='none';
    document.body.dataset.v22AranResult=active?'1':'0';
    if(!active||!result||!panel)return;

    if(winner&&panel.nextElementSibling!==winner)result.insertBefore(panel,winner);

    const summary=q('v22AranSpeedSummary');
    if(summary)summary.classList.add('v22-aran-speed-summary-first');

    const wb=q('aranWindBooster');
    const dsSelected=['cur','a','b','c'].some(id=>{
      const card=q(id+'Card');
      return card&&!card.classList.contains('hidden')&&q('aranWeaponType_'+id)?.value==='ds';
    });
    if(wb)wb.disabled=!dsSelected;
    const wbLabel=q('aranWindBoosterLabel');
    if(wbLabel)wbLabel.classList.toggle('v22-aran-muted',!dsSelected);
  }

  q('calc')?.addEventListener('click',()=>setTimeout(arrange,0));
  q('job')?.addEventListener('change',()=>requestAnimationFrame(arrange));
  document.addEventListener('change',e=>{
    if(e.target.id==='aranSpeedCorrection'||e.target.id==='aranWindBooster'||e.target.id?.startsWith('aranWeaponType_'))requestAnimationFrame(arrange);
  });
  q('addCompare')?.addEventListener('click',()=>requestAnimationFrame(arrange));
  document.querySelector('#weapons')?.addEventListener('click',()=>requestAnimationFrame(arrange));
  arrange();
})();
</script>`;

function patch(html){
  if(!html.includes('id="v22AranResultOrderStyle"'))html=html.replace('</head>',ARAN_RESULT_ORDER_STYLE+'</head>');
  if(!html.includes('id="v22AranResultOrderScript"'))html=html.replace('</body>',ARAN_RESULT_ORDER_SCRIPT+'</body>');
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
    headers.set('x-planet-aran-result-order','speed-first');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
