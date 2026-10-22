import baseWorker from './worker-v2-1-common-reco.js';

const PATCH_SCRIPT = `
<script>
(()=>{
  const q=id=>document.getElementById(id);

  function patchSpecLabels(){
    const tier=q('recoTierFlow');
    if(!tier)return;
    const cards=Array.from(tier.querySelectorAll('.metric'));
    const labels=[['저스펙','~2만'],['중스펙','2만~5만'],['고스펙','5만+']];
    cards.forEach((card,i)=>{
      const s=card.querySelector('.small');
      if(s&&labels[i])s.textContent=labels[i][0]+' · 스공 '+labels[i][1];
    });
    let note=q('recoSpecGuideNote');
    if(!note){
      note=document.createElement('div');note.id='recoSpecGuideNote';note.className='small';note.style.marginTop='7px';
      tier.insertAdjacentElement('afterend',note);
    }
    note.textContent='※ 저/중/고 스펙 구간은 설명용 러프 가이드입니다. 실제 우세 잠재는 공1 실측값·현재 스공·직업/무기 조건에 따라 달라집니다.';
  }

  function patchAranUi(){
    const job=q('job');if(!job||job.value!=='아란 (풀콤보 기준)')return;
    const simple=q('simpleSkillPct');
    const adv=q('advancedBaseSkillPct');
    // 더블 360 / 트리플 450을 50:50로 러프 가중한 대표 입력값
    if(simple)simple.value=405;
    if(adv)adv.value=405;
    const note=q('recoSkillAutoNote');
    if(note)note.textContent='자동값: 더블 스윙 360% + 트리플 스윙 450%를 사냥 비중 50:50으로 러프 가중한 대표값 405% · 추천 잠재는 스윙 계열 기준으로 보정';
  }

  function sync(){setTimeout(()=>{patchSpecLabels();patchAranUi()},0)}
  ['quickMode','simpleMode','advancedMode','job','recoCommonJob'].forEach(id=>q(id)?.addEventListener('change',sync));
  ['quickMode','simpleMode','advancedMode'].forEach(id=>q(id)?.addEventListener('click',sync));
  const flow=q('recoFlow');if(flow)new MutationObserver(sync).observe(flow,{childList:true,characterData:true,subtree:true});
  sync();
})();
</script>`;

function patchAranModel(html){
  // 추천 모델 자체도 파이널 블로우 대신 더블/트리플 스윙 50:50으로 변경
  html=html.replace(
    "'아란 (풀콤보 기준)':{name:'파이널 블로우',pct:700}",
    "'아란 (풀콤보 기준)':{name:'더블 스윙 + 트리플 스윙',mix:[{name:'더블 스윙',pct:360,weight:.5},{name:'트리플 스윙',pct:450,weight:.5}],note:'사냥 대표 비중 50:50 러프 가중 · 오버스윙 M 기준'}"
  );
  html=html.replace('</body>',PATCH_SCRIPT+'</body>');
  return html;
}

export default {
  async fetch(request,env,ctx){
    const response=await baseWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(url.pathname!=='/'&&url.pathname!=='/index.html')return response;
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.includes('text/html'))return response;
    let html=await response.text();html=patchAranModel(html);
    const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
    return new Response(html,{status:response.status,statusText:response.statusText,headers});
  }
};