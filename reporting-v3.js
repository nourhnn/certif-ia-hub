function reportPeriod(){
  const mode=state.reportMode||'month';
  const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(state.monthlyMonth)?state.monthlyMonth:parisToday().slice(0,7);
  const date=mode==='week'?(state.reportWeek||parisToday()):mode==='quarter'?(state.reportQuarter||month+'-01'):month+'-01';
  const point=new Date(date+'T12:00:00');
  const monthIndex=point.getMonth();
  const start=mode==='week'?toISO(weekStart(date)):
    toISO(new Date(point.getFullYear(),mode==='quarter'?monthIndex-monthIndex%3:monthIndex,1,12));
  const end=mode==='week'?shiftDate(start,6):
    toISO(new Date(point.getFullYear(),(mode==='quarter'?monthIndex-monthIndex%3+3:monthIndex+1),0,12));
  return {mode,start,end,key:start+'_'+end,label:'Du '+fmtDate(start)+' au '+fmtDate(end)};
}

function changeReportPeriod(mode){
  if(!['week','month','quarter'].includes(mode))return;
  const previous=reportPeriod();
  if(mode==='week')state.reportWeek ||= previous.start;
  if(mode==='quarter')state.reportQuarter ||= previous.start;
  state.reportMode=mode;
  render();
}

function setReportDate(value){
  const {mode}=reportPeriod();
  if(mode==='month'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value))state.monthlyMonth=value;
  if(mode==='week'&&/^\d{4}-\d{2}-\d{2}$/.test(value))state.reportWeek=value;
  render();
}

function stepReportPeriod(direction){
  const p=reportPeriod();
  if(p.mode==='week')state.reportWeek=shiftDate(p.start,direction*7);
  else{
    const date=new Date(p.start+'T12:00:00');
    date.setMonth(date.getMonth()+direction*(p.mode==='quarter'?3:1));
    if(p.mode==='quarter')state.reportQuarter=toISO(date);
    else state.monthlyMonth=toISO(date).slice(0,7);
  }
  render();
}

function selectReportQuarter(form){
  const year=Number(form.elements.year.value), quarter=Number(form.elements.quarter.value);
  if(year<1900||year>9998||!Number.isInteger(year)||![1,2,3,4].includes(quarter))return;
  state.reportQuarter=toISO(new Date(year,(quarter-1)*3,1,12));
  render();
}

function reportPeriodControls(p){
  const quarter=Math.ceil(Number(p.start.slice(5,7))/3);
  return `<section class="card report-period"><div class="report-modes" role="group" aria-label="Granularité">
    ${[['week','Semaine'],['month','Mois'],['quarter','Trimestre']].map(([key,label])=>`<button class="${p.mode===key?'primary':'secondary'} tiny"
      aria-pressed="${p.mode===key}" onclick="changeReportPeriod('${key}')">${label}</button>`).join('')}</div>
    <div class="report-period-nav"><button class="secondary tiny" aria-label="Période précédente" onclick="stepReportPeriod(-1)">${mobileIcon('back',16)}</button>
      <strong>${esc(p.label)}</strong><button class="secondary tiny" aria-label="Période suivante" onclick="stepReportPeriod(1)">${mobileIcon('chevron',16)}</button></div>
    ${p.mode==='quarter'?`<form class="report-fields" onsubmit="event.preventDefault();selectReportQuarter(this)">
      <label>Année<input class="field" name="year" type="number" min="1900" max="9998" required value="${p.start.slice(0,4)}"></label>
      <label>Trimestre<select class="field" name="quarter">${[1,2,3,4].map(q=>`<option ${q===quarter?'selected':''} value="${q}">T${q}</option>`).join('')}</select></label>
      <button class="secondary tiny">Afficher</button></form>`:
      `<label class="report-date">${p.mode==='week'?'Jour de la semaine':'Mois sélectionné'}<input class="field"
        type="${p.mode==='week'?'date':'month'}" value="${p.mode==='week'?p.start:p.start.slice(0,7)}" onchange="setReportDate(this.value)"></label>`}
  </section>`;
}

function validReportScore(value,max){
  return Number.isFinite(value)&&value>=0&&value<=max;
}

function reportRatings(assignments){
  const notes=[...new Set(assignments.map(a=>a.id))].map(id=>missionRatings[id]).filter(Boolean);
  const values=(select,max)=>notes.map(select).filter(value=>validReportScore(value,max));
  const nps=values(r=>r.nps,10), formation=values(r=>r.formation5??r.formationNote5,5);
  const satisfaction=values(r=>r.satisfaction5??r.trainerSatisfaction5,5);
  const mean=items=>items.length?items.reduce((sum,n)=>sum+n,0)/items.length:null;
  return {nps:mean(nps),npsCount:nps.length,formationNote5:mean(formation),
    satisfaction5:mean(satisfaction),promoters:nps.filter(n=>n>=9).length,detractors:nps.filter(n=>n<=6).length};
}

const upsellChoices={'yes':'Oui','no':'Non','review':'À confirmer'};
const upsellStatuses=['À qualifier','Transmise aux Sales','En cours','Clôturée'];
const upsellFields=[['need','Description du besoin'],['topic','Sujet de formation complémentaire'],
  ['context','Contexte de l’échange'],['interest','Niveau d’intérêt observé'],['comment','Commentaire du formateur']];

function isUpsell(value){return ['yes','review'].includes(value?.choice);}

function feedbackUpsellForm(value){
  return `<fieldset class="report-upsell-form"><legend>Avez-vous identifié des besoins complémentaires ou des opportunités d’upsell chez ce client pendant la formation ?</legend>
    <select class="field" name="upsellChoice" aria-label="Opportunité d’upsell" onchange="toggleFeedbackUpsell(this)">
      <option value="">Choisir une réponse</option>${Object.entries(upsellChoices).map(([key,label])=>`<option value="${key}" ${value?.choice===key?'selected':''}>${label}</option>`).join('')}
    </select>
    <div class="form-grid" data-upsell-details ${isUpsell(value)?'':'hidden'}>
      ${upsellFields.map(([key,label])=>`<label>${label}<textarea class="field" name="upsell-${key}" rows="2" maxlength="1000">${esc(value?.[key])}</textarea></label>`).join('')}
    </div></fieldset>`;
}

function toggleFeedbackUpsell(select){
  select.form.querySelector('[data-upsell-details]').hidden=!isUpsell({choice:select.value});
}

function readFeedbackUpsell(form){
  const data=new FormData(form), choice=data.get('upsellChoice');
  if(!Object.hasOwn(upsellChoices,choice))return null;
  return isUpsell({choice})?{choice,...Object.fromEntries(upsellFields.map(([key])=>
    [key,String(data.get('upsell-'+key)||'').trim().slice(0,1000)]))}:{choice};
}

function feedbackUpsellText(value){
  if(!value)return '';
  return ['Besoins complémentaires · '+upsellChoices[value.choice],
    ...upsellFields.filter(([key])=>value[key]).map(([key,label])=>label+' — '+value[key])].join('\n');
}

function reportOpportunities(sessions){
  const byId=new Map(sessions.map(s=>[s.id,s]));
  const found=new Map();
  for(const item of db.trainerFeedback||[]){
    const session=byId.get(item.sessionId);
    if(!session||!item.sentAt||!isUpsell(item.upsell))continue;
    const key=[item.sessionId,item.day,item.trainerId].join(':');
    if(found.has(key))continue;
    const formation=formOf(session);
    found.set(key,{key,item,session,formation,clientId:formation?.clientId,
      client:clientById(formation?.clientId)?.name||'Client non renseigné',trainer:trainerById(item.trainerId)?.name||'Formateur non renseigné',
      date:shiftDate(session.date,Math.max(0,item.day-1)),status:upsellStatuses.includes(item.upsellStatus)?item.upsellStatus:upsellStatuses[0]});
  }
  return [...found.values()].sort((a,b)=>b.date.localeCompare(a.date));
}

function updateReportOpportunity(key,status){
  if(state.role!=='amo'||state.page!=='reporting'||!upsellStatuses.includes(status))return;
  const record=monthlyReport().opportunities.find(x=>x.key===key);
  if(!record)return;
  record.item.upsellStatus=status;
  save();render();
}

function reportClientRows(report){
  const groups=new Map();
  for(const session of report.sessions){
    const clientId=formOf(session)?.clientId;
    const key=clientById(clientId)?clientId:null;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(session);
  }
  for(const opportunity of report.opportunities){
    const id=clientById(opportunity.clientId)?opportunity.clientId:null;
    if(!groups.has(id))groups.set(id,[]);
  }
  return [...groups].map(([id,sessions])=>{
    const ids=new Set(sessions.map(s=>s.id));
    return {name:clientById(id)?.name||'Client non renseigné',...reportRatings(report.assignments.filter(a=>ids.has(a.sessionId))),
      sessions:sessions.length,formations:new Set(sessions.map(s=>s.formationId).filter(Boolean)).size,
      upsell:report.opportunities.filter(o=>(clientById(o.clientId)?o.clientId:null)===id).length};
  }).sort((a,b)=>a.name.localeCompare(b.name,'fr'));
}

function reportScoreText(value){return value===null?'Non renseigné':reportNumber(value);}

function reportHeadlineStats(r){
  return [['Clients distincts',r.clients],['Formations',r.formations],['Sessions',r.sessions.length],
    ['Formateurs mobilisés',r.trainersByMission.length],['NPS moyen /10',reportScoreText(r.nps)],
    ['Formation /5',reportScoreText(r.formationNote5)],['Satisfaction Formateur /5',reportScoreText(r.satisfaction5)],
    ['Promoteurs',r.promoters],['Détracteurs',r.detractors],['Réponses NPS exploitables',r.npsCount],
    ['Opportunités d’upsell',r.opportunities.length]];
}

const reportClientColumns=['Client','Sessions','Formations','NPS /10','Formation /5','Satisfaction Formateur /5',
  'Promoteurs','Détracteurs','Réponses NPS exploitables','Opportunités d’upsell'];

function reportClientValues(c){
  return [c.name,c.sessions,c.formations,reportScoreText(c.nps),reportScoreText(c.formationNote5),
    reportScoreText(c.satisfaction5),c.promoters,c.detractors,c.npsCount,c.upsell];
}

function reportingPageV3(){
  const r=monthlyReport();
  return `${intro('Reporting <em>AMO.</em>','Activité, satisfaction et opportunités commerciales.')}
    ${reportPeriodControls(r.period)}
    <div class="toolbar report-exports"><div class="group">
      <button class="primary tiny" onclick="exportMonthlyChart()">Rapport animé</button>
      <button class="secondary tiny" onclick="exportMonthlyTable()">Tableau détaillé</button>
      <button class="secondary tiny" onclick="exportMonthly()">Exporter le CSV</button>
      <button class="secondary tiny" onclick="dashboardGo('documents','completed')">Historique des livrables</button>
    </div></div>
    <div class="cards report-stats">${reportHeadlineStats(r).map(([label,value])=>metric(label,value,'Sur la période')).join('')}</div>
    <p class="item-sub report-note">NPS moyen sur 10. Sur les réponses individuelles, promoteurs de 9 à 10 et détracteurs de 0 à 6.</p>
    <section class="card report-clients">${cardTitle('Résultats par client')}
      <div class="table-wrap" tabindex="0" role="region" aria-label="Résultats par client"><table class="tbl"><thead><tr>
        ${reportClientColumns.map(label=>`<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>
        ${r.clientNotes.map(c=>`<tr>${reportClientValues(c).map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('')||
          '<tr><td colspan="10">Aucune session sur cette période.</td></tr>'}</tbody></table></div></section>
    <section class="card report-opportunities">${cardTitle('Opportunités d’upsell','Suivi local dans ce navigateur.')}
      ${r.opportunities.map(o=>`<article class="report-opportunity"><div><strong>${esc(o.client)} · ${esc(o.formation?.title||'Formation non renseignée')}</strong>
        <p class="item-sub">${esc(o.trainer)} · ${fmtDate(o.date)} · ${upsellChoices[o.item.upsell.choice]}</p>
        <p>${esc(o.item.upsell.need||'Besoin non renseigné')}</p>${o.item.upsell.comment?`<p class="item-sub">${esc(o.item.upsell.comment)}</p>`:''}</div>
        <label>Statut<select class="field" onchange="updateReportOpportunity('${o.key}',this.value)">${upsellStatuses.map(status=>
          `<option ${status===o.status?'selected':''}>${status}</option>`).join('')}</select></label>
        <button class="secondary tiny" onclick="openModal('trainer-feedback','${o.key}')">Lire le retour</button></article>`).join('')||
        '<p class="empty">Aucune opportunité sur cette période.</p>'}</section>
    <details class="card report-operations"><summary>Préparation et suivi interne</summary>
    <div class="cards">${metric('Affectations',r.assignments.length,'Confirmées / réalisées')}
      ${metric('Livrables déposés',r.deposited+'/'+r.docs.length,'Sur la période')}
      ${metric('Ponctualité documentaire',r.punctual.length?reportNumber(r.onTime/r.punctual.length*100)+' %':'Non renseigné','Premiers dépôts datés')}</div>
    ${monthlyBonusPanel(r)}${preparationPanel(r.preparation)}
    <section class="card">${cardTitle('Activité des formateurs')}
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Formateur</th><th>Affectations</th><th>Terminées</th><th>NPS /10</th></tr></thead>
      <tbody>${r.trainersByMission.map(t=>`<tr><td>${esc(t.name)}</td><td>${t.count}</td><td>${t.done}</td><td>${reportScoreText(t.nps)}</td></tr>`).join('')||
        '<tr><td colspan="4">Aucune affectation sur cette période.</td></tr>'}</tbody></table></div></section>
    <p class="item-sub">${r.cards.filter(c=>c.level==='jaune').length} carton(s) jaune(s) actif(s) · ${r.cards.filter(c=>c.level==='rouge').length} carton(s) rouge(s) actif(s) attribués sur la période.</p></details>`;
}
