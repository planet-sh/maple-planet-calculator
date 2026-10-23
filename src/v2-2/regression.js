// Lightweight DEV regression contract for the generated HTML.
// The goal is to catch silent UI/data omissions before a V2.2 Preview is promoted.

const CONTRACTS = {
  weapon: [
    ['tool navigation','환산스공'],
    ['weapon tab','무기 계산기'],
    ['combat purpose','사냥용 무기 비교'],
    ['normal mode','일반 계산'],
    ['advanced mode','심화 계산'],
    ['attack calibration','공1당 스공 효율 측정'],
    ['weapon comparison','현재 무기 / 비교 매물'],
    ['stat calibration section','statCalSection'],
    ['stat percent calibration section','pctCalSection'],
    ['advanced help hook','section-help'],
    ['skill auto note','recoSkillAutoNote'],
    ['potential recommendation','무기 잠재 추천'],
    ['release history','업데이트 내역'],
    ['paladin skill preset','차지 블로우'],
    ['marksman mixed skill','스트레이프'],
    ['aran measured mix','기본공격 + 더블 스윙 + 트리플 스윙']
  ],
  convert: [
    ['tool navigation','환산스공'],
    ['current stat input','현재 표시 스공'],
    ['potential input','잠재 입력'],
    ['result','환산 결과'],
    ['paladin skill preset','차지 블로우'],
    ['marksman preset','스트레이프'],
    ['aran measured representative','356']
  ],
  captain: [
    ['tool navigation','공대장 계산기'],
    ['sale settlement','일반 판매 정산'],
    ['weighted settlement','일반 정산 차등 분배'],
    ['parcel fee','일반 정산 택배 수수료'],
    ['fund deduction','공금 차감'],
    ['direct trade','직거래 · 내부구매 정산']
  ]
};

export function validateHtml(kind, html){
  const contract=CONTRACTS[kind]||[];
  const missing=contract.filter(([,needle])=>!html.includes(needle)).map(([label])=>label);
  return {ok:missing.length===0, missing};
}

export function regressionHeader(result){
  return result.ok?'ok':'missing:'+result.missing.join(',');
}
