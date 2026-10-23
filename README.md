# maple-planet-calculator

메이플 플래닛 계산기 프로젝트.

## V2.2 구조 원칙

- Cloudflare Workers Git deployment connected (dev preview enabled)
- DEV 엔트리는 `src/worker-v2-2.js`
- V2.1 Worker 체인은 **legacy compatibility layer**로 동결한다.
- 새 기능/수정은 V2.1 체인에 새 patch worker를 추가하지 않는다.
- 직업/크리/대표 스킬 기본값의 기준 파일은 `src/v2-2/job-presets.js`다.
- 핵심 화면 요소 누락은 `src/v2-2/regression.js`의 회귀 계약으로 검사한다.
- main 반영 전에는 반드시 dev Preview에서 회귀 경고가 없는지 확인한다.

## V2.2 migration target

최종 목표는 아래처럼 단순화하는 것이다.

```text
public/
  index.html
  convert.html
  captain.html
  calculator.css
  calculator.js
src/
  worker-v2-2.js
  v2-2/
    job-presets.js
    regression.js
```

기존 `worker-v2-*` 파일은 기능을 새 구조로 옮기는 동안만 호환 레이어로 유지한다. 완전 이관 전에는 기존 파일을 삭제하지 않는다.

## Regression rules

DEV Preview에서 다음과 같은 핵심 요소가 누락되면 V2.2 엔트리가 상단 경고 배너와 `x-planet-regression` 헤더로 표시한다.

- 무기 계산기: 일반/심화 모드, 공1 측정, 무기 비교, 주스탯 실측, 도움말, 추천 잠재, 업데이트 내역
- 직업 프리셋: 팔라딘 차지 블로우, 신궁 혼합 스킬, 아란 실측 가중
- 환산스공: 입력/잠재/결과 및 직업 프리셋
- 공대장 계산기: 일반 판매, 차등 분배, 택배, 공금 차감, 직거래 정산
