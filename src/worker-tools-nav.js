import app from './worker-v2-1-spec-aranswing.js';

const TOOL_NAV_STYLE = `
<style>
.tool-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin:0 0 18px}
.tool-nav a{text-align:center;text-decoration:none;padding:12px;border-radius:10px;color:var(--muted);font-weight:800}
.tool-nav a.active{background:var(--accent);color:var(--accentText)}
</style>`;

const TOOL_NAV = `<nav class="tool-nav" id="toolNav"><a class="active" href="/">무기 계산기</a><a href="/captain.html">공대장 계산기</a></nav>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/index.html') return response;
    const contentType = response.headers.get('content-type') || '';
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
