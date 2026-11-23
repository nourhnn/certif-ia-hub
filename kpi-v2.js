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
  const satisfaction5=id=>valid5(sourceRating(id)?.satisfaction5??sourceRating(id)?.trainerSatisfaction5);
  function trainerMetric(id,type){
    const values=db.assignments.filter(a=>a.trainerId===id&&a.status==='Réalisée')
      .filter(a=>sourceRating(a.id)?.public===true)
      .map(a=>type==='formation'?formation5(a.id):satisfaction5(a.id)).filter(Number.isFinite);
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
  function metrics(id){
    const el=document.createElement('div');
    el.className='hub-v2-kpis';
    const s=trainerMetric(id,'satisfaction');
    const nps=trainerNps(id);
    const vals=[['NPS',nps],['Satisfaction',text5(s.value)]];
    vals.forEach(([label,value])=>{
      const cell=document.createElement('span');
      cell.className='hub-v2-kpi';
      const small=document.createElement('small'),strong=document.createElement('strong');
      small.textContent=label;strong.textContent=value;
      cell.append(small,strong);el.appendChild(cell);
    });
    return el;
  }
  function decorateTrainers(){
    document.querySelectorAll('.trainer-directory-card').forEach(card=>{
      const id=Number(card.querySelector('button[onclick^="openTrainer("]')?.getAttribute('onclick')?.match(/\d+/)?.[0]);
      const t=trainerById(id);
      if(!t)return;
      card.querySelectorAll('.badge').forEach(b=>{if(b.textContent.includes('Fiabilité')){const parent=b.parentElement;if(parent?.getAttribute('style')?.includes('margin:9px'))parent.remove();else b.remove();}});
      card.querySelector('.trainer-stats')?.before(metrics(id));
      card.querySelectorAll('.item-sub').forEach(el=>{if(el.textContent.includes('Satisfaction ')&&el.textContent.includes('/10'))el.textContent=trainerProfileField(id).domain||'Spécialité à renseigner';});
    });
    document.querySelectorAll('.tbl').forEach(table=>{
      const th=[...table.querySelectorAll('thead th')];
      const reliability=th.findIndex(x=>x.textContent.trim()==='Fiabilité');
      if(reliability<0)return;
      const npsColumn=th.findIndex(x=>x.textContent.includes('NPS'));
      th[reliability].textContent='Satisfaction /5';
      if(npsColumn>=0)th[npsColumn].textContent='NPS /10';
      table.querySelectorAll('tbody tr').forEach(row=>{
        const tds=[...row.querySelectorAll('td')];
        const id=Number(row.querySelector('[onclick^="openTrainer("]')?.getAttribute('onclick')?.match(/\d+/)?.[0]);
        if(!trainerById(id))return;
        if(npsColumn>=0&&tds[npsColumn])tds[npsColumn].textContent=trainerNps(id);
        if(tds[reliability])tds[reliability].textContent=text5(trainerMetric(id,'satisfaction').value);
      });
    });
  }
  function decorateTrainerDetail(){
    const fiche=document.querySelector('.profile-fiche');
    if(!fiche)return;
    const t=trainerById(state.selectedTrainer);
    if(!t)return;
    fiche.querySelectorAll('.badge').forEach(b=>{if(b.textContent.includes('Fiabilité'))b.remove()});
    const top=fiche.querySelector('.fiche-hero .trainer-meta');
    if(top)top.after(metrics(t.id));
    if(state.trainerDetailTab==='performance'){
      const card=fiche.querySelector('.cards');
      card?.insertAdjacentHTML('beforeend',metric('Satisfaction /5',text5(trainerMetric(t.id,'satisfaction').value),'Données communicables'));
      fiche.querySelectorAll('.card').forEach(panel=>{
        if(panel.querySelector('.section-title')?.textContent.includes('Fiabilité')){
          panel.innerHTML='<h3 class="section-title">Évaluations</h3><p class="item-sub">NPS sur 10 et satisfaction sur 5 sont des indicateurs distincts.</p>';
          panel.appendChild(metrics(t.id));
        }
      });
    }
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
    const note=trainerMetric(state.trainerId,'formation');
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
    if(state.page==='trainers'&&state.role==='amo')decorateTrainers();
    if(state.page==='trainer-detail'&&state.role==='amo')decorateTrainerDetail();
    if(state.page==='client-detail'&&state.role==='amo')decorateClient();
    if(state.page==='reporting'&&state.role==='amo')decorateMonthly();
    if(state.page==='trainer-home'&&state.role==='formateur')decorateTrainerHome();
  };
  if(['trainers','trainer-detail','client-detail','reporting','trainer-home'].includes(state.page))render();
})();
