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
const clients=[{id:'C1',name:'Groupe Atlas'},{id:'C2',name:'Studio Nova'},{id:'C3',name:'Atelier Cobalt'},{id:'C4',name:'Maison Oria'}];
const formations=[
{id:'F1',clientId:'C1',title:'IA générative — équipes métier',status:'En préparation',owner:'AMO',program:'IA générative et méthodes métier',sessionIds:[101,105]},
{id:'F2',clientId:'C2',title:'Claude pour la création',status:'Planifiée',owner:'AMO',sessionIds:[102]},
{id:'F3',clientId:'C3',title:'Automatiser ses processus',status:'En préparation',owner:'AMO',sessionIds:[103]},
{id:'F4',clientId:'C4',title:'ChatGPT pour les managers',status:'À qualifier',owner:'AMO',sessionIds:[104]}
];
const seedSessions=[
{id:101,formationId:'F1',date:'2026-11-12',start:'09:00',end:'17:00',city:'Paris',people:14,required:1,status:'Planifiée',topic:'IA générative',modality:'Présentiel'},
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
C4:{industry:'Conseil et management',employees:60,city:'Paris',address:'',website:'',contact:'Contact client non renseigné',hubspot:'Référence HubSpot à connecter',notesTrainer:'Préparation orientée managers'}
};
const missionRatings={'A3':{score:9.1,period:'2026-10',nps:9.1,certif:9.3,participants:9.0,public:true,source:'Évaluation fictive'},'A2':{score:null,period:'2026-11',nps:null,source:'À évaluer'},'A1':{score:null,period:'2026-11',nps:null,source:'À évaluer'}};
const proposedMatchingWeights={expertise:40,availability:30,localisation:20,experience:10};
const proposedReliabilityWeights={delivery:30,nps:40,feedback:10,incidents:20}; // V1.9, démonstration non approuvée métier
function initV17(){if(!db.staffingDemoSlots){db.staffingDemoSlots=true;const sample=[[1,102],[6,102],[4,104]];for(const [trainerId,sessionId] of sample){const session=sessionById(sessionId);if(session&&!db.availability.some(a=>a.trainerId===trainerId&&a.date===session.date))db.availability.push({id:'AV-demo-'+trainerId+'-'+sessionId,trainerId,date:session.date,start:session.start,end:session.end,status:'Disponible',source:'déclaration démo'})}}if(!db.reminders)db.reminders=[];if(!db.feedback)db.feedback=[];if(!db.notifLog)db.notifLog=[];if(!db.internalReviews)db.internalReviews=[];for(const d of db.deliverables){if(d.status==='Correction demandée')d.status='Refusé';for(const v of d.versions||[])if(v.status==='Correction demandée')v.status='Refusé';if(!d.dueDate){let se=sessionById(d.sessionId);d.dueDate=se?shiftDate(se.date,d.type==='PROGRAMME'?-7:d.type==='SUPPORT'?-3:7):'2026-11-20'}}}
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
 const incidents=db.internalReviews.filter(r=>r.trainerId===t.id&&r.kind==='carton'&&r.verified===true);
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
function responseRate(t){let p=db.proposals.filter(x=>x.trainerId===t.id&&['Envoyée','Acceptée','Refusée'].includes(x.status));let a=p.filter(x=>['Acceptée','Refusée'].includes(x.status));return p.length?`${Math.round(100*a.length/p.length)} % (${a.length}/${p.length} propositions démo)`:'Aucune sollicitation mesurable';}
function submitInternalReview(id){if(state.role==='formateur')return flash('Action interne uniquement');let kind=$('review-kind')?.value,level=$('review-level')?.value,memo=$('review-reason')?.value.trim();if(!['observation','carton','bonus'].includes(kind))return flash('Choisissez une nature.');if(!memo||memo.length<10)return flash('Un justificatif de 10 caractères minimum est obligatoire');db.internalReviews.push({id:'IR'+Date.now(),trainerId:id,kind,level:kind==='carton'?level:null,reason:memo,verified:false,public:false,createdAt:new Date().toISOString(),author:'AMO (démonstration)'});if(kind==='carton')state.freshCard=id;if(kind==='bonus')state.freshBonus=db.internalReviews.at(-1).id;log(kind==='bonus'?'Bonus enregistré':'Observation interne simulée',`${id} · ${kind}`);render();flash(kind==='bonus'?'Bonus enregistré dans la fiche interne.':'Observation enregistrée en démo');}
function internalReviewsCard(t){let items=db.internalReviews.filter(r=>r.trainerId===t.id);return `<div class="card" style="margin-top:16px"><h3 class="section-title">Gestion interne · accès AMO uniquement</h3><p class="section-caption">Observations, bonus, cartons motivés et taux de réponse. Aucune de ces notes n'est communiquée au portail Formateur.</p><div class="info" style="margin:12px 0"><small>Taux de réponse (propositions démo)</small><strong>${esc(responseRate(t))}</strong></div><div class="form-grid"><label>Nature<select class="field" id="review-kind" onchange="document.getElementById('review-level-field').hidden=this.value!=='carton'"><option value="observation">Observation AMO</option><option value="carton">Carton avec justificatif</option><option value="bonus">Bonus</option></select></label><label id="review-level-field" hidden>Type de carton<select class="field" id="review-level"><option value="jaune">Jaune</option><option value="rouge">Rouge</option></select></label></div><label class="form-label" for="review-reason">Justificatif / contexte</label><textarea class="field" id="review-reason" placeholder="Faits précis, mission, date, actions correctives…"></textarea><button class="primary" style="margin-top:10px" onclick="submitInternalReview(${t.id})">Enregistrer</button><div class="stack" style="margin-top:16px">${items.slice().reverse().map(r=>`<div class="info ${r.kind==='bonus'?'bonus-review':''} ${state.freshBonus===r.id?'bonus-reveal':''}"><strong>${r.kind==='bonus'?mobileIcon('bonus',16):''} ${r.kind==='carton'?'Carton '+esc(r.level):r.kind==='bonus'?'Bonus':'Observation'} · ${esc(r.createdAt.slice(0,10))}</strong><p>${esc(r.reason)}</p><small>${esc(r.author)} · ${r.kind==='bonus'?'Reconnaissance interne':r.verified?'Vérifié':'Non vérifié — aucune pénalité'}</small></div>`).join('')||'<p class="item-sub">Aucune observation enregistrée dans cette démo.</p>'}</div><p class="footnote">La validation métier, les recours et l’accès serveur sécurisé restent à définir. Les faits non vérifiés ne modifient pas la fiabilité.</p></div>`;}

function clone(x){return JSON.parse(JSON.stringify(x))}
function loadData(){try{let raw=JSON.parse(localStorage.getItem(DEMO_KEY));if(raw&&raw.version===1&&raw.data&&Array.isArray(raw.data.sessions))return raw.data;}catch(e){}return clone(initialData)}
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
function setRole(value){state.mobileMore=false;state.slotsExpanded=false;state.profileEdit=false;state.modal=null;if(value.startsWith('trainer-')){state.role='formateur';state.trainerId=Number(value.split('-')[1]);try{localStorage.setItem(DEMO_KEY+'-active-trainer',state.trainerId)}catch(e){}state.page='trainer-home'}else{state.role='amo';state.page='home'}state.menuOpen=false;state.search='';state.filter='all';navigateHash();render()}
function go(page){state.profileEdit=false;state.profilePhotoDraft=null;state.profilePhotoPending=false;state.page=page;state.mobileMore=false;state.menuOpen=false;state.modal=null;state.search='';state.filter='all';navigateHash();render();window.scrollTo(0,0)}
function navigateHash(){
  const detail={'session-detail':state.selectedSession,'formation-detail':state.selectedFormation,'trainer-folder':state.selectedDocGroup}[state.page];
  const path=(state.role==='formateur'?'formateur':'interne')+'/'+state.page+(detail?'/'+encodeURIComponent(detail):'');
  if(location.hash!=='#/'+path)history.pushState(null,'','#/'+path);
}
function openFormation(id){state.selectedFormation=id;go('formation-detail')}
function openSession(id){state.selectedSession=Number(id);go('session-detail')}
function openTrainer(id){state.selectedTrainer=Number(id);go('trainer-detail')}
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
}
function validPages(role){return role==='formateur'?['trainer-home','trainer-missions','trainer-calendar','trainer-docs','trainer-profile','trainer-folder']:['home','planning','formations','formation-detail','session-detail','trainers','trainer-detail','clients','client-detail','staffing','documents','reporting']}
const mobileSymbols={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19"/>',moon:'<path d="M20.9 14.3A9 9 0 0 1 9.7 3.1 9 9 0 1 0 20.9 14.3Z"/>',display:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',settings:'<path d="M10 2h4l.6 2.5 1.6.9 2.5-.7 2 3.5-1.8 1.8v2l1.8 1.8-2 3.5-2.5-.7-1.6.9L14 20h-4l-.6-2.5-1.6-.9-2.5.7-2-3.5L5.1 12v-2L3.3 8.2l2-3.5 2.5.7 1.6-.9z" transform="translate(0 1)"/><circle cx="12" cy="12" r="3"/>',bonus:'<path d="M12 2l2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 8.2l6-.8z"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',trainers:'<circle cx="9" cy="7" r="3"/><path d="M2 20v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2M17 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/>',clients:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2m-6 6v-3h4v3"/>',reporting:'<path d="M3 3v18h18M8 16v-5m5 5V7m5 9v-8"/>',pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',staff:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 8h5M19.5 5.5v5"/>',docs:'<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M7 13h10M7 17h7"/>',more:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',missions:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',back:'<path d="m14 6-6 6 6 6"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',chevron:'<path d="m9 18 6-6-6-6"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>'};
function mobileIcon(name,size=21){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${mobileSymbols[name]||mobileSymbols.more}</svg>`}
function mobileIsDetail(page){return ['formation-detail','session-detail','trainer-detail','client-detail','trainer-folder','trainer-profile'].includes(page)}
function mobileBackTarget(page){return ({'formation-detail':'formations','session-detail':'formations','trainer-detail':'trainers','client-detail':'clients','trainer-folder':'trainer-docs','trainer-profile':'trainer-home'})[page]||'home'}
function mobileTabItems(trainer){return trainer?[['trainer-home','home','Accueil'],['trainer-missions','missions','Missions'],['trainer-calendar','calendar','Agenda'],['trainer-docs','docs','Livrables']]:[['home','home','Accueil'],['planning','calendar','Agenda'],['staffing','staff','Staffing'],['documents','docs','Livrables'],['more','more','Plus']]}
function mobileIsActive(key,trainer){if(key==='more')return ['formations','formation-detail','session-detail','trainers','trainer-detail','clients','client-detail','reporting'].includes(state.page)||!!state.mobileMore;return state.page===key||(key==='trainer-docs'&&state.page==='trainer-folder')}
function mobileDock(trainer){return `<nav class="mobile-dock" aria-label="Navigation principale sur téléphone">${mobileTabItems(trainer).map(([key,icon,label])=>`<button type="button" class="mobile-dock-item ${mobileIsActive(key,trainer)?'is-active':''}" ${mobileIsActive(key,trainer)?'aria-current="page"':''} aria-label="${label}" onclick="${key==='more'?'openMobileMore()':`go('${key}')`}"><span class="mobile-dock-icon">${mobileIcon(icon,22)}</span><span class="mobile-dock-label">${label}</span></button>`).join('')}</nav>`}
function trainerNotifications(){
  const id=state.trainerId;
  const proposals=db.proposals.filter(p=>p.trainerId===id&&p.status==='Envoyée').map(p=>({
    key:'proposal:'+p.id,
    title:'Nouvelle proposition de mission',
    detail:clientOf(formOf(sessionById(p.sessionId))).name,
    action:"changeTab('missionTab','proposals');go('trainer-missions')",
    label:'Voir mes propositions'
  }));
  const reminders=db.reminders.filter(r=>r.channel==='PWA').flatMap(r=>{
    const doc=db.deliverables.find(d=>d.id===r.deliverableId&&d.trainerId===id&&d.owner==='formateur');
    return doc?[{key:'reminder:'+r.id,title:'Rappel de livrable',detail:doc.title,action:`openTrainerFolder(${doc.sessionId})`,label:'Voir le dossier'}]:[];
  });
  const refusals=db.deliverables.filter(d=>d.trainerId===id&&d.owner==='formateur'&&d.status==='Refusé').map(d=>({
    key:'refusal:'+d.id+':'+(d.versions.at(-1)?.number||0),
    title:'Livrable refusé',detail:d.title,action:`openModal('document-preview','${d.id}')`,label:'Ouvrir le document'
  }));
  return [...proposals,...refusals,...reminders];
}

function trainerNotificationBell(){
  const seen=db.seenNotifications?.[state.trainerId]||[];
  const unread=trainerNotifications().filter(n=>!seen.includes(n.key)).length;
  const label=unread?`Notifications, ${unread} non lue${unread>1?'s':''}`:'Notifications';
  return `<button class="mobile-bell" aria-label="${label}" title="Notifications" onclick="openTrainerNotifications()">${mobileIcon('bell',21)}${unread?'<span class="mobile-bell-dot" aria-hidden="true"></span>':''}</button>`;
}

function openTrainerNotifications(){
  if(state.role!=='formateur')return;
  db.seenNotifications||={};
  const seen=db.seenNotifications[state.trainerId]||[];
  db.seenNotifications[state.trainerId]=[...new Set([...seen,...trainerNotifications().map(n=>n.key)])];
  save();
  openModal('trainer-notifications');
}

function trainerNotificationPanel(){
  const items=trainerNotifications();
  return modalBox('Notifications','',items.map(n=>`<div class="line-item"><div class="grow"><strong>${esc(n.title)}</strong><div class="item-sub">${esc(n.detail)}</div></div><button class="secondary tiny" onclick="${n.action}">${n.label}</button></div>`).join('')||'<div class="empty">Aucune notification pour le moment.</div>');
}

function mobileHead(trainer,title){const back=mobileIsDetail(state.page);return `<div class="mobile-app-head"><button class="mobile-brand-button" aria-label="${back?'Retour à la liste':'Aller à l’accueil'}" onclick="go('${back?mobileBackTarget(state.page):trainer?'trainer-home':'home'}')">${back?mobileIcon('back',22):`<img src="${hubAppearance[currentHubAppearance()].folder}favicon-48.png" width="33" height="33" alt=""/>`}</button><div class="mobile-head-center"><span class="mobile-head-eyebrow">${trainer?'PORTAIL FORMATEUR':'CERTIF-IA HUB · AMO'}</span><strong>${esc(title)}</strong></div><div class="mobile-header-actions">${trainer?`${trainerNotificationBell()}${settingsButton()}<button class="avatar profile-trigger" aria-label="Mon profil" onclick="go('trainer-profile')">${photoContent(trainerById(state.trainerId))}</button>`:`<button class="mobile-bell" title="Notifications de démonstration" aria-label="Notifications" onclick="openAmoNotifications()">${mobileIcon('bell',21)}${amoNotifications().length?'<span class="mobile-bell-dot" aria-hidden="true"></span>':''}</button>${settingsButton()}`}</div></div>`}
function openMobileMore(){state.mobileMore=true;render()}
function closeMobileMore(){state.mobileMore=false;render()}
function mobileMoreSheet(){if(!state.mobileMore||state.role==='formateur')return '';const choices=[['formations','missions','Formations','Dossiers et sessions'],['trainers','trainers','Formateurs','Annuaire & profils'],['clients','clients','Clients','Annuaire & historique'],['reporting','reporting','Monthly AMO','Rapport mensuel']];return `<div class="mobile-sheet-overlay" role="presentation" onclick="if(event.target===this)closeMobileMore()"><section class="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="Tous les modules"><div class="mobile-sheet-grip" aria-hidden="true"></div><div class="mobile-sheet-heading"><h2>Explorer le Hub</h2><button type="button" aria-label="Fermer" class="mobile-sheet-close" onclick="closeMobileMore()">${mobileIcon('close',20)}</button></div><div class="mobile-more-list">${choices.map(([page,icon,title,desc])=>`<button type="button" onclick="go('${page}')"><span class="more-section-icon">${mobileIcon(icon,20)}</span><span class="grow"><strong>${title}</strong><small>${desc}</small></span>${mobileIcon('chevron',19)}</button>`).join('')}</div><div class="mobile-more-settings"><label for="mobile-role-switch">Changer de profil démo</label><select class="field" id="mobile-role-switch" onchange="setRole(this.value)"><option value="amo">AMO / Interne</option>${trainers.map(t=>`<option value="trainer-${t.id}">${esc(trainerOptionLabel(t))} · Formateur</option>`).join('')}</select><button type="button" onclick="resetDemo()">Réinitialiser les données fictives</button></div></section></div>`}
function decorateMobileTables(){document.querySelectorAll('.tbl').forEach(table=>{const th=[...table.querySelectorAll('thead th')].map(x=>x.textContent.trim());table.querySelectorAll('tbody tr').forEach(row=>{[...row.children].forEach((td,i)=>{if(td.tagName==='TD')td.setAttribute('data-mobile-label',th[i]||'Détail')})})})}

function render(){const frame=$('document-file-frame');if(frame)URL.revokeObjectURL(frame.src);let trainer=state.role==='formateur';if(!validPages(state.role).includes(state.page))state.page=trainer?'trainer-home':'home';let nav=trainer?[
['trainer-home','home','Mon espace'],['trainer-missions','missions','Mes missions'],['trainer-calendar','calendar','Mon agenda'],['trainer-docs','docs','Mes livrables']]:[
['home','home','Vue d’ensemble'],['planning','calendar','Planning global'],['formations','missions','Formations'],['trainers','trainers','Formateurs'],['clients','clients','Clients'],['staffing','staff','Staffing assisté'],['documents','docs','Livrables & bilans'],['reporting','reporting','Monthly AMO']];
let pageTitle=nav.find(n=>n[0]===state.page)?.[2]||({'trainer-profile':'Mon profil','trainer-folder':'Dossier de livrables','session-detail':'Session','formation-detail':'Formation'}[state.page]||'Détails');let people=trainerById(state.trainerId);document.title='Certif-IA Hub — '+pageTitle;
$('app').innerHTML=`<div class="app"><aside class="sidebar ${state.menuOpen?'open':''}" id="sidebar"><div><img src="assets/certifia-logo.png" class="brand-logo" alt="Certif-IA"><div class="logo-sub">Hub · Espace de démonstration</div></div><div class="nav-label">${trainer?'ESPACE FORMATEUR':'EXPANSION CLIENT'}</div><nav class="nav" aria-label="Navigation principale">${nav.map(([p,ic,label])=>`<button class="${state.page===p?'active':''}" ${state.page===p?'aria-current="page"':''} onclick="go('${p}')"><span class="ic" aria-hidden="true">${mobileIcon(ic,18)}</span>${label}</button>`).join('')}</nav><div class="side-bottom"><div class="nav-label">SIMULER UN PROFIL</div><select class="role-select" aria-label="Profil de démonstration" onchange="setRole(this.value)"><option value="amo" ${!trainer?'selected':''}>AMO / Espace interne</option>${trainers.map(t=>`<option value="trainer-${t.id}" ${trainer&&t.id===state.trainerId?'selected':''}>Formateur · ${esc(t.name)}</option>`).join('')}</select><p class="side-note">Démo locale · données et actions fictives<br>Aucune connexion aux outils réels</p><button class="reset-demo" onclick="resetDemo()">↺ Réinitialiser la démo</button></div></aside>${state.menuOpen?'<button class="sidebar-scrim" aria-label="Fermer le menu" onclick="toggleMenu()"></button>':''}<div class="shell"><header class="topbar">${mobileHead(trainer,pageTitle)}<div class="top-start"><button class="mobile-menu" aria-label="Ouvrir le menu" onclick="toggleMenu()">${mobileIcon('menu',16)}</button>${breadcrumbs(pageTitle)}</div><div class="top-right"><span class="pill">✦ Démonstration</span>${trainer?`${trainerNotificationBell()}${settingsButton()}<button class="avatar profile-trigger" aria-label="Mon profil" title="Mon profil" onclick="go('trainer-profile')">${photoContent(people)}</button>`:`<button class="secondary tiny desktop-notifications" aria-label="Notifications AMO" onclick="openAmoNotifications()">${mobileIcon('bell',19)}${amoNotifications().length?`<span>${amoNotifications().length}</span>`:''}</button>${settingsButton()}<div class="avatar">AM</div>`}</div></header><main class="main" id="main-content">${pageContent()}</main></div></div>${mobileDock(trainer)}${mobileMoreSheet()}${state.modal?modalView():''}<div id="toast-root" aria-live="polite"></div>`;
 decorateMobileTables();
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
function formationDetail(){let f=formations.find(x=>x.id===state.selectedFormation)||formations[0],ss=db.sessions.filter(s=>s.formationId===f.id),docs=db.deliverables.filter(d=>d.formationId===f.id);return `<button class="ghost" onclick="go('formations')">← Retour aux formations</button>${intro(esc(clientOf(f).name),esc(f.title),'FICHE FORMATION · DONNÉES FICTIVES')}<div class="toolbar">${badge(f.status)}<div class="group">${badge(ss.length+' session(s)')}<span class="badge blue">Données HubSpot simulées</span></div></div><div class="detail-grid"><div><div class="card">${cardTitle('Sessions de formation','Chaque session conserve son propre staffing et ses horaires')}${ss.map(s=>`<div class="line-item session-tile"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><div class="item-title">${esc(s.topic)} · ${esc(s.city)}</div><div class="item-sub">${s.start}–${s.end} · ${s.required} formateur(s) requis</div></div>${badge(staffingLabel(s))}<button class="ghost" onclick="openSession(${s.id})">Détail ↗</button></div>`).join('')}</div><div class="card" style="margin-top:18px">${cardTitle('Cycle de préparation')}${preparationCycle(ss)}</div></div><div><div class="card">${cardTitle('Livrables associés')}${docs.length?docs.map(d=>docLine(d)).join(''):'<div class="empty">Aucun document recensé.</div>'}<button class="secondary" style="margin-top:14px" onclick="go('documents')">Tous les livrables ↗</button></div><div class="card" style="margin-top:18px">${cardTitle('Sources prévues')}${db.sync.map(c=>`<div class="line-item"><div class="grow"><strong>${esc(c.name)}</strong><div class="item-sub">Intégration à venir</div></div>${badge(c.status)}</div>`).join('')}</div></div></div>`}
function sessionDetail(){let s=sessionById(state.selectedSession)||db.sessions[0],f=formOf(s),aa=activeAssignments(s.id),p=db.proposals.filter(p=>p.sessionId===s.id),docs=db.deliverables.filter(d=>d.sessionId===s.id);return `<button class="ghost" onclick="openFormation('${f.id}')">← Retour à la formation</button>${intro(esc(clientOf(f).name),esc(f.title),'FICHE SESSION · EXEMPLE FICTIF')}<div class="toolbar"><div class="group">${badge(s.status)}${badge(staffingLabel(s))}</div><button class="primary" onclick="staffFor(${s.id})">Gérer le staffing →</button></div><div class="detail-grid"><div><div class="card session-summary">${cardTitle('Informations de la session')}<div class="info-grid">${[['Date',fmtDate(s.date)],['Horaires',s.start+'–'+s.end],['Lieu',s.city],['Participants',s.people+' personnes'],['Modalité',s.modality],['Formateurs nécessaires',s.required],['Statut session',s.status],['Affectations confirmées',aa.length]].map(([k,v])=>`<div class="info"><small>${k}</small><strong>${esc(v)}</strong></div>`).join('')}</div></div><div class="card" style="margin-top:18px">${cardTitle('Affectations et propositions')}${aa.map(a=>`<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(a.trainerId))}</strong><div class="item-sub">Affectation ${esc(a.id)}</div></div>${badge(a.status)}</div>`).join('')}${p.map(x=>`<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(x.trainerId))}</strong><div class="item-sub">Proposition ${esc(x.id)}</div></div>${badge(x.status)}</div>`).join('')}${!aa.length&&!p.length?'<div class="empty">Aucune affectation ni proposition.</div>':''}</div><div class="card" style="margin-top:18px">${cardTitle('Documents et livrables')}${sessionDocuments(s,docs)}</div></div><div><div class="card">${cardTitle('Modifier la session','L’impact sur les affectations sera signalé')}<button class="secondary" onclick="openModal('reschedule',${s.id})">${mobileIcon('calendar',16)} Reporter la session</button><button class="secondary" style="margin-top:9px" onclick="go('planning')">Voir dans le planning</button></div><div class="card" style="margin-top:18px">${cardTitle('Traçabilité','État de démo')}${db.activity.filter(a=>a.detail.includes(String(s.id))).slice(0,5).map(a=>`<div class="line-item"><div class="grow"><strong>${esc(a.action)}</strong><div class="item-sub">${esc(a.detail)}</div></div></div>`).join('')||'<div class="empty">Aucune action enregistrée.</div>'}</div></div></div>`}
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
function trainersPage(){let rows=trainers.map(t=>trainerById(t.id)).filter(t=>(state.filter==='all'||(state.filter==='unknown'&&t.available==='unknown')||(state.filter==='available'&&t.available==='yes')||t.city===state.filter)&&(t.name+' '+t.skills.join(' ')+' '+t.city).toLowerCase().includes(state.search.toLowerCase()));return `${intro('Les <em>formateurs.</em>','Annuaire enrichi — LinkedIn, expertises, expérience et performances, visibles uniquement selon les droits internes.')}${filtersBar('Nom, compétence, ville…',[['all','Tous les profils'],['available','Disponibles déclarés'],['unknown','Disponibilité inconnue'],['Paris','Paris'],['Lyon','Lyon'],['Bordeaux','Bordeaux'],['Marseille','Marseille']])}<div class="toolbar"><div class="group"><button class="${state.trainerView==='cards'?'primary':'secondary'} tiny" onclick="changeTab('trainerView','cards')">${mobileIcon('grid',16)} Cartes</button><button class="${state.trainerView==='table'?'primary':'secondary'} tiny" onclick="changeTab('trainerView','table')">${mobileIcon('list',16)} Tableau</button></div><span class="badge purple">Référentiel Notion à connecter · données fictives</span></div>${state.trainerView==='cards'?`<div class="trainer-grid">${rows.map(t=>{let x=trainerProfileField(t.id);return `<div class="trainer-card trainer-directory-card ${trainerCardClass(t)}"><div class="trainer-top">${trainerAvatar(t)}<div><div class="trainer-name">${trainerName(t)}</div><div class="trainer-meta">${mobileIcon('pin',14)} ${esc(t.city)}</div></div></div><div class="trainer-rating-row">${trainerRatingBadge(t.rating)}</div><div class="tags">${t.skills.map(k=>`<span class="tag">${esc(k)}</span>`).join('')}</div>${availabilityBadge(t)}<div style="margin:9px 0">${reliabilityBadge(t)}</div><div class="trainer-stats v19-three"><div><small>Missions (démo)</small><strong>${t.missions}</strong></div><div><small>TJM TTC</small><strong>${money(t.rate)}</strong></div><div><small>Gains estimés*</small><strong>${money(gainsEstimate(t))}</strong></div></div><div class="item-sub">${esc(x.domain)} · ${x.nps==null?'NPS inconnu':'Satisfaction '+x.nps+'/10'}</div><div class="split-btns" style="margin-top:14px"><button class="secondary tiny" onclick="openTrainer(${t.id})">Voir la fiche</button><button class="primary tiny" onclick="selectTrainerForStaff(${t.id})">Staffer</button></div></div>`}).join('')}</div>`:`<div class="table-wrap"><table class="tbl"><thead><tr><th>Formateur</th><th>Classement</th><th>Spécialité</th><th>TJM TTC</th><th>NPS (démo)</th><th>Fiabilité</th><th>Gains estimés</th><th></th></tr></thead><tbody>${rows.map(t=>`<tr><td><strong>${trainerName(t)}</strong><div class="item-sub">${esc(t.city)}</div></td><td>${trainerRatingBadge(t.rating)}</td><td>${esc(trainerProfileField(t.id).domain)}</td><td>${t.rate} €</td><td>${trainerProfileField(t.id).nps??'Inconnu'}</td><td>${reliabilityBadge(t)}</td><td>${money(gainsEstimate(t))}</td><td><button class="ghost" onclick="openTrainer(${t.id})">Voir ↗</button></td></tr>`).join('')}</tbody></table></div>`}<p class="footnote">Schéma cible de <a class="text-link" href="https://app.notion.com/p/3e5c6d0eb96e809ab965c7f66813ffd8" target="_blank" rel="noopener noreferrer">Formateurs à staffer Q4 26 ↗</a> : Activité, Classement, LinkedIn, LLM, spécialités, localisation, TJM (TTC), NPS moyen, nombre de missions et cartons. Aucun profil réel n'a été importé ici.</p>`}
function selectTrainerForStaff(id){state.candidate=id;go('staffing')}
function trainerDetail(){
 if(state.role==='formateur')return '<div class="empty">Accès réservé à l’équipe interne.</div>';
 const t=trainerById(state.selectedTrainer)||trainers[0],x=trainerProfileField(t.id),aa=db.assignments.filter(a=>a.trainerId===t.id),tab=state.trainerDetailTab||'overview';
 const tabs=[['overview','Présentation'],['career','Profil professionnel'],['missions','Missions & scores'],['performance','Performances'],['internal','Gestion interne'],['agenda','Planning & staffing']];
 let content='';
 if(tab==='overview')content=`<div class="info-grid">${[['Activité',x.activity],['Classement',t.rating],['Spécialité',x.domain],['LLM',x.llm.join(', ')||'Inconnu'],['Localisation',t.city],['TJM TTC',money(t.rate)],['Missions fictives',t.missions],['NPS démo',x.nps==null?'Non renseigné':x.nps+'/10']].map(([k,v])=>`<div class="info"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}<div class="info"><small>E-mail</small>${safeContact(t.email,'email')}</div><div class="info"><small>Téléphone</small>${safeContact(t.phone||x.phone,'phone')}</div><div class="info"><small>LinkedIn</small>${linkSafe(t.linkedin||x.linkedin,'Ouvrir le profil')}</div></div><p class="footnote">Contacts fictifs ou absents : à synchroniser avec la base Notion autorisée, sans inventer de numéro ni de profil LinkedIn.</p>`;
 else if(tab==='career')content=`<div class="profile-columns">${[['Expériences',x.experience],['Domaine et connaissances',[x.domain,...x.knowledge]],['Forces',x.strengths],['Axes d’amélioration (interne)',x.improvements]].map(([name,list])=>`<div class="info"><small>${esc(name)}</small>${list.map(v=>`<p>• ${esc(v)}</p>`).join('')||'<p>Non renseigné</p>'}</div>`).join('')}</div>`;
 else if(tab==='missions')content=`<h3 class="section-title">Historique des missions</h3>${aa.map(a=>{let s=sessionById(a.sessionId),r=missionRatings[a.id];return `<div class="line-item"><div class="grow"><strong>${esc(clientOf(formOf(s)).name)} · ${esc(formOf(s).title)}</strong><div class="item-sub">${fmtDate(s.date)} · ${esc(s.city)}</div></div>${badge(r?.score!=null?r.score+'/10 · démo':'Non évaluée')}<button class="ghost" onclick="openSession(${s.id})">Détail ↗</button></div>`}).join('')||'<div class="empty">Aucune mission.</div>'}`;
 else if(tab==='performance')content=`<div class="cards">${metric('NPS moyen',x.nps==null?'Inconnu':x.nps+'/10','Donnée fictive')}${metric('Missions recensées',aa.length,'Dans la démo')}</div>${reliabilityCard(t)}`;
 else if(tab==='internal')content=internalReviewsCard(t);
 else content=`${availabilityBadge(t)}<div class="info" style="margin:16px 0"><small>Calendrier</small><strong>${esc(t.city)} · ${esc(x.domain)}</strong><p>Google Agenda non connecté.</p></div>${db.availability.filter(a=>a.trainerId===t.id).map(a=>`<div class="line-item">${fmtDate(a.date)} · ${esc(a.start||'Journée')} ${badge(a.status)}</div>`).join('')||'<div class="empty">Aucun créneau déclaré.</div>'}<button class="primary" onclick="selectTrainerForStaff(${t.id})">Préparer un staffing →</button>`;
 return `<button class="ghost" onclick="go('trainers')">← Retour à l’annuaire</button><div class="card profile-fiche ${trainerCardClass(t)}"><div class="trainer-top fiche-hero">${trainerAvatar(t,70)}<div><h1 class="headline" style="font-size:28px;margin:0">${trainerName(t)}</h1><div class="trainer-meta">${esc(t.city)} · ${esc(t.rating)}</div>${reliabilityBadge(t)}</div><div class="grow"></div>${availabilityBadge(t)}</div><div class="tabs tabs-scroll">${tabs.map(([key,label])=>`<button class="${key===tab?'selected':''}" onclick="changeTab('trainerDetailTab','${key}')">${label}</button>`).join('')}</div>${content}</div>`;
}
function reliabilityCard(t){let score=reliabilityScore(t);return `<div class="card" style="margin-top:16px"><div class="card-head"><div><h3 class="section-title">Fiabilité · grille proposée V1.9</h3><p class="section-caption">Satisfaction 40 %, ponctualité 30 %, incidents vérifiés 20 %, retours de missions 10 %</p></div>${badge('À valider métier')}</div>${score.parts.map(([label,value,weight])=>`<div class="line-item"><div class="grow"><strong>${esc(label)}</strong> <small>(${weight} %)</small></div><strong>${value==null?'Données insuffisantes':value+'/100'}</strong></div>`).join('')}<div class="line-item bonus-review"><div class="grow"><strong>${mobileIcon('bonus',16)} Bonus AMO</strong><div class="item-sub">${score.bonuses} bonus · 5 points par bonus, score plafonné à 100</div></div><strong>+${score.bonusPoints}</strong></div><p class="footnote">${score.total===null?'Fiabilité non évaluée.':(score.complete?'Base calculée':'Base illustrative')+' : '+score.base+'/100 · Score avec bonus : '+score.total+'/100.'} Les données manquantes ne sont jamais considérées comme zéro.</p></div>`;}
function openClient(id){state.selectedClient=id;go('client-detail')}
function clientsPage(){let rows=clients.filter(c=>(state.filter==='all'||clientDetails[c.id]?.city===state.filter)&&(c.name+' '+(clientDetails[c.id]?.industry||'')).toLowerCase().includes(state.search.toLowerCase()));return `${intro('Annuaire <em>clients.</em>','Un espace pour relier les dossiers HubSpot, les formations et les formateurs déjà mobilisés.')}${filtersBar('Client, secteur…',[['all','Tous les clients'],['Paris','Paris'],['Lyon','Lyon'],['Bordeaux','Bordeaux']])}<div class="toolbar"><div class="group"><button class="${state.clientView==='cards'?'primary':'secondary'} tiny" onclick="changeTab('clientView','cards')">${mobileIcon('grid',16)} Cartes</button><button class="${state.clientView==='table'?'primary':'secondary'} tiny" onclick="changeTab('clientView','table')">${mobileIcon('list',16)} Tableau</button></div><span class="badge purple">HubSpot non connecté · clients fictifs</span></div>${state.clientView==='cards'?`<div class="trainer-grid">${rows.map(c=>{let d=clientDetails[c.id],fs=formations.filter(f=>f.clientId===c.id),ts=assignedTrainersOfClient(c.id);return `<div class="trainer-card"><div class="trainer-top"><span class="client-avatar">${esc(c.name.slice(0,2).toUpperCase())}</span><div><div class="trainer-name">${esc(c.name)}</div><div class="trainer-meta">${esc(d.city)} · ${esc(d.industry)}</div></div></div><div class="tags">${ts.map(t=>`<span class="tag">${trainerName(t)}</span>`).join('')||'<span class="tag">Aucun formateur confirmé</span>'}</div><div class="trainer-stats"><div><small>Formations</small><strong>${fs.length}</strong></div><div><small>Formateurs intervenus</small><strong>${ts.length}</strong></div></div><button class="primary" onclick="openClient('${c.id}')">Voir la fiche client →</button></div>`}).join('')}</div>`:`<div class="table-wrap"><table class="tbl"><thead><tr><th>Client</th><th>Secteur</th><th>Ville</th><th>Formations</th><th>Formateurs associés</th><th></th></tr></thead><tbody>${rows.map(c=>`<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(clientDetails[c.id].industry)}</td><td>${esc(clientDetails[c.id].city)}</td><td>${formations.filter(f=>f.clientId===c.id).length}</td><td>${assignedTrainersOfClient(c.id).length}</td><td><button class="ghost" onclick="openClient('${c.id}')">Voir ↗</button></td></tr>`).join('')}</tbody></table></div>`}<p class="footnote">Données fictives : les informations HubSpot, interlocuteurs et contacts réels ne sont pas intégrés à cette démo.</p>`}
function clientDetail(){
  const c=clientById(state.selectedClient)||clients[0],d=clientDetails[c.id];
  const fs=formations.filter(f=>f.clientId===c.id);
  const sessions=db.sessions.filter(s=>fs.some(f=>f.id===s.formationId)).sort((a,b)=>a.date.localeCompare(b.date));
  const next=sessions.find(s=>s.date>=parisToday()&&!['Annulée','Réalisée'].includes(s.status));
  const trainers=assignedTrainersOfClient(c.id);
  return `<button class="ghost" onclick="go('clients')">← Annuaire clients</button>
    <section class="amo-hero client-dashboard-hero"><div><div class="eyebrow">${esc(d.industry)} · ${esc(d.city)}</div><h1 class="headline">${esc(c.name)}</h1><p>${fs.length} formation(s) · ${sessions.length} session(s) · ${trainers.length} formateur(s) mobilisé(s)</p></div>
      <div class="amo-next"><small>PROCHAINE SESSION</small>${next?`<strong>${esc(formOf(next).title)}</strong><span>${fmtDate(next.date)} · ${esc(next.city)}</span><button class="secondary tiny" onclick="openSession(${next.id})">Voir la session</button>`:'<strong>Aucune session programmée</strong>'}</div></section>
    <div class="detail-grid client-dashboard">
      <section class="card">${cardTitle('Formations')}
        ${fs.map(f=>`<button class="line-item clickable-row" onclick="openFormation('${f.id}')"><span class="grow"><strong>${esc(f.title)}</strong><span class="item-sub">${formationDates(f.id)}</span></span>${badge(f.status)}<span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucune formation.</p>'}
        <h3 class="section-title client-subheading">Équipe mobilisée</h3>
        ${trainers.map(t=>`<button class="line-item clickable-row" onclick="openTrainer(${t.id})">${trainerAvatar(t,36)}<span class="grow"><strong>${trainerName(t)}</strong><span class="item-sub">${esc(t.city)}</span></span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucun formateur affecté.</p>'}
      </section><section class="card">${cardTitle('Coordonnées')}
        <dl class="client-facts">${[['Contact',d.contact],['Adresse',d.address||d.city],['Collaborateurs (démo)',d.employees],['Référence CRM',d.hubspot]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'À préciser')}</dd></div>`).join('')}</dl>
        ${d.address?`<a class="secondary tiny client-directions" href="${esc(mapsUrl(d.address,d.city))}" target="_blank" rel="noopener noreferrer">${mobileIcon('pin',16)} Itinéraire</a>`:''}
      </section></div>`;
}
function criteria(t,s){let exact=t.skills.some(k=>k.toLowerCase()===s.topic.toLowerCase()),related=t.skills.some(k=>k.toLowerCase().includes(s.topic.toLowerCase())||s.topic.toLowerCase().includes(k.toLowerCase()));return [exact?'Expertise exacte':related?'Expertise proche':'Expertise à vérifier',t.city===s.city?'Même ville':'Déplacement à confirmer',t.available==='yes'?'Disponibilité déclarée':t.available==='no'?'Occupé déclaré':'Disponibilité inconnue']}
function staffingPage(){let s=sessionById(state.selectedSession)||db.sessions[0],open=db.sessions.filter(x=>!['Réalisée','Annulée'].includes(x.status)&&openCount(x)>0),confirmed=db.assignments.filter(x=>x.status==='Confirmée'),pending=db.proposals.filter(p=>!['Refusée','Expirée','Retirée'].includes(p.status)&&!confirmed.some(a=>a.proposalId===p.id));if(state.staffTab==='todo'&&open.length&&!open.includes(s)){s=open[0];state.selectedSession=s.id}const candidates=open.length?trainers.map(t=>trainerById(t.id)).filter(t=>staffingAvailable(t,s)&&!activeProposal(s.id,t.id)).sort((a,b)=>compatDetails(b,s).total-compatDetails(a,s).total):[];return `${intro('Staffing <em>assisté.</em>','Propositions et affectations séparées · matching explicable et validation humaine.') }<div class="tabs">${[['todo','À staffer'],['proposals','Propositions en cours'],['confirmed','Confirmées']].map(([key,label])=>`<button class="${state.staffTab===key?'selected':''}" onclick="changeTab('staffTab','${key}')">${label}</button>`).join('')}</div>${state.staffTab==='todo'?(open.length?`<div class="toolbar"><div class="group"><label for="staff-session"><strong>Session à staffer</strong></label><select id="staff-session" class="field" onchange="state.selectedSession=Number(this.value);state.candidate=null;render()">${open.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${esc(clientOf(formOf(x)).name)} · ${fmtDate(x.date,{day:'numeric',month:'short'})}</option>`).join('')}</select></div>${badge(staffingLabel(s))}</div><div class="detail-grid"><div class="card">${cardTitle('Formateurs suggérés','Disponibilité déclarée sur tout le créneau, agenda sans conflit')}${candidates.map(t=>`<div class="candidate ${state.candidate===t.id?'selected':''}">${trainerAvatar(t,44)}<div class="grow"><div class="item-title">${trainerName(t)}</div><div class="item-sub">${esc(t.city)} · ${t.rate} €/jour</div><div class="tags" style="margin:7px 0">${compatDetails(t,s).reasons.map(c=>`<span class="tag">${esc(c)}</span>`).join('')}</div></div><button class="score-pill" onclick="openModal('matching',${t.id})" title="Voir le détail du score">${compatDetails(t,s).total}% ⓘ</button><button class="${state.candidate===t.id?'primary':'secondary'} tiny" onclick="prepareProposal(${t.id})">Choisir</button></div>`).join('')||'<div class="empty">Aucun formateur disponible sur tout le créneau. Vérifiez les déclarations dans le planning.</div>'}</div><div class="card">${cardTitle('Mission sélectionnée')}<div class="mini-heading">Client</div><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="mini-heading">Formation</div><strong>${esc(formOf(s).title)}</strong><div class="mini-heading">Session</div><div class="item-sub">${mobileIcon('pin',16)} ${esc(s.city)}<br>${mobileIcon('calendar',16)} ${fmtDate(s.date)} · ${s.start}–${s.end}<br>${mobileIcon('trainers',16)} ${s.people} participants</div><div class="mini-heading">Places à pourvoir</div>${badge(openCount(s)+' / '+s.required)}<button class="secondary" style="width:100%;margin-top:9px" onclick="openSession(${s.id})">Voir la fiche session</button></div></div>`:'<div class="empty">Toutes les sessions ont une équipe complète.</div>'):state.staffTab==='proposals'?`<div class="card">${cardTitle('Cycle des propositions','1. Préparer · 2. Autoriser l’envoi · 3. Attendre la réponse · 4. Confirmer l’affectation')}${pending.length?pending.map(p=>{let t=trainerById(p.trainerId),s=sessionById(p.sessionId);return `<div class="line-item"><div class="grow"><strong>${trainerName(t)} · ${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${fmtDate(s.date)} · ${esc(p.conditions)} · ${esc(p.id)}</div></div>${badge(p.status)}<div class="action-wrap">${p.status==='Brouillon'?eventButton('Autoriser','approveProposal(\''+p.id+'\')','secondary tiny'):''}${p.status==='Autorisée à l’envoi'?eventButton('Marquer envoyé (démo)','sendProposal(\''+p.id+'\')','primary tiny'):''}${p.status==='Acceptée'?eventButton('Confirmer affectation','confirmAssignment(\''+p.id+'\')','primary tiny'):''}${eventButton('Brouillon WhatsApp',"openModal('whatsapp-draft','"+p.id+"')",'secondary tiny')}</div></div>`}).join(''):'<div class="empty">Aucune proposition en cours.</div>'}</div>`:`<div class="card">${cardTitle('Affectations confirmées')}${confirmed.map(a=>{let s=sessionById(a.sessionId);return `<div class="line-item"><div class="grow"><strong>${trainerName(trainerById(a.trainerId))}</strong><div class="item-sub">${esc(clientOf(formOf(s)).name)} · ${fmtDate(s.date)} · ${esc(a.id)}</div></div>${badge(a.status)}<button class="ghost" onclick="openSession(${s.id})">Détail ↗</button></div>`}).join('')||'<div class="empty">Aucune affectation confirmée.</div>'}</div>`}<p class="footnote">État local de démonstration persistant dans ce navigateur. Aucun WhatsApp, e-mail, Slack ou HubSpot n'est appelé.</p>`}
function createProposal(){let s=sessionById(state.selectedSession),t=trainerById(state.candidate);if(!s||!t||!staffingAvailable(t,s))return flash('La disponibilité doit être vérifiée sur tout le créneau.');if(openCount(s)===0)return flash('Aucune place disponible');let existing=db.proposals.find(p=>p.sessionId===s.id&&p.trainerId===t.id&&!['Refusée','Expirée','Retirée'].includes(p.status));if(existing)return flash('Une proposition active existe déjà pour ce formateur');const amount=$('proposal-amount')?.valueAsNumber;const modes=[...document.querySelectorAll('input[name=proposal-mode]:checked')].map(el=>el.value);if(!Number.isFinite(amount)||amount<=0||!modes.length)return flash('Indiquez un montant et au moins une modalité.');let id='P'+(Math.max(1,...db.proposals.map(p=>Number(p.id.slice(1))))+1);db.proposals.push({id,sessionId:s.id,trainerId:t.id,status:'Brouillon',approved:false,sent:false,amount,modes,conditions:`${amount} € / jour · ${modes.join(' ou ')}`,created:parisToday(),expires:null});log('Proposition préparée',`${id} · session ${s.id}`);state.staffTab='proposals';openModal('whatsapp-draft',id)}
function approveProposal(id){let p=db.proposals.find(x=>x.id===id);if(!p||p.status!=='Brouillon')return flash('Proposition non autorisable');p.approved=true;p.status='Autorisée à l’envoi';log('Autorisation humaine simulée',id);render();flash('Envoi autorisé (simulation)')}
function sendProposal(id){let p=db.proposals.find(x=>x.id===id);if(!p||!p.approved||p.status!=='Autorisée à l’envoi')return flash('Validation humaine requise');if(!staffingAvailable(trainerById(p.trainerId),sessionById(p.sessionId)))return flash('La disponibilité a changé. Vérifiez le créneau.');p.status='Envoyée';p.sent=true;log('Envoi simulé — aucun message réel',id);render();flash('Statut Envoyée — simulation uniquement')}
function respondProposal(id,status){let p=db.proposals.find(x=>x.id===id);if(!p||p.trainerId!==state.trainerId||p.status!=='Envoyée')return flash('Cette proposition ne peut plus recevoir de réponse');if(status==='Acceptée'){const conflict=calendarConflict(sessionById(p.sessionId),p.trainerId,{sessionId:p.sessionId,allowAvailable:true});if(conflict)return flash(conflict)}p.status=status;log('Réponse formateur : '+status,id);render();flash(status==='Acceptée'?'Mission ajoutée à votre agenda.':'Refus enregistré.')}
function confirmAssignment(id){let p=db.proposals.find(x=>x.id===id);if(!p||p.status!=='Acceptée')return flash('Une acceptation active est requise');let s=sessionById(p.sessionId);if(!staffingAvailable(trainerById(p.trainerId),s))return flash('La disponibilité a changé. Vérifiez le créneau.');const conflict=calendarConflict(s,p.trainerId,{sessionId:s.id,allowAvailable:true});if(conflict)return flash(conflict);if(openCount(s)===0)return flash('Session déjà entièrement staffée : arbitrage nécessaire');if(trainerById(p.trainerId)?.available==='no')return flash('Formateur occupé : vérifiez le conflit avant confirmation');let existing=db.assignments.some(a=>a.sessionId===s.id&&a.trainerId===p.trainerId&&a.status==='Confirmée');if(existing)return flash('Affectation déjà confirmée');let next='A'+(Math.max(0,...db.assignments.map(a=>Number(a.id.slice(1))))+1);db.assignments.push({id:next,sessionId:s.id,trainerId:p.trainerId,status:'Confirmée',proposalId:id});log('Affectation confirmée (démo)',`${next} · session ${s.id}`);render();flash('Affectation confirmée en démo · synchronisation externe absente')}
function planningPage(){return `${intro('Planning <em>global.</em>','Vue synchronisée de démonstration : superposez plusieurs agendas et modifiez les sessions sous contrôle.') }<div class="card" style="margin-bottom:18px">${cardTitle('Agendas affichés')}<label class="agenda-option contact-option"><input type="checkbox" ${state.contactAgenda?'checked':''} onchange="changeTab('contactAgenda',this.checked)"><span><strong>contact@certif-ia.fr</strong><small>Toutes les formations</small></span></label><div class="agenda-pickers"><button class="secondary tiny" onclick="selectAllAgendas(true)">Tout sélectionner</button><button class="secondary tiny" onclick="selectAllAgendas(false)">Tout masquer</button>${trainers.map(t=>`<label class="agenda-option"><input type="checkbox" ${state.selectedAgendaIds.includes(t.id)?'checked':''} onchange="toggleAgenda(${t.id},this.checked)"><span class="agenda-color" style="background:${t.accent}"></span><span>${trainerName(t)}</span></label>`).join('')}</div><div class="toolbar"><div class="group"><label><input type="checkbox" ${state.agendaShow==='both'||state.agendaShow==='availability'?'checked':''} onchange="state.agendaShow=this.checked?'both':'missions';render()"> Afficher les disponibilités / indisponibilités</label></div><span class="badge purple">Événements privés masqués · disponibilité inconnue ≠ libre</span></div></div>${calendarUI(false)}<div class="card" style="margin-top:18px">${cardTitle('Sessions et modifications','Modifier date, horaires, lieu, modalité et formateur ; revalidation des affectations')} ${db.sessions.filter(s=>s.status!=='Réalisée').sort((a,b)=>a.date.localeCompare(b.date)).map(s=>`<div class="line-item"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${s.start}–${s.end} · ${esc(s.city)} · ${activeAssignments(s.id).map(a=>trainerName(trainerById(a.trainerId))).join(', ')||'À staffer'}</div></div><button class="secondary tiny" onclick="openModal('edit-session',${s.id})">Modifier</button></div>`).join('')}</div>`}
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
    const details=[e.start&&e.end?e.start+'–'+e.end:'Journée entière',e.kind==='session'?e.status:e.kind==='slot'?e.zone:''].filter(Boolean).join(' · ');
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
function docGridRow(f){let stats=docStatsFor(f);return `<tr><td><strong>${esc(clientOf(f).name)}</strong><div class="item-sub">${esc(f.title)} · ${formationDates(f.id)}</div><button class="ghost tiny" onclick="openFolder('${f.id}')">Dossier ↗</button></td>${stats.matrix.map(x=>`<td style="text-align:center"><button class="v19-marker-button" onclick="openDocumentCell('${f.id}','${x.key}')" aria-label="Ouvrir ${esc(x.label)} pour ${esc(clientOf(f).name)}">${matrixStatus(x)}</button></td>`).join('')}<td><strong>${stats.conform}/5</strong>${progress(stats.percentage,'Complétude '+clientOf(f).name)}<small>${stats.verified} validé(s) · ${stats.toCheck} à vérifier</small></td></tr>`;}
function docMobileCard(f){let st=docStatsFor(f),name=clientOf(f).name;return `<div class="card v19-mobile-doc"><div class="card-head"><div><h3 class="section-title">${esc(name)}</h3><p class="section-caption">${esc(f.title)}</p><p class="item-sub">${formationDates(f.id)}</p></div>${badge(st.percentage===100?'Complet':'Incomplet')}</div><div class="v19-mini-status">${st.matrix.map(x=>`<button class="v19-marker-button" aria-label="Ouvrir ${esc(x.label)}" onclick="openDocumentCell('${f.id}','${x.key}')">${matrixStatus(x)}<small>${esc(x.key==='PROGRAMME'?'Prog.':x.key==='CADRAGE'?'Cadrage':x.label)}</small></button>`).join('')}</div><div class="folder-progress"><strong>${st.percentage}%</strong><span>${st.conform}/5 conformes · ${st.toCheck} à vérifier</span></div>${progress(st.percentage,name)}<div class="v19-inline-counts"><span>${st.missing} manquants</span><span>${st.verified} validés</span></div><button class="primary" style="width:100%" onclick="openFolder('${f.id}')">Voir les documents ↗</button></div>`;}
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
 ${filtersBar('Rechercher un client ou une formation…',opts)}${buttons}
 <div class="v19-doc-desktop"><div class="table-wrap"><table class="tbl v19-matrix"><thead><tr><th>Client</th>${documentColumns.map(x=>`<th>${esc(x[1])}</th>`).join('')}<th>Complétude</th></tr></thead><tbody>${list.map(docGridRow).join('')||'<tr><td colspan="7">Aucun dossier.</td></tr>'}</tbody></table></div></div>
 <div class="v19-doc-mobile">${grouped('À venir, à préparer',coming)}${grouped('Déjà formés',past)}${list.length?'':'<div class="empty">Aucun dossier.</div>'}</div>
 <div class="v19-doc-legend"><span>${matrixStatus({status:'ok',label:'Conforme'})} Présent conforme</span><span>${matrixStatus({status:'part',label:'Non conforme'})} Format non conforme</span><span>${matrixStatus({status:'miss',label:'Manquant'})} À fournir</span><span>${matrixStatus({status:'refused',label:'Refusé'})} Refusé</span></div>
 <p class="footnote">Une coche atteste la conformité de présence/format dans cette démo, pas la validation métier du contenu. Les fichiers n'ont pas été vérifiés sur Google Drive.</p>
 <div class="card" style="margin-top:18px">${cardTitle('Suivi des relances','Rappel PWA puis WhatsApp 48 h après : démonstration uniquement')}${db.reminders.map(r=>`<div class="line-item"><div class="grow"><strong>${esc(db.deliverables.find(d=>d.id===r.deliverableId)?.title||'Livrable')}</strong><div class="item-sub">${esc(r.channel)} · ${esc(r.status)} · ${esc(r.at)}</div></div></div>`).join('')||'<div class="empty">Aucune relance.</div>'}<button class="secondary tiny" onclick="simulateDueReminders()">Vérifier les rappels</button> <button class="secondary tiny" onclick="testReminderAfter48h()">Tester 48 h (démo)</button></div>`;
}
function openFolder(id){state.selectedDocGroup=id;openModal('folder',id)}
function simulatePwaReminder(id){let d=db.deliverables.find(x=>x.id===id);if(!d||d.status==='Validé'||d.versions?.length>0)return flash('Livrable déjà déposé ou non éligible');if(d.owner!=='formateur')return flash('Relance formateur non applicable');if(db.reminders.some(r=>r.deliverableId===id&&r.channel==='PWA'))return flash('Premier rappel déjà envoyé dans la démo');db.reminders.push({id:'R'+Date.now(),deliverableId:id,channel:'PWA',status:'Simulée — non envoyée',at:new Date().toISOString()});log('Rappel PWA simulé',id);closeModal();flash('Notification PWA simulée · aucun push réel')}
function simulateDueReminders(silent=false){let now=Date.now(),due=db.reminders.filter(r=>r.channel==='PWA'&&now-Date.parse(r.at)>=48*3600000);let count=0;for(let r of due){let d=db.deliverables.find(x=>x.id===r.deliverableId);if(!d||d.status==='Validé'||d.versions?.length>0||db.reminders.some(z=>z.deliverableId===r.deliverableId&&z.channel==='WhatsApp'))continue;db.reminders.push({id:'R'+Date.now()+'-'+count,deliverableId:d.id,channel:'WhatsApp',status:'Automatisation simulée — aucun envoi',at:new Date().toISOString()});count++}if(count)log('Relances WhatsApp simulées',count+' livrable(s)');if(count&&!silent){render();flash(count+' seconde(s) relance(s) WhatsApp simulée(s)')}else if(!silent)flash('Aucune seconde relance éligible après 48 h');return count}
function testReminderAfter48h(){let r=db.reminders.find(x=>x.channel==='PWA'&&!db.reminders.some(y=>y.deliverableId===x.deliverableId&&y.channel==='WhatsApp'));if(!r)return flash('Commencez par simuler un premier rappel PWA depuis un livrable manquant');r.at=new Date(Date.now()-49*3600000).toISOString();save();simulateDueReminders();render();flash('Simulation : 49 h écoulées, WhatsApp enregistré sans envoi réel')}
function docFolder(id,person=false){
 const f=formations.find(x=>x.id===id);if(!f)return '<div class="empty">Dossier introuvable.</div>';
 const docs=db.deliverables.filter(d=>d.formationId===id&&(!person||(d.owner==='formateur'&&d.trainerId===state.trainerId)));
 const st=docStatsFor(f,person);
 const top=`<div class="folder-header"><strong>${esc(clientOf(f).name)} · ${esc(f.title)}<small class="item-sub"> · ${formationDates(f.id)}</small></strong><span>${st.percentage}% conformes</span></div>${progress(st.percentage,'Dossier '+clientOf(f).name)}<div class="v19-inline-counts"><span>${st.missing} manquant(s)</span><span>${st.toCheck} à vérifier</span><span>${st.verified} validé(s)</span></div>`;
 const items=(person?docs.map(d=>({d,key:docCategory(d),label:d.title,status:docConformity(d)})):st.matrix);
 return top+items.map(item=>{const d=item.d;let detail=d?.versions.at(-1),isOwner=d?.owner==='formateur'&&d.trainerId===state.trainerId;
 return `<div class="doc-row"><span>${matrixStatus(item)}</span><div class="grow"><button class="document-title" onclick="openDocumentCell('${f.id}','${item.key}')">${esc(item.label)}</button><div class="item-sub">${d?esc(d.status)+' · '+d.versions.length+' version(s) · Échéance '+fmtDate(d.dueDate):'Aucun livrable référencé dans cette catégorie'}</div>${detail?`<div class="item-sub">Dernière version : ${esc(detail.filename)}</div>`:''}</div><div class="action-wrap">${person?(isOwner?`<button class="secondary tiny" onclick="openModal('upload','${d.id}')">Déposer</button>`:''):d?`<button class="secondary tiny" onclick="openModal('upload-internal','${d.id}')">Déposer</button>${d.versions.length?`<button class="secondary tiny" onclick="openModal('review','${d.id}')">Vérifier</button>`:''}${d.owner==='formateur'&&d.status==='À fournir'?`<button class="secondary tiny" onclick="simulatePwaReminder('${d.id}')">Rappel PWA</button>`:''}`:`<button class="secondary tiny" onclick="prepareMissingDoc('${f.id}','${item.key}')">Créer et déposer</button>`}</div></div>`;
 }).join('')+`<p class="footnote">Les fichiers déposés sont conservés dans ce navigateur.</p>`;
}
function prepareMissingDoc(id,key,sessionId){if(state.role==='formateur')return flash('Accès réservé à l’équipe interne');let f=formations.find(x=>x.id===id),type=documentColumns.find(x=>x[0]===key);if(!f||!type||(sessionId&&sessionById(sessionId)?.formationId!==id))return flash('Type inconnu');let existing=db.deliverables.find(d=>d.formationId===id&&(!sessionId||d.sessionId===sessionId)&&docCategory(d)===key);if(existing)return openModal('upload-internal',existing.id);let did='D'+(Math.max(0,...db.deliverables.map(d=>Number(String(d.id).slice(1))||0))+1);db.deliverables.push({id:did,formationId:id,sessionId:sessionId||f.sessionIds[0],title:type[1],type:key,owner:'interne',status:'À fournir',versions:[]});log('Livrable manquant créé en démo',`${did} · ${key}`);openModal('upload-internal',did);}
function reportingPage(){let report=monthlyReport(),month=state.monthlyMonth,within=s=>s.date?.startsWith(month),ss=db.sessions.filter(within),aa=db.assignments.filter(a=>ss.some(s=>s.id===a.sessionId)&&['Confirmée','Réalisée'].includes(a.status)),d=db.deliverables.filter(x=>ss.some(s=>s.id===x.sessionId)),delivered=d.filter(x=>x.versions.length>0),onTime=delivered.filter(x=>x.versions.at(-1)?.at&&x.versions.at(-1).at.slice(0,10)<=x.dueDate).length;let perTrainer=trainers.map(t=>{let assignments=aa.filter(a=>a.trainerId===t.id),rate=reliabilityScore(t);return {t,assignments,rate}}).filter(x=>x.assignments.length>0);return `${intro('Monthly <em>AMO.</em>','Reporting mensuel des formations, du staffing, du NPS, des cartons et de la ponctualité documentaire.')}<div class="toolbar"><div class="group"><label for="report-month">Période</label><input id="report-month" class="field" type="month" value="${esc(month)}" onchange="state.monthlyMonth=this.value;render()"><button class="primary tiny" onclick="exportMonthlyChart()">Télécharger le rapport animé</button><button class="secondary tiny" onclick="exportMonthlyTable()">Télécharger le tableau</button><button class="secondary tiny" onclick="exportMonthly()">Exporter le CSV</button></div><span class="badge purple">Données fictives · pondérations non validées</span></div><div class="cards">${metric('Sessions',ss.length,'Dans la période')}${metric('Affectations',aa.length,'Confirmées / réalisées')}${metric('Formateurs mobilisés',perTrainer.length,'Profils distincts')}${metric('Livrables déposés',delivered.length+'/'+d.length,'Sur la période')}${metric('Bonus du mois',report.bonuses.length,report.bonusPoints+' points attribués')}</div>${monthlyBonusPanel(report)}<div class="two-col"><div class="card">${cardTitle('Activité des formateurs','Missions et clients couverts sur la période')}<div class="table-wrap"><table class="tbl"><thead><tr><th>Formateur</th><th>Missions</th><th>Clients</th><th>NPS indicatif</th></tr></thead><tbody>${perTrainer.map(x=>`<tr><td>${trainerName(x.t)}</td><td>${x.assignments.length}</td><td>${[...new Set(x.assignments.map(a=>clientOf(formOf(sessionById(a.sessionId))).name))].map(esc).join(', ')}</td><td>${trainerProfileField(x.t.id).nps??'Non renseigné'}</td></tr>`).join('')||'<tr><td colspan="4">Aucune affectation dans la période</td></tr>'}</tbody></table></div></div><div class="card">${cardTitle('Ponctualité et fiabilité','Échantillon fictif, ne sert pas à évaluer des personnes réelles')}<div class="line-item"><div class="grow">Livrables déposés avant échéance (données disponibles)</div><strong>${delivered.length?Math.round(onTime/delivered.length*100)+'%':'Non mesurable'}</strong></div><div class="line-item"><div class="grow">Pool Numéro 10 (référentiel fictif)</div><strong>${trainers.filter(t=>t.rating.includes('Numéro 10')).length}</strong></div><div class="line-item"><div class="grow">Cartons rouges</div><strong>${trainers.filter(t=>trainerProfileField(t.id).redCard).length}</strong></div><p class="footnote">Le score de fiabilité avec bonus/malus est une grille proposée, non validée ni appliquée. Les évaluations par mission et causes des retards restent nécessaires pour des résultats fiables.</p></div></div><div class="card" style="margin-top:18px">${cardTitle('Grille proposée de fiabilité','À valider métier avant tout score calculé ou décision')}<div class="table-wrap"><table class="tbl"><thead><tr><th>Critère</th><th>Poids proposé</th><th>Base de calcul attendue</th></tr></thead><tbody><tr><td>Ponctualité des livrables</td><td>30 %</td><td>Versions déposées avant échéance et responsabilités identifiées</td></tr><tr><td>NPS et satisfaction</td><td>40 %</td><td>Évaluations contextualisées par session</td></tr><tr><td>Retours de mission</td><td>10 %</td><td>Débriefs et incidents vérifiés</td></tr><tr><td>Incidents vérifiés</td><td>20 %</td><td>Justifications, sources et possibilité de rectification</td></tr></tbody></table></div><p class="footnote">Aucun bonus ou malus réel calculé ou appliqué. Les critères peuvent être modifiés après concertation.</p></div>`}
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
    <div class="home-shortcuts"><button class="secondary tiny" onclick="go('trainer-calendar')">${mobileIcon('calendar',17)} Mon agenda</button><button class="secondary tiny" onclick="go('trainer-docs')">${mobileIcon('docs',17)} Mes livrables</button></div>
    <div class="overview-metrics">${metric('Propositions',proposals.length,'À examiner','trainer-missions','proposals')}${metric('Livrables',docs.length,'À traiter','trainer-docs','open')}${metric('Missions réalisées',finished,'Terminées','trainer-missions','finished')}${metric('NPS moyen',trainerNps(t.id),'Évaluations disponibles')}</div>
    <div class="overview-grid"><section class="card">${cardTitle('À traiter en priorité')}
      ${proposals.map(p=>`<div class="priority-row"><div><strong>${esc(clientOf(formOf(sessionById(p.sessionId))).name)}</strong><div class="item-sub">Proposition de mission</div></div><button class="primary tiny" onclick="dashboardGo('trainer-missions','proposals')">Répondre</button></div>`).join('')}
      ${docs.slice(0,4).map(d=>`<div class="priority-row"><div><strong>${esc(d.title)}</strong><div class="item-sub">${esc(d.status)} · ${fmtDate(d.dueDate)}</div></div><button class="secondary tiny" onclick="openModal('document-preview','${d.id}')">Ouvrir</button></div>`).join('')}
      ${!proposals.length&&!docs.length?'<p class="empty">Aucune action en attente.</p>':''}</section>
    <section class="card">${cardTitle('Prochaines missions')}
      ${missions.map(s=>`<button class="line-item clickable-row" onclick="openModal('mission-info',${s.id})"><span class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></span><span class="grow"><strong>${esc(s.title)}</strong><span class="item-sub">${esc(formOf(s).title)} · ${s.start}–${s.end}</span></span>${badge(s.status)}<span class="row-chevron" aria-hidden="true">›</span></button>`).join('')||'<p class="empty">Aucune mission à venir.</p>'}
    </section></div>`;
}
function trainerMissions(){let tid=state.trainerId,props=db.proposals.filter(p=>p.trainerId===tid),aa=db.assignments.filter(a=>a.trainerId===tid&&['Confirmée','Réalisée','À revalider'].includes(a.status)),tab=state.missionTab;return `${intro('Mes <em>missions.</em>','Propositions, missions confirmées et préparation, sans affichage des informations internes.','ESPACE FORMATEUR')}${missionPicker(tab,props,aa)}${tab==='proposals'?`<div class="card">${cardTitle('Propositions reçues','Une proposition acceptée apparaît dans votre agenda')}${props.map(p=>{let s=sessionById(p.sessionId);return `<div class="line-item"><div class="grow"><strong>${esc(clientOf(formOf(s)).name)} — ${esc(formOf(s).title)}</strong><div class="item-sub">${fmtDate(s.date)} · ${s.start}–${s.end} · ${esc(s.city)} · ${esc(p.conditions)}</div></div>${badge(p.status)}${p.status==='Envoyée'?`<div class="action-wrap"><button class="primary tiny" onclick="respondProposal('${p.id}','Acceptée')">Accepter</button><button class="secondary tiny" onclick="respondProposal('${p.id}','Refusée')">Refuser</button></div>`:''}${p.status==='Acceptée'?`<span class="item-sub">Dans votre agenda · confirmation AMO en attente</span>${missionDocumentSummary(s)}<button class="ghost" onclick="openModal('mission-info',${s.id})">Informations client</button><button class="ghost" onclick="openTrainerFolder(${s.id})">Ouvrir le dossier</button>`:''}</div>`}).join('')||'<div class="empty">Aucune proposition.</div>'}</div>`:`<div class="card">${cardTitle(tab==='upcoming'?'Missions confirmées':tab==='prepare'?'Préparation de mes missions':'Missions terminées')}${aa.filter(a=>missionMatchesTab(a,tab)).map(a=>{let s=sessionById(a.sessionId);return `<div class="line-item"><div class="datebox"><strong>${s.date.slice(8)}</strong><small>${fmtDate(s.date,{month:'short'})}</small></div><div class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><div class="item-sub">${esc(formOf(s).title)} · ${esc(s.city)} · ${s.start}–${s.end}</div></div>${badge(a.status)}${missionDocumentSummary(s)}<button class="ghost" onclick="openModal('mission-info',${s.id})">Informations client</button><button class="ghost" onclick="openTrainerFolder(${s.id})">Ouvrir le dossier</button></div>`}).join('')||'<div class="empty">Aucune mission dans cette catégorie.</div>'}</div>`}`}
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
  const field=(label,name,value,type='text',required=false)=>`<label>${label}<input class="field" name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''}></label>`;
  const detail=(label,value)=>`<div class="info"><small>${label}</small><strong>${esc(value||'—')}</strong></div>`;
  return `<h1 class="headline">${state.profileEdit?'Modifier mon profil':'Mon profil'}</h1><div class="card profile-intro profile-edit-hero">${trainerAvatar(t,64)}<div><strong>${trainerName(t)}</strong><div class="item-sub">${esc(t.city)}</div></div>
    ${state.profileEdit?'':`<button class="primary tiny" onclick="changeTab('profileEdit',true)">Modifier mon profil</button>`}</div>
    ${state.profileEdit?`<form class="profile-grid profile-editor" onsubmit="event.preventDefault();saveTrainerProfile(this)">
      <section class="card">${cardTitle('Identité et coordonnées','Les informations utilisées pour vos missions.')}<div class="form-grid">
      ${field('Nom complet','name',t.name,'text',true)}${field('Ville','city',t.city,'text',true)}${field('Adresse e-mail','email',t.email,'email',true)}${field('Téléphone','phone',p.phone,'tel')}</div><div class="profile-picture-editor"><div class="profile-picture-preview" aria-hidden="true">${trainerAvatar(t,54)}</div><div><strong>Photo de profil</strong><p class="item-sub">Choisissez une image JPG, PNG ou WebP sur votre appareil.</p></div></div>
      <div class="profile-photo-upload"><label for="profile-photo-file">Importer une photo</label><input id="profile-photo-file" type="file" accept="image/jpeg,image/png,image/webp" onchange="selectProfilePhoto(this.files[0])"><small id="profile-photo-status" role="status"></small></div></section>
      <section class="card">${cardTitle('Profil professionnel','Présentez vos compétences et votre expérience.')}<div class="form-grid">
      ${field('Expertises déclarées (séparées par des virgules)','skills',t.skills.join(', '))}${field('LinkedIn','linkedin',p.linkedin,'url')}
      <label class="profile-wide">Présentation<textarea class="field" name="bio" rows="4">${esc(p.bio)}</textarea></label></div></section>
      <div class="profile-actions"><button type="button" class="secondary" onclick="changeTab('profileEdit',false)">Annuler</button><button class="primary">Enregistrer</button></div>
    </form>`:`<div class="profile-grid"><section class="card">${cardTitle('Coordonnées')}<div class="info-grid">${detail('E-mail',t.email)}${detail('Téléphone',p.phone)}${detail('Ville',t.city)}</div></section>
      <section class="card">${cardTitle('Expérience et expertises')}<div class="info-grid">${detail('Expertises déclarées',t.skills.join(', '))}${detail('Expertises vérifiées',t.verified.join(', '))}${detail('Présentation',p.bio||trainerProfileField(t.id).domain)}${detail('LinkedIn',p.linkedin)}</div></section></div>`}`;
}

function missionAuditDisplay(s){let d=db.deliverables.find(d=>d.formationId===s.formationId&&docCategory(d)==='AUDIT');let ready=!!d?.versions?.length;return `<div class="info"><small>Audit client</small><strong>${ready?'Reçu — démo':'En attente'}</strong><p class="item-sub">${ready?'Audit référencé dans le dossier : accès réel au document après connexion Drive.':'L’audit n’a pas encore été reçu pour cette mission.'}</p></div>`;}
function missionPublicFeedback(s){let a=db.assignments.find(a=>a.sessionId===s.id&&a.trainerId===state.trainerId),r=a&&missionRatings[a.id];if(!r||!r.public)return '<div class="info"><small>Retour client</small><strong>Pas encore communiqué</strong></div>';return `<div class="info"><small>Évaluations communicables — données fictives</small><strong>NPS ${esc(r.nps??'—')}/10 · Note Certif ${esc(r.certif??'—')}/10 · Participants ${esc(r.participants??'—')}/10</strong><p class="item-sub">Mission ${esc(r.period)} · Ponctualité documentaire : à mesurer.</p></div>`;}

function modalView(){let m=state.modal,out='';if(m.kind==='reschedule'||m.kind==='edit-session'){let s=sessionById(m.id),assigned=activeAssignments(s.id);out=modalBox('Modifier une session','Date, heures, lieu, modalité et affectations : toute modification substantielle exige une revalidation.',`<div class="form-grid"><label>Date<input class="field" id="new-date" type="date" value="${s.date}"></label><label>Début<input class="field" id="new-start" type="time" value="${s.start}"></label><label>Fin<input class="field" id="new-end" type="time" value="${s.end}"></label><label>Ville / lieu<input class="field" id="new-city" value="${esc(s.city)}"></label><label>Adresse (facultatif)<input class="field" id="new-address" value="${esc(s.address||'')}"></label><label>Modalité<select class="field" id="new-modality">${['Présentiel','Distanciel','Hybride'].map(v=>`<option ${s.modality===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Formateur principal<select class="field" id="new-trainer"><option value="">Ne pas modifier</option>${trainers.map(t=>`<option value="${t.id}" ${assigned.length&&assigned[0].trainerId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label></div><div class="notif">${assigned.length} affectation(s) existante(s). Après modification, leurs statuts seront « À revalider » si nécessaire. L'AMO doit contrôler la capacité et les conflits.</div><div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button class="primary" onclick="saveSessionEdit(${s.id})">Enregistrer les modifications (démo)</button></div>`)}
else if(m.kind==='prepare-proposal'&&state.role==='amo'){out=proposalModal()}
else if(m.kind==='whatsapp-draft'&&state.role==='amo'){out=whatsAppPanel(m.id)}
else if(m.kind==='amo-milestones'&&state.role==='amo'){out=amoMilestonesPanel()}
else if(m.kind==='hub-settings'){out=hubSettingsPanel()}
else if(m.kind==='google-calendar'&&state.role==='formateur'){out=modalBox('Connexion Google Agenda','La connexion à un compte Google sera disponible quand la synchronisation aura été configurée.',`<div class="modal-actions"><button class="primary" onclick="closeModal()">Fermer</button></div>`)}
else if(m.kind==='document-preview'){out=documentPreview(m.id)}
else if(m.kind==='amo-notifications'){out=amoNotificationsPanel()}
else if(m.kind==='trainer-notifications'&&state.role==='formateur'){out=trainerNotificationPanel()}
else if(m.kind==='availability'||m.kind==='calendar-event'){out=calendarEventModal(m)}
else if(m.kind==='matching'){let t=trainerById(m.id),s=sessionById(state.selectedSession),c=compatDetails(t,s);out=modalBox('Pourquoi ce score de compatibilité ?',`Grille de démonstration transparente — ${t.name}`,`<div class="compat-hero">${c.total}% ${badge(c.eligible?'Éligibilité à confirmer':'Blocage possible')}</div>${c.parts.map(([name,points,max])=>`<div class="score-detail"><div><strong>${esc(name)}</strong><span>${points}/${max} pts</span></div>${progress(Math.round(100*points/max),name)}</div>`).join('')}<div class="notif">${c.reasons.map(esc).join(' · ')}</div><p class="footnote">Pondération indicative à valider avec l'équipe : expertise 40, disponibilité 30, localisation 20, expérience 10. Aucune disponibilité inconnue ne vaut preuve de liberté. Score ≠ autorisation de staffer.</p><div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button></div>`)}
else if(m.kind==='folder'||m.kind==='trainer-folder'){out=modalBox('Dossier de livrables',m.kind==='folder'?'Gestion interne des documents et relances':'Documents attendus pour vos missions',docFolder(m.id,m.kind==='trainer-folder')+`<div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button></div>`)}
else if(m.kind==='mission-info'){let s=sessionById(m.id),f=formOf(s),c=clientOf(f),d=clientDetails[c.id];out=modalBox('Informations client pour la mission','Uniquement les informations utiles au formateur, sans notes internes confidentielles.',`<div class="info-grid">${[['Client',c.name],['Formation',f.title],['Date',fmtDate(s.date)],['Horaires',s.start+'–'+s.end],['Participants',s.people??'À préciser'],['Lieu',s.address||s.city],['Contact',d.contact],['Consignes',d.notesTrainer]].map(([k,v])=>`<div class="info"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join('')}</div><div class="v19-mission-extra">${missionAuditDisplay(s)}${missionPublicFeedback(s)}</div><div class="modal-actions"><a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(mapsUrl(s.address,s.city))}">Ouvrir l'itinéraire ↗</a><button class="secondary" onclick="closeModal()">Fermer</button></div><p class="footnote">L’adresse précise est à renseigner ; ici le lien indique une ville fictive.</p>`)}
else if(m.kind==='upload'||m.kind==='upload-internal'){out=uploadPanel(m.id,m.kind==='upload-internal')}
else if(m.kind==='review'){let d=db.deliverables.find(x=>x.id===m.id);out=modalBox('Vérifier un livrable','Choisissez une décision pour la version déposée.',`<div class="info"><small>Livrable</small><strong>${esc(d.title)}</strong></div><label class="form-label" for="review-comment">Motif du refus (facultatif)</label><textarea class="field" id="review-comment" placeholder="Ajouter un motif…"></textarea><div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button><button class="secondary" onclick="reviewDoc('${d.id}','Refusé')">Refuser</button><button class="primary" onclick="reviewDoc('${d.id}','Validé')">Valider (démo)</button></div>`)}
return `<div class="modal-back" role="presentation" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-modal="true" aria-label="${({'trainer-notifications':'Notifications','amo-notifications':'Notifications AMO','prepare-proposal':'Préparer une proposition','whatsapp-draft':'Brouillon WhatsApp','amo-milestones':'Jalons AMO','document-preview':'Détail du document','google-calendar':'Connexion Google Agenda','hub-settings':'Réglages'})[m.kind]||esc(m.kind)}"><button class="modal-close" aria-label="Fermer" onclick="closeModal()">×</button>${out}</div></div>`}
function saveSessionEdit(id){let s=sessionById(id),date=$('new-date')?.value,start=$('new-start')?.value,end=$('new-end')?.value,city=$('new-city')?.value.trim(),address=$('new-address')?.value.trim(),modality=$('new-modality')?.value,tid=Number($('new-trainer')?.value||0);if(!date||!start||!end||!city||end<=start)return flash('Date, horaires et lieu valides requis');let prev=JSON.stringify([s.date,s.start,s.end,s.city,s.address||'',s.modality]);let next=JSON.stringify([date,start,end,city,address,modality]);let changed=prev!==next;let current=activeAssignments(id);if(!changed&&(!tid||current.some(a=>a.trainerId===tid)))return flash('Aucune modification');const entry={date,start,end};const trainersToCheck=new Set([...current.map(a=>a.trainerId),...db.proposals.filter(p=>p.sessionId===s.id&&p.status==='Acceptée').map(p=>p.trainerId),...(tid?[tid]:[])]);if(date!==s.date||start!==s.start||end!==s.end){const conflict=calendarConflict(entry,null,{sessionId:s.id});if(conflict)return flash(conflict)}for(const trainerId of trainersToCheck){const conflict=calendarConflict(entry,trainerId,{sessionId:s.id,allowAvailable:true});if(conflict)return flash(conflict)}Object.assign(s,{date,start,end,city,address,modality});if(changed||tid){current.forEach(a=>a.status='À revalider');if(tid&&!db.assignments.some(a=>a.sessionId===id&&a.trainerId===tid&&a.status==='À revalider'))db.assignments.push({id:'A'+Date.now(),sessionId:id,trainerId:tid,status:'À revalider'});}log('Modification de session démo',id+' · contrôle de revalidation requis');closeModal();flash('Modification simulée ; affectations à revalider')}
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
  log('Livrable déposé',id);
  state.uploadFile=null;openModal('document-preview',id);
  flash('Nouvelle version enregistrée.');
}
function reviewDoc(id,status){let d=db.deliverables.find(x=>x.id===id);if(state.role!=='amo'||!d||!d.versions.length)return flash('Aucune version à vérifier');let comment=$('review-comment')?.value.trim()||'';d.status=status;d.versions.at(-1).status=status;d.versions.at(-1).comment=status==='Refusé'?comment:'';log('Vérification documentaire simulée',`${id} : ${status}`);closeModal();flash('Décision documentaire enregistrée (simulation)')}
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

function trainerNps(id){
  const scores=db.assignments.filter(a=>a.trainerId===id&&a.status==='Réalisée').map(a=>missionRatings[a.id]?.nps).filter(Number.isFinite);
  const value=scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:trainerProfileField(id).nps;
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

function calendarConflict(entry,trainerId,options={}){
  const entries=(db.calendarEvents||[]).filter(e=>e.trainerId===trainerId&&e.id!==entry.id);
  if(trainerId===null)entries.push(...db.sessions.filter(s=>s.status!=='Annulée'&&s.id!==options.sessionId).map(s=>({...s,title:clientOf(formOf(s)).name})));
  if(trainerId!==null){
    entries.push(...trainerMissionsInCalendar(trainerId).filter(e=>e.id!==options.sessionId));
    entries.push(...db.availability.filter(a=>a.trainerId===trainerId&&a.id!==entry.id&&(!options.allowAvailable||a.status!=='Disponible')));
  }
  const conflict=entries.find(e=>e.date===entry.date&&(e.start||'00:00')<(entry.end||'24:00')&&(entry.start||'00:00')<(e.end||'24:00'));
  if(!conflict)return '';
  const time=conflict.start&&conflict.end?`${conflict.start}–${conflict.end}`:'journée entière';
  return `Conflit le ${fmtDate(entry.date)} avec « ${conflict.title||conflict.status} » (${time}). Choisissez un autre créneau.`;
}

function openCalendarEvent(date,id,slot=false){
  state.modal={kind:slot?'availability':'calendar-event',id,date};
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
  const type=slot||(!current&&trainer)?status:'event';
  return modalBox(current?'Modifier le '+(slot?'créneau':'rendez-vous'):'Ajouter un événement','',`<form id="agenda-event-form" onsubmit="event.preventDefault();saveCalendarEvent(this)">
    <div class="form-grid">
      ${trainer?`<label>Type<select name="kind" class="field" onchange="calendarEventType(this.form)">${[['Disponible','Disponibilité'],['Occupé','Indisponibilité'],['event','Événement personnel']].filter(([key])=>!current||slot===(key!=='event')).map(([key,label])=>`<option value="${key}" ${type===key?'selected':''}>${label}</option>`).join('')}</select></label>`:'<input type="hidden" name="kind" value="event">'}
      <label>Date<input name="date" class="field" type="date" value="${esc(current?.date||modal.date||state.calendarDate)}" required></label>
      <label>Début<input name="start" class="field" type="time" value="${esc(current?.start||'09:00')}" required></label>
      <label>Fin<input name="end" class="field" type="time" value="${esc(current?.end||'17:00')}" required></label>
      <label class="profile-wide" id="event-title-label" ${type==='event'?'':'hidden'}>Titre<input name="title" class="field" value="${esc(current?.title)}" ${type==='event'?'required':''}></label>
      <label class="profile-wide" id="event-zone-label" ${type==='event'?'hidden':''}>Zone (facultatif)<input name="zone" class="field" value="${esc(current?.zone)}"></label>
      ${slot&&current&&!current.start?'<label><input name="allDay" type="checkbox" checked> Journée entière</label>':''}
    </div><p id="agenda-error" class="agenda-error" role="alert"></p>
    <div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Annuler</button><button class="primary">Enregistrer</button></div>
  </form>`);
}

function calendarEventType(form){
  const event=form.elements.kind.value==='event';
  $('event-title-label').hidden=!event;
  $('event-zone-label').hidden=event;
  form.elements.title.required=event;
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
  }
  const conflict=calendarConflict(entry,owner);
  if(conflict)return error(conflict);
  const list=slot?db.availability:(db.calendarEvents||=[]);
  const index=list.findIndex(e=>e.id===entry.id&&e.trainerId===owner);
  if(index>=0)list[index]=entry;
  else list.push(entry);
  state.calendarDate=entry.date;
  save();
  closeModal();
  flash(slot?'Créneau enregistré.':'Événement enregistré.');
}

function parisToday(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts();
  const part=type=>parts.find(x=>x.type===type).value;
  return [part('year'),part('month'),part('day')].join('-');
}

function trainerCardLevel(t){
  return db.internalReviews.filter(r=>r.trainerId===t?.id&&r.kind==='carton').at(-1)?.level;
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
  if(!s||!openCount(s)||!staffingAvailable(trainerById(id),s)||activeProposal(s.id,id))return flash('Ce formateur ne peut plus être proposé sur cette session.');
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

function amoNotifications(){
  const seen=db.seenAmoNotifications||[];
  const replies=db.proposals.filter(p=>['Acceptée','Refusée'].includes(p.status)).map(p=>{
    const session=sessionById(p.sessionId);
    return {key:p.id+':'+p.status,title:'Proposition '+p.status.toLowerCase(),detail:clientOf(formOf(session)).name,action:"showAmoNotice('"+p.id+':'+p.status+"','staffing')"};
  });
  const documents=db.deliverables.filter(d=>d.status==='Déposé').map(d=>({
    key:d.id+':'+d.versions.length,title:'Nouveau livrable déposé',detail:d.title,action:"showAmoNotice('"+d.id+':'+d.versions.length+"','documents')"
  }));
  return [...replies,...documents].filter(n=>!seen.includes(n.key));
}

function showAmoNotice(key,page){
  db.seenAmoNotifications||=[];
  db.seenAmoNotifications.push(key);
  if(page==='staffing')state.staffTab='proposals';
  save();
  go(page);
}

function openAmoNotifications(){
  if(state.role==='amo')openModal('amo-notifications');
}

function amoNotificationsPanel(){
  return modalBox('Notifications AMO','',amoNotifications().map(n=>`<div class="line-item"><div class="grow"><strong>${esc(n.title)}</strong><div class="item-sub">${esc(n.detail)}</div></div><button class="secondary tiny" onclick="${n.action}">Ouvrir</button></div>`).join('')||'<p class="empty">Aucune nouvelle notification.</p>');
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
    ${versions.map(v=>`<div class="line-item"><div class="grow"><strong>${esc(v.filename)}</strong><div class="item-sub">Version ${v.number} · ${esc(v.status)}</div></div>${v.fileKey?`<button class="secondary tiny" onclick="downloadDocumentVersion('${d.id}',${v.number})">Ouvrir le fichier</button>`:'<span class="item-sub">Fichier de démonstration</span>'}</div>`).join('')||'<p class="empty">Aucune version déposée.</p>'}
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

async function downloadDocumentVersion(id,number){
  const d=db.deliverables.find(x=>x.id===id);
  const v=d?.versions.find(x=>x.number===number);
  if(!v?.fileKey||(state.role==='formateur'&&!trainerCanReadDocument(d)))return;
  try{
    const file=await documentStorage('readonly',files=>files.get(v.fileKey));
    if(!file)return flash('Fichier indisponible dans ce navigateur.');
    const display=/^(application\/pdf|image\/(png|jpeg))$/.test(file.type);
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
  const cards=db.internalReviews.filter(r=>r.kind==='carton'&&r.createdAt?.startsWith(month));
  const bonuses=db.internalReviews.filter(r=>r.kind==='bonus'&&r.createdAt?.startsWith(month));
  const bonusCounts=new Map();
  for(const b of bonuses)bonusCounts.set(b.trainerId,(bonusCounts.get(b.trainerId)||0)+1);
  const bonusByTrainer=[...bonusCounts].map(([id,count])=>({id,name:trainerById(id)?.name||'Formateur',count,points:count*trainerBonusValue})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'fr'));
  const trainersByMission=[...new Set(assignments.map(a=>a.trainerId))].map(id=>{
    const list=assignments.filter(a=>a.trainerId===id);
    const scores=list.map(a=>missionRatings[a.id]?.nps).filter(Number.isFinite);
    return {name:trainerById(id).name,count:list.length,done:list.filter(a=>a.status==='Réalisée').length,nps:scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:null};
  }).sort((a,b)=>b.count-a.count);
  return {month,sessions,assignments,proposals,docs,onTime,punctual,cards,bonuses,bonusByTrainer,bonusPoints:bonuses.length*trainerBonusValue,trainersByMission,
    nps:assessed.length?assessed.reduce((sum,n)=>sum+n,0)/assessed.length:null,npsCount:assessed.length,
    participants:sessions.reduce((sum,s)=>sum+Number(s.people||0),0),
    staffed:sessions.filter(s=>openCount(s)===0).length,
    deposited:docs.filter(d=>d.versions.length).length};
}

function reportNumber(n){
  return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n);
}

function monthlyTableRows(){
  const r=monthlyReport();
  if(!r.month)return [];
  const rows=[['Mois','Type de ligne','Client','Formation','Date de session','Formateur','Statut','Indicateur','Valeur']];
  const row=(type,{s,t,status,label,value}={})=>[r.month,type,s?clientOf(formOf(s)).name:'',s?formOf(s).title:'',s?.date||'',t||'',status||'',label||'',value??''];
  rows.push(row('Synthèse',{label:'Sessions',value:r.sessions.length}),row('Synthèse',{label:'Participants prévus',value:r.participants}),row('Synthèse',{label:'Sessions entièrement staffées',value:r.staffed}),row('Synthèse',{label:'Formateurs mobilisés',value:r.trainersByMission.length}),row('Synthèse',{label:'NPS moyen / 10',value:r.nps===null?'Non mesuré':reportNumber(r.nps)}),row('Synthèse',{label:'Ponctualité documentaire',value:r.punctual.length?reportNumber(r.onTime/r.punctual.length*100)+' %':'Non mesurée'}));
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

async function exportMonthlyChart(){
  const r=monthlyReport();
  if(!/^\d{4}-\d{2}$/.test(r.month))return flash('Choisissez un mois.');
  const period=fmtDate(r.month+'-01',{month:'long',year:'numeric'});
  const stats=[['Sessions',r.sessions.length],['Participants prévus',r.participants],['Affectations',r.assignments.length],['Formateurs mobilisés',r.trainersByMission.length],['Livrables déposés',r.deposited+'/'+r.docs.length],['Bonus du mois',r.bonuses.length],['Points de bonus attribués',r.bonusPoints],['NPS moyen',r.nps===null?'—':reportNumber(r.nps)+' / 10']];
  const palette=['#a48aff','#52d7b2','#ffc475','#f196b3','#87baff'];
  const statusRows=(items,key)=>Object.entries(items.reduce((acc,item)=>{const label=key(item);acc[label]=(acc[label]||0)+1;return acc},Object.create(null)));
  const bars=(title,rows)=>{const max=Math.max(1,...rows.map(x=>x[1]));return `<section><h2>${title}</h2>${rows.map(([label,n],i)=>`<div class="bar-label"><span>${esc(label)}</span><b>${n}</b></div><div class="rail"><div class="bar" style="--width:${n/max*100}%;--i:${i};--color:${palette[i%palette.length]}"></div></div>`).join('')||'<p>Aucune donnée sur la période.</p>'}</section>`};
  const ring=(title,value,total,detail)=>{const fraction=total?Math.round(value/total*100):0;return `<section><h2>${title}</h2><div class="ring-row"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="49" class="track"/><circle cx="60" cy="60" r="49" pathLength="100" stroke-dasharray="${fraction} 100" class="ring"/></svg><div><strong>${total?fraction+' %':'—'}</strong><p>${esc(detail)}</p></div></div></section>`};
  const daysInMonth=new Date(Number(r.month.slice(0,4)),Number(r.month.slice(5)),0).getDate();
  const weekly=Array(Math.ceil(daysInMonth/7)).fill(0);
  r.sessions.forEach(s=>weekly[Math.floor((Number(s.date.slice(8))-1)/7)]++);
  const maxWeek=Math.max(1,...weekly);
  const trends=`<section><h2>Sessions dans le mois</h2><div class="columns" style="--weeks:${weekly.length}">${weekly.map((n,i)=>`<div><b>${n}</b><div class="column" style="--height:${Math.max(3,n/maxWeek*95)}px;--i:${i}"></div><small>${i*7+1}–${Math.min(i*7+7,daysInMonth)}</small></div>`).join('')}</div></section>`;
  const logo=await reportLogo();
  const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monthly AMO · ${esc(period)}</title>
  <style>
  *{box-sizing:border-box}body{margin:0;color:#f5efff;background:#171327;font:16px/1.48 system-ui,Arial,sans-serif}main{max-width:1120px;margin:auto;padding:32px 20px}header{background:linear-gradient(120deg,#372359,#744da8);padding:26px;border-radius:20px;margin-bottom:16px}h1{font-size:clamp(30px,6vw,52px);margin:6px 0}h2{font-size:19px;margin:0 0 15px}p{color:#d9cdea}.report-logo{display:block;width:170px;max-width:100%;background:white;padding:8px;border-radius:8px;margin-bottom:12px}.eyebrow{color:#e8d8ff;letter-spacing:.1em}.stats,.grid{display:grid;gap:12px}.stats{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:12px}.stats div,section{background:#252039;border:1px solid #423754;border-radius:14px;padding:15px}.stats strong,.ring-row strong{display:block;font-size:27px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bar-label{display:flex;justify-content:space-between;margin:9px 0 4px}.rail{height:12px;background:#423754;border-radius:10px;overflow:hidden}.bar{height:100%;width:var(--width);background:var(--color);border-radius:10px;transform-origin:left;animation:grow .85s both;animation-delay:calc(var(--i)*90ms)}.ring-row{display:flex;align-items:center;gap:16px}.ring-row svg{width:100px;flex:none;transform:rotate(-90deg)}circle{fill:none;stroke-width:10}.track{stroke:#423754}.ring{stroke:#52d7b2;stroke-linecap:round;animation:ring 1s both}.columns{display:grid;grid-template-columns:repeat(var(--weeks),1fr);gap:8px;align-items:end;text-align:center;height:145px}.columns>div{display:grid;justify-items:center;gap:3px}.column{width:min(36px,90%);height:var(--height);border-radius:5px;background:#a48aff;transform-origin:bottom;animation:rise .75s both;animation-delay:calc(var(--i)*90ms)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border-bottom:1px solid #423754}.wide{grid-column:1/-1}@keyframes grow{from{transform:scaleX(0)}}@keyframes rise{from{transform:scaleY(0)}}@keyframes ring{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}@media(max-width:600px){.grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}
  </style><main><header>${logo}<div class="eyebrow">CERTIF-IA HUB</div><h1>Monthly AMO</h1><div>${esc(period)}</div></header>
  <div class="stats">${stats.map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('')}</div>
  <div class="grid">${trends}
  ${ring('Couverture du staffing',r.staffed,r.sessions.length,`${r.staffed} session(s) entièrement staffée(s) sur ${r.sessions.length}`)}
  ${bars('Propositions par statut',statusRows(r.proposals,p=>p.status))}
  ${bars('Livrables par statut',statusRows(r.docs,d=>d.status))}
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
  return modalBox('Brouillon WhatsApp','Relisez le message et copiez-le pour l’envoyer depuis WhatsApp.',`
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
    <style>body{margin:0;background:#f5f1fa;color:#241638;font:14px/1.5 system-ui,sans-serif}main{max-width:1350px;margin:auto;padding:26px 16px}header{border-radius:16px;background:#2c1c45;color:white;padding:22px;margin-bottom:14px}h1{margin:9px 0 2px}.report-logo{display:block;width:170px;max-width:100%;background:white;padding:8px;border-radius:8px}section{overflow:auto;border-radius:12px;border:1px solid #dfd5e8}table{width:100%;border-collapse:collapse;background:white}th,td{padding:10px;min-width:80px;text-align:left;border-bottom:1px solid #ece5f1}th{background:#e9dcfb}tbody tr:nth-child(even){background:#faf7fd}@media print{body{background:white}main{padding:0}header{color:black;background:white}section{overflow:visible}th,td{min-width:0;padding:4px;font-size:9px}}</style>
    <main><header>${logo}<h1>Monthly AMO · Tableau détaillé</h1><div>${esc(period)}</div></header><section><table><thead><tr>${columns.map(label=>`<th scope="col">${esc(label)}</th>`).join('')}</tr></thead><tbody>${data.map(row=>`<tr>${row.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></section></main></html>`;
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
  const title=doc.id?`<button class="document-title" onclick="openModal('document-preview','${doc.id}')">${esc(doc.title)}</button>`:`<strong>${esc(doc.title)}</strong>`;
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
    <div class="folder-grid">${sessions.filter(s=>!open||trainerMissionDocuments(s).some(d=>d.owner==='formateur'&&trainerDocPending(d))).map(s=>{
      const f=formOf(s),items=trainerMissionDocuments(s);
      return `<section class="card folder-card">${cardTitle(esc(clientOf(f).name),esc(f.title))}<p class="item-sub">${fmtDate(s.date)}</p>
        ${missionDocumentSummary(s)}
        <ul class="doc-preview">${items.map(d=>`<li><span>${esc(d.title)} <small class="item-sub">· ${d.owner==='interne'||d.versions.at(-1)?.uploader==='amo'?'AMO':'Formateur'}</small></span>${badge(!d.versions.length&&d.status!=='Non applicable'?'Non déposé':d.status)}</li>`).join('')}</ul>
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
    ${trainerMissionDocuments(s).map(trainerSessionDocumentRow).join('')}</section>`).join('')}`;
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
initV17();state.calendarDate=parisToday();const upcomingStaffing=db.sessions.filter(s=>s.date>=state.calendarDate&&s.status!=='Annulée'&&openCount(s)>0).sort((a,b)=>a.date.localeCompare(b.date))[0];if(upcomingStaffing)state.selectedSession=upcomingStaffing.id;try{const id=Number(localStorage.getItem(DEMO_KEY+'-active-trainer'));if(trainerById(id))state.trainerId=id}catch(e){}simulateDueReminders(true);restoreHash();render();setInterval(()=>{if(simulateDueReminders(true))render()},60000);
window.addEventListener('hashchange',()=>{restoreHash();render()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.modal)closeModal();else if(state.mobileMore)closeMobileMore();}});
