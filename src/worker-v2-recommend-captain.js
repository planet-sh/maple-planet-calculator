import baseWorker from './worker-v2-recommend.js';

function patchCaptain(html){
  return html
    .replace("'캡틴':{name:'배틀쉽 토르페도',pct:780}", "'캡틴':{name:'배틀쉽 캐논',pct:380,note:'380% × 4타 중 1타당'}")
    .replace('배틀쉽 토르페도 M 780%', '배틀쉽 캐논 M 380%');
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchCaptain(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};