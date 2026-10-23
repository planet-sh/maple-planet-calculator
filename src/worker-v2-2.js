import legacyApp from './worker-captain-deductions.js';
import { validateHtml, regressionHeader } from './v2-2/regression.js';

// V2.2 migration entrypoint.
// V2.1 workers below this file are treated as frozen compatibility code.
// New V2.2 behavior should be added above this boundary and consume canonical
// data from ./v2-2/job-presets.js instead of adding another worker in the old chain.

function routeKind(pathname){
  if(pathname==='/'||pathname==='/index.html')return 'weapon';
  if(pathname==='/convert.html')return 'convert';
  if(pathname==='/captain.html')return 'captain';
  return null;
}

export default {
  async fetch(request,env,ctx){
    const response=await legacyApp.fetch(request,env,ctx);
    const kind=routeKind(new URL(request.url).pathname);
    const contentType=response.headers.get('content-type')||'';
    if(!kind||!contentType.includes('text/html'))return response;

    const html=await response.text();
    const regression=validateHtml(kind,html);
    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.set('x-planet-version','2.2-dev');
    headers.set('x-planet-regression',regressionHeader(regression));

    // DEV fail-visible behavior: do not silently ship a page with a known core
    // feature missing. Keep the actual page available, but surface the failure
    // in a small diagnostic banner so Preview verification catches it.
    let output=html;
    if(!regression.ok){
      const msg='V2.2 회귀 검사: 누락 감지 · '+regression.missing.join(' / ');
      const banner=`<div id="v22RegressionWarning" style="position:sticky;top:0;z-index:99999;padding:9px 12px;background:#7a271a;color:#fff;font:700 12px system-ui;text-align:center">${msg}</div>`;
      output=output.replace(/<body([^>]*)>/,m=>m+banner);
    }
    return new Response(output,{status:response.status,statusText:response.statusText,headers});
  }
};
