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
    if (['Envoyée', 'Acceptée'].includes(proposal.status) &&
        calendarConflict(session, proposal.trainerId, { sessionId: session.id, allowAvailable: true })) {
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
  return Object.values(db.operationalNotices?.[noticeRecipient()] || {}).reverse();
}

function notificationBell() {
  const count = inboxItems().filter(notice => !notice.read).length;
  return `<button class="mobile-bell ops-bell" data-ops-trigger="notifications" aria-label="Notifications${count ? ' · '+count+' non lue(s)' : ''}" aria-haspopup="dialog" onclick="openOperationsInbox()">${mobileIcon('bell', 20)}${count ? `<span class="ops-unread-count" aria-hidden="true">${count}</span>` : ''}</button>`;
}

function openOperationsInbox() {
  state.noticeType = 'all';
  state.noticeUnread = false;
  openModal(state.role === 'amo' ? 'amo-notifications' : 'trainer-notifications');
}

function readOperationsNotice(event, follow = false) {
  const items = inboxItems();
  const item = items.find(notice => notice.event === event);
  if (event !== null && !item) return;
  if (item) item.read = true;
  else items.forEach(notice => { notice.read = true; });
  save();
  if (!follow) return render();
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

function operationsInboxPanel() {
  const items = inboxItems();
  const unread = items.filter(item => !item.read).length;
  const filtered = items.filter(item =>
    (!state.noticeUnread || !item.read) && (state.noticeType === 'all' || state.noticeType === item.type));
  return modalBox('Centre de notifications', `${unread} non lue(s) · historique de démonstration`, `
    <div class="ops-inbox-controls">
      <div><label for="ops-notice-type">Type</label><select id="ops-notice-type" class="field" onchange="setOperationsNoticeFilter('noticeType',this.value,this.id)">
        <option value="all">Tous les types</option>${Object.entries(noticeTypes).map(([key,label]) => `<option value="${key}" ${state.noticeType===key?'selected':''}>${label}</option>`).join('')}
      </select></div>
      <label><input id="ops-notice-unread" type="checkbox" ${state.noticeUnread?'checked':''} onchange="setOperationsNoticeFilter('noticeUnread',this.checked,this.id)"> Non lues uniquement</label>
      <button class="secondary tiny" onclick="readOperationsNotice(null)" ${unread?'':'disabled'}>Tout marquer comme lu</button>
    </div>
    <ul class="ops-inbox-list">${filtered.map(item => `<li class="ops-notice ${item.read?'':'ops-notice-unread'}">
      <div><span class="ops-notice-type" data-type="${item.type}">${noticeTypes[item.type]}</span><span class="item-sub">${fmtDate(item.at.slice(0,10))} · ${item.read?'Lue':'Non lue'}</span></div>
      <h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p>
      <div class="ops-actions"><button class="secondary tiny" data-notice-key="${esc(item.event)}" onclick="readOperationsNotice(this.dataset.noticeKey,true)">Ouvrir</button>${item.read?'':`<button class="ghost tiny" data-notice-key="${esc(item.event)}" onclick="readOperationsNotice(this.dataset.noticeKey)">Marquer comme lue</button>`}</div>
    </li>`).join('') || '<li class="empty">Aucune notification pour ces filtres.</li>'}</ul>`);
}

function setOperationsNoticeFilter(key, value, id) {
  state[key] = value;
  render();
  $(id)?.focus({preventScroll:true});
}

function refreshOperationalInbox() {
  if (!syncOperationalNotices()) return;
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
    waiting.length ? 'Suivre les réponses' : 'Choisir un candidat';
  return `<article class="ops-job ${selected?'ops-job-selected':''}">
    <div>${badge(openCount(session)+(openCount(session)===1?' poste à pourvoir':' postes à pourvoir'))}<h3>${esc(clientOf(formOf(session)).name)}</h3>
    <p>${esc(formOf(session).title)}</p>${staffSessionMeta(session)}
    <span class="item-sub">Expertise recherchée · ${esc(session.topic || 'À préciser')}</span></div>
    <button class="secondary tiny" aria-pressed="${selected}" onclick="${selected?"document.getElementById('ops-candidates').focus()":'selectStaffSession('+session.id+')'}">${selected?'Voir les candidats':'Choisir cette session'}</button>
    <p class="ops-next-step">${next}${waiting.some(p => p.status==='Envoyée' && proposalPastDue(p))?' · Délai dépassé':''}</p>
  </article>`;
}

function selectStaffSession(id) {
  state.selectedSession = Number(id);
  state.candidate = null;
  render();
  const selector=$('ops-session-switch');
  if(selector?.getClientRects().length)selector.focus({preventScroll:true});
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
    content = `<section class="ops-stack" aria-label="Propositions actives">${pending.map(staffProposalCard).join('')||'<p class="empty">Aucune proposition active.</p>'}</section>
      <details class="ops-archive"${target?' open':''}><summary>Historique · ${archived.length}</summary><div class="ops-stack">${archived.map(staffProposalCard).join('')||'<p class="empty">Aucune proposition archivée.</p>'}</div></details>`;
  } else if (state.staffTab === 'confirmed') {
    content = `<section class="ops-stack" aria-label="Affectations">${assignments.map(assignment => {
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
      .map(t => ({t, score:compatDetails(t,selected), experience:candidateExperience(t,selected)})).sort((a,b) => {
        if (state.staffCandidates === 'rate') return a.t.rate-b.t.rate || b.score.total-a.score.total;
        return b.score.total-a.score.total || Number(b.experience.verified)-Number(a.experience.verified) || b.experience.sameClient-a.experience.sameClient;
      });
    const shown = state.staffCandidates === 'local' ? candidates.filter(({t}) => t.city===selected.city) : candidates;
    content = `<div class="ops-staff-grid"><section class="ops-stack" aria-label="Sessions à staffer"><label class="ops-session-switch">Session à examiner
      <select class="field" id="ops-session-switch" onchange="selectStaffSession(this.value)">${open.map(s=>`<option value="${s.id}" ${s===selected?'selected':''}>${esc(clientOf(formOf(s)).name+' · '+fmtDate(s.date))}</option>`).join('')}</select></label>
      ${open.map(s=>staffJobCard(s,s===selected)).join('')}</section>
      <section class="card ops-candidates" id="ops-candidates" tabindex="-1"><header class="ops-card-heading"><div><h2>Formateurs suggérés</h2><p>${esc(formOf(selected).title)}</p></div>
        <label>Comparer <select class="field" id="ops-candidate-filter" onchange="changeTab('staffCandidates',this.value)">
          ${[['rank','Compatibilité'],['local','Même ville'],['rate','TJM croissant']].map(([k,v])=>`<option value="${k}" ${state.staffCandidates===k?'selected':''}>${v}</option>`).join('')}
        </select></label></header>
        <p class="item-sub">Score indicatif sur données de démonstration. La sélection et la validation restent à la charge de l’AMO.</p>
        ${shown.map(({t,score,experience})=>staffingCandidateCard(t,selected,score,experience)).join('')||'<p class="empty">Aucun candidat pour ce filtre. Vérifiez les déclarations et les conflits dans le planning.</p>'}
        <div class="ops-actions"><button class="secondary tiny" onclick="openSession(${selected.id})">Voir la fiche session</button>
        <button class="ghost tiny" onclick="state.calendarDate='${selected.date}';go('planning')">Vérifier le planning</button></div>
      </section></div>`;
  }
  return `<section class="ops-staffing">${intro('Staffing <em>assisté.</em>','Sélection des candidats, propositions et affectations de démonstration.')}
    <div class="ops-tabs" role="group" aria-label="Étape du staffing">${tabs.map(([key,label,count])=>`<button aria-pressed="${state.staffTab===key}" onclick="state.staffNoticeProposal=null;changeTab('staffTab','${key}')">${label}<small>${count}</small></button>`).join('')}</div>
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
  return {verified, finished:finished.length, sameClient:finished.filter(a=>
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
    <p class="item-sub">${esc(db.profiles?.[trainer.id]?.mobility || 'Préférences de déplacement non renseignées.')}</p>
    ${slots.map(a=>`<div class="line-item"><div class="grow"><strong>${fmtDate(a.date)}</strong><span class="item-sub">${esc(a.start&&a.end?a.start+'–'+a.end:'Toute la journée')}</span></div>${badge(a.status)}</div>`).join('')||'<p class="item-sub">Aucun créneau déclaré.</p>'}</section>`;
}

function saveIncidentFollowUp(id, verify = false) {
  if (state.role !== 'amo') return;
  const incident = db.internalReviews.find(r=>r.id===id&&r.kind==='carton'&&r.trainerId===state.selectedTrainer);
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
    <label class="form-label" for="incident-${id}">Nouvelle action corrective</label>
    <textarea class="field" id="incident-${id}" rows="2" maxlength="1000"></textarea>
    <button class="secondary tiny" onclick="saveIncidentFollowUp('${id}')">Ajouter au suivi</button>
    ${record.verified?'':`<button class="secondary tiny" onclick="saveIncidentFollowUp('${id}',true)">Vérifier avec ce justificatif</button>`}
  </details>`;
}

const operationalDecisions = ['replace-staff','revalidate-staff','withdraw-staff','expire-staff','confirm-staff','approve-staff'];
function isOperationalModal(kind) {
  return ['amo-notifications','trainer-notifications','trainer-staffing','prepare-proposal','matching','whatsapp-draft',
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
