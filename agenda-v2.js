(function agendaAddon(){
  'use strict';
  // Certif-IA Hub — Agenda Formateur V2 (démo uniquement).
  // La synchronisation Google/Outlook réelle nécessite une API et OAuth sécurisés.
  const baselineCalendar=trainerCalendar;
  const baselineConflict=calendarConflict;
  const baselineAvailable=staffingAvailable;
  const baselineCompat=compatDetails;
  const baselineCard=staffingCandidateCard;
  const weekdays=[['1','Lundi'],['2','Mardi'],['3','Mercredi'],['4','Jeudi'],['5','Vendredi'],['6','Samedi'],['0','Dimanche']];
  function agendaProfile(id){
    db.agendaV2 ||= {};
    db.agendaV2[id] ||= {
      weekly:Object.fromEntries(weekdays.map(([d])=>[d,{on:!['6','0'].includes(d),start:'09:00',end:'18:00'}])),
      demoCalendar:false
    };
    return db.agendaV2[id];
  }
  function isBusy(session,id){
    const items=[
      ...(db.calendarEvents||[]).filter(e=>e.trainerId===id),
      ...(db.availability||[]).filter(e=>e.trainerId===id&&e.status==='Occupé'),
      ...(db.assignments||[]).filter(a=>a.trainerId===id&&['Confirmée','À revalider','Réalisée'].includes(a.status))
        .map(a=>sessionById(a.sessionId)).filter(Boolean)
    ];
    return items.some(e=>e.id!==session.id&&agendaEntriesOverlap(e,session));
  }
  function agendaV2Check(session,id){
    if(!session||!id)return {state:'unknown',label:'Non vérifié'};
    if(isBusy(session,id))return {state:'busy',label:'Occupé'};
    const profile=agendaProfile(id);
    if(profile.demoCalendar)return {state:'free-demo',label:'Libre · simulation'};
    return {state:'unknown',label:'Agenda non vérifié'};
  }
  // Les déclarations hebdomadaires sont informatives : un agenda libre permet
  // une proposition normale, y compris hors des jours ou horaires habituels.
  staffingAvailable=function(t,s){
    if(!t||!s)return false;
    const result=agendaV2Check(s,t.id);
    if(result.state==='busy')return false;
    if(result.state==='free-demo')return true;
    return baselineAvailable(t,s); // compatibilité avec le staffing manuel préexistant
  };
  calendarConflict=function(entry,id,options={}){
    const conflict=baselineConflict(entry,id,options);
    if(conflict&&id!==null&&id!==undefined&&state.role==='amo'){
      return `Conflit de disponibilité le ${fmtDate(entry.date)} : créneau occupé ou mission déjà affectée. Les détails personnels sont confidentiels.`;
    }
    return conflict;
  };
  compatDetails=function(t,s){
    const result=baselineCompat(t,s);
    const check=agendaV2Check(s,t.id);
    if(check.state==='free-demo'){
      result.parts=result.parts.map(p=>p[0]==='Disponibilité connue'?['Calendrier libre (simulation)',p[1],p[2]]:p);
      result.reasons=result.reasons.map(r=>/disponib/i.test(r)?'Calendrier libre · simulation (hors horaires déclarés autorisé)':r);
    }else if(check.state==='unknown'){
      result.reasons=result.reasons.map(r=>/disponib/i.test(r)?'Agenda externe non vérifié · déclaration manuelle':r);
    }
    return result;
  };
  staffingCandidateCard=function(t,s,...args){
    let html=baselineCard(t,s,...args);
    const check=agendaV2Check(s,t.id);
    if(check.state==='free-demo')html=html.replace('Disponible sur le créneau','Libre sur le créneau · simulation');
    else if(check.state==='unknown')html=html.replace('Disponible sur le créneau','Créneau déclaré · agenda non vérifié');
    return html;
  };
  function v2SetTab(tab){
    if(!['calendar','availability','connections'].includes(tab))return;
    state.agendaV2Tab=tab;
    render();
  }
  function v2Weekday(day,field,value){
    if(state.role!=='formateur')return;
    const p=agendaProfile(state.trainerId);
    const current=p.weekly[day];
    if(!current)return;
    if(field==='on')current.on=Boolean(value);
    if(field==='start'||field==='end'){
      if(!/^\d{2}:\d{2}$/.test(value))return;
      current[field]=value;
    }
    if(current.start>=current.end){flash('La fin doit être postérieure au début.');render();return;}
    save();render();
  }
  function v2DemoConnection(){
    if(state.role!=='formateur')return;
    const profile=agendaProfile(state.trainerId);
    profile.demoCalendar=!profile.demoCalendar;
    save();render();
    flash(profile.demoCalendar?'Simulation de calendrier activée (aucune connexion Google réelle).':'Simulation désactivée.');
  }
  function v2AddException(){
    openCalendarEvent(state.calendarDate||parisToday(),null,true);
  }
  function v2WeekView(){
    const p=agendaProfile(state.trainerId);
    const slots=(db.availability||[]).filter(a=>a.trainerId===state.trainerId)
      .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    return `<section class="card av2-pane">
      <header class="av2-cardhead"><div><h2>Ma semaine habituelle</h2><p>Les horaires déclarés expriment vos préférences, sans empêcher une proposition lorsque votre agenda connecté est libre.</p></div></header>
      <div class="av2-weekdays">${weekdays.map(([day,label])=>{const d=p.weekly[day];return `<div class="av2-weekrow">
        <label class="av2-daytoggle"><input type="checkbox" ${d.on?'checked':''} onchange="agendaV2SetWeekday('${day}','on',this.checked)"><strong>${label}</strong></label>
        <div class="av2-times"><label><span>De</span><input aria-label="Début ${label}" type="time" value="${esc(d.start)}" ${d.on?'':'disabled'} onchange="agendaV2SetWeekday('${day}','start',this.value)"></label>
        <label><span>À</span><input aria-label="Fin ${label}" type="time" value="${esc(d.end)}" ${d.on?'':'disabled'} onchange="agendaV2SetWeekday('${day}','end',this.value)"></label></div></div>`}).join('')}</div>
      <div class="av2-cardhead av2-spaced"><div><h2>Exceptions et indisponibilités</h2><p>Une période explicitement bloquée reste différente d'un jour habituellement non travaillé.</p></div><button class="primary tiny" onclick="agendaV2AddException()">+ Ajouter</button></div>
      <div class="av2-exceptions">${slots.map(slot=>`<button class="line-item clickable-row" onclick="openCalendarEvent('${esc(slot.date)}','${esc(slot.id)}',true)"><span class="grow"><strong>${fmtDate(slot.date)}</strong><span class="item-sub">${esc(slot.start||'Journée entière')} ${slot.end?'– '+esc(slot.end):''}</span></span>${badge(slot.status)}</button>`).join('')||'<p class="item-sub">Aucune exception enregistrée.</p>'}</div>
    </section>`;
  }
  function v2Connections(){
    const profile=agendaProfile(state.trainerId);
    return `<section class="card av2-pane">
      <div class="av2-cardhead"><div><h2>Mes calendriers</h2><p>Un calendrier personnel connecté permettra à terme de vérifier les conflits sans exposer vos rendez-vous privés aux AMO.</p></div></div>
      <div class="av2-connectrow"><div class="av2-provider">${mobileIcon('calendar',22)}<div><strong>Google Agenda</strong><span>Connexion OAuth réelle à développer</span></div></div><span class="badge">Non connecté</span></div>
      <div class="av2-connectrow"><div class="av2-provider">${mobileIcon('mail',22)}<div><strong>Outlook</strong><span>Intégration future</span></div></div><span class="badge">Non connecté</span></div>
      <div class="av2-simulation"><div><strong>Mode démonstration</strong><p>Simuler un calendrier externe libre sauf sur les créneaux occupés dans la démo. Aucun accès à Google n'est effectué.</p></div>
      <button class="${profile.demoCalendar?'secondary':'primary'} tiny" aria-pressed="${profile.demoCalendar}" onclick="agendaV2DemoConnection()">${profile.demoCalendar?'Désactiver':'Activer'} la simulation</button></div>
      <p class="av2-privacy">${mobileIcon('check',16)} Confidentialité : côté AMO, seuls les statuts libre, occupé ou non vérifié peuvent être visibles. La séparation sécurisée des données nécessite un backend.</p>
    </section>`;
  }
  function v2Calendar(){
    const current=state.calendarDate||parisToday();
    const today=parisToday();
    const upcoming=[...trainerMissionsInCalendar(state.trainerId)]
      .filter(s=>s.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
    return `<section class="av2-summary">
      <div><span>Mes missions à venir</span><strong>${upcoming.length}</strong><small>dans la démonstration</small></div>
      <div><span>Propositions en attente</span><strong>${db.proposals.filter(p=>p.trainerId===state.trainerId&&['Envoyée','Acceptée'].includes(p.status)).length}</strong><small>à suivre</small></div>
      <div><span>Agenda externe</span><strong class="av2-status">${agendaProfile(state.trainerId).demoCalendar?'Simulé':'Non vérifié'}</strong><small>pas de connexion réelle</small></div>
    </section>
    <section class="av2-calendar">${calendarUI(true)}</section>
    <section class="card av2-pane">
      <div class="av2-cardhead"><div><h2>Prochaines missions</h2><p>Accédez directement au dossier et à la préparation.</p></div><button class="secondary tiny" onclick="go('trainer-missions')">Toutes les missions</button></div>
      ${upcoming.map(s=>`<button class="line-item clickable-row" onclick="state.selectedSession=${Number(s.id)};go('trainer-missions')"><span class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><span class="item-sub">${fmtDate(s.date)} · ${esc(s.start)}–${esc(s.end)} · ${esc(s.city)}</span></span>${badge(s.status)}</button>`).join('')||'<p class="item-sub">Aucune mission à venir.</p>'}
    </section>`;
  }
  trainerCalendar=function(){
    const tab=state.agendaV2Tab||'calendar';
    const p=agendaProfile(state.trainerId);
    return `<div class="av2-root">
      <header class="av2-hero"><div><span class="av2-eyebrow">PORTAIL FORMATEUR · AGENDA V2</span><h1 class="headline">Mon agenda</h1><p>Vos missions, vos disponibilités et vos calendriers en un seul endroit.</p></div>
      <span class="av2-demo-label">${p.demoCalendar?'Calendrier simulé':'Agenda non connecté'}</span></header>
      <div class="av2-tabs" role="tablist" aria-label="Sections de l'agenda">
        ${[['calendar','Calendrier'],['availability','Disponibilités'],['connections','Connexions']].map(([key,label])=>`<button type="button" role="tab" aria-selected="${key===tab}" class="${key===tab?'selected':''}" onclick="agendaV2SetTab('${key}')">${label}</button>`).join('')}
      </div>
      ${tab==='calendar'?v2Calendar():tab==='availability'?v2WeekView():v2Connections()}
      <p class="av2-disclaimer">Version de démonstration : données et actions locales. Aucune synchronisation Google/Outlook ni notification externe n'est effectuée.</p>
    </div>`;
  };
  window.agendaV2SetTab=v2SetTab;
  window.agendaV2SetWeekday=v2Weekday;
  window.agendaV2DemoConnection=v2DemoConnection;
  window.agendaV2AddException=v2AddException;
  window.agendaV2Check=agendaV2Check;
  // Le premier rendu de hub.js a déjà eu lieu au chargement des scripts différés.
  if(state.role==='formateur'&&state.page==='trainer-calendar')render();
})();
