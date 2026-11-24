/* Certif-IA Hub — Calls de cadrage V3 (suivi local, sans transport externe).
 * Chargé après hub.js, operations.js, proposition.js et agenda-v2.js.
 * N'altère pas les objets métier existants ; les informations restent en localStorage.
 */
(function () {
'use strict';
const PAGE='scoping-calls';
function scopeIcon(name,size=16){
 const shapes={
 phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 1.9z"/>',
 'file-search':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="10.5" cy="14.5" r="2.5"/><path d="m12.4 16.4 2.1 2.1"/>',
 presentation:'<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4M7 7h10M7 11h6"/>',
 alert:'<path d="M12 3 2 21h20L12 3z"/><path d="M12 9v4M12 17h.01"/>',
 external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 1 1 21 11.5z"/>',
 sparkles:'<path d="m12 3 1.9 5.9L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.1L12 3z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
 shield:'<path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-4"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a3 3 0 1 1 5.5 2c-.8.9-3 1.6-3 3M12 17h.01"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'
 };
 if(['calendar','profile','mail','check','close','chevron','docs','download'].includes(name))return mobileIcon(name,size);
 return '<svg class="scope-svg-icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes.help)+'</svg>';
}

const PREP=[['audit','Audit client récupéré'],['shared','Audit transmis au formateur'],['objectives','Objectifs pédagogiques identifiés'],['program','Programme accessible'],['contact','Contact client identifié'],['attendees','Participants au call identifiés'],['date','Date du call confirmée'],['meet','Lien de visioconférence prêt'],['questions','Questions préparées']];
const DATE_FORMAT=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'});
const localDate=()=>typeof parisToday==='function'?parisToday():new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const isoDate=(date)=>date.toISOString().slice(0,10);
const addDays=(day,n)=>{const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+n);return isoDate(d)};
const durationToMinutes=time=>{const [h,m]=String(time||'00:00').split(':').map(Number);return h*60+m};
const timeFromMinutes=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const escapeText=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt=d=>d?DATE_FORMAT.format(new Date(d+'T12:00:00')):'Non renseigné';
const key=f=>'F'+f.id;
const callStore={
 read:id=>db.scoping?.calls?.[key({id})],
 write(record){
   db.scoping ||= {};
   db.scoping.calls ||= {};
   const id=key({id:record.formationId}), previous=db.scoping.calls[id];
   db.scoping.calls[id]=record;
   try{
     localStorage.setItem(DEMO_KEY,JSON.stringify({version:1,data:db}));
     return true;
   }catch{
     if(previous)db.scoping.calls[id]=previous;
     else delete db.scoping.calls[id];
     notify('Enregistrement impossible. Réessayez dans ce navigateur.');
     return false;
   }
 }
};
function sessionsOf(f){return (db.sessions||[]).filter(s=>s.formationId===f.id&&s.status!=='Annulée').sort((a,b)=>a.date.localeCompare(b.date));}
function formTrainer(f){
 const sessions=sessionsOf(f), upcoming=sessions.filter(s=>s.date>=localDate());
 const ordered=upcoming.length?upcoming:sessions.slice().reverse();
 for(const session of ordered){
   const assigned=db.assignments.find(a=>a.sessionId===session.id&&['Confirmée','Réalisée'].includes(a.status));
   if(assigned)return trainerById(assigned.trainerId);
 }
 return null;
}
function clientRecord(f){return clients.find(c=>c.id===f.clientId)||{name:'Client inconnu'};}
function callFor(f){
 const saved=callStore.read(f.id);
 if(saved){
   const r=structuredClone(saved);
   return {...r,formationId:f.id,history:r.history||[],proposals:r.proposals||[],checklist:r.checklist||{}};
 }
 return {id:key(f),formationId:f.id,status:'todo',duration:30,proposals:[],date:'',start:'',end:'',meet:'',notes:'',
   history:[],checklist:{},trainerResponse:'unknown',clientResponse:'unknown'};
}
function callSessionDate(f){return sessionsOf(f).find(s=>s.date>=localDate())?.date||sessionsOf(f)[0]?.date||'';}
function daysBefore(date){return date?Math.round((Date.parse(date+'T12:00:00')-Date.parse(localDate()+'T12:00:00'))/86400000):null;}
function allCalls(){return formations.map(f=>({f,record:callFor(f),client:clientRecord(f),trainer:formTrainer(f),date:callSessionDate(f)}));}
function safeNumber(value){return typeof value==='string'&&/^\+?[0-9][0-9 .()\-]{5,24}$/.test(value.trim())?value.replace(/[^+\d]/g,''):'';}
function telLink(v){const n=safeNumber(v);return n?'tel:'+n:null;}
window.confirmedScopingConflict=(entry,trainerId,ignoreCall)=>
 formations.some(f=>{
   if(f.id===ignoreCall)return false;
   const r=callStore.read(f.id);
   return r?.status==='confirmed'&&(r.trainerId??formTrainer(f)?.id)===trainerId&&agendaEntriesOverlap(entry,r);
 });
function trainerBusy(trainer,date,start,end,ignoreCall){
 return !trainer||Boolean(calendarConflict({date,start,end},trainer.id,{allowAvailable:true,ignoreCall}));
}
function calendarMode(trainer){
 if(!trainer)return {kind:'none',label:'Formateur à affecter'};
 const label=window.agendaConnectionLabel?.(trainer.id)||'Agenda non vérifié';
 return {kind:label==='Agenda connecté'?'verified':label==='Agenda simulé'?'simulation':'unknown',label};
}
function slotsFor(f,record,days=10){
 const trainer=formTrainer(f),today=localDate(),startDate=state.scopingStartDate&&state.scopingStartDate>today?state.scopingStartDate:today,out=[];
 const duration=Number(record.duration||30);
 for(let d=0;d<days;d++){
  const date=addDays(startDate,d),weekday=new Date(date+'T12:00:00').getDay();if(weekday===0||weekday===6)continue;
  for(const hour of ['09:00','10:00','11:00','14:00','15:00','16:00']){
   const end=timeFromMinutes(durationToMinutes(hour)+duration);if(expired({date,start:hour})||durationToMinutes(end)>1080||trainerBusy(trainer,date,hour,end,f.id))continue;
   const check=window.agendaV2Check?.({date,start:hour,end},trainer.id,{ignoreCall:f.id});
   out.push({date,start:hour,end,mode:check?.state||'unknown',label:check?.label||'Disponibilité non vérifiée'});

  }
 }
 const priority={verified:0,preference:1,simulation:2,unknown:3,unavailable:3};
 const preferred=window.trainerAvailabilityPreferences?.(trainer?.id)?.days||[];
 const favored=slot=>preferred.includes(String(new Date(slot.date+'T12:00:00').getDay()));
 return out.sort((a,b)=>(priority[a.mode]??3)-(priority[b.mode]??3)||Number(favored(b))-Number(favored(a))).slice(0,18);
}


const finalCallStates=['confirmed','done','cancelled'];
const cockpitStates={todo:'À planifier',draft:'Propositions préparées',waiting:'En attente du formateur',
 received:'Réponse reçue',ready:'À confirmer',confirmed:'Confirmé',done:'Réalisé',cancelled:'Annulé'};
const timeLabel=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const localClock=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const eventTime=at=>Number.isFinite(Date.parse(at))?timeLabel.format(new Date(at)):'Date non renseignée';
const expired=slot=>slot.date<localDate()||(slot.date===localDate()&&slot.start<=localClock.format(new Date()));
const hasReply=slot=>Boolean(slot.trainerAccepted||slot.trainerDeclined);
const isDraft=slot=>!slot.sentAt&&!hasReply(slot);
const scopeTime=slot=>fmt(slot.date)+' · '+slot.start+'–'+slot.end;
const inScope=(slot,trainer)=>Boolean(trainer&&(slot.recipientId??slot.respondedBy??trainer.id)===trainer.id);
const currentAccepted=(slot,trainer)=>slot.trainerAccepted&&!slot.trainerDeclined&&!expired(slot)&&inScope(slot,trainer);
const pendingSlots=(r,trainer)=>r.proposals.filter(slot=>slot.sentAt&&!hasReply(slot)&&!expired(slot)&&inScope(slot,trainer));
const draftSlots=r=>r.proposals.filter(isDraft);
const lastStamp=dates=>dates.filter(Boolean).sort().at(-1);
const reminderCooldownMs=24*60*60*1000;

function callStage(f,r,trainer=formTrainer(f)){
 if(finalCallStates.includes(r.status))return r.status;
 if(r.proposals.some(slot=>currentAccepted(slot,trainer)))return 'ready';
 if(r.trainerSuggested?.some(slot=>!expired(slot)&&(slot.trainerId??trainer?.id)===trainer?.id))return 'received';
 if(pendingSlots(r,trainer).length)return 'waiting';
 if(draftSlots(r).length)return 'draft';
 return r.proposals.length?'received':'todo';
}

function callAction(f,r,trainer){
 const stage=callStage(f,r,trainer);
 return ({
   todo:['plan','Organiser le call'],draft:['plan','Préparer l’envoi'],waiting:['follow','Voir le suivi'],
   received:['follow','Voir les réponses'],ready:['follow','Confirmer un créneau'],
   confirmed:['prepare','Préparer le call'],done:['notes','Ouvrir le compte rendu'],cancelled:['follow','Voir l’historique']
 })[stage];
}

function isUrgent(f,r){
 const days=daysBefore(callSessionDate(f));
 return !finalCallStates.includes(r.status)&&days!==null&&days<=14;
}

function matchesScopeFilter(row,filter){
 return filter==='all'||(filter==='due'?isUrgent(row.f,row.record):callStage(row.f,row.record,row.trainer)===filter);
}

function cockpitPill(stage){
 return `<span class="scope-pill scope-${stage}">${cockpitStates[stage]}</span>`;
}

function statsMarkup(rows){
 return `<div class="scope-statgrid scope-kpis" role="group" aria-label="Filtrer par indicateur">${[
  ['todo','À planifier','calendar'],['waiting','En attente de réponse','mail'],
  ['confirmed','Confirmés','check'],['due','Urgents','alert']
 ].map(([key,label,icon])=>`<button class="scope-stat" type="button" data-filter="${key}" aria-pressed="${state.scopingFilter===key}" onclick="scopingToggleFilter('${key}')">
   ${scopeIcon(icon,19)}<strong>${rows.filter(row=>matchesScopeFilter(row,key)).length}</strong><span>${label}</span></button>`).join('')}</div>`;
}

function listMarkup(rows){
 const search=(state.scopingSearch||'').trim().toLocaleLowerCase('fr'), filter=state.scopingFilter||'all';
 const shown=rows.filter(row=>matchesScopeFilter(row,filter)&&
   [row.client.name,row.f.title,row.trainer?.name].join(' ').toLocaleLowerCase('fr').includes(search))
   .sort((a,b)=>Number(isUrgent(b.f,b.record))-Number(isUrgent(a.f,a.record))||(a.date||'9999').localeCompare(b.date||'9999'));
 return `<section aria-labelledby="scope-dossiers"><div class="scope-listhead"><h2 id="scope-dossiers">Dossiers de cadrage</h2>
   <span>${shown.length} dossier(s)</span></div>
   <div class="scope-controls scope-cockpit-controls">
     <label class="scope-search"><span class="sr-only">Rechercher un dossier</span><input type="search"
       placeholder="Client, formation ou formateur…" value="${escapeText(state.scopingSearch||'')}" oninput="scopingSearch(this.value)"></label>
     <select class="field" aria-label="Filtrer par statut" onchange="scopingFilter(this.value)">${[['all','Tous les statuts'],...Object.entries(cockpitStates),['due','Urgents · J-14']].map(([key,label])=>
       `<option value="${key}" ${filter===key?'selected':''}>${label}</option>`).join('')}</select>
   </div><div class="scope-dossier-grid">${shown.map(({f,record:r,client,trainer,date})=>{
     const stage=callStage(f,r,trainer), [,action]=callAction(f,r,trainer), latest=r.history?.at(-1);
     const sent=r.proposals.filter(slot=>slot.sentAt);
     return `<button type="button" class="card scope-dossier-card" onclick="scopingSelect('${escapeText(f.id)}')">
       <span class="scope-itemtop"><strong>${escapeText(client.name)}</strong>${cockpitPill(stage)}</span>
       <span class="scope-dossier-title">${escapeText(f.title)}</span>
       <span class="scope-dossier-meta"><span>${scopeIcon('calendar',15)} ${fmt(date)}</span>
         <span>${scopeIcon('profile',15)} ${escapeText(trainer?.name||'Formateur à affecter')}</span></span>
       ${isUrgent(f,r)?`<span class="scope-urgent">${scopeIcon('alert',14)} Urgent · J-14</span>`:''}
       ${sent.length?`<span class="scope-itemsub">${sent.length} créneau(x) transmis · ${eventTime(lastStamp(sent.map(s=>s.sentAt)))}</span>`:''}
       <span class="scope-dossier-activity">${latest?escapeText(eventTime(latest.at)+' · '+latest.text):'Aucune activité enregistrée'}</span>
       <span class="scope-itemgo">${action} ${scopeIcon('chevron',15)}</span></button>`;
   }).join('')||'<p class="card scope-empty">Aucun dossier pour cette recherche et ce filtre.</p>'}</div></section>`;
}

function clientContact(f){
 const d=clientDetails?.[f.clientId]||{};
 const clean=v=>String(v||'').trim();
 return {name:/^(contact client non renseigné|non renseigné)$/i.test(clean(d.contact))?'':clean(d.contact),
 role:clean(d.contactRole||d.roleContact),phone:clean(d.contactPhone||d.phone||d.telephone),
 email:clean(d.contactEmail||d.email),url:clean(d.hubspotUrl||d.contactUrl)};
}
function contactMarkup(f){
 const p=clientContact(f),number=telLink(p.phone),email=p.email,emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 return `<div class="scope-sectionhead"><h3>Contact client</h3><small>Informations issues de la fiche Client</small></div>
 <div class="scope-contact-card"><div class="scope-contact-person"><span class="scope-contact-avatar">${scopeIcon("phone",19)}</span><div><strong>${escapeText(p.name||'Interlocuteur à renseigner')}</strong><small>${escapeText(p.role||clientRecord(f).name)}</small></div></div>
 <div class="scope-contact-facts"><div><small>Téléphone</small><strong>${escapeText(p.phone||'Non renseigné')}</strong></div><div><small>E-mail</small><strong>${escapeText(p.email||'Non renseigné')}</strong></div></div>
 <div class="scope-actionrow">${number?`<a class="primary scope-main-action" href="${escapeText(number)}">${scopeIcon("phone",15)} Appeler</a>`:`<button class="secondary" disabled>${scopeIcon("phone",15)} Numéro manquant</button>`}
 ${emailValid?`<a class="secondary scope-main-action" href="mailto:${escapeText(email)}">${scopeIcon("mail",15)} E-mail</a>`:'<button class="secondary" disabled>E-mail manquant</button>'}
 <button class="secondary tiny" onclick="openClient('${escapeText(f.clientId)}')">${scopeIcon("external",15)} Fiche client</button></div>
 <p class="scope-help">Les données viennent de la fiche Client du Hub. Aucune modification locale ne crée de contact distinct.</p></div>`;
}

function scopingMessageText(f,slots){
 const trainer=formTrainer(f), client=clientRecord(f);
 return `Bonjour ${trainer?.name.split(' ')[0]||''},\n\nVoici les créneaux proposés pour le call de cadrage avec ${client.name}, pour la formation « ${f.title} ».\n\n${slots.map(s=>scopeTime(s)).join('\n')}\n\nMerci d’indiquer vos disponibilités dans votre espace Certif-IA.\nL’équipe Certif-IA`;
}

function availabilityMarkup(f,r){
 const trainer=formTrainer(f),mode=calendarMode(trainer), drafts=draftSlots(r);
 if(finalCallStates.includes(r.status))return '<p class="scope-help">Les créneaux sont disponibles dans le suivi du dossier.</p>';
 if(!trainer)return `<div class="scope-sectionhead"><h3>Trouver un créneau</h3></div>
    <p class="scope-warning">Affectez un formateur avant de préparer les créneaux.</p><button class="secondary" onclick="go('staffing')">Ouvrir Staffing</button>`;
 const list=slotsFor(f,r,14), from=state.scopingStartDate||localDate();
 const expanded=Boolean(state.scopingSlotsExpanded);
 return `<div class="scope-sectionhead"><h3>Trouver un créneau</h3><span class="scope-availability ${mode.kind}">${escapeText(mode.label)}</span></div>
   <div class="scope-availabilitytop">
     <label class="scope-inline">À partir du <input class="scope-date-picker" type="date" value="${escapeText(from)}" min="${localDate()}" onchange="scopingSetStartDate(this.value)"></label>
     <label class="scope-inline">Durée <select id="scope-duration" onchange="scopingDuration(this.value)">${[15,30,45,60].map(n=>
       `<option ${r.duration===n?'selected':''} value="${n}">${n} min</option>`).join('')}</select></label>
   </div>
   ${drafts.length?`<div class="scope-selection"><div class="scope-sectionhead"><h3>${drafts.length} créneau(x) sélectionné(s)</h3>
     <button class="primary" onclick="reviewScopingSend()">Proposer ces créneaux</button></div><ul>${r.proposals.map((s,i)=>isDraft(s)?
       `<li><span>${scopeTime(s)}</span><button class="secondary tiny" aria-label="Retirer ${scopeTime(s)}" onclick="scopingRemoveSlot(${i})">Retirer</button></li>`:'').join('')}</ul></div>`:''}
   <div class="scope-slotlist">${(expanded?list:list.slice(0,6)).map(slot=>{
     const index=r.proposals.findIndex(s=>s.date===slot.date&&s.start===slot.start&&s.end===slot.end);
     const selected=index>=0, draft=selected&&isDraft(r.proposals[index]);
     const day=fmtDate(slot.date,{weekday:'long',day:'numeric',month:'long'});
     return `<button type="button" class="scope-slot ${selected?'is-selected':''}" aria-label="${draft?'Retirer':selected?'Déjà suivi':'Ajouter'} ${day} ${slot.start}"
       onclick="${draft?`scopingRemoveSlot(${index})`:`scopingChooseSlot('${slot.date}','${slot.start}','${slot.end}')`}" ${selected&&!draft?'disabled':''}>
       <span class="scope-slotdate"><strong>${day}</strong><small>${slot.start} – ${slot.end}</small></span>
       <span class="scope-slotstatus ${slot.mode}">${escapeText(slot.label)}</span><span class="scope-slotarrow">${selected?scopeIcon('check',16):scopeIcon('plus',16)} <span>${draft?'Sélectionné':selected?'Déjà suivi':'Ajouter'}</span></span></button>`;
   }).join('')||'<p class="scope-empty">Aucun créneau trouvé sur cette période. Essayez une autre date ou durée.</p>'}</div>
   ${list.length>6?`<button class="secondary tiny scope-see-more" aria-expanded="${expanded}" onclick="scopingToggleMoreSlots()">${expanded?'Voir moins':'Voir plus'} ${scopeIcon('chevron',15)}</button>`:''}`;
}

function docsForFormation(f){
 return ['AUDIT','CADRAGE'].map(category=>{
  const matches=(db.deliverables||[]).filter(d=>d.formationId===f.id&&docCategory(d)===category)
   .sort((a,b)=>(b.versions?.length||0)-(a.versions?.length||0));
  return {category,doc:matches[0],available:!!matches[0]?.versions?.length};
 });
}
function documentsMarkup(f){
 const docs=docsForFormation(f),count=docs.filter(d=>d.available).length;
 return `<div class="scope-sectionhead"><h3>Documents & synthèse du cadrage</h3><small>${count}/2 livrables déposés</small></div>
 <p class="scope-help scope-doc-lead">Les documents proviennent directement des livrables de cette formation. Plus de liens Drive à saisir.</p>
 <div class="scope-doc-grid">${docs.map(({category,doc,available})=>`<article class="scope-doc-card ${available?'ready':'missing'}"><div class="scope-doc-top"><span class="scope-doc-icon">${scopeIcon(category==="AUDIT"?"file-search":"presentation",21)}</span><div class="scope-doc-name"><strong>${category==='AUDIT'?'Audit client':'Support de cadrage'}</strong><small>${escapeText(doc?.title||'Aucun livrable associé')}</small></div><span class="scope-doc-state ${available?'ready':''}">${available?escapeText(doc.status):'Manquant'}</span></div>
 <p class="scope-help">${escapeText(doc?.versions?.at(-1)?.filename||'Aucune version enregistrée')}</p><div class="scope-doc-actions"><button class="secondary tiny" onclick="scopingOpenDeliverable('${escapeText(f.id)}','${category}')">${scopeIcon("external",15)} ${doc?"Voir le livrable":"Ouvrir les livrables"}</button></div></article>`).join('')}</div>
 <div class="scope-ai-panel"><div class="scope-ai-heading"><div><span class="scope-ai-eyebrow">${scopeIcon("sparkles",14)} ANALYSE CROISÉE</span><h4>Synthèse IA du cadrage</h4><p>Contexte, résultats de l'audit, points de vigilance et questions pertinentes.</p></div><span class="scope-ai-chip">API à connecter</span></div>
 <div class="scope-ai-topics">${[['target','Contexte & objectifs'],['clipboard','Résultats d’audit'],['shield','Écarts & vigilance'],['help','Questions pour le call']].map(([ic,label])=>`<span><b>${scopeIcon(ic,18)}</b>${label}</span>`).join('')}</div>
 <p class="scope-ai-empty">${count<2?'La synthèse nécessite les deux livrables déposés dans le Hub.':'Les deux livrables sont identifiés. La génération sera disponible après connexion de l’API.'}</p>
 <button class="primary scope-ai-generate" disabled>${scopeIcon("sparkles",16)} Générer la synthèse · API à connecter</button><p class="scope-ai-disclaimer">Aucune synthèse fictive. Les fichiers sont ceux de la formation concernée.</p></div>`;
}

function slotStatus(r,slot,index,trainer){
 const confirmed=['confirmed','done'].includes(r.status);
 if(confirmed&&r.confirmedProposalIndex===index)return 'Créneau confirmé';
 if(slot.trainerDeclined)return 'Refusé par le formateur';
 if(confirmed)return slot.trainerAccepted?'Accepté · non retenu':'Non retenu';
 if(r.status==='cancelled')return 'Call annulé';
 if(!inScope(slot,trainer))return 'Autre destinataire';
 if(expired(slot))return 'Expiré';
 if(slot.trainerAccepted)return 'Accepté par le formateur';
 return 'En attente';
}

function elapsedSince(at){
 const minutes=Math.max(0,Math.floor((Date.now()-Date.parse(at))/60000));
 if(minutes<1)return 'À l’instant';
 if(minutes<60)return 'Il y a '+minutes+' min';
 if(minutes<1440)return 'Il y a '+Math.floor(minutes/60)+' h';
 return 'Il y a '+Math.floor(minutes/1440)+' j';
}

function reminderAvailability(r,trainer){
 if(finalCallStates.includes(r.status)||!pendingSlots(r,trainer).length)return 'none';
 const last=lastStamp((r.reminders||[]).filter(event=>event.trainerId===trainer.id&&
   ['requested','processed','accepted'].includes(event.status)).map(event=>event.at));
 return last&&Date.now()-Date.parse(last)<reminderCooldownMs?'cooldown':'preview';
}

function timelineMarkup(r){
 const states={requested:'Relance demandée',processed:'Prise en charge par le serveur',
   accepted:'Acceptée par le service push',failed:'Échec de la relance',received:'Réception confirmée',read:'Lecture confirmée'};
 const reminders=(r.reminders||[]).filter(event=>Object.hasOwn(states,event.status)).map(event=>({
   at:event.at,text:[states[event.status],trainerById(event.trainerId)?.name,event.channel,event.author,event.result].filter(Boolean).join(' · ')
 }));
 const events=[...(r.history||[]),...reminders].sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,30);
 return `<section><div class="scope-sectionhead"><h3>Historique des échanges</h3></div>
  ${events.length?`<ol class="scope-timeline">${events.map(event=>
    `<li><time datetime="${escapeText(event.at)}">${eventTime(event.at)}</time><span>${escapeText(event.text)}</span></li>`).join('')}</ol>`:
    '<p class="scope-empty">Aucune activité enregistrée.</p>'}</section>`;
}

function followMarkup(f,r){
 const trainer=formTrainer(f), pinnedTrainer=['confirmed','done'].includes(r.status)?trainerById(r.trainerId)||trainer:trainer;
 const stage=callStage(f,r,trainer), sent=r.proposals.filter(slot=>slot.sentAt);
 const lastSend=lastStamp(sent.map(slot=>slot.sentAt));
 const lastReply=lastStamp(r.proposals.map(slot=>slot.responseAt).concat((r.trainerSuggested||[]).map(slot=>slot.suggestedAt)));
 const hasResponses=r.proposals.some(hasReply)||Boolean(r.trainerSuggested?.length);
 const selected=r.proposals[r.confirmedProposalIndex];
 const reminder=reminderAvailability(r,trainer);
 const confirmed=['confirmed','done'].includes(r.status);
 return `<section aria-labelledby="scope-tracking"><div class="scope-sectionhead"><h3 id="scope-tracking">Suivi des propositions</h3>${cockpitPill(stage)}</div>
   <div class="scope-follow-summary">
     <div><small>Formateur</small><strong>${escapeText(pinnedTrainer?.name||'À affecter')}</strong></div>
     <div><small>Créneaux transmis</small><strong>${sent.length}</strong></div>
     <div><small>Dernier envoi déclaré</small><strong>${lastSend?eventTime(lastSend):'Non enregistré'}</strong>${lastSend?`<small>${elapsedSince(lastSend)}</small>`:''}</div>
     <div><small>Dernière réponse</small><strong>${lastReply?eventTime(lastReply):hasResponses?'Date non renseignée':'Aucune réponse'}</strong></div>
   </div>
   ${reminder==='preview'?`<div class="scope-follow-action"><button class="secondary" onclick="reviewScopingReminder()">${mobileIcon('bell',16)} Relancer le formateur</button><small>Notifications push à connecter</small></div>`:
     reminder==='cooldown'?'<p class="scope-help">Relance bloquée pendant le délai de 24 h.</p>':''}
   ${confirmed?`<div class="scope-success"><strong>${r.status==='done'?'Call réalisé':'Call confirmé'}</strong> · ${scopeTime(selected||r)}
     <div class="scope-actionrow"><button class="primary" onclick="scopingTab('${r.status==='done'?'notes':'prepare'}')">${r.status==='done'?'Ouvrir le compte rendu':'Préparer le call'}</button>
     ${r.status==='confirmed'?'<button class="secondary" onclick="scopingMarkDone()">Marquer réalisé</button>':''}</div></div>`:''}
   <div class="scope-follow-slots">${r.proposals.map((slot,index)=>{
     const draft=isDraft(slot);
     if(draft&&!finalCallStates.includes(r.status))return '';
     const accepted=!finalCallStates.includes(r.status)&&currentAccepted(slot,trainer);
     return `<div class="scope-follow-slot ${accepted?'can-confirm':''}"><div><strong>${scopeTime(slot)}</strong>
       <small>${slot.sentAt?'Envoi déclaré · '+eventTime(slot.sentAt):slot.source==='trainer'?'Proposé par le formateur':'Transmission non enregistrée'}</small></div>
       <span class="scope-pill ${accepted?'scope-confirmed':''}">${slotStatus(r,slot,index,trainer)}</span>
       ${accepted?`<button class="primary tiny" onclick="reviewScopingConfirm(${index})">Confirmer ce créneau</button>`:''}</div>`;
     }).join('')||'<p class="scope-empty">Aucun créneau transmis ou ayant reçu une réponse.</p>'}</div>
   ${r.trainerSuggested?.length?`<div class="scope-proposals"><strong>Autres créneaux proposés par le formateur</strong>${r.trainerSuggested.map((slot,i)=>
     `<div><span>${scopeTime(slot)}</span>${!finalCallStates.includes(r.status)&&!expired(slot)&&inScope({...slot,recipientId:slot.trainerId},trainer)?
       `<button class="secondary tiny" onclick="scopingAddTrainerSuggestion(${i})">Ajouter aux propositions</button>`:''}</div>`).join('')}</div>`:''}
   ${!confirmed&&!pendingSlots(r,trainer).length&&!r.proposals.some(slot=>currentAccepted(slot,trainer))&&!finalCallStates.includes(r.status)?
     '<div class="scope-actionrow"><button class="secondary" onclick="scopingTab(\'plan\')">Proposer des créneaux</button></div>':''}
   ${!['done','cancelled'].includes(r.status)?'<div class="scope-actionrow"><button class="ghost" onclick="reviewScopingCancellation()">Annuler le call</button></div>':''}
 </section>${timelineMarkup(r)}`;
}

function showScopeDialog(title,content){
 const dialog=document.getElementById('scope-workflow-dialog');
 if(!dialog||dialog.open)return;
 dialog.innerHTML=`<h2 id="scope-dialog-title">${escapeText(title)}</h2>${content}<p class="scope-dialog-status" role="status"></p>`;
 dialog.showModal();
}

const closeScopeDialog='<button class="secondary" type="button" onclick="this.closest(\'dialog\').close()">Annuler</button>';

window.reviewScopingSend=()=>{
 const d=getSelected(), trainer=d&&formTrainer(d.f);
 if(!d||!trainer||finalCallStates.includes(d.r.status))return;
 const drafts=draftSlots(d.r);
 if(!drafts.length)return;
 showScopeDialog('Proposer ces créneaux',`<p>${escapeText(trainer.name)} · ${escapeText(clientRecord(d.f).name)} · ${drafts.length} créneau(x)</p>
   <label class="scope-field"><span>Message à transmettre au formateur</span><textarea id="scope-send-message" rows="8" readonly>${escapeText(scopingMessageText(d.f,drafts))}</textarea></label>
   <p class="scope-help">Copiez le message et transmettez-le sur le canal de votre choix. Confirmez ensuite son envoi pour enregistrer le suivi dans ce navigateur.</p>
   <div class="scope-dialog-actions">${closeScopeDialog}<button class="secondary" onclick="scopingCopyMessage()">Copier le message</button>
     <button class="primary" onclick="declareScopingSent()">J’ai envoyé les propositions</button></div>`);
};

window.scopingCopyMessage=async()=>{
 const field=document.getElementById('scope-send-message');
 if(!field)return;
 try{await navigator.clipboard.writeText(field.value);notify('Message copié. L’envoi reste à déclarer.');}
 catch{field.focus();field.select();notify('Copie automatique indisponible. Le message est sélectionné.');}
};

window.declareScopingSent=()=>{
 const d=getSelected(), trainer=d&&formTrainer(d.f);
 if(!d||!trainer||finalCallStates.includes(d.r.status)||!document.getElementById('scope-send-message'))return;
 const drafts=draftSlots(d.r);
 if(!drafts.length)return;
 if(drafts.some(slot=>expired(slot)||trainerBusy(trainer,slot.date,slot.start,slot.end,d.f.id)))
   return notify('Un créneau a expiré ou est occupé. Retirez-le avant de déclarer l’envoi.');
 const sentAt=new Date().toISOString();
 for(const slot of drafts)Object.assign(slot,{sentAt,recipientId:trainer.id,channel:'external-manual'});
 d.r.status='pending';
 if(persist(d,`Envoi déclaré par l’AMO · ${drafts.length} créneau(x) pour ${trainer.name}`,'follow')){
   notify('Envoi déclaré pour '+drafts.length+' créneau(x).');
 }
};

window.reviewScopingReminder=()=>{
 const d=getSelected(),trainer=d&&formTrainer(d.f);
 if(!d||reminderAvailability(d.r,trainer)!=='preview')return;
 const count=pendingSlots(d.r,trainer).length, client=clientRecord(d.f).name;
 const message=`Bonjour ${trainer.name.split(' ')[0]}, des propositions de créneaux pour votre call de cadrage avec ${client} attendent votre réponse. Consultez votre espace Certif-IA pour confirmer votre disponibilité.`;
 showScopeDialog('Relancer le formateur',`<p>${escapeText(trainer.name)} · ${escapeText(client)}<br>${escapeText(d.f.title)} · ${count} proposition(s) en attente</p>
   <p class="scope-message-preview">${escapeText(message)}</p><p class="scope-warning">Notifications push à connecter</p>
   <div class="scope-dialog-actions">${closeScopeDialog}<button class="primary" disabled>Envoyer la relance</button></div>`);
};

window.reviewScopingConfirm=index=>{
 const d=getSelected(),trainer=d&&formTrainer(d.f),slot=d?.r.proposals[index];
 if(!slot||finalCallStates.includes(d.r.status)||!currentAccepted(slot,trainer))return;
 showScopeDialog('Confirmer le créneau',`<p>${scopeTime(slot)} · ${escapeText(trainer.name)}</p>
   <p class="scope-help">Vérifiez l’accord du client. La confirmation est enregistrée localement. L’invitation reste à transmettre manuellement.</p>
   <div class="scope-dialog-actions">${closeScopeDialog}<button class="primary" onclick="scopingConfirm(${index})">Valider ce créneau</button></div>`);
};

window.reviewScopingCancellation=()=>{
 const d=getSelected();
 if(!d||['done','cancelled'].includes(d.r.status))return;
 showScopeDialog('Annuler le call',`<p>L’historique des propositions et des réponses reste disponible.</p>
   <div class="scope-dialog-actions">${closeScopeDialog}<button class="primary" onclick="scopingCancel()">Confirmer l’annulation</button></div>`);
};

function notesMarkup(f,r){
 return `<div class="scope-sectionhead"><h3>Compte rendu</h3><small>À associer aux notes HubSpot du client</small></div><label class="scope-field"><span>Compte rendu du cadrage</span><textarea id="scope-notes" rows="8" placeholder="Attentes client, besoins IA, décisions, adaptations pédagogiques…">${escapeText(r.notes)}</textarea></label>
 <div class="scope-actionrow"><button class="primary" onclick="scopingSaveNotes()">Enregistrer le brouillon</button><button class="secondary" onclick="scopingCopyHubspotNote()">Copier pour HubSpot</button><button class="secondary" disabled title="Connexion HubSpot sécurisée nécessaire">${scopeIcon("external",15)} Synchronisation HubSpot à connecter</button></div>
 ${r.notesSavedAt?`<p class="scope-help">Dernier enregistrement · ${eventTime(r.notesSavedAt)}</p>`:''}<p class="scope-help">HubSpot · synchronisation à connecter. Le brouillon reste dans le Hub de démonstration. L'enregistrement automatique dans la fiche HubSpot nécessitera l'intégration serveur et les identifiants du client ; aucun envoi n'est simulé.</p>`;
}

const scopingNoteKey=(formationId,trainerId)=>'scoping-note:'+formationId+':'+trainerId;
const scopingNoteLimit=10*1024*1024;

function scopingNotePanel(formationId,trainer=false){
 return `<section class="scope-note"><div class="scope-sectionhead"><h3>Note de cadrage du formateur</h3></div>
 <div id="scope-note-files" data-formation="${escapeText(formationId)}" aria-live="polite">Chargement du dépôt…</div>
 ${trainer?`<form class="scope-note-form" onsubmit="event.preventDefault();submitScopingNote(this)">
   <label class="scope-field"><span>Fichier PDF ou Word (.docx) · 10 Mo maximum</span><input name="note" type="file" accept=".pdf,.docx" required></label>
   <button class="primary tiny" type="submit">Déposer la note</button>
 </form><p class="scope-help">Un nouveau dépôt remplace votre note pour cette formation. L’AMO peut la consulter dans ce navigateur.</p>`:''}
 </section>`;
}

function canReadScopingNote(formationId,trainerId){
 return state.role==='amo' ? state.page===PAGE&&state.scopingSelected===formationId :
   state.role==='formateur'&&state.page==='trainer-scoping'&&state.trainerId===trainerId&&getTrainerCall()?.f.id===formationId;
}

async function loadScopingNotes(){
 const panel=document.getElementById('scope-note-files');
 if(!panel)return;
 const formationId=panel.dataset.formation;
 const trainerIds=state.role==='amo'?trainers.map(t=>t.id):[state.trainerId];
 try{
   const notes=await Promise.all(trainerIds.map(async id=>({id,record:await documentStorage('readonly',
     files=>files.get(scopingNoteKey(formationId,id)))})));
   if(!panel.isConnected)return;
   panel.innerHTML=notes.filter(({id,record})=>record&&canReadScopingNote(formationId,id)).map(({id,record})=>
     `<div class="scope-note-file"><div><strong>${escapeText(record.name)}</strong><small>${state.role==='amo'?escapeText(trainerById(id)?.name)+' · ':''}Déposée le ${DATE_FORMAT.format(new Date(record.at))}</small></div>
     <button class="secondary tiny" onclick="downloadScopingNote('${escapeText(formationId)}',${id})">${mobileIcon('download',16)} Télécharger la note</button></div>`
   ).join('')||'<p class="scope-empty">Aucune note déposée.</p>';
 }catch{
   if(panel.isConnected)panel.textContent='Impossible de consulter les dépôts dans ce navigateur.';
 }
}

window.submitScopingNote=async form=>{
 const call=getTrainerCall(), id=state.trainerId;
 if(!call||!canReadScopingNote(call.f.id,id))return;
 const file=form.elements.note.files[0];
 if(!file||!/\.(pdf|docx)$/i.test(file.name)||file.size===0||file.size>scopingNoteLimit)
   return notify('Choisissez un fichier PDF ou Word (.docx) de 10 Mo maximum.');
 const submit=form.querySelector('button[type="submit"]');
 if(submit.disabled)return;
 submit.disabled=true;
 try{
   const bytes=await file.arrayBuffer();
   if(!form.isConnected||!canReadScopingNote(call.f.id,id))return;
   const record={name:file.name,type:file.type,bytes,at:new Date().toISOString()};
   await documentStorage('readwrite',files=>files.put(record,scopingNoteKey(call.f.id,id)));
   if(form.isConnected){form.reset();await loadScopingNotes();notify('Note de cadrage déposée.');}
 }catch{
   if(form.isConnected)notify('Impossible d’enregistrer le fichier dans ce navigateur.');
 }finally{submit.disabled=false;}
};

window.downloadScopingNote=async (formationId,trainerId)=>{
 if(!canReadScopingNote(formationId,trainerId))return;
 try{
   const record=await documentStorage('readonly',files=>files.get(scopingNoteKey(formationId,trainerId)));
   if(!canReadScopingNote(formationId,trainerId))return;
   if(record)downloadBlob(new Blob([record.bytes],{type:record.type}),record.name);
   else notify('Fichier indisponible dans ce navigateur.');
 }catch{notify('Impossible de lire le fichier.');}
};

const scopeTabs=[['plan','Planification'],['follow','Suivi'],['prepare','Préparation'],['notes','Compte rendu']];

function detailMarkup(f,r){
 const trainer=['confirmed','done'].includes(r.status)?trainerById(r.trainerId)||formTrainer(f):formTrainer(f);
 const [defaultTab,action]=callAction(f,r,trainer), tab=state.scopingTabKey||defaultTab;
 const contents={
   plan:()=>`<section>${availabilityMarkup(f,r)}</section><section>${contactMarkup(f)}</section>`,
   follow:()=>followMarkup(f,r),
   prepare:()=>`<section>${documentsMarkup(f)}</section>${scopingNotePanel(f.id)}<section>${contactMarkup(f)}</section>`,
   notes:()=>`<section>${notesMarkup(f,r)}</section>`
 };
 return `<button class="secondary scope-back" onclick="scopingBack()">${mobileIcon('back',16)} Retour aux dossiers</button>
   <article class="card scope-detail"><header class="scope-detailtitle scope-filehead">
     <div><h1 tabindex="-1">${escapeText(clientRecord(f).name)}</h1><p>${escapeText(f.title)}</p>
       <div class="scope-dossier-meta"><span>${scopeIcon('calendar',15)} Formation · ${fmt(callSessionDate(f))}</span>
       <span>${scopeIcon('profile',15)} ${escapeText(trainer?.name||'Formateur à affecter')}</span></div></div>
     <div class="scope-file-status">${cockpitPill(callStage(f,r,trainer))}
       ${tab!==defaultTab&&!(tab==='follow'&&['confirmed','done'].includes(r.status))?`<button class="primary tiny" onclick="scopingTab('${defaultTab}')">${action}</button>`:''}</div>
   </header>
   <nav class="scope-tabs" aria-label="Étapes du cadrage">${scopeTabs.map(([key,label])=>
     `<button class="secondary tiny" ${key===tab?'aria-current="page"':''} onclick="scopingTab('${key}')">${label}</button>`).join('')}</nav>
   <div class="scope-content">${contents[tab]()}</div></article>
   <dialog class="scope-workflow-dialog" id="scope-workflow-dialog" aria-labelledby="scope-dialog-title"></dialog>`;
}

const scopeHash='#/interne/scoping-calls';
function scopeFormationFromHash(){
 const id=location.hash.match(/^#\/interne\/scoping-calls\/([A-Za-z0-9-]+)$/)?.[1];
 return formations.find(f=>f.id===id);
}

function scopingPage(){
 const f=scopeFormationFromHash();
 if(state.scopingSelected!==f?.id){
   state.scopingSelected=f?.id;
   state.scopingTabKey='';
   state.scopingSlotsExpanded=false;
 }
 const rows=f?null:allCalls();
 return `<div class="scope-root scope-amo-v3">${f?detailMarkup(f,callFor(f)):
   `<header>${intro('Calls <em>de cadrage</em>','Organisez vos calls et suivez les réponses des formateurs.')}</header>${statsMarkup(rows)}${listMarkup(rows)}`}
   <p class="scope-footnote">Suivi local dans ce navigateur. Les échanges et confirmations ne déclenchent pas d’envoi externe.</p></div>`;
}

function getSelected(){
 if(state.role!=='amo'||state.page!==PAGE)return null;
 const f=scopeFormationFromHash();
 return f?{f,r:callFor(f)}:null;
}

function persist(d,text,tab){
 d.r.history.push({at:new Date().toISOString(),text});
 if(!callStore.write(d.r))return false;
 if(tab)state.scopingTabKey=tab;
 render();
 return true;
}

function notify(text){
 const status=document.querySelector('#scope-workflow-dialog[open] [role="status"]');
 if(status)status.textContent=text;
 else if(typeof flash==='function')flash(text);
}
window.amoScopingStatus=id=>{
 const f=formations.find(formation=>formation.id===id);
 if(!f)return 'todo';
 const stage=callStage(f,callFor(f));
 return finalCallStates.includes(stage)?stage:['todo','draft'].includes(stage)?'todo':'pending';
};
window.openAmoScoping=id=>{
 if(state.role!=='amo'||!formations.some(f=>f.id===id))return;
 state.scopingSearch='';state.scopingFilter='all';
 if(state.page!==PAGE)go(PAGE);
 window.scopingSelect(id);
};
window.scopingSelect=id=>{
 if(state.role!=='amo'||!formations.some(f=>f.id===id))return;
 const target=scopeHash+'/'+encodeURIComponent(id);
 if(location.hash!==target)history.pushState(null,'',target);
 state.scopingStartDate='';
 render();window.scrollTo(0,0);
 document.querySelector('.scope-filehead h1')?.focus({preventScroll:true});
};
window.scopingBack=()=>{
 if(state.role!=='amo')return;
 go(PAGE);
 document.querySelector('.scope-search input')?.focus({preventScroll:true});
};
window.scopingTab=key=>{
 if(!getSelected()||!scopeTabs.some(([tab])=>tab===key))return;
 state.scopingTabKey=key;render();
 document.querySelector('.scope-tabs [aria-current]')?.focus({preventScroll:true});
};
window.scopingSearch=v=>{state.scopingSearch=v;const pos=document.activeElement?.selectionStart;render();
 const input=document.querySelector('.scope-search input');if(input){input.focus();input.setSelectionRange(pos,pos);}};
window.scopingFilter=v=>{state.scopingFilter=v;render();document.querySelector('.scope-controls select')?.focus();};
window.scopingToggleFilter=v=>{
 state.scopingFilter=state.scopingFilter===v?'all':v;render();
 document.querySelector('.scope-kpis button[data-filter="'+v+'"]')?.focus({preventScroll:true});
};

window.scopingToggleMoreSlots=()=>{
 state.scopingTabKey='plan';
 state.scopingSlotsExpanded=!state.scopingSlotsExpanded;render();
 document.querySelector('.scope-see-more')?.focus({preventScroll:true});
};
window.scopingDuration=n=>{
 const d=getSelected();
 if(!d||finalCallStates.includes(d.r.status)||![15,30,45,60].includes(Number(n)))return;
 d.r.duration=Number(n);state.scopingSlotsExpanded=false;
 if(callStore.write(d.r)){render();document.getElementById('scope-duration')?.focus();}
};
window.scopingChooseSlot=(date,start,end)=>{
 const d=getSelected();
 if(!d||finalCallStates.includes(d.r.status))return;
 const slot=slotsFor(d.f,d.r,14).find(x=>x.date===date&&x.start===start&&x.end===end);
 if(!slot)return notify('Créneau occupé ou devenu indisponible.');
 if(d.r.proposals.some(x=>x.date===date&&x.start===start&&x.end===end))return;
 d.r.proposals.push(slot);d.r.status='pending';
 persist(d,'Créneau préparé · '+scopeTime(slot),'plan');
};
window.scopingRemoveSlot=index=>{
 const d=getSelected(),slot=d?.r.proposals[index];
 if(!slot||!isDraft(slot)||finalCallStates.includes(d.r.status))return;
 d.r.proposals.splice(index,1);
 if(!d.r.proposals.length)d.r.status='todo';
 persist(d,'Créneau préparé retiré · '+scopeTime(slot),'plan');
};
window.scopingConfirm=index=>{
 const d=getSelected(), slot=d?.r.proposals[index], trainer=d&&formTrainer(d.f);
 if(!slot||d.r.status!=='pending'||!currentAccepted(slot,trainer))return notify('Ce créneau accepté n’est plus disponible.');
 if(trainerBusy(trainer,slot.date,slot.start,slot.end,d.f.id))return notify('Le créneau est désormais occupé. Choisissez un autre créneau.');
 Object.assign(d.r,{date:slot.date,start:slot.start,end:slot.end,confirmedProposalIndex:index,status:'confirmed',trainerId:trainer.id});
 persist(d,'Call confirmé · '+scopeTime(slot),'follow');
};
window.scopingMarkDone=()=>{
 const d=getSelected();
 if(d?.r.status==='confirmed'){d.r.status='done';persist(d,'Call marqué comme réalisé','follow');}
};
window.scopingCancel=()=>{
 const d=getSelected();
 if(!d||['done','cancelled'].includes(d.r.status))return;
 d.r.status='cancelled';persist(d,'Call annulé','follow');
};

window.scopingSaveNotes=()=>{const d=getSelected();if(!d)return;
 d.r.notes=document.getElementById('scope-notes')?.value||'';
 d.r.hubspotSync='not-configured';d.r.notesSavedAt=new Date().toISOString();
 if(persist(d,'Brouillon du compte rendu enregistré'))notify('Compte rendu enregistré dans ce navigateur.');
};
window.scopingCopyHubspotNote=()=>{const d=getSelected();if(!d)return;
 const value=document.getElementById('scope-notes')?.value||'';
 if(!value.trim())return notify('Renseignez le compte rendu avant de le copier.');
 const note=`Compte rendu de cadrage · ${clientRecord(d.f).name} · ${d.f.title}\n\n${value}`;
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(note).then(()=>notify('Compte rendu copié pour HubSpot · pas encore synchronisé')).catch(()=>notify('Copie impossible'));
 else{const box=document.createElement('textarea');box.value=note;document.body.append(box);box.select();try{document.execCommand('copy');notify('Compte rendu copié')}catch(e){notify('Copie impossible')}box.remove()}
};
window.scopingSetStartDate=value=>{if(!/^\d{4}-\d\d-\d\d$/.test(value)||value<localDate())return notify('Choisissez une date valide à partir d’aujourd’hui.');state.scopingStartDate=value;state.scopingSlotsExpanded=false;render()};
window.scopingOpenDeliverable=(id,category)=>{if(state.role!=='amo'||!['AUDIT','CADRAGE'].includes(category))return;
 const f=formations.find(x=>x.id===id);if(!f)return;
 const match=docsForFormation(f).find(x=>x.category===category);
 if(match?.doc)openModal('document-preview',match.doc.id);else openFormation(f.id);
};
window.scopingAddTrainerSuggestion=i=>{const d=getSelected();if(!d||!['todo','pending'].includes(d.r.status))return;const slot=d.r.trainerSuggested?.[i];if(!slot)return;
  const trainer=formTrainer(d.f);
 if(expired(slot)||!trainer||(slot.trainerId!=null&&slot.trainerId!==trainer.id)||trainerBusy(trainer,slot.date,slot.start,slot.end,d.f.id))return notify('Ce créneau alternatif n’est plus disponible.');
 if(d.r.proposals.some(s=>s.date===slot.date&&s.start===slot.start))return notify('Créneau déjà proposé.');
 d.r.proposals.push({...slot,trainerAccepted:true,respondedBy:trainer.id,responseAt:slot.suggestedAt,
   source:'trainer',mode:'unknown',label:'Proposé par le formateur'});
 d.r.trainerSuggested.splice(i,1);d.r.status='pending';persist(d,'Créneau alternatif du formateur ajouté');
};

function trainerCalls(id){
 return allCalls().filter(x=>(x.record.trainerId??x.trainer?.id)===id&&x.record.status!=='cancelled');
}

const trainerScopeHash='#/formateur/trainer-scoping';
const trainerScopeId=()=>location.hash.match(/^#\/formateur\/trainer-scoping\/([A-Za-z0-9-]+)$/)?.[1];

function getTrainerCall(){
 if(state.role!=='formateur'||state.page!=='trainer-scoping')return null;
 return trainerCalls(state.trainerId).find(x=>x.f.id===trainerScopeId())||null;
}

function trainerStatus(call,trainer){
 const r=call.record;
 if(r.status==='confirmed')return ['confirmed','Confirmé','Voir le call'];
 if(r.status==='done')return ['done','Réalisé','Consulter le call'];
 if(pendingSlots(r,trainer).length)return ['waiting','À répondre','Répondre aux créneaux'];
 if(r.proposals.some(slot=>currentAccepted(slot,trainer))||
   r.trainerSuggested?.some(slot=>(slot.trainerId??trainer.id)===trainer.id&&!expired(slot)))
   return ['ready','En attente de l’AMO','Voir mes réponses'];
 if(r.proposals.some(slot=>!isDraft(slot)&&inScope(slot,trainer)))return ['received','À replanifier','Voir les créneaux'];
 return ['todo','À planifier','Ouvrir le dossier'];
}

const trainerPill=([style,label])=>`<span class="scope-pill scope-${style}">${label}</span>`;

function trainerCockpit(assigned,trainer){
 const filter=state.scopingTrainerFilter||'all';
 const rows=assigned.map(call=>({call,status:trainerStatus(call,trainer)}))
   .sort((a,b)=>Number(b.status[0]==='waiting')-Number(a.status[0]==='waiting')||
     (a.call.record.status==='confirmed'?a.call.record.date:a.call.date).localeCompare(b.call.record.status==='confirmed'?b.call.record.date:b.call.date));
 const shown=rows.filter(row=>filter==='all'||row.status[0]===filter);
 return `<header>${intro('Mes <em>calls de cadrage.</em>','Répondez aux propositions et retrouvez vos rendez-vous confirmés.','ESPACE FORMATEUR')}</header>
   <nav class="scope-trainer-filters" aria-label="Filtrer mes calls">${[['all','Tous'],['waiting','À répondre'],['confirmed','Confirmés']].map(([key,label])=>
     `<button class="secondary" data-scope-filter="${key}" aria-pressed="${filter===key}" onclick="scopingTrainerFilter('${key}')">${label} <strong>${key==='all'?rows.length:rows.filter(row=>row.status[0]===key).length}</strong></button>`).join('')}</nav>
   <div class="scope-dossier-grid">${shown.map(({call:{f,client,record:r,date},status})=>
     `<button class="card scope-dossier-card" onclick="scopingTrainerSelect('${escapeText(f.id)}')">
       <span class="scope-itemtop"><strong>${escapeText(client.name)}</strong>${trainerPill(status)}</span>
       <span class="scope-dossier-title">${escapeText(f.title)}</span>
       <span class="scope-dossier-meta"><span>${scopeIcon('calendar',16)} ${r.status==='confirmed'?'Call · '+scopeTime(r):'Formation · '+fmt(date)}</span></span>
       <span class="scope-itemgo">${status[2]} ${scopeIcon('chevron',15)}</span>
     </button>`).join('')||`<p class="card scope-empty">${assigned.length?'Aucun call dans ce filtre.':'Aucun call de cadrage associé à vos missions.'}</p>`}</div>`;
}

function trainerSlotRow(r,slot,index,trainer){
 const answerable=r.status==='pending'&&!expired(slot), answered=hasReply(slot);
 const label=slotStatus(r,slot,index,trainer);
 return `<div class="scope-trainer-option ${slot.trainerAccepted?'is-accepted':''}"><div>
   <strong>${fmtDate(slot.date,{weekday:'long',day:'numeric',month:'long'})}</strong><small>${slot.start} – ${slot.end}</small>
   <span class="scope-pill ${slot.trainerAccepted?'scope-confirmed':''}">${label}</span></div>
   ${answerable?`<div class="scope-actionrow"><button class="${answered?'secondary':'primary'} tiny" ${slot.trainerAccepted?'disabled':''} onclick="scopingTrainerRespond(${index},true)">Accepter</button>
     <button class="secondary tiny" ${slot.trainerDeclined?'disabled':''} onclick="scopingTrainerRespond(${index},false)">Refuser</button></div>`:''}</div>`;
}

function trainerSlotPanel(call,trainer){
 const r=call.record, confirmed=['confirmed','done'].includes(r.status);
 const visible=r.proposals.map((slot,index)=>({slot,index})).filter(({slot,index})=>
   (!isDraft(slot)||r.confirmedProposalIndex===index)&&inScope(slot,trainer));
 const suggestions=(r.trainerSuggested||[]).filter(slot=>(slot.trainerId??trainer.id)===trainer.id);
 const canSuggest=['todo','pending'].includes(r.status);
 const options=`<div class="scope-trainer-options">${visible.map(({slot,index})=>trainerSlotRow(r,slot,index,trainer)).join('')||
   '<p class="scope-empty">Aucun créneau transmis pour le moment.</p>'}</div>`;
 return `<section class="scope-trainer-response">
   ${confirmed?`<div class="scope-success"><strong>${r.status==='confirmed'?'Call confirmé le '+fmt(r.date):'Call réalisé le '+fmt(r.date)}</strong>
     <p>${escapeText(r.start)}${r.end?' – '+escapeText(r.end):''}</p></div>
     <details class="scope-trainer-history"><summary>Historique des créneaux</summary>${options}</details>`:
     `<div class="scope-sectionhead"><h3>Créneaux proposés</h3><small>${visible.length} proposition(s)</small></div>
     ${visible.length?'<p class="scope-help">Acceptez les créneaux qui vous conviennent. L’AMO vous confirmera le créneau retenu.</p>':''}${options}`}
   ${canSuggest?`<details class="scope-trainer-history" ${state.scopingTrainerSuggestionOpen?'open':''} ontoggle="if(this.isConnected)rememberScopingTrainerSuggestion(this.open)">
     <summary>Proposer un autre créneau</summary>
     <form class="scope-trainer-alternative" onsubmit="event.preventDefault();scopingTrainerSuggest()">
       <label class="scope-field"><span>Date</span><input type="date" id="scope-alt-date" min="${localDate()}" required></label>
       <label class="scope-field"><span>Début</span><input type="time" id="scope-alt-start" value="10:00" required></label>
       <label class="scope-field"><span>Fin</span><input type="time" id="scope-alt-end" value="10:30" required></label>
       <button type="submit" class="primary">Soumettre à l’AMO</button>
     </form></details>`:''}
   ${suggestions.length?`<div class="scope-proposals"><strong>Mes créneaux proposés</strong>
     ${suggestions.map(slot=>`<div><span>${scopeTime(slot)}</span><small>${expired(slot)?'Expiré':'En attente de l’AMO'}</small></div>`).join('')}</div>`:''}
 </section>`;
}

function trainerDossier(call,trainer){
 const {client,f,date}=call, tab=state.scopingTrainerTabKey||'slots';
 return `<button class="secondary scope-back" onclick="scopingTrainerBack()">${mobileIcon('back',16)} Retour à mes calls</button>
   <article class="card scope-detail"><header class="scope-detailtitle scope-filehead"><div>
     <h1 tabindex="-1">${escapeText(client.name)}</h1><p>${escapeText(f.title)}</p>
     <div class="scope-dossier-meta"><span>${scopeIcon('calendar',15)} Formation · ${fmt(date)}</span></div></div>
     ${trainerPill(trainerStatus(call,trainer))}
   </header>
   <nav class="scope-tabs scope-trainer-tabs" aria-label="Sections du call">${[['slots','Créneaux'],['note','Note de cadrage']].map(([key,label])=>
     `<button class="secondary" ${key===tab?'aria-current="page"':''} onclick="scopingTrainerTab('${key}')">${label}</button>`).join('')}</nav>
   <div class="scope-content">${tab==='note'?scopingNotePanel(f.id,true):trainerSlotPanel(call,trainer)}</div>
   </article>`;
}

function trainerCallPage(){
 const trainer=trainerById(state.trainerId), assigned=trainerCalls(state.trainerId), selected=getTrainerCall();
 if(state.scopingTrainerSelected!==selected?.f.id){
   state.scopingTrainerSelected=selected?.f.id;
   state.scopingTrainerTabKey='slots';
   state.scopingTrainerSuggestionOpen=false;
 }
 return `<div class="scope-root scope-trainer-root scope-trainer-v3">${selected?trainerDossier(selected,trainer):
   `${trainerScopeId()?'<p class="scope-warning">Ce dossier n’est pas accessible pour ce profil.</p>':''}${trainerCockpit(assigned,trainer)}`}
   <p class="scope-footnote">Vos réponses et votre note sont enregistrées dans ce navigateur de démonstration.</p></div>`;
}

window.scopingTrainerSelect=id=>{
 if(state.role!=='formateur'||state.page!=='trainer-scoping'||!trainerCalls(state.trainerId).some(call=>call.f.id===id))return;
 const target=trainerScopeHash+'/'+encodeURIComponent(id);
 if(location.hash!==target)history.pushState(null,'',target);
 render();window.scrollTo(0,0);
 document.querySelector('.scope-filehead h1')?.focus({preventScroll:true});
};
window.scopingTrainerBack=()=>{
 if(state.role!=='formateur')return;
 go('trainer-scoping');
 document.querySelector('.scope-trainer-filters button[aria-pressed=true]')?.focus({preventScroll:true});
};
window.scopingTrainerFilter=key=>{
 if(!['all','waiting','confirmed'].includes(key))return;
 state.scopingTrainerFilter=key;render();
 document.querySelector(`.scope-trainer-filters [data-scope-filter="${key}"]`)?.focus({preventScroll:true});
};
window.scopingTrainerTab=key=>{
 if(!getTrainerCall()||!['slots','note'].includes(key))return;
 state.scopingTrainerTabKey=key;render();
 document.querySelector('.scope-trainer-tabs [aria-current]')?.focus({preventScroll:true});
};
window.rememberScopingTrainerSuggestion=open=>{state.scopingTrainerSuggestionOpen=open;};

window.scopingTrainerRespond=(index,yes)=>{const current=getTrainerCall();if(!current)return;const r=current.record,slot=r.proposals[index];if(!slot||r.status!=='pending'||isDraft(slot)||expired(slot)||!inScope(slot,current.trainer)||typeof yes!=='boolean')return;
 if(yes?slot.trainerAccepted:slot.trainerDeclined)return;
 if(yes&&trainerBusy(current.trainer,slot.date,slot.start,slot.end,current.f.id))return notify('Créneau désormais occupé.');
 slot.trainerAccepted=yes;slot.trainerDeclined=!yes;slot.respondedBy=state.trainerId;slot.responseAt=new Date().toISOString();
 r.trainerResponse=r.proposals.some(item=>item.trainerAccepted)?'accepted':r.proposals.every(item=>item.trainerDeclined)?'declined':'unknown';
 r.history.push({at:new Date().toISOString(),text:yes?'Formateur a accepté '+fmt(slot.date)+' '+slot.start:'Formateur a refusé '+fmt(slot.date)+' '+slot.start});if(!callStore.write(r))return;render();notify(yes?'Disponibilité acceptée · en attente de validation AMO':'Créneau refusé');
};
window.scopingTrainerSuggest=()=>{const current=getTrainerCall();if(!current||!['todo','pending'].includes(current.record.status))return;
 const date=document.getElementById('scope-alt-date')?.value,start=document.getElementById('scope-alt-start')?.value,end=document.getElementById('scope-alt-end')?.value;
 if(!date||!start||!end||expired({date,start})||start>=end)return notify('Choisissez un jour et des horaires valides.');
 if(trainerBusy(current.trainer,date,start,end,current.f.id))return notify('Conflit avec un événement connu.');
 current.record.trainerSuggested||=[];
 if(current.record.trainerSuggested.some(s=>s.date===date&&s.start===start))return notify('Déjà proposé.');
 current.record.trainerSuggested.push({date,start,end,trainerId:state.trainerId,suggestedAt:new Date().toISOString()});current.record.history.push({at:new Date().toISOString(),text:'Autre créneau suggéré par le formateur'});
 if(!callStore.write(current.record))return;state.scopingTrainerSuggestionOpen=false;render();notify('Créneau alternatif proposé à l’AMO dans la démonstration');
};

function sidebarLink(){
 const nav=document.querySelector('#sidebar .nav');if(nav&&!nav.querySelector('[data-scoping-nav]')){
  const button=document.createElement('button');button.setAttribute('data-scoping-nav','');
  const trainer=state.role==='formateur';const page=trainer?'trainer-scoping':PAGE;
  button.className=state.page===page?'active':'';
  button.setAttribute('onclick',"go('"+page+"')");button.innerHTML='<span class="ic" aria-hidden="true">'+scopeIcon('phone',18)+'</span>'+(trainer?'Call de cadrage':'Calls de cadrage');
  const after=trainer?nav.querySelector('button[onclick="go(\'trainer-calendar\')"]'):nav.querySelector('button[onclick="go(\'staffing\')"]');
  if(after)after.after(button);else nav.append(button);
 }

}


const normalValidPages=validPages;
validPages=function(role){const pages=normalValidPages(role);return role==='amo'?[...pages,PAGE]:[...pages,'trainer-scoping'];};
const previousRender=render;
render=function(){const amo=state.role==='amo'&&state.page===PAGE,trainer=state.role==='formateur'&&state.page==='trainer-scoping';
 if(amo||trainer){state.page=trainer?'trainer-home':'home';previousRender();state.page=trainer?'trainer-scoping':PAGE;
  const main=document.getElementById('main-content');if(main){main.innerHTML=trainer?trainerCallPage():scopingPage();loadScopingNotes();}
  // Le rendu de base utilise temporairement l'accueil : réactualiser l'onglet actif sur la route Cadrage.
  document.querySelector(`#sidebar .nav button[onclick="go('${trainer?'trainer-home':'home'}')"]`)?.classList.remove('active');
  const dock=document.querySelector('.mobile-dock');if(dock)dock.outerHTML=mobileDock(trainer);
  const mobileTitle=document.querySelector('.mobile-head-center strong');if(mobileTitle)mobileTitle.textContent=trainer?'Mes calls de cadrage':'Calls de cadrage';
  document.title='Certif-IA Hub — '+(trainer?'Call de cadrage':'Calls de cadrage');
  const breadcrumb=document.querySelector('.bread');if(breadcrumb)breadcrumb.textContent='Certif-IA / '+(trainer?'Formateur':'AMO')+' / '+(trainer?'Call de cadrage':'Calls de cadrage');
 }else previousRender();sidebarLink();};
if(typeof location!=='undefined'){
 if(location.hash===scopeHash||scopeFormationFromHash()){state.role='amo';state.page=PAGE;}
 if(location.hash===trainerScopeHash||trainerScopeId()){state.role='formateur';state.page='trainer-scoping';}
}
render();
})();