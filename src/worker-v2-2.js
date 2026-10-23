import legacyApp from './worker-captain-deductions.js';
import { validateHtml, regressionHeader } from './v2-2/regression.js';

// V2.2 migration entrypoint.
// V2.1 workers below this file are treated as frozen compatibility code.
// New V2.2 behavior belongs here (or in ./v2-2 modules), not in another
// compatibility worker.

const COMMON_SHELL_STYLE = `
<style id="v22CommonShellStyle">
.v22-tool-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin:0 0 18px;width:100%}
.v22-tool-nav a{text-align:center;text-decoration:none;padding:12px 8px;border-radius:10px;color:var(--muted);font-weight:800;min-width:0}
.v22-tool-nav a.active{background:var(--accent);color:var(--accentText)}
@media(min-width:1180px){main{max-width:1540px!important;padding-left:28px!important;padding-right:28px!important}}
@media(min-width:1680px){main{max-width:1680px!important}}
@media(max-width:720px){.v22-tool-nav a{font-size:13px;padding:11px 4px}}
</style>`;

const WEAPON_FLOW_SCRIPT = `
<script id="v22WeaponFlowScript">
(()=>{
  const q=id=>document.getElementById(id);
  const inputGrid=q('desktopInputGrid');
  const advancedGrid=q('desktopAdvancedGrid');
  const skillMix=q('skillMixSection');
  const weaponCard=q('weaponSectionTitle')?.closest('section.card');
  const calc=q('calc');
  if(!inputGrid||!weaponCard||!calc)return;

  function placeAfter(anchor,node){
    if(!anchor||!node||anchor===node)return anchor;
    anchor.insertAdjacentElement('afterend',node);
    return node;
  }

  function normalizeFlow(){
    const advanced=document.body.dataset.calcMode==='advanced';
    let anchor=inputGrid;

    if(advanced){
      if(advancedGrid)anchor=placeAfter(anchor,advancedGrid);
      if(skillMix)anchor=placeAfter(anchor,skillMix);
      anchor=placeAfter(anchor,weaponCard);
    }else{
      anchor=placeAfter(anchor,weaponCard);
    }

    anchor=placeAfter(anchor,calc);
    const result=q('result');
    if(result)placeAfter(anchor,result);
  }

  q('simpleMode')?.addEventListener('click',()=>requestAnimationFrame(normalizeFlow));
  q('advancedMode')?.addEventListener('click',()=>requestAnimationFrame(normalizeFlow));
  new MutationObserver(normalizeFlow).observe(document.body,{attributes:true,attributeFilter:['data-calc-mode']});
  normalizeFlow();
})();
</script>`;

function routeKind(pathname){
  if(pathname==='/'||pathname==='/index.html')return 'weapon';
  if(pathname==='/convert.html')return 'convert';
  if(pathname==='/captain.html')return 'captain';
  return null;
}

function commonNav(kind){
  const items=[
    ['convert','/convert.html','환산스공'],
    ['weapon','/','무기 계산기'],
    ['captain','/captain.html','공대장 계산기']
  ];
  return '<nav class="v22-tool-nav" id="v22ToolNav" aria-label="계산기 메뉴">'+items.map(([key,href,label])=>'<a href="'+href+'"'+(key===kind?' class="active" aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>';
}

function normalizeShell(kind,html){
  if(!html.includes('id="v22CommonShellStyle"'))html=html.replace('</head>',COMMON_SHELL_STYLE+'</head>');
  const nav=commonNav(kind);
  const legacyNav=/<nav[^>]*class="[^"]*(?:tool-nav|topnav)[^"]*"[^>]*>[\s\S]*?<\/nav>/i;
  if(legacyNav.test(html))html=html.replace(legacyNav,nav);
  else html=html.replace(/<main([^>]*)>/i,m=>m+nav);
  if(kind==='weapon'&&!html.includes('id="v22WeaponFlowScript"'))html=html.replace('</body>',WEAPON_FLOW_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await legacyApp.fetch(request,env,ctx);
    const kind=routeKind(new URL(request.url).pathname);
    const contentType=response.headers.get('content-type')||'';
    if(!kind||!contentType.includes('text/html'))return response;

    let html=await response.text();
    html=normalizeShell(kind,html);

    const regression=validateHtml(kind,html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-version','2.2-dev');
    headers.set('x-planet-regression',regressionHeader(regression));

    let output=html;
    if(!regression.ok){
      const msg='V2.2 회귀 검사: 누락 감지 · '+regression.missing.join(' / ');
      const banner=`<div id="v22RegressionWarning" style="position:sticky;top:0;z-index:99999;padding:9px 12px;background:#7a271a;color:#fff;font:700 12px system-ui;text-align:center">${msg}</div>`;
      output=output.replace(/<body([^>]*)>/,m=>m+banner);
    }
    return new Response(output,{status:response.status,statusText:response.statusText,headers});
  }
};
