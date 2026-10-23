import app from './worker-v2-1-advanced-help.js';

const TOOL_NAV_STYLE = `
<style>
.tool-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin:0 0 18px}
.tool-nav a{text-align:center;text-decoration:none;padding:12px 8px;border-radius:10px;color:var(--muted);font-weight:800}
.tool-nav a.active{background:var(--accent);color:var(--accentText)}
@media(max-width:720px){.tool-nav a{font-size:13px;padding:11px 4px}}
</style>`;

const SHARED_WIDE_STYLE = `
<style>
@media(min-width:1180px){
  main{max-width:1540px!important;padding-left:28px!important;padding-right:28px!important}
  .tool-dashboard{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:start;margin:14px 0 18px}
  .tool-dashboard-col{min-width:0}
  .tool-dashboard-col>.card{margin:0 0 14px!important;height:auto}
  .tool-dashboard-col>.primary{margin:0 0 14px!important}
  .tool-dashboard .result.card{margin:0!important}
  .tool-dashboard-placeholder{background:var(--panel);border:1px dashed var(--line);border-radius:16px;padding:22px;color:var(--muted);min-height:180px;display:flex;align-items:center;justify-content:center;text-align:center}
}
@media(min-width:1680px){main{max-width:1680px!important}.tool-dashboard{gap:20px}}
@media(max-width:1179px){.tool-dashboard{display:block}.tool-dashboard-col>.card{margin:14px 0}.tool-dashboard-placeholder{display:none}}
</style>`;

const TOOL_NAV = `<nav class="tool-nav" id="toolNav"><a href="/convert.html">환산스공</a><a class="active" href="/">무기 계산기</a><a href="/captain.html">공대장 계산기</a></nav>`;
const CONVERT_NAV = `<nav class="topnav"><a class="active" href="/convert.html">환산스공</a><a href="/">무기 계산기</a><a href="/captain.html">공대장 계산기</a></nav>`;
const CAPTAIN_NAV = `<nav class="topnav"><a href="/convert.html">환산스공</a><a href="/">무기 계산기</a><a class="active" href="/captain.html">공대장 계산기</a></nav>`;
const CAPTAIN_SPLIT_SCRIPT = `<script src="/captain-split.js" defer></script>`;

const CONVERT_DASH_SCRIPT = `
<script>
(()=>{
  const main=document.querySelector('main');if(!main)return;
  const cards=Array.from(main.querySelectorAll(':scope>section.card'));
  const current=cards.find(s=>(s.querySelector('h2')?.textContent||'').includes('현재 스펙'));
  const potential=cards.find(s=>(s.querySelector('h2')?.textContent||'').includes('잠재 입력'));
  const result=document.getElementById('result');
  const calc=document.getElementById('calc');
  if(!current||!potential||!result||!calc||document.getElementById('convertDashboard'))return;
  const dash=document.createElement('div');dash.id='convertDashboard';dash.className='tool-dashboard';
  const c1=document.createElement('div'),c2=document.createElement('div'),c3=document.createElement('div');
  [c1,c2,c3].forEach(c=>c.className='tool-dashboard-col');
  current.parentNode.insertBefore(dash,current);dash.append(c1,c2,c3);
  c1.appendChild(current);c2.appendChild(potential);c2.appendChild(calc);c3.appendChild(result);
  const ph=document.createElement('div');ph.className='tool-dashboard-placeholder';ph.id='convertResultPlaceholder';ph.textContent='값을 입력하고 계산하면 환산 결과가 여기에 표시됩니다.';c3.appendChild(ph);
  const sync=()=>{const visible=getComputedStyle(result).display!=='none';ph.style.display=visible?'none':''};
  calc.addEventListener('click',()=>requestAnimationFrame(sync));new MutationObserver(sync).observe(result,{attributes:true,attributeFilter:['style','class']});sync();
})();
</script>`;

const CAPTAIN_DASH_SCRIPT = `
<script>
(()=>{
  const main=document.querySelector('main');if(!main)return;
  const cards=Array.from(main.querySelectorAll(':scope>section.card'));
  const byTitle=t=>cards.find(s=>(s.querySelector('h2')?.textContent||'').includes(t));
  const sale=byTitle('일반 판매 정산'),weighted=byTitle('일반 정산 차등 분배'),mail=byTitle('일반 정산 택배 수수료');
  const result=document.getElementById('result'),calc=document.getElementById('calc');
  if(!sale||!weighted||!mail||!result||!calc||document.getElementById('captainDashboard'))return;
  const dash=document.createElement('div');dash.id='captainDashboard';dash.className='tool-dashboard';
  const c1=document.createElement('div'),c2=document.createElement('div'),c3=document.createElement('div');
  [c1,c2,c3].forEach(c=>c.className='tool-dashboard-col');
  sale.parentNode.insertBefore(dash,sale);dash.append(c1,c2,c3);
  c1.appendChild(sale);c1.appendChild(calc);c2.appendChild(weighted);c2.appendChild(mail);c3.appendChild(result);
  const ph=document.createElement('div');ph.className='tool-dashboard-placeholder';ph.id='captainResultPlaceholder';ph.textContent='일반 정산 결과가 여기에 표시됩니다.';c3.appendChild(ph);
  const sync=()=>{const visible=getComputedStyle(result).display!=='none';ph.style.display=visible?'none':''};
  calc.addEventListener('click',()=>requestAnimationFrame(sync));new MutationObserver(sync).observe(result,{attributes:true,attributeFilter:['style','class']});sync();
})();
</script>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get('content-type') || '';

    if (url.pathname === '/convert.html' && contentType.includes('text/html')) {
      let html = await response.text();
      html = html.replace(/<nav class="topnav">[\s\S]*?<\/nav>/, CONVERT_NAV);
      html = html.replace('</head>', SHARED_WIDE_STYLE + '</head>');
      html = html.replace('</body>', CONVERT_DASH_SCRIPT + '</body>');
      const headers = new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
      return new Response(html,{status:response.status,statusText:response.statusText,headers});
    }

    if (url.pathname === '/captain.html' && contentType.includes('text/html')) {
      let html = await response.text();
      html = html.replace('grid-template-columns:1fr 1fr;gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin-bottom:18px', 'grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin-bottom:18px');
      html = html.replace(/<nav class="topnav">[\s\S]*?<\/nav>/, CAPTAIN_NAV);
      html = html.replace('</head>', SHARED_WIDE_STYLE + '</head>');
      if (!html.includes('/captain-split.js')) html = html.replace('</body>', CAPTAIN_SPLIT_SCRIPT + CAPTAIN_DASH_SCRIPT + '</body>');
      else html = html.replace('</body>', CAPTAIN_DASH_SCRIPT + '</body>');
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.delete('etag');
      return new Response(html, {status: response.status, statusText: response.statusText, headers});
    }

    if (url.pathname !== '/' && url.pathname !== '/index.html') return response;
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    if (!html.includes('id="toolNav"')) {
      html = html.replace('</head>', TOOL_NAV_STYLE + '</head>');
      html = html.replace(/<main([^>]*)>/, match => match + TOOL_NAV);
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('etag');
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
