/* Certif-IA Hub — Calls de cadrage V1 (ajout local, aucune API réelle).
 * Chargé après hub.js, operations.js, proposition.js et agenda-v2.js.
 * N'altère pas les objets métier existants ; les informations restent en localStorage.
 */
(function () {
'use strict';
const PAGE='scoping-calls';
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
function slotsFor(f,record,days=10){const trainer=formTrainer(f),startDate=localDate(),out=[];const duration=Number(record.duration||30);
 for(let d=0;d<days&&out.length<9;d++){
  const date=addDays(startDate,d);const weekday=new Date(date+'T12:00:00').getDay();if(weekday===0||weekday===6)continue;
  for(const hour of ['09:00','10:00','11:00','14:00','15:00','16:00']){
   const end=timeFromMinutes(durationToMinutes(hour)+duration);if(durationToMinutes(end)>1080)continue;
   if(trainerBusy(trainer,date,hour,end,f.id))continue;
   const mode=calendarMode(trainer);out.push({date,start:hour,end,mode:mode.kind,label:mode.label,amo:'À vérifier',client:'À confirmer'});
   if(out.length>=9)break;
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
 return `<button class="scope-item ${active?'active':''}" onclick="scopingSelect('${escapeText(f.id)}')"><div class="scope-itemtop"><strong>${escapeText(client.name)}</strong>${markupPill(record.status)}</div><div class="scope-itemtitle">${escapeText(f.title)}</div><div class="scope-itemmeta"><span>📅 ${fmt(date)}${days!==null&&days>=0?` · J-${days}`:''}</span><span>👤 ${escapeText(trainer?.name||'Formateur à staffer')}</span></div>${isUrgent?'<span class="scope-urgent">⚠ Cadrage à prioriser</span>':''}<span class="scope-itemgo">Voir le cadrage ›</span></button>`}).join('')||'<p class="scope-empty">Aucun dossier pour ce filtre.</p>'}</div></section>`;
}
function contactMarkup(r){const p=r.contact||{},number=telLink(p.phone),email=p.email?.trim(),emailValid=email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 return `<div class="scope-sectionhead"><h3>Contact client</h3><small>Informations du dossier · modifiables en local</small></div><div class="scope-grid">${input('Nom du contact','scope-contact-name',p.name,'text','À renseigner')}${input('Fonction','scope-contact-role',p.role,'text','Responsable formation')}${input('Téléphone','scope-contact-phone',p.phone,'tel','+33…')}${input('E-mail','scope-contact-email',p.email,'email','contact@entreprise.fr')}</div><div class="scope-actionrow">${number?`<a class="primary scope-main-action" href="${escapeText(number)}">☎ Appeler</a>`:'<button class="secondary" disabled title="Numéro de téléphone absent ou invalide">☎ Appeler · n° manquant</button>'}${emailValid?`<a class="secondary scope-main-action" href="mailto:${escapeText(email)}">✉ E-mail</a>`:'<button class="secondary" disabled>✉ E-mail indisponible</button>'}<button class="secondary" onclick="scopingSaveContact()">Enregistrer le contact</button></div>`;
}
function availabilityMarkup(f,r){const trainer=formTrainer(f);const mode=calendarMode(trainer),list=slotsFor(f,r);
 return `<div class="scope-sectionhead"><h3>Trouver un créneau</h3><small>Suggestions calculées · aucun envoi automatique</small></div><div class="scope-availabilitytop"><span class="scope-availability ${mode.kind}">${escapeText(mode.label)}</span><label class="scope-inline">Durée <select id="scope-duration" onchange="scopingDuration(this.value)">${[15,30,45,60].map(n=>`<option ${r.duration===n?'selected':''} value="${n}">${n} min</option>`).join('')}</select></label></div>${!trainer?'<p class="scope-warning">Aucun formateur confirmé. Affecte d’abord un formateur dans Staffing assisté.</p><button class="secondary tiny" onclick="go(\'staffing\')">Ouvrir Staffing assisté</button>':`<p class="scope-help">Les plages habituelles ne bloquent pas les propositions. Les événements occupés connus sont exclus ; les calendriers non connectés restent <strong>non vérifiés</strong>. AMO et client : disponibilités à confirmer.</p><div class="scope-slotlist">${list.slice(0,6).map(s=>`<button class="scope-slot" onclick="scopingChooseSlot('${s.date}','${s.start}','${s.end}')"><span class="scope-slotdate"><strong>${fmt(s.date)}</strong><small>${s.start} – ${s.end}</small></span><span class="scope-slotstatus ${s.mode}">${s.mode==='simulation'?'Libre · simulation':'Non vérifié'}</span><span class="scope-slotarrow">+</span></button>`).join('')||'<p class="scope-empty">Aucun créneau sans conflit détecté.</p>'}</div>`}
 ${r.proposals.length?`<div class="scope-proposals"><strong>Créneaux proposés (${r.proposals.length})</strong>${r.proposals.map((s,i)=>`<div><span>${fmt(s.date)} · ${s.start}–${s.end} <small>· ${s.mode==='simulation'?'simulation':'à vérifier'}</small></span><button class="scope-icon-button" onclick="scopingRemoveSlot(${i})" aria-label="Retirer le créneau">×</button></div>`).join('')}</div><button class="secondary tiny" onclick="scopingCopyMessage()">Copier le message de proposition</button>`:''}`;
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
 <div class="scope-doc-actions"><button class="secondary tiny" onclick="scopingSaveDocument('${key}')">Enregistrer le lien</button>${has?`<a class="secondary tiny scope-doc-open" href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">↗ Voir le document</a>`:'<button class="secondary tiny" disabled title="Ajoutez un lien Drive valide">↗ Voir le document</button>'}</div></article>`;
}
function documentsMarkup(r){
 const audit=!!scopeDocumentUrl(scopeDocInfo(r,'audit').url),cadrage=!!scopeDocumentUrl(scopeDocInfo(r,'cadrage').url),total=Number(audit)+Number(cadrage);
 const status=total===2?'2 sources prêtes':`${total}/2 sources renseignées`;
 return `<div class="scope-sectionhead"><h3>Documents & synthèse du cadrage</h3><small>${status}</small></div>
 <p class="scope-help scope-doc-lead">Retrouvez les deux supports du call, puis préparez leur analyse croisée. Les liens sont enregistrés localement dans cette démonstration, sans connexion automatique à Drive.</p>
 <div class="scope-doc-grid">${scopeDocCard(r,'audit','Audit client','Enjeux, maturité IA et besoins identifiés','▤')}${scopeDocCard(r,'cadrage','Support de cadrage','Programme, questions et éléments pédagogiques','▦')}</div>
 <div class="scope-ai-panel"><div class="scope-ai-heading"><div><span class="scope-ai-eyebrow">✦ ANALYSE CROISÉE</span><h4>Synthèse IA du cadrage</h4><p>Une seule synthèse à partir des deux documents, avec les écarts et questions utiles pour l'AMO.</p></div><span class="scope-ai-chip">API à connecter</span></div>
 <div class="scope-ai-topics">${[['◎','Contexte & objectifs'],['◈','Résultats de l’audit'],['◇','Écarts et points à clarifier'],['?','Questions pour le call']].map(([icon,label])=>`<span><b>${icon}</b>${label}</span>`).join('')}</div>
 ${total<2?`<p class="scope-ai-empty">${total===0?'Ajoutez les liens vers l’audit et le support de cadrage pour préparer la future analyse.':'Il manque un document : renseignez les deux sources pour permettre une analyse croisée.'}</p>`:'<p class="scope-ai-empty">Les deux liens sont enregistrés. La génération IA sera activée après l’intégration de Google Drive API et OpenAI API.</p>'}
 <button class="primary scope-ai-generate" type="button" disabled title="La génération sera disponible après la connexion sécurisée des API">✦ Générer la synthèse <span>· bientôt disponible</span></button>
 <p class="scope-ai-disclaimer">Aucune analyse n’est générée pour le moment. La future synthèse citera ses sources et distinguera faits, hypothèses et questions à vérifier.</p></div>`;
}

function historyMarkup(r){return r.history.length?`<details class="scope-history"><summary>Historique des modifications (${r.history.length})</summary>${r.history.slice(-7).reverse().map(e=>`<div>${escapeText(e.at.slice(0,16).replace('T',' '))} · ${escapeText(e.text)}</div>`).join('')}</details>`:'';}
function summaryMarkup(f,r){const trainer=formTrainer(f),client=clientRecord(f),dates=sessionsOf(f),date=callSessionDate(f),days=daysBefore(date);
 return `<div class="scope-detailtitle"><div><span class="scope-eyebrow">FICHE DE CADRAGE</span><h2>${escapeText(client.name)}</h2><p>${escapeText(f.title)}</p></div>${markupPill(r.status)}</div><div class="scope-facts"><div><span>Formation</span><strong>${fmt(date)}</strong></div><div><span>Formateur</span><strong>${escapeText(trainer?.name||'À staffer')}</strong></div><div><span>Participants</span><strong>${dates[0]?.people||'—'}</strong></div><div><span>Jalon J-14</span><strong>${days===null?'À préciser':days<=14&&r.status==='todo'?'À traiter':'Suivi actif'}</strong></div></div><div class="scope-actionrow"><button class="secondary tiny" onclick="openFormation('${escapeText(f.id)}')">Voir la formation</button><button class="secondary tiny" onclick="openClient('${escapeText(f.clientId)}')">Voir le client</button>${trainer?`<button class="secondary tiny" onclick="openTrainer(${trainer.id})">Fiche formateur</button>`:''}</div>`;
}
function scheduleMarkup(r){return `<div class="scope-sectionhead"><h3>Organisation et confirmation</h3><small>Une proposition ne vaut pas confirmation</small></div><div class="scope-grid">${input('Date retenue','scope-date',r.date,'date')}${input('Début','scope-start',r.start,'time')}${input('Fin','scope-end',r.end,'time')}${input('Lien Google Meet (facultatif)','scope-meet',r.meet,'url','https://meet.google.com/…')}</div><div class="scope-actionrow"><button class="primary" onclick="scopingConfirm()">Confirmer le call</button><button class="secondary" onclick="scopingMarkDone()">Marquer comme réalisé</button><button class="secondary" onclick="scopingCancel()">Annuler</button></div><p class="scope-help">La confirmation est locale : aucune invitation Google Calendar ou notification réelle n'est envoyée.</p>`;}
function notesMarkup(r){return `<div class="scope-sectionhead"><h3>Compte rendu et actions</h3><small>À compléter pendant et après le call</small></div><label class="scope-field"><span>Points abordés · décisions · attentes client</span><textarea id="scope-notes" rows="6" placeholder="Attentes, cas d'usage, contraintes, prérequis, décisions…">${escapeText(r.notes)}</textarea></label><div class="scope-actionrow"><button class="secondary tiny" onclick="scopingSaveNotes()">Enregistrer le compte rendu</button></div><div class="scope-sectionhead scope-actions-title"><h4>Actions à suivre</h4><small>${r.actions.length} action(s)</small></div><div class="scope-add-action"><input id="scope-action-text" aria-label="Nouvelle action" placeholder="Ex. Envoyer le programme adapté"><input id="scope-action-date" type="date" aria-label="Échéance"><button class="primary tiny" onclick="scopingAddAction()">Ajouter</button></div><div class="scope-actionitems">${r.actions.map((a,i)=>`<label class="scope-actionitem"><input type="checkbox" ${a.done?'checked':''} onchange="scopingToggleAction(${i},this.checked)"><span>${escapeText(a.text)}${a.date?` · ${fmt(a.date)}`:''}</span></label>`).join('')||'<p class="scope-empty">Aucune action enregistrée.</p>'}</div>`;}
function detailMarkup(f,r){return `<section class="scope-detail card">${summaryMarkup(f,r)}<div class="scope-content"><section>${contactMarkup(r)}</section><section>${availabilityMarkup(f,r)}</section><section>${scheduleMarkup(r)}</section><section>${documentsMarkup(r)}</section><section>${notesMarkup(r)}</section>${historyMarkup(r)}</div></section>`;}
function scopingPage(){const rows=allCalls();if(!state.scopingSelected||!formations.some(f=>f.id===state.scopingSelected))state.scopingSelected=rows[0]?.f.id;const f=formations.find(x=>x.id===state.scopingSelected);const r=f&&callFor(f);
 return `<div class="scope-root"><header class="scope-hero"><div><span class="scope-eyebrow">PILOTAGE AMO · J-14</span><h1>Calls de cadrage<span>.</span></h1><p>Planifiez, contactez, préparez et suivez vos échanges clients avant les formations.</p></div><span class="scope-demo-chip">Démonstration locale</span></header>${statsMarkup(rows)}<div class="scope-layout">${listMarkup(rows)}${f?detailMarkup(f,r):'<p class="scope-empty">Aucune formation disponible.</p>'}</div><p class="scope-footnote">Toutes les modifications et propositions sont enregistrées uniquement dans cette démo. Google Agenda, HubSpot, Google Meet et les envois de messages ne sont pas connectés.</p></div>`;
}
function getSelected(){if(state.role!=='amo')return null;const f=formations.find(x=>x.id===state.scopingSelected);return f?{f,r:callFor(f)}:null;}
function persist(text){const d=getSelected();if(!d)return;d.r.history.push({at:new Date().toISOString(),text});save();render();}
function notify(text){if(typeof flash==='function')flash(text);}
window.scopingSelect=id=>{if(!formations.some(f=>f.id===id))return;state.scopingSelected=id;render();};
window.scopingSearch=v=>{state.scopingSearch=v;const el=document.activeElement;const pos=el?.selectionStart;render();const input=document.querySelector('.scope-search input');if(input){input.focus();try{input.setSelectionRange(pos,pos)}catch(e){}}};
window.scopingFilter=v=>{state.scopingFilter=v;render()};
window.scopingDuration=n=>{const d=getSelected();if(!d||![15,30,45,60].includes(Number(n)))return;d.r.duration=Number(n);save();render()};
window.scopingSaveContact=()=>{const d=getSelected();if(!d)return;const get=k=>document.getElementById(k)?.value.trim()||'';const phone=get('scope-contact-phone'),email=get('scope-contact-email');if(phone&&!safeNumber(phone))return notify('Numéro invalide : indiquez un numéro complet.');if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return notify('Adresse e-mail invalide.');d.r.contact={...d.r.contact,name:get('scope-contact-name'),role:get('scope-contact-role'),phone,email};persist('Coordonnées du contact mises à jour')};
window.scopingChooseSlot=(date,start,end)=>{const d=getSelected();if(!d)return;const slot=slotsFor(d.f,d.r,14).find(x=>x.date===date&&x.start===start&&x.end===end);if(!slot)return notify('Créneau occupé ou devenu indisponible.');if(d.r.proposals.some(x=>x.date===date&&x.start===start))return notify('Créneau déjà sélectionné.');d.r.proposals.push(slot);if(!d.r.date){d.r.date=date;d.r.start=start;d.r.end=end;}d.r.status='pending';persist('Proposition de créneau préparée : '+fmt(date)+' '+start+'–'+end)};
window.scopingRemoveSlot=i=>{const d=getSelected();if(!d||!d.r.proposals[i])return;d.r.proposals.splice(i,1);if(!d.r.proposals.length&&d.r.status==='pending')d.r.status='todo';persist('Créneau proposé retiré')};
window.scopingCopyMessage=()=>{const d=getSelected();if(!d||!d.r.proposals.length)return;const text=`Bonjour,\n\nDans le cadre de la formation « ${d.f.title} » pour ${clientRecord(d.f).name}, voici plusieurs créneaux à valider pour un call de cadrage de ${d.r.duration} minutes :\n${d.r.proposals.map(s=>'• '+fmt(s.date)+' de '+s.start+' à '+s.end).join('\n')}\n\nCes horaires restent à confirmer avec les participants.\n\nBien cordialement,\nL’équipe Certif-IA`;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>notify('Message copié · aucun e-mail envoyé')).catch(()=>notify('Copie impossible dans ce navigateur.'))}else{const box=document.createElement('textarea');box.value=text;document.body.append(box);box.select();try{document.execCommand('copy');notify('Message copié')}catch(e){notify('Copie indisponible')}box.remove()}};
window.scopingConfirm=()=>{const d=getSelected();if(!d)return;const get=k=>document.getElementById(k)?.value||'';const date=get('scope-date'),start=get('scope-start'),end=get('scope-end'),meet=get('scope-meet').trim();if(!date||!start||!end||start>=end)return notify('Choisissez une date et une plage horaire valide.');if(meet&&!/^https:\/\//i.test(meet))return notify('Le lien visio doit commencer par https://.');const trainer=formTrainer(d.f);if(!trainer)return notify('Aucun formateur affecté : utilisez le Staffing.');if(trainerBusy(trainer,date,start,end,d.f.id))return notify('Conflit avec un autre événement ou une mission.');if(calendarMode(trainer).kind==='unknown'&&!window.confirm('Agenda formateur non vérifié. Confirmer manuellement après accord des participants ?'))return;
 d.r.date=date;d.r.start=start;d.r.end=end;d.r.meet=meet;d.r.status='confirmed';d.r.checklist.date=true;persist('Call confirmé manuellement pour le '+fmt(date)+' à '+start+' (sans invitation réelle)')};
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
window.scopingSaveNotes=()=>{const d=getSelected();if(!d)return;d.r.notes=document.getElementById('scope-notes')?.value||'';persist('Compte rendu enregistré')};
window.scopingAddAction=()=>{const d=getSelected();if(!d)return;const v=document.getElementById('scope-action-text')?.value.trim()||'',due=document.getElementById('scope-action-date')?.value||'';if(!v)return notify('Renseignez une action.');d.r.actions.push({id:Date.now(),text:v,date:due,done:false});persist('Nouvelle action : '+v)};
window.scopingToggleAction=(i,checked)=>{const d=getSelected();if(!d||!d.r.actions[i])return;d.r.actions[i].done=checked;save();render()};
function sidebarLink(){if(state.role!=='amo')return;
 const nav=document.querySelector('#sidebar .nav');if(nav&&!nav.querySelector('[data-scoping-nav]')){
  const button=document.createElement('button');button.setAttribute('data-scoping-nav','');button.className=state.page===PAGE?'active':'';button.setAttribute('onclick',"go('scoping-calls')");button.innerHTML='<span class="ic" aria-hidden="true">☎</span>Calls de cadrage';nav.append(button);
 }
 const mobileList=document.querySelector('.mobile-more-list');if(mobileList&&!mobileList.querySelector('[data-scoping-more]')){
  const button=document.createElement('button');button.setAttribute('data-scoping-more','');button.setAttribute('onclick',"go('scoping-calls')");button.innerHTML='<span><strong>Calls de cadrage</strong><small>Planification et suivi client</small></span>›';mobileList.append(button);
 }
}
const normalValidPages=validPages;validPages=function(role){const pages=normalValidPages(role);return role==='amo'?[...pages,PAGE]:pages;};
const previousRender=render;
render=function(){const special=state.role==='amo'&&state.page===PAGE;
 if(special){state.page='home';previousRender();state.page=PAGE;const main=document.getElementById('main-content');if(main)main.innerHTML=scopingPage();document.title='Certif-IA Hub — Calls de cadrage';const breadcrumb=document.querySelector('.bread');if(breadcrumb)breadcrumb.textContent='Certif-IA / AMO / Calls de cadrage';}
 else previousRender();sidebarLink();};
// La restauration initiale du hash a précédé le chargement de ce module.
if(location.hash==='#/interne/scoping-calls'){state.role='amo';state.page=PAGE;}
render();
})();