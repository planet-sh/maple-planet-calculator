import app from './worker-v2-1-mode-guard.js';

const STYLE = `
<style>
.section-help{display:inline-grid;place-items:center;width:19px;height:19px;margin-left:7px;padding:0;border:1px solid var(--line);border-radius:50%;background:var(--panel2);color:var(--muted);font-size:11px;font-weight:900;line-height:1;vertical-align:2px;cursor:help;position:relative;overflow:visible}
.section-help:hover,.section-help:focus,.section-help.open{color:var(--text);border-color:var(--accent);outline:none}
.section-help::after{content:attr(data-tip);position:absolute;left:0;top:calc(100% + 10px);width:min(500px,72vw);padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--input);color:var(--text);font-size:12px;font-weight:500;line-height:1.7;text-align:left;white-space:pre-line;box-shadow:0 12px 32px rgba(0,0,0,.32);opacity:0;visibility:hidden;pointer-events:none;z-index:1500}
.section-help:hover::after,.section-help:focus::after,.section-help.open::after{opacity:1;visibility:visible}
@media(max-width:720px){.section-help::after{left:auto;right:-12px;width:min(330px,82vw)}}
</style>`;

const SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);
  const helps={
    statCalSection:'① 깡 주스탯만 변하는 장비나 칭호를 준비합니다.\n② 미착용 상태의 스탯창 A(기본), B(추가), MIN/MAX 스공을 입력합니다.\n③ 장비를 착용한 뒤 장비에 적힌 주스탯 증가량과 착용 후 A/B, MIN/MAX 스공을 입력합니다.\n④ 계산기는 스공 증가량 ÷ 장비의 깡 주스탯 증가량으로 주스탯 1당 효율을 구합니다.\n\n예) 올스탯 +2 칭호라면 테스트 장비 주스탯 증가량에 2 입력. A+B 변화량은 검증용이며 계산 기준은 장비에 적힌 원래 주스탯 증가량입니다.\n※ 테스트 장비 외 버프·스킬·펫·칭호 조건은 동일하게 유지하세요.',
    pctCalSection:'① 먼저 위의 주스탯 1당 효율 측정을 완료합니다.\n② 깡 주스탯 + 주스탯%가 함께 붙은 장비를 준비합니다.\n③ 미착용 상태의 A/B와 MIN/MAX 스공을 입력합니다.\n④ 착용 후 장비의 깡 주스탯, 주스탯%, A/B, MIN/MAX 스공을 입력합니다.\n⑤ 계산기는 전체 스공 상승분에서 깡 주스탯으로 오른 스공을 먼저 빼고, 남은 상승분을 주스탯% 수치로 나눠 1%당 효율을 구합니다.\n\n예) STR +7 / STR +14% 장비라면 깡 주스탯 7, 주스탯% 14 입력.\n※ 위 주스탯 1 측정과 최대한 같은 장비·버프·스킬 조건을 유지하세요.'
  };
  Object.entries(helps).forEach(([id,tip])=>{
    const card=q(id),h2=card?.querySelector(':scope>h2');if(!h2||h2.querySelector('.section-help'))return;
    const b=document.createElement('button');b.type='button';b.className='section-help';b.textContent='?';b.dataset.tip=tip;b.setAttribute('aria-label','측정 방법 도움말');
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.querySelectorAll('.section-help.open').forEach(x=>{if(x!==b)x.classList.remove('open')});b.classList.toggle('open')});
    h2.appendChild(b);
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.section-help'))document.querySelectorAll('.section-help.open').forEach(x=>x.classList.remove('open'))});
})();
</script>`;

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    if((url.pathname!=='/'&&url.pathname!=='/index.html')||!(response.headers.get('content-type')||'').includes('text/html'))return response;
    let html=await response.text();
    html=html.replace('</head>',STYLE+'</head>').replace('</body>',SCRIPT+'</body>');
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};
