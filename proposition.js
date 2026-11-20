function proposalDateHeading(){
  return fmtDate(parisToday(),{weekday:'long',day:'numeric',month:'long'});
}
function proposalStats(items){
  return `<div class="pd-stats">${items.map(([label,value,description,action])=>`<button class="pd-stat" onclick="${action}"><span>${label}${mobileIcon('chevron',14)}</span><strong class="${String(value).length>5?'pd-stat-compact':''}">${esc(value)}</strong><small>${description}</small></button>`).join('')}</div>`;
}
function proposalAction(title,subtitle,label,action,tone='neutral'){
  return `<div class="pd-action"><span class="pd-action-dot ${tone}" aria-hidden="true"></span><div><strong>${title}</strong><p>${subtitle}</p></div><button class="pd-action-button" onclick="${action}">${label}${mobileIcon('chevron',14)}</button></div>`;
}
function contactAgendaSessions(){
  return db.sessions.filter(session=>session.status!=='Annulée');
}

function proposalWeek(person=false){
  const today=parisToday();
  const days=Array.from({length:7},(_,i)=>shiftDate(toISO(weekStart(today)),i));
  const sessions=person?trainerMissionsInCalendar(state.trainerId):contactAgendaSessions();
  return `<div class="pd-week" ${person?'':'role="group" aria-label="Jour de la semaine"'}>${days.map(day=>{
    const action=person?`state.calendarDate='${day}';go('trainer-calendar')`:`pickContactAgendaDay('${day}')`;
    return `<button class="${day===today?'today':''}" aria-label="${person?'Voir le planning':'Voir les sessions'} du ${fmtDate(day)}"
      ${person?'':`data-contact-day="${day}" aria-pressed="${day===state.contactPreviewDay}" aria-controls="pd-contact-preview"`} onclick="${action}">
      <small>${fmtDate(day,{weekday:'short'}).replace('.','')}</small><strong>${Number(day.slice(8))}</strong><span class="${sessions.some(s=>s.date===day)?'has-event':''}"></span></button>`;
  }).join('')}</div>`;
}

function pickContactAgendaDay(day){
  const preview=$('pd-contact-preview');
  if(!preview)return;
  state.contactPreviewDay=day;
  document.querySelectorAll('[data-contact-day]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.contactDay===day));
  });
  preview.innerHTML=proposalContactPreview();
}

function proposalContactPreview(){
  const sessions=contactAgendaSessions().sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  const day=state.contactPreviewDay;
  if(!day)return proposalUpcoming(sessions.find(session=>session.date>=parisToday()&&session.status!=='Réalisée'));
  const entries=sessions.filter(session=>session.date===day);
  return `<div class="pd-next pd-next-day">
    <div class="pd-next-label">${mobileIcon('calendar',15)} ${entries.length>1?'Sessions du jour':'Session du jour'}</div>
    <div class="pd-next-date">${fmtDate(day,{weekday:'long',day:'numeric',month:'long'})}</div>
    ${entries.map(session=>{
      const formation=formOf(session);
      return `<section class="pd-day-session"><h3>${esc(clientOf(formation).name)}</h3><p>${esc(formation.title)}</p>
        <div class="pd-next-meta">${esc(session.start+' – '+session.end)} · ${esc(session.city)} · ${session.people} participants</div>
        <button onclick="openSession(${session.id})">Voir la session ${mobileIcon('chevron',16)}</button></section>`;
    }).join('')||'<p class="pd-next-empty">Aucune session prévue ce jour.</p>'}</div>`;
}

function proposalUpcoming(session,person=false){
  if(!session)return '<div class="empty">Aucune session à venir.</div>';
  const f=formOf(session);
  return `<div class="pd-next"><div class="pd-next-label">${mobileIcon('calendar',15)} Prochaine ${person?'mission':'session'}</div><div class="pd-next-date">${fmtDate(session.date,{day:'numeric',month:'long'})}<small>${session.start} – ${session.end}</small></div><h3>${esc(clientOf(f).name)}</h3><p>${esc(f.title)}</p><div class="pd-next-meta">${mobileIcon('pin',14)}${esc(session.city)}<span>·</span>${session.people} participants</div><button onclick="${person?`openModal('mission-info',${session.id})`:`openSession(${session.id})`}">Voir la ${person?'mission':'session'} ${mobileIcon('chevron',16)}</button></div>`;
}
function proposalSessionRow(session,person=false){
  return `<button class="pd-session" onclick="${person?`openModal('mission-info',${session.id})`:`openSession(${session.id})`}"><span class="pd-session-date"><strong>${session.date.slice(8)}</strong><small>${fmtDate(session.date,{month:'short'}).replace('.','')}</small></span><span class="pd-session-name"><strong>${esc(clientOf(formOf(session)).name)}</strong><small>${esc(formOf(session).title)}</small></span><span class="pd-session-location">${esc(session.city)}<small>${session.start} – ${session.end}</small></span>${badge(person?session.status:staffingLabel(session))}${mobileIcon('chevron',15)}</button>`;
}
function homePage(){
  const today=parisToday();
  const sessions=db.sessions.filter(s=>!['Réalisée','Annulée'].includes(s.status));
  const upcoming=sessions.filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const staff=sessions.filter(s=>openCount(s)>0);
  const docs=db.deliverables.filter(d=>['À fournir','Refusé','En vérification'].includes(d.status));
  const milestones=amoMilestones().filter(step=>step.status==='À traiter');
  const actions=staff.slice(0,2).map(s=>proposalAction(esc(clientOf(formOf(s)).name),openCount(s)+' poste'+(openCount(s)>1?'s':'')+' à pourvoir · '+fmtDate(s.date,{day:'numeric',month:'long'}),'Staffer',`staffFor(${s.id})`,'amber'));
  actions.push(...docs.slice(0,2).map(d=>proposalAction(esc(d.title),esc(clientOf(formOf(sessionById(d.sessionId))).name)+' · '+esc(d.status),d.versions.length?'Vérifier':'Ouvrir',d.versions.length?`openModal('review','${d.id}')`:`openFolder('${d.formationId}')`,d.status==='Refusé'?'red':'violet')));
  return `<header class="pd-page-heading"><div><p class="pd-date">${proposalDateHeading()}</p><h1>Bonjour <span class="pd-greeting-name">Nour</span><span>.</span></h1></div><button class="secondary pd-calendar-button" onclick="go('planning')">${mobileIcon('calendar',16)} <span>Ouvrir le planning</span></button></header>
    ${proposalStats([['Formations',formations.length,'dossiers en cours',`go('formations')`],['Staffing',staff.length,'sessions à compléter',`dashboardGo('staffing','all')`],['Formateurs',trainers.length,'profils référencés',`go('trainers')`],['Livrables',docs.length,'documents à suivre',`dashboardGo('documents','open')`]])}
    <div class="pd-dashboard pd-amo-dashboard">
      <aside class="pd-rail"><section class="pd-panel pd-week-panel"><header><h2>Cette semaine</h2><span>${fmtDate(today,{month:'long'})}</span></header>${proposalWeek()}</section>
        <div id="pd-contact-preview" aria-live="polite" aria-atomic="true">${proposalContactPreview()}</div></aside>
      <div class="pd-work"><section class="pd-panel"><header><h2>À traiter</h2><span class="pd-counter">${actions.length}</span></header><div>${actions.join('')||'<p class="empty">Tout est à jour.</p>'}</div></section>
      <section class="pd-panel"><header><h2>Les prochaines sessions</h2><button class="pd-text-button" onclick="go('formations')">Toutes les formations ${mobileIcon('chevron',14)}</button></header><div>${upcoming.map(s=>proposalSessionRow(s)).join('')}</div></section>
      <section class="pd-milestones"><div class="pd-milestones-icon">${mobileIcon('check',18)}</div><div><h2>Jalons de préparation</h2><p>${milestones.length} étapes à traiter dans les dossiers de formation</p></div><button class="secondary tiny" onclick="openModal('amo-milestones')">Consulter ${mobileIcon('chevron',14)}</button></section>
    </div></div>`;
}
function trainerHome(){
  const t=trainerById(state.trainerId),today=parisToday();
  const proposals=db.proposals.filter(p=>p.trainerId===t.id&&p.status==='Envoyée');
  const missions=trainerMissionsInCalendar(t.id).filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const docs=trainerDocuments().filter(d=>['À fournir','Refusé'].includes(d.status));
  const finished=db.assignments.filter(a=>a.trainerId===t.id&&a.status==='Réalisée').length;
  const actions=proposals.map(p=>proposalAction(esc(clientOf(formOf(sessionById(p.sessionId))).name),'Une nouvelle proposition de mission','Répondre',`dashboardGo('trainer-missions','proposals')`,'violet'));
  actions.push(...docs.slice(0,3).map(d=>proposalAction(esc(d.title),esc(d.status)+' · '+fmtDate(d.dueDate),'Ouvrir',`openModal('document-preview','${d.id}')`,d.status==='Refusé'?'red':'amber')));
  return `<header class="pd-page-heading"><div><p class="pd-date">${proposalDateHeading()}</p><h1>Bonjour <span class="pd-greeting-name">${esc(t.name.split(' ')[0])}</span><span>.</span></h1></div><button class="secondary pd-calendar-button" onclick="go('trainer-calendar')">${mobileIcon('calendar',16)} <span>Mon agenda</span></button></header>
    ${proposalStats([['Propositions',proposals.length,'à examiner',`dashboardGo('trainer-missions','proposals')`],['Livrables',docs.length,'documents à suivre',`dashboardGo('trainer-docs','open')`],['Missions réalisées',finished,'missions terminées',`dashboardGo('trainer-missions','finished')`],['NPS moyen',trainerNps(t.id),'évaluations des missions',`go('trainer-profile')`]])}
    <div class="pd-dashboard"><div class="pd-work"><section class="pd-panel"><header><h2>À traiter</h2><span class="pd-counter">${actions.length}</span></header>${actions.join('')||'<p class="empty">Tout est à jour.</p>'}</section><section class="pd-panel"><header><h2>Les prochaines missions</h2><button class="pd-text-button" onclick="go('trainer-missions')">Toutes mes missions ${mobileIcon('chevron',14)}</button></header>${missions.map(s=>proposalSessionRow(s,true)).join('')||'<p class="empty">Aucune mission programmée.</p>'}</section></div><aside class="pd-rail"><section class="pd-panel pd-week-panel"><header><h2>Cette semaine</h2></header>${proposalWeek(true)}</section>${proposalUpcoming(missions[0],true)}</aside></div>`;
}

const originalProposalRender=render;
render=function(){
  originalProposalRender();
  document.documentElement.dataset.proposal='atelier';
  document.querySelector('.logo-sub').textContent='Hub · Espace de travail';
  const label=document.querySelector('.sidebar>.nav-label');
  if(label)label.textContent=state.role==='formateur'?'MON ESPACE':'PILOTAGE';
  const pill=document.querySelector('.pill');
  if(pill)pill.textContent='Espace de démonstration';
  document.querySelectorAll('.nav button').forEach(button=>{
    const target=button.getAttribute('onclick')?.match(/go\('([^']+)'\)/)?.[1];
    if(['formations','clients','trainers'].includes(target)&&state.page.startsWith(target.replace(/s$/,'')))button.classList.add('active');
  });
};
try{
 if(!localStorage.getItem('certifia-hub-theme'))applyHubTheme('light');
}catch(e){applyHubTheme('light')}
render();
