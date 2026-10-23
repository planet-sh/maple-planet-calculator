import baseWorker from './worker-v2-1-ux.js';

const MODE_GUARD_STYLE = `
<style>
/* 일반 계산에서는 심화 전용 실측/스킬 영역을 반드시 숨긴다. */
body:not([data-calc-mode="advanced"]) #desktopAdvancedGrid,
body:not([data-calc-mode="advanced"]) #statCalSection,
body:not([data-calc-mode="advanced"]) #pctCalSection,
body:not([data-calc-mode="advanced"]) #skillMixSection{display:none!important}

/* 심화 계산에서만 데스크톱 실측 묶음을 2열로 노출한다. */
body[data-calc-mode="advanced"] #desktopAdvancedGrid{display:block!important}
@media(min-width:1180px){
  body[data-calc-mode="advanced"] #desktopAdvancedGrid{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
}
</style>`;

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();
    html=html.replace('</head>',MODE_GUARD_STYLE+'</head>');
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
