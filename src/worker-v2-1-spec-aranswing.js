import baseWorker from './worker-v2-1-boss-reco.js';

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
      if(s&&labels[i]){
        const next=labels[i][0]+' · 스공 '+labels[i][1];
        if(s.textContent!==next)s.textContent=next;
      }
    });
    let note=q('recoSpecGuideNote');
    if(!note){
      note=document.createElement('div');note.id='recoSpecGuideNote';note.className='small';note.style.marginTop='7px';
      tier.insertAdjacentElement('afterend',note);
    }
    const text='※ 저/중/고 스펙 구간은 설명용 러프 가이드입니다. 실제 우세 잠재는 공1 실측값·현재 스공·직업/무기 조건에 따라 달라집니다.';
    if(note.textContent!==text)note.textContent=text;
  }

  function patchAranUi(){
    const job=q('job');if(!job||job.value!=='아란 (풀콤보 기준)')return;
    const simple=q('simpleSkillPct');
    const adv=q('advancedBaseSkillPct');
    if(simple&&simple.value!=='356')simple.value='356';
    if(adv&&adv.value!=='356')adv.value='356';
    const note=q('recoSkillAutoNote');
    const text='자동값: 높성 우2 약 6분 실측 기준 기본공격 100% 16.75% + 더블 스윙 360% 39.07% + 트리플 스윙 450% 44.18% 가중 대표값 약 356% · 추천 TOP3 크확 효율은 세 공격 비중을 각각 계산';
    if(note&&note.textContent!==text)note.textContent=text;
  }

  let raf=0;
  const sync=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      patchSpecLabels();
      patchAranUi();
    });
  };

  ['job','recoCommonJob'].forEach(id=>q(id)?.addEventListener('change',sync));
  const flow=q('recoFlow');
  if(flow)new MutationObserver(sync).observe(flow,{childList:true,characterData:true,subtree:true});
  sync();
})();
</script>`;

function patchAranModel(html){
  html=html.replace(
    "'아란 (풀콤보 기준)':{name:'파이널 블로우',pct:700}",
    "'아란 (풀콤보 기준)':{name:'기본공격 + 더블 스윙 + 트리플 스윙',mix:[{name:'기본공격',pct:100,weight:.16752},{name:'더블 스윙',pct:360,weight:.39069},{name:'트리플 스윙',pct:450,weight:.44179}],note:'높은 성벽 우2 약 6분 DPS 실측 비중 · 바디 프레셔 제외'}"
  );
  html=html.replace(
    "'아란 (풀콤보 기준)':{name:'더블 스윙 + 트리플 스윙',mix:[{name:'더블 스윙',pct:360,weight:.5},{name:'트리플 스윙',pct:450,weight:.5}],note:'사냥 대표 비중 50:50 러프 가중 · 오버스윙 M 기준'}",
    "'아란 (풀콤보 기준)':{name:'기본공격 + 더블 스윙 + 트리플 스윙',mix:[{name:'기본공격',pct:100,weight:.16752},{name:'더블 스윙',pct:360,weight:.39069},{name:'트리플 스윙',pct:450,weight:.44179}],note:'높은 성벽 우2 약 6분 DPS 실측 비중 · 바디 프레셔 제외'}"
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
