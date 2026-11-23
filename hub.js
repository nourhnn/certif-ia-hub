'use strict';
// Certif-IA Hub — maquette interactive HTML, reprise fidèle du prototype fourni.
// Les données et toutes les actions restent fictives : aucune API, aucun envoi réel.
const DEMO_KEY='certifia-hub-html-v1-demo'; // conserve les données locales V1
const trainers=[
{id:1,name:'Laurent Morel',initials:'LM',city:'Paris',skills:['Claude','IA générative','Management'],rating:'Numéro 10',rate:850,missions:18,available:'yes',color:'#e8defd',accent:'#6233a9',email:'laurent@example.com',history:['Groupe Atlas','Studio Nova','Maison Oria'],verified:['Claude','IA générative']},
{id:2,name:'Sophie Bernard',initials:'SB',city:'Lyon',skills:['IA générative','ChatGPT','Automatisation'],rating:'Back-up',rate:750,missions:12,available:'unknown',color:'#ffebe2',accent:'#ad5831',email:'sophie@example.com',history:['Atelier Cobalt','Groupe Atlas'],verified:['ChatGPT']},
{id:3,name:'Karim Benali',initials:'KB',city:'Bordeaux',skills:['Claude','Prompt engineering','Marketing'],rating:'Étoile montante',rate:680,missions:6,available:'no',color:'#e0f2ec',accent:'#167e69',email:'karim@example.com',history:['Maison Oria'],verified:['Claude']},
{id:4,name:'Camille Dupont',initials:'CD',city:'Paris',skills:['Design','ChatGPT','Marketing'],rating:'Numéro 10',rate:900,missions:21,available:'yes',color:'#e8edf9',accent:'#4268ac',email:'camille@example.com',history:['Studio Nova','Atelier Cobalt'],verified:['Design']},
{id:5,name:'Nadia Petit',initials:'NP',city:'Marseille',skills:['IA générative','Claude','RH'],rating:'À tester',rate:720,missions:2,available:'unknown',color:'#ffe9ef',accent:'#b24c76',email:'nadia@example.com',history:['Groupe Atlas'],verified:[]},
{id:6,name:'Hugo Martin',initials:'HM',city:'Lille',skills:['Automatisation','ChatGPT','Data'],rating:'Back-up',rate:790,missions:10,available:'no',color:'#f0eee0',accent:'#8a7b30',email:'hugo@example.com',history:['Atelier Cobalt'],verified:['Automatisation']}
];
const clients=[{id:'C1',name:'Groupe Atlas'},{id:'C2',name:'Studio Nova'},{id:'C3',name:'Atelier Cobalt'},{id:'C4',name:'Maison Oria'},{id:'C5',name:'SEQUOIA EXPERTISE'}];
const formations=[
{id:'F1',clientId:'C1',title:'IA générative — équipes métier',status:'En préparation',owner:'AMO',program:'IA générative et méthodes métier',sessionIds:[101,105]},
{id:'F2',clientId:'C2',title:'Claude pour la création',status:'Planifiée',owner:'AMO',sessionIds:[102]},
{id:'F3',clientId:'C3',title:'Automatiser ses processus',status:'En préparation',owner:'AMO',sessionIds:[103]},
{id:'F4',clientId:'C4',title:'ChatGPT pour les managers',status:'À qualifier',owner:'AMO',sessionIds:[104]}
];
const seedSessions=[
{id:101,formationId:'F1',date:'2026-11-12',feedbackDays:2,start:'09:00',end:'17:00',city:'Paris',people:14,required:1,status:'Planifiée',topic:'IA générative',modality:'Présentiel'},
{id:102,formationId:'F2',date:'2026-11-16',start:'09:30',end:'17:30',city:'Lyon',people:10,required:2,status:'Planifiée',topic:'Claude',modality:'Présentiel'},
{id:103,formationId:'F3',date:'2026-11-19',start:'09:00',end:'17:00',city:'Bordeaux',people:18,required:1,status:'Planifiée',topic:'Automatisation',modality:'Présentiel'},
{id:104,formationId:'F4',date:'2026-11-24',start:'10:00',end:'17:00',city:'Paris',people:12,required:1,status:'Brouillon',topic:'ChatGPT',modality:'Présentiel'},
{id:105,formationId:'F1',date:'2026-10-22',start:'09:00',end:'17:00',city:'Paris',people:16,required:1,status:'Réalisée',topic:'IA générative',modality:'Présentiel'}
];
const initialData={
sessions:seedSessions,
proposals:[{id:'P1',sessionId:102,trainerId:1,status:'Envoyée',approved:true,sent:true,conditions:'850 € / jour · Présentiel',created:'2026-11-09',expires:'2026-11-15'}],
assignments:[{id:'A1',sessionId:101,trainerId:1,status:'Confirmée'},{id:'A2',sessionId:103,trainerId:2,status:'Confirmée'},{id:'A3',sessionId:105,trainerId:1,status:'Réalisée'}],
deliverables:[
{id:'D1',formationId:'F1',sessionId:101,title:'Audit client',type:'AUDIT',owner:'interne',status:'Validé',versions:[{number:1,filename:'Audit-Groupe-Atlas.pdf',status:'Validé'}]},
{id:'D2',formationId:'F1',sessionId:101,title:'Programme de formation',type:'PROGRAMME',owner:'formateur',trainerId:1,status:'À fournir',versions:[]},
{id:'D3',formationId:'F1',sessionId:101,title:'Support pédagogique',type:'SUPPORT',owner:'formateur',trainerId:1,status:'Refusé',versions:[{number:1,filename:'Support-v1.pdf',status:'Refusé'}]},
{id:'D4',formationId:'F1',sessionId:101,title:'Bilan de formation',type:'BILANS',owner:'interne',status:'À fournir',versions:[]},
{id:'D5',formationId:'F3',sessionId:103,title:'Programme de formation',type:'PROGRAMME',owner:'formateur',trainerId:2,status:'En vérification',versions:[{number:1,filename:'Programme-Cobalt.pdf',status:'En vérification'}]},
{id:'D6',formationId:'F2',sessionId:102,title:'Programme de formation',type:'PROGRAMME',owner:'formateur',trainerId:1,status:'À fournir',versions:[]}
],availability:[{id:'AV1',trainerId:1,date:'2026-11-13',status:'Occupé',source:'déclaration'},{id:'AV2',trainerId:1,date:'2026-11-17',status:'Disponible',source:'déclaration'},{id:'AV3',trainerId:3,date:'2026-11-16',status:'Occupé',source:'déclaration'}],
activity:[],sync:[{name:'HubSpot',status:'Non connecté'},{name:'Google Agenda',status:'Non connecté'},{name:'Google Drive',status:'Non connecté'},{name:'Typeform',status:'Non connecté'}]
};

// V1.7 — Informations enrichies fictives. Les données privées Notion/HubSpot ne sont pas publiées.
const trainerDetails={
1:{linkedin:'',domain:'IA générative, accompagnement des équipes',experience:['Animation d’ateliers IA (exemple fictif)','Conduite du changement (exemple fictif)'],knowledge:['Claude','Prompt engineering','Transformation métiers'],strengths:['Pédagogie et clarté (démo)'],improvements:['Préparer plus de cas métiers spécifiques (démo)'],nps:9.2,activity:'Actif',llm:['Claude','GPT'],redCard:false},
2:{linkedin:'',domain:'Automatisation et outils collaboratifs',experience:['Formation aux outils numériques (démo)'],knowledge:['ChatGPT','Automatisation','Copilot'],strengths:['Approche concrète (démo)'],improvements:['Approfondir les cas avancés (démo)'],nps:8.9,activity:'Actif',llm:['GPT'],redCard:false},
3:{linkedin:'',domain:'Marketing et prompt engineering',experience:['Conseil marketing digital (démo)'],knowledge:['Claude','Marketing'],strengths:['Exemples créatifs (démo)'],improvements:['Approfondir les cas techniques (démo)'],nps:null,activity:'Actif',llm:['Claude'],redCard:false},
4:{linkedin:'',domain:'Design et création',experience:['Ateliers design (démo)'],knowledge:['GPT','Design'],strengths:['Adaptation créative (démo)'],improvements:['Formaliser les supports (démo)'],nps:9.5,activity:'Actif',llm:['GPT'],redCard:false},
5:{linkedin:'',domain:'Ressources humaines',experience:['Accompagnement RH (démo)'],knowledge:['Claude','RH'],strengths:['Écoute (démo)'],improvements:['Expérience à confirmer (démo)'],nps:null,activity:'En pause',llm:['Claude'],redCard:false},
6:{linkedin:'',domain:'Data et automatisation',experience:['Formation data (démo)'],knowledge:['Automatisation','GPT'],strengths:['Rigueur (démo)'],improvements:['Disponibilité à confirmer (démo)'],nps:8.7,activity:'Actif',llm:['GPT'],redCard:false}
};
const clientDetails={
C1:{industry:'Services professionnels',employees:85,city:'Paris',address:'',website:'',contact:'Contact client non renseigné',hubspot:'Référence HubSpot à connecter',notesTrainer:'Accueil au siège, informations logistiques à confirmer'},
C2:{industry:'Création et communication',employees:36,city:'Lyon',address:'',website:'',contact:'Contact client non renseigné',hubspot:'Référence HubSpot à connecter',notesTrainer:'Matériel de projection à confirmer'},
C3:{industry:'Industrie et conseil',employees:120,city:'Bordeaux',address:'',website:'',contact:'Contact client non renseigné',hubspot:'Référence HubSpot à connecter',notesTrainer:'Présentiel, vérifier les prérequis'},
C4:{industry:'Conseil et management',employees:60,city:'Paris',address:'',website:'',contact:'Contact client non renseigné',hubspot:'Référence HubSpot à connecter',notesTrainer:'Préparation orientée managers'},
C5:{
  domain:'sequoia-expertise.fr',website:'https://sequoia-expertise.fr',industry:'Comptabilité',
  owner:'Hugo VALDES',employees:10,annualRevenue:1000000,timeZone:'Europe/Paris',
  description:'Sequoia Expertise is an accounting and auditing firm located in Saint Maur des Fossés, France. They offer a variety of services including accounting, auditing, tax optimization, social management, legal services, and more.',
  linkedin:'https://www.linkedin.com/company/sequoia-expertise',hubspot:'Exemple fourni'
}
};
const missionRatings={'A3':{score:9.1,period:'2026-10',nps:9.1,certif:9.3,participants:9.0,public:true,source:'Évaluation fictive'},'A2':{score:null,period:'2026-11',nps:null,source:'À évaluer'},'A1':{score:null,period:'2026-11',nps:null,source:'À évaluer'}};
const proposedMatchingWeights={expertise:40,availability:30,localisation:20,experience:10};
const proposedReliabilityWeights={delivery:30,nps:40,feedback:10,incidents:20}; // V1.9, démonstration non approuvée métier
function initV17(){installDemoTestData();if(!db.staffingDemoSlots){db.staffingDemoSlots=true;const sample=[[1,102],[6,102],[4,104]];for(const [trainerId,sessionId] of sample){const session=sessionById(sessionId);if(session&&!db.availability.some(a=>a.trainerId===trainerId&&a.date===session.date))db.availability.push({id:'AV-demo-'+trainerId+'-'+sessionId,trainerId,date:session.date,start:session.start,end:session.end,status:'Disponible',source:'déclaration démo'})}}if(!db.reminders)db.reminders=[];if(!db.feedback)db.feedback=[];if(!db.notifLog)db.notifLog=[];if(!db.internalReviews)db.internalReviews=[];for(const d of db.deliverables){if(d.status==='Correction demandée')d.status='Refusé';for(const v of d.versions||[])if(v.status==='Correction demandée')v.status='Refusé';if(!d.dueDate){let se=sessionById(d.sessionId);d.dueDate=se?shiftDate(se.date,d.type==='PROGRAMME'?-7:d.type==='SUPPORT'?-3:7):'2026-11-20'}}}
function clientById(id){return clients.find(c=>c.id===id)}
function assignedTrainersOfClient(id){let sessionsForClient=db.sessions.filter(x=>formOf(x)?.clientId===id).map(x=>x.id);let ids=[...new Set(db.assignments.filter(x=>sessionsForClient.includes(x.sessionId)&&['Confirmée','Réalisée'].includes(x.status)).map(x=>x.trainerId))];return ids.map(trainerById).filter(Boolean)}
function trainerProfileField(id){return trainerDetails[id]||{domain:'Non renseigné',experience:[],knowledge:[],strengths:[],improvements:[],llm:[],activity:'Inconnu',nps:null}}
function pctFor(list,mode='submitted'){return list.length?Math.round(100*list.filter(d=>mode==='validated'?d.status==='Validé':d.versions?.length>0&&d.status!=='Refusé').length/list.length):0}
function progress(value,label='Progression'){return `<div class="progress-track" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><div style="width:${value}%"></div></div>`}
function mapsUrl(address,city){return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent([address,city].filter(Boolean).join(', '))}
function linkSafe(url,label){return url&&/^https:\/\//i.test(url)?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="text-link">${esc(label)} ↗</a>`:`<span class="item-sub">${esc(label)} : non renseigné</span>`}
function compatDetails(t,s){let matches=t.skills.some(x=>x.toLowerCase()===s.topic.toLowerCase())?40:t.skills.some(x=>x.toLowerCase().includes(s.topic.toLowerCase())||s.topic.toLowerCase().includes(x.toLowerCase()))?30:10;
const eligible=staffingAvailable(t,s);
let a=eligible?30:0;
let l=t.city===s.city?20:8;
let ex=t.missions>=10?10:t.missions>=5?7:4;
return {total:matches+a+l+ex,eligible,parts:[['Expertise et formation',matches,40],['Disponibilité connue',a,30],['Zone géographique',l,20],['Expérience',ex,10]],reasons:[matches===40?'Expertise exacte':matches===30?'Expertise apparentée':'Expertise à vérifier',a===30?'Disponible déclaré':a===0?'Indisponibilité signalée':'Disponibilité non vérifiée',l===20?'Même ville':'Mobilité à confirmer',`${t.missions} missions indiquées (démo)`]};}
const trainerBonusValue=5;
function reliabilityScore(t){
 const delivered=db.deliverables.filter(d=>d.trainerId===t.id);
 const punctuality=delivered.length?Math.round(100*delivered.filter(d=>d.versions?.length&&d.versions.some(v=>v.at&&d.dueDate&&v.at.slice(0,10)<=d.dueDate)).length/delivered.length):null;
 const satisfaction=trainerProfileField(t.id).nps==null?null:Math.min(100,Math.round(trainerProfileField(t.id).nps*10));
 const returns=db.feedback.filter(f=>f.trainerId===t.id && f.public === true && Number.isFinite(f.score));
 const feedback=returns.length?Math.round(returns.reduce((n,f)=>n+f.score,0)/returns.length*10):null;
 const incidents=db.internalReviews.filter(r=>r.trainerId===t.id&&isActiveCarton(r)&&r.verified===true);
 const incidentQuality=incidents.length?Math.max(0,100-incidents.reduce((v,r)=>v+(r.level==='rouge'?45:15),0)):null;
 const parts=[['Ponctualité documentaire',punctuality,30],['Satisfaction contextualisée',satisfaction,40],['Retours des missions',feedback,10],['Incidents vérifiés',incidentQuality,20]];
 const complete=parts.every(x=>x[1]!==null);
 const base=complete?Math.round(parts.reduce((n,x)=>n+x[1]*x[2],0)/100):({1:92,2:74,3:58,4:89,5:62,6:81})[t.id]??null;
 const bonuses=db.internalReviews.filter(r=>r.trainerId===t.id&&r.kind==='bonus').length;
 const total=base===null?null:Math.min(100,base+bonuses*trainerBonusValue);
 return {total,parts,complete,base,bonuses,bonusPoints:total===null?0:total-base};
}

function reliabilityBadge(t){const {total:score}=reliabilityScore(t);if(score===null)return '<span class="badge">Fiabilité · non évaluée</span>';let color=score>=85?'green':score>=60?'amber':'red';return `<span class="badge ${color}" title="Score fictif illustratif — calcul métier non validé">Fiabilité ${score}% · démo</span>`;}
function gainsEstimate(t){return t.rate*t.missions;}
function money(n){return Number(n||0).toLocaleString('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});}
function safeContact(value,type){if(!value)return '<span class="item-sub">Non renseigné</span>';let href=type==='phone'?'tel:'+String(value).replace(/[^+0-9]/g,''):'mailto:'+value;return `<a class="text-link" href="${esc(href)}">${esc(value)}</a>`;}
function responseRate(t){let p=db.proposals.filter(x=>x.trainerId===t.id&&(x.sent||['Envoyée','Acceptée','Refusée','Expirée'].includes(x.status)));let a=p.filter(x=>['Acceptée','Refusée'].includes(x.status));return p.length?`${Math.round(100*a.length/p.length)} % (${a.length}/${p.length} propositions démo)`:'Aucune sollicitation mesurable';}
function isActiveCarton(record){
 return record.kind==='carton'&&!record.withdrawal&&!record.mergedInto;
}

function submitInternalReview(id){
 if(state.role!=='amo')return flash('Action interne uniquement');
 const kind=$('review-kind')?.value,level=$('review-level')?.value,memo=$('review-reason')?.value.trim();
 if(!['observation','carton','bonus'].includes(kind))return flash('Choisissez une nature.');
 if(kind==='carton'&&!['jaune','rouge'].includes(level))return flash('Sélectionnez un type de carton.');
 if(!memo||memo.length<10)return flash('Un justificatif de 10 caractères minimum est obligatoire');
 const record={id:'IR'+crypto.randomUUID(),trainerId:id,kind,level:kind==='carton'?level:null,reason:memo,
   verified:false,public:false,createdAt:new Date().toISOString(),author:'AMO (démonstration)'};
 const previousYellow=level==='jaune'&&kind==='carton'&&db.internalReviews.findLast(r=>
   r.trainerId===id&&isActiveCarton(r)&&r.level==='jaune');
 if(previousYellow){
   previousYellow.mergedInto=record.id;
   record.level='rouge';
   record.escalatedFrom=previousYellow.id;
 }
 db.internalReviews.push(record);
 if(kind==='carton')state.freshCard=id;
 if(kind==='bonus')state.freshBonus=record.id;
 log(previousYellow?'Deux cartons jaunes convertis en carton rouge':kind==='bonus'?'Bonus enregistré':kind==='carton'?'Carton enregistré':'Observation interne simulée',record.id);
 render();
 flash(previousYellow?'Deux cartons jaunes ont été convertis en un carton rouge.':kind==='bonus'?'Bonus enregistré dans la fiche interne.':kind==='carton'?'Carton enregistré.':'Observation enregistrée en démo');
}

function withdrawTrainerCarton(form){
 if(state.role!=='amo'||state.page!=='trainer-detail'||state.trainerDetailTab!=='internal')return;
 const record=db.internalReviews.find(r=>r.id===form.dataset.cartonId&&r.trainerId===state.selectedTrainer&&isActiveCarton(r));
 if(!record)return;
 const reason=new FormData(form).get('reason')?.trim();
 if(!reason||reason.length<10){
   form.querySelector('[role="alert"]').textContent='Saisissez un motif de retrait d’au moins 10 caractères.';
   form.elements.namedItem('reason').focus();
   return;
 }
 record.withdrawal={reason,at:new Date().toISOString(),author:'AMO (démonstration)'};
 log('Carton retiré',record.id);
 render();
 $('review-reason-'+record.id)?.focus();
 flash('Carton retiré. Le motif est conservé dans l’historique.');
}
function internalReviewsCard(t){
 const items=db.internalReviews.filter(r=>r.trainerId===t.id).reverse();
 return `<div class="card internal-reviews">
   <h3 class="section-title">Gestion interne · accès AMO uniquement</h3>
   <p class="section-caption">Observations, bonus, cartons motivés et taux de réponse. Aucune de ces notes n'est communiquée au portail Formateur.</p>
   <div class="info review-response"><small>Taux de réponse (propositions démo)</small><strong>${esc(responseRate(t))}</strong></div>
   <form class="internal-review-form" onsubmit="event.preventDefault();submitInternalReview(${t.id})">
     <div class="form-grid">
       <label>Nature
         <select class="field" id="review-kind" onchange="$('review-level-field').hidden=this.value!=='carton'">
           <option value="observation">Observation AMO</option><option value="carton">Carton avec justificatif</option><option value="bonus">Bonus</option>
         </select>
       </label>
       <label id="review-level-field" hidden>Type de carton
         <select class="field" id="review-level"><option value="jaune">Jaune</option><option value="rouge">Rouge</option></select>
       </label>
     </div>
     <div class="review-reason-field">
       <label class="form-label" for="review-reason">Justificatif / contexte</label>
       <textarea class="field" id="review-reason" rows="4" aria-describedby="review-reason-hint" placeholder="Décrivez les faits et le contexte de la mission."></textarea>
       <small id="review-reason-hint">10 caractères minimum</small>
     </div>
     <div class="review-form-actions"><button class="primary" type="submit">Enregistrer</button></div>
   </form>
   <div class="stack review-history">${items.map(internalReviewEntry).join('')||'<p class="item-sub">Aucune observation enregistrée dans cette démo.</p>'}</div>
   <p class="footnote">La validation métier, les recours et l’accès serveur sécurisé restent à définir. Les faits non vérifiés ne modifient pas la fiabilité.</p>
 </div>`;
}

function internalReviewEntry(record){
 const bonus=record.kind==='bonus';
 const carton=record.kind==='carton';
 const level=carton&&['jaune','rouge'].includes(record.level)?record.level:'';
 const active=isActiveCarton(record);
 const style=bonus?'bonus-review':active&&level?'carton-review '+level:'';
 const title=bonus?'Bonus':carton?'Carton '+esc(record.level):'Observation';
 const icon=bonus?mobileIcon('bonus',16):level?`<span class="trainer-warning ${level}" aria-hidden="true"></span>`:'';
 const previous=db.internalReviews.find(r=>r.id===record.escalatedFrom&&r.trainerId===record.trainerId);
 const status=record.withdrawal?'Retiré':record.mergedInto?'Converti en carton rouge':bonus?'Reconnaissance interne':record.verified?'Vérifié':'Non vérifié — aucune pénalité';
 return `<div class="info ${style} ${state.freshBonus===record.id?'bonus-reveal':''}">
   <strong>${icon} ${title} · ${esc(record.createdAt.slice(0,10))}</strong>
   <p class="review-reason" id="review-reason-${esc(record.id)}" tabindex="-1">${esc(record.reason)}</p>
   <small>${esc(record.author)} · ${status}</small>
   ${previous?`<details class="ops-incident"><summary>Conversion de deux cartons jaunes</summary><p>Justificatif du premier carton jaune</p><p class="review-reason">${esc(previous.reason)}</p></details>`:''}
   ${incidentFollowUp(record)}
   ${record.withdrawal?`<div class="carton-withdrawal"><strong>Motif du retrait</strong><p class="review-reason">${esc(record.withdrawal.reason)}</p><small>${fmtDate(record.withdrawal.at.slice(0,10))} · ${esc(record.withdrawal.author)}</small></div>`:''}
   ${active?`<details class="ops-incident carton-withdrawal"><summary>Retirer le carton</summary>
     <form onsubmit="event.preventDefault();withdrawTrainerCarton(this)" data-carton-id="${esc(record.id)}">
       <label class="form-label" for="withdraw-${esc(record.id)}">Motif du retrait</label>
       <textarea class="field" id="withdraw-${esc(record.id)}" name="reason" rows="3" required maxlength="1000" placeholder="10 caractères minimum"></textarea>
       <p role="alert"></p>
       <button class="secondary tiny" type="submit">Confirmer le retrait</button>
     </form></details>`:''}
 </div>`;
}

function repairDemoEncoding(value){
  if(typeof value==='string'){
    for(const [broken,correct] of [["ðŸ¼", "🏼"], ["ðŸ‘‹", "👋"], ["ðŸ”¥", "🔥"], ["â€“", "–"], ["â€”", "—"], ["â€™", "’"], ["â€¢", "•"], ["â€¦", "…"], ["â€¹", "‹"], ["â€º", "›"], ["â‚¬", "€"], ["â†", "←"], ["â†’", "→"], ["â†—", "↗"], ["â†º", "↺"], ["â‰ ", "≠"], ["â“˜", "ⓘ"], ["âš¡", "⚡"], ["âœ¦", "✦"], ["ï¸", "️"], ["ï¼‹", "＋"], ["Â«", "«"], ["Â·", "·"], ["Â»", "»"], ["Ã€", "À"], ["Ã‰", "É"], ["Ã—", "×"], ["Ã ", "à"], ["Ã§", "ç"], ["Ã¨", "è"], ["Ã©", "é"], ["Ãª", "ê"], ["Ã®", "î"], ["Ã´", "ô"]])value=value.split(broken).join(correct);
    return value;
  }
  if(Array.isArray(value))return value.map(repairDemoEncoding);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,repairDemoEncoding(item)]));
  return value;
}

const feedbackDemoSources={
  1:'Nous avions 10 participants sur les 12 inscrits. Les binômes ont amélioré leurs réponses grâce aux exemples métier. Deux personnes ont récupéré leur accès en changeant de navigateur. Un participant a travaillé en binôme, son accès reste à vérifier. Demain, je propose un exemple guidé pour les débutants. Le client demande un exercice sur les comptes rendus, son ajout reste à confirmer.',
  2:'Les 11 participants ont suivi la deuxième journée. Trois participants ont terminé le dernier exercice sans relance. Un poste de prêt a permis au participant bloqué de travailler seul. Son poste habituel reste à vérifier. Deux personnes demandent une fiche mémo. Le client a évoqué un atelier de suivi, sans engagement ni date confirmée.'
};

function installDemoTestData(){
  if(db.demoTestVersion===1)return;
  const today=parisToday();
  for(const [key,value] of Object.entries(initialData))if(Array.isArray(value)&&!Array.isArray(db[key]))db[key]=clone(value);
  for(const session of seedSessions)if(!sessionById(session.id))db.sessions.push(clone(session));
  const atlas=sessionById(101);
  atlas.feedbackDays=2;
  atlas.date=today;
  atlas.status='Planifiée';
  sessionById(105).date=shiftDate(today,-7);
  sessionById(105).status='Réalisée';
  sessionById(103).date=shiftDate(today,3);
  sessionById(104).date=shiftDate(today,7);
  sessionById(102).date=shiftDate(today,2);
  for(const assignment of initialData.assignments){
    if(!db.assignments.some(item=>item.sessionId===assignment.sessionId&&item.trainerId===assignment.trainerId)){
      db.assignments.push(clone(assignment));
    }
  }
  const assigned=db.assignments.find(item=>item.sessionId===101&&item.trainerId===1);
  assigned.status='Confirmée';
  db.trainerFeedback??=[];
  if(!feedbackRecord(103,1,2))db.trainerFeedback.push({sessionId:103,day:1,trainerId:2,source:feedbackDemoSources[1],summary:'',sentAt:null});
  if(!feedbackRecord(105,1,1))db.trainerFeedback.push({
    sessionId:105,day:1,trainerId:1,source:feedbackDemoSources[1],
    summary:'### Déroulé et participation\n• 10 participants sur 12 inscrits.\n\n### Ce qui a bien fonctionné\n• Les binômes ont amélioré leurs réponses grâce aux exemples métier.\n\n### Difficultés et points de vigilance\n• Un accès reste à vérifier.\n\n### Ajustements proposés pour J2\n• Exemple guidé proposé. Exercice sur les comptes rendus à confirmer.',
    sentAt:shiftDate(today,-7)+'T17:00:00.000Z'
  });
  for(const doc of db.deliverables){
    const session=sessionById(doc.sessionId);
    if(session)doc.dueDate=shiftDate(session.date,doc.type==='PROGRAMME'?-7:doc.type==='SUPPORT'?-3:7);
  }
  db.demoTestVersion=1;
  save();
}

function fillFeedbackDemo(){
  const context=trainerFeedbackContext(state.modal?.id);
  const form=$('feedback-source')?.form;
  if(!context||!form)return;
  if(form.elements.source.value.trim()&&!confirm('Remplacer le texte saisi par un exemple fictif ?'))return;
  form.elements.source.value=feedbackDemoSources[context.day];
  form.elements.summary.value='';
  form.querySelector('[data-feedback-result]').hidden=true;
  form.dataset.summarySource='';
  updateFeedbackCount(form);
}

function clone(x){return JSON.parse(JSON.stringify(x))}
function loadData(){try{let raw=JSON.parse(localStorage.getItem(DEMO_KEY));if(raw&&raw.version===1&&raw.data&&Array.isArray(raw.data.sessions))return repairDemoEncoding(raw.data);}catch(e){}return clone(initialData)}
let db=loadData();
// Les schémas des versions locales antérieures restent acceptés par la démo.

const state={contactAgenda:true,slotsExpanded:false,page:'home',role:'amo',trainerId:1,search:'',filter:'all',trainerView:'cards',staffTab:'todo',missionTab:'proposals',selectedSession:102,selectedFormation:'F1',selectedTrainer:1,candidate:null,modal:null,calendarView:'week',calendarDate:'2026-11-12',trainerCalendarView:'week',profileEdit:false,menuOpen:false,toast:'',trainerDetailTab:'overview',clientView:'cards',selectedClient:'C1',selectedDocGroup:null,selectedAgendaIds:trainers.map(t=>t.id),agendaShow:'both',dashboardFilter:'all',monthlyMonth:'2026-11',reportTab:'monthly',staffExplain:null,reminderFilter:'all',trainerDocsFilter:'all',docSort:'calendar',docCategoryFilter:'all'};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(DEMO_KEY,JSON.stringify({version:1,data:db}))}catch(e){}}
function log(action,detail){db.activity.unshift({at:new Date().toISOString(),action,detail});db.activity=db.activity.slice(0,40);save()}
function fmtDate(d,opts={day:'numeric',month:'short',year:'numeric'}){if(!d)return 'Date inconnue';return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',opts)}
function weekStart(date){let d=new Date(date+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d}
function toISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function shiftDate(date,days){let d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return toISO(d)}
function clientOf(f){return clients.find(c=>c.id===f.clientId)||{name:'Client inconnu'}}
function formOf(s){return formations.find(f=>f.id===s.formationId)}
function sessionById(id){return db.sessions.find(s=>s.id===Number(id))}
function trainerById(id){
  const trainer=trainers.find(t=>t.id===Number(id));
  const profile=db.profiles?.[id];
  if(!trainer||!profile)return trainer;
  return {...trainer,...profile,initials:profile.name.split(/\s+/).slice(0,2).map(part=>part[0].toUpperCase()).join('')};
}
function activeAssignments(id){return db.assignments.filter(a=>a.sessionId===Number(id)&&['Confirmée','Réalisée'].includes(a.status))}
function openCount(s){return Math.max(0,s.required-activeAssignments(s.id).length)}
function staffingLabel(s){let done=activeAssignments(s.id).length;if(s.status==='Réalisée')return 'Réalisée';if(done>=s.required)return 'Staffing complet';if(done>0)return 'Staffing partiel';if(db.proposals.some(p=>p.sessionId===s.id&&['Prête','Autorisée à l’envoi','Envoyée','Acceptée'].includes(p.status)))return 'Propositions en cours';return 'À staffer'}
function badge(label){let l=String(label??'Inconnu'),cls=/confirm|complet|validé|acceptée|réalisée|disponible|synchronisé/i.test(l)?'green':/attente|staff|prépar|vérification|à fournir|à qualifier|prête|envoyée|partiel|inconnu|non connecté/i.test(l)?'amber':/refus|occupé|expir|retir|erreur|échec|correction|annul|bloqu/i.test(l)?'red':'purple';return `<span class="badge ${cls}">${esc(l)}</span>`}
function intro(title,sub,ey='CERTIF-IA / ESPACE INTERNE'){return `<div class="eyebrow">${esc(ey)}</div><h1 class="headline">${title}</h1><div class="subtitle">${sub}</div>`}
function cardTitle(title,sub=''){return `<div class="card-head"><div><h3 class="section-title">${title}</h3>${sub?`<p class="section-caption">${sub}</p>`:''}</div></div>`}
function metric(name,val,sub,target='',filter='all'){return `<${target?'button':'div'} class="card metric ${target?'metric-action':''}" ${target?`onclick="dashboardGo('${target}','${filter}')" aria-label="Ouvrir ${esc(name)}"`:''}><small>${esc(name)}</small><strong>${esc(val)}</strong><span class="trend">${esc(sub||'Données fictives')}</span>${target?'<span class="metric-arrow" aria-hidden="true">›</span>':''}</${target?'button':'div'}>`}
function dashboardGo(page,filter){state.filter=filter;state.search='';state.page=page;if(page==='staffing')state.staffTab='todo';if(page==='trainer-missions')state.missionTab=['upcoming','finished'].includes(filter)?filter:'proposals';if(page==='trainer-docs')state.trainerDocsFilter='open';navigateHash();render()}
function trainerAvatar(t,size=54){return `<span class="trainer-photo" style="width:${size}px;height:${size}px;background:${t.color};color:${t.accent}">${photoContent(t)}</span>`}
function availabilityBadge(t){
  const label=t.available==='yes'?'Disponible déclaré':t.available==='no'?'Occupé déclaré':'Disponibilité inconnue';
  return state.role==='amo'&&t.available!=='unknown'?`<button type="button" class="availability-link" onclick="openTrainerPlanning(${t.id})" aria-label="${label} · Planning et staffing">${badge(label)}<span aria-hidden="true">›</span></button>`:badge(label);
}
function eventButton(text,action,cls='secondary',attrs=''){return `<button class="${cls}" ${attrs} onclick="${action}">${text}</button>`}
function filtersBar(placeholder,options,fn='onSearch'){return `<div class="toolbar"><div class="filters"><input class="field search" aria-label="Rechercher" placeholder="${esc(placeholder)}" value="${esc(state.search)}" oninput="${fn}(this.value)"><select class="field" aria-label="Filtrer" onchange="onFilter(this.value)">${options.map(([k,v])=>`<option value="${esc(k)}" ${state.filter===k?'selected':''}>${esc(v)}</option>`).join('')}</select></div><span class="badge purple">Données fictives</span></div>`}
function onSearch(v){state.search=v;let input=document.activeElement;let pos=input?.selectionStart;render();let out=document.querySelector('.field.search');if(out){out.focus();try{out.setSelectionRange(pos,pos)}catch(e){}}}
function onFilter(v){state.filter=v;render()}
function setRole(value){state.mobileMore=false;state.slotsExpanded=false;state.trainerHomeAgendaOpen=false;state.trainerPreviewDay=null;state.profileEdit=false;state.modal=null;if(value.startsWith('trainer-')){state.role='formateur';state.trainerId=Number(value.split('-')[1]);try{localStorage.setItem(DEMO_KEY+'-active-trainer',state.trainerId)}catch(e){}state.page='trainer-home'}else{state.role='amo';state.page='home'}state.menuOpen=false;state.search='';state.filter='all';navigateHash();render()}
function go(page){state.profileEdit=false;state.profilePhotoDraft=null;state.profilePhotoPending=false;state.page=page;state.mobileMore=false;state.menuOpen=false;state.modal=null;state.search='';state.filter='all';navigateHash();render();window.scrollTo(0,0)}
function navigateHash(){
  const detail={'session-detail':state.selectedSession,'formation-detail':state.selectedFormation,'trainer-folder':state.selectedDocGroup,'trainer-detail':state.selectedTrainer}[state.page];
  const path=(state.role==='formateur'?'formateur':'interne')+'/'+state.page+(detail?'/'+encodeURIComponent(detail):'');
  if(location.hash!=='#/'+path)history.pushState(null,'','#/'+path);
}
function openFormation(id){state.selectedFormation=id;go('formation-detail')}
function openSession(id){state.selectedSession=Number(id);go('session-detail')}
function openTrainer(id){state.trainerFromStaff=state.page==='staffing';state.selectedTrainer=Number(id);go('trainer-detail')}
function staffFor(id){state.selectedSession=Number(id);state.staffTab='todo';go('staffing')}
function openModal(kind,id){state.uploadFile=null;state.modal={kind,id};render()}
function closeModal(){state.uploadFile=null;state.modal=null;render()}
function flash(text){const r=$('toast-root');if(!r)return;r.innerHTML=`<div class="toast" role="status">${esc(text)}</div>`;setTimeout(()=>{if(r)r.innerHTML=''},3500)}
function changeTab(name,value){if(name==='profileEdit'){state.profilePhotoDraft=null;state.profilePhotoPending=false}state[name]=value;render()}
function changeCalendar(direction,person=false){
  const mode=state[person?'trainerCalendarView':'calendarView'];
  const date=new Date(state.calendarDate+'T12:00:00');
  state.calendarDate=mode==='month'
    ?toISO(new Date(date.getFullYear(),date.getMonth()+direction,1,12))
    :shiftDate(state.calendarDate,direction*(mode==='day'?1:7));
  render();
}
function setCalendar(mode,person=false){state[person?'trainerCalendarView':'calendarView']=mode;render()}
function restoreHash(){
  const route=location.hash.match(/^#\/(interne|formateur)\/([a-z-]+)(?:\/([A-Za-z0-9-]+))?$/);
  if(!route){state.role='amo';state.page='home';return}
  state.role=route[1]==='formateur'?'formateur':'amo';
  if(!validPages(state.role).includes(route[2]))return;
  state.page=route[2];
  state.modal=null;
  state.profileEdit=false;
  if(route[2]==='session-detail'&&sessionById(route[3]))state.selectedSession=Number(route[3]);
  if(route[2]==='formation-detail'&&route[3])state.selectedFormation=route[3];
  if(route[2]==='trainer-folder'&&route[3])state.selectedDocGroup=route[3];
  if(route[2]==='trainer-detail'&&trainerById(route[3]))state.selectedTrainer=Number(route[3]);
}
function validPages(role){return role==='formateur'?['trainer-home','trainer-missions','trainer-calendar','trainer-docs','trainer-profile','trainer-folder']:['home','planning','formations','formation-detail','session-detail','trainers','trainer-detail','clients','client-detail','staffing','documents','reporting']}
const mobileSymbols={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19"/>',moon:'<path d="M20.9 14.3A9 9 0 0 1 9.7 3.1 9 9 0 1 0 20.9 14.3Z"/>',display:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',settings:'<path d="M10 2h4l.6 2.5 1.6.9 2.5-.7 2 3.5-1.8 1.8v2l1.8 1.8-2 3.5-2.5-.7-1.6.9L14 20h-4l-.6-2.5-1.6-.9-2.5.7-2-3.5L5.1 12v-2L3.3 8.2l2-3.5 2.5.7 1.6-.9z" transform="translate(0 1)"/><circle cx="12" cy="12" r="3"/>',bonus:'<path d="M12 2l2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 8.2l6-.8z"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',trainers:'<circle cx="9" cy="7" r="3"/><path d="M2 20v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2M17 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/>',clients:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2m-6 6v-3h4v3"/>',reporting:'<path d="M3 3v18h18M8 16v-5m5 5V7m5 9v-8"/>',pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',staff:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h5M19.5 5.5v5"/>',docs:'<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M7 13h10M7 17h7"/>',more:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',missions:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',back:'<path d="m14 6-6 6 6 6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',chevron:'<path d="m9 18 6-6-6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>'};
function mobileIcon(name,size=21){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${mobileSymbols[name]||mobileSymbols.more}</svg>`}
function mobileIsDetail(page){return ['formation-detail','session-detail','trainer-detail','client-detail','trainer-folder','trainer-profile'].includes(page)}
function mobileBackTarget(page){return ({'formation-detail':'formations','session-detail':'formations','trainer-detail':state.trainerFromStaff?'staffing':'trainers','client-detail':'clients','trainer-folder':'trainer-docs','trainer-profile':'trainer-home'})[page]||'home'}
function mobileTabItems(trainer){return trainer?[['trainer-home','home','Accueil'],['trainer-missions','missions','Missions'],['trainer-calendar','calendar','Agenda'],['trainer-docs','docs','Livrables'],['trainer-profile','profile','Profil']]:[['home','home','Accueil'],['planning','calendar','Agenda'],['staffing','staff','Staffing'],['documents','docs','Livrables'],['more','more','Plus']]}
function mobileIsActive(key,trainer){if(key==='more')return ['formations','formation-detail','session-detail','trainers','trainer-detail','clients','client-detail','reporting'].includes(state.page)||!!state.mobileMore;return state.page===key||(key==='trainer-docs'&&state.page==='trainer-folder')}
function mobileDock(trainer){return `<nav class="mobile-dock" aria-label="Navigation principale sur téléphone">${mobileTabItems(trainer).map(([key,icon,label])=>`<button type="button" class="mobile-dock-item ${mobileIsActive(key,trainer)?'is-active':''}" ${mobileIsActive(key,trainer)?'aria-current="page"':''} aria-label="${label}" onclick="${key==='more'?'openMobileMore()':`go('${key}')`}"><span class="mobile-dock-icon">${mobileIcon(icon,22)}</span><span class="mobile-dock-label">${label}</span></button>`).join('')}</nav>`}

function mobileHead(trainer,title){const back=mobileIsDetail(state.page);return `<div class="mobile-app-head"><button class="mobile-brand-button" aria-label="${back?'Retour à la liste':'Aller à l’accueil'}" onclick="go('${back?mobileBackTarget(state.page):trainer?'trainer-home':'home'}')">${back?mobileIcon('back',22):`<img src="${hubAppearance[currentHubAppearance()].folder}favicon-48.png" width="33" height="33" alt=""/>`}</button><div class="mobile-head-center"><span class="mobile-head-eyebrow">${trainer?'PORTAIL FORMATEUR':'CERTIF-IA HUB · AMO'}</span><strong>${esc(title)}</strong></div><div class="mobile-header-actions">${trainer?`${hubSearchTrigger()}${notificationBell()}${settingsButton()}<button class="avatar profile-trigger" aria-label="Mon profil" onclick="go('trainer-profile')">${photoContent(trainerById(state.trainerId))}</button>`:`${hubSearchTrigger()}${notificationBell()}${settingsButton()}`}</div></div>`}
function openMobileMore(){state.mobileMore=true;render()}
function closeMobileMore(){state.mobileMore=false;render()}
function mobileMoreSheet(){if(!state.mobileMore||state.role==='formateur')return '';const choices=[['formations','missions','Formations','Dossiers et sessions'],['trainers','trainers','Formateurs','Annuaire & profils'],['clients','clients','Clients','Annuaire & historique'],['reporting','reporting','Monthly AMO','Rapport mensuel']];return `<div class="mobile-sheet-overlay" role="presentation" onclick="if(event.target===this)closeMobileMore()"><section class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="Tous les modules"><div class="mobile-sheet-grip" aria-hidden="true"></div><div class="mobile-sheet-heading"><h2>Explorer le Hub</h2><button type="button" aria-label="Fermer" class="mobile-sheet-close" onclick="closeMobileMore()">${mobileIcon('close',20)}</button></div><div class="mobile-more-list">${choices.map(([page,icon,title,desc])=>`<button type="button" onclick="go('${page}')"><span class="more-section-icon">${mobileIcon(icon,20)}</span><span class="grow"><strong>${title}</strong><small>${desc}</small></span>${mobileIcon('chevron',19)}</button>`).join('')}</div><div class="mobile-more-settings"><label for="mobile-role-switch">Changer de profil démo</label><select class="field" id="mobile-role-switch" onchange="setRole(this.value)"><option value="amo">AMO / Interne</option>${trainers.map(t=>`<option value="trainer-${t.id}">${esc(trainerOptionLabel(t))} · Formateur</option>`).join('')}</select><button type="button" onclick="resetDemo()">Réinitialiser les données fictives</button></div></section></div>`}
function decorateMobileTables(){document.querySelectorAll('.tbl').forEach(table=>{const th=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());table.querySelectorAll('tbody tr').forEach(row=>{[...row.children].forEach((td,i)=>{if(td.tagName==='TD')td.setAttribute('data-mobile-label',th[i]||'Détail')})})})}

function render(){syncOperationalNotices();const frame=$('document-file-frame');if(frame)URL.revokeObjectURL(frame.src);let trainer=state.role==='formateur';if(!validPages(state.role).includes(state.page))state.page=trainer?'trainer-home':'home';let nav=trainer?[
['trainer-home','home','Mon espace'],['trainer-missions','missions','Mes missions'],['trainer-calendar','calendar','Mon agenda'],['trainer-docs','docs','Mes livrables']]:[
['home','home','Vue d’ensemble'],['planning','calendar','Planning global'],['staffing','staff','Staffing assisté'],['documents','docs','Livrables & bilans'],['formations','missions','Formations'],['trainers','trainers','Formateurs'],['clients','clients','Clients'],['reporting','reporting','Monthly AMO']];
let pageTitle=nav.find(n=>n[0]===state.page)?.[2]||({'trainer-profile':'Mon profil','trainer-folder':'Dossier de livrables','session-detail':'Session','formation-detail':'Formation'}[state.page]||'Détails');let people=trainerById(state.trainerId);document.title='Certif-IA Hub — '+pageTitle;
$('app').innerHTML=`<div class="app"><aside class="sidebar ${state.menuOpen?'open':''}" id="sidebar"><div><img src="assets/certifia-logo.png" class="brand-logo" alt="Certif-IA"><div class="logo-sub">Hub · Espace de démonstration</div></div><div class="nav-label">${trainer?'ESPACE FORMATEUR':'EXPANSION CLIENT'}</div><nav class="nav" aria-label="Navigation principale">${nav.map(([p,ic,label])=>`<button class="${state.page===p?'active':''}" ${state.page===p?'aria-current="page"':''} onclick="go('${p}')"><span class="ic" aria-hidden="true">${mobileIcon(ic,18)}</span>${label}</button>`).join('')}</nav><div class="side-bottom"><div class="nav-label">SIMULER UN PROFIL</div><select class="role-select" aria-label="Profil de démonstration" onchange="setRole(this.value)"><option value="amo" ${!trainer?'selected':''}>AMO / Espace interne</option>${trainers.map(t=>`<option value="trainer-${t.id}" ${trainer&&t.id===state.trainerId?'selected':''}>Formateur · ${esc(t.name)}</option>`).join('')}</select><p class="side-note">Démo locale · données et actions fictives<br>Aucune connexion aux outils réels</p><button class="reset-demo" onclick="resetDemo()">↺ Réinitialiser la démo</button></div></aside>${state.menuOpen?'<button class="sidebar-scrim" aria-label="Fermer le menu" onclick="toggleMenu()"></button>':''}<div class="shell"><header class="topbar">${mobileHead(trainer,pageTitle)}<div class="top-start"><button class="mobile-menu" aria-label="Ouvrir le menu" onclick="toggleMenu()">${mobileIcon('menu',16)}</button>${breadcrumbs(pageTitle)}</div><div class="top-right"><span class="pill">✦ Démonstration</span>${trainer?`${hubSearchTrigger()}${notificationBell()}${settingsButton()}<button class="avatar profile-trigger" aria-label="Mon profil" title="Mon profil" onclick="go('trainer-profile')">${photoContent(people)}</button>`:`${hubSearchTrigger()}${notificationBell()}${settingsButton()}<div class="avatar">AM</div>`}</div></header><main class="main" id="main-content">${pageContent()}</main></div></div>${mobileDock(trainer)}${mobileMoreSheet()}${state.modal?modalView():''}<div id="toast-root" aria-live="polite"></div>`;
 decorateMobileTables();
 syncOperationalFocus();
 if(state.modal?.kind==='hub-search'){
   const field=$('hub-search-query');
   renderHubSearch(field);
   field.focus({preventScroll:true});
   field.setSelectionRange(field.value.length,field.value.length);
 }
}
function hubSearchTrigger(){
  return `<button type="button" class="hub-search-trigger" onclick="openModal('hub-search')" aria-label="Rechercher dans le Hub" aria-haspopup="dialog">${mobileIcon('search',20)}<span>Rechercher dans le Hub</span></button>`;
}

function hubSearchPanel(){
  return modalBox('Rechercher dans le Hub','',`<div class="hub-search-panel">
    <input id="hub-search-query" class="field" type="search" aria-label="Rechercher dans le Hub" placeholder="Un nom, un document, une date…" autocomplete="off" oninput="renderHubSearch(this)" onkeydown="handleHubSearchKey(event)">
    <div id="hub-search-history"></div>
    <div id="hub-search-status" class="item-sub" role="status"></div>
    <ul id="hub-search-results" class="hub-search-results"></ul>
  </div>`);
}

function hubSearchEntries(){
  const amo=state.role==='amo';
  const entries=[];
  const add=(type,id,title,detail,open,keywords=[])=>entries.push({key:type+':'+id,type,title,detail,open,keywords});
  const pages=amo?[
    ['home','Vue d’ensemble','accueil tableau de bord'],
    ['planning','Planning global','agenda calendrier gestion des conflits'],
    ['staffing','Staffing assisté','affectations propositions à staffer'],
    ['documents','Livrables & bilans','documents dossiers audit cadrage programme support'],
    ['formations','Formations','sessions'],
    ['trainers','Annuaire Formateurs','profils intervenants'],
    ['clients','Annuaire Clients','entreprises sociétés'],
    ['reporting','Monthly AMO','reporting statistiques NPS']
  ]:[
    ['trainer-home','Accueil','mon espace'],
    ['trainer-missions','Mes missions','propositions sessions formations'],
    ['trainer-calendar','Mon agenda','calendrier planning disponibilités'],
    ['trainer-docs','Mes livrables','documents dossiers audit cadrage programme support'],
    ['trainer-profile','Mon profil','coordonnées']
  ];
  for(const [page,title,aliases] of pages)add('Page',page,title,'',()=>go(page),[aliases]);
  add('Page','notifications','Notifications','',openOperationsInbox,['alertes rappels']);
  add('Page','settings','Réglages','',()=>openModal('hub-settings'),['paramètres préférences']);

  if(amo){
    for(const client of clients){
      const d=clientDetails[client.id];
      add('Client',client.id,client.name,[d.industry,d.city].filter(Boolean).join(' · '),()=>openClient(client.id),
        [d.domain,d.owner,d.description,d.address,d.contact,d.region,d.postalCode]);
    }
    for(const trainer of trainers){
      const person=trainerById(trainer.id);
      add('Formateur',person.id,person.name,[person.city,...person.skills].join(' · '),()=>openTrainer(person.id),
        [person.email,person.rating,trainerProfileField(person.id).domain]);
    }
    for(const f of formations)add('Formation',f.id,f.title,clientOf(f).name,()=>openFormation(f.id),[f.id,f.status,f.program]);
  }

  for(const session of db.sessions){
    const f=formOf(session);
    if(!f||(!amo&&!trainerSessionAccess(session.id)))continue;
    const date=fmtDate(session.date);
    add(amo?'Session':'Mission',session.id,f.title,[clientOf(f).name,date,session.city].filter(Boolean).join(' · '),
      ()=>openSessionFromCalendar(session.id,!amo),[session.date,session.topic,session.status,session.modality]);
  }
  for(const doc of db.deliverables){
    if(!amo&&!trainerCanReadDocument(doc))continue;
    const f=formations.find(item=>item.id===doc.formationId);
    const file=doc.versions?.at(-1)?.filename;
    add('Livrable',doc.id,doc.title,[f&&clientOf(f).name,file,doc.status].filter(Boolean).join(' · '),
      ()=>openModal('document-preview',doc.id),[doc.type,f?.title,doc.dueDate]);
  }
  for(const entry of db.calendarEvents||[]){
    if(entry.trainerId!==(amo?null:state.trainerId))continue;
    add('Agenda','event:'+entry.id,entry.title,[fmtDate(entry.date),entry.start,entry.location].filter(Boolean).join(' · '),
      ()=>openCalendarEvent(entry.date,entry.id),[entry.date,entry.address]);
  }
  for(const entry of db.availability||[]){
    if(amo||entry.trainerId!==state.trainerId)continue;
    add('Agenda','availability:'+entry.id,entry.status,[fmtDate(entry.date),entry.start,entry.zone].filter(Boolean).join(' · '),
      ()=>openCalendarEvent(entry.date,entry.id,true),[entry.date,'disponibilités']);
  }
  for(const proposal of db.proposals){
    if(!amo&&(proposal.trainerId!==state.trainerId||(!proposal.sent&&!['Envoyée','Acceptée','Refusée','Expirée'].includes(proposal.status))))continue;
    const session=sessionById(proposal.sessionId),f=session&&formOf(session);
    if(!f)continue;
    const trainer=amo?trainerById(proposal.trainerId)?.name:'';
    add('Proposition',proposal.id,f.title,[clientOf(f).name,trainer,proposal.status,fmtDate(session.date)].filter(Boolean).join(' · '),()=>{
      if(amo)return openStaffProposal(proposal.id);
      state.missionTab='proposals';
      go('trainer-missions');
    });
  }
  for(const notice of inboxItems())add('Notification',notice.event,notice.title,notice.detail,()=>{
    openOperationsInbox();
    readOperationsNotice(notice.event,true);
  });
  return entries;
}

function normalizeHubSearch(value){
  return String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim();
}

function hubSearchHistoryKey(){
  return DEMO_KEY+'-search-opened-'+(state.role==='amo'?'amo':'trainer-'+state.trainerId);
}

function readHubSearchHistory(){
  try{
    const history=JSON.parse(localStorage.getItem(hubSearchHistoryKey())||'[]');
    return Array.isArray(history)?history.filter(value=>typeof value==='string').slice(0,3):[];
  }catch{return []}
}

function openHubSearchEntry(entry){
  const previous=readHubSearchHistory().filter(key=>key!==entry.key);
  try{localStorage.setItem(hubSearchHistoryKey(),JSON.stringify([entry.key,...previous].slice(0,3)))}catch{}
  entry.open();
}

function renderHubSearchHistory(input,entries){
  const container=$('hub-search-history');
  const history=input.value.trim()?[]:readHubSearchHistory().map(key=>entries.find(entry=>entry.key===key)).filter(Boolean);
  container.innerHTML=history.length?`<div class="hub-search-history-heading"><strong>Derniers résultats ouverts</strong>
    <button type="button" class="ops-icon-button ops-notice-delete" aria-label="Effacer l’historique de recherche" title="Effacer l’historique">${inboxIcon('trash')}</button>
  </div><ul class="hub-search-history-list">${history.map(item=>`<li><button class="secondary tiny" type="button">${esc(item.title)} <small>${esc([item.type,item.detail].filter(Boolean).join(' · '))}</small></button></li>`).join('')}</ul>`:'';
  if(!history.length)return;
  container.querySelector('.ops-icon-button').addEventListener('click',()=>{
    try{localStorage.removeItem(hubSearchHistoryKey())}catch{}
    renderHubSearchHistory(input,entries);
    input.focus();
  });
  container.querySelectorAll('li button').forEach((button,i)=>button.addEventListener('click',()=>{
    openHubSearchEntry(history[i]);
  }));
}

function renderHubSearch(input){
  const query=normalizeHubSearch(input.value);
  const terms=query?query.split(/\s+/):[];
  const entries=hubSearchEntries();
  renderHubSearchHistory(input,entries);
  const matches=(terms.length?entries.map(entry=>{
    const title=normalizeHubSearch(entry.title);
    const text=normalizeHubSearch([entry.type,entry.title,entry.detail,...entry.keywords].join(' '));
    return {entry,score:terms.every(term=>text.includes(term))?(title===query?3:title.startsWith(query)?2:title.includes(query)?1:0):-1};
  }).filter(match=>match.score>=0).sort((a,b)=>b.score-a.score).map(match=>match.entry)
    :entries.filter(entry=>entry.type==='Page'));
  const results=$('hub-search-results');
  const shown=matches.slice(0,20);
  results.innerHTML=shown.map(entry=>`<li><button class="hub-search-result" type="button">
    <span><strong>${esc(entry.title)}</strong>${entry.detail?`<small>${esc(entry.detail)}</small>`:''}</span>
    <span class="badge purple">${esc(entry.type)}</span>
  </button></li>`).join('');
  results.querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>openHubSearchEntry(shown[i])));
  $('hub-search-status').textContent=!terms.length?'Accès rapides':!matches.length?'Aucun résultat.':matches.length>shown.length?`${shown.length} résultats affichés sur ${matches.length}. Affine ta recherche.`:`${matches.length} résultat${matches.length===1?'':'s'}`;
}

function handleHubSearchKey(event){
  if(!['Enter','ArrowDown'].includes(event.key))return;
  const first=$('hub-search-results').querySelector('button');
  if(!first)return;
  event.preventDefault();
  if(event.key==='Enter')first.click();
  else first.focus();
}

function toggleMenu(){state.menuOpen=!state.menuOpen;render()}
function resetDemo(){if(!confirm('Réinitialiser toutes les interactions de démonstration ?'))return;db=clone(initialData);initV17();save();state.modal=null;state.candidate=null;render();flash('Données de démonstration réinitialisées')}
function pageContent(){return ({home:homePage,planning:planningPage,formations:formationsPage,'formation-detail':formationDetail,'session-detail':sessionDetail,trainers:trainersPage,'trainer-detail':trainerDetail,clients:clientsPage,'client-detail':clientDetail,staffing:staffingPage,documents:documentsPage,reporting:reportingPage,'trainer-home':trainerHome,'trainer-missions':trainerMissions,'trainer-calendar':trainerCalendar,'trainer-docs':trainerDocs,'trainer-folder':trainerFolder,'trainer-profile':trainerProfile})[state.page]?.()||homePage()}
function homePage(){
  const sessions=db.sessions.filter(s=>s.status!=='Réalisée').sort((a,b)=>a.date.localeCompare(b.date));
  const incomplete=sessions.filter(s=>openCount(s)>0);
  const docs=db.deliverables.filter(d=>['À fournir','Refusé','En vérification'].includes(d.status));
  const today=parisToday();
  const next=sessions.find(s=>s.date>=today);
  const alerts=amoMilestones().filter(x=>x.status==='À traiter').length;
  return `<section class="amo-hero"><div><div class="eyebrow">${fmtDate(today,{weekday:'long',day:'numeric',month:'long'})}</div><h1 class="headline">Bonjour <em>Nour</em></h1><p>${incomplete.length} session(s) à staffer · ${docs.length} livrable(s) à suivre</p></div>
    <div class="amo-next"><small>PROCHAINE SESSION</small>${next?`<strong>${esc(clientOf(formOf(next)).name)}</strong><span>${fmtDate(next.date)} · ${next.start}</span><button class="secondary tiny" onclick="openSession(${next.id})">Voir la session</button>`:'<strong>Aucune session à venir</strong>'}</div></section>
    <div class="home-shortcuts"><button class="secondary tiny" onclick="go('planning')">${mobileIcon('calendar',17)} Ouvrir le planning</button></div>
    <div class="overview-metrics">${metric('Formations',formations.length,'Dossiers à suivre','formations')}${metric('Staffing',incomplete.length,'Sessions à compléter','staffing')}${metric('Formateurs',trainers.length,'Profils référencés','trainers')}${metric('Livrables',docs.length,'Documents à suivre','documents','open')}</div>
    <section class="card home-milestones"><div><h2 class="section-title">Jalons</h2><p class="item-sub">${alerts?alerts+' étapes arrivées à échéance':'Aucune étape à traiter'}</p></div><button class="secondary tiny" onclick="openModal('amo-milestones')">Voir les jalons</button></section>
    <div class="overview-grid">
      <section class="card">${cardTitle('À traiter en priorité')}
        ${incomplete.slice(0,3).map(s=>`<div class="priority-row"><div><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${openCount(s)} poste(s) à pourvoir · ${fmtDate(s.date)}</div></div><button class="primary tiny" onclick="staffFor(${s.id})">Gérer le staffing</button></div>`).join('')}
        ${docs.slice(0,2).map(d=>`<div class="priority-row"><div><strong>${esc(d.title)}</strong><div class="item-sub">${esc(clientOf(formOf(sessionById(d.sessionId))).name)} · ${esc(d.status)}</div></div><button class="secondary tiny" onclick="${d.versions.length?`openModal('review','${d.id}')`:`openFolder('${d.formationId}')`}">${d.versions.length?'Vérifier le livrable':'Ouvrir le dossier'}</button></div>`).join('')}
        ${!incomplete.length&&!docs.length?'<p class="empty">Aucune action en attente.</p>':''}
      </section>
      <section class="card">${cardTitle('Prochaines sessions')}
        ${sessions.filter(s=>s.date>=today).slice(0,5).map(s=>`<button class="line-item clickable-row" onclick="openSession(${s.id})"><span class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></span><span class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><span class="item-sub">${esc(formOf(s).title)} · ${esc(s.city)} · ${s.start}–${s.end}</span></span>${badge(staffingLabel(s))}<span aria-hidden="true" class="row-chevron">›</span></button>`).join('')}
        <button class="ghost" onclick="go('formations')">Voir toutes les formations</button>
      </section>
    </div>`;
}
function formationsPage(){let rows=formations.filter(f=>{let client=clientOf(f).name,st=db.sessions.filter(s=>s.formationId===f.id);return(client+' '+f.title).toLowerCase().includes(state.search.toLowerCase())&&(state.filter==='all'||(state.filter==='open'&&st.some(s=>openCount(s)>0))||f.status===state.filter)});return `${intro('Les <em>formations.</em>','Une formation regroupe une ou plusieurs sessions, des documents et ses jalons.')}${filtersBar('Client ou formation…',[['all','Tous les dossiers'],['open','Staffing incomplet'],['En préparation','En préparation'],['Planifiée','Planifiée'],['À qualifier','À qualifier']])}<div class="table-wrap"><table class="tbl"><thead><tr><th>Client / Formation</th><th>Sessions</th><th>Dates</th><th>Staffing</th><th>Statut</th><th></th></tr></thead><tbody>${rows.map(f=>{let ss=db.sessions.filter(s=>s.formationId===f.id);return `<tr class="linked-table-row" onclick="openFormation('${f.id}')"><td><strong class="formation-client">${esc(clientOf(f).name)}</strong><div class="item-sub">${esc(f.title)}</div></td><td>${ss.length} session(s)</td><td>${ss.map(s=>fmtDate(s.date,{day:'numeric',month:'short'})).join(' · ')}</td><td>${ss.filter(s=>openCount(s)===0).length}/${ss.length} session(s) staffées</td><td>${badge(f.status)}</td><td><button class="ghost" aria-label="Ouvrir la formation ${esc(clientOf(f).name)}" onclick="event.stopPropagation();openFormation('${f.id}')"><span aria-hidden="true">›</span></button></td></tr>`}).join('')}</tbody></table>${rows.length?'':'<div class="empty">Aucune formation trouvée.</div>'}</div><p class="footnote">Une formation n’est pas dupliquée par ses sessions. Les statuts de staffing sont calculés à partir des affectations confirmées.</p>`}
const milestones=[['J-28','Audit'],['J-14','Cadrage'],['J-7','Programme PDF'],['J-3','Feu vert'],['J-1','Vérifications'],['Jour J','Questionnaire'],['J+1','Débrief'],['J+7','Bilan / passation']];
function formationDetail(){let f=formations.find(x=>x.id===state.selectedFormation)||formations[0],ss=db.sessions.filter(s=>s.formationId===f.id),docs=db.deliverables.filter(d=>d.formationId===f.id);return `<button class="ghost" onclick="go('formations')">← Retour aux formations</button>${intro(esc(clientOf(f).name),esc(f.title),'FICHE FORMATION · DONNÉES FICTIVES')}<div class="toolbar">${badge(f.status)}<div class="group">${badge(ss.length+' session(s)')}<span class="badge blue">Données HubSpot simulées</span></div></div><div class="detail-grid"><div><div class="card">${cardTitle('Sessions de formation','Chaque session conserve son propre staffing et ses horaires')}${ss.map(s=>`<div class="line-item session-tile"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><div class="item-title">${esc(s.topic)} · ${esc(s.city)}</div><div class="item-sub">${s.start}–${s.end} · ${s.required} formateur(s) requis</div></div>${badge(staffingLabel(s))}<button class="ghost" onclick="openSession(${s.id})">Détail ↗</button></div>`).join('')}</div><div class="card" style="margin-top:18px">${cardTitle('Cycle de préparation')}${preparationCycle(ss)}</div></div><div><div class="card">${cardTitle('Livrables associés')}${docs.length?docs.map(d=>docLine(d)).join(''):'<div class="empty">Aucun document recensé.</div>'}<button class="secondary" style="margin-top:14px" onclick="openFolder('${f.id}')">Tous les livrables ↗</button></div><div class="card" style="margin-top:18px">${cardTitle('Sources prévues')}${db.sync.map(c=>`<div class="line-item"><div class="grow"><strong>${esc(c.name)}</strong><div class="item-sub">Intégration à venir</div></div>${badge(c.status)}</div>`).join('')}</div></div></div>`}
function sessionDetail(){let s=sessionById(state.selectedSession)||db.sessions[0],f=formOf(s),aa=activeAssignments(s.id),p=db.proposals.filter(p=>p.sessionId===s.id),docs=db.deliverables.filter(d=>d.sessionId===s.id);return `<button class="ghost" onclick="openFormation('${f.id}')">← Retour à la formation</button>${intro(esc(clientOf(f).name),esc(f.title),'FICHE SESSION · EXEMPLE FICTIF')}<div class="toolbar"><div class="group">${badge(s.status)}${badge(staffingLabel(s))}</div><div class="group"><button class="secondary" onclick="openModal('reschedule',${s.id})">${mobileIcon('calendar',16)} Reporter la session</button><button class="primary" onclick="staffFor(${s.id})">Gérer le staffing →</button></div></div><div class="detail-grid"><div><div class="card session-summary">${cardTitle('Informations de la session')}<div class="info-grid">${[['Date',fmtDate(s.date)],['Horaires',s.start+'–'+s.end],['Lieu',s.city],['Participants',s.people+' personnes'],['Modalité',s.modality],['Formateurs nécessaires',s.required],['Statut session',s.status],['Affectations confirmées',aa.length]].map(([k,v])=>`<div class="info"><small>${k}</small><strong>${esc(v)}</strong></div>`).join('')}</div></div><div class="card" style="margin-top:18px">${cardTitle('Affectations et propositions')}${aa.map(a=>`<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(a.trainerId))}</strong><div class="item-sub">Affectation ${esc(a.id)}</div></div>${badge(a.status)}</div>`).join('')}${p.map(x=>`<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(x.trainerId))}</strong><div class="item-sub">Proposition ${esc(x.id)}</div></div>${badge(x.status)}</div>`).join('')}${!aa.length&&!p.length?'<div class="empty">Aucune affectation ni proposition.</div>':''}</div><div class="card" style="margin-top:18px">${cardTitle('Documents et livrables')}${sessionDocuments(s,docs)}${sessionFeedbackDeliverables(s)}</div></div><div><div class="card">${cardTitle('Traçabilité','État de démo')}${db.activity.filter(a=>a.detail.includes(String(s.id))).slice(0,5).map(a=>`<div class="line-item"><div class="grow"><strong>${esc(a.action)}</strong><div class="item-sub">${esc(a.detail)}</div></div></div>`).join('')||'<div class="empty">Aucune action enregistrée.</div>'}</div></div></div>`}
function trainerRatingBadge(rating){
  const normalized=String(rating||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/-/g,' ').trim();
  const classifications={
    'numero 10':['top','Numéro 10','bonus'],
    'back up':['backup','Back-up','trainers'],
    'etoile montante':['rising','Étoile montante','reporting'],
    'a tester':['trial','À tester','check'],
    'a ne pas staffer':['blocked','À ne pas staffer','close']
  };
  const [style,label,icon]=classifications[normalized]||['neutral',rating||'Classement à préciser','profile'];
  return `<span class="trainer-rating trainer-rating--${style}"><span class="trainer-rating-icon">${mobileIcon(icon,16)}</span><strong>${esc(label)}</strong></span>`;
}
function trainersPage(){let rows=trainers.map(t=>trainerById(t.id)).filter(t=>(state.filter==='all'||(state.filter==='unknown'&&t.available==='unknown')||(state.filter==='available'&&t.available==='yes')||t.city===state.filter)&&(t.name+' '+t.skills.join(' ')+' '+t.city).toLowerCase().includes(state.search.toLowerCase()));return `${intro('Les <em>formateurs.</em>','Annuaire enrichi — LinkedIn, expertises, expérience et performances, visibles uniquement selon les droits internes.')}${filtersBar('Nom, compétence, ville…',[['all','Tous les profils'],['available','Disponibles déclarés'],['unknown','Disponibilité inconnue'],['Paris','Paris'],['Lyon','Lyon'],['Bordeaux','Bordeaux'],['Marseille','Marseille']])}<div class="toolbar"><div class="group"><button class="${state.trainerView==='cards'?'primary':'secondary'} tiny" onclick="changeTab('trainerView','cards')">${mobileIcon('grid',16)} Cartes</button><button class="${state.trainerView==='table'?'primary':'secondary'} tiny" onclick="changeTab('trainerView','table')">${mobileIcon('list',16)} Tableau</button></div><span class="badge purple">Référentiel Notion à connecter · données fictives</span></div>${state.trainerView==='cards'?`<div class="trainer-grid">${rows.map(t=>{let x=trainerProfileField(t.id);return `<div class="trainer-card trainer-directory-card ${trainerCardClass(t)}"><div class="trainer-top">${trainerAvatar(t)}<div><div class="trainer-name">${esc(t.name)}</div><div class="trainer-meta">${mobileIcon('pin',14)} ${esc(t.city)}</div></div>${trainerReviewButtons(t)}</div><div class="trainer-rating-row">${trainerRatingBadge(t.rating)}</div><div class="tags">${t.skills.map(k=>`<span class="tag">${esc(k)}</span>`).join('')}</div>${availabilityBadge(t)}<div style="margin:9px 0">${reliabilityBadge(t)}</div><div class="trainer-stats v19-three"><div><small>Missions (démo)</small><strong>${t.missions}</strong></div><div><small>TJM TTC</small><strong>${money(t.rate)}</strong></div><div><small>Gains estimés*</small><strong>${money(gainsEstimate(t))}</strong></div></div><div class="item-sub">${esc(x.domain)} · ${x.nps==null?'NPS inconnu':'Satisfaction '+x.nps+'/10'}</div><div class="split-btns" style="margin-top:14px"><button class="secondary tiny" onclick="openTrainer(${t.id})">Voir la fiche</button><button class="primary tiny" onclick="selectTrainerForStaff(${t.id})">Staffer</button></div></div>`}).join('')}</div>`:`<div class="table-wrap"><table class="tbl"><thead><tr><th>Formateur</th><th>Classement</th><th>Spécialité</th><th>TJM TTC</th><th>NPS (démo)</th><th>Fiabilité</th><th>Gains estimés</th><th></th></tr></thead><tbody>${rows.map(t=>`<tr><td><div class="trainer-review-cell"><div><strong>${esc(t.name)}</strong><div class="item-sub">${esc(t.city)}</div></div>${trainerReviewButtons(t)}</div></td><td>${trainerRatingBadge(t.rating)}</td><td>${esc(trainerProfileField(t.id).domain)}</td><td>${t.rate} €</td><td>${trainerProfileField(t.id).nps??'Inconnu'}</td><td>${reliabilityBadge(t)}</td><td>${money(gainsEstimate(t))}</td><td><button class="ghost" onclick="openTrainer(${t.id})">Voir ↗</button></td></tr>`).join('')}</tbody></table></div>`}<p class="footnote">Schéma cible de <a class="text-link" href="https://app.notion.com/p/3e5c6d0eb96e809ab965c7f66813ffd8" target="_blank" rel="noopener noreferrer">Formateurs à staffer Q4 26 ↗</a> : Activité, Classement, LinkedIn, LLM, spécialités, localisation, TJM (TTC), NPS moyen, nombre de missions et cartons. Aucun profil réel n'a été importé ici.</p>`}
function selectTrainerForStaff(id){if(state.role==='amo')openModal('trainer-staffing',id)}
function trainerDetail(){
 if(state.role==='formateur')return '<div class="empty">Accès réservé à l’équipe interne.</div>';
 const t=trainerById(state.selectedTrainer)||trainers[0],x=trainerProfileField(t.id),aa=db.assignments.filter(a=>a.trainerId===t.id),tab=state.trainerDetailTab||'overview';
 const tabs=[['overview','Présentation'],['career','Expertises'],['missions','Missions'],['performance','Performances'],['internal','Gestion interne'],['agenda','Disponibilités']];
 let content='';
 if(tab==='overview')content=`<section class="ops-profile-section"><h2>Présentation</h2><p>${esc(db.profiles?.[t.id]?.bio||'Biographie non renseignée.')}</p></section><div class="info-grid">${[['Activité',x.activity],['Classement',t.rating],['Spécialité',x.domain],['LLM',x.llm.join(', ')||'Inconnu'],['Localisation',t.city],['TJM TTC',money(t.rate)],['Missions fictives',t.missions],['NPS démo',x.nps==null?'Non renseigné':x.nps+'/10']].map(([k,v])=>`<div class="info"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}<div class="info"><small>E-mail</small>${safeContact(t.email,'email')}</div><div class="info"><small>Téléphone</small>${safeContact(t.phone||x.phone,'phone')}</div><div class="info"><small>LinkedIn</small>${linkSafe(t.linkedin||x.linkedin,'Ouvrir le profil')}</div></div><p class="footnote">Contacts fictifs ou absents : à synchroniser avec la base Notion autorisée, sans inventer de numéro ni de profil LinkedIn.</p>`;
 else if(tab==='career')content=`<div class="profile-columns">${[...professionalFacts(t,x),['Domaine',x.domain],['Forces',x.strengths],['Axes d’amélioration (interne)',x.improvements]].map(([label,value])=>professionalFactCard(label,value)).join('')}</div>`;
 else if(tab==='missions')content=`<h3 class="section-title">Historique des missions</h3>${aa.slice().sort((a,b)=>(sessionById(b.sessionId)?.date||'').localeCompare(sessionById(a.sessionId)?.date||'')).map(a=>{let s=sessionById(a.sessionId),r=missionRatings[a.id];if(!s)return '';return `<div class="line-item"><div class="grow"><strong>${esc(clientOf(formOf(s)).name)} · ${esc(formOf(s).title)}</strong><div class="item-sub">${fmtDate(s.date)} · ${esc(s.city)}</div></div>${badge(a.status)} ${badge(r?.score!=null?r.score+'/10 · démo':'Non évaluée')}<button class="ghost" onclick="openSession(${s.id})">Détail ↗</button></div>`}).join('')||'<div class="empty">Aucune mission.</div>'}`;
 else if(tab==='performance')content=`<div class="cards">${metric('NPS moyen',x.nps==null?'Inconnu':x.nps+'/10','Donnée fictive')}${metric('Missions réalisées',aa.filter(a=>a.status==='Réalisée').length,'Dans l’historique local')}${metric('TJM TTC',money(t.rate),'Par jour')}${metric('Gains estimés',money(gainsEstimate(t)),'TJM × missions déclarées')}</div><p class="item-sub">Réponse aux propositions · ${esc(responseRate(t))}</p>${reliabilityCard(t)}`;
 else if(tab==='internal')content=internalReviewsCard(t);
 else content=trainerOperationalAvailability(t);
 return `<button class="ghost" onclick="go('${state.trainerFromStaff?'staffing':'trainers'}')">← ${state.trainerFromStaff?'Retour au staffing':'Retour à l’annuaire'}</button>
 <article class="card profile-fiche ops-profile ${trainerCardClass(t)}"><div class="trainer-top fiche-hero">${trainerAvatar(t,70)}<div><h1 class="headline" style="font-size:28px;margin:0">${esc(t.name)}</h1>
 <div class="trainer-meta">${esc(t.city)} · ${esc(t.rating)}</div>${reliabilityBadge(t)}</div><div class="grow"></div>${availabilityBadge(t)}${trainerReviewButtons(t)}</div>
 <div class="ops-actions ops-profile-actions"><button class="primary tiny" onclick="selectTrainerForStaff(${t.id})">Proposer une mission</button>
 <button class="secondary tiny" onclick="changeTab('trainerDetailTab','agenda')">Voir les disponibilités</button></div>
 <div class="ops-tabs ops-profile-tabs" role="group" aria-label="Sections de la fiche">${tabs.map(([key,label])=>`<button aria-pressed="${key===tab}" onclick="changeTab('trainerDetailTab','${key}')">${label}</button>`).join('')}</div>
 ${content}</article>`;
}
function reliabilityCard(t){let score=reliabilityScore(t);return `<div class="card" style="margin-top:16px"><div class="card-head"><div><h3 class="section-title">Fiabilité · grille proposée V1.9</h3><p class="section-caption">Satisfaction 40 %, ponctualité 30 %, incidents vérifiés 20 %, retours de missions 10 %</p></div>${badge('À valider métier')}</div>${score.parts.map(([label,value,weight])=>`<div class="line-item"><div class="grow"><strong>${esc(label)}</strong> <small>(${weight} %)</small></div><strong>${value==null?'Données insuffisantes':value+'/100'}</strong></div>`).join('')}<div class="line-item bonus-review"><div class="grow"><strong>${mobileIcon('bonus',16)} Bonus AMO</strong><div class="item-sub">${score.bonuses} bonus · 5 points par bonus, score plafonné à 100</div></div><strong>+${score.bonusPoints}</strong></div><p class="footnote">${score.total===null?'Fiabilité non évaluée.':(score.complete?'Base calculée':'Base illustrative')+' : '+score.base+'/100 · Score avec bonus : '+score.total+'/100.'} Les données manquantes ne sont jamais considérées comme zéro.</p></div>`;}
function openClient(id){state.selectedClient=id;go('client-detail')}
function clientCompanyFacts(d, compact=false){
  const fields=[
    ['Nom de domaine',d.domain?linkSafe(d.website,d.domain):''],
    ['Secteur d’activité',esc(d.industry)],
    ['Propriétaire de l’entreprise',esc(d.owner)],
    ['Type',esc(d.type)],
    ...(!compact?[['Contact',esc(d.contact)],['Adresse',esc(d.address)]]:[]),
    ['Ville',esc(d.city)],['État / Région',esc(d.region)],
    ['Code postal',esc(d.postalCode)],
    ['Nombre d’employés',esc(d.employees)],
    ['Chiffre d’affaires annuel',d.annualRevenue==null?'':esc(money(d.annualRevenue))],
    ['Fuseau horaire',esc(d.timeZone)],
    ['Page LinkedIn',d.linkedin?linkSafe(d.linkedin,'LinkedIn de l’entreprise'):''],
    ...(!compact?[['Référence CRM',esc(d.hubspot)]]:[])
  ];
  const visible=compact?fields.filter(([,value])=>value):fields;
  return `<dl class="client-facts client-company-facts">${visible.map(([label,value])=>
    `<div><dt>${label}</dt><dd>${value||'Non renseigné'}</dd></div>`).join('')}</dl>`;
}
function clientDirectoryCard(c){
  const d=clientDetails[c.id],fs=formations.filter(f=>f.clientId===c.id),ts=assignedTrainersOfClient(c.id);
  return `<article class="trainer-card trainer-directory-card client-directory-card">
    <div class="trainer-top"><span class="client-avatar" aria-hidden="true">${esc(c.name.slice(0,2).toUpperCase())}</span><div>
      <h3 class="trainer-name">${esc(c.name)}</h3><div class="trainer-meta">${esc([d.industry,d.city].filter(Boolean).join(' · '))}</div>
    </div></div>
    ${clientCompanyFacts(d,true)}
    <div class="tags">${ts.map(t=>`<span class="tag">${trainerName(t)}</span>`).join('')||'<span class="tag">Aucun formateur confirmé</span>'}</div>
    <div class="trainer-stats"><div><small>Formations</small><strong>${fs.length}</strong></div><div><small>Formateurs intervenus</small><strong>${ts.length}</strong></div></div>
    <div class="split-btns"><button class="secondary tiny" onclick="openClient('${c.id}')">Voir la fiche client</button></div>
  </article>`;
}
function clientsPage(){
  const rows=clients.filter(c=>{
    const d=clientDetails[c.id];
    const search=[c.name,d.industry,d.domain,d.city,d.owner].filter(Boolean).join(' ').toLowerCase();
    return (state.filter==='all'||d.city===state.filter)&&search.includes(state.search.trim().toLowerCase());
  });
  return `${intro('Annuaire <em>clients.</em>','Retrouvez les entreprises, leurs formations et les formateurs déjà mobilisés.')}
    ${filtersBar('Client, domaine, secteur…',[['all','Toutes les villes'],['Paris','Paris'],['Lyon','Lyon'],['Bordeaux','Bordeaux']])}
    <div class="toolbar"><div class="group">
      <button class="${state.clientView==='cards'?'primary':'secondary'} tiny" onclick="changeTab('clientView','cards')">${mobileIcon('grid',16)} Cartes</button>
      <button class="${state.clientView==='table'?'primary':'secondary'} tiny" onclick="changeTab('clientView','table')">${mobileIcon('list',16)} Tableau</button>
    </div><span class="badge purple">HubSpot non connecté</span></div>
    ${!rows.length?'<p class="empty">Aucun client trouvé.</p>':state.clientView==='cards'?`<div class="trainer-grid">${rows.map(clientDirectoryCard).join('')}</div>`:`<div class="table-wrap"><table class="tbl"><thead><tr><th>Client</th><th>Secteur</th><th>Ville</th><th>Formations</th><th>Formateurs associés</th><th></th></tr></thead><tbody>${rows.map(c=>`<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(clientDetails[c.id].industry)}</td><td>${esc(clientDetails[c.id].city||'—')}</td><td>${formations.filter(f=>f.clientId===c.id).length}</td><td>${assignedTrainersOfClient(c.id).length}</td><td><button class="ghost" onclick="openClient('${c.id}')">Voir ↗</button></td></tr>`).join('')}</tbody></table></div>`} `;
}
function clientDetail(){
  const c=clientById(state.selectedClient)||clients[0],d=clientDetails[c.id];
  const fs=formations.filter(f=>f.clientId===c.id);
  const sessions=db.sessions.filter(s=>fs.some(f=>f.id===s.formationId)).sort((a,b)=>a.date.localeCompare(b.date));
  const next=sessions.find(s=>s.date>=parisToday()&&!['Annulée','Réalisée'].includes(s.status));
  const trainers=assignedTrainersOfClient(c.id);
  return `<button class="ghost" onclick="go('clients')">← Annuaire clients</button>
    <section class="amo-hero client-dashboard-hero"><div><div class="eyebrow">${esc([d.industry,d.city].filter(Boolean).join(' · '))}</div><h1 class="headline">${esc(c.name)}</h1><p>${fs.length} formation(s) · ${sessions.length} session(s) · ${trainers.length} formateur(s) mobilisé(s)</p></div>
      <div class="amo-next"><small>PROCHAINE SESSION</small>${next?`<strong>${esc(formOf(next).title)}</strong><span>${fmtDate(next.date)} · ${esc(next.city)}</span><button class="secondary tiny" onclick="openSession(${next.id})">Voir la session</button>`:'<strong>Aucune session programmée</strong>'}</div></section>
    ${d.description?`<section class="card client-profile-description"><p lang="en">${esc(d.description)}</p></section>`:''}
    <div class="detail-grid client-dashboard">
      <section class="card">${cardTitle('Formations')}
        ${fs.map(f=>`<button class="line-item clickable-row" onclick="openFormation('${f.id}')"><span class="grow"><strong>${esc(f.title)}</strong><span class="item-sub">${formationDates(f.id)}</span></span>${badge(f.status)}<span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucune formation.</p>'}
        <h3 class="section-title client-subheading">Équipe mobilisée</h3>
        ${trainers.map(t=>`<button class="line-item clickable-row" onclick="openTrainer(${t.id})">${trainerAvatar(t,36)}<span class="grow"><strong>${trainerName(t)}</strong><span class="item-sub">${esc(t.city)}</span></span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucun formateur affecté.</p>'}
      </section><section class="card">${cardTitle('Informations sur l’entreprise')}
        ${clientCompanyFacts(d)}
        ${d.address?`<a class="secondary tiny client-directions" href="${esc(mapsUrl(d.address,d.city))}" target="_blank" rel="noopener noreferrer">${mobileIcon('pin',16)} Itinéraire</a>`:''}
      </section></div>`;
}
function criteria(t,s){let exact=t.skills.some(k=>k.toLowerCase()===s.topic.toLowerCase()),related=t.skills.some(k=>k.toLowerCase().includes(s.topic.toLowerCase())||s.topic.toLowerCase().includes(k.toLowerCase()));return [exact?'Expertise exacte':related?'Expertise proche':'Expertise à vérifier',t.city===s.city?'Même ville':'Déplacement à confirmer',t.available==='yes'?'Disponibilité déclarée':t.available==='no'?'Occupé déclaré':'Disponibilité inconnue']}
function staffingPage(){return operationsStaffingPage()}
function createProposal(){if(state.role!=='amo')return;let s=sessionById(state.selectedSession),t=trainerById(state.candidate);const block=staffingBlock(s,t);if(block)return flash(block);let existing=db.proposals.find(p=>p.sessionId===s.id&&p.trainerId===t.id&&!['Refusée','Expirée','Retirée'].includes(p.status));if(existing)return flash('Une proposition active existe déjà pour ce formateur');const amount=$('proposal-amount')?.valueAsNumber;const modes=[...document.querySelectorAll('input[name=proposal-mode]:checked')].map(el=>el.value);if(!Number.isFinite(amount)||amount<=0||!modes.length)return flash('Indiquez un montant et au moins une modalité.');let id='P'+(Math.max(1,...db.proposals.map(p=>Number(p.id.slice(1))))+1);db.proposals.push({id,sessionId:s.id,trainerId:t.id,status:'Brouillon',approved:false,sent:false,amount,modes,conditions:`${amount} € / jour · ${modes.join(' ou ')}`,created:parisToday(),expires:null});log('Proposition préparée',`${id} · session ${s.id}`);state.staffTab='proposals';openModal('whatsapp-draft',id)}
function approveProposal(id){
  if(state.role!=='amo')return;
  const proposal=findStaffProposal(id,'Brouillon');
  if(!proposal)return;
  const block=staffingBlock(sessionById(proposal.sessionId),trainerById(proposal.trainerId));
  if(block)return flash(block);
  proposal.approved=true;
  proposal.status='Autorisée à l’envoi';
  log('Autorisation humaine simulée',id);
  closeModal();
  flash('Envoi autorisé (simulation)');
}
function sendProposal(id){
  if(state.role!=='amo')return;
  const proposal=findStaffProposal(id,'Autorisée à l’envoi');
  if(!proposal||!proposal.approved)return;
  const session=sessionById(proposal.sessionId);
  const block=staffingBlock(session,trainerById(proposal.trainerId));
  if(block)return flash(block);
  const deadline=shiftDate(parisToday(),2);
  proposal.expires=session.date>=parisToday()&&session.date<deadline?session.date:deadline;
  proposal.status='Envoyée';
  proposal.sent=true;
  log('Envoi simulé — aucun message réel',id);
  render();
  flash('Envoi simulé enregistré.');
}
function respondProposal(id,status){
  if(state.role!=='formateur'||!['Acceptée','Refusée'].includes(status))return;
  const proposal=db.proposals.find(p=>p.id===id&&p.trainerId===state.trainerId&&p.status==='Envoyée');
  if(!proposal||proposalPastDue(proposal))return flash('Cette proposition ne peut plus recevoir de réponse.');
  if(status==='Acceptée'){
    const block=staffingBlock(sessionById(proposal.sessionId),trainerById(proposal.trainerId));
    if(block)return flash(block);
  }
  proposal.status=status;
  log('Réponse formateur : '+status,id);
  render();
  flash(status==='Acceptée'?'Réponse enregistrée · confirmation AMO attendue.':'Refus enregistré.');
}
function confirmAssignment(id){
  if(state.role!=='amo')return;
  const proposal=findStaffProposal(id,'Acceptée');
  if(!proposal)return;
  const session=sessionById(proposal.sessionId);
  const block=staffingBlock(session,trainerById(proposal.trainerId));
  if(block)return flash(block);
  const next='A'+(Math.max(0,...db.assignments.map(a=>Number(a.id.slice(1))).filter(Number.isFinite))+1);
  db.assignments.push({id:next,sessionId:session.id,trainerId:proposal.trainerId,status:'Confirmée',proposalId:id});
  // Close competing proposals when the last position is filled.
  if(!openCount(session)){
    for(const other of db.proposals){
      if(other!==proposal&&other.sessionId===session.id&&pendingProposalStates.includes(other.status)&&!db.assignments.some(a=>a.proposalId===other.id))other.status='Retirée';
    }
  }
  log('Affectation confirmée (démo)',next+' · session '+session.id);
  closeModal();
  flash('Affectation confirmée en démonstration.');
}
function planningPage(){return `${intro('Planning <em>global.</em>','Vue synchronisée de démonstration : superposez plusieurs agendas et modifiez les sessions sous contrôle.') }<div class="card" style="margin-bottom:18px">${cardTitle('Agendas affichés')}<label class="agenda-option contact-option"><input type="checkbox" ${state.contactAgenda?'checked':''} onchange="changeTab('contactAgenda',this.checked)"><span><strong>contact@certif-ia.fr</strong><small>Toutes les formations</small></span></label><div class="agenda-pickers"><button class="secondary tiny" onclick="selectAllAgendas(true)">Tout sélectionner</button><button class="secondary tiny" onclick="selectAllAgendas(false)">Tout masquer</button>${trainers.map(t=>`<label class="agenda-option"><input type="checkbox" ${state.selectedAgendaIds.includes(t.id)?'checked':''} onchange="toggleAgenda(${t.id},this.checked)"><span class="agenda-color" style="background:${t.accent}"></span><span>${trainerName(t)}</span></label>`).join('')}</div><div class="toolbar"><div class="group"><label><input type="checkbox" ${state.agendaShow==='both'||state.agendaShow==='availability'?'checked':''} onchange="state.agendaShow=this.checked?'both':'missions';render()"> Afficher les disponibilités / indisponibilités</label></div><span class="badge purple">Événements privés masqués · disponibilité inconnue ≠ libre</span></div></div>${agendaConflictCell()}${calendarUI(false)}<div class="card" style="margin-top:18px">${cardTitle('Sessions et modifications','Modifier date, horaires, lieu, modalité et formateur ; revalidation des affectations')} ${db.sessions.filter(s=>s.status!=='Réalisée').sort((a,b)=>a.date.localeCompare(b.date)).map(s=>`<div class="line-item"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${s.start}–${s.end} · ${esc(s.city)} · ${activeAssignments(s.id).map(a=>trainerName(trainerById(a.trainerId))).join(', ')||'À staffer'}</div></div><button class="secondary tiny" onclick="openModal('edit-session',${s.id})">Modifier</button></div>`).join('')}</div>`}
function selectAllAgendas(yes){state.selectedAgendaIds=yes?trainers.map(t=>t.id):[];render()}
function toggleAgenda(id,checked){state.selectedAgendaIds=checked?[...state.selectedAgendaIds,id]:state.selectedAgendaIds.filter(t=>t!==id);render()}
function calendarUI(person){
  const view=state[person?'trainerCalendarView':'calendarView'];
  const date=state.calendarDate;
  const month=new Date(date+'T12:00:00');
  const week=weekStart(date);
  const first=new Date(month.getFullYear(),month.getMonth(),1,12);
  const monthOffset=(first.getDay()+6)%7;
  const monthLength=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const weekDays=Array.from({length:7},(_,i)=>shiftDate(toISO(week),i));
  const monthDays=Array.from({length:monthLength},(_,i)=>shiftDate(toISO(first),i));
  const days=view==='day'?[date]:view==='week'?weekDays:monthDays;
  const personal=person?trainerMissionsInCalendar(state.trainerId):[];
  const meetings=(person||state.contactAgenda?db.calendarEvents||[]:[]).filter(e=>e.trainerId===(person?state.trainerId:null));
  const availability=db.availability.filter(a=>person?a.trainerId===state.trainerId:state.agendaShow!=='missions'&&state.selectedAgendaIds.includes(a.trainerId));
  const sessions=person?personal:db.sessions.filter(s=>state.contactAgenda||activeAssignments(s.id).some(a=>state.selectedAgendaIds.includes(a.trainerId))).map(s=>({...s,title:clientOf(formOf(s)).name,status:staffingLabel(s),kind:'session'}));
  const events=[...sessions,...meetings.map(e=>({...e,kind:'event'})),...availability.map(a=>({...a,title:person?a.status:trainerById(a.trainerId)?.name+' · '+a.status,kind:'slot'}))];
  const dayEvents=day=>events.filter(e=>e.date===day).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const eventMarkup=(e,agenda=false)=>{
    const title=e.kind==='slot'&&!person?trainerName(trainerById(e.trainerId))+' · '+esc(e.status):esc(e.title);
    const action=e.kind==='session'?`openSessionFromCalendar(${e.id},${person})`:e.kind==='event'?`openCalendarEvent('${e.date}','${e.id}')`:person?`openCalendarEvent('${e.date}','${e.id}',true)`:'';
    const cls=e.kind==='slot'?(e.status==='Occupé'?'red':'green'):'purple';
    const details=[e.start&&e.end?e.start+'–'+e.end:'Journée entière',e.kind==='session'?e.status:e.kind==='slot'?e.zone:e.eventType==='formation'?(e.location||'Formation'):''].filter(Boolean).join(' · ');
    return `<${action?'button':'div'} class="agenda-event ${cls} ${agenda?'agenda-event-list':''}" ${action?`onclick="${action}"`:''}><strong>${title}</strong><small>${esc(details)}</small></${action?'button':'div'}>`;
  };
  const dayButton=(day,cls='',label='')=>`<button class="agenda-day-button ${cls}" aria-label="Ajouter un événement le ${fmtDate(day,{weekday:'long',day:'numeric',month:'long'})}" onclick="openCalendarEvent('${day}')">${label||fmtDate(day,{weekday:'short',day:'numeric'})}<span aria-hidden="true">＋</span></button>`;
  const pager=(inc,label,cls='')=>`<button class="secondary tiny ${cls}" aria-label="${label}" onclick="changeCalendar(${inc},${person})">${inc<0?'‹':'›'}</button>`;
  const views=[['month','Mois'],['week','Semaine'],['day','Jour']];
  const viewPicker=className=>`<div class="${className}" role="group" aria-label="Vue de l’agenda">${views.map(([key,label])=>`<button class="${view===key?'primary':'secondary'} tiny" aria-pressed="${view===key}" onclick="setCalendar('${key}',${person})">${label}</button>`).join('')}</div>`;
  const fullDay=day=>fmtDate(day,{weekday:'long',day:'numeric',month:'long'});
  const shortDay=day=>fmtDate(day,{day:'numeric',month:'short'});
  const hasEvents=day=>dayEvents(day).length>0;
  const displayDate=view==='week'?`${shortDay(weekDays[0])} – ${shortDay(weekDays[6])}`:view==='day'?fullDay(date):fmtDate(date,{month:'long',year:'numeric'});
  const mobileDateButton=(day,showWeekday=false)=>{
    const count=dayEvents(day).length;
    const label=fullDay(day)+(count?`, ${count} événement${count>1?'s':''}`:'');
    return `<button class="${day===date?'selected':''}" aria-pressed="${day===date}" aria-label="${label}" onclick="pickAgendaDay('${day}')">
      ${showWeekday?`<small>${fmtDate(day,{weekday:'short'})}</small>`:''}
      <strong>${Number(day.slice(8))}</strong><span class="agenda-date-dot ${count?'has-events':''}" aria-hidden="true"></span></button>`;
  };
  const addButton=(day,compact=false)=>`<button class="${compact?'secondary':'primary'} tiny" aria-label="Ajouter un événement le ${fullDay(day)}" onclick="openCalendarEvent('${day}')">${compact?'+':'+ Ajouter'}</button>`;
  const mobileDay=day=>`<section class="agenda-day-summary ${day===date?'selected':''}">
    <div class="agenda-mobile-heading"><strong>${fullDay(day)}</strong>${addButton(day,view==='week')}</div>
    <div class="agenda-timeline">${dayEvents(day).map(e=>eventMarkup(e,true)).join('')||'<p class="empty">Aucun événement prévu.</p>'}</div></section>`;
  const weeklyDays=weekDays.filter(day=>day===date||hasEvents(day));
  return `<div class="agenda-shell card">
    <div class="agenda-toolbar"><div class="group agenda-desktop">${pager(-1,'Période précédente')}<strong>${fmtDate(date,{month:'long',year:'numeric'})}</strong>${pager(1,'Période suivante')}</div>
      ${viewPicker('agenda-desktop group')}
      <button class="secondary tiny agenda-desktop" onclick="pickAgendaDay(parisToday())">Aujourd’hui</button><button class="primary tiny agenda-desktop" onclick="openCalendarEvent('${date}')">+ Ajouter</button></div>
    <div class="agenda-desktop agenda-grid agenda-${view}">${view==='month'?'<span class="agenda-pad"></span>'.repeat(monthOffset):''}${days.map(day=>`<div class="agenda-cell ${day===date?'selected':''}">${dayButton(day)}${dayEvents(day).map(e=>eventMarkup(e)).join('')}</div>`).join('')}</div>
    <div class="agenda-mobile">
      ${viewPicker('agenda-mobile-views')}
      <div class="agenda-today-row"><button class="secondary tiny" onclick="pickAgendaDay(parisToday())">Aujourd’hui</button></div>
      <div class="agenda-mobile-nav">${pager(-1,'Période précédente')}<strong>${displayDate}</strong>${pager(1,'Période suivante')}</div>
      ${view==='month'?`<div class="agenda-month-picker">
        ${weekDays.map(day=>`<small>${fmtDate(day,{weekday:'short'})}</small>`).join('')}
        ${'<span aria-hidden="true"></span>'.repeat(monthOffset)}${monthDays.map(day=>mobileDateButton(day)).join('')}
      </div>`:view==='week'?`<div class="agenda-week-strip">${weekDays.map(day=>mobileDateButton(day,true)).join('')}</div>`:''}
      ${view==='week'?weeklyDays.map(mobileDay).join(''):mobileDay(date)}
    </div></div>`;
}
function openSessionFromCalendar(id,person){
  if(person)openModal('mission-info',id);
  else openSession(id);
}

const documentColumns=[['AUDIT','Audit'],['CADRAGE','Cadrage (Audit)'],['PROGRAMME','Programme PDF'],['SUPPORT','Support'],['BILANS','Bilan']];
function docCategory(d){const type=(d.type||'').toUpperCase(),title=(d.title||'').toLowerCase();if(type==='CADRAGE'||title.includes('cadrage'))return 'CADRAGE';if(type==='AUDIT')return 'AUDIT';if(type==='PROGRAMME')return 'PROGRAMME';if(type==='SUPPORT')return 'SUPPORT';if(type==='BILANS'||type==='BILAN')return 'BILANS';return type;}
function docConformity(d){if(d?.status==='Refusé')return 'refused';if(!d||!d.versions?.length||d.status==='À fournir')return 'miss';const file=d.versions.at(-1).filename||'';if(docCategory(d)==='PROGRAMME'&&!/\.pdf$/i.test(file))return 'part';return 'ok';}
function documentMatrix(f,person=false){let ds=db.deliverables.filter(d=>d.formationId===f.id&&(!person||(d.owner==='formateur'&&d.trainerId===state.trainerId)));let cols=(person?[...new Set(ds.map(docCategory))].map(key=>documentColumns.find(c=>c[0]===key)||[key,key]):documentColumns);return cols.map(([key,label])=>{let d=ds.find(d=>docCategory(d)===key);return {key,label,d,status:docConformity(d)};});}
function docStatsFor(f,person=false){let matrix=documentMatrix(f,person);let conform=matrix.filter(x=>x.status==='ok').length;let toCheck=matrix.filter(x=>x.d?.versions?.length&&x.d.status!=='Validé').length;let verified=matrix.filter(x=>x.d?.status==='Validé').length;return {matrix,conform,toCheck,verified,missing:matrix.filter(x=>x.status==='miss').length,percentage:matrix.length?Math.round(100*conform/matrix.length):0};}
function matrixStatus(x){let icon=x.status==='ok'?mobileIcon('check',15):x.status==='part'?'~':mobileIcon('close',15),word=x.status==='refused'?'Refusé':x.status==='ok'?'Présent et conforme':x.status==='part'?'Présent, format non conforme':'Manquant';return `<span class="v19-marker ${x.status}" title="${esc(x.label+': '+word)}" aria-label="${esc(x.label+': '+word)}">${icon}</span>`;}
function deliverableTitle(doc) {
  return doc.id?`<button type="button" class="document-title document-link" onclick="openModal('document-preview','${esc(doc.id)}')">${esc(doc.title)}</button>`:`<strong>${esc(doc.title)}</strong>`;
}
function docGridRow(f){let stats=docStatsFor(f);return `<tr><td><strong>${esc(clientOf(f).name)}</strong><div class="item-sub">${esc(f.title)} · ${formationDates(f.id)}</div><button class="ghost tiny" onclick="openFolder('${f.id}')">Dossier ↗</button></td>${stats.matrix.map(x=>`<td style="text-align:center"><button class="v19-marker-button" onclick="openDocumentCell('${f.id}','${x.key}')" aria-label="Voir ${esc(x.label)} pour ${esc(clientOf(f).name)}">${matrixStatus(x)}${x.d?'<small class="v19-view-label">Voir</small>':''}</button></td>`).join('')}<td><strong>${stats.conform}/5</strong>${progress(stats.percentage,'Complétude '+clientOf(f).name)}<small>${stats.verified} validé(s) · ${stats.toCheck} à vérifier</small></td></tr>`;}
function docMobileCard(f){let st=docStatsFor(f),name=clientOf(f).name;return `<div class="card v19-mobile-doc"><div class="card-head"><div><h3 class="section-title">${esc(name)}</h3><p class="section-caption">${esc(f.title)}</p><p class="item-sub">${formationDates(f.id)}</p></div>${badge(st.percentage===100?'Complet':'Incomplet')}</div><div class="v19-mini-status">${st.matrix.map(x=>`<button class="v19-marker-button" aria-label="Voir ${esc(x.label)}" onclick="openDocumentCell('${f.id}','${x.key}')">${matrixStatus(x)}<small>${esc(x.key==='PROGRAMME'?'Prog.':x.key==='CADRAGE'?'Cadrage':x.label)}</small></button>`).join('')}</div><div class="folder-progress"><strong>${st.percentage}%</strong><span>${st.conform}/5 conformes · ${st.toCheck} à vérifier</span></div>${progress(st.percentage,name)}<div class="v19-inline-counts"><span>${st.missing} manquants</span><span>${st.verified} validés</span></div><button class="primary" style="width:100%" onclick="openFolder('${f.id}')">Voir les documents ↗</button></div>`;}
function docDate(f){let dates=db.sessions.filter(s=>s.formationId===f.id).map(s=>s.date).sort();let later=dates.filter(d=>d>=parisToday());return later[0]||dates.at(-1)||'';}
function setDocSort(value){state.docSort=value;render();}

function docLine(d,person=false){let latest=d.versions.at(-1),canUpload=person&&d.owner==='formateur'&&d.trainerId===state.trainerId;return `<div class="doc-row"><span class="doc-icon">${mobileIcon('docs',16)}</span><div class="grow"><button class="document-title" onclick="openModal('document-preview','${d.id}')">${esc(d.title)}</button><div class="item-sub">${person?(d.owner==='interne'?'AMO':latest?.uploader==='amo'?'Déposé par l’AMO':'Formateur'):esc(d.type)} · ${latest?'Version '+latest.number+' · '+esc(latest.filename):'Aucune version déposée'}</div></div>${badge(d.status)}${canUpload?`<button class="ghost" onclick="openModal('upload','${d.id}')">${latest?'Nouvelle version':'Déposer'} ↗</button>`:!person&&['Déposé','En vérification','Refusé'].includes(d.status)?`<button class="ghost" onclick="openModal('review','${d.id}')">Vérifier ↗</button>`:''}</div>`}
function documentsPage(){
 const ds=db.deliverables;
 const opts=[['all','Tous les dossiers'],['open','Incomplets'],['completed','Complets']];
 let list=formations.filter(f=>{const st=docStatsFor(f);return (state.filter==='all'||(state.filter==='open'&&st.percentage<100)||(state.filter==='completed'&&st.percentage===100))&&(f.title+' '+clientOf(f).name).toLowerCase().includes(state.search.toLowerCase());});
 if(state.docSort==='name')list.sort((a,b)=>clientOf(a).name.localeCompare(clientOf(b).name,'fr'));
 else if(state.docSort==='worst')list.sort((a,b)=>docStatsFor(a).percentage-docStatsFor(b).percentage);
 else list.sort((a,b)=>docDate(a).localeCompare(docDate(b)));
 const totals=formations.map(f=>docStatsFor(f)),full=totals.filter(t=>t.percentage===100).length;
 const buttons=`<div class="toolbar v19-doc-tools"><div class="group"><button class="${state.docSort==='calendar'?'primary':'secondary'} tiny" onclick="setDocSort('calendar')">Calendrier</button><button class="${state.docSort==='worst'?'primary':'secondary'} tiny" onclick="setDocSort('worst')">Les plus incomplets</button><button class="${state.docSort==='name'?'primary':'secondary'} tiny" onclick="setDocSort('name')">A à Z</button></div><button class="secondary tiny" onclick="flash('Google Drive et Agenda non connectés dans la démo')">Revérifier (démo)</button></div>`;
 const totalCards=`<div class="v19-doc-summary"><div class="card"><small>Dossiers complets</small><strong>${full}/${formations.length}</strong></div>${documentColumns.map(([key,label])=>{let n=formations.filter(f=>docStatsFor(f).matrix.find(x=>x.key===key)?.status==='ok').length;return `<div class="card"><small>${esc(label)}</small><strong>${n}/${formations.length}</strong></div>`}).join('')}</div>`;
 const grouped=(label,items)=>items.length?`<h3 class="v19-doc-group">${label} <small>${items.length}</small></h3><div class="v19-mobile-docs">${items.map(docMobileCard).join('')}</div>`:'';
 const coming=list.filter(f=>db.sessions.some(s=>s.formationId===f.id&&s.status!=='Réalisée'));
 const past=list.filter(f=>!coming.includes(f));
 return `${intro('Livrables <em>& bilans.</em>','Dossiers clients, à préparer et à boucler : présence, conformité, validation et relances.')}
 <div class="toolbar"><span class="badge purple">Données fictives · Google Drive non connecté</span></div>
 ${totalCards}
 ${amoTrainerFeedback()}
 ${filtersBar('Rechercher un client ou une formation…',opts)}${buttons}
 <div class="v19-doc-desktop"><div class="table-wrap"><table class="tbl v19-matrix"><thead><tr><th>Client</th>${documentColumns.map(x=>`<th>${esc(x[1])}</th>`).join('')}<th>Complétude</th></tr></thead><tbody>${list.map(docGridRow).join('')||'<tr><td colspan="7">Aucun dossier.</td></tr>'}</tbody></table></div></div>
 <div class="v19-doc-mobile">${grouped('À venir, à préparer',coming)}${grouped('Déjà formés',past)}${list.length?'':'<div class="empty">Aucun dossier.</div>'}</div>
 <div class="v19-doc-legend"><span>${matrixStatus({status:'ok',label:'Conforme'})} Présent conforme</span><span>${matrixStatus({status:'part',label:'Non conforme'})} Format non conforme</span><span>${matrixStatus({status:'miss',label:'Manquant'})} À fournir</span><span>${matrixStatus({status:'refused',label:'Refusé'})} Refusé</span></div>
 <p class="footnote">Une coche atteste la conformité de présence/format dans cette démo, pas la validation métier du contenu. Les fichiers n'ont pas été vérifiés sur Google Drive.</p>
 <div class="card" style="margin-top:18px">${cardTitle('Suivi des relances','Rappel PWA puis WhatsApp 48 h après : démonstration uniquement')}${db.reminders.map(r=>`<div class="line-item"><div class="grow"><strong>${esc(db.deliverables.find(d=>d.id===r.deliverableId)?.title||'Livrable')}</strong><div class="item-sub">${esc(r.channel)} · ${esc(r.status)}${r.followUp?' · WhatsApp : '+esc(r.followUp):''} · ${esc(r.at)}</div></div></div>`).join('')||'<div class="empty">Aucune relance.</div>'}<button class="secondary tiny" onclick="simulateDueReminders()">Vérifier les rappels</button> <button class="secondary tiny" onclick="testReminderAfter48h()">Tester 48 h (démo)</button></div>`;
}
function openFolder(id){state.selectedDocGroup=id;openModal('folder',id)}
function simulatePwaReminder(id){if(state.role!=='amo')return;let d=db.deliverables.find(x=>x.id===id);if(!d||d.status!=='À fournir'||d.versions?.length>0)return flash('Livrable déjà déposé ou non éligible');if(d.owner!=='formateur')return flash('Relance formateur non applicable');if(db.reminders.some(r=>r.deliverableId===id&&r.channel==='PWA'))return flash('Premier rappel déjà envoyé dans la démo');db.reminders.push({id:'R'+Date.now(),deliverableId:id,channel:'PWA',status:'Simulée — non envoyée',followUp:'En attente',at:new Date().toISOString()});log('Rappel PWA simulé',id);closeModal();flash('Notification PWA simulée · aucun push réel')}
function simulateDueReminders(silent=false){
  const count=recordReminderResolution();
  if(!silent){
    render();
    flash(count?count+' seconde(s) relance(s) WhatsApp simulée(s)':'Aucune seconde relance éligible après 48 h');
  }
  return count;
}
function testReminderAfter48h(){
  if(state.role!=='amo')return;
  const reminder=db.reminders.find(r=>r.channel==='PWA'&&!['Annulée','Terminée'].includes(r.followUp)&&!db.reminders.some(other=>other.deliverableId===r.deliverableId&&other.channel==='WhatsApp'));
  if(!reminder)return flash('Aucune relance en attente du délai de 48 h.');
  reminder.at=new Date(Date.now()-49*3600000).toISOString();
  save();
  simulateDueReminders();
}
function docFolder(id,person=false){
 const f=formations.find(x=>x.id===id);if(!f)return '<div class="empty">Dossier introuvable.</div>';
 const docs=db.deliverables.filter(d=>d.formationId===id&&(!person||(d.owner==='formateur'&&d.trainerId===state.trainerId)));
 const st=docStatsFor(f,person);
 const top=`<div class="folder-header"><strong>${esc(clientOf(f).name)} · ${esc(f.title)}<small class="item-sub"> · ${formationDates(f.id)}</small></strong><span>${st.percentage}% conformes</span></div>${progress(st.percentage,'Dossier '+clientOf(f).name)}<div class="v19-inline-counts"><span>${st.missing} manquant(s)</span><span>${st.toCheck} à vérifier</span><span>${st.verified} validé(s)</span></div>`;
 const documentItem=d=>({d,key:docCategory(d),label:d.title,status:docConformity(d)});
 const items=person?docs.map(documentItem):[
   ...st.matrix.flatMap(item=>{
     const category=docs.filter(d=>docCategory(d)===item.key);
     return category.length?category.map(documentItem):[item];
   }),
   ...docs.filter(d=>!st.matrix.some(item=>item.key===docCategory(d))).map(documentItem)
 ];
 return top+items.map(item=>{const d=item.d;let detail=d?.versions.at(-1),isOwner=d?.owner==='formateur'&&d.trainerId===state.trainerId;
 return `<div class="doc-row"><span>${matrixStatus(item)}</span><div class="grow">${d?deliverableTitle(d):`<strong>${esc(item.label)}</strong>`}<div class="item-sub">${d?fmtDate(sessionById(d.sessionId)?.date)+' · ':''}${d?esc(d.status)+' · '+d.versions.length+' version(s) · Échéance '+fmtDate(d.dueDate):'Aucun livrable référencé dans cette catégorie'}</div>${detail?`<div class="item-sub">Dernière version : ${esc(detail.filename)}</div>`:''}</div><div class="action-wrap">${person?(isOwner?`<button class="secondary tiny" onclick="openModal('upload','${d.id}')">Déposer</button>`:''):d?`<button class="secondary tiny" onclick="openModal('upload-internal','${d.id}')">Déposer</button>${d.versions.length?`<button class="secondary tiny" onclick="openModal('review','${d.id}')">Vérifier</button>`:''}${d.owner==='formateur'&&d.status==='À fournir'?`<button class="secondary tiny" onclick="simulatePwaReminder('${d.id}')">Rappel PWA</button>`:''}`:`<button class="secondary tiny" onclick="prepareMissingDoc('${f.id}','${item.key}')">Créer et déposer</button>`}</div></div>`;
 }).join('')+(person?'':amoTrainerFeedback(id))+`<p class="footnote">Les fichiers déposés sont conservés dans ce navigateur.</p>`;
}
function prepareMissingDoc(id,key,sessionId){if(state.role==='formateur')return flash('Accès réservé à l’équipe interne');let f=formations.find(x=>x.id===id),type=documentColumns.find(x=>x[0]===key);if(!f||!type||(sessionId&&sessionById(sessionId)?.formationId!==id))return flash('Type inconnu');let existing=db.deliverables.find(d=>d.formationId===id&&(!sessionId||d.sessionId===sessionId)&&docCategory(d)===key);if(existing)return openModal('upload-internal',existing.id);let did='D'+(Math.max(0,...db.deliverables.map(d=>Number(String(d.id).slice(1))||0))+1);db.deliverables.push({id:did,formationId:id,sessionId:sessionId||f.sessionIds[0],title:type[1],type:key,owner:'interne',status:'À fournir',versions:[]});log('Livrable manquant créé en démo',`${did} · ${key}`);openModal('upload-internal',did);}
function reportingPage(){let report=monthlyReport(),month=state.monthlyMonth,within=s=>s.date?.startsWith(month),ss=db.sessions.filter(within),aa=db.assignments.filter(a=>ss.some(s=>s.id===a.sessionId)&&['Confirmée','Réalisée'].includes(a.status)),d=db.deliverables.filter(x=>ss.some(s=>s.id===x.sessionId)),delivered=d.filter(x=>x.versions.length>0),onTime=delivered.filter(x=>x.versions.at(-1)?.at&&x.versions.at(-1).at.slice(0,10)<=x.dueDate).length;let perTrainer=trainers.map(t=>{let assignments=aa.filter(a=>a.trainerId===t.id),rate=reliabilityScore(t);return {t,assignments,rate}}).filter(x=>x.assignments.length>0);return `${intro('Monthly <em>AMO.</em>','Reporting mensuel des formations, du staffing, du NPS, des cartons et de la ponctualité documentaire.')}<div class="toolbar"><div class="group"><label for="report-month">Période</label><input id="report-month" class="field" type="month" value="${esc(month)}" onchange="state.monthlyMonth=this.value;render()"><button class="primary tiny" onclick="exportMonthlyChart()">Télécharger le rapport animé</button><button class="secondary tiny" onclick="exportMonthlyTable()">Télécharger le tableau</button><button class="secondary tiny" onclick="exportMonthly()">Exporter le CSV</button></div><span class="badge purple">Données fictives · pondérations non validées</span></div><div class="cards">${metric('Sessions',ss.length,'Dans la période')}${metric('Affectations',aa.length,'Confirmées / réalisées')}${metric('Formateurs mobilisés',perTrainer.length,'Profils distincts')}${metric('Livrables déposés',delivered.length+'/'+d.length,'Sur la période')}${metric('Bonus du mois',report.bonuses.length,report.bonusPoints+' points attribués')}</div>${monthlyBonusPanel(report)}${preparationPanel(report.preparation)}<div class="two-col"><div class="card">${cardTitle('Activité des formateurs','Missions et clients couverts sur la période')}<div class="table-wrap"><table class="tbl monthly-report-table"><thead><tr><th>Formateur</th><th>Missions</th><th>Clients</th><th>NPS indicatif</th></tr></thead><tbody>${perTrainer.map(x=>`<tr><td>${trainerName(x.t)}</td><td>${x.assignments.length}</td><td>${[...new Set(x.assignments.map(a=>clientOf(formOf(sessionById(a.sessionId))).name))].map(esc).join(', ')}</td><td>${trainerProfileField(x.t.id).nps??'Non renseigné'}</td></tr>`).join('')||'<tr><td colspan="4">Aucune affectation dans la période</td></tr>'}</tbody></table></div></div><div class="card">${cardTitle('Ponctualité et fiabilité','Échantillon fictif, ne sert pas à évaluer des personnes réelles')}<div class="line-item"><div class="grow">Livrables déposés avant échéance (données disponibles)</div><strong>${delivered.length?Math.round(onTime/delivered.length*100)+'%':'Non mesurable'}</strong></div><div class="line-item"><div class="grow">Pool Numéro 10 (référentiel fictif)</div><strong>${trainers.filter(t=>t.rating.includes('Numéro 10')).length}</strong></div><div class="line-item"><div class="grow">Cartons rouges</div><strong>${trainers.filter(t=>trainerProfileField(t.id).redCard).length}</strong></div><p class="footnote">Le score de fiabilité avec bonus/malus est une grille proposée, non validée ni appliquée. Les évaluations par mission et causes des retards restent nécessaires pour des résultats fiables.</p></div></div><div class="card" style="margin-top:18px">${cardTitle('Grille proposée de fiabilité','À valider métier avant tout score calculé ou décision')}<div class="table-wrap"><table class="tbl monthly-report-table"><thead><tr><th>Critère</th><th>Poids proposé</th><th>Base de calcul attendue</th></tr></thead><tbody><tr><td>Ponctualité des livrables</td><td>30 %</td><td>Versions déposées avant échéance et responsabilités identifiées</td></tr><tr><td>NPS et satisfaction</td><td>40 %</td><td>Évaluations contextualisées par session</td></tr><tr><td>Retours de mission</td><td>10 %</td><td>Débriefs et incidents vérifiés</td></tr><tr><td>Incidents vérifiés</td><td>20 %</td><td>Justifications, sources et possibilité de rectification</td></tr></tbody></table></div><p class="footnote">Aucun bonus ou malus réel calculé ou appliqué. Les critères peuvent être modifiés après concertation.</p></div>`}
function toggleTrainerHomeAgenda(){
  state.trainerHomeAgendaOpen=!state.trainerHomeAgendaOpen;
  render();
  $('trainer-home-agenda-toggle')?.focus({preventScroll:true});
}

function trainerHomeAgenda(){
  return `<section id="trainer-home-agenda" class="trainer-home-agenda" aria-label="Mon agenda" ${state.trainerHomeAgendaOpen?'':'hidden'}>${state.trainerHomeAgendaOpen?calendarUI(true):''}</section>`;
}

function trainerHome(){
  const t=trainerById(state.trainerId);
  const today=parisToday();
  const proposals=db.proposals.filter(p=>p.trainerId===t.id&&p.status==='Envoyée');
  const missions=trainerMissionsInCalendar(t.id).filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  const next=missions[0];
  const docs=trainerDocuments().filter(d=>['À fournir','Refusé'].includes(d.status));
  const finished=db.assignments.filter(a=>a.trainerId===t.id&&a.status==='Réalisée').length;
  return `<section class="amo-hero trainer-hero"><div><div class="eyebrow">${fmtDate(today,{weekday:'long',day:'numeric',month:'long'})}</div><h1 class="headline">Bonjour <em>${esc(t.name.split(' ')[0])}</em></h1><p>${proposals.length} proposition(s) à examiner · ${docs.length} livrable(s) à traiter</p></div>
    <div class="amo-next"><small>PROCHAINE MISSION</small>${next?`<strong>${esc(next.title)}</strong><span>${fmtDate(next.date)} · ${next.start}</span><button class="secondary tiny" onclick="openModal('mission-info',${next.id})">Voir la mission</button>`:'<strong>Aucune mission à venir</strong>'}</div></section>
    <div class="home-shortcuts"><button id="trainer-home-agenda-toggle" class="secondary tiny" aria-expanded="${Boolean(state.trainerHomeAgendaOpen)}" aria-controls="trainer-home-agenda" onclick="toggleTrainerHomeAgenda()">${mobileIcon('calendar',17)} Mon agenda</button><button class="secondary tiny" onclick="go('trainer-docs')">${mobileIcon('docs',17)} Mes livrables</button></div>
    ${trainerHomeAgenda()}
    <div class="overview-metrics">${metric('Propositions',proposals.length,'À examiner','trainer-missions','proposals')}${metric('Livrables',docs.length,'À traiter','trainer-docs','open')}${metric('Missions réalisées',finished,'Terminées','trainer-missions','finished')}${metric('NPS moyen',trainerNps(t.id),'Évaluations disponibles')}</div>
    <div class="overview-grid"><section class="card">${cardTitle('À traiter en priorité')}
      ${proposals.map(p=>`<div class="priority-row"><div><strong>${esc(clientOf(formOf(sessionById(p.sessionId))).name)}</strong><div class="item-sub">Proposition de mission</div></div><button class="primary tiny" onclick="dashboardGo('trainer-missions','proposals')">Répondre</button></div>`).join('')}
      ${docs.slice(0,4).map(d=>`<div class="priority-row"><div><strong>${esc(d.title)}</strong><div class="item-sub">${esc(d.status)} · ${fmtDate(d.dueDate)}</div></div><button class="secondary tiny" onclick="openModal('document-preview','${d.id}')">Ouvrir</button></div>`).join('')}
      ${!proposals.length&&!docs.length?'<p class="empty">Aucune action en attente.</p>':''}</section>
    <section class="card">${cardTitle('Prochaines missions')}
      ${missions.map(s=>`<button class="line-item clickable-row" onclick="openModal('mission-info',${s.id})"><span class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></span><span class="grow"><strong>${esc(s.title)}</strong><span class="item-sub">${esc(formOf(s).title)} · ${s.start}–${s.end}</span></span>${badge(s.status)}<span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucune mission à venir.</p>'}
    </section></div>`;
}
function trainerMissions(){let tid=state.trainerId,props=db.proposals.filter(p=>p.trainerId===tid),aa=db.assignments.filter(a=>a.trainerId===tid&&['Confirmée','Réalisée','À revalider'].includes(a.status)),tab=state.missionTab;return `${intro('Mes <em>missions.</em>','Propositions, missions confirmées et préparation, sans affichage des informations internes.','ESPACE FORMATEUR')}${missionPicker(tab,props,aa)}${tab==='proposals'?`<div class="card">${cardTitle('Propositions reçues','Une proposition acceptée apparaît dans votre agenda')}${props.map(p=>{let s=sessionById(p.sessionId);return `<div class="line-item pd-mission-row"><div class="grow"><strong>${esc(clientOf(formOf(s)).name)} — ${esc(formOf(s).title)}</strong><div class="item-sub">${fmtDate(s.date)} · ${s.start}–${s.end} · ${esc(s.city)} · ${esc(p.conditions)}</div></div>${badge(p.status)}${p.status==='Envoyée'&&proposalPastDue(p)?'<span class="item-sub">Délai de réponse dépassé</span>':p.status==='Envoyée'?`<div class="action-wrap"><button class="primary tiny" onclick="respondProposal('${p.id}','Acceptée')">Accepter</button><button class="secondary tiny" onclick="respondProposal('${p.id}','Refusée')">Refuser</button></div>`:''}${p.status==='Acceptée'?`<span class="item-sub">Dans votre agenda · confirmation AMO en attente</span>${missionDocumentSummary(s)}<button class="ghost" onclick="openModal('mission-info',${s.id})">Informations client</button><button class="ghost" onclick="openTrainerFolder(${s.id})">Ouvrir le dossier</button>`:''}</div>`}).join('')||'<div class="empty">Aucune proposition.</div>'}</div>`:`<div class="card">${cardTitle(tab==='upcoming'?'Missions confirmées':tab==='prepare'?'Préparation de mes missions':'Missions terminées')}${aa.filter(a=>missionMatchesTab(a,tab)).map(a=>{let s=sessionById(a.sessionId);return `<div class="line-item pd-mission-row"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${esc(formOf(s).title)} · ${esc(s.city)} · ${s.start}–${s.end}</div></div>${badge(a.status)}${missionDocumentSummary(s)}<button class="ghost" onclick="openModal('mission-info',${s.id})">Informations client</button><button class="ghost" onclick="openTrainerFolder(${s.id})">Ouvrir le dossier</button></div>`}).join('')||'<div class="empty">Aucune mission dans cette catégorie.</div>'}</div>`}`}
function trainerCalendar(){
  const slots=db.availability.filter(a=>a.trainerId===state.trainerId).sort((a,b)=>b.date.localeCompare(a.date)||(a.start||'').localeCompare(b.start||''));
  return `<h1 class="headline">Mon agenda</h1>
    <section class="card calendar-connection" aria-label="Connexion Google Agenda">
      <span class="calendar-connection-icon">${mobileIcon('calendar',22)}</span>
      <div class="grow"><strong>Google Agenda</strong><div class="item-sub">Non connecté</div></div>
      <button class="secondary tiny" onclick="openModal('google-calendar')">Connexion</button>
    </section>${calendarUI(true)}
    <section class="card agenda-slots">${cardTitle('Créneaux déclarés')}
      ${(state.slotsExpanded?slots:slots.slice(0,4)).map(a=>`<button class="line-item clickable-row" onclick="openCalendarEvent('${a.date}','${a.id}',true)"><span class="grow"><strong>${fmtDate(a.date)}</strong><span class="item-sub">${a.start?`${esc(a.start)}–${esc(a.end)}`:'Journée entière'}${a.zone?' · '+esc(a.zone):''}</span></span>${badge(a.status)}<span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucun créneau déclaré.</p>'}
      ${slots.length>4?`<button class="secondary tiny" aria-expanded="${state.slotsExpanded}" onclick="changeTab('slotsExpanded',${!state.slotsExpanded})">${state.slotsExpanded?'Voir moins':`Voir plus (${slots.length-4})`}</button>`:''}
    </section>`;
}
function trainerProfile(){
  const t=trainerById(state.trainerId);
  const p=db.profiles?.[t.id]||{};
  const field=(label,name,value,type='text',required=false)=>`<label>${label}<input class="field" name="${name}" type="${type}" autocomplete="${({name:'name',city:'address-level2',email:'email',phone:'tel',linkedin:'url'})[name]||'off'}" value="${esc(value)}" ${required?'required':''}></label>`;
  const detail=(label,value)=>`<div class="info"><small>${label}</small><strong>${esc(value||'—')}</strong></div>`;
  return `<h1 class="headline">${state.profileEdit?'Modifier mon profil':'Mon profil'}</h1><div class="card profile-intro profile-edit-hero ops-profile-header">${trainerAvatar(t,64)}<div><strong>${trainerName(t)}</strong><div class="item-sub">${esc(t.city)}</div></div>
    ${state.profileEdit?'':`<button class="primary tiny" onclick="changeTab('profileEdit',true)">Modifier mon profil</button>`}</div>
    ${state.profileEdit?`<form class="profile-grid profile-editor ops-trainer-profile" onsubmit="event.preventDefault();saveTrainerProfile(this)">
      <section class="card">${cardTitle('Identité et coordonnées','Les informations utilisées pour vos missions.')}<div class="form-grid">
      ${field('Nom complet','name',t.name,'text',true)}${field('Ville','city',t.city,'text',true)}${field('Adresse e-mail','email',t.email,'email',true)}${field('Téléphone','phone',p.phone,'tel')}</div><div class="profile-picture-editor"><div class="profile-picture-preview" aria-hidden="true">${trainerAvatar(t,54)}</div><div><strong>Photo de profil</strong><p class="item-sub">Choisissez une image JPG, PNG ou WebP sur votre appareil.</p></div></div>
      <div class="profile-photo-upload"><label for="profile-photo-file">Importer une photo</label><input id="profile-photo-file" type="file" accept="image/jpeg,image/png,image/webp" onchange="selectProfilePhoto(this.files[0])"><small id="profile-photo-status" role="status"></small></div></section>
      <section class="card">${cardTitle('Profil professionnel','Présentez vos compétences et votre expérience.')}<div class="form-grid">
      ${field('Expertises déclarées (séparées par des virgules)','skills',t.skills.join(', '))}${field('LinkedIn','linkedin',p.linkedin,'url')}${field('Formations','education',p.education)}${field('Projets','projects',p.projects)}${field('Préférences de déplacement','mobility',p.mobility)}
      <label class="profile-wide">Présentation<textarea class="field" name="bio" rows="4">${esc(p.bio)}</textarea></label></div></section>
      <div class="profile-actions"><button type="button" class="secondary" onclick="changeTab('profileEdit',false)">Annuler</button><button class="primary">Enregistrer</button></div>
    </form>`:`<div class="profile-grid ops-trainer-profile"><section class="card">${cardTitle('Coordonnées')}<div class="info-grid"><div class="info"><small>E-mail</small>${safeContact(t.email,'email')}</div><div class="info"><small>Téléphone</small>${safeContact(p.phone,'phone')}</div>${detail('Ville',t.city)}<div class="info"><small>LinkedIn</small>${linkSafe(p.linkedin,'Ouvrir le profil')}</div></div></section>
      <section class="card">${cardTitle('Expérience et expertises')}<div class="profile-columns">${[...professionalFacts(t,trainerProfileField(t.id)),['Présentation',p.bio]].map(([label,value])=>professionalFactCard(label,value)).join('')}</div></section>
      <section class="card">${cardTitle('Mes indicateurs')}${detail('Ponctualité documentaire',personalPunctuality(t.id))}${communicableMissionRatings(t.id)}</section>
      <section class="card ops-demo-role">${cardTitle('Profil de démonstration')}<label for="ops-return-amo">Changer d’espace</label>
      <select class="field" id="ops-return-amo" onchange="setRole(this.value)"><option value="trainer-${t.id}">Espace Formateur</option><option value="amo">Espace AMO</option></select></section></div>`}`;
}

function missionAuditDisplay(s){let d=db.deliverables.find(d=>d.formationId===s.formationId&&docCategory(d)==='AUDIT');let ready=!!d?.versions?.length;return `<div class="info"><small>Audit client</small><strong>${ready?'Reçu — démo':'En attente'}</strong><p class="item-sub">${ready?'Audit référencé dans le dossier : accès réel au document après connexion Drive.':'L’audit n’a pas encore été reçu pour cette mission.'}</p></div>`;}
function missionPublicFeedback(s){let a=db.assignments.find(a=>a.sessionId===s.id&&a.trainerId===state.trainerId),r=a&&missionRatings[a.id];if(!r||!r.public)return '<div class="info"><small>Retour client</small><strong>Pas encore communiqué</strong></div>';return `<div class="info"><small>Évaluations communicables — données fictives</small><strong>NPS ${esc(r.nps??'—')}/10 · Note Certif ${esc(r.certif??'—')}/10 · Participants ${esc(r.participants??'—')}/10</strong><p class="item-sub">Mission ${esc(r.period)} · Ponctualité documentaire : à mesurer.</p></div>`;}

function modalView(){let m=state.modal,out='';if(m.kind==='reschedule'||m.kind==='edit-session'){let s=sessionById(m.id),assigned=activeAssignments(s.id);out=modalBox('Modifier une session','Date, heures, lieu, modalité et affectations : toute modification substantielle exige une revalidation.',`<div class="form-grid"><label>Date<input class="field" id="new-date" type="date" value="${s.date}"></label><label>Début<input class="field" id="new-start" type="time" value="${s.start}"></label><label>Fin<input class="field" id="new-end" type="time" value="${s.end}"></label><label>Ville / lieu<input class="field" id="new-city" value="${esc(s.city)}"></label><label>Adresse (facultatif)<input class="field" id="new-address" value="${esc(s.address||'')}"></label><label>Modalité<select class="field" id="new-modality">${['Présentiel','Distanciel','Hybride'].map(v=>`<option ${s.modality===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Formateur principal<select class="field" id="new-trainer"><option value="">Ne pas modifier</option>${trainers.map(t=>`<option value="${t.id}" ${assigned.length&&assigned[0].trainerId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label></div><div class="notif">${assigned.length} affectation(s) existante(s). Après modification, leurs statuts seront « À revalider » si nécessaire. L'AMO doit contrôler la capacité et les conflits.</div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button class="primary" onclick="saveSessionEdit(${s.id})">Enregistrer les modifications (démo)</button></div>`)}
else if(m.kind==='prepare-proposal'&&state.role==='amo'){out=proposalModal()}
else if(m.kind==='whatsapp-draft'&&state.role==='amo'){out=whatsAppPanel(m.id)}
else if(m.kind==='amo-milestones'&&state.role==='amo'){out=amoMilestonesPanel()}
else if(m.kind==='agenda-conflicts'&&state.role==='amo'){out=agendaConflictPanel()}
else if(m.kind==='hub-search'){out=hubSearchPanel()}
else if(m.kind==='hub-settings'){out=hubSettingsPanel()}
else if(m.kind==='google-calendar'&&state.role==='formateur'){out=modalBox('Connexion Google Agenda','La connexion à un compte Google sera disponible quand la synchronisation aura été configurée.',`<div class="modal-actions"><button class="primary" onclick="closeModal()">Fermer</button></div>`)}
else if(m.kind==='trainer-feedback'){out=trainerFeedbackModal(m.id)}
else if(m.kind==='document-preview'){out=documentPreview(m.id)}
else if(m.kind==='amo-notifications'&&state.role==='amo'){out=operationsInboxPanel()}
else if(m.kind==='trainer-notifications'&&state.role==='formateur'){out=operationsInboxPanel()}
else if(m.kind==='trainer-staffing'&&state.role==='amo'){out=trainerStaffingPanel(m.id)}
else if(operationalDecisions.includes(m.kind)&&state.role==='amo'){out=staffDecisionPanel(m.kind,m.id)}
else if(m.kind==='agenda-formation'&&state.role==='amo'){out=agendaFormationDetails(m.id)}
else if(m.kind==='availability'||m.kind==='calendar-event'){out=calendarEventModal(m)}
else if(m.kind==='matching'){out=matchingDetailsModal(m.id)}
else if(m.kind==='folder'||m.kind==='trainer-folder'){out=modalBox('Dossier de livrables',m.kind==='folder'?'Gestion interne des documents et relances':'Documents attendus pour vos missions',docFolder(m.id,m.kind==='trainer-folder')+`<div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button></div>`)}
else if(m.kind==='mission-info'){let s=sessionById(m.id),f=formOf(s),c=clientOf(f),d=clientDetails[c.id];out=modalBox('Informations client pour la mission','Uniquement les informations utiles au formateur, sans notes internes confidentielles.',`<div class="info-grid">${[['Client',c.name],['Formation',f.title],['Date',fmtDate(s.date)],['Horaires',s.start+'–'+s.end],['Participants',s.people??'À préciser'],['Lieu',s.address||s.city],['Contact',d.contact],['Consignes',d.notesTrainer]].map(([k,v])=>`<div class="info"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div><div class="v19-mission-extra">${missionAuditDisplay(s)}${missionPublicFeedback(s)}</div><div class="modal-actions"><a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(mapsUrl(s.address,s.city))}">Ouvrir l'itinéraire ↗</a><button class="secondary" onclick="closeModal()">Fermer</button></div><p class="footnote">L’adresse précise est à renseigner ; ici le lien indique une ville fictive.</p>`)}
else if(m.kind==='upload'||m.kind==='upload-internal'){out=uploadPanel(m.id,m.kind==='upload-internal')}
else if(m.kind==='review'){let d=db.deliverables.find(x=>x.id===m.id);out=modalBox('Vérifier un livrable','Choisissez une décision pour la version déposée.',`<div class="info"><small>Livrable</small><strong>${esc(d.title)}</strong></div><label class="form-label" for="review-comment">Motif du refus (facultatif)</label><textarea class="field" id="review-comment" placeholder="Ajouter un motif…"></textarea><div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button class="secondary" onclick="reviewDoc('${d.id}','Refusé')">Refuser</button><button class="primary" onclick="reviewDoc('${d.id}','Validé')">Valider (démo)</button></div>`)}
return `<div class="modal-back" role="presentation" onclick="if(event.target===this)closeModal()"><div class="modal ${isOperationalModal(m.kind)?'ops-modal':''}" role="dialog" aria-modal="true" aria-label="${({'trainer-notifications':'Centre de notifications','amo-notifications':'Centre de notifications','prepare-proposal':'Préparer une proposition','whatsapp-draft':'Brouillon WhatsApp','amo-milestones':'Jalons AMO','agenda-conflicts':'Gestion des conflits','agenda-formation':'Formation','calendar-event':'Événement agenda','document-preview':'Détail du document','google-calendar':'Connexion Google Agenda','hub-settings':'Réglages'})[m.kind]||esc(m.kind)}"><button class="modal-close" aria-label="Fermer" onclick="closeModal()">×</button>${out}</div></div>`}
function saveSessionEdit(id){let s=sessionById(id),date=$('new-date')?.value,start=$('new-start')?.value,end=$('new-end')?.value,city=$('new-city')?.value.trim(),address=$('new-address')?.value.trim(),modality=$('new-modality')?.value,tid=Number($('new-trainer')?.value||0);if(!date||!start||!end||!city||end<=start)return flash('Date, horaires et lieu valides requis');let prev=JSON.stringify([s.date,s.start,s.end,s.city,s.address||'',s.modality]);let next=JSON.stringify([date,start,end,city,address,modality]);let changed=prev!==next;let current=activeAssignments(id);if(!changed&&(!tid||current.some(a=>a.trainerId===tid)))return flash('Aucune modification');const entry={date,start,end};const trainersToCheck=new Set([...current.map(a=>a.trainerId),...db.proposals.filter(p=>p.sessionId===s.id&&p.status==='Acceptée').map(p=>p.trainerId),...(tid?[tid]:[])]);if(date!==s.date||start!==s.start||end!==s.end){const conflict=calendarConflict(entry,null,{sessionId:s.id});if(conflict)return flash(conflict)}for(const trainerId of trainersToCheck){const conflict=calendarConflict(entry,trainerId,{sessionId:s.id,allowAvailable:true});if(conflict)return flash(conflict)}Object.assign(s,{date,start,end,city,address,modality});if(changed)s.staffingRevision=(s.staffingRevision||0)+1;if(changed||tid){current.forEach(a=>a.status='À revalider');if(tid&&!db.assignments.some(a=>a.sessionId===id&&a.trainerId===tid&&a.status==='À revalider'))db.assignments.push({id:'A'+Date.now(),sessionId:id,trainerId:tid,status:'À revalider'});}log('Modification de session démo',id+' · contrôle de revalidation requis');closeModal();flash('Modification simulée ; affectations à revalider')}
function modalBox(title,desc,content){return `<h2>${title}</h2><p>${desc}</p>${content}`}
function rescheduleSession(id){let el=$('new-date'),date=el?.value,s=sessionById(id);if(!date||!s)return flash('Date requise');if(s.date===date)return flash('La date est inchangée');let previous=s.date;s.date=date;db.assignments.filter(a=>a.sessionId===s.id&&a.status==='Confirmée').forEach(a=>a.status='À revalider');log('Report de session (démo)',`session ${id} : ${previous} → ${date}`);closeModal();flash('Session reportée ; affectations à revalider')}
async function simulateUpload(id,internal=false){
  const file=state.uploadFile||$('upload-file')?.files?.[0];
  if(!file)return flash('Sélectionnez un fichier.');
  const d=db.deliverables.find(x=>x.id===id);
  if(!d||(internal?state.role!=='amo':d.owner!=='formateur'||d.trainerId!==state.trainerId||!trainerCanReadDocument(d)))return flash('Action non autorisée.');
  const button=document.querySelector('.modal-actions .primary');
  if(button?.disabled)return;
  if(button)button.disabled=true;
  const fileKey=crypto.randomUUID();
  try{await documentStorage('readwrite',files=>files.put(file,fileKey))}
  catch(e){if(button)button.disabled=false;return flash('Le navigateur n’a pas pu enregistrer le fichier.')}
  d.versions.push({number:d.versions.length+1,filename:file.name,fileKey,uploader:internal?'amo':'formateur',status:'Déposé',at:new Date().toISOString()});
  d.status='Déposé';
  recordReminderResolution();
  log('Livrable déposé',id);
  state.uploadFile=null;openModal('document-preview',id);
  flash('Nouvelle version enregistrée.');
}
function reviewDoc(id,status){let d=db.deliverables.find(x=>x.id===id);if(state.role!=='amo'||!d||!d.versions.length)return flash('Aucune version à vérifier');let comment=$('review-comment')?.value.trim()||'';d.status=status;d.versions.at(-1).status=status;d.versions.at(-1).comment=status==='Refusé'?comment:'';recordReminderResolution();log('Vérification documentaire simulée',`${id} : ${status}`);closeModal();flash('Décision documentaire enregistrée (simulation)')}
function breadcrumbs(pageTitle){
  let items=[['Certif-IA',state.role==='formateur'?"go('trainer-home')":"go('home')"],[pageTitle]];
  if(['session-detail','formation-detail'].includes(state.page)){
    const session=state.page==='session-detail'?sessionById(state.selectedSession):null;
    const formation=session?formOf(session):formations.find(f=>f.id===state.selectedFormation);
    if(formation)items=[['Formations',"go('formations')"],[clientOf(formation).name,session?`openFormation('${formation.id}')`:null],...(session?[[`Session du ${fmtDate(session.date,{day:'numeric',month:'long'})}`]]:[])];
  }
  if(state.page==='trainer-folder'){
    const session=sessionById(state.selectedDocGroup);
    const formation=session?formOf(session):formations.find(f=>f.id===state.selectedDocGroup);
    items=[['Mes livrables',"go('trainer-docs')"],[formation?clientOf(formation).name:'Dossier']];
  }
  return `<nav class="bread breadcrumbs" aria-label="Fil d’Ariane">${items.map(([label,action])=>action?`<button onclick="${action}">${esc(label)}</button>`:`<span aria-current="page">${esc(label)}</span>`).join('<span class="crumb-divider" aria-hidden="true">/</span>')}</nav>`;
}

function trainerDocuments(){
  return db.deliverables.filter(d=>d.owner==='formateur'&&d.trainerId===state.trainerId);
}

function openTrainerFolder(id){
  state.selectedDocGroup=id;
  go('trainer-folder');
}

function trainerNpsValue(id){
  const scores=db.assignments.filter(a=>a.trainerId===id&&a.status==='Réalisée').map(a=>missionRatings[a.id]?.nps).filter(Number.isFinite);
  return scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:trainerProfileField(id).nps;
}

function trainerNps(id,value=trainerNpsValue(id)){
  return Number.isFinite(value)?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(value)+' / 10':'—';
}

function photoContent(t){
  const profile=db.profiles?.[t.id];
  const photo=profile?.uploadedPhoto||profile?.photo;
  return photo?`<img src="${esc(photo)}" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>${esc(t.initials)}</span>`:esc(t.initials);
}

function saveTrainerProfile(form){
  if(state.role!=='formateur')return;
  if(state.profilePhotoPending)return flash('La photo est en cours de préparation.');
  const data=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,value.trim()]));
  const previous=db.profiles?.[state.trainerId];
  const uploaded=state.profilePhotoDraft||previous?.uploadedPhoto;
  if(uploaded)data.uploadedPhoto=uploaded;else if(previous?.photo)data.photo=previous.photo;
  if(!data.name||!data.city||!data.email)return flash('Renseignez le nom, la ville et l’adresse e-mail.');
  if(data.linkedin&&!/^https:\/\//i.test(data.linkedin))return flash('Utilisez une adresse HTTPS pour LinkedIn.');
  data.skills=data.skills.split(',').map(skill=>skill.trim()).filter(Boolean);
  db.profiles||={};
  const before=db.profiles[state.trainerId];
  db.profiles[state.trainerId]=data;
  try{localStorage.setItem(DEMO_KEY,JSON.stringify({version:1,data:db}))}
  catch(e){if(before)db.profiles[state.trainerId]=before;else delete db.profiles[state.trainerId];return flash('Le navigateur ne peut pas enregistrer cette photo.')}
  state.profilePhotoDraft=null;
  state.profileEdit=false;
  render();
  flash('Profil enregistré.');
}

function pickAgendaDay(day){
  state.calendarDate=day;
  render();
}

function trainerMissionsInCalendar(trainerId){
  const result=new Map();
  const add=entry=>{
    const s=sessionById(entry.sessionId);
    if(s&&s.status!=='Annulée')result.set(s.id,{...s,title:clientOf(formOf(s)).name,status:entry.status==='Acceptée'?'Acceptée · à confirmer':entry.status,kind:'session'});
  };
  db.proposals.filter(p=>p.trainerId===trainerId&&p.status==='Acceptée').forEach(add);
  db.assignments.filter(a=>a.trainerId===trainerId&&['Confirmée','Réalisée','À revalider'].includes(a.status)).forEach(add);
  return [...result.values()];
}

function agendaEntriesOverlap(a,b){
  return a.date===b.date&&(a.start||'00:00')<(b.end||'24:00')&&(b.start||'00:00')<(a.end||'24:00');
}

function calendarConflict(entry,trainerId,options={}){
  const entries=(db.calendarEvents||[]).filter(e=>e.trainerId===trainerId&&e.id!==entry.id)
    .map(e=>options.maskPrivate&&trainerId!==null?{...e,title:'Créneau indisponible'}:e);
  if(trainerId===null)entries.push(...db.sessions.filter(s=>s.status!=='Annulée'&&s.id!==options.sessionId).map(s=>({...s,title:clientOf(formOf(s)).name})));
  if(trainerId!==null){
    entries.push(...trainerMissionsInCalendar(trainerId).filter(e=>e.id!==options.sessionId));
    entries.push(...db.availability.filter(a=>a.trainerId===trainerId&&a.id!==entry.id&&(!options.allowAvailable||a.status!=='Disponible')));
  }
  const conflict=entries.find(e=>agendaEntriesOverlap(entry,e));
  if(!conflict)return '';
  const time=conflict.start&&conflict.end?`${conflict.start}–${conflict.end}`:'journée entière';
  return `Conflit le ${fmtDate(entry.date)} avec « ${conflict.title||conflict.status} » (${time}). Choisissez un autre créneau.`;
}

function openCalendarEvent(date,id,slot=false,edit=false){
  const formation=!slot&&!edit&&state.role==='amo'&&
    (db.calendarEvents||[]).some(e=>e.trainerId===null&&e.id===id&&e.eventType==='formation');
  state.modal={kind:slot?'availability':formation?'agenda-formation':'calendar-event',id,date};
  render();
  $('agenda-event-form')?.querySelector('select,input')?.focus();
}

function calendarEventModal(modal){
  const trainer=state.role==='formateur';
  const owner=trainer?state.trainerId:null;
  const slot=modal.kind==='availability';
  const current=modal.id?(slot?db.availability:db.calendarEvents||[]).find(e=>e.id===modal.id&&e.trainerId===owner):null;
  if(modal.id&&!current)return modalBox('Événement introuvable','','');
  const status=current?.status||'Disponible';
  const type=slot||(!current&&trainer)?status:trainer?'event':current?.eventType||(current?'event':'formation');
  const event=['event','formation'].includes(type);
  return modalBox(current?'Modifier '+(slot?'le créneau':type==='formation'?'la formation':'le rendez-vous'):'Ajouter un événement','',`<form id="agenda-event-form" onsubmit="event.preventDefault();saveCalendarEvent(this)">
    <div class="form-grid">
      ${trainer?`<label>Type<select name="kind" class="field" onchange="calendarEventType(this.form)">${[['Disponible','Disponibilité'],['Occupé','Indisponibilité'],['event','Événement personnel']].filter(([key])=>!current||slot===(key!=='event')).map(([key,label])=>`<option value="${key}" ${type===key?'selected':''}>${label}</option>`).join('')}</select></label>`:`<label>Type<select name="kind" class="field" onchange="calendarEventType(this.form)">
        <option value="formation" ${type==='formation'?'selected':''}>Formation</option>
        <option value="event" ${type==='event'?'selected':''}>Autre événement</option>
      </select></label>`}
      <label>Date<input name="date" class="field" type="date" value="${esc(current?.date||modal.date||state.calendarDate)}" required></label>
      <label>Début<input name="start" class="field" type="time" value="${esc(current?.start||'09:00')}" required></label>
      <label>Fin<input name="end" class="field" type="time" value="${esc(current?.end||'17:00')}" required></label>
      <label class="profile-wide" id="event-title-label" ${event?'':'hidden'}>Titre<input name="title" class="field" value="${esc(current?.title)}" ${event?'required':''}></label>
      ${trainer?`<label class="profile-wide" id="event-zone-label" ${event?'hidden':''}>Zone (facultatif)<input name="zone" class="field" value="${esc(current?.zone)}"></label>`:''}
      ${slot&&current&&!current.start?'<label><input name="allDay" type="checkbox" checked> Journée entière</label>':''}
    </div>${trainer?'':agendaFormationFields(current,type==='formation')}<p id="agenda-error" class="agenda-error" role="alert"></p>
    <div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Annuler</button><button class="primary">Enregistrer</button></div>
  </form>`);
}

function calendarEventType(form){
  const kind=form.elements.kind.value;
  const event=['event','formation'].includes(kind);
  $('event-title-label').hidden=!event;
  const zone=$('event-zone-label');
  if(zone)zone.hidden=event;
  form.elements.title.required=event;
  const formation=$('agenda-formation-fields');
  if(formation){
    formation.hidden=kind!=='formation';
    formation.disabled=kind!=='formation';
  }
}

function saveCalendarEvent(form){
  const data=new FormData(form);
  const owner=state.role==='formateur'?state.trainerId:null;
  const kind=data.get('kind');
  const slot=owner!==null&&['Disponible','Occupé'].includes(kind);
  const allDay=slot&&data.has('allDay');
  const entry={id:state.modal.id||crypto.randomUUID(),trainerId:owner,date:data.get('date'),start:allDay?'':data.get('start'),end:allDay?'':data.get('end')};
  const error=message=>{$('agenda-error').textContent=message};
  if(!entry.date||(!allDay&&(!entry.start||!entry.end||entry.start>=entry.end)))return error('Choisissez une heure de fin après le début.');
  if(slot)Object.assign(entry,{status:kind,zone:data.get('zone').trim(),source:'déclaration'});
  else {
    entry.title=data.get('title').trim();
    if(!entry.title)return error('Renseignez un titre.');
    if(owner===null&&kind==='formation'){
      const fields=readAgendaFormation(data);
      if(fields.error)return error(fields.error);
      Object.assign(entry,fields);
    }
  }
  const conflict=calendarConflict(entry,owner);
  if(conflict)return error(conflict);
  const list=slot?db.availability:(db.calendarEvents||=[]);
  const index=list.findIndex(e=>e.id===entry.id&&e.trainerId===owner);
  if(index>=0)list[index]=entry;
  else list.push(entry);
  state.calendarDate=entry.date;
  if(entry.eventType==='formation')state.contactAgenda=true;
  save();
  closeModal();
  flash(slot?'Créneau enregistré.':entry.eventType==='formation'?'Formation enregistrée dans l’agenda AMO.':'Événement enregistré.');
}

function parisToday(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const part=type=>parts.find(x=>x.type===type).value;
  return [part('year'),part('month'),part('day')].join('-');
}

function latestTrainerReview(trainerId,kind){
  const matches=review=>review.trainerId===trainerId&&review.kind===kind;
 if(kind!=='carton')return db.internalReviews.findLast(matches);
 const active=review=>matches(review)&&isActiveCarton(review);
 return db.internalReviews.findLast(review=>active(review)&&review.level==='rouge')||db.internalReviews.findLast(active);
}

function trainerCardLevel(t){
  return latestTrainerReview(t?.id,'carton')?.level;
}

function trainerReviewButtons(t){
  if(state.role!=='amo')return '';
  const carton=trainerCardLevel(t);
  const bonusCount=db.internalReviews.filter(review=>review.trainerId===t.id&&review.kind==='bonus').length;
  if(!carton&&!bonusCount)return '';
  const button=(kind,label,icon)=>`<button type="button" class="secondary tiny trainer-review-button ${kind}" aria-label="${label} : voir le justificatif" title="${label} : voir le justificatif" onclick="openTrainerReview(${t.id},'${kind}')">${icon}</button>`;
  return `<span class="trainer-review-buttons">${['jaune','rouge'].includes(carton)?button('carton','Carton '+carton,`<span class="trainer-warning ${carton}" aria-hidden="true"></span>`):''}${bonusCount?button('bonus','Bonus',mobileIcon('bonus',16)+`<span aria-hidden="true">${bonusCount}</span>`):''}</span>`;
}

function openTrainerReview(trainerId,kind){
  if(state.role!=='amo')return;
  const record=latestTrainerReview(trainerId,kind);
  if(!record)return;
  state.trainerDetailTab='internal';
  if(state.page==='trainer-detail'&&state.selectedTrainer===trainerId)render();
  else openTrainer(trainerId);
  const reason=$('review-reason-'+record.id);
  reason?.focus({preventScroll:true});
  reason?.scrollIntoView({block:'center'});
}

function trainerOptionLabel(t){const level=state.role==='amo'?trainerCardLevel(t):null;return t.name+(level?' · Carton '+level:'')}

function trainerCardClass(t){
  if(state.role!=='amo')return '';
  const level=trainerCardLevel(t);
  return ['jaune','rouge'].includes(level)?`warning-${level}${state.freshCard===t.id?' warning-new':''}`:'';
}

function trainerName(t){
  const level=state.role==='amo'?trainerCardLevel(t):null;
  return esc(t?.name||'')+(['jaune','rouge'].includes(level)?` <span class="trainer-warning ${level}" role="img" aria-label="Carton ${level}" title="Carton ${level}"></span>`:'');
}

function activeProposal(sessionId,trainerId){
  return db.proposals.some(p=>p.sessionId===sessionId&&p.trainerId===trainerId&&!['Refusée','Expirée','Retirée'].includes(p.status));
}

function staffingAvailable(t,s){
  if(!t||!s||['Réalisée','Annulée'].includes(s.status)||t.rating.includes('À ne pas staffer'))return false;
  const slots=db.availability.filter(a=>a.trainerId===t.id&&a.date===s.date&&a.status==='Disponible')
    .sort((a,b)=>(a.start||'00:00').localeCompare(b.start||'00:00'));
  let covered=s.start;
  for(const slot of slots){
    if((slot.start||'00:00')>covered)break;
    if((slot.end||'24:00')>covered)covered=slot.end||'24:00';
  }
  return covered>=s.end&&!calendarConflict(s,t.id,{sessionId:s.id,allowAvailable:true});
}

function prepareProposal(id){
  const s=sessionById(state.selectedSession);
  if(state.role!=='amo')return;
  const block=staffingBlock(s,trainerById(id));
  if(block)return flash(block);
  if(activeProposal(s.id,id))return flash('Une proposition active existe déjà.');
  state.candidate=id;
  openModal('prepare-proposal');
}

function proposalModal(){
  const s=sessionById(state.selectedSession),t=trainerById(state.candidate);
  if(!s||!t)return '';
  return modalBox('Préparer une proposition',esc(clientOf(formOf(s)).name)+' · '+fmtDate(s.date)+' · '+esc(s.start+'–'+s.end),`
    <div class="info"><small>Formateur disponible</small><strong>${trainerName(t)}</strong></div>
    <div class="proposal-fields"><label for="proposal-amount">Montant journalier (€)<input class="field" type="number" id="proposal-amount" min="0.01" step="0.01" inputmode="decimal" value="${t.rate}"></label>
    <fieldset><legend>Modalités possibles</legend><div class="choice-pills">${['Présentiel','Visio'].map((mode,i)=>`<div class="proposal-choice"><input id="proposal-mode-${i}" type="checkbox" name="proposal-mode" value="${mode}" ${s.modality==='Hybride'||(s.modality==='Distanciel'?'Visio':'Présentiel')===mode?'checked':''}><label for="proposal-mode-${i}">${mode}</label></div>`).join('')}</div></fieldset></div>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button class="primary" onclick="createProposal()">Créer le brouillon</button></div>`);
}

function formationDates(id){
  const dates=[...new Set(db.sessions.filter(s=>s.formationId===id).map(s=>s.date))].sort();
  return dates.length?dates.map(date=>fmtDate(date)).join(' · '):'Date à préciser';
}

function sessionMilestones(s){
  return milestones.map(([label,name],i)=>({key:s.id+'-'+s.date+'-'+i,label,name,date:shiftDate(s.date,[-28,-14,-7,-3,-1,0,1,7][i]),session:s}));
}

function preparationCycle(sessions){
  const today=parisToday();
  const allSteps=amoMilestones();
  return sessions.map(s=>{
    const steps=allSteps.filter(step=>step.session.id===s.id);
    return `<details class="preparation-cycle" ${s===sessions.find(item=>item.date>=today)||sessions.length===1?'open':''}>
      <summary>Session du ${fmtDate(s.date)}</summary><div class="milestone-grid">
      ${steps.map(step=>`<div class="milestone ${step.status==='Validé'?'is-past':step.status==='À traiter'?'is-current':''}"><span class="milestone-date">${step.label} · ${fmtDate(step.date,{day:'numeric',month:'short'})}</span><strong>${step.name}</strong><small>${step.status} · ${esc(step.criterion)}</small></div>`).join('')}</div></details>`;
  }).join('');
}

function amoMilestones(){
  const today=parisToday();
  return db.sessions.filter(s=>s.status!=='Annulée').flatMap(s=>sessionMilestones(s).map((step,i)=>{
    const documents=db.deliverables.filter(d=>d.sessionId===s.id);
    const validated=key=>documents.some(d=>docCategory(d)===key&&d.status==='Validé');
    const staffingComplete=openCount(s)===0;
    const checks=[
      [validated('AUDIT'),'Audit validé'],
      [validated('CADRAGE'),'Cadrage validé'],
      [validated('PROGRAMME'),'Programme validé'],
      [staffingComplete&&validated('PROGRAMME'),'Staffing complet et programme validé'],
      [staffingComplete&&validated('SUPPORT'),'Staffing complet et support validé'],
      [false,'Confirmer l’envoi du questionnaire'],
      [false,'Confirmer le débrief'],
      [validated('BILANS'),'Bilan validé']
    ];
    const [automatic,criterion]=checks[i];
    const manual=i===5||i===6;
    const status=(automatic||(manual&&db.manualMilestones?.[step.key]))?'Validé':step.date<=today?'À traiter':'À venir';
    return {...step,status,criterion,manual};
  })).sort((a,b)=>a.date.localeCompare(b.date));
}

function amoMilestonesPanel(){
  const steps=amoMilestones();
  return modalBox('Jalons AMO','Suivi par session et par critère de validation.', ['À traiter','À venir','Validé'].map(status=>{
    const rows=steps.filter(s=>s.status===status);
    return `<details class="milestone-panel-group" ${status==='À traiter'?'open':''}><summary>${status} · ${rows.length}</summary>
      ${rows.map(step=>`<div class="line-item"><div class="grow"><strong>${esc(step.name)} · ${esc(clientOf(formOf(step.session)).name)}</strong><div class="item-sub">${step.label} · ${fmtDate(step.date)} · ${esc(step.criterion)}</div></div><div class="action-wrap">
      ${step.manual&&step.status!=='À venir'?`<button class="secondary tiny" onclick="toggleManualMilestone('${step.key}')">${step.status==='Validé'?'Annuler la validation':'Valider'}</button>`:''}
      <button class="ghost tiny" onclick="openFormation('${step.session.formationId}')">Voir la formation</button></div></div>`).join('')||'<p class="empty">Aucun jalon dans cette catégorie.</p>'}</details>`;
  }).join(''));
}

function toggleManualMilestone(key){
  const step=amoMilestones().find(x=>x.key===key);
  if(state.role!=='amo'||!step?.manual||step.status==='À venir')return;
  db.manualMilestones||={};
  db.manualMilestones[key]=!db.manualMilestones[key];
  save();
  render();
}


function openDocumentCell(formationId,category){
  if(state.role!=='amo')return;
  const doc=db.deliverables.find(d=>d.formationId===formationId&&docCategory(d)===category);
  openModal('document-preview',doc?.id||formationId+':'+category);
}

function documentPreview(id){
  const d=db.deliverables.find(x=>x.id===id);
  if(!d){
    if(state.role!=='amo')return '';
    const [formationId,category,sessionId]=String(id).split(':');
    const label=documentColumns.find(([key])=>key===category)?.[1];
    return modalBox(esc(label||'Document'),'À fournir',label?`<button class="primary tiny" onclick="prepareMissingDoc('${formationId}','${category}'${sessionId?','+Number(sessionId):''})">Créer et déposer</button>`:'');
  }
  const owner=state.role==='formateur'&&d.trainerId===state.trainerId&&d.owner==='formateur';
  if(state.role!=='amo'&&!trainerCanReadDocument(d))return '';
  const formateur=state.role==='formateur';
  const versions=[...d.versions].reverse();
  const latest=versions[0];
  return modalBox(esc(d.title),formateur?fmtDate(sessionById(d.sessionId)?.date):formationDates(d.formationId),`
    <div>${badge(d.status)}</div>
    ${d.status==='Refusé'&&latest?.comment?`<div class="info"><small>Motif du refus</small><strong>${esc(latest.comment)}</strong></div>`:''}
    ${versions.map(v=>`<div class="line-item"><div class="grow"><strong>${esc(v.filename)}</strong><div class="item-sub">Version ${v.number} · ${esc(v.status)}</div></div>${v.fileKey?`<div class="action-wrap">
      <button class="ghost tiny" onclick="downloadDocumentVersion('${d.id}',${v.number},true)">Ouvrir le fichier</button>
      <button class="secondary tiny" onclick="downloadDocumentVersion('${d.id}',${v.number})">${mobileIcon('download',16)} Télécharger</button>
    </div>`:'<span class="item-sub">Fichier de démonstration · téléchargement indisponible</span>'}</div>`).join('')||'<p class="empty">Aucune version déposée.</p>'}
    <div class="modal-actions">${!formateur&&latest?`<button class="secondary" onclick="openModal('review','${d.id}')">Vérifier</button>`:''}
    ${!formateur||(owner&&d.status!=='Validé')?`<button class="primary" onclick="openModal('${formateur?'upload':'upload-internal'}','${d.id}')">${d.status==='Refusé'?'Déposer une nouvelle version':'Déposer un fichier'}</button>`:''}</div>`);
}

function documentStorage(mode,action){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('certifia-hub-documents',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const connection=request.result;
      const tx=connection.transaction('files',mode);
      const operation=action(tx.objectStore('files'));
      tx.oncomplete=()=>{connection.close();resolve(operation.result)};
      tx.onabort=()=>{connection.close();reject(tx.error)};
    };
  });
}

async function downloadDocumentVersion(id,number,preview=false){
  const d=db.deliverables.find(x=>x.id===id);
  const v=d?.versions.find(x=>x.number===number);
  const canRead=()=>state.role==='amo'||trainerCanReadDocument(d);
  if(!v?.fileKey||!canRead())return;
  const currentModal=state.modal;
  try{
    const file=await documentStorage('readonly',files=>files.get(v.fileKey));
    if(!canRead()||state.modal!==currentModal)return;
    if(!file)return flash('Fichier indisponible dans ce navigateur.');
    const display=preview&&/^(application\/pdf|image\/(png|jpeg))$/.test(file.type);
    if(display){
      const url=URL.createObjectURL(file);
      const modal=$('document-file-frame');
      if(modal)URL.revokeObjectURL(modal.src);
      const frame=modal||document.createElement('iframe');
      frame.id='document-file-frame';
      frame.title='Aperçu du document';
      frame.sandbox='';
      frame.src=url;
      if(!modal)document.querySelector('.modal .modal-actions')?.before(frame);
    }else downloadBlob(file,v.filename);
  }catch(e){flash('Impossible de lire le fichier.')}
}

function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;
  a.download=name;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function preparationTiming(docs,today=parisToday()){
  const totals={onTime:0,late:0,overdue:0,pending:0,unknown:0};
  const categories=new Map();
  for(const doc of docs){
    const category=docCategory(doc);
    const label=documentColumns.find(([key])=>key===category)?.[1];
    if(!label||category==='BILANS'||doc.status==='Non applicable')continue;
    const bucket=categories.get(label)||{onTime:0,late:0,overdue:0,pending:0,unknown:0};
    const first=doc.versions?.[0]?.at;
    let status;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(doc.dueDate||''))status='unknown';
    else if(!doc.versions?.length)status=doc.dueDate<today?'overdue':'pending';
    else if(!first||!Number.isFinite(Date.parse(first)))status='unknown';
    else status=parisToday(new Date(first))<=doc.dueDate?'onTime':'late';
    bucket[status]++;
    totals[status]++;
    categories.set(label,bucket);
  }
  return {...totals,categories,measurable:totals.onTime+totals.late+totals.overdue};
}

const preparationTimingLabels={
  onTime:'Déposés dans les temps',late:'Déposés en retard',overdue:'Manquants après échéance',
  pending:'En attente dans les délais',unknown:'Date inconnue'
};

function preparationBreakdown(categories){
  return `<table class="tbl monthly-report-table" aria-label="Délais par type de document">
      <thead><tr><th>Document</th><th>À temps</th><th>Déposé en retard</th><th>Manquant après échéance</th><th>En attente</th><th>Date inconnue</th></tr></thead>
      <tbody>${[...categories].map(([label,row])=>`<tr><th scope="row">${esc(label)}</th><td>${row.onTime}</td><td>${row.late}</td><td>${row.overdue}</td><td>${row.pending}</td><td>${row.unknown}</td></tr>`).join('')}</tbody>
    </table>`;
}

function preparationPanel(timing){
  const {onTime,late,overdue,pending,unknown,measurable,categories}=timing;
  return `<section class="card monthly-preparation">
    ${cardTitle('Délais de préparation des sessions','Premier dépôt comparé à l’échéance de chaque document de préparation des sessions du mois.')}
    <div class="line-item"><span class="grow">Déposés dans les temps</span><strong>${measurable?reportNumber(onTime/measurable*100)+' % · '+onTime+'/'+measurable:'Non mesurable'}</strong></div>
    <div class="line-item"><span class="grow">Déposés en retard</span><strong>${late}</strong></div>
    <div class="line-item"><span class="grow">Manquants après échéance</span><strong>${overdue}</strong></div>
    <div class="line-item"><span class="grow">En attente dans les délais</span><strong>${pending}</strong></div>
    ${unknown?`<div class="line-item"><span class="grow">Date de dépôt ou échéance inconnue</span><strong>${unknown}</strong></div>`:''}
    ${categories.size?`<details><summary>Voir par type de document</summary><div class="table-wrap">${preparationBreakdown(categories)}</div></details>`:''}
    <p class="footnote">Un dépôt le jour de l’échéance compte comme ponctuel. Les documents encore attendus et les dates inconnues sont exclus du taux.</p>
  </section>`;
}

function monthlyReport(){
  const month=state.monthlyMonth;
  const sessions=db.sessions.filter(s=>s.date.startsWith(month)&&s.status!=='Annulée');
  const ids=new Set(sessions.map(s=>s.id));
  const assignments=db.assignments.filter(a=>ids.has(a.sessionId)&&['Confirmée','Réalisée'].includes(a.status));
  const proposals=db.proposals.filter(p=>ids.has(p.sessionId));
  const docs=db.deliverables.filter(d=>ids.has(d.sessionId));
  const assessed=assignments.map(a=>missionRatings[a.id]?.nps).filter(Number.isFinite);
  const punctual=docs.filter(d=>d.dueDate&&d.versions[0]?.at);
  const onTime=punctual.filter(d=>d.versions[0].at.slice(0,10)<=d.dueDate).length;
  const cards=db.internalReviews.filter(r=>isActiveCarton(r)&&r.createdAt?.startsWith(month));
  const bonuses=db.internalReviews.filter(r=>r.kind==='bonus'&&r.createdAt?.startsWith(month));
  const bonusCounts=new Map();
  for(const b of bonuses)bonusCounts.set(b.trainerId,(bonusCounts.get(b.trainerId)||0)+1);
  const bonusByTrainer=[...bonusCounts].map(([id,count])=>({id,name:trainerById(id)?.name||'Formateur',count,points:count*trainerBonusValue})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'fr'));
  const trainersByMission=[...new Set(assignments.map(a=>a.trainerId))].map(id=>{
    const list=assignments.filter(a=>a.trainerId===id);
    const scores=list.map(a=>missionRatings[a.id]?.nps).filter(Number.isFinite);
    return {name:trainerById(id).name,count:list.length,done:list.filter(a=>a.status==='Réalisée').length,nps:scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:null};
  }).sort((a,b)=>b.count-a.count);
  return {month,sessions,assignments,proposals,docs,onTime,punctual,preparation:preparationTiming(docs),cards,bonuses,bonusByTrainer,bonusPoints:bonuses.length*trainerBonusValue,trainersByMission,
    nps:assessed.length?assessed.reduce((sum,n)=>sum+n,0)/assessed.length:null,npsCount:assessed.length,
    participants:sessions.reduce((sum,s)=>sum+Number(s.people||0),0),
    staffed:sessions.filter(s=>openCount(s)===0).length,
    deposited:docs.filter(d=>d.versions.length).length};
}

function reportNumber(n){
  return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n);
}

function monthlyTableRows(r=monthlyReport()){
  if(!r.month)return [];
  const rows=[['Mois','Type de ligne','Client','Formation','Date de session','Formateur','Statut','Indicateur','Valeur']];
  const row=(type,{s,t,status,label,value}={})=>[r.month,type,s?clientOf(formOf(s)).name:'',s?formOf(s).title:'',s?.date||'',t||'',status||'',label||'',value??''];
  rows.push(row('Synthèse',{label:'Sessions',value:r.sessions.length}),row('Synthèse',{label:'Participants prévus',value:r.participants}),row('Synthèse',{label:'Sessions entièrement staffées',value:r.staffed}),row('Synthèse',{label:'Formateurs mobilisés',value:r.trainersByMission.length}),row('Synthèse',{label:'NPS moyen / 10',value:r.nps===null?'Non mesuré':reportNumber(r.nps)}),row('Synthèse',{label:'Ponctualité documentaire',value:r.punctual.length?reportNumber(r.onTime/r.punctual.length*100)+' %':'Non mesurée'}));
  const p=r.preparation;
  rows.push(row('Préparation',{label:'Taux de dépôt dans les temps',value:p.measurable?reportNumber(p.onTime/p.measurable*100)+' %':'Non mesurable'}));
  for(const [key,label] of Object.entries(preparationTimingLabels))rows.push(row('Préparation',{label,value:p[key]}));
  for(const [category,counts] of p.categories)
    for(const [key,label] of Object.entries(preparationTimingLabels))rows.push(row('Préparation',{label:category+' · '+label,value:counts[key]}));
  rows.push(row('Synthèse',{label:'Bonus du mois',value:r.bonuses.length}),row('Synthèse',{label:'Points de bonus attribués',value:r.bonusPoints}));
  r.bonusByTrainer.forEach(t=>rows.push(row('Synthèse formateur',{t:t.name,label:'Bonus du mois',value:t.count}),row('Synthèse formateur',{t:t.name,label:'Points de bonus attribués',value:t.points})));
  r.sessions.forEach(s=>rows.push(row('Session',{s,status:staffingLabel(s),label:'Participants',value:s.people})));
  r.assignments.forEach(a=>rows.push(row('Affectation',{s:sessionById(a.sessionId),t:trainerById(a.trainerId).name,status:a.status,label:'NPS / 10',value:missionRatings[a.id]?.nps})));
  r.proposals.forEach(p=>rows.push(row('Proposition',{s:sessionById(p.sessionId),t:trainerById(p.trainerId).name,status:p.status,label:'Conditions',value:p.conditions})));
  r.docs.forEach(d=>rows.push(row('Livrable',{s:sessionById(d.sessionId),t:trainerById(d.trainerId)?.name,status:d.status,label:d.title,value:d.dueDate})));
  r.bonuses.forEach(b=>rows.push(row('Bonus',{t:trainerById(b.trainerId)?.name,status:b.createdAt.slice(0,10),label:'Points attribués',value:trainerBonusValue})));
  r.cards.forEach(c=>rows.push(row('Carton',{t:trainerById(c.trainerId)?.name,status:c.level,label:'Date',value:c.createdAt.slice(0,10)})));
  return rows;
}
function exportMonthly(){
  const rows=monthlyTableRows();
  if(!rows.length)return flash('Choisissez un mois.');
  const quote=value=>{const text=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(text)?"'"+text:text).replaceAll('"','""')+'"'};
  downloadBlob(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'Monthly-AMO-'+state.monthlyMonth+'.csv');
}

function monthlyExportStyles(){
  const gradient=getComputedStyle(document.documentElement).getPropertyValue('--pd-session-gradient').trim();
  return `
    :root{color-scheme:light;--page:#f8f8fc;--panel:#fff;--ink:#25233b;--muted:#645f78;--line:#e7e5f0;--subtle:#f1f0f9;--accent:#442ffa;
      --session-gradient:${gradient||'linear-gradient(90deg,#442ffa,#bc3afe,#ba8bfd)'}}
    :root{--brand-indigo:#442ffa;--brand-violet:#bc3afe;--brand-lilac:#ba8bfd}
    *{box-sizing:border-box}
    body{margin:0;background:var(--page);color:var(--ink);font:15px/1.55 system-ui,sans-serif}
    main{max-width:1280px;margin:auto;padding:32px clamp(12px,3vw,28px)}
    header,section,.stats>div{min-width:0;border:1px solid transparent;border-radius:12px;padding:16px;
      background:linear-gradient(var(--panel),var(--panel)) padding-box,var(--session-gradient) border-box}
    header{padding:clamp(16px,4vw,28px);margin-bottom:16px}
    h1{font-size:clamp(24px,4.5vw,42px);line-height:1.2;margin:8px 0 3px}
    h2{font-size:18px;line-height:1.3;margin:0 0 12px}
    p,.report-period,.eyebrow{color:var(--muted)}
    .eyebrow{font-size:11px;letter-spacing:.12em}
    .report-logo{display:block;width:146px;max-width:100%;height:auto;margin-bottom:12px}
    .report-table-scroll{overflow-x:auto;max-width:100%;border-radius:8px}
    .report-table-scroll:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:9px 10px;text-align:left;border-bottom:1px solid var(--line);overflow-wrap:anywhere}
    thead th{background:var(--subtle)}
    .report-table-scroll th,.report-table-scroll td{min-width:86px}
    tbody tr:nth-child(even){background:var(--page)}
    @media print{main{padding:0}header,section,.stats>div{border-color:var(--line);background:white}.report-table-scroll{overflow:visible}
      .report-table-scroll th,.report-table-scroll td{min-width:0;padding:4px;font-size:9px}}
  `;
}

async function exportMonthlyChart(){
  const r=monthlyReport();
  if(!/^\d{4}-\d{2}$/.test(r.month))return flash('Choisissez un mois.');
  const period=fmtDate(r.month+'-01',{month:'long',year:'numeric'});
  const stats=[['Sessions',r.sessions.length],['Participants prévus',r.participants],['Affectations',r.assignments.length],['Formateurs mobilisés',r.trainersByMission.length],['Livrables déposés',r.deposited+'/'+r.docs.length],['Bonus du mois',r.bonuses.length],['Points de bonus attribués',r.bonusPoints],['NPS moyen',r.nps===null?'—':reportNumber(r.nps)+' / 10'],['Note formation /5',r.formationNote5===null?'Non renseigné':reportNumber(r.formationNote5)+' / 5']];
  const palette=['#a48aff','#52d7b2','#ffc475','#f196b3','#87baff'];
  const statusRows=(items,key)=>Object.entries(items.reduce((acc,item)=>{const label=key(item);acc[label]=(acc[label]||0)+1;return acc},Object.create(null)));
  const bars=(title,rows)=>{const max=Math.max(1,...rows.map(x=>x[1]));return `<section><h2>${title}</h2>${rows.map(([label,n],i)=>`<div class="bar-label"><span>${esc(label)}</span><b>${n}</b></div><div class="rail"><div class="bar" style="--width:${n/max*100}%;--i:${i};--color:${palette[i%palette.length]}"></div></div>`).join('')||'<p>Aucune donnée sur la période.</p>'}</section>`};
  const ring=(title,value,total,detail)=>{const fraction=total?Math.round(value/total*100):0;return `<section><h2>${title}</h2><div class="ring-row"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="49" class="track"/><circle cx="60" cy="60" r="49" pathLength="100" stroke-dasharray="${fraction} 100" class="ring"/></svg><div><strong>${total?reportNumber(value/total*100)+' %':'—'}</strong><p>${esc(detail)}</p></div></div></section>`};
  const daysInMonth=new Date(Number(r.month.slice(0,4)),Number(r.month.slice(5)),0).getDate();
  const weekly=Array(Math.ceil(daysInMonth/7)).fill(0);
  r.sessions.forEach(s=>weekly[Math.floor((Number(s.date.slice(8))-1)/7)]++);
  const maxWeek=Math.max(1,...weekly);
  const trends=`<section><h2>Sessions dans le mois</h2><div class="columns" style="--weeks:${weekly.length}">${weekly.map((n,i)=>`<div><b>${n}</b><div class="column" style="--height:${Math.max(3,n/maxWeek*95)}px;--i:${i}"></div><small>${i*7+1}–${Math.min(i*7+7,daysInMonth)}</small></div>`).join('')}</div></section>`;
  const logo=await reportLogo();
  const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monthly AMO · ${esc(period)}</title>
  <style>
    ${monthlyExportStyles()}
    .stats,.grid{display:grid;gap:12px}
    .stats{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:12px}
    .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .stats strong,.ring-row strong{display:block;font-size:24px}
    .bar-label{display:flex;justify-content:space-between;gap:10px;margin:9px 0 4px}
    .rail{height:10px;background:var(--subtle);border-radius:8px;overflow:hidden}
    .bar{height:100%;width:var(--width);background:var(--color);border-radius:8px;transform-origin:left;animation:grow .85s both;animation-delay:calc(var(--i)*90ms)}
    .ring-row{display:flex;align-items:center;gap:16px}
    .ring-row svg{width:clamp(64px,17vw,100px);flex:none;transform:rotate(-90deg)}
    circle{fill:none;stroke-width:10}.track{stroke:var(--subtle)}.ring{stroke:var(--accent);stroke-linecap:round;animation:ring 1s both}
    .columns{display:grid;grid-template-columns:repeat(var(--weeks),1fr);gap:8px;align-items:end;text-align:center;height:145px}
    .columns>div{display:grid;justify-items:center;gap:3px}
    .column{width:min(36px,90%);height:var(--height);border-radius:5px;background:var(--session-gradient);transform-origin:bottom;animation:rise .75s both;animation-delay:calc(var(--i)*90ms)}
    .wide{grid-column:1/-1}
    @keyframes grow{from{transform:scaleX(0)}}@keyframes rise{from{transform:scaleY(0)}}@keyframes ring{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
    @media(max-width:640px){.grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important}}
  </style><main><header>${logo}<div class="eyebrow">CERTIF-IA HUB</div><h1>Monthly AMO</h1><div>${esc(period)}</div></header>
  <div class="stats">${stats.map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('')}</div>
  <div class="grid">${trends}
  ${ring('Couverture du staffing',r.staffed,r.sessions.length,`${r.staffed} session(s) entièrement staffée(s) sur ${r.sessions.length}`)}
  ${bars('Propositions par statut',statusRows(r.proposals,p=>p.status))}
  ${bars('Livrables par statut',statusRows(r.docs,d=>d.status))}
  ${ring('Préparation dans les temps',r.preparation.onTime,r.preparation.measurable,`${r.preparation.onTime} / ${r.preparation.measurable} documents déposés dans les temps`)}
  ${bars('Délais de préparation',Object.entries(preparationTimingLabels).map(([key,label])=>[label,r.preparation[key]]))}
  ${r.preparation.categories.size?`<section class="wide"><h2>Délais par type de document</h2><div class="report-table-scroll" tabindex="0" role="region" aria-label="Délais par type de document">${preparationBreakdown(r.preparation.categories)}</div></section>`:''}
  ${ring('Ponctualité documentaire',r.onTime,r.punctual.length,`${r.onTime} dépôt(s) à temps sur ${r.punctual.length} daté(s)`)}
  ${bars('Suivi interne sur la période',[['Bonus',r.bonuses.length],['Cartons jaunes',r.cards.filter(c=>c.level==='jaune').length],['Cartons rouges',r.cards.filter(c=>c.level==='rouge').length]])}
  ${bars('Bonus par formateur',r.bonusByTrainer.map(t=>[t.name,t.count]))}
  ${bars('Affectations par formateur',r.trainersByMission.map(t=>[t.name,t.count]))}
  <section><h2>Évaluations des missions</h2><p>${r.npsCount} mission(s) évaluée(s) sur ${r.assignments.length} affectation(s).</p><table><thead><tr><th>Formateur</th><th>Terminées</th><th>NPS / 10</th></tr></thead><tbody>${r.trainersByMission.map(t=>`<tr><td>${esc(t.name)}</td><td>${t.done}</td><td>${t.nps===null?'—':reportNumber(t.nps)}</td></tr>`).join('')||'<tr><td colspan="3">Aucune mission</td></tr>'}</tbody></table></section>
  </div><p>Données de démonstration · Rapport autonome</p></main></html>`;
  downloadBlob(new Blob([html],{type:'text/html;charset=utf-8'}),'Monthly-AMO-'+r.month+'.html');
}

function openTrainerPlanning(id){
  state.trainerDetailTab='agenda';
  openTrainer(id);
}

function whatsAppPanel(id){
  const p=db.proposals.find(x=>x.id===id);
  const s=sessionById(p?.sessionId);
  const t=trainerById(p?.trainerId);
  if(!s||!t)return '';
  const f=formOf(s);
  const modes=p.modes||[s.modality==='Distanciel'?'Visio':s.modality];
  const location=modes.includes('Présentiel')?s.city||'À confirmer':'Visio';
  const hours=time=>Number(time.slice(0,2))+Number(time.slice(3))/60;
  const duration=hours(s.end)-hours(s.start);
  const format=(duration>=6?'1 journée entière de formation':`Formation de ${s.start} à ${s.end}`)+(modes.length>1?' · Présentiel ou visio':'');
  const specialization=clientDetails[f.clientId]?.industry||s.topic||f.title;
  const text=`Hello @${t.name} 👋🏼

⚡️ J’ai une nouvelle mission à te proposer.

Client : ${clientOf(f).name}
Dates : ${fmtDate(s.date,{day:'numeric',month:'long',year:'numeric'})}
Lieu : ${location}
Format : ${format}

Spécialisation : ${specialization} 🔥

Es-tu disponible sur cette date ?

J’attends ton retour !`;
  return modalBox('Brouillon WhatsApp','Brouillon fictif à relire et à copier. Aucun envoi depuis le Hub.',`
    <label for="whatsapp-text" class="form-label">Message à copier</label><textarea class="field whatsapp-text" id="whatsapp-text" rows="9">${esc(text)}</textarea>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button><button class="primary" onclick="copyWhatsApp()">Copier le message</button></div>`);
}

async function copyWhatsApp(){
  const field=$('whatsapp-text');
  try{await navigator.clipboard.writeText(field.value);flash('Message copié.')}
  catch(e){field.focus();field.select();flash('Message sélectionné. Copiez-le avec le raccourci de votre appareil.')}
}

function missionPicker(tab,proposals,assignments){
  const confirmed=assignments.filter(a=>missionMatchesTab(a,'upcoming'));
  const prep=assignments.filter(a=>missionMatchesTab(a,'prepare'));
  const views=[
    ['proposals','Propositions','mail',proposals.filter(p=>p.status==='Envoyée').length],
    ['upcoming','À venir','calendar',confirmed.length],
    ['prepare','À préparer','docs',prep.length],
    ['finished','Terminées','check',assignments.filter(a=>missionMatchesTab(a,'finished')).length]
  ];
  return `<div class="mission-picker" role="group" aria-label="Filtrer les missions">${views.map(([key,label,icon,count])=>`<button aria-pressed="${tab===key}" onclick="changeTab('missionTab','${key}')">${mobileIcon(icon,20)}<span>${label}</span><strong>${count}</strong></button>`).join('')}</div>`;
}

function uploadPanel(id,internal){
  const d=db.deliverables.find(x=>x.id===id);
  if(!d||(!internal&&(state.role!=='formateur'||d.trainerId!==state.trainerId||d.owner!=='formateur'||!trainerCanReadDocument(d)))||(internal&&state.role!=='amo'))return '';
  return modalBox(d.status==='Refusé'?'Déposer une nouvelle version':'Déposer un livrable',esc(d.title),`
    <div class="upload-drop" ondragover="event.preventDefault();this.classList.add('drag-active')" ondragleave="this.classList.remove('drag-active')" ondrop="event.preventDefault();this.classList.remove('drag-active');selectUploadFile(event.dataTransfer.files[0])">
      ${mobileIcon('docs',30)}<strong>Glissez votre fichier ici</strong><span>PDF, Word, PowerPoint, Excel, PNG ou JPEG</span>
      <label for="upload-file" class="secondary tiny">Parcourir les fichiers</label><input id="upload-file" class="upload-input" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.png,.jpg,.jpeg" onchange="selectUploadFile(this.files[0])">
    </div><div id="upload-selection" class="upload-selection" role="status">Aucun fichier sélectionné</div>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button id="upload-submit" class="primary" disabled onclick="simulateUpload('${d.id}',${internal})">Déposer le fichier</button></div>`);
}

function selectUploadFile(file){
  const selection=$('upload-selection');
  const valid=!!file&&/\.(pdf|docx?|pptx?|xlsx|png|jpe?g)$/i.test(file.name);
  state.uploadFile=valid?file:null;
  $('upload-submit').disabled=!valid;
  selection.textContent=valid?`${file.name} · ${new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Math.max(1,file.size/1024))} Ko`:file?'Ce format de fichier est indisponible.':'Aucun fichier sélectionné';
}

function sessionDocuments(session,docs){
  const groups=documentColumns.map(([key,label])=>{
    const matches=docs.filter(d=>docCategory(d)===key);
    if(matches.length)return matches.map(d=>docLine(d)).join('');
    return `<div class="doc-row"><span class="doc-icon">${mobileIcon('docs',16)}</span><div class="grow"><button class="document-title" onclick="openModal('document-preview','${session.formationId}:${key}:${session.id}')">${label}</button><div class="item-sub">Aucune version déposée</div></div>${badge('À fournir')}</div>`;
  });
  return groups.join('')+docs.filter(d=>!documentColumns.some(([key])=>key===docCategory(d))).map(d=>docLine(d)).join('');
}

async function selectProfilePhoto(file){
  const status=$('profile-photo-status');
  if(!status)return;
  const previousDraft=state.profilePhotoDraft;
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024){
    status.textContent='Choisissez une image JPG, PNG ou WebP de 12 Mo maximum.';
    return;
  }
  const token=Symbol();
  state.profilePhotoPending=token;
  status.textContent='Préparation de la photo…';
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();
    image.src=url;
    await image.decode();
    if(state.profilePhotoPending!==token||!status.isConnected)return;
    const side=Math.min(image.naturalWidth,image.naturalHeight);
    const size=Math.min(384,side);
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,size,size);
    ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,size,size);
    state.profilePhotoDraft=canvas.toDataURL('image/jpeg',0.86);
    const preview=document.querySelector('.profile-picture-preview .trainer-photo');
    if(preview)preview.innerHTML=`<img src="${state.profilePhotoDraft}" alt="">`;
    status.textContent=file.name+' · aperçu prêt';
  }catch(e){
    if(state.profilePhotoPending===token){state.profilePhotoDraft=previousDraft;status.textContent='Cette image n’a pas pu être ouverte.'}
  }finally{
    URL.revokeObjectURL(url);
    if(state.profilePhotoPending===token)state.profilePhotoPending=false;
  }
}

async function reportLogo(){
  try{
    const response=await fetch('assets/certifia-logo.png');
    if(!response.ok)throw new Error('Logo indisponible');
    const file=await response.blob();
    const data=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(reader.error);
      reader.readAsDataURL(file);
    });
    return `<img class="report-logo" src="${esc(data)}" alt="Certif-IA">`;
  }catch(e){
    return '<strong class="report-brand">Certif-IA</strong>';
  }
}

async function exportMonthlyTable(){
  const rows=monthlyTableRows();
  const month=state.monthlyMonth;
  if(!rows.length)return flash('Choisissez un mois.');
  const [columns,...data]=rows;
  const logo=await reportLogo();
  const period=fmtDate(month+'-01',{month:'long',year:'numeric'});
  const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monthly AMO · Tableau</title>
    <style>${monthlyExportStyles()}
      .report-detail{padding:0;overflow:hidden}
      .preparation-row td:nth-child(2),.preparation-row td:last-child{color:var(--accent);font-weight:650}
    </style>
    <main><header>${logo}<h1>Monthly AMO · Tableau détaillé</h1><div>${esc(period)}</div></header><section class="report-detail"><div class="report-table-scroll" tabindex="0" role="region" aria-label="Tableau détaillé du Monthly AMO"><table><thead><tr>${columns.map(label=>`<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${data.map(row=>`<tr${row[1]==='Préparation'?' class="preparation-row"':''}>${row.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section></main></html>`;
  downloadBlob(new Blob([html],{type:'text/html;charset=utf-8'}),'Monthly-AMO-'+month+'-tableau.html');
}

function trainerSessionAccess(sessionId){
  return db.assignments.some(a=>a.sessionId===sessionId&&a.trainerId===state.trainerId&&['Confirmée','Réalisée','À revalider'].includes(a.status))
    ||db.proposals.some(p=>p.sessionId===sessionId&&p.trainerId===state.trainerId&&p.status==='Acceptée');
}

function trainerCanReadDocument(doc){
  return !!doc&&trainerSessionAccess(doc.sessionId)&&(doc.owner==='interne'||doc.trainerId===state.trainerId);
}

function trainerMissionDocuments(session){
  if(!trainerSessionAccess(session.id))return [];
  const docs=db.deliverables.filter(d=>d.sessionId===session.id&&trainerCanReadDocument(d));
  const categories=documentColumns.flatMap(([key,label])=>{
    const matches=docs.filter(d=>docCategory(d)===key);
    if(matches.length)return matches;
    const owner=['PROGRAMME','SUPPORT'].includes(key)?'formateur':'interne';
    return [{title:label,type:key,sessionId:session.id,owner,versions:[],status:'À fournir'}];
  });
  return categories.concat(docs.filter(d=>!documentColumns.some(([key])=>key===docCategory(d))));
}

function trainerDocPending(doc){
  return doc.status!=='Non applicable'&&(!doc.versions.length||doc.status==='Refusé');
}

function missionMatchesTab(assignment,tab){
  const s=sessionById(assignment.sessionId);
  if(!s||s.status==='Annulée')return false;
  const finished=assignment.status==='Réalisée'||s.status==='Réalisée'||s.date<parisToday();
  if(tab==='finished')return finished;
  if(tab==='prepare')return !finished&&trainerMissionDocuments(s).some(d=>d.owner==='formateur'&&trainerDocPending(d));
  return !finished;
}

function missionDocumentSummary(session){
  const docs=trainerMissionDocuments(session);
  const amo=docs.filter(d=>d.owner==='interne'||d.versions.at(-1)?.uploader==='amo');
  const missing=docs.filter(trainerDocPending);
  const depositedAmo=amo.filter(d=>d.versions.length>0).length;
  return `<span class="item-sub mission-doc-count">${docs.length-missing.length}/${docs.length} pièces disponibles · ${missing.length} à déposer ou à reprendre · AMO : ${depositedAmo}/${amo.length} déposée(s)</span>`;
}

function trainerSessionDocumentRow(doc){
  const version=doc.versions.at(-1);
  const side=doc.owner==='interne'||version?.uploader==='amo'?'AMO':'Formateur';
  const stateLabel=doc.status==='Refusé'?'Refusé · nouvelle version attendue':version?doc.status:doc.status==='Non applicable'?doc.status:'Non déposé';
  const title=deliverableTitle(doc);
  const upload=doc.owner==='formateur'&&trainerDocPending(doc)
    ?`<button class="secondary tiny" onclick="${doc.id?`openModal('upload','${doc.id}')`:`createTrainerDocument(${doc.sessionId},'${doc.type}')`}">${version?'Redéposer':'Déposer'}</button>`:'';
  return `<div class="doc-row mission-document-row"><span class="doc-icon">${mobileIcon('docs',16)}</span><div class="grow">${title}<div class="item-sub">${side} · ${version?esc(version.filename):'Aucun fichier déposé'}</div></div>${badge(stateLabel)}${upload}</div>`;
}

function createTrainerDocument(sessionId,type){
  if(state.role!=='formateur'||!trainerSessionAccess(sessionId))return;
  const session=sessionById(sessionId);
  const slot=trainerMissionDocuments(session).find(d=>d.type===type&&d.owner==='formateur'&&!d.id);
  if(!slot)return;
  const id='D'+(Math.max(0,...db.deliverables.map(d=>Number(String(d.id).slice(1))||0))+1);
  db.deliverables.push({...slot,id,formationId:session.formationId,trainerId:state.trainerId,dueDate:shiftDate(session.date,type==='PROGRAMME'?-7:-3)});
  save();
  openModal('upload',id);
}

function trainerDocs(){
  const open=state.trainerDocsFilter==='open';
  const sessions=db.sessions.filter(s=>trainerSessionAccess(s.id)&&s.status!=='Annulée').sort((a,b)=>b.date.localeCompare(a.date));
  return `<h1 class="headline">Mes livrables</h1>
    <div class="tabs">${[['all','Tous les dossiers'],['open','À compléter']].map(([key,label])=>`<button class="${state.trainerDocsFilter===key?'selected':''}" onclick="changeTab('trainerDocsFilter','${key}')">${label}</button>`).join('')}</div>
    <div class="folder-grid">${sessions.filter(s=>!open||trainerMissionDocuments(s).some(d=>d.owner==='formateur'&&trainerDocPending(d))||trainerFeedbackDays(s).some(day=>!feedbackRecord(s.id,day,state.trainerId)?.sentAt)).map(s=>{
      const f=formOf(s),items=trainerMissionDocuments(s);
      return `<section class="card folder-card">${cardTitle(esc(clientOf(f).name),esc(f.title))}<p class="item-sub">${fmtDate(s.date)}</p>
        ${missionDocumentSummary(s)}
        <ul class="doc-preview">${items.map(d=>`<li><span>${deliverableTitle(d)} <small class="item-sub">· ${d.owner==='interne'||d.versions.at(-1)?.uploader==='amo'?'AMO':'Formateur'}</small></span><span class="action-wrap">${badge(!d.versions.length&&d.status!=='Non applicable'?'Non déposé':d.status)}</span></li>`).join('')}</ul>
        ${trainerFeedbackRows(s)}
        <button class="primary tiny" onclick="openTrainerFolder(${s.id})">Ouvrir le dossier</button>
      </section>`;
    }).join('')||'<p class="empty">Aucun dossier dans cette vue.</p>'}</div>`;
}

function trainerFolder(){
  const session=sessionById(state.selectedDocGroup);
  const formation=session?formOf(session):formations.find(f=>f.id===state.selectedDocGroup);
  const sessions=(session?[session]:db.sessions.filter(s=>s.formationId===formation?.id)).filter(s=>trainerSessionAccess(s.id));
  if(!formation||!sessions.length)return '<p class="empty">Aucun dossier accessible pour cette mission.</p>';
  return `<h1 class="headline">${esc(clientOf(formation).name)}</h1><p class="subtitle">${esc(formation.title)}</p>
    ${sessions.map(s=>`<section class="card mission-documents">${cardTitle('Session du '+fmtDate(s.date))}${missionDocumentSummary(s)}
    ${trainerMissionDocuments(s).map(trainerSessionDocumentRow).join('')}${trainerFeedbackRows(s)}</section>`).join('')}`;
}

function trainerFeedbackDays(session){
  if(!session||session.status==='Annulée')return [];
  // Explicit second day for the demo session, including browser data saved before this feature.
  const duration=session.feedbackDays??seedSessions.find(item=>item.id===session.id)?.feedbackDays;
  return duration===2?[1,2]:[1];
}

function feedbackRecord(sessionId,day,trainerId){
  return (db.trainerFeedback||[]).find(item=>item.sessionId===sessionId&&item.day===day&&item.trainerId===trainerId);
}

function trainerFeedbackRows(session){
  if(state.role!=='formateur'||!trainerSessionAccess(session.id))return '';
  return trainerFeedbackDays(session).map(day=>{
    const feedback=feedbackRecord(session.id,day,state.trainerId);
    return `<div class="doc-row"><span class="doc-icon">${mobileIcon('docs',16)}</span>
      <div class="grow"><strong>Retour formateur J${day}</strong>
      <div class="item-sub">${fmtDate(shiftDate(session.date,day-1))} · ${feedback?.sentAt?'Envoyé à l’AMO':feedback?'Brouillon':'À compléter'}</div></div>
      <button class="secondary tiny" onclick="openModal('trainer-feedback','${session.id}:${day}:${state.trainerId}')">${feedback?.sentAt?'Consulter':feedback?'Reprendre':'Rédiger'}</button>
    </div>`;
  }).join('');
}

function amoTrainerFeedback(formationId){
  if(state.role!=='amo')return '';
  const entries=(db.trainerFeedback||[]).filter(item=>item.sentAt&&(!formationId||sessionById(item.sessionId)?.formationId===formationId))
    .sort((a,b)=>b.sentAt.localeCompare(a.sentAt));
  return `<section class="card trainer-feedback-list">${cardTitle('Retours formateurs','Débriefs J1 et J2 transmis par les formateurs')}
    ${entries.map(item=>{
      const session=sessionById(item.sessionId);
      const formation=session&&formOf(session);
      return `<div class="doc-row"><div class="grow"><strong>Retour formateur J${item.day}</strong>
        <div class="item-sub">${formation?esc(clientOf(formation).name)+' · ':''}${esc(trainerById(item.trainerId)?.name||'Formateur')} · ${session?fmtDate(shiftDate(session.date,item.day-1)):''}</div></div>
        ${badge('Reçu')}<button class="secondary tiny" onclick="openModal('trainer-feedback','${item.sessionId}:${item.day}:${item.trainerId}')">Lire</button></div>`;
    }).join('')||'<p class="empty">Aucun retour transmis.</p>'}</section>`;
}

function trainerFeedbackContext(id){
  const [sessionId,day,trainerId]=String(id).split(':').map(Number);
  const session=sessionById(sessionId);
  const feedback=feedbackRecord(sessionId,day,trainerId);
  const trainer=state.role==='formateur'&&trainerId===state.trainerId&&trainerSessionAccess(sessionId);
  if(state.role==='amo'&&feedback?.sentAt)return {sessionId,day,trainerId,feedback};
  if(!trainer||!trainerFeedbackDays(session).includes(day))return null;
  return {sessionId,day,trainerId,feedback};
}

const feedbackMinLength=100;

function feedbackTopics(day){
  return [
    'Déroulé et participation',
    'Ce qui a bien fonctionné',
    'Difficultés et points de vigilance',
    day===1?'Ajustements proposés pour J2':'Points à reprendre dans le bilan de formation'
  ];
}

function feedbackSummaryLines(text){
  return text.split(/\r?\n/).map(line=>{
    const trimmed=line.trim();
    const markdownHeading=/^#{1,6} +/.test(trimmed);
    const clean=trimmed.replace(/^#{1,6} +/,'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1');
    const bullet=/^(?:[-*+•] +|\d+[.)] +)/.test(clean);
    const heading=clean.replace(/^\d+[.)] +/,'').replace(/ *:$/,'');
    if(/^synthèse(?: interne| du retour formateur)?$/i.test(heading)&&markdownHeading)return {text:''};
    if(markdownHeading||[...feedbackTopics(1),...feedbackTopics(2)].some(topic=>topic.toLowerCase()===heading.toLowerCase())){
      return {heading:true,text:heading};
    }
    return {bullet,text:clean.replace(/^(?:[-*+•] +|\d+[.)] +)/,'')};
  });
}

function renderFeedbackSummary(text){
  const lines=feedbackSummaryLines(text);
  const html=[];
  let list=[];
  const flush=()=>{
    if(list.length)html.push('<ul>'+list.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ul>');
    list=[];
  };
  for(const line of lines){
    if(line.bullet&&line.text){list.push(line.text);continue;}
    flush();
    if(line.text)html.push(line.heading?'<h3>'+esc(line.text)+'</h3>':'<p>'+esc(line.text)+'</p>');
  }
  flush();
  return html.join('');
}

function updateFeedbackCount(form){
  const source=form.elements.source.value.trim();
  if(form.dataset.summarySource&&form.dataset.summarySource!==source){
    form.elements.summary.value='';
    form.querySelector('[data-feedback-result]').hidden=true;
    form.dataset.summarySource='';
    form.querySelector('[data-feedback-status]').textContent='Le retour a changé. Générez une nouvelle synthèse.';
  }
  const length=source.length;
  const enough=length>=feedbackMinLength;
  form.querySelector('[data-feedback-count]').textContent=
    enough?`${length} caractères`:`${length} / ${feedbackMinLength} caractères minimum`;
  const generate=form.querySelector('[data-feedback-generate]');
  if(generate)generate.disabled=!enough||form.dataset.generating==='true'||form.dataset.editing==='true';
  const edit=form.querySelector('[data-feedback-edit]');
  if(edit)edit.disabled=form.dataset.generating==='true';
  form.querySelector('[value="send"]').disabled=!enough;
}

function updateFeedbackPreview(field){
  field.form.querySelector('[data-feedback-preview]').innerHTML=renderFeedbackSummary(field.value);
  field.form.querySelector('[data-feedback-result]').hidden=!field.value.trim();
}

function syncFeedbackSummary(preview){
  preview.closest('form').elements.summary.value=Array.from(preview.querySelectorAll('h3, p, li'),block=>{
    const text=block.innerText.trim();
    if(!text)return '';
    if(block.tagName==='H3')return '### '+text.replace(/\s+/g,' ');
    return block.tagName==='LI'?text.split(/\n+/).filter(Boolean).map(line=>'• '+line).join('\n'):text;
  }).filter(Boolean).join('\n');
}

function toggleFeedbackEditing(button){
  const form=button.form;
  const preview=form.querySelector('[data-feedback-preview]');
  const editing=button.getAttribute('aria-pressed')!=='true';
  button.setAttribute('aria-pressed',String(editing));
  button.setAttribute('aria-label',editing?'Terminer la modification':'Modifier la synthèse');
  button.title=editing?'Terminer la modification':'Modifier la synthèse';
  button.querySelector('[data-edit-pencil]').hidden=editing;
  button.querySelector('[data-edit-done]').hidden=!editing;
  preview.classList.toggle('is-editing',editing);
  form.dataset.editing=String(editing);
  if(form.elements.source)updateFeedbackCount(form);
  if(!editing){
    syncFeedbackSummary(preview);
    updateFeedbackPreview(form.elements.summary);
    if(!form.elements.summary.value.trim())form.querySelector('[data-feedback-generate]')?.focus();
    return;
  }
  preview.querySelectorAll('p, li').forEach(block=>block.setAttribute('contenteditable','plaintext-only'));
  preview.querySelector('li, p')?.focus();
}

function insertFeedbackBullet(event){
  const enter=event.type==='keydown'?event.key==='Enter'&&!event.shiftKey:event.inputType==='insertParagraph';
  if(!enter||event.isComposing)return;
  const bullet=event.target.closest('li[contenteditable="plaintext-only"]');
  if(!bullet)return;
  event.preventDefault();
  const next=document.createElement('li');
  next.setAttribute('contenteditable','plaintext-only');
  const selection=window.getSelection();
  if(selection?.rangeCount){
    const range=selection.getRangeAt(0);
    if(bullet.contains(range.startContainer)&&bullet.contains(range.endContainer)){
      range.deleteContents();
      const tail=range.cloneRange();
      tail.setEnd(bullet,bullet.childNodes.length);
      next.textContent=tail.toString();
      tail.deleteContents();
    }
  }
  bullet.after(next);
  next.focus();
  selection?.collapse(next,0);
  syncFeedbackSummary(event.currentTarget);
}

function feedbackEditor(summary){
  return `<section class="trainer-feedback-result" data-feedback-result ${summary?'':'hidden'}>
    <div class="trainer-feedback-result-header">
      <h2>Synthèse</h2>
      <button type="button" class="ghost tiny trainer-feedback-edit" aria-label="Modifier la synthèse"
        data-feedback-edit aria-pressed="false" title="Modifier la synthèse" onclick="toggleFeedbackEditing(this)">
        <span data-edit-pencil aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20H4v-4L16 4l4 4-8 8-4 4M14 6l4 4"/></svg></span>
        <span data-edit-done hidden>Terminer</span>
      </button>
    </div>
    <div class="trainer-feedback-text" data-feedback-preview oninput="syncFeedbackSummary(this)"
      onkeydown="insertFeedbackBullet(event)" onbeforeinput="insertFeedbackBullet(event)">${renderFeedbackSummary(summary)}</div>
    <input type="hidden" name="summary" value="${esc(summary)}">
  </section>`;
}

async function copyTrainerFeedback(){
  const context=trainerFeedbackContext(state.modal?.id);
  if(!context?.feedback?.sentAt)return;
  const source=context.feedback.source;
  const summary=$('[data-feedback-preview]')?.closest('form')?.elements.summary.value??context.feedback.summary;
  const text=summary?feedbackSummaryLines(summary).map(line=>line.bullet&&line.text?'• '+line.text:line.text).join('\n').trim():source;
  try{
    await navigator.clipboard.writeText(text);
    flash('Retour copié.');
  }catch{
    flash('Copie indisponible dans ce navigateur.');
  }
}

function trainerFeedbackModal(id){
  const context=trainerFeedbackContext(id);
  if(!context)return modalBox('Retour formateur','Retour inaccessible.', '');
  const {day,feedback}=context;
  const title='Retour formateur J'+day;
  if(feedback?.sentAt){
    const canEdit=state.role==='formateur'&&!!feedback.summary;
    const copy=`<button type="button" class="ghost tiny trainer-feedback-edit" aria-label="Copier le texte" title="Copier le texte" onclick="copyTrainerFeedback()">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
      </svg></button>`;
    const actions=`<div class="modal-actions">${copy}${state.role==='amo'?'<button class="secondary" onclick="openFolder(\''+(sessionById(context.sessionId)?.formationId||'')+'\')">Ouvrir le dossier</button>':''}</div>`;
    const content=canEdit?`<form class="trainer-feedback-form" onsubmit="submitTrainerFeedback(event)">
      ${feedbackEditor(feedback.summary)}
      <div class="modal-actions">${copy}<button type="submit" class="primary" name="action" value="update">Enregistrer les modifications</button></div>
    </form>`:`<div class="trainer-feedback-text">${feedback.summary?renderFeedbackSummary(feedback.summary):esc(feedback.source)}</div>${actions}`;
    return modalBox(title,'Retour transmis à l’AMO',content);
  }
  const summary=feedback?.summary||'';
  const length=feedback?.source?.trim().length||0;
  const enough=length>=feedbackMinLength;
  return modalBox(title,'Partagez votre retour sur la journée.',`
    <div class="trainer-feedback-guide">
      <p>Dans votre retour, pensez à aborder les points suivants.</p>
      <ul>${feedbackTopics(day).map(topic=>`<li>${esc(topic)}</li>`).join('')}</ul>
    </div>
    <form class="trainer-feedback-form" data-summary-source="${esc(summary?feedback?.source||'':'')}" onsubmit="submitTrainerFeedback(event)">
      <label class="form-label" for="feedback-source">Votre retour</label>
      <textarea class="field" id="feedback-source" name="source" rows="6" maxlength="12000" required
        aria-describedby="feedback-help feedback-count" oninput="updateFeedbackCount(this.form)">${esc(feedback?.source||'')}</textarea>
      <p class="item-sub" id="feedback-help">Écrivez, collez ou dictez votre retour avec le micro du clavier.</p>
      <button type="button" class="ghost tiny" onclick="fillFeedbackDemo()">Utiliser un exemple fictif J${day}</button>
      <p class="item-sub" id="feedback-count" data-feedback-count>${length}${enough?' caractères':` / ${feedbackMinLength} caractères minimum`}</p>
      <button type="button" class="secondary" data-feedback-generate ${enough?'':'disabled'} onclick="generateTrainerFeedback(this)">Générer la synthèse</button>
      <span class="trainer-feedback-progress" data-feedback-progress role="progressbar" aria-label="Avancement estimé de la synthèse" aria-valuemin="0" aria-valuemax="100" hidden></span>
      <p class="item-sub" data-feedback-status role="status"></p>
      ${feedbackEditor(summary)}
      <p class="item-sub">Relisez la synthèse avant l’envoi. Si elle est vide, le texte saisi sera transmis.</p>
      <div class="modal-actions"><button type="submit" name="action" value="draft" class="secondary">Enregistrer le brouillon</button>
        <button type="submit" name="action" value="send" class="primary" ${enough?'':'disabled'}>Envoyer à l’AMO</button></div>
    </form>`);
}

function submitTrainerFeedback(event){
  event.preventDefault();
  if(state.role!=='formateur'||state.modal?.kind!=='trainer-feedback')return;
  const context=trainerFeedbackContext(state.modal.id);
  if(!context)return;
  const form=event.currentTarget;
  if(form.dataset.editing==='true')syncFeedbackSummary(form.querySelector('[data-feedback-preview]'));
  const summary=form.elements.summary.value.trim();
  if(context.feedback?.sentAt){
    if(event.submitter?.value!=='update'||!context.feedback.summary)return;
    if(!summary||!feedbackSummaryLines(summary).some(line=>line.text&&!line.heading))return flash('Saisissez le contenu de la synthèse.');
    context.feedback.summary=summary;
    save();
    render();
    return flash('Synthèse mise à jour pour l’AMO.');
  }
  const source=form.elements.source.value.trim();
  if(!source)return flash('Saisissez votre retour.');
  const sending=event.submitter?.value==='send';
  if(sending&&source.length<feedbackMinLength)return flash('Le retour doit contenir au moins '+feedbackMinLength+' caractères.');
  const {sessionId,day,trainerId,feedback}=context;
  const entries=db.trainerFeedback??=[];
  const record={sessionId,day,trainerId,source,summary,sentAt:sending?new Date().toISOString():null};
  if(feedback)Object.assign(feedback,record);
  else entries.push(record);
  save();
  closeModal();
  flash(sending?'Retour envoyé à l’AMO dans cette démo.':'Brouillon enregistré.');
}

async function generateTrainerFeedback(button){
  const form=button.form;
  const context=state.role==='formateur'&&trainerFeedbackContext(state.modal?.id);
  if(!context||context.feedback?.sentAt)return;
  const source=form.elements.source.value.trim();
  const summary=form.elements.summary;
  const status=form.querySelector('[data-feedback-status]');
  if(source.length<feedbackMinLength||form.dataset.editing==='true')return;
  const previous=summary.value;
  const progress=form.querySelector('[data-feedback-progress]');
  const started=Date.now();
  const displayProgress=value=>{
    progress.textContent=value+' %';
    progress.setAttribute('aria-valuenow',value);
  };
  form.dataset.generating='true';
  updateFeedbackCount(form);
  status.textContent='';
  progress.hidden=false;
  displayProgress(0);
  const timer=setInterval(()=>{
    displayProgress(Math.min(95,Math.floor(100*(1-Math.exp(-(Date.now()-started)/5000)))));
  },150);
  try{
    const response=await fetch('/api/retours-formateur/synthese',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({day:context.day,text:source}),signal:AbortSignal.timeout(120000)
    });
    const data=await response.json();
    if([400,422,429,503].includes(response.status)&&typeof data.error==='string'){
      status.textContent=data.error;
      return;
    }
    if(!response.ok)throw new Error('Synthèse indisponible');
    if(typeof data.summary!=='string'||!data.summary.trim())throw new Error('Synthèse vide');
    if(form.elements.source.value.trim()!==source||summary.value!==previous){
      status.textContent='Le retour a changé pendant la génération. Relancez la synthèse si nécessaire.';
      return;
    }
    summary.value=feedbackSummaryLines(data.summary).map(line=>line.heading?'### '+line.text:line.bullet&&line.text?'• '+line.text:line.text).join('\n').trim();
    form.dataset.summarySource=source;
    updateFeedbackPreview(summary);
    displayProgress(100);
    status.textContent='Synthèse prête à relire.';
  }catch{
    status.textContent='Synthèse indisponible. Vous pouvez conserver un brouillon ou envoyer votre texte.';
  }finally{
    clearInterval(timer);
    form.dataset.generating='false';
    updateFeedbackCount(form);
    if(progress.getAttribute('aria-valuenow')==='100'){
      setTimeout(()=>{if(form.dataset.generating!=='true')progress.hidden=true;},450);
    }else progress.hidden=true;
  }
}

const hubAppearance={
  white:{label:'Blanc',folder:'assets/icons/white/',color:'#f8f5ff',manifest:'manifest-blanc.webmanifest'},
  violet:{label:'Violet',folder:'assets/icons/',color:'#6632bb',manifest:'manifest.webmanifest'},
  gradient:{label:'Dégradé',folder:'assets/icons/gradient/',color:'#28206d',manifest:'manifest-degrade.webmanifest'}
};

function applyHubAppearance(key){
  const choice=Object.hasOwn(hubAppearance,key)?key:'violet';
  const appearance=hubAppearance[choice];
  document.documentElement.dataset.hubAppearance=choice;
  applyHubTheme(currentHubTheme());
  document.querySelector('link[rel="manifest"]').setAttribute('href',appearance.manifest);
  if(!document.querySelector('link[data-hub-icon]')){
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(link=>link.remove());
    for(const [file,sizes,rel] of [
      ['favicon.ico','16x16 32x32 48x48','icon'],
      ...[16,32,48].map(size=>[`favicon-${size}.png`,`${size}x${size}`,'icon']),
      ['apple-touch-icon.png','180x180','apple-touch-icon']
    ]){
      const link=document.createElement('link');
      link.rel=rel;
      link.setAttribute('sizes',sizes);
      link.dataset.hubIcon=file;
      document.head.append(link);
    }
  }
  document.querySelectorAll('link[data-hub-icon]').forEach(link=>{
    const file=link.dataset.hubIcon;
    link.setAttribute('href',file==='favicon.ico'&&choice==='violet'?file:appearance.folder+file);
  });
}

function currentHubAppearance(){
  return document.documentElement.dataset.hubAppearance||'violet';
}

function chooseHubAppearance(key){
  if(!Object.hasOwn(hubAppearance,key))return;
  applyHubAppearance(key);
  try{localStorage.setItem('certifia-hub-appearance',key)}catch(e){}
  render();
  $('hub-icon-'+key)?.focus();
  $('appearance-status').textContent='Variante sélectionnée : '+hubAppearance[key].label+'.';
}

function settingsButton(){
  return `<button type="button" class="hub-settings-button" aria-label="Réglages" title="Réglages" onclick="openHubSettings()">${mobileIcon('settings',21)}</button>`;
}

function openHubSettings(){
  prepareHubCharterDownload();
  openModal('hub-settings');
  $('settings-heading')?.focus();
}

function hubSettingsPanel(){
  const selected=currentHubAppearance(),theme=currentHubTheme();
  return `<h2 id="settings-heading" tabindex="-1">Réglages</h2>
    <fieldset class="theme-field"><legend>Thème</legend>
      <div class="theme-options">${[['light','Clair','sun'],['dark','Sombre','moon'],['auto','Automatique','display']].map(([key,label,icon])=>`<label class="theme-option"><input id="hub-theme-${key}" name="hub-theme" type="radio" value="${key}" ${theme===key?'checked':''} onchange="chooseHubTheme(this.value)"><span class="theme-option-content">${mobileIcon(icon,21)}<strong>${label}</strong></span></label>`).join('')}</div>
      <p class="item-sub">Automatique suit le thème de ton appareil. Tes réglages sont enregistrés sur cet appareil.</p>
    </fieldset>
    <fieldset class="appearance-field"><legend>Icône et couleur du Hub</legend>
      <div class="appearance-options">${Object.entries(hubAppearance).map(([key,item])=>`<label class="appearance-option" for="hub-icon-${key}">
        <input id="hub-icon-${key}" name="hub-icon" type="radio" value="${key}" ${selected===key?'checked':''} onchange="chooseHubAppearance(this.value)">
        <img src="${item.folder}pwa-192.png" width="64" height="64" alt=""><strong>${item.label}</strong>
      </label>`).join('')}</div>
      <p class="item-sub">Sur mobile, pour changer l’icône de l’écran d’accueil, supprime le raccourci du Hub, retourne sur le site dans ton navigateur, puis réinstalle l’application depuis le site web.</p>
      <div class="sr-announcement" id="appearance-status" role="status"></div>
    </fieldset>
    <section class="settings-documents" aria-label="Tests de démonstration">
      <h3>Données de test</h3>
      <p class="item-sub">Laurent · Groupe Atlas · session du jour, J1 et J2 à compléter. Laurent · session passée, retour envoyé. Sophie · Atelier Cobalt, brouillon à reprendre.</p>
      <button class="secondary" onclick="resetDemo()">Réinitialiser les données fictives</button>
    </section>
    <section class="settings-documents" aria-label="Informations et documents">
      <h3>Informations et documents</h3>
      <a class="settings-document" href="https://www.certif-ia.fr/legal/mentions-l%C3%A9gales" target="_blank" rel="noopener noreferrer"><span>${mobileIcon('docs',18)}</span><div><strong>Mentions légales</strong><small>Site officiel de Certif-IA</small></div>${mobileIcon('chevron',18)}</a>
      <details class="settings-document settings-terms"><summary><span>${mobileIcon('docs',18)}</span><div><strong>Conditions d’utilisation</strong><small>Version de démonstration</small></div>${mobileIcon('chevron',18)}</summary>
        <div class="settings-terms-body"><p>Ce Hub permet de tester les parcours AMO et formateur avec des données fictives. Utilisez des informations et des fichiers de démonstration.</p>
        <p>Les réglages, les modifications et les fichiers importés sont conservés dans le navigateur de cet appareil. Les propositions et notifications sont simulées dans le Hub.</p></div>
      </details>
      <a class="settings-document" href="${hubCharterFile}" download="${hubCharterFilename}" onclick="saveHubCharter(event)"><span>${mobileIcon('docs',18)}</span><div><strong>Charte de collaboration Certif-IA</strong><small>Télécharger le PDF · Version 2026</small></div>${mobileIcon('download',18)}</a>
    </section>`;
}

const hubSystemTheme=window.matchMedia('(prefers-color-scheme: dark)');
const hubThemes=['light','dark','auto'];
const hubCharterFile='assets/documents/charte-collaboration-certif-ia-2026.pdf';

function currentHubTheme(){
  return document.documentElement.dataset.hubTheme||'auto';
}

function applyHubTheme(value){
  const preference=hubThemes.includes(value)?value:'auto';
  const dark=preference==='dark'||(preference==='auto'&&hubSystemTheme.matches);
  const root=document.documentElement;
  root.dataset.hubTheme=preference;
  root.dataset.hubTone=dark?'dark':'light';
  const appearance=hubAppearance[root.dataset.hubAppearance]||hubAppearance.violet;
  document.querySelector('meta[name="theme-color"]').content=dark?'#20182d':appearance.color;
}

function chooseHubTheme(value){
  if(!hubThemes.includes(value))return;
  applyHubTheme(value);
  try{localStorage.setItem('certifia-hub-theme',value)}catch(e){}
}

let hubCharterDownload;
let hubCharterShareFile;
const hubCharterFilename='Charte-Collaboration-Certif-IA-2026.pdf';

function prepareHubCharterDownload(){
  if(!navigator.canShare||!navigator.share||!isAppleMobile())return;
  hubCharterDownload||=fetch(hubCharterFile).then(response=>{
    if(!response.ok)throw new Error('Charte indisponible');
    return response.blob();
  }).then(blob=>{
    hubCharterShareFile=new File([blob],hubCharterFilename,{type:'application/pdf'});
  }).catch(()=>{hubCharterDownload=null});
}

function isAppleMobile(){
  return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}

function saveHubCharter(event){
  if(!hubCharterShareFile||!isAppleMobile()||!navigator.canShare?.({files:[hubCharterShareFile]}))return;
  event.preventDefault();
  const link=event.currentTarget;
  navigator.share({files:[hubCharterShareFile]}).catch(error=>{
    if(error.name==='AbortError')return;
    hubCharterShareFile=null;
    link.click();
  });
}

function monthlyBonusPanel(report){
  return `<section class="card monthly-bonus-panel">${cardTitle('Bonus attribués sur la période',trainerBonusValue+' points par bonus. Le score individuel reste plafonné à 100.')}
    ${report.bonusByTrainer.length?report.bonusByTrainer.map(t=>`<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(t.id))}</strong><div class="item-sub">${t.count} bonus</div></div><span class="badge green">+${t.points} points attribués</span></div>`).join(''):'<p class="empty">Aucun bonus attribué ce mois-ci.</p>'}</section>`;
}

let savedTheme='auto';
try{savedTheme=localStorage.getItem('certifia-hub-theme')}catch(e){}
applyHubTheme(savedTheme);
hubSystemTheme.addEventListener('change',()=>{if(currentHubTheme()==='auto')applyHubTheme('auto')});

let savedAppearance='violet';try{savedAppearance=localStorage.getItem('certifia-hub-appearance')}catch(e){}applyHubAppearance(savedAppearance);
initV17();state.calendarDate=parisToday();const upcomingStaffing=db.sessions.filter(s=>s.date>=state.calendarDate&&s.status!=='Annulée'&&openCount(s)>0).sort((a,b)=>a.date.localeCompare(b.date))[0];if(upcomingStaffing)state.selectedSession=upcomingStaffing.id;try{const id=Number(localStorage.getItem(DEMO_KEY+'-active-trainer'));if(trainerById(id))state.trainerId=id}catch(e){}simulateDueReminders(true);restoreHash();deliverInboxReminders();render();setInterval(()=>{simulateDueReminders(true);refreshOperationalInbox()},60000);
window.addEventListener('hashchange',()=>{restoreHash();render()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.modal)closeModal();else if(state.mobileMore)closeMobileMore();}});

function sessionFeedbackDeliverables(session){
 return db.assignments.filter(a=>a.sessionId===session.id&&['Confirmée','Réalisée','À revalider'].includes(a.status)).map(a=>trainerFeedbackDays(session).map(day=>{
 const feedback=feedbackRecord(session.id,day,a.trainerId),sent=!!feedback?.sentAt;
 return `<div class="doc-row pd-feedback-document"><span class="doc-icon">${mobileIcon('docs',16)}</span><div class="grow"><strong>Retour formateur J${day}</strong><div class="item-sub">${esc(trainerById(a.trainerId)?.name||'Formateur')} · ${fmtDate(shiftDate(session.date,day-1))}</div></div>${badge(sent?'Reçu':'À fournir')}${sent?`<button class="secondary tiny" onclick="openModal('trainer-feedback','${session.id}:${day}:${a.trainerId}')">Lire</button>`:''}</div>`;
 }).join('')).join('');
}

function staffingCandidateCard(t,s,score=compatDetails(t,s),experience=candidateExperience(t,s),nps=trainerNpsValue(t.id)){
 const reasons=new Set([...score.reasons.filter(r=>!r.toLowerCase().includes('disponib')&&r!=='Mobilité à confirmer'),mobilitySummary(t,s)]);
 if(experience.verified)reasons.add('Expertise vérifiée');
 if(experience.sameClient)reasons.add('Est déjà intervenu chez ce client');
 return `<article class="staffing-profile"><header class="staffing-profile-head">${trainerAvatar(t,42)}<div class="grow"><button type="button" class="staffing-profile-name ops-profile-link" onclick="state.trainerDetailTab='overview';openTrainer(${t.id})">${esc(t.name)} ${mobileIcon('chevron',14)}</button><div class="staffing-location">${mobileIcon('pin',13)} ${esc(t.city)}</div></div><div class="staffing-rate"><strong>${esc(t.rate)} €</strong><span>TTC / jour</span></div>${trainerReviewButtons(t)}</header>
 <div class="ops-candidate-facts">${trainerRatingBadge(t.rating)}<span class="ops-candidate-nps"><small>NPS indicatif</small><strong>${Number.isFinite(nps)?trainerNps(t.id,nps):'Non renseigné'}</strong></span></div>
 <div class="ops-candidate-availability"><span class="staffing-availability">${mobileIcon('check',14)} Disponible sur le créneau</span><button class="ghost tiny" aria-label="Vérifier le planning de ${esc(t.name)}" onclick="openTrainerPlanning(${t.id})">Vérifier le planning</button></div>
 <div class="staffing-criteria">${[...reasons].map(r=>`<span>${esc(r)}</span>`).join('')}</div>
 <div class="ops-candidate-context">${reliabilityBadge(t)} · ${experience.finished} mission(s) terminée(s) recensée(s)</div><footer class="staffing-profile-footer"><button class="staffing-match" onclick="openModal('matching',${t.id})" aria-label="Détail de compatibilité de ${esc(t.name)} : ${score.total}%"><span>Compatibilité indicative</span><strong>${score.total}<small>%</small></strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg></button><button class="primary tiny" onclick="prepareProposal(${t.id})">Préparer une proposition ${mobileIcon('chevron',14)}</button></footer></article>`;
}

function matchingDetailsModal(id){
 const t=trainerById(id),s=sessionById(state.selectedSession);
 if(state.role!=='amo'||!t||!s)return modalBox('Profil indisponible','','');
 const c=compatDetails(t,s);
 const exact=c.parts[0][1]===40,related=c.parts[0][1]===30;
 const descriptions=[
 exact?`La spécialité « ${s.topic} » figure dans les compétences déclarées de ${t.name}. Correspondance exacte : 40 points sur 40.`:related?`Une compétence déclarée est apparentée à « ${s.topic} ». Correspondance partielle : 30 points sur 40. Le périmètre de la mission reste à confirmer.`:`Aucune correspondance directe avec « ${s.topic} » dans les compétences déclarées (${t.skills.join(', ')}). La grille attribue 10 points par défaut ; ces points ne valident pas l’expertise.`,
 c.eligible?`Le ${fmtDate(s.date)}, les disponibilités déclarées couvrent tout le créneau ${s.start}–${s.end}, sans conflit détecté dans le Hub. Le profil n’est pas marqué « À ne pas staffer » : 30 points sur 30.`:`Le profil ne remplit pas les conditions de suggestion pour le ${fmtDate(s.date)}, de ${s.start} à ${s.end}. Vérifier la couverture du créneau, les conflits et le statut interne : 0 point sur 30.`,
 t.city===s.city?`Le formateur et la session sont localisés à ${s.city} : 20 points sur 20.`:`Le formateur est basé à ${t.city} et la session se déroule à ${s.city}. La grille attribue 8 points sur 20 aux villes différentes ; elle ne calcule ni distance ni temps de trajet. Confirmer la mobilité${s.modality==='Visio'?' ; la grille géographique reste appliquée même en visio':''}.`,
 `${t.missions} missions sont indiquées sur le profil. Barème : moins de 5 missions = 4 points, de 5 à 9 = 7 points, 10 et plus = 10 points. Ce critère mesure le volume déclaré, pas la satisfaction.`
 ];
 return modalBox('Détail de compatibilité',esc(t.name+' · '+clientOf(formOf(s)).name+' · '+fmtDate(s.date)),
 `<div class="match-overview"><div><span>Score global</span><strong>${c.total}<small>/100</small></strong></div><div class="match-overview-summary"><strong>${c.eligible?'Disponible sur le créneau':'Conditions de disponibilité non remplies'}</strong><p>${exact?'Expertise déclarée correspondante.':related?'Expertise apparentée à confirmer.':'Expertise à vérifier avant proposition.'} ${t.city!==s.city?'Mobilité à confirmer.':''}</p></div></div>
 <div class="match-breakdown">${c.parts.map(([name,points,max],i)=>`<section class="match-criterion"><header><h3>${esc(name)}</h3><span><strong>${points}</strong> / ${max} pts</span></header>${progress(Math.round(points/max*100),name)}<p>${esc(descriptions[i])}</p></section>`).join('')}</div>
 <p class="match-method">Le score additionne les quatre critères. Pondération de démonstration : expertise 40 %, disponibilité 30 %, localisation 20 %, expérience 10 %. Il aide à comparer les profils ; la confirmation du formateur reste nécessaire.</p><div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button></div>`);
}
