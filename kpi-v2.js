(function kpiV2Addon(){
  'use strict';
  const baseRender=render;
  const valid5=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=5?v:null;
  const average=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
  const text5=v=>v===null?'Non renseigné':reportNumber(v)+' /5';
  const sourceRating=id=>missionRatings[id]||null;
  const formation5=id=>valid5(sourceRating(id)?.formation5??sourceRating(id)?.formationNote5);
  function trainerFormationMetric(id){
    const values=db.assignments.filter(a=>a.trainerId===id&&a.status==='Réalisée')
      .filter(a=>sourceRating(a.id)?.public===true)
      .map(a=>formation5(a.id)).filter(Number.isFinite);
    return {value:average(values),count:values.length};
  }
  function periodOf(s,today){
    if(s.status==='Annulée')return 'cancelled';
    return s.status==='Réalisée'||s.date<today?'past':'upcoming';
  }
  function decorateClient(){
    const card=document.querySelector('.client-dashboard > section.card');
    if(!card)return;
    const period=state.clientSessionPeriod||'all';
    const group=document.createElement('div');
    group.className='hub-v2-period';
    group.setAttribute('role','group');
    group.setAttribute('aria-label','Filtrer les formations du client');
    [['all','Toutes'],['upcoming','À venir'],['past','Passées']].forEach(([key,label])=>{
      const b=document.createElement('button');
      b.className=(period===key?'primary':'secondary')+' tiny';
      b.textContent=label;
      b.setAttribute('aria-pressed',String(period===key));
      b.onclick=()=>{state.clientSessionPeriod=key;render()};
      group.appendChild(b);
    });
    const header=card.querySelector('.card-head');
    if(header)header.after(group);else card.prepend(group);
    const fs=formations.filter(f=>f.clientId===state.selectedClient);
    const today=parisToday();
    let shown=0;
    card.querySelectorAll('button[onclick^="openFormation("]').forEach(btn=>{
      const id=btn.getAttribute('onclick')?.match(/openFormation\('([^']+)'\)/)?.[1];
      const match=period==='all'||db.sessions.some(s=>s.formationId===id&&periodOf(s,today)===period);
      btn.hidden=!match;
      if(match)shown++;
    });
    if(!shown&&fs.length){
      const empty=document.createElement('p');
      empty.className='empty hub-v2-filter-empty';
      empty.textContent='Aucune formation pour ce filtre.';
      group.after(empty);
    }
  }
  function decorateTrainerHome(){
    const stats=document.querySelector('.pd-stats');
    if(!stats)return;
    stats.querySelectorAll('.pd-stat').forEach(btn=>{
      const span=btn.querySelector('span');
      if(span?.textContent.includes('NPS moyen'))span.firstChild.textContent='NPS /10';
    });
    const note=trainerFormationMetric(state.trainerId);
    const btn=document.createElement('button');
    btn.className='pd-stat';
    btn.onclick=()=>go('trainer-profile');
    const title=document.createElement('span');title.textContent='Note de formation /5';
    const value=document.createElement('strong');value.textContent=text5(note.value);
    value.className='pd-stat-compact';
    const detail=document.createElement('small');detail.textContent=note.count+' évaluation(s) communicable(s)';
    btn.append(title,value,detail);
    stats.appendChild(btn);
    stats.classList.add('hub-v2-five-stats');
  }
  render=function(){
    baseRender();
    if(state.page==='client-detail'&&state.role==='amo')decorateClient();
    if(state.page==='trainer-home'&&state.role==='formateur')decorateTrainerHome();
  };
  if(['trainers','trainer-detail','client-detail','reporting','trainer-home'].includes(state.page))render();
})();
