import app from './worker-v2-1-ux.js';

const TOOL_NAV_STYLE = `
<style>
.tool-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin:0 0 18px}
.tool-nav a{text-align:center;text-decoration:none;padding:12px 8px;border-radius:10px;color:var(--muted);font-weight:800}
.tool-nav a.active{background:var(--accent);color:var(--accentText)}
@media(max-width:720px){.tool-nav a{font-size:13px;padding:11px 4px}}
</style>`;

const TOOL_NAV = `<nav class="tool-nav" id="toolNav"><a class="active" href="/">무기 계산기</a><a href="/convert.html">환산스공</a><a href="/captain.html">공대장 계산기</a></nav>`;
const CAPTAIN_NAV = `<nav class="topnav"><a href="/">무기 계산기</a><a href="/convert.html">환산스공</a><a class="active" href="/captain.html">공대장 계산기</a></nav>`;
const CAPTAIN_SPLIT_SCRIPT = `<script src="/captain-split.js" defer></script>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get('content-type') || '';

    if (url.pathname === '/captain.html' && contentType.includes('text/html')) {
      let html = await response.text();
      html = html.replace('grid-template-columns:1fr 1fr;gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin-bottom:18px', 'grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin-bottom:18px');
      html = html.replace(/<nav class="topnav">[\s\S]*?<\/nav>/, CAPTAIN_NAV);
      if (!html.includes('/captain-split.js')) html = html.replace('</body>', CAPTAIN_SPLIT_SCRIPT + '</body>');
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
