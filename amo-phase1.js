// Le dossier AMO couvre les catégories de la matrice et chaque obligation enregistrée.
function amoDocumentWork(f) {
  const sessions = db.sessions.filter(s => s.formationId === f.id);
  const active = sessions.filter(s => s.status !== 'Annulée');
  if (f.status === 'Annulée' || (sessions.length && !active.length)) {
    return {state: 'archived', open: [], total: 0};
  }
  const docs = db.deliverables.filter(d => d.formationId === f.id &&
    sessionById(d.sessionId)?.status !== 'Annulée');
  const obligations = [
    ...docs.map(doc => ({doc, key: docCategory(doc), label: doc.title})),
    ...documentColumns.filter(([key]) => !docs.some(d => docCategory(d) === key))
      .map(([key, label]) => ({key, label}))
  ].filter(({doc}) => doc?.status !== 'Non applicable');
  const open = obligations.flatMap(item => {
    const conformity = docConformity(item.doc);
    if (conformity === 'ok' && item.doc.status === 'Validé') return [];
    return [{...item, state: conformity === 'ok' ? 'pending' : conformity}];
  });
  const state = open.length ? (open.every(item => item.state === 'pending') ? 'pending' : 'open') : 'completed';
  return {state, open, total: obligations.length};
}

function amoDocumentStatus(work) {
  return {open:'À traiter', pending:'En attente', completed:'Terminée', archived:'Annulée'}[work.state];
}

function amoDashboardAlerts(upcoming, today) {
  const j7 = shiftDate(today, 7);
  const j14 = shiftDate(today, 14);
  const alerts = new Map();
  const add = (key, level, date, icon, title, detail, button, action) =>
    alerts.set(key, {level, date, icon, title, detail, button, action});

  for (const f of formations) {
    if (f.status === 'Annulée') continue;
    const sessions = upcoming.filter(s => s.formationId === f.id);
    const next = sessions[0];
    const {state: workState, open} = amoDocumentWork(f);
    const missing = open.filter(item => {
      if (item.state !== 'miss' || item.key === 'BILANS') return false;
      const session = item.doc?.sessionId ? sessions.find(s => s.id === item.doc.sessionId) : next;
      return session && (session.date <= j7 || (item.doc?.dueDate && item.doc.dueDate <= today));
    });
    const other = open.filter(item => !missing.includes(item));
    const dossierDate = next?.date || docDate(f);
    const dossier = [clientOf(f).name, f.title].join(' · ');
    const folder = `openFolder('${f.id}')`;
    if (missing.length) {
      add('missing:' + f.id, 0, next.date, 'docs', 'Livrable obligatoire manquant à J-7',
        dossier + ' · ' + [...new Set(missing.map(item => item.label))].join(', '), 'Ouvrir les livrables', folder);
    }
    if (other.length && workState !== 'archived') {
      const balanceDue = other.some(item => item.key === 'BILANS' &&
        (item.doc?.dueDate || (dossierDate && shiftDate(dossierDate, 7)) || '9999') <= today);
      const preparation = other.filter(item => item.key !== 'BILANS');
      if ((next && preparation.length) || (!next && (preparation.length || balanceDue))) {
        const count = next ? preparation.length : other.length;
        add('dossier:' + f.id, next && next.date <= j7 ? 1 : 2, dossierDate, 'docs',
          'Dossier de formation incomplet', dossier + ' · ' + count + ' obligation(s) ouverte(s)',
          'Ouvrir le dossier', folder);
      }
    }
    if (next) {
      const status = window.amoScopingStatus?.(f.id) || 'todo';
      if (status === 'todo' || status === 'pending') {
        add('call:' + f.id, next.date <= j14 ? 1 : 2, next.date, 'call',
          status === 'todo' ? 'Call de cadrage non planifié' : 'Call en attente de confirmation',
          dossier + ' · ' + fmtDate(next.date), 'Ouvrir le cadrage', `openAmoScoping('${f.id}')`);
      }
    }
    for (const session of sessions) {
      const needsReview = db.assignments.some(a => a.sessionId === session.id && a.status === 'À revalider');
      const imminent = session.date <= j7 && openCount(session) > 0;
      const conflicting = db.proposals.find(p => p.sessionId === session.id && proposalAgendaConflict(p, session));
      if (conflicting) {
        add('conflict:' + session.id, session.date <= j7 ? 0 : 1, session.date, 'calendar',
          'Conflit d’agenda à arbitrer', dossier + ' · ' + fmtDate(session.date),
          'Ouvrir la proposition', `openStaffProposal('${conflicting.id}')`);
      }
      if (imminent || needsReview) {
        add('staff:' + session.id, imminent ? 0 : 1, session.date, 'staff',
          imminent ? 'Formation imminente sans staffing confirmé' : 'Affectation à revalider',
          dossier + ' · ' + fmtDate(session.date) + (needsReview && imminent ? ' · Affectation à revalider' : ''),
          'Gérer le staffing', `staffFor(${session.id})`);
      }
    }
  }
  return [...alerts.values()].sort((a, b) => a.level - b.level || a.date.localeCompare(b.date));
}

function amoAlertRows(alerts) {
  if (!alerts.length) return `<div class="empty amo-alert-empty">${mobileIcon('check', 24)}<strong>Aucune intervention prioritaire</strong></div>`;
  const row = a => `<div class="amo-alert-row" data-priority="${a.level}">
    <span class="amo-alert-icon">${mobileIcon(a.icon, 19)}</span>
    <div class="amo-alert-copy"><small>${['Urgent', 'Prioritaire', 'À suivre'][a.level]}</small>
      <strong>${esc(a.title)}</strong><span class="item-sub">${esc(a.detail)}</span></div>
    <button class="${a.level === 0 ? 'primary' : 'secondary'} tiny" onclick="${a.action}">${esc(a.button)}</button>
  </div>`;
  const visible = alerts.slice(0, 4).map(row).join('');
  const rest = alerts.slice(4);
  return visible + (rest.length ? `<details class="amo-more-alerts">
    <summary>Voir les ${rest.length} autres alertes</summary>${rest.map(row).join('')}</details>` : '');
}

const clientPresentationFields = [
  ['specialty', 'Fonction ou spécialité', 100],
  ['bio', 'Biographie', 1200],
  ['expertise', 'Domaines d’expertise', 400],
  ['experience', 'Expériences pertinentes', 600],
  ['references', 'Références publiables', 400]
];

function clientPresentationText(trainer, record) {
  return [trainer.name, record.specialty, record.bio || 'Biographie à compléter',
    ...clientPresentationFields.slice(2).map(([key, label]) => record[key] && label + '\n' + record[key])]
    .filter(Boolean).join('\n\n');
}

function clientPresentationPanel(trainer) {
  const record = db.clientPresentations?.[trainer.id] || {};
  const profile = db.profiles?.[trainer.id] || {};
  const details = trainerProfileField(trainer.id);
  const photo = profile.uploadedPhoto || profile.photo;
  const hasPhoto = /^(?:data:image\/(?:jpeg|png|webp);base64,|https:\/\/|assets\/)/i.test(photo || '');
  const source = [
    ['Profil LinkedIn', (trainer.linkedin || details.linkedin) && linkSafe(trainer.linkedin || details.linkedin, 'Consulter LinkedIn')],
    ...[
      ['Biographie du profil', profile.bio],
      ['Expertises', [details.domain, ...trainer.skills, ...details.llm].filter(value => value && value !== 'Non renseigné')],
      ['Expériences', details.experience],
      ['Formations et certifications', [profile.education || details.education, profile.certifications || details.certifications].flat().filter(Boolean)],
      ['Projets', profile.projects || details.projects],
      ['Références', profile.references || details.references]
    ].map(([label, value]) => [label, esc(Array.isArray(value) ? value.join(' · ') : value)])
  ].filter(([, value]) => value);
  if (state.clientPresentationEditing) {
    return `<section class="amo-presentation">
      <h2 class="section-title">Présentation client</h2>
      <p class="item-sub">Vérifiez les informations et l’accord de publication des références et de la photo.</p>
      <details class="info"><summary>Sources professionnelles à vérifier</summary><dl>${source
        .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')}</dl></details>
      <form onsubmit="event.preventDefault();saveClientPresentation(this)">
        ${clientPresentationFields.map(([key, label, max]) => `<label>${label}
          <textarea class="field" name="${key}" maxlength="${max}" rows="${key === 'bio' ? 5 : 2}">${esc(record[key])}</textarea></label>`).join('')}
        ${hasPhoto ? `<label class="amo-photo-choice"><input name="photo" type="checkbox" ${record.photo ? 'checked' : ''}> Inclure la photo professionnelle</label>` : ''}
        ${profile.bio ? '<button class="secondary tiny" type="button" onclick="reuseClientBio(this.form)">Reprendre la biographie du profil</button>' : ''}
        <div class="action-wrap"><button class="primary" type="submit">Enregistrer et prévisualiser</button>
          <button class="secondary" type="button" onclick="changeTab('clientPresentationEditing',false)">Annuler</button></div>
      </form></section>`;
  }
  return `<section class="amo-presentation">
    <h2 class="section-title">Présentation client</h2>
    <article class="info amo-client-preview" aria-label="Aperçu client">
      <div class="amo-preview-heading">${hasPhoto && record.photo ? trainerAvatar(trainer, 54) : ''}
        <div><h3>${esc(trainer.name)}</h3>${record.specialty ? `<p>${esc(record.specialty)}</p>` : ''}</div></div>
      <p>${esc(record.bio || 'Biographie à compléter')}</p>
      ${clientPresentationFields.slice(2).map(([key, label]) => record[key]
        ? `<h4>${label}</h4><p>${esc(record[key])}</p>` : '').join('')}
    </article>
    <div class="action-wrap">
      <button class="primary tiny" onclick="changeTab('clientPresentationEditing',true)">Modifier la présentation</button>
      ${record.bio ? `<button class="secondary tiny" onclick="copyClientPresentation()">Copier le texte</button>
        <button class="secondary tiny" onclick="openModal('client-presentation-message')">Préparer un message</button>
        <button class="secondary tiny" onclick="exportClientPresentation()">${mobileIcon('download',16)} Exporter le texte</button>` : ''}
    </div></section>`;
}

function reuseClientBio(form) {
  if (state.role !== 'amo' || state.page !== 'trainer-detail') return;
  const trainer = trainerById(state.selectedTrainer) || trainers[0];
  const field = form.elements.namedItem('bio');
  if (!field.value || window.confirm('Remplacer le texte actuel par la biographie du profil ?')) {
    field.value = String(db.profiles?.[trainer.id]?.bio || '').slice(0, field.maxLength);
    field.focus();
  }
}

function saveClientPresentation(form) {
  if (state.role !== 'amo' || state.page !== 'trainer-detail' || state.trainerDetailTab !== 'client-presentation') return;
  const trainer = trainerById(state.selectedTrainer) || trainers[0];
  const input = new FormData(form);
  const record = Object.fromEntries(clientPresentationFields.map(([key, , max]) =>
    [key, String(input.get(key) || '').trim().slice(0, max)]));
  record.photo = input.has('photo');
  const previous = db.clientPresentations;
  db.clientPresentations = {...previous, [trainer.id]: record};
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify({version:1, data:db}));
  } catch {
    db.clientPresentations = previous;
    return flash('Le navigateur n’a pas pu enregistrer la présentation.');
  }
  changeTab('clientPresentationEditing', false);
  flash('Présentation client enregistrée.');
}

function currentClientPresentation() {
  if (state.role !== 'amo' || state.page !== 'trainer-detail') return null;
  const trainer = trainerById(state.selectedTrainer) || trainers[0];
  const record = db.clientPresentations?.[trainer.id];
  return record?.bio ? clientPresentationText(trainer, record) : null;
}

function clientPresentationMessage() {
  const text = currentClientPresentation();
  if (!text) return '';
  const message = 'Bonjour,\n\nEn amont de notre call de cadrage, voici la présentation de la personne qui interviendra pour votre formation.\n\n' +
    text + '\n\nAu plaisir d’échanger avec vous lors du cadrage.\n\nBien cordialement,\nL’équipe Certif-IA';
  return modalBox('Message de présentation', '', `<label class="amo-message-field">Corps du message
    <textarea class="field" id="amo-client-message" rows="10">${esc(message)}</textarea></label>
    <div class="modal-actions"><button class="secondary" onclick="closeModal()">Fermer</button>
    <button class="primary" onclick="copyClientPresentation(true)">Copier le message</button></div>`);
}

async function copyClientPresentation(message = false) {
  const text = currentClientPresentation();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(message ? $('amo-client-message').value : text);
    flash(message ? 'Message copié.' : 'Présentation copiée.');
  } catch {
    flash('Copie indisponible. Sélectionnez le texte pour le copier.');
  }
}

function exportClientPresentation() {
  const text = currentClientPresentation();
  if (text) downloadBlob(new Blob([text], {type:'text/plain;charset=utf-8'}), 'presentation-formateur.txt');
}

function trainerSatisfaction(id) {
  const values = db.assignments.filter(a => a.trainerId === id && a.status === 'Réalisée')
    .map(a => missionRatings[a.id])
    .filter(rating => rating?.public === true)
    .map(rating => rating.satisfaction5 ?? rating.trainerSatisfaction5)
    .filter(value => Number.isFinite(value) && value >= 0 && value <= 5);
  return values.length ? reportNumber(values.reduce((sum, value) => sum + value, 0) / values.length) + ' /5' : 'Non renseignée';
}
