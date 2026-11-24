// Local domain events and recipient-scoped notification history for the demo.
function noticeRecipient() {
  return state.role === 'amo' ? 'amo' : 'trainer-' + state.trainerId;
}

function sessionNoticeText(session) {
  const formation = formOf(session);
  return clientOf(formation).name + ' · ' + formation.title + ' · ' + fmtDate(session.date);
}

function syncOperationalNotices() {
  const history = db.operationalNotices ||= {};
  let changed = false;
  function add(recipient, event, type, title, detail, target, legacyKey) {
    const inbox = history[recipient] ||= {};
    if (inbox[event]) return;
    const seen = recipient === 'amo' ? db.seenAmoNotifications : db.seenNotifications?.[recipient.slice(8)];
    inbox[event] = { event, type, title, detail, target, at: new Date().toISOString(),
      read: Boolean(legacyKey && seen?.includes(legacyKey)) };
    changed = true;
  }
  const today = parisToday();
  const soon = shiftDate(today, 3);
  const sessions = new Map(db.sessions.map(session => [session.id, session]));
  const access = new Map();
  function allow(trainerId, sessionId) {
    if (!access.has(sessionId)) access.set(sessionId, new Set());
    access.get(sessionId).add(trainerId);
  }
  for (const session of sessions.values()) {
    if (['Réalisée', 'Annulée'].includes(session.status) || session.date < today) continue;
    const detail = sessionNoticeText(session);
    if (openCount(session)) add('amo', 'staff:' + session.id + ':' + session.date, 'action',
      'Session à staffer', detail, ['staff', session.id]);
    if (session.date <= soon) {
      const documents = db.deliverables.filter(d => d.sessionId === session.id);
      const ready = ['AUDIT', 'CADRAGE', 'PROGRAMME', 'SUPPORT'].every(key =>
        documents.some(d => docCategory(d) === key && d.status === 'Validé'));
      if (!ready || openCount(session)) add('amo', 'prep:' + session.id + ':' + session.date, 'alert',
        'Formation proche · préparation incomplète', detail, ['session', session.id]);
    }
  }
  for (const proposal of db.proposals) {
    const session = sessions.get(proposal.sessionId);
    if (!session) continue;
    const id = proposal.id;
    const detail = sessionNoticeText(session);
    const amoDetail = (trainerById(proposal.trainerId)?.name||'Formateur')+' · '+detail;
    const target = ['proposal', id];
    if (proposal.status === 'Brouillon') add('amo', id + ':draft', 'action', 'Proposition à autoriser', amoDetail, target);
    if (['Envoyée', 'Acceptée', 'Refusée', 'Expirée'].includes(proposal.status) || proposal.sent) {
      add('trainer-' + proposal.trainerId, id + ':sent', 'action', 'Nouvelle proposition de mission',
        detail, ['missions', id], 'proposal:' + id);
    }
    if (proposal.status === 'Envoyée' && proposalPastDue(proposal)) {
      add('amo', id + ':late', 'reminder', 'Proposition sans réponse', amoDetail, target);
    }
    if (['Acceptée', 'Refusée'].includes(proposal.status)) {
      add('amo', id + ':' + proposal.status, proposal.status === 'Acceptée' ? 'action' : 'alert',
        'Proposition ' + proposal.status.toLowerCase(), amoDetail, target, id + ':' + proposal.status);
    }
    if (proposal.status === 'Acceptée') allow(proposal.trainerId, session.id);
    if (proposalAgendaConflict(proposal, session)) {
      add('amo', id + ':conflict:' + session.date, 'alert', 'Conflit d’agenda à arbitrer', amoDetail, target);
    }
  }
  for (const assignment of db.assignments) {
    const session = sessions.get(assignment.sessionId);
    if (!session || !['Confirmée', 'Réalisée', 'À revalider'].includes(assignment.status)) continue;
    allow(assignment.trainerId, session.id);
    const recipient = 'trainer-' + assignment.trainerId;
    const detail = sessionNoticeText(session);
    const target = ['mission', session.id];
    if (assignment.status === 'Confirmée') add(recipient, assignment.id + ':confirmed', 'info',
      'Mission confirmée', detail, target);
    if (assignment.status === 'À revalider') add(recipient, assignment.id + ':changed:' + (session.staffingRevision || session.date), 'alert',
      'Mission modifiée · à revalider', detail + ' · ' + session.start + '–' + session.end + ' · ' + session.city, target);
    if (assignment.status === 'Confirmée' && session.date >= today && session.date <= soon) {
      add(recipient, assignment.id + ':upcoming:' + session.date, 'reminder', 'Rappel avant formation', detail, target);
    }
  }
  for (const document of db.deliverables) {
    const session = sessions.get(document.sessionId);
    if (!session) continue;
    const version = document.versions?.at(-1);
    const revision = version?.number || 0;
    const detail = document.title + ' · ' + clientOf(formOf(session)).name;
    const target = ['document', document.id];
    if (document.status === 'À fournir' && session.date >= today) {
      add('amo', document.id + ':missing', 'reminder', 'Livrable manquant', detail, target);
    }
    if (['Déposé', 'En vérification'].includes(document.status)) {
      add('amo', document.id + ':review:' + revision, 'action', 'Document à vérifier', detail, target,
        document.id + ':' + document.versions.length);
    }
    for (const trainerId of access.get(session.id) || []) {
      const recipient = 'trainer-' + trainerId;
      if (document.owner === 'interne' && version) {
        add(recipient, document.id + ':shared:' + revision, 'info',
          docCategory(document) === 'AUDIT' ? 'Audit client reçu' : 'Nouveau document disponible', detail, target);
      }
      if (document.owner !== 'formateur' || document.trainerId !== trainerId) continue;
      if (document.status === 'À fournir') add(recipient, document.id + ':expected', 'reminder',
        'Livrable attendu', detail, target);
      if (document.status === 'Refusé') add(recipient, document.id + ':revision:' + revision, 'alert',
        'Correction demandée', detail, target, 'refusal:' + document.id + ':' + revision);
    }
  }
  for (const reminder of db.reminders) {
    if (reminder.channel !== 'PWA') continue;
    const document = db.deliverables.find(d => d.id === reminder.deliverableId);
    if (document?.trainerId && access.get(document.sessionId)?.has(document.trainerId)) {
      add('trainer-' + document.trainerId, 'reminder:' + reminder.id, 'reminder',
        'Rappel de livrable', document.title, ['document', document.id], 'reminder:' + reminder.id);
    }
  }
  if (changed) save();
  return changed;
}

const noticeTypes = {action:'Action', alert:'Alerte', reminder:'Rappel', info:'Information'};

function inboxItems() {
  return Object.values(db.operationalNotices?.[noticeRecipient()] || {}).reverse()
    .filter(item=>!item.deletedAt).sort((a,b)=>Number(Boolean(b.pinned))-Number(Boolean(a.pinned)));
}

function visibleInboxItems() {
  return inboxItems().filter(item=>state.noticeType==='all' ||
    (state.noticeType==='unread' ? !item.read : state.noticeType===item.type));
}

function notificationBell() {
  const count = inboxItems().filter(notice => !notice.read).length;
  return `<button class="mobile-bell ops-bell" data-ops-trigger="notifications" aria-label="Notifications${count ? ' · '+count+' non lue(s)' : ''}" aria-haspopup="dialog" onclick="openOperationsInbox()">${mobileIcon('bell', 20)}${count ? `<span class="ops-unread-count" aria-hidden="true">${count}</span>` : ''}</button>`;
}

function openOperationsInbox() {
  deliverInboxReminders();
  state.noticeType = 'all';
  state.noticeSelection = null;
  state.noticeUndo = null;
  openModal(state.role === 'amo' ? 'amo-notifications' : 'trainer-notifications');
}

function readOperationsNotice(event, follow = false) {
  const items = inboxItems();
  const item = items.find(notice => notice.event === event);
  if (event !== null && !item) return;
  if (item) item.read = true;
  else {
    items.forEach(notice => { notice.read = true; });
    state.noticeSelection?.clear();
  }
  save();
  if (!follow) return renderInbox(item?noticeControlId('read',event):'ops-read-all');
  const [type, id] = item.target;
  if (type === 'staff' && state.role === 'amo') {
    const session = sessionById(id);
    if (session) return openCount(session)&&!['Réalisée','Annulée'].includes(session.status)?staffFor(id):openSession(id);
  }
  if (type === 'session' && state.role === 'amo') return openSession(id);
  if (type === 'proposal' && state.role === 'amo') return openStaffProposal(id);
  if (type === 'missions' && state.role === 'formateur') {
    state.missionTab = 'proposals';
    return go('trainer-missions');
  }
  if (type === 'mission' && state.role === 'formateur' && trainerSessionAccess(id)) {
    go('trainer-missions');
    return openModal('mission-info', id);
  }
  if (type === 'document') {
    const doc = db.deliverables.find(document => document.id === id);
    if (doc && (state.role === 'amo' || trainerCanReadDocument(doc))) {
      go(state.role === 'amo' ? 'documents' : 'trainer-docs');
      return openModal('document-preview', id);
    }
  }
  render();
  flash('Cet élément n’est plus accessible.');
}

function renderInbox(focusId) {
  const scroll=document.querySelector('.ops-modal')?.scrollTop || 0;
  render();
  const panel=document.querySelector('.ops-modal');
  if(panel)panel.scrollTop=scroll;
  $(focusId)?.focus({preventScroll:true});
}

function toggleNoticeSelection(enabled) {
  state.noticeSelection=enabled?new Set():null;
  renderInbox('ops-select-notices');
}

function selectInboxNotices(key, checked) {
  const selected=state.noticeSelection;
  if(!selected)return;
  const keys=key===null?visibleInboxItems().map(item=>item.event):[key];
  for(const event of keys){
    if(checked)selected.add(event);
    else selected.delete(event);
  }
  renderInbox(key===null?'ops-select-all':noticeControlId('card',key));
}

function noticeControlId(action,key) {
  return 'ops-notice-'+action+'-'+encodeURIComponent(key);
}

function updateInboxNotices(action,key,minutes) {
  const items=inboxItems().filter(item=>key===null?state.noticeSelection?.has(item.event):item.event===key);
  if(!items.length)return;
  if(action==='remind' && ![15,60,1440].includes(minutes))return;
  const now=Date.now();
  for(const item of items){
    if(action==='unread')item.read=false;
    else if(action==='pin')item.pinned=!item.pinned;
    else if(action==='remind')item.remindAt=now+minutes*60000;
    else if(action==='cancel-reminder')delete item.remindAt;
    else if(action==='delete'){
      item.deletedAt=now;
    }
    state.noticeSelection?.delete(item.event);
  }
  if(action==='delete')state.noticeUndo=items.map(item=>item.event);
  save();
  const focusId=action==='delete'?'ops-undo-delete':key===null?'ops-select-notices':noticeControlId(action==='remind'||action==='cancel-reminder'?'reminder':action==='unread'?'read':action,key);
  const keys=new Set(items.map(item=>item.event));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return renderInbox(focusId);
  if(action==='delete'){
    const list=document.querySelector('.ops-inbox-list');
    const animations=inboxCardsByKey(keys).map(burstInboxCard).filter(Boolean);
    if(animations.length){
      Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{
        if(list?.isConnected)renderInbox(focusId);
      });
      return;
    }
  }
  renderInbox(focusId);
  if(action==='unread'){
    for(const card of inboxCardsByKey(keys)){
      card.animate?.([
        {borderInlineStartColor:'transparent'},
        {borderInlineStartColor:'var(--purple)'}
      ],{duration:520,easing:'ease-in-out'});
    }
  }
}

function burstInboxCard(card) {
  const content=card.querySelector('.ops-notice-content');
  if(!content?.animate)return;
  const swipeX=card.dataset.swipe==='delete'?parseFloat(card.style.getPropertyValue('--ops-swipe-x'))||0:0;
  card.inert=true;
  delete card.dataset.swipe;
  card.style.removeProperty('--ops-swipe-x');
  card.classList.add('ops-notice-burst');
  if(swipeX)return shatterInboxCard(card,content,swipeX);
  const duration=380;
  const burst=document.createElement('span');
  burst.className='ops-notice-sparks';
  burst.style.setProperty('--ops-burst-duration',duration+'ms');
  burst.setAttribute('aria-hidden','true');
  for(let i=0;i<6;i++)burst.append(document.createElement('i'));
  card.append(burst);
  return content.animate([
    {opacity:1,transform:'scale(1)'},
    {opacity:.90,transform:'scale(1.012)',offset:.20},
    {opacity:0,transform:'scale(.985)'}
  ],{duration,easing:'cubic-bezier(.3,.6,.5,1)',fill:'forwards'});
}

function shatterInboxCard(card,content,swipeX) {
  const duration=700;
  const {width,height}=card.getBoundingClientRect();
  const canvas=document.createElement('canvas');
  canvas.className='ops-notice-fragments';
  canvas.setAttribute('aria-hidden','true');
  const scale=Math.min(devicePixelRatio||1,2);
  const bleed=42;
  canvas.style.setProperty('--fragment-bleed',bleed+'px');
  canvas.width=Math.ceil((width+bleed*2)*scale);
  canvas.height=Math.ceil((height+bleed*2)*scale);
  const context=canvas.getContext('2d');
  const animation=content.animate([
    {opacity:1,transform:`translateX(${swipeX}px)`},
    {opacity:0,transform:`translateX(${swipeX-24}px)`,offset:.22},
    {opacity:0,transform:'translateX(-100%)'}
  ],{duration,easing:'ease-out',fill:'forwards'});
  if(!context)return animation;

  card.classList.add('ops-notice-shattering');
  card.append(canvas);
  context.scale(scale,scale);
  context.translate(bleed,bleed);
  const columns=42,rows=17;
  const colors=['#974957','#ad5d69','#c47b85'];
  const fragments=Array.from({length:columns*rows},(_,i)=>{
    const x=(i%columns+Math.random())*width/columns;
    const y=(Math.floor(i/columns)+Math.random())*height/rows;
    return {
      x,y,width:width/columns*(.38+Math.random()*.58),height:height/rows*(.32+Math.random()*.57),
      dx:(x-width/2)*.30-48+(Math.random()-.5)*54,
      dy:(y-height/2)*.46+(Math.random()-.5)*42,
      color:colors[i%colors.length]
    };
  });
  let started;
  function draw(now){
    if(!canvas.isConnected)return;
    started??=now;
    const progress=Math.min(1,(now-started)/duration);
    const distance=1-(1-progress)**2;
    context.clearRect(-bleed,-bleed,width+bleed*2,height+bleed*2);
    context.globalAlpha=Math.min(.8,progress*12)*(1-progress)**1.3;
    for(const part of fragments){
      context.fillStyle=part.color;
      context.fillRect(part.x+part.dx*distance,part.y+part.dy*distance,part.width*(1-progress*.65),part.height*(1-progress*.65));
    }
    if(progress<1)requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return animation;
}

function inboxCardsByKey(keys) {
  return [...document.querySelectorAll('.ops-inbox-list .ops-notice')]
    .filter(card=>keys.has(card.dataset.noticeKey));
}

function undoInboxDelete() {
  const inbox=db.operationalNotices?.[noticeRecipient()];
  for(const key of state.noticeUndo||[]){
    if(inbox?.[key])delete inbox[key].deletedAt;
  }
  state.noticeUndo=null;
  save();
  renderInbox('ops-select-notices');
}

const noticeIconPaths={
  trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
  unread:'<path d="M20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10m-10 1 7 6 3-2"/><circle cx="20" cy="6" r="2"/>',
  read:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin:'<path d="m16 3 5 5-3 1-3 3v4l-1 1-7-7 1-1h4l3-3zM10 14l-6 6"/>',
  select:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 3 3 5-6"/>',
  all:'<rect x="7" y="7" width="14" height="14" rx="3"/><path d="M3 16V6a3 3 0 0 1 3-3h10m-5 11 2 2 4-5"/>'
};
function inboxIcon(name) {
  return noticeIconPaths[name] ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${noticeIconPaths[name]}</svg>` : mobileIcon(name,18);
}

function inboxIconButton(icon,label,action,attributes='') {
  return `<button type="button" class="ops-icon-button ${icon==='trash'?'ops-notice-delete':''}" aria-label="${label}" title="${label}" onclick="${action}" ${attributes}>${inboxIcon(icon)}</button>`;
}

function operationsInboxPanel() {
  const unread = inboxItems().filter(item=>!item.read).length;
  const filtered = visibleInboxItems();
  const selected = state.noticeSelection;
  const allSelected=Boolean(filtered.length&&filtered.every(item=>selected?.has(item.event)));
  return modalBox('Centre de notifications', `${unread} non lue(s) · historique de démonstration`, `
    <div class="ops-inbox-controls">
      <select id="ops-notice-type" class="ops-inbox-select" aria-label="Type" onchange="setOperationsNoticeFilter(this.value)">
        ${[['all','Tous les types'],['unread','Non lues uniquement'],...Object.entries(noticeTypes)].map(([key,label])=>`<option value="${key}" ${state.noticeType===key?'selected':''}>${label}</option>`).join('')}
      </select>
      <button id="ops-select-notices" type="button" class="ops-inbox-select" aria-pressed="${Boolean(selected)}" onclick="toggleNoticeSelection(${!selected})">${inboxIcon(selected?'close':'select')}${selected?'Terminer':'Sélectionner'}</button>
      ${!selected?inboxIconButton('check','Tout marquer comme lu','readOperationsNotice(null)',`id="ops-read-all" ${unread?'':'disabled'}`):''}
    </div>
    ${selected?`<div class="ops-inbox-bulk">
      <span role="status">${selected.size} sélectionnée${selected.size===1?'':'s'}</span>
      <div class="ops-bulk-actions">
        ${inboxIconButton('all',allSelected?'Tout désélectionner':'Tout sélectionner',`selectInboxNotices(null,${!allSelected})`,`id="ops-select-all" aria-pressed="${allSelected}" ${filtered.length?'':'disabled'}`)}
        ${inboxIconButton('unread','Marquer comme non lues',"updateInboxNotices('unread',null)",selected.size?'':'disabled')}
        ${inboxIconButton('trash','Supprimer la sélection',"updateInboxNotices('delete',null)",selected.size?'':'disabled')}
      </div>
    </div>`:''}
    ${state.noticeUndo?`<div class="ops-inbox-undo" role="status">Suppression effectuée. <button id="ops-undo-delete" class="ghost tiny" onclick="undoInboxDelete()">Annuler la suppression</button></div>`:''}
    <ul class="ops-inbox-list ${selected?'ops-inbox-selecting':''}">${filtered.map(item=>inboxNoticeCard(item,selected)).join('') || '<li class="empty">Aucune notification pour ces filtres.</li>'}</ul>`);
}

function inboxNoticeCard(item,selected) {
  const key=esc(item.event);
  const control=action=>esc(noticeControlId(action,item.event));
  const data=action=>`id="${control(action)}" data-notice-key="${key}"`;
  const checked=Boolean(selected?.has(item.event));
  const due=item.remindAt?new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short'}).format(item.remindAt):'';
  const open=selected?`selectInboxNotices(this.dataset.noticeKey,${!checked})`:'readOperationsNotice(this.dataset.noticeKey,true)';
  return `<li class="ops-notice ${item.read?'':'ops-notice-unread'} ${checked?'ops-notice-selected':''}" data-notice-key="${key}">
    <div class="ops-notice-content">
      <button type="button" class="ops-notice-card" ${data('card')} ${selected?`role="checkbox" aria-checked="${checked}"`:''} onclick="${open}">
        ${selected?`<span class="ops-notice-check" aria-hidden="true">${checked?inboxIcon('check'):''}</span>`:''}
        <span class="ops-notice-copy">
          <span class="ops-notice-meta"><span class="ops-notice-type" data-type="${item.type}">${noticeTypes[item.type]}</span>
            <span class="item-sub">${fmtDate(item.at.slice(0,10))} · ${item.read?'Lue':'Non lue'}</span>
            ${item.pinned?'<span class="ops-notice-pinned">Épinglée</span>':''}</span>
          <strong class="ops-notice-title">${esc(item.title)}</strong><span class="ops-notice-detail">${esc(item.detail)}</span>
          ${due?`<span class="item-sub">Rappel prévu · ${esc(due)}</span>`:item.remindedAt?'<span class="item-sub">Rappel arrivé à échéance</span>':''}
        </span>
      </button>
      ${selected?'':`<div class="ops-notice-actions">
        ${item.read?inboxIconButton('unread','Marquer comme non lue',"updateInboxNotices('unread',this.dataset.noticeKey)",data('read')):inboxIconButton('read','Marquer comme lue','readOperationsNotice(this.dataset.noticeKey)',data('read'))}
        ${inboxIconButton('pin',item.pinned?'Désépingler':'Épingler',"updateInboxNotices('pin',this.dataset.noticeKey)",`${data('pin')} aria-pressed="${Boolean(item.pinned)}"`)}
        <details class="ops-notice-reminder">
          <summary id="${control('reminder')}" class="ops-icon-button" aria-label="Programmer un rappel" title="Programmer un rappel">${inboxIcon('bell')}</summary>
          <div class="ops-notice-menu">
            <label>Rappel push (démo)<select class="field" data-notice-key="${key}" onchange="updateInboxNotices('remind',this.dataset.noticeKey,Number(this.value))">
              <option value="">Choisir un délai</option><option value="15">Dans 15 minutes</option><option value="60">Dans 1 heure</option><option value="1440">Dans 24 heures</option>
            </select></label>
            ${due?inboxIconButton('close','Annuler le rappel',"updateInboxNotices('cancel-reminder',this.dataset.noticeKey)",`data-notice-key="${key}"`):''}
          </div>
        </details>
        ${inboxIconButton('trash','Supprimer',"updateInboxNotices('delete',this.dataset.noticeKey)",data('delete'))}
      </div>`}
    </div></li>`;
}

function setOperationsNoticeFilter(value) {
  state.noticeType=value;
  state.noticeSelection?.clear();
  renderInbox('ops-notice-type');
}

function deliverInboxReminders() {
  const now=Date.now();
  let arrived=0;
  let changed=false;
  for(const [recipient,items] of Object.entries(db.operationalNotices||{})){
    for(const item of Object.values(items)){
      if(item.deletedAt||!item.remindAt||item.remindAt>now)continue;
      item.read=false;
      item.remindedAt=now;
      delete item.remindAt;
      if(recipient===noticeRecipient())arrived++;
      changed=true;
    }
  }
  if(changed)save();
  return arrived;
}

function refreshOperationalInbox() {
  const changed=syncOperationalNotices();
  const arrived=deliverInboxReminders();
  if(arrived&&['amo-notifications','trainer-notifications'].includes(state.modal?.kind))renderInbox();
  if(arrived)flash(arrived===1?'Un rappel de notification est arrivé.':arrived+' rappels de notifications sont arrivés.');
  if(!changed&&!arrived)return;
  const current = document.querySelectorAll('.ops-bell');
  const template = document.createElement('template');
  template.innerHTML = notificationBell();
  for (const bell of current) {
    const fresh = template.content.firstElementChild;
    bell.setAttribute('aria-label', fresh.getAttribute('aria-label'));
    bell.innerHTML = fresh.innerHTML;
  }
}

function openStaffProposal(id) {
  if (state.role !== 'amo') return;
  state.staffTab = 'proposals';
  state.staffNoticeProposal = id;
  go('staffing');
  $('staff-proposal-'+id)?.focus();
}

const pendingProposalStates = ['Brouillon', 'Autorisée à l’envoi', 'Envoyée', 'Acceptée'];

function proposalAgendaConflict(proposal, session) {
  return ['Envoyée', 'Acceptée'].includes(proposal.status) &&
    calendarConflict(session, proposal.trainerId, {sessionId:session.id, allowAvailable:true});
}

function proposalPastDue(proposal) {
  return Boolean(proposal.expires && proposal.expires < parisToday());
}

function staffingBlock(session, trainer, allowedAssignment) {
  if (!session || ['Réalisée', 'Annulée'].includes(session.status) || !openCount(session)) return 'Cette session n’a plus de poste à pourvoir.';
  if (db.assignments.some(a => a !== allowedAssignment && a.sessionId === session.id && a.trainerId === trainer?.id && ['Confirmée', 'À revalider'].includes(a.status))) {
    return 'Ce formateur est déjà affecté ou en cours de revalidation.';
  }
  if (!trainer) return 'Le profil du formateur est indisponible.';
  return calendarConflict(session, trainer.id, { sessionId: session.id, allowAvailable: true }) ||
    (!staffingAvailable(trainer, session) ? 'Disponibilité complète non vérifiée sur ce créneau.' : '');
}

function findStaffProposal(id, status) {
  const proposal = db.proposals.find(p => p.id === id && p.status === status);
  if (!proposal) flash('Cette transition n’est plus disponible.');
  return proposal;
}

function endStaffProposal(id, expire) {
  if (state.role !== 'amo') return;
  const proposal = db.proposals.find(p => p.id === id);
  if (!proposal || !pendingProposalStates.includes(proposal.status) || db.assignments.some(a => a.proposalId === id)) return;
  if (expire && (proposal.status !== 'Envoyée' || !proposalPastDue(proposal))) return;
  proposal.status = expire ? 'Expirée' : 'Retirée';
  log('Proposition ' + proposal.status.toLowerCase(), id);
  closeModal();
}

function changeStaffAssignment(id, replace) {
  if (state.role !== 'amo') return;
  const assignment = db.assignments.find(a => a.id === id && ['Confirmée','À revalider'].includes(a.status));
  if (!assignment) return;
  const session = sessionById(assignment.sessionId);
  if (!session || ['Réalisée','Annulée'].includes(session.status)) return;
  if (!replace) {
    if (assignment.status !== 'À revalider') return;
    const block = staffingBlock(session, trainerById(assignment.trainerId), assignment);
    if (block) return flash(block);
  }
  assignment.status = replace ? 'Remplacée' : 'Confirmée';
  if (replace) {
    const previous = db.proposals.find(p => p.id === assignment.proposalId);
    if (previous) previous.status = 'Retirée';
    state.staffTab = 'todo';
    state.selectedSession = session.id;
  }
  log(replace ? 'Affectation libérée pour remplacement' : 'Affectation revalidée', id);
  closeModal();
}

function staffDecisionPanel(kind, id) {
  const assignment = ['replace-staff', 'revalidate-staff'].includes(kind);
  const record = (assignment ? db.assignments : db.proposals).find(item => item.id === id);
  const session = record && sessionById(record.sessionId);
  if (!session) return modalBox('Élément introuvable', '', '');
  const decisions = {
    'replace-staff':['Remplacer le formateur','Libérer le poste puis choisir un autre candidat.',`changeStaffAssignment('${id}',true)`],
    'revalidate-staff':['Revalider l’affectation','Vérifier les disponibilités sur le créneau modifié.',`changeStaffAssignment('${id}',false)`],
    'withdraw-staff':['Retirer la proposition','Archiver la proposition et arrêter le suivi de cette réponse.',`endStaffProposal('${id}',false)`],
    'expire-staff':['Clôturer sans réponse','Archiver la proposition dont le délai est dépassé.',`endStaffProposal('${id}',true)`],
    'confirm-staff':['Confirmer l’affectation','Vérifier la disponibilité et la capacité avant confirmation.',`confirmAssignment('${id}')`],
    'approve-staff':['Autoriser la proposition','La simulation d’envoi reste une action distincte.',`approveProposal('${id}')`]
  };
  const [title,description,action] = decisions[kind];
  return modalBox(title, sessionNoticeText(session), `<p>${description}</p><p><strong>${esc(trainerById(record.trainerId)?.name)}</strong></p>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Annuler</button>
    <button class="primary" onclick="${action}">${title}</button></div>`);
}

function trainerStaffingPanel(id) {
  const trainer = trainerById(id);
  if (!trainer) return modalBox('Formateur introuvable', '', '');
  const sessions = db.sessions.filter(session => !staffingBlock(session, trainer) && !activeProposal(session.id,id));
  const proposals = db.proposals.filter(p => p.trainerId === id && pendingProposalStates.includes(p.status) &&
    !db.assignments.some(assignment => assignment.proposalId === p.id));
  const existing = proposals.map(p => `<div class="line-item"><div class="grow"><strong>${esc(sessionNoticeText(sessionById(p.sessionId)))}</strong>
    <div class="item-sub">${esc(p.status)}</div></div><button class="secondary tiny" onclick="openStaffProposal('${esc(p.id)}')">Voir la proposition</button></div>`).join('');
  return modalBox('Proposer une mission', esc(trainer.name), existing + (sessions.map(session =>
    `<div class="line-item"><div class="grow"><strong>${esc(sessionNoticeText(session))}</strong><div class="item-sub">${esc(session.start+'–'+session.end+' · '+session.city+' · '+session.modality)}</div></div>
      <button class="primary tiny" onclick="startTrainerStaffing(${id},${session.id})">Préparer</button></div>`).join('') ||
    '<p class="empty">Aucun créneau ouvert et compatible. Consultez les disponibilités ou le planning.</p>'));
}

function startTrainerStaffing(trainerId, sessionId) {
  if (state.role !== 'amo') return;
  state.staffTab = 'todo';
  state.selectedSession = sessionId;
  go('staffing');
  prepareProposal(trainerId);
}

function staffSessionMeta(session) {
  return `<span class="item-sub">${esc(fmtDate(session.date) + ' · ' + session.start + '–' + session.end)}</span><span class="item-sub">${esc(session.city + ' · ' + session.modality)}</span>`;
}

function staffJobCard(session, selected) {
  const waiting = db.proposals.filter(p => p.sessionId === session.id && pendingProposalStates.includes(p.status));
  const next = waiting.some(p => p.status === 'Acceptée') ? 'Confirmer une affectation' :
    waiting.some(p => p.status === 'Brouillon') ? 'Autoriser la proposition' :
    waiting.some(p => p.status === 'Autorisée à l’envoi') ? 'Simuler l’envoi' :
    waiting.length ? 'Suivre les réponses' : '';
  const overdue = waiting.some(p => p.status === 'Envoyée' && proposalPastDue(p));
  return `<button type="button" id="ops-session-${session.id}" class="ops-job ${selected?'ops-job-selected':''}"
    aria-pressed="${selected}" onclick="selectStaffSession(${session.id})">
    <span class="ops-job-top">${badge(openCount(session)+(openCount(session)===1?' poste à pourvoir':' postes à pourvoir'))}
    ${mobileIcon(selected?'check':'chevron',16)}</span>
    <strong class="ops-job-title">${esc(clientOf(formOf(session)).name)}</strong>
    <span>${esc(formOf(session).title)}</span>${staffSessionMeta(session)}
    <span class="item-sub">Expertise recherchée · ${esc(session.topic || 'À préciser')}</span>
    ${next?`<span class="ops-next-step">${next}${overdue?' · Délai dépassé':''}</span>`:''}
  </button>`;
}

function animateStaffingResults() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelector('.ops-staffing [data-ops-results]')?.animate?.(
    [{opacity:.65,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
}

function selectStaffSession(id, focusId='ops-session-'+id) {
  if(state.selectedSession===id){
    $('ops-candidates')?.focus();
    return;
  }
  state.selectedSession = id;
  state.candidate = null;
  render();
  $(focusId)?.focus({preventScroll:true});
  animateStaffingResults();
}

function changeStaffComparison(field, value, control) {
  state.staffFiltersOpen = $('ops-compare-filters')?.open || false;
  state[field] = value;
  render();
  $(control)?.focus({preventScroll:true});
  animateStaffingResults();
}

function staffProposalCard(proposal) {
  const session = sessionById(proposal.sessionId);
  if (!session) return '';
  const overdue = proposal.status === 'Envoyée' && proposalPastDue(proposal);
  const assigned = db.assignments.some(a => a.proposalId===proposal.id && ['Confirmée','Réalisée','À revalider'].includes(a.status));
  const active = !assigned && pendingProposalStates.includes(proposal.status);
  const trainer = trainerById(proposal.trainerId);
  const block = active && proposal.status !== 'Envoyée' ? staffingBlock(session, trainer) :
    proposal.status === 'Envoyée' && trainer ? calendarConflict(session,trainer.id,{sessionId:session.id,allowAvailable:true}) : '';
  const next = {'Brouillon':'Autorisation AMO requise','Autorisée à l’envoi':'Envoi simulé à déclencher',
    'Envoyée':overdue?'Réponse en retard':'En attente du formateur','Acceptée':'Affectation à décider'}[proposal.status];
  const id = esc(proposal.id);
  return `<article class="ops-proposal" id="staff-proposal-${id}" tabindex="-1">
    <div class="ops-card-heading"><div><h3>${trainerName(trainer)}</h3><p>${esc(clientOf(formOf(session)).name+' · '+formOf(session).title)}</p></div>${badge(assigned?'Affectée':proposal.status)}</div>
    ${staffSessionMeta(session)}<p>${esc(proposal.conditions || 'Conditions à préciser')} · ${id}</p>
    ${active&&next?`<p class="ops-next-step">${next}${proposal.expires&&proposal.status==='Envoyée'?' · Échéance '+fmtDate(proposal.expires):''}</p>`:''}
    ${block?`<p class="ops-block">${esc(block)}</p>`:''}
    <div class="ops-actions">
      ${active&&!block&&proposal.status==='Brouillon'?`<button class="primary tiny" onclick="openModal('approve-staff','${id}')">Autoriser</button>`:''}
      ${active&&!block&&proposal.status==='Autorisée à l’envoi'?`<button class="primary tiny" onclick="sendProposal('${id}')">Simuler l’envoi</button>`:''}
      ${active&&!block&&proposal.status==='Acceptée'?`<button class="primary tiny" onclick="openModal('confirm-staff','${id}')">Confirmer</button>`:''}
      ${overdue?`<button class="secondary tiny" onclick="openModal('expire-staff','${id}')">Clôturer sans réponse</button>`:''}
      ${active?`<button class="ghost tiny" onclick="openModal('withdraw-staff','${id}')">Retirer</button>`:''}
      <button class="secondary tiny" onclick="openModal('whatsapp-draft','${id}')">Brouillon WhatsApp</button>
    </div></article>`;
}

function operationsStaffingPage() {
  const open = db.sessions.filter(s => !['Réalisée','Annulée'].includes(s.status) && openCount(s))
    .sort((a,b) => a.date.localeCompare(b.date));
  const assignments = db.assignments.filter(a => ['Confirmée','À revalider'].includes(a.status));
  const assigned = new Set(assignments.map(a => a.proposalId));
  const pending = db.proposals.filter(p => pendingProposalStates.includes(p.status) && !assigned.has(p.id));
  const archived = db.proposals.filter(p => !pending.includes(p));
  const selected = open.find(s => s.id === state.selectedSession) || open[0];
  const tabs = [['todo','À staffer',open.length],['proposals','Propositions en cours',pending.length],['confirmed','Confirmées',assignments.filter(a=>a.status==='Confirmée').length]];
  let content = '<p class="empty">Toutes les sessions ont une équipe complète.</p>';
  if (state.staffTab === 'proposals') {
    const target = archived.some(p=>p.id===state.staffNoticeProposal);
    content = `<section class="ops-stack" data-ops-results aria-label="Propositions actives">${pending.map(staffProposalCard).join('')||'<p class="empty">Aucune proposition active.</p>'}</section>
      <details class="ops-archive"${target?' open':''}><summary>Historique · ${archived.length}</summary><div class="ops-stack">${archived.map(staffProposalCard).join('')||'<p class="empty">Aucune proposition archivée.</p>'}</div></details>`;
  } else if (state.staffTab === 'confirmed') {
    content = `<section class="ops-stack" data-ops-results aria-label="Affectations">${assignments.map(assignment => {
      const session = sessionById(assignment.sessionId);
      if (!session) return '';
      const active = !['Réalisée','Annulée'].includes(session.status);
      const id = esc(assignment.id);
      return `<article class="ops-proposal"><div class="ops-card-heading"><div><h3>${trainerName(trainerById(assignment.trainerId))}</h3><p>${esc(clientOf(formOf(session)).name+' · '+formOf(session).title)}</p></div>${badge(assignment.status)}</div>
        ${staffSessionMeta(session)}<div class="ops-actions"><button class="ghost tiny" onclick="openSession(${session.id})">Voir la session</button>
        ${active&&assignment.status==='À revalider'?`<button class="primary tiny" onclick="openModal('revalidate-staff','${id}')">Revalider</button>`:''}
        ${active?`<button class="secondary tiny" onclick="openModal('replace-staff','${id}')">Remplacer</button>`:''}</div></article>`;
    }).join('')||'<p class="empty">Aucune affectation confirmée.</p>'}</section>`;
  } else if (selected) {
    state.selectedSession = selected.id;
    const candidates = trainers.map(t => trainerById(t.id)).filter(t => !staffingBlock(selected,t) && !activeProposal(selected.id,t.id))
      .map(t => ({t, score:compatDetails(t,selected), experience:candidateExperience(t,selected), nps:trainerNpsValue(t.id)}))
      .sort((a,b) => {
        if (state.staffCandidates === 'rate' && a.t.rate!==b.t.rate) return a.t.rate-b.t.rate;
        if (state.staffCandidates === 'nps') {
          const difference=(b.nps ?? -Infinity)-(a.nps ?? -Infinity);
          if(difference)return difference;
        }
        return (b.score.total??-1)-(a.score.total??-1) || Number(b.experience.verified)-Number(a.experience.verified) || b.experience.sameClient-a.experience.sameClient;
      });
    const ratings = [...new Set(candidates.map(({t})=>t.rating).filter(Boolean))];
    const rating = ratings.includes(state.staffRating)?state.staffRating:'';
    const shown = candidates.filter(({t})=>(!state.staffLocal||t.city===selected.city)&&(!rating||t.rating===rating));
    content = `<div class="ops-staff-grid"><section class="ops-stack ops-session-list" aria-label="Sessions à staffer">
      <label class="ops-session-switch" for="ops-session-switch">Session à examiner</label>
      <select class="field ops-session-switch" id="ops-session-switch" onchange="selectStaffSession(Number(this.value),this.id)">
        ${open.map(s=>`<option value="${s.id}" ${s===selected?'selected':''}>${esc(clientOf(formOf(s)).name+' · '+fmtDate(s.date))}</option>`).join('')}
      </select>
      ${open.map(s=>staffJobCard(s,s===selected)).join('')}</section>
      <section class="card ops-candidates" id="ops-candidates" tabindex="-1"><header class="ops-card-heading"><div><h2>Formateurs suggérés</h2><p>${esc(formOf(selected).title)}</p></div>
      </header>
        <div class="ops-compare">
          <label for="ops-candidate-filter">Trier par</label>
          <select class="field" id="ops-candidate-filter" onchange="changeStaffComparison('staffCandidates',this.value,this.id)">
            ${[['rank','Compatibilité'],['rate','TJM croissant'],['nps','NPS décroissant']].map(([k,v])=>`<option value="${k}" ${state.staffCandidates===k?'selected':''}>${v}</option>`).join('')}
          </select>
          <details id="ops-compare-filters" class="ops-compare-filters" ontoggle="if(this.isConnected)state.staffFiltersOpen=this.open" ${state.staffFiltersOpen?'open':''}>
            <summary>Filtres${rating||state.staffLocal?' · '+(Number(Boolean(rating))+Number(Boolean(state.staffLocal))):''}</summary>
            <div class="ops-filter-options">
              <label for="ops-candidate-rating">Statut</label>
              <select class="field" id="ops-candidate-rating" onchange="changeStaffComparison('staffRating',this.value,this.id)">
                <option value="">Tous les statuts</option>${ratings.map(value=>`<option value="${esc(value)}" ${rating===value?'selected':''}>${esc(value)}</option>`).join('')}
              </select>
              <label class="ops-local-filter"><input type="checkbox" id="ops-candidate-local" ${state.staffLocal?'checked':''} onchange="changeStaffComparison('staffLocal',this.checked,this.id)"> Même ville que la session</label>
            </div>
          </details>
        </div>
        <div data-ops-results>${shown.map(({t,score,experience,nps})=>staffingCandidateCard(t,selected,score,experience,nps)).join('')||`<p class="empty">${candidates.length?'Aucun profil ne correspond aux filtres sélectionnés.':'Aucun candidat disponible pour ce créneau.'}</p>`}</div>
        <div class="ops-actions"><button class="secondary tiny" onclick="openSession(${selected.id})">Voir la fiche session</button></div>
      </section></div>`;
  }
  return `<section class="ops-staffing">${intro('Staffing <em>assisté.</em>','Sélection des candidats, propositions et affectations de démonstration.')}
    <div class="ops-tabs" role="group" aria-label="Étape du staffing">${tabs.map(([key,label,count])=>`<button aria-pressed="${state.staffTab===key}" id="ops-stage-${key}" onclick="state.staffNoticeProposal=null;changeStaffComparison('staffTab','${key}',this.id)">${label}<small>${count}</small></button>`).join('')}</div>
    ${content}</section>`;
}

function recordReminderResolution() {
  const documents = new Map(db.deliverables.map(d => [d.id,d]));
  let sent = 0, changed = false;
  for (const reminder of db.reminders.slice()) {
    if (reminder.channel !== 'PWA' || ['Annulée','Terminée'].includes(reminder.followUp)) continue;
    const document = documents.get(reminder.deliverableId);
    const alreadySent = db.reminders.some(other => other.deliverableId === reminder.deliverableId && other.channel === 'WhatsApp');
    if (alreadySent) {
      reminder.followUp = 'Terminée';
    } else if (!document || document.versions?.length || document.status !== 'À fournir') {
      reminder.followUp = 'Annulée';
    } else if (Date.now() - Date.parse(reminder.at) >= 48*3600000) {
      reminder.followUp = 'Terminée';
      db.reminders.push({id:'WA-'+reminder.id, deliverableId:reminder.deliverableId, channel:'WhatsApp',
        status:'Automatisation simulée — aucun envoi', at:new Date().toISOString()});
      sent++;
    } else continue;
    changed = true;
  }
  if (changed) save();
  return sent;
}

function candidateExperience(trainer, session) {
  const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const verified = trainer.verified?.some(skill=>normalize(skill)===normalize(session.topic)) || false;
  const finished = db.assignments.filter(a=>a.trainerId===trainer.id && a.status==='Réalisée');
  const clientId = formOf(session).clientId;
  return {verified, finished:finished.length, similar:finished.some(a=>normalize(sessionById(a.sessionId)?.topic)===normalize(session.topic))&&Boolean(session.topic), sameClient:finished.filter(a=>
    formOf(sessionById(a.sessionId) || {})?.clientId===clientId).length};
}

function mobilitySummary(trainer, session) {
  const mobility = db.profiles?.[trainer.id]?.mobility?.trim();
  if (['Visio','Distanciel'].includes(session.modality)) return 'Mission à distance';
  if (trainer.city === session.city) return 'Même ville';
  return mobility ? 'Mobilité déclarée : ' + mobility : 'Mobilité à confirmer';
}

function personalPunctuality(trainerId) {
  const documents = db.deliverables.filter(d=>d.owner==='formateur' && d.trainerId===trainerId &&
    d.dueDate && d.versions?.[0]?.at);
  const onTime = documents.filter(d=>d.versions[0].at.slice(0,10)<=d.dueDate).length;
  return documents.length ? onTime+' sur '+documents.length+' premiers dépôts datés à l’heure' : 'Aucun dépôt daté exploitable';
}

function communicableMissionRatings(trainerId) {
  const ratings = db.assignments.filter(a=>a.trainerId===trainerId)
    .map(a=>({session:sessionById(a.sessionId),rating:missionRatings[a.id]}))
    .filter(({session,rating})=>session && rating?.public===true && Number.isFinite(rating.score));
  return `<h3>Évaluations communicables</h3>${ratings.map(({session,rating})=>`<div class="line-item">
    <div class="grow"><strong>${esc(formOf(session).title)}</strong><div class="item-sub">${fmtDate(session.date)}</div></div>
    ${badge(rating.score+'/10 · démo')}</div>`).join('')||'<p class="item-sub">Aucune évaluation communicable enregistrée.</p>'}`;
}

function professionalFacts(trainer, details) {
  const p = db.profiles?.[trainer.id] || {};
  return [
    ['Expertises déclarées', trainer.skills], ['Expertises vérifiées', trainer.verified],
    ['Expériences', details.experience], ['Compétences et connaissances', details.knowledge],
    ['Formations', p.education || details.education], ['Projets', p.projects || details.projects],
    ['LLM et outils maîtrisés', details.llm], ['Préférences de déplacement', p.mobility]
  ];
}

function professionalFactCard(label, value) {
  const text = Array.isArray(value) ? value.filter(Boolean).join(' · ') : value;
  return `<div class="info"><small>${esc(label)}</small><p>${esc(text || 'Non renseigné')}</p></div>`;
}

function trainerOperationalAvailability(trainer) {
  const upcoming = db.assignments.filter(a=>a.trainerId===trainer.id && ['Confirmée','À revalider'].includes(a.status))
    .map(a=>({assignment:a,session:sessionById(a.sessionId)}))
    .filter(({session})=>session && session.date>=parisToday() && session.status!=='Annulée')
    .sort((a,b)=>a.session.date.localeCompare(b.session.date));
  const slots = db.availability.filter(a=>a.trainerId===trainer.id)
    .sort((a,b)=>a.date.localeCompare(b.date) || (a.start||'').localeCompare(b.start||''));
  return `<section class="ops-profile-section"><h2>Prochaines missions</h2>
    ${upcoming.map(({assignment,session})=>`<div class="line-item"><div class="grow"><strong>${esc(sessionNoticeText(session))}</strong>${staffSessionMeta(session)}</div>${badge(assignment.status)}
      <button class="secondary tiny" onclick="openSession(${session.id})">Voir la session</button></div>`).join('')||'<p class="item-sub">Aucune mission à venir enregistrée.</p>'}</section>
    <section class="ops-profile-section"><h2>Disponibilités déclarées</h2>${availabilityBadge(trainer)}
    <div class="info-grid av2-summary-preferences">${window.availabilityPreferenceSummary?.(trainer.id)||''}</div>
    ${slots.map(a=>`<div class="line-item"><div class="grow"><strong>${fmtDate(a.date)}</strong><span class="item-sub">${esc(a.start&&a.end?a.start+'–'+a.end:'Toute la journée')}</span></div>${badge(a.status)}</div>`).join('')||'<p class="item-sub">Aucun créneau déclaré.</p>'}</section>`;
}

function saveIncidentFollowUp(id, verify = false) {
  if (state.role !== 'amo') return;
  const incident = db.internalReviews.find(r=>r.id===id&&isActiveCarton(r)&&r.trainerId===state.selectedTrainer);
  const note = $('incident-'+id)?.value.trim();
  if (!incident || !note || note.length<10) return flash('Précisez l’action corrective en au moins 10 caractères.');
  incident.followUps ||= [];
  if (verify && incident.verified) return;
  incident.followUps.push({note,verification:verify,at:new Date().toISOString()});
  if (verify) incident.verified = true;
  log(verify?'Vérification interne d’un incident':'Suivi interne d’un incident',id);
  render();
  flash(verify?'Incident vérifié avec justificatif.':'Action corrective ajoutée à l’historique interne.');
}

function incidentFollowUp(record) {
  if (record.kind!=='carton') return '';
  const id = esc(record.id);
  return `<details class="ops-incident"><summary>Actions correctives · ${record.followUps?.length||0}</summary>
    ${(record.followUps||[]).map(action=>`<p>${esc(fmtDate(action.at.slice(0,10)))} · ${action.verification?'Vérification · ':''}${esc(action.note)}</p>`).join('')}
    ${isActiveCarton(record)?`<label class="form-label" for="incident-${id}">Nouvelle action corrective</label>
    <textarea class="field" id="incident-${id}" rows="2" maxlength="1000"></textarea>
    <button class="secondary tiny" onclick="saveIncidentFollowUp('${id}')">Ajouter au suivi</button>
    ${record.verified?'':`<button class="secondary tiny" onclick="saveIncidentFollowUp('${id}',true)">Vérifier avec ce justificatif</button>`}`: ''}
  </details>`;
}

const operationalDecisions = ['replace-staff','revalidate-staff','withdraw-staff','expire-staff','confirm-staff','approve-staff'];
function isOperationalModal(kind) {
  return ['amo-notifications','trainer-notifications','agenda-conflicts','agenda-formation','hub-search','trainer-staffing','prepare-proposal','matching','whatsapp-draft',
    ...operationalDecisions].includes(kind);
}

let opsClicked, opsPreviousModal, opsReturnFocus;
document.addEventListener('click',event=>{
  const button = event.target.closest?.('button');
  if(!button)return;
  opsClicked = button.getAttribute('onclick');
  setTimeout(()=>{opsClicked=null},0);
},true);

function syncOperationalFocus() {
  const dialog = document.querySelector('.ops-modal');
  const previous = opsPreviousModal;
  opsPreviousModal = state.modal?.kind;
  if (dialog) {
    if (!previous || !isOperationalModal(previous)) opsReturnFocus = opsClicked;
    const background = document.querySelector('#app > .app');
    if (background) background.inert = true;
    const dock = document.querySelector('.mobile-dock');
    if (dock) dock.inert = true;
    document.documentElement.classList.add('ops-dialog-open');
    const title = dialog.querySelector('h2');
    if (title) {
      title.tabIndex = -1;
      title.id = 'ops-dialog-title';
      dialog.setAttribute('aria-labelledby',title.id);
      title.focus({preventScroll:true});
    }
    return;
  }
  document.documentElement.classList.remove('ops-dialog-open');
  if (previous && isOperationalModal(previous) && opsReturnFocus && !state.modal) {
    const button = [...document.querySelectorAll('button[onclick]')].find(el=>
      el.getAttribute('onclick')===opsReturnFocus && el.getClientRects().length);
    button?.focus({preventScroll:true});
    opsReturnFocus = null;
  }

}
document.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const dialog=document.querySelector('.ops-modal');
  if(!dialog)return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,summary')]
    .filter(node=>node.getClientRects().length&&node.tabIndex>=0);
  const active=document.activeElement,first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&(active===first||!controls.includes(active))){
    event.preventDefault();
    last?.focus();
  }else if(!event.shiftKey&&(active===last||!controls.includes(active))){
    event.preventDefault();
    first?.focus();
  }
});

let inboxSwipe;
document.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='touch'||!event.isPrimary||!matchMedia('(max-width: 640px)').matches)return;
  if(event.target.closest('button:not(.ops-notice-card),input,select,summary,label,details'))return;
  const card=event.target.closest('.ops-inbox-list:not(.ops-inbox-selecting) .ops-notice');
  if(card)inboxSwipe={card,id:event.pointerId,x:event.clientX,y:event.clientY,active:false};
});

document.addEventListener('pointermove',event=>{
  const swipe=inboxSwipe;
  if(swipe?.id!==event.pointerId)return;
  const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
  if(!swipe.active){
    if(Math.abs(dy)>10&&Math.abs(dy)>=Math.abs(dx)){inboxSwipe=null;return}
    if(Math.abs(dx)<12||Math.abs(dx)<=Math.abs(dy))return;
    swipe.active=true;
    swipe.card.setPointerCapture(event.pointerId);
  }
  swipe.card.dataset.swipe=dx<0?'delete':'unread';
  swipe.card.style.setProperty('--ops-swipe-x',Math.max(-130,Math.min(130,dx))+'px');
});

function finishInboxSwipe(event) {
  const swipe=inboxSwipe;
  if(swipe?.id!==event.pointerId)return;
  inboxSwipe=null;
  const dx=event.clientX-swipe.x;
  const dy=event.clientY-swipe.y;
  if(event.type==='pointerup'&&swipe.active&&Math.abs(dx)>=85&&Math.abs(dx)>Math.abs(dy)*1.3){
    updateInboxNotices(dx<0?'delete':'unread',swipe.card.dataset.noticeKey);
    if(dx<0)return;
  }
  delete swipe.card.dataset.swipe;
  swipe.card.style.removeProperty('--ops-swipe-x');
}
document.addEventListener('pointerup',finishInboxSwipe);
document.addEventListener('pointercancel',finishInboxSwipe);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)refreshOperationalInbox();
});


function activeAgendaConflicts() {
  const today=parisToday();
  const sessions=db.sessions.filter(session=>session.date>=today&&!['Annulée','Réalisée'].includes(session.status))
    .sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  const shared=(db.calendarEvents||[]).filter(event=>event.trainerId===null);
  const issues=[];
  for(const [index,session] of sessions.entries()){
    for(const other of sessions.slice(index+1)){
      if(!agendaEntriesOverlap(session,other))continue;
      issues.push({session,title:'Deux sessions se chevauchent sur l’agenda AMO',detail:sessionNoticeText(other),
        action:`openSession(${other.id})`,label:'Voir l’autre session'});
    }
    for(const event of shared){
      if(agendaEntriesOverlap(session,event))issues.push({
        session,title:'Session et événement AMO au même créneau',
        detail:event.title||'Événement AMO',action:`openModal('reschedule',${session.id})`,label:'Reporter la session'
      });
    }
    const trainersById=new Map();
    for(const entry of db.proposals){
      if(entry.sessionId===session.id&&(['Acceptée','Envoyée'].includes(entry.status))&&
        !(entry.status==='Envoyée'&&proposalPastDue(entry)))trainersById.set(entry.trainerId,entry);
    }
    for(const entry of db.assignments){
      if(entry.sessionId===session.id&&['Confirmée','À revalider'].includes(entry.status))trainersById.set(entry.trainerId,null);
    }
    for(const [trainerId,proposal] of trainersById){
      const detail=calendarConflict(session,trainerId,{sessionId:session.id,allowAvailable:true,maskPrivate:true});
      if(!detail)continue;
      issues.push({
        session,title:(trainerById(trainerId)?.name||'Formateur')+' · '+(proposal?'proposition':'affectation'),
        detail,action:proposal?`openStaffProposal('${esc(proposal.id)}')`:`openModal('reschedule',${session.id})`,
        label:proposal?'Voir la proposition':'Reporter la session'
      });
    }
  }
  return issues;
}

function agendaConflictCell() {
  const count=activeAgendaConflicts().length;
  const summary=count?count+(count===1?' conflit à vérifier':' conflits à vérifier'):'Aucun conflit détecté';
  return `<section class="card ops-agenda-conflicts">
    <div><h2 class="section-title">Gestion des conflits</h2><p class="item-sub">${summary} sur les sessions à venir.</p></div>
    <button class="secondary tiny" onclick="openModal('agenda-conflicts')">Voir les conflits</button></section>`;
}

function agendaConflictPanel() {
  return modalBox('Gestion des conflits','Chevauchements détectés sur les sessions à venir.',activeAgendaConflicts().map(issue=>
    `<section class="line-item ops-conflict-entry"><div class="grow"><strong>${esc(issue.title)}</strong>
      <div class="item-sub">${esc(sessionNoticeText(issue.session))} · ${esc(issue.session.start+'–'+issue.session.end)}</div>
      <p class="item-sub">${esc(issue.detail)}</p></div>
      <div class="ops-actions"><button class="ghost tiny" onclick="openSession(${issue.session.id})">Voir la session</button>
      <button class="secondary tiny" onclick="${issue.action}">${issue.label}</button></div></section>`).join('')||
    '<p class="empty">Aucun conflit détecté sur les sessions à venir.</p>');
}

const inviteResponses = {pending:'En attente',yes:'Oui',maybe:'Peut-être',no:'Non'};

function agendaGuestRow(guest={}) {
  return `<div class="ops-agenda-guest">
    <label>E-mail de l’invité<input class="field" type="email" name="guestEmail" value="${esc(guest.email)}" required></label>
    <label>Réponse<select class="field" name="guestReply">${Object.entries(inviteResponses).map(([key,label])=>
      `<option value="${key}" ${guest.reply===key?'selected':''}>${label}</option>`).join('')}</select></label>
    <button type="button" class="ghost tiny" aria-label="Retirer cet invité" onclick="this.closest('.ops-agenda-guest').remove()">${mobileIcon('close',16)}</button>
  </div>`;
}

function addAgendaGuest() {
  const guests=$('agenda-guest-list');
  guests.insertAdjacentHTML('beforeend',agendaGuestRow());
  guests.lastElementChild.querySelector('input').focus();
}

function agendaFormationFields(current, enabled) {
  return `<fieldset id="agenda-formation-fields" class="ops-agenda-formation" ${enabled?'':'hidden disabled'}>
    <legend>Détails de la formation</legend>
    <div class="form-grid">
      <label class="profile-wide">Lien Google Meet<input class="field" name="meet" type="text" inputmode="url" placeholder="meet.google.com/…" value="${esc(current?.meet)}"></label>
      <label>Participer par téléphone<input class="field" name="dial" type="tel" value="${esc(current?.dial)}"></label>
      <label>Code d’accès<input class="field" name="dialPin" type="text" value="${esc(current?.dialPin)}"></label>
      <label class="profile-wide">Lien vers les autres numéros<input class="field" name="dialNumbers" type="text" inputmode="url" placeholder="tel.meet/…" value="${esc(current?.dialNumbers)}"></label>
      <label>Lieu<input class="field" name="location" value="${esc(current?.location)}"></label>
      <label>Adresse<input class="field" name="address" value="${esc(current?.address)}"></label>
      <label class="profile-wide">Organisateur<input class="field" type="email" name="organizer" value="${esc(current?.organizer||'contact@certif-ia.fr')}" required></label>
    </div>
    <div class="ops-agenda-guests-heading"><h3>Invités</h3><button type="button" class="secondary tiny" onclick="addAgendaGuest()">Ajouter un invité</button></div>
    <div id="agenda-guest-list">${(current?.guests||[]).map(agendaGuestRow).join('')}</div>
    <p class="item-sub">Les réponses sont saisies dans le Hub. Les invitations ne sont pas envoyées.</p>
  </fieldset>`;
}

function googleMeetingLink(raw, hosts) {
  if(!raw)return '';
  try{
    const url=new URL(raw.includes('://')?raw:'https://'+raw);
    if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&hosts.includes(url.hostname)&&url.pathname!=='/')return url.href;
  }catch{}
  return null;
}

function readAgendaFormation(data) {
  const value=key=>String(data.get(key)||'').trim();
  const meet=googleMeetingLink(value('meet'),['meet.google.com']);
  if(meet===null)return {error:'Saisissez un lien HTTPS vers meet.google.com.'};
  const dialNumbers=googleMeetingLink(value('dialNumbers'),['tel.meet','meet.google.com']);
  if(dialNumbers===null)return {error:'Saisissez un lien HTTPS Google Meet pour les autres numéros.'};
  const dial=value('dial'),dialPin=value('dialPin');
  if(dial&&!/^\+?[\d().\s-]+$/.test(dial))return {error:'Saisissez un numéro de téléphone valide.'};
  if(dialPin&&(!dial||!/^\d[\d\s]*#?$/.test(dialPin)))return {error:'Associez le code à un numéro de téléphone valide.'};
  const organizer=value('organizer');
  if(!organizer)return {error:'Renseignez l’organisateur.'};
  const seen=new Set([organizer.toLowerCase()]);
  const replies=data.getAll('guestReply');
  const guests=[];
  for(const [index,input] of data.getAll('guestEmail').entries()){
    const email=String(input).trim();
    if(!email||seen.has(email.toLowerCase()))return {error:'Chaque invité doit avoir une adresse distincte de celle de l’organisateur et des autres invités.'};
    seen.add(email.toLowerCase());
    const reply=replies[index];
    guests.push({email,reply:Object.hasOwn(inviteResponses,reply)?reply:'pending'});
  }
  return {eventType:'formation',meet,dial,dialPin,dialNumbers,location:value('location'),address:value('address'),organizer,guests};
}

function agendaFormationDetails(id) {
  const entry=(db.calendarEvents||[]).find(e=>e.id===id&&e.trainerId===null&&e.eventType==='formation');
  if(!entry)return modalBox('Formation introuvable','','');
  const guests=entry.guests||[];
  const yes=1+guests.filter(guest=>guest.reply==='yes').length;
  const tel=entry.dial?.replace(/[^+\d]/g,'');
  const time=`${fmtDate(entry.date,{weekday:'long',day:'numeric',month:'long'})} · ${entry.start}–${entry.end}`;
  return modalBox(esc(entry.title),time,`<div class="ops-agenda-details">
    ${entry.meet||tel||entry.dialNumbers?`<section><h3>Participer</h3>
      ${entry.meet?linkSafe(entry.meet,entry.meet.replace(/^https:\/\//,'')):''}
      ${tel?`<div><span>Par téléphone · </span>${safeContact(entry.dial,'phone')}${entry.dialPin?` · Code : ${esc(entry.dialPin)}`:''}</div>`:''}
      ${entry.dialNumbers?linkSafe(entry.dialNumbers,'Plus de numéros de téléphone'):''}</section>`:''}
    ${entry.location||entry.address?`<section><h3>Lieu</h3><strong>${esc(entry.location)}</strong>
      ${entry.address?`<div>${linkSafe(mapsUrl(entry.address,''),entry.address)}</div>`:''}</section>`:''}
    <section><h3>Participants</h3><p class="item-sub">${guests.length+1} participant${guests.length?'s':''} · ${yes} oui</p>
      <ul><li>${safeContact(entry.organizer,'email')} <span class="item-sub">Organisateur</span></li>
      ${guests.map(guest=>`<li>${safeContact(guest.email,'email')} <span class="item-sub">${inviteResponses[guest.reply]||inviteResponses.pending}</span></li>`).join('')}</ul></section>
    </div>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button>
    <button class="primary" onclick="openCalendarEvent('${entry.date}','${esc(entry.id)}',false,true)">Modifier la formation</button></div>`);
}
