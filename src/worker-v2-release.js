import baseWorker from './worker-v2-buffs.js';

function patchReleaseCopy(html){
  html=html.replace('메이플 플래닛 계산기 <span class="tag">V2.0 DEV</span>','메이플 플래닛 계산기 <span class="tag">V2.0</span>');
  html=html.replace(
    '<b>V1.9 · 2026-10-23</b><br>',
    '<b>V2.0 · 2026-10-23</b><br>\n        · 사자왕의 성 레이팅 필드 지원 추가<br>\n        · 사냥터별 권장 레이팅 / 현재 달성률 / 피해 배율 자동 표시<br>\n        · 다음 피해배율 커트라인 및 목표 레이팅 도달 예상일 계산 추가<br>\n        · 일일 의뢰 +20 / 주간 의뢰 +40 성장 포인트 기준 ETA 계산<br>\n        · 보스 공격력 +20% / +30% 잠재 지원<br>\n        · 레이팅 필드에서 길드스킬 보공 +5% ON/OFF 지원<br>\n        · 뿌리기 공격력 +20 ON/OFF 추가<br>\n        · 영웅의 메아리 공격력 +4% ON/OFF 추가<br>\n        · 초간단 비교는 깡공 ↔ 총데미지 전용으로 유지하고, 보공은 일반/심화 계산에서만 반영<br>\n        <br><b>V1.9 · 2026-10-23</b><br>'
  );
  html=html.replace(
    '<b>V1.8</b> · 간편/심화 분리, 실전 스킬 비중·DPS, 주스탯 실측, 크리 계산 구조 개선<br>',
    '<b>V1.9</b> · 초간단 비교, 손익분기 최대 스공 계산 추가<br>\n          <b>V1.8</b> · 간편/심화 분리, 실전 스킬 비중·DPS, 주스탯 실측, 크리 계산 구조 개선<br>'
  );
  html=html.replace(
    '<summary>초간단 / 간편 / 심화 계산기의 차이는?</summary>',
    '<summary>초간단 / 일반 / 심화 계산기의 차이는?</summary>'
  );
  html=html.replace(
    '<b>간편 계산기</b>를 사용하세요.',
    '<b>일반 계산기</b>를 사용하세요.'
  );
  html=html.replace(
    '<b>심화 계산기</b>는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고',
    '<b>심화 계산기</b>는 공1 · 주스탯1 · 주스탯1% 실측을 기본으로 사용하고'
  );
  html=html.replace('>간편 계산기<','>일반 계산기<');
  html=html.replace('<b>간편 계산기</b> · 대표 주력기','<b>일반 계산기</b> · 대표 주력기');
  return html;
}

export default {
  async fetch(request, env, ctx) {
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();
    html=patchReleaseCopy(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};