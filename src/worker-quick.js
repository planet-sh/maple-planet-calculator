import baseWorker from './worker.js';

// V2.2 DEV
// 기존 초간단 비교는 환산스공 기능과 역할이 겹쳐 제거합니다.
// 무기 계산기는 일반/심화 비교에 집중하고,
// 사냥/보스 대상 구분과 사자왕의 성 레이팅 옵션은 상위 UI에서 별도로 다룹니다.

export default {
  async fetch(request, env, ctx) {
    return baseWorker.fetch(request, env, ctx);
  }
};
