import baseWorker from './worker-v2-recommend-captain.js';

function patchV21Release(html){
  html=html.replace('메이플 플래닛 계산기 <span class="tag">V2.0</span>','메이플 플래닛 계산기 <span class="tag">V2.1</span>');
  html=html.replace('메이플 플래닛 계산기 <span class="tag">V2.0 DEV</span>','메이플 플래닛 계산기 <span class="tag">V2.1 DEV</span>');

  const oldBlock='<b>V2.0 · 2026-10-23</b><br>\n        · 사자왕의 성 레이팅 필드 지원 추가<br>\n        · 사냥터별 권장 레이팅 / 현재 달성률 / 피해 배율 자동 표시<br>\n        · 다음 피해배율 커트라인 및 목표 레이팅 도달 예상일 계산 추가<br>\n        · 일일 의뢰 +20 / 주간 의뢰 +40 성장 포인트 기준 ETA 계산<br>\n        · 보스 공격력 +20% / +30% 잠재 지원<br>\n        · 레이팅 필드에서 길드스킬 보공 +5% ON/OFF 지원<br>\n        · 뿌리기 공격력 +20 ON/OFF 추가<br>\n        · 영웅의 메아리 공격력 +4% ON/OFF 추가<br>\n        · 초간단 비교는 깡공 ↔ 총데미지 전용으로 유지하고, 보공은 일반/심화 계산에서만 반영<br>\n        <br>';
  const compact='<b>V2.1 · 2026-10-23</b><br>\n        · 직업별 대표 사냥 스킬 + 무기 프리셋 기반 잠재 추천 TOP3 추가<br>\n        · 100제 / 보핑 / 리버스·타임리스 잠재·기본공·작 수치 구분, 공1 실측 시 현재 스펙 기준 자동 보정<br>\n        · 초간단에서도 직업별 기본 추천과 저·중·고스펙 흐름 제공, 일반/심화에서는 실측 TOP3·역전표까지 지원<br>\n        <details class="details" style="margin:8px 0 12px"><summary>V2.1 상세 변경사항 보기</summary><div class="small" style="margin-top:8px;line-height:1.8">\n          · 직업 선택 시 대표 주력기 데미지% 자동 입력 및 무기공 / 장비공합 기본값 자동 세팅·수동 수정 지원<br>\n          · 100제: 공14 / 공12, 작 +15 기준 · 보핑: 공14 / 공12, 보공20, 작 +12 기준<br>\n          · 신궁: 스트레이프 + 스나이핑 50:50 · 캡틴: 배틀쉽 캐논 · 아란: 더블 스윙 + 트리플 스윙 기준 반영<br>\n          · 저스펙 ~2만 / 중스펙 2만~5만 / 고스펙 5만+ 러프 가이드 추가<br>\n          · 초간단은 기본 추천 TOP3만 표시하고, 내 실측 TOP3·잠재 역전표는 일반/심화에서만 표시\n        </div></details>\n        <b>V2.0 · 2026-10-23</b><br>\n        · 레이팅 필드 / 레이팅 성장 ETA / 보공 잠재 / 사냥 버프 설정 추가<br>\n        <br>';
  html=html.replace(oldBlock,compact);
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();
    html=patchV21Release(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};