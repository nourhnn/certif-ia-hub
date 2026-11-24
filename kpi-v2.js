(function kpiV2Addon(){
  'use strict';
  const baseRender=render;
  const baseMonthly=monthlyReport;
  const baseMonthlyRows=monthlyTableRows;
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
  function monthlyClientStats(r){
    return [...new Set(r.sessions.map(s=>formOf(s).clientId))].map(id=>{
      const sessions=r.sessions.filter(s=>formOf(s).clientId===id);
      const ids=new Set(sessions.map(s=>s.id));
      const assignments=r.assignments.filter(a=>ids.has(a.sessionId));
      const nps=assignments.map(a=>sourceRating(a.id)?.nps).filter(v=>Number.isFinite(v)&&v>=0&&v<=10);
      const notes=assignments.map(a=>formation5(a.id)).filter(Number.isFinite);
      return {id,name:clientById(id)?.name||'Client',sessions:sessions.length,nps:average(nps),note:average(notes),npsCount:nps.length,noteCount:notes.length};
    }).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  }
  monthlyReport=function(){
    const r=baseMonthly();
    const notes=r.assignments.map(a=>formation5(a.id)).filter(Number.isFinite);
    r.formationNote5=average(notes);
    r.formationCount=notes.length;
    r.clientNotes=monthlyClientStats(r);
    return r;
  };
  monthlyTableRows=function(r){
    const report=r||monthlyReport();
    const rows=baseMonthlyRows(report);
    if(!rows.length)return rows;
    const summary=['Synthèse','Note moyenne de formation /5',report.formationNote5===null?'Non renseigné':reportNumber(report.formationNote5)];
    rows.push([report.month,summary[0],'','','','','',summary[1],summary[2]]);
    report.clientNotes.forEach(c=>{
      rows.push([report.month,'Synthèse client',c.name,'','','','', 'NPS /10',c.nps===null?'Non renseigné':reportNumber(c.nps)]);
      rows.push([report.month,'Synthèse client',c.name,'','','','', 'Note formation /5',c.note===null?'Non renseigné':reportNumber(c.note)]);
    });
    return rows;
  };
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
  function decorateMonthly(){
    const r=monthlyReport();
    const cards=document.querySelector('.cards');
    if(cards)cards.insertAdjacentHTML('beforeend',metric('Note de formation /5',text5(r.formationNote5),r.formationCount+' évaluation(s) renseignée(s)'));
    const panel=document.createElement('section');
    panel.className='card hub-v2-monthly-clients';
    const heading=document.createElement('h3');
    heading.className='section-title';
    heading.textContent='NPS et note de formation par client';
    panel.appendChild(heading);
    const wrap=document.createElement('div');wrap.className='table-wrap';
    const table=document.createElement('table');table.className='tbl monthly-report-table';
    const head=document.createElement('thead');
    head.innerHTML='<tr><th>Client</th><th>Sessions</th><th>NPS /10</th><th>Formation /5</th></tr>';
    table.appendChild(head);
    const body=document.createElement('tbody');
    r.clientNotes.forEach(c=>{
      const tr=document.createElement('tr');
      [c.name,String(c.sessions),c.nps===null?'Non renseigné':reportNumber(c.nps)+' /10',text5(c.note)].forEach(value=>{
        const td=document.createElement('td');td.textContent=value;tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    if(!r.clientNotes.length){const row=document.createElement('tr');const td=document.createElement('td');td.colSpan=4;td.textContent='Aucune formation sur cette période.';row.appendChild(td);body.appendChild(row);}
    table.appendChild(body);wrap.appendChild(table);panel.appendChild(wrap);
    const before=document.querySelector('.monthly-bonus-panel');
    if(before)before.before(panel);else cards?.after(panel);
    document.querySelectorAll('.card').forEach(card=>{
      const heading=card.querySelector('.section-title');
      if(heading?.textContent.includes('Grille proposée de fiabilité'))card.remove();
      else if(heading?.textContent.includes('Ponctualité et fiabilité'))heading.textContent='Ponctualité et suivi qualité';
    });
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
    if(state.page==='reporting'&&state.role==='amo')decorateMonthly();
    if(state.page==='trainer-home'&&state.role==='formateur')decorateTrainerHome();
  };
  if(['trainers','trainer-detail','client-detail','reporting','trainer-home'].includes(state.page))render();
})();
