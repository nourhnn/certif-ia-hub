/* Certif-IA Hub — Calls de cadrage V1 (ajout local, aucune API réelle).
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

const LABELS={todo:'À planifier',pending:'Créneaux proposés',confirmed:'Confirmé',done:'Réalisé',cancelled:'Annulé'};
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
function dataset(){ db.scoping ||= {calls:{}};return db.scoping.calls; }
function sessionsOf(f){return (db.sessions||[]).filter(s=>s.formationId===f.id&&s.status!=='Annulée').sort((a,b)=>a.date.localeCompare(b.date));}
function formTrainer(f){ const ss=sessionsOf(f);const assigned=(db.assignments||[]).find(a=>ss.some(s=>s.id===a.sessionId)&&['Confirmée','Réalisée','À revalider'].includes(a.status));return assigned?trainerById(assigned.trainerId):null; }
function clientRecord(f){return clients.find(c=>c.id===f.clientId)||{name:'Client inconnu'};}
function callFor(f){const records=dataset();if(!records[key(f)]){
 const c=clientDetails?.[f.clientId]||{};
 records[key(f)]={id:key(f),formationId:f.id,status:'todo',duration:30,proposals:[],date:'',start:'',end:'',meet:'',notes:'',actions:[],history:[],checklist:{},contact:{name:c.contact&&!/non renseigné/i.test(c.contact)?c.contact:'',role:'',phone:c.phone||c.telephone||'',email:c.email||'',hubspot:c.contactUrl||''},trainerResponse:'unknown',clientResponse:'unknown'};
 }return records[key(f)];}
function callSessionDate(f){return sessionsOf(f).find(s=>s.date>=localDate())?.date||sessionsOf(f)[0]?.date||'';}
function daysBefore(date){return date?Math.round((Date.parse(date+'T12:00:00')-Date.parse(localDate()+'T12:00:00'))/86400000):null;}
function statusOf(f,r){const days=daysBefore(callSessionDate(f));return ['todo','pending'].includes(r.status)&&days!==null&&days<=14?'due':r.status;}
function allCalls(){return formations.map(f=>({f,record:callFor(f),client:clientRecord(f),trainer:formTrainer(f),date:callSessionDate(f)}));}
function safeNumber(value){return typeof value==='string'&&/^\+?[0-9][0-9 .()\-]{5,24}$/.test(value.trim())?value.replace(/[^+\d]/g,''):'';}
function telLink(v){const n=safeNumber(v);return n?'tel:'+n:null;}
function overlaps(a,b){return a.date===b.date&&((a.start||'00:00')<(b.end||'24:00'))&&((b.start||'00:00')<(a.end||'24:00'));}
function trainerBusy(trainer,date,start,end,ignoreCall){
 if(!trainer)return true;
 const target={date,start,end};
 if((db.calendarEvents||[]).some(e=>e.trainerId===trainer.id&&overlaps(target,e)))return true;
 if((db.availability||[]).some(e=>e.trainerId===trainer.id&&e.status==='Occupé'&&overlaps(target,e)))return true;
 if((db.assignments||[]).some(a=>a.trainerId===trainer.id&&['Confirmée','À revalider','Réalisée'].includes(a.status)&&(()=>{const s=sessionById(a.sessionId);return s&&overlaps(target,s)})()))return true;
 if(allCalls().some(c=>c.f.id!==ignoreCall&&c.record.status==='confirmed'&&c.trainer?.id===trainer.id&&overlaps(target,{date:c.record.date,start:c.record.start,end:c.record.end})))return true;
 return false;
}
function calendarMode(trainer){if(!trainer)return {kind:'none',label:'Formateur à affecter'};const demo=!!db.agendaV2?.[trainer.id]?.demoCalendar;return demo?{kind:'simulation',label:'Calendrier libre (simulation)'}:{kind:'unknown',label:'Agenda formateur non vérifié'};}
function slotsFor(f,record,days=10){
 const trainer=formTrainer(f),today=localDate(),startDate=state.scopingStartDate&&state.scopingStartDate>today?state.scopingStartDate:today,out=[];
 const duration=Number(record.duration||30);
 for(let d=0;d<days&&out.length<12;d++){
  const date=addDays(startDate,d),weekday=new Date(date+'T12:00:00').getDay();if(weekday===0||weekday===6)continue;
  for(const hour of ['09:00','10:00','11:00','14:00','15:00','16:00']){
   const end=timeFromMinutes(durationToMinutes(hour)+duration);if(durationToMinutes(end)>1080||trainerBusy(trainer,date,hour,end,f.id))continue;
   const mode=calendarMode(trainer);out.push({date,start:hour,end,mode:mode.kind,label:mode.label,amo:'À vérifier',client:'À confirmer'});
   if(out.length>=12)break;
  }
 }
 return out;
}

function markupPill(status){let text=LABELS[status]||status;return `<span class="scope-pill scope-${escapeText(status)}">${escapeText(text)}</span>`;}
function progress(record){const checks=PREP.filter(([k])=>record.checklist[k]).length;return {checks,total:PREP.length};}
function input(label,id,value,type='text',placeholder=''){return `<label class="scope-field"><span>${escapeText(label)}</span><input id="${id}" type="${type}" value="${escapeText(value||'')}" placeholder="${escapeText(placeholder)}"></label>`;}
function statsMarkup(rows){const counts={todo:0,pending:0,confirmed:0,done:0,due:0};rows.forEach(({record,f})=>{counts[record.status]??=0;counts[record.status]++;if(statusOf(f,record)==='due')counts.due++});return `<div class="scope-statgrid">${[['À planifier',counts.todo,'calendar-clock'],['Propositions',counts.pending,'send'],['Confirmés',counts.confirmed,'check-circle'],['À traiter · J-14',counts.due,'alert-circle']].map(([label,num,ico])=>`<div class="scope-stat"><span>${escapeText(label)}</span><strong>${num}</strong><small>Calls de cadrage</small></div>`).join('')}</div>`;}
function listMarkup(rows){const search=(state.scopingSearch||'').trim().toLowerCase(),filter=state.scopingFilter||'all';
 const all=rows.filter(({client,f,trainer})=>`${client.name} ${f.title} ${trainer?.name||''}`.toLowerCase().includes(search));
 const filtered=all.filter(({record,f})=>filter==='all'||(filter==='due'?statusOf(f,record)==='due':record.status===filter));
 filtered.sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 return `<section class="scope-list card"><div class="scope-listhead"><h2>Dossiers de cadrage</h2><span>${filtered.length} dossier(s)</span></div><div class="scope-controls"><label class="scope-search"><span class="sr-only">Rechercher</span><input type="search" placeholder="Client, formation ou formateur…" value="${escapeText(state.scopingSearch||'')}" oninput="scopingSearch(this.value)"></label><select aria-label="Filtrer les calls" onchange="scopingFilter(this.value)">${[['all','Tous les statuts'],['todo','À planifier'],['pending','Propositions préparées'],['confirmed','Confirmés'],['done','Réalisés'],['due','Urgents · J-14']].map(([v,label])=>`<option value="${v}" ${filter===v?'selected':''}>${label}</option>`).join('')}</select></div><div class="scope-items">${filtered.map(({f,record,client,trainer,date})=>{
 const days=daysBefore(date),isUrgent=statusOf(f,record)==='due';const active=state.scopingSelected===f.id;
 return `<button class="scope-item ${active?'active':''}" onclick="scopingSelect('${escapeText(f.id)}')"><div class="scope-itemtop"><strong>${escapeText(client.name)}</strong>${markupPill(record.status)}</div><div class="scope-itemtitle">${escapeText(f.title)}</div><div class="scope-itemmeta"><span>${scopeIcon("calendar",14)} ${fmt(date)}${days!==null&&days>=0?` · J-${days}`:''}</span><span>${scopeIcon("profile",14)} ${escapeText(trainer?.name||'Formateur à staffer')}</span></div>${isUrgent?`<span class="scope-urgent">${scopeIcon("alert",14)} Cadrage à prioriser</span>`:''}<span class="scope-itemgo">Voir le cadrage ${scopeIcon("chevron",14)}</span></button>`}).join('')||'<p class="scope-empty">Aucun dossier pour ce filtre.</p>'}</div></section>`;
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

function scopingMessageText(f,r){
 const c=clientRecord(f),contact=clientContact(f),hello=contact.name?' '+contact.name.split(/\s+/)[0]:'';
 return `Bonjour${hello}\n\nPour préparer au mieux votre formation « ${f.title} », nous vous proposons un petit call de cadrage de ${r.duration} min avec votre formateur.\n\nVoici quelques créneaux possibles :\n${r.proposals.map(s=>`• ${fmt(s.date)} · ${s.start}–${s.end}`).join('\n')}\n\nQuel créneau vous conviendrait le mieux ?\n\nMerci et belle journée !\nL’équipe Certif-IA`;
}
function availabilityMarkup(f,r){
 const trainer=formTrainer(f),mode=calendarMode(trainer),list=slotsFor(f,r,14),from=state.scopingStartDate||localDate();
 return `<div class="scope-sectionhead"><h3>Trouver un créneau</h3><small>Choisissez une date de départ</small></div>
 <div class="scope-availabilitytop"><span class="scope-availability ${mode.kind}">${escapeText(mode.label)}</span>
 <label class="scope-inline">À partir du <input class="scope-date-picker" type="date" value="${escapeText(from)}" min="${localDate()}" onchange="scopingSetStartDate(this.value)"></label>
 <label class="scope-inline">Durée <select id="scope-duration" onchange="scopingDuration(this.value)">${[15,30,45,60].map(n=>`<option ${r.duration===n?'selected':''} value="${n}">${n} min</option>`).join('')}</select></label></div>
 ${!trainer?'<p class="scope-warning">Aucun formateur confirmé. Affectez d’abord le formateur depuis Staffing assisté.</p><button class="secondary tiny" onclick="go(\'staffing\')">Ouvrir Staffing</button>':`<p class="scope-help">Les horaires déclarés sont indicatifs. Seuls les conflits connus sont bloquants, les calendriers non connectés restent non vérifiés.</p>
 <div class="scope-slotlist">${(state.scopingSlotsExpanded?list:list.slice(0,6)).map(slot=>`<button class="scope-slot" onclick="scopingChooseSlot('${slot.date}','${slot.start}','${slot.end}')"><span class="scope-slotdate"><strong>${fmt(slot.date)}</strong><small>${slot.start} – ${slot.end}</small></span><span class="scope-slotstatus ${slot.mode}">${slot.mode==='simulation'?'Libre · simulation':'Non vérifié'}</span><span class="scope-slotarrow">${scopeIcon("plus",16)}</span></button>`).join('')||'<p class="scope-empty">Aucun créneau sans conflit sur la période choisie.</p>'}</div>${list.length>6?`<button type="button" class="secondary tiny scope-see-more" aria-expanded="${Boolean(state.scopingSlotsExpanded)}" onclick="scopingToggleMoreSlots()">${state.scopingSlotsExpanded?"Voir moins":"Voir plus"} ${scopeIcon("chevron",15)} ${state.scopingSlotsExpanded?"":`(${list.length-6} autres)`}</button>`:""}`}
 ${r.proposals.length?`<div class="scope-proposals"><strong>Créneaux proposés (${r.proposals.length})</strong>
 ${r.proposals.map((slot,i)=>`<div><span>${fmt(slot.date)} · ${slot.start}–${slot.end}${slot.trainerAccepted?' · ✓ Accepté par le formateur':slot.trainerDeclined?' · Refusé par le formateur':''}</span><button class="scope-icon-button" onclick="scopingRemoveSlot(${i})" aria-label="Retirer ce créneau">×</button></div>`).join('')}</div>
 <div class="scope-smart-message"><div><strong>${scopeIcon("message",17)} Message prêt à envoyer</strong><p>Une proposition sympa, prête à copier comme pour le staffing WhatsApp.</p></div><div class="scope-message-preview">${escapeText(scopingMessageText(f,r))}</div><button class="primary tiny" onclick="scopingCopyMessage()">${scopeIcon("copy",15)} Copier le message</button></div>`:''}
 ${r.trainerSuggested?.length?`<div class="scope-proposals"><strong>Autres propositions du formateur</strong>${r.trainerSuggested.map((slot,i)=>`<div><span>${fmt(slot.date)} · ${slot.start}–${slot.end}</span><button class="secondary tiny" onclick="scopingAddTrainerSuggestion(${i})">Ajouter aux propositions</button></div>`).join('')}</div>`:''}`;
}

function scopeDocumentUrl(url){
 const value=String(url||'').trim();if(!value)return '';
 try{const u=new URL(value);return u.protocol==='https:'&&(/(^|\.)drive\.google\.com$/.test(u.hostname)||/(^|\.)docs\.google\.com$/.test(u.hostname))?u.href:''}catch(e){return ''}
}
function scopeDocInfo(r,key){
 const docs=r.documents||{};return docs[key]||{};
}
function scopeDocCard(r,key,title,description,icon){
 const data=scopeDocInfo(r,key),url=scopeDocumentUrl(data.url),has=!!url;
 return `<article class="scope-doc-card ${has?'ready':'missing'}"><div class="scope-doc-top"><span class="scope-doc-icon" aria-hidden="true">${icon}</span><div class="scope-doc-name"><strong>${title}</strong><small>${description}</small></div><span class="scope-doc-state ${has?'ready':''}">${has?'Lien ajouté':'À renseigner'}</span></div>
 <label class="scope-field"><span>Lien Google Drive / Docs / Slides</span><input type="url" id="scope-doc-${key}" value="${escapeText(data.url||'')}" placeholder="https://drive.google.com/…" autocomplete="url"></label>
 <div class="scope-doc-actions"><button class="secondary tiny" onclick="scopingSaveDocument('${key}')">Enregistrer le lien</button>${has?`<a class="secondary tiny scope-doc-open" href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">${scopeIcon("external",15)} Voir le document</a>`:`<button class="secondary tiny" disabled title="Ajoutez un lien Drive valide">${scopeIcon("external",15)} Voir le document</button>`}</div></article>`;
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

function historyMarkup(r){return r.history.length?`<details class="scope-history"><summary>Historique des modifications (${r.history.length})</summary>${r.history.slice(-7).reverse().map(e=>`<div>${escapeText(e.at.slice(0,16).replace('T',' '))} · ${escapeText(e.text)}</div>`).join('')}</details>`:'';}
function summaryMarkup(f,r){const trainer=formTrainer(f),client=clientRecord(f),dates=sessionsOf(f),date=callSessionDate(f),days=daysBefore(date);
 return `<div class="scope-detailtitle"><div><span class="scope-eyebrow">FICHE DE CADRAGE</span><h2>${escapeText(client.name)}</h2><p>${escapeText(f.title)}</p></div>${markupPill(r.status)}</div><div class="scope-facts"><div><span>Formation</span><strong>${fmt(date)}</strong></div><div><span>Formateur</span><strong>${escapeText(trainer?.name||'À staffer')}</strong></div><div><span>Participants</span><strong>${dates[0]?.people||'—'}</strong></div><div><span>Jalon J-14</span><strong>${days===null?'À préciser':days<=14&&r.status==='todo'?'À traiter':'Suivi actif'}</strong></div></div><div class="scope-actionrow"><button class="secondary tiny" onclick="openFormation('${escapeText(f.id)}')">Voir la formation</button><button class="secondary tiny" onclick="openClient('${escapeText(f.clientId)}')">Voir le client</button>${trainer?`<button class="secondary tiny" onclick="openTrainer(${trainer.id})">Fiche formateur</button>`:''}</div>`;
}
function scheduleMarkup(r){
 return `<div class="scope-sectionhead"><h3>Confirmation du créneau</h3><small>Choisissez parmi les créneaux proposés</small></div>
 ${r.proposals.length?`<div class="scope-confirm-options">${r.proposals.map((slot,i)=>`<label class="scope-confirm-option"><input type="radio" name="scope-confirm-choice" value="${i}" ${r.confirmedProposalIndex===i||r.confirmedProposalIndex==null&&i===0?'checked':''}><span><strong>${fmt(slot.date)}</strong><small>${slot.start} – ${slot.end}${slot.trainerAccepted?' · ✓ Accepté par le formateur':slot.trainerDeclined?' · Refusé par le formateur':' · Réponse formateur à vérifier'}</small></span></label>`).join('')}</div><div class="scope-actionrow"><button class="primary" onclick="scopingConfirm()">✓ Valider ce créneau</button></div>`:'<p class="scope-empty">Ajoutez des créneaux proposés pour pouvoir en confirmer un.</p>'}
 ${r.status==='confirmed'?`<p class="scope-success">✓ Confirmé le ${fmt(r.date)} de ${r.start} à ${r.end} · confirmation locale</p>`:''}
 <p class="scope-help">Aucune invitation n'est envoyée automatiquement. Vérifiez l'accord du client et du formateur avant validation.</p>`;
}

function notesMarkup(f,r){
 return `<div class="scope-sectionhead"><h3>Compte rendu</h3><small>À associer aux notes HubSpot du client</small></div><label class="scope-field"><span>Compte rendu du cadrage</span><textarea id="scope-notes" rows="8" placeholder="Attentes client, besoins IA, décisions, adaptations pédagogiques…">${escapeText(r.notes)}</textarea></label>
 <div class="scope-actionrow"><button class="primary" onclick="scopingSaveNotes()">Enregistrer le brouillon</button><button class="secondary" onclick="scopingCopyHubspotNote()">Copier pour HubSpot</button><button class="secondary" disabled title="Connexion HubSpot sécurisée nécessaire">${scopeIcon("external",15)} Synchronisation HubSpot à connecter</button></div>
 <p class="scope-help">Le brouillon reste dans le Hub de démonstration. L'enregistrement automatique dans la fiche HubSpot nécessitera l'intégration serveur et les identifiants du client ; aucun envoi n'est simulé.</p>`;
}

function detailMarkup(f,r){return `<section class="scope-detail card">${summaryMarkup(f,r)}<div class="scope-content"><section>${contactMarkup(f)}</section><section>${availabilityMarkup(f,r)}</section><section>${scheduleMarkup(r)}</section><section>${documentsMarkup(f)}</section><section>${notesMarkup(f,r)}</section>${historyMarkup(r)}</div></section>`;}
function scopeFocusDetailOnMobile(){
 if(typeof window==='undefined'||!window.matchMedia?.('(max-width:740px)').matches)return;
 const panel=document.querySelector('.scope-detail');
 if(panel)panel.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
function scopingPage(){const rows=allCalls();if(!state.scopingSelected||!formations.some(f=>f.id===state.scopingSelected))state.scopingSelected=rows[0]?.f.id;const f=formations.find(x=>x.id===state.scopingSelected);const r=f&&callFor(f);
 return `<div class="scope-root"><header class="scope-hero"><div><span class="scope-eyebrow">PILOTAGE AMO · J-14</span><h1>Calls de cadrage<span>.</span></h1><p>Planifiez, contactez, préparez et suivez vos échanges clients avant les formations.</p></div><span class="scope-demo-chip">Démonstration locale</span></header>${statsMarkup(rows)}<div class="scope-layout">${listMarkup(rows)}${f?detailMarkup(f,r):'<p class="scope-empty">Aucune formation disponible.</p>'}</div><p class="scope-footnote">Toutes les modifications et propositions sont enregistrées uniquement dans cette démo. Google Agenda, HubSpot, Google Meet et les envois de messages ne sont pas connectés.</p></div>`;
}
function getSelected(){if(state.role!=='amo')return null;const f=formations.find(x=>x.id===state.scopingSelected);return f?{f,r:callFor(f)}:null;}
function persist(text){const d=getSelected();if(!d)return;d.r.history.push({at:new Date().toISOString(),text});save();render();}
function notify(text){if(typeof flash==='function')flash(text);}
window.scopingSelect=id=>{if(!formations.some(f=>f.id===id))return;state.scopingSelected=id;state.scopingSlotsExpanded=false;render();scopeFocusDetailOnMobile();};
window.scopingSearch=v=>{state.scopingSearch=v;const el=document.activeElement;const pos=el?.selectionStart;render();const input=document.querySelector('.scope-search input');if(input){input.focus();try{input.setSelectionRange(pos,pos)}catch(e){}}};
window.scopingFilter=v=>{state.scopingFilter=v;render()};
window.scopingToggleMoreSlots=()=>{state.scopingSlotsExpanded=!state.scopingSlotsExpanded;render()};
window.scopingDuration=n=>{const d=getSelected();if(!d||![15,30,45,60].includes(Number(n)))return;d.r.duration=Number(n);state.scopingSlotsExpanded=false;save();render()};
window.scopingSaveContact=()=>notify('Modifiez les coordonnées depuis la fiche Client : elles apparaîtront ici automatiquement.');

window.scopingChooseSlot=(date,start,end)=>{const d=getSelected();if(!d)return;const slot=slotsFor(d.f,d.r,14).find(x=>x.date===date&&x.start===start&&x.end===end);if(!slot)return notify('Créneau occupé ou devenu indisponible.');if(d.r.proposals.some(x=>x.date===date&&x.start===start))return notify('Créneau déjà sélectionné.');d.r.proposals.push(slot);if(!d.r.date){d.r.date=date;d.r.start=start;d.r.end=end;}d.r.status='pending';persist('Proposition de créneau préparée : '+fmt(date)+' '+start+'–'+end)};
window.scopingRemoveSlot=i=>{const d=getSelected();if(!d||!d.r.proposals[i])return;d.r.proposals.splice(i,1);if(!d.r.proposals.length&&d.r.status==='pending')d.r.status='todo';persist('Créneau proposé retiré')};
window.scopingCopyMessage=()=>{const d=getSelected();if(!d||!d.r.proposals.length)return;
 const msg=scopingMessageText(d.f,d.r);
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(msg).then(()=>notify('Message prêt à coller · aucun envoi effectué')).catch(()=>notify('Copie indisponible'));
 else{const box=document.createElement('textarea');box.value=msg;document.body.append(box);box.select();try{document.execCommand('copy');notify('Message copié')}catch(e){notify('Copie indisponible')}box.remove()}
};

window.scopingConfirm=()=>{const d=getSelected();if(!d)return;
 const selected=document.querySelector('input[name="scope-confirm-choice"]:checked');
 const index=Number(selected?.value);const slot=selected&&d.r.proposals[index];
 if(!slot)return notify('Sélectionnez un créneau parmi les propositions.');
 if(slot.trainerDeclined)return notify('Ce créneau a été refusé par le formateur.');
 if(!slot.trainerAccepted)return notify('Le formateur doit d’abord accepter ce créneau dans son espace.');
 if(slot.date<localDate())return notify('Le créneau choisi est passé.');
 const trainer=formTrainer(d.f);if(!trainer||trainerBusy(trainer,slot.date,slot.start,slot.end,d.f.id))return notify('Le créneau est désormais occupé.');
 d.r.date=slot.date;d.r.start=slot.start;d.r.end=slot.end;d.r.confirmedProposalIndex=index;d.r.status='confirmed';
 persist('Créneau validé : '+fmt(slot.date)+' · '+slot.start+'–'+slot.end+' (aucune invitation envoyée)');
};

window.scopingMarkDone=()=>{const d=getSelected();if(!d)return;if(d.r.status!=='confirmed')return notify('Confirmez d’abord la date du call.');d.r.status='done';persist('Call marqué comme réalisé')};
window.scopingCancel=()=>{const d=getSelected();if(!d)return;if(!window.confirm('Annuler ce call dans la démo ?'))return;d.r.status='cancelled';persist('Call annulé')};
window.scopingSaveDocument=key=>{
 if(!['audit','cadrage'].includes(key))return;
 const d=getSelected();if(!d)return;
 const value=document.getElementById('scope-doc-'+key)?.value.trim()||'';
 if(value&&!scopeDocumentUrl(value))return notify('Lien invalide : utilisez une URL HTTPS Google Drive, Docs ou Slides.');
 d.r.documents ||= {};
 d.r.documents[key]={url:value};
 persist((key==='audit'?'Audit':'Support de cadrage')+(value?' : lien enregistré':' : lien retiré'));
};
window.scopingCheck=(id,checked)=>{const d=getSelected();if(!d||!PREP.some(([k])=>k===id))return;d.r.checklist[id]=checked;save();render()};
window.scopingSaveNotes=()=>{const d=getSelected();if(!d)return;
 d.r.notes=document.getElementById('scope-notes')?.value||'';
 d.r.hubspotSync='not-configured';persist('Brouillon du compte rendu enregistré · synchronisation HubSpot non configurée');
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
window.scopingAddTrainerSuggestion=i=>{const d=getSelected();if(!d)return;const slot=d.r.trainerSuggested?.[i];if(!slot)return;
 if(!d.r.proposals.some(s=>s.date===slot.date&&s.start===slot.start))d.r.proposals.push({...slot,trainerAccepted:true,mode:'unknown',label:'Proposé par le formateur'});
 d.r.trainerSuggested.splice(i,1);d.r.status='pending';persist('Créneau alternatif du formateur ajouté');
};

window.scopingAddAction=()=>{const d=getSelected();if(!d)return;const v=document.getElementById('scope-action-text')?.value.trim()||'',due=document.getElementById('scope-action-date')?.value||'';if(!v)return notify('Renseignez une action.');d.r.actions.push({id:Date.now(),text:v,date:due,done:false});persist('Nouvelle action : '+v)};
window.scopingToggleAction=(i,checked)=>{const d=getSelected();if(!d||!d.r.actions[i])return;d.r.actions[i].done=checked;save();render()};

function getTrainerCall(){
 if(state.role!=='formateur')return null;
 const all=allCalls().filter(x=>x.trainer?.id===state.trainerId);
 const chosen=all.find(x=>x.f.id===state.scopingTrainerSelected)||all[0];
 return chosen||null;
}
function trainerCallPage(){
 const assigned=allCalls().filter(x=>x.trainer?.id===state.trainerId);
 const pending=assigned.filter(x=>x.record.status==='pending').length;
 const confirmed=assigned.filter(x=>x.record.status==='confirmed').length;
 const selected=getTrainerCall();
 return `<div class="scope-root scope-trainer-root"><header class="scope-hero"><div><span class="scope-eyebrow">ESPACE FORMATEUR</span><h1>Call de cadrage<span>.</span></h1><p>Consultez les propositions de créneaux, acceptez une disponibilité ou suggérez une autre date.</p></div><span class="scope-demo-chip">Démonstration locale</span></header>
 <div class="scope-statgrid"><div class="scope-stat"><span>À répondre</span><strong>${pending}</strong><small>Propositions de call</small></div><div class="scope-stat"><span>Confirmés</span><strong>${confirmed}</strong><small>Calls planifiés</small></div></div>
 <div class="scope-layout"><section class="scope-list card"><div class="scope-listhead"><h2>Mes formations</h2><span>${assigned.length} dossier(s)</span></div><div class="scope-items">${assigned.map(({f,record,client,date})=>`<button class="scope-item ${f.id===selected?.f.id?'active':''}" onclick="scopingTrainerSelect('${escapeText(f.id)}')"><div class="scope-itemtop"><strong>${escapeText(client.name)}</strong>${markupPill(record.status)}</div><div class="scope-itemtitle">${escapeText(f.title)}</div><div class="scope-itemmeta">${scopeIcon("calendar",15)} Formation : ${fmt(date)}</div><span class="scope-itemgo">Voir les créneaux ${scopeIcon("chevron",14)}</span></button>`).join('')||'<p class="scope-empty">Aucun call de cadrage associé à vos missions.</p>'}</div></section>
 ${selected?`<section class="scope-detail card"><div class="scope-detailtitle"><div><span class="scope-eyebrow">PROPOSITIONS DE CALL</span><h2>${escapeText(selected.client.name)}</h2><p>${escapeText(selected.f.title)}</p></div>${markupPill(selected.record.status)}</div><div class="scope-content"><section><div class="scope-sectionhead"><h3>Créneaux proposés par l'AMO</h3><small>${selected.record.proposals.length} proposition(s)</small></div>
 <p class="scope-help">Indiquez le créneau qui vous convient. L'AMO devra ensuite confirmer avec le client.</p>
 <div class="scope-trainer-options">${selected.record.proposals.map((slot,i)=>`<div class="scope-trainer-option"><div><strong>${fmt(slot.date)}</strong><small>${slot.start} – ${slot.end}</small><span>${slot.trainerAccepted?'✓ Accepté':slot.trainerDeclined?'Refusé':'En attente de réponse'}</span></div><div class="scope-actionrow"><button class="primary tiny" ${selected.record.status==='confirmed'?'disabled':''} onclick="scopingTrainerRespond(${i},true)">✓ Accepter</button><button class="secondary tiny" ${selected.record.status==='confirmed'?'disabled':''} onclick="scopingTrainerRespond(${i},false)">Refuser</button></div></div>`).join('')||'<p class="scope-empty">Aucun créneau proposé pour le moment.</p>'}</div></section>
 <section><div class="scope-sectionhead"><h3>Proposer une autre disponibilité</h3><small>Si aucune proposition ne convient</small></div><div class="scope-trainer-alternative"><label class="scope-field"><span>Date</span><input type="date" id="scope-alt-date" min="${localDate()}"></label><label class="scope-field"><span>Début</span><input type="time" id="scope-alt-start" value="10:00"></label><label class="scope-field"><span>Fin</span><input type="time" id="scope-alt-end" value="10:30"></label><button class="secondary" onclick="scopingTrainerSuggest()">+ Soumettre à l'AMO</button></div></section>
 ${selected.record.status==='confirmed'?`<section class="scope-success">✓ Call confirmé le ${fmt(selected.record.date)} à ${selected.record.start}</section>`:''}
 </div></section>`:'<section class="scope-detail card"><p class="scope-empty">Vos prochaines propositions de calls apparaîtront ici.</p></section>'}</div>
 <p class="scope-footnote">Réponses enregistrées dans cette démonstration locale. Une synchronisation backend sera nécessaire pour partager les réponses entre plusieurs comptes et appareils.</p></div>`;
}
window.scopingTrainerSelect=id=>{if(state.role!=='formateur')return;state.scopingTrainerSelected=id;render();scopeFocusDetailOnMobile()};
window.scopingTrainerRespond=(index,yes)=>{const current=getTrainerCall();if(!current)return;const r=current.record,slot=r.proposals[index];if(!slot||r.status==='confirmed'||r.status==='done')return;
 if(yes&&trainerBusy(current.trainer,slot.date,slot.start,slot.end,current.f.id))return notify('Créneau désormais occupé.');
 slot.trainerAccepted=!!yes;slot.trainerDeclined=!yes;r.trainerResponse=yes?'accepted':'declined';
 r.history.push({at:new Date().toISOString(),text:yes?'Formateur a accepté '+fmt(slot.date)+' '+slot.start:'Formateur a refusé '+fmt(slot.date)+' '+slot.start});save();render();notify(yes?'Disponibilité acceptée · en attente de validation AMO':'Créneau refusé');
};
window.scopingTrainerSuggest=()=>{const current=getTrainerCall();if(!current)return;
 const date=document.getElementById('scope-alt-date')?.value,start=document.getElementById('scope-alt-start')?.value,end=document.getElementById('scope-alt-end')?.value;
 if(!date||date<localDate()||!start||!end||start>=end)return notify('Choisissez un jour et des horaires valides.');
 if(trainerBusy(current.trainer,date,start,end,current.f.id))return notify('Conflit avec un événement connu.');
 current.record.trainerSuggested||=[];
 if(current.record.trainerSuggested.some(s=>s.date===date&&s.start===start))return notify('Déjà proposé.');
 current.record.trainerSuggested.push({date,start,end});current.record.history.push({at:new Date().toISOString(),text:'Autre créneau suggéré par le formateur'});
 save();render();notify('Créneau alternatif proposé à l’AMO dans la démonstration');
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
  const main=document.getElementById('main-content');if(main)main.innerHTML=trainer?trainerCallPage():scopingPage();
  // Le rendu de base utilise temporairement l'accueil : réactualiser l'onglet actif sur la route Cadrage.
  const dock=document.querySelector('.mobile-dock');if(dock)dock.outerHTML=mobileDock(trainer);
  document.title='Certif-IA Hub — '+(trainer?'Call de cadrage':'Calls de cadrage');
  const breadcrumb=document.querySelector('.bread');if(breadcrumb)breadcrumb.textContent='Certif-IA / '+(trainer?'Formateur':'AMO')+' / '+(trainer?'Call de cadrage':'Calls de cadrage');
 }else previousRender();sidebarLink();};
if(typeof location!=='undefined'){
 if(location.hash==='#/interne/scoping-calls'){state.role='amo';state.page=PAGE;}
 if(location.hash==='#/formateur/trainer-scoping'){state.role='formateur';state.page='trainer-scoping';}
}
render();
})();