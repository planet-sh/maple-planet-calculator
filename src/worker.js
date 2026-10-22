const SUPPORT_HTML = `
<section class="card" id="projectHub">
  <h2>업데이트 · 문의</h2>
  <div class="grid">
    <div class="weapon">
      <h3>📌 업데이트 내역</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">
        <b>V1.8 · 2026-10-22</b><br>
        · 간편 계산기 / 심화 계산기 분리<br>
        · 심화 계산기에 주스탯1 · 주스탯1% 실측 효율 추가<br>
        · 나이트로드 샤프아이즈: 크확 +15%p / 크뎀 +40%p 반영<br>
        · 보우마스터·신궁 패시브 반영: 기본 크확 50% / 크뎀 110%, 찐샾 적용 후 65% / 250%<br>
        · GitHub → Cloudflare Preview 배포 구조 적용
      </div>
      <details class="details">
        <summary>이전 버전 보기</summary>
        <div class="small" style="margin-top:10px;line-height:1.8">
          <b>V1.7</b> · 무기 잠재 비교, 공1 실측, 직업 프리셋, 자동 저장, 다크/라이트 모드<br>
          <b>초기 버전</b> · 사자왕의 성 사냥용 무기 잠재 상대 효율 비교
        </div>
      </details>
    </div>

    <div class="weapon">
      <h3>🛠️ 오류 제보 · 건의사항</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">
        계산 오류, 직업 스킬 수치 제보, UI 개선, 신규 기능 요청을 받고 있습니다.<br>
        재현 가능한 경우 <b>직업 / 현재 무기 / 비교 매물 / 입력값 / 결과 화면</b>을 함께 남겨주세요.
      </div>
      <a href="https://github.com/planet-sh/maple-planet-calculator/issues/new" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--accent);color:var(--accentText);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">GitHub로 오류·건의 제보</a>
      <div class="small" style="margin-top:8px">GitHub 이용이 어려우면 아래 유튜브 채널 댓글로 남겨주셔도 됩니다.</div>
    </div>
  </div>

  <div class="grid" style="margin-top:12px">
    <div class="weapon">
      <h3>📺 유튜브 / 보조 문의 채널</h3>
      <div class="small" style="margin-top:8px;line-height:1.8">계산기 업데이트 안내, 계산 예시, 메이플 플래닛 관련 영상은 유튜브 채널에서 확인할 수 있습니다.</div>
      <a href="https://www.youtube.com/@planet_sh/featured" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:12px;text-align:center;background:var(--panel);color:var(--tagText);border:1px solid var(--line);text-decoration:none;border-radius:12px;padding:12px 14px;font-weight:800">플래닛 공대장 서현 YouTube</a>
    </div>

    <div class="weapon">
      <h3>❓ FAQ · 공지</h3>
      <details class="details" open>
        <summary>간편 계산기와 심화 계산기의 차이는?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">간편 계산기는 깡 주스탯 5 = 공1, 주스탯 1.5% = 공1의 러프 환산을 사용합니다. 심화 계산기는 공1 · 주스탯1 · 주스탯1%를 직접 실측해 현재 캐릭터 세팅 기준으로 계산합니다.</div>
      </details>
      <details class="details">
        <summary>계산값이 실제 사냥 딜과 완전히 같나요?</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">아닙니다. 장비 후보 간 상대 효율을 비교하기 위한 도구이며, 직업별 스킬 구조·타수·몬스터 조건 등 실제 전투 요소에 따라 차이가 날 수 있습니다.</div>
      </details>
      <details class="details">
        <summary>계산식이나 스킬 수치가 틀린 것 같아요.</summary>
        <div class="small" style="margin-top:8px;line-height:1.7">오류 제보에 근거 자료와 함께 남겨주세요. 확인 후 dev Preview에서 먼저 검증하고 production에 반영합니다.</div>
      </details>
    </div>
  </div>
</section>`;

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/index.html") return response;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    if (html.includes('id="projectHub"')) return new Response(html, response);

    const updated = html.replace("</main>", `${SUPPORT_HTML}</main>`);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("etag");

    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
