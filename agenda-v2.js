(function agendaAddon(){
  'use strict';
  // Certif-IA Hub — Agenda Formateur V2 (démo uniquement).
  // La synchronisation Google/Outlook réelle nécessite une API et OAuth sécurisés.
  const baselineCalendar=trainerCalendar;
  const baselineConflict=calendarConflict;
  const weekdays=[['1','Lundi'],['2','Mardi'],['3','Mercredi'],['4','Jeudi'],['5','Vendredi'],['6','Samedi'],['0','Dimanche']];
  function agendaProfile(id){
    db.agendaV2 ||= {};
    db.agendaV2[id] ||= {
      weekly:Object.fromEntries(weekdays.map(([d])=>[d,{on:false,start:'09:00',end:'18:00'}])),
      demoCalendar:false
    };
    return db.agendaV2[id];
  }
  // Adaptateur de lecture pour une future synchronisation. Aucun connecteur ne
  // renseigne ce contrat dans la démo. Les fenêtres ne contiennent aucun titre privé.
  function agendaConnection(id) {
    const snapshot=db.agendaV2?.[id]?.externalAvailability;
    if(!snapshot||snapshot.status==='disconnected')return 'unknown';
    return snapshot.status==='connected'&&Date.parse(snapshot.validUntil)>Date.now()?'connected':'unavailable';
  }

  function agendaConnectionLabel(id) {
    const connection=agendaConnection(id);
    return connection==='connected'?'Agenda connecté':connection==='unavailable'?'Synchronisation indisponible':
      db.agendaV2?.[id]?.demoCalendar?'Agenda simulé':'Agenda non connecté';
  }

  function externalAvailability(entry,id) {
    const snapshot=db.agendaV2?.[id]?.externalAvailability;
    const connection=agendaConnection(id);
    if(connection!=='connected')return {connection};
    const windows=(Array.isArray(snapshot.windows)?snapshot.windows:[]).filter(item=>item.date===entry.date);
    if(windows.some(item=>item.status==='busy'&&agendaEntriesOverlap(entry,item)))return {connection:'connected',busy:true};
    const free=windows.some(item=>item.status==='free'&&item.start<=entry.start&&item.end>=entry.end);
    return {connection:'connected',free};
  }

  function agendaV2Check(entry,id,options={}) {
    const external=externalAvailability(entry,id);
    if(calendarConflict(entry,id,{...options,allowAvailable:true}))return {state:'busy',label:'Occupé',connection:external.connection};
    if(external.free)return {state:'verified',label:'Libre vérifié',connection:external.connection};
    const profile=db.agendaV2?.[id];
    const slots=db.availability.filter(a=>a.trainerId===id&&a.date===entry.date&&a.status==='Disponible')
      .sort((a,b)=>(a.start||'00:00').localeCompare(b.start||'00:00'));
    let covered=entry.start;
    for(const slot of slots){
      if((slot.start||'00:00')>covered)break;
      if((slot.end||'24:00')>covered)covered=slot.end||'24:00';
    }
    const declared=Boolean(entry.start&&entry.end&&covered>=entry.end);
    const weekday=entry.date&&weekdayPreference(profile,entry.date);
    const habitual=weekday?.on&&weekday.start<=entry.start&&weekday.end>=entry.end;
    const connectionLabel=external.connection==='unavailable'?' · synchronisation indisponible':' · agenda non vérifié';
    if(declared||habitual)return {state:'preference',label:'Préférence déclarée'+connectionLabel,dated:declared,connection:external.connection};
    if(profile?.demoCalendar)return {state:'simulation',label:'Libre · simulation',connection:external.connection};
    return {state:external.connection==='unavailable'?'unavailable':'unknown',
      label:external.connection==='unavailable'?'Synchronisation indisponible':'Disponibilité non vérifiée',connection:external.connection};
  }

  calendarConflict=function(entry,id,options={}){
    const conflict=baselineConflict(entry,id,options) || (id!=null &&
      (externalAvailability(entry,id).busy || window.confirmedScopingConflict?.(entry,id,options.ignoreCall))
      ? 'Un créneau occupé recouvre cette période.' : '');
    if(conflict&&id!=null&&state.role==='amo'){
      return `Conflit de disponibilité le ${fmtDate(entry.date)} : créneau occupé ou mission déjà affectée.`;
    }
    return conflict;
  };

  staffingAvailable=function(t,s){
    if(!t||!s||['Réalisée','Annulée'].includes(s.status)||t.rating?.includes('À ne pas staffer'))return false;
    const result=agendaV2Check(s,t.id,{sessionId:s.id});
    return result.state==='verified'||result.state==='simulation'||result.dated===true||
      (result.state!=='busy'&&db.agendaV2?.[t.id]?.demoCalendar===true);
  };

  function trainerAvailabilityPreferences(id) {
    const p=db.agendaV2?.[id]||{};
    return {monthlyTarget:p.monthlyTarget??null, days:p.preferredDays||[], modality:p.modality||'',
      mobility:db.profiles?.[id]?.mobility||'', remarks:p.remarks||''};
  }

  function availabilityPreferenceSummary(id) {
    const p=trainerAvailabilityPreferences(id);
    return [
      ['Interventions souhaitées / mois', p.monthlyTarget ?? 'Non renseigné'],
      ['Jours privilégiés', weekdays.filter(([key])=>p.days.includes(key)).map(([,label])=>label).join(', ') || 'Non renseignés'],
      ['Modalité préférée', p.modality || 'Non renseignée'],
      ['Mobilité géographique', p.mobility || 'Non renseignée'],
      ['Remarques de disponibilité', p.remarks || 'Aucune']
    ].map(([label,value])=>`<div class="info"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('');
  }

  function saveAvailabilityPreferences(form) {
    if(state.role!=='formateur'||state.page!=='trainer-calendar')return;
    const data=new FormData(form), raw=String(data.get('target')).trim();
    const monthlyTarget=raw===''?null:Number(raw);
    const modality=String(data.get('modality'));
    if((monthlyTarget!==null&&(!Number.isInteger(monthlyTarget)||monthlyTarget<0||monthlyTarget>31))||
      !['','Présentiel','Distanciel','Hybride'].includes(modality))return flash('Vérifiez le volume et la modalité.');
    const p=agendaProfile(state.trainerId);
    Object.assign(p,{monthlyTarget,modality,preferredDays:data.getAll('day').filter(day=>weekdays.some(([key])=>key===day)),
      remarks:String(data.get('remarks')).trim().slice(0,600)});
    db.profiles ||= {};
    const current=db.profiles[state.trainerId] ||= {name:trainerById(state.trainerId).name};
    current.mobility=String(data.get('mobility')).trim().slice(0,200);
    save();render();flash('Préférences enregistrées dans ce navigateur.');
  }

  function saveUnavailablePeriod(form) {
    if(state.role!=='formateur'||state.page!=='trainer-calendar')return;
    const data=new FormData(form), from=String(data.get('from')), to=String(data.get('to'));
    const error=form.querySelector('[role="alert"]');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||to<from||to>shiftDate(from,365)){
      error.textContent='Sélectionnez une période de 366 jours maximum.';return;
    }
    const id=state.trainerId;
    const days=[];
    for(let day=from;day<=to;day=shiftDate(day,1)){
      if(!db.availability.some(a=>a.trainerId===id&&a.date===day&&a.status==='Occupé'&&!a.start&&!a.end))
        days.push({id:crypto.randomUUID(),trainerId:id,date:day,start:'',end:'',status:'Occupé',source:'déclaration'});
    }
    db.availability.push(...days);
    state.availabilityMonth=from.slice(0,7);
    save();render();flash('Période d’indisponibilité enregistrée.');
  }

  function deleteAvailabilitySlot(id) {
    if(state.role!=='formateur'||state.page!=='trainer-calendar')return;
    const index=db.availability.findIndex(a=>a.id===id&&a.trainerId===state.trainerId);
    if(index<0)return;
    db.availability.splice(index,1);save();render();flash('Créneau supprimé.');
  }
  function v2SetTab(tab){
    if(!['calendar','availability','connections'].includes(tab))return;
    state.agendaV2Tab=tab;
    render();
  }
  function weekdayPreference(profile,date,habitual=false){
    const weekday=new Date(date+'T12:00:00').getDay();
    return (!habitual&&profile?.weeklyOverrides?.[date]) ||
      profile?.weekly?.[weekday] || {on:false,start:'09:00',end:'18:00'};
  }

  function availabilityWeek(){
    return state.availabilityWeek||toISO(weekStart(parisToday()));
  }

  function editsHabitualWeek(profile){
    if(state.availabilityScope)return state.availabilityScope==='habitual';
    const week=availabilityWeek(), end=shiftDate(week,6);
    return !Object.keys(profile.weeklyOverrides||{}).some(date=>date>=week&&date<=end);
  }

  function moveAvailabilityWeek(offset){
    state.availabilityWeek=shiftDate(availabilityWeek(),offset*7);
    state.availabilityScope='week';
    render();
  }

  function setAvailabilityScope(scope){
    state.availabilityScope=scope==='habitual'?'habitual':'week';
    render();
  }

  function v2Weekday(date,field,value){
    if(state.role!=='formateur'||state.page!=='trainer-calendar'||date<availabilityWeek()||
      date>shiftDate(availabilityWeek(),6))return;
    const p=agendaProfile(state.trainerId);
    const habitual=editsHabitualWeek(p);
    const updated={...weekdayPreference(p,date,habitual)};
    if(field==='on')updated.on=Boolean(value);
    else if(['start','end'].includes(field)&&/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(value))updated[field]=value;
    else return render();
    if(updated.start>=updated.end){flash('La fin doit être postérieure au début.');render();return;}
    if(habitual)p.weekly[new Date(date+'T12:00:00').getDay()]=updated;
    else (p.weeklyOverrides||={})[date]=updated;
    save();render();
    document.getElementById('av2-week-'+date+'-'+field)?.focus({preventScroll:true});
  }

  function resetAvailabilityDay(date){
    if(state.role!=='formateur'||state.page!=='trainer-calendar'||date<availabilityWeek()||
      date>shiftDate(availabilityWeek(),6))return;
    const overrides=db.agendaV2?.[state.trainerId]?.weeklyOverrides;
    if(!overrides||!Object.hasOwn(overrides,date))return;
    delete overrides[date];
    save();render();
    document.getElementById('av2-week-'+date+'-on')?.focus({preventScroll:true});
  }

  function v2DemoConnection(){
    if(state.role!=='formateur')return;
    const profile=agendaProfile(state.trainerId);
    profile.demoCalendar=!profile.demoCalendar;
    save();render();
    flash(profile.demoCalendar?'Simulation de calendrier activée (aucune connexion Google réelle).':'Simulation désactivée.');
  }
  function v2AddException(){
    const month=state.availabilityMonth||parisToday().slice(0,7);
    openCalendarEvent(parisToday().startsWith(month)?parisToday():month+'-01',null,true);
  }
  function v2WeekView(){
    const p=agendaProfile(state.trainerId);
    const week=availabilityWeek(), habitual=editsHabitualWeek(p);
    const preferences=trainerAvailabilityPreferences(state.trainerId);
    const month=state.availabilityMonth||parisToday().slice(0,7);
    const slots=db.availability.filter(a=>a.trainerId===state.trainerId&&a.date.startsWith(month))
      .sort((a,b)=>a.date.localeCompare(b.date)||(a.start||'').localeCompare(b.start||''));
    return `<section class="card av2-pane">
      <header class="av2-cardhead"><div><h2>Mes disponibilités par semaine</h2><p>Les horaires habituels se répètent. Passez sur « Cette semaine seulement » pour modifier des dates précises.</p></div></header>
      <div class="av2-weeknav" role="group" aria-label="Choisir la semaine">
        <button class="secondary tiny" aria-label="Semaine précédente" onclick="moveAvailabilityWeek(-1)">${mobileIcon('back',16)}</button>
        <strong aria-live="polite">Du ${fmtDate(week)} au ${fmtDate(shiftDate(week,6))}</strong>
        <button class="secondary tiny" aria-label="Semaine suivante" onclick="moveAvailabilityWeek(1)">${mobileIcon('chevron',16)}</button>
      </div>
      <div class="av2-tabs av2-scope" role="group" aria-label="Appliquer les modifications">
        <button class="${habitual?'selected':''}" aria-pressed="${habitual}" onclick="setAvailabilityScope('habitual')">Chaque semaine</button>
        <button class="${habitual?'':'selected'}" aria-pressed="${!habitual}" onclick="setAvailabilityScope('week')">Cette semaine seulement</button>
      </div>
      <div class="av2-weekdays">${weekdays.map(([,label],i)=>{
        const date=shiftDate(week,i), d=weekdayPreference(p,date,habitual), override=p.weeklyOverrides?.[date];
        const shortDate=fmtDate(date,{day:'numeric',month:'short'});
        return `<div class="av2-weekrow">
          <div class="av2-weekday"><label class="av2-daytoggle"><input id="av2-week-${date}-on" type="checkbox" ${d.on?'checked':''} onchange="agendaV2SetWeekday('${date}','on',this.checked)"><strong>${label} <span>${shortDate}</span></strong></label>
          ${override?`<span class="item-sub">Exception le ${shortDate}</span>`:''}</div>
          <div class="av2-times"><label><span>De</span><input id="av2-week-${date}-start" aria-label="Début ${label}" type="time" value="${esc(d.start)}" ${d.on?'':'disabled'} onchange="agendaV2SetWeekday('${date}','start',this.value)"></label>
          <label><span>À</span><input id="av2-week-${date}-end" aria-label="Fin ${label}" type="time" value="${esc(d.end)}" ${d.on?'':'disabled'} onchange="agendaV2SetWeekday('${date}','end',this.value)"></label></div>
          ${override&&!habitual?`<button class="ghost tiny" aria-label="Rétablir l’horaire habituel du ${label}" onclick="resetAvailabilityDay('${date}')">Rétablir l’horaire habituel</button>`:''}</div>`;
      }).join('')}</div>
      <form class="av2-preferences av2-spaced" onsubmit="event.preventDefault();saveAvailabilityPreferences(this)">
        <h2>Préférences d’intervention</h2><div class="form-grid">
        <label>Combien d’interventions Certif-IA souhaiteriez-vous réaliser par mois ?<input class="field" name="target" type="number" min="0" max="31" inputmode="numeric" value="${esc(preferences.monthlyTarget)}"></label>
        <label>Modalité préférée<select class="field" name="modality">${['','Présentiel','Distanciel','Hybride'].map(value=>`<option value="${value}" ${preferences.modality===value?'selected':''}>${value||'Sans préférence'}</option>`).join('')}</select></label>
        <label>Mobilité géographique<input class="field" name="mobility" maxlength="200" value="${esc(preferences.mobility)}"></label>
        <label>Remarques visibles par l’AMO<textarea class="field" name="remarks" maxlength="600">${esc(preferences.remarks)}</textarea></label></div>
        <fieldset class="av2-preferred"><legend>Jours privilégiés</legend>${weekdays.map(([day,label])=>`<label><input type="checkbox" name="day" value="${day}" ${preferences.days.includes(day)?'checked':''}>${label}</label>`).join('')}</fieldset>
        <button class="primary" type="submit">Enregistrer mes préférences</button>
      </form>
      <div class="av2-cardhead av2-spaced"><div><h2>Disponibilités mensuelles</h2><p>Les créneaux datés alimentent votre agenda existant.</p></div><button class="primary tiny" onclick="agendaV2AddException()">Ajouter un créneau</button></div>
      <label class="av2-month-field">Mois affiché<input class="field" type="month" value="${esc(month)}" onchange="if(this.value){state.availabilityMonth=this.value;render()}"></label>
      <div class="av2-exceptions">${slots.map(slot=>`<div class="line-item"><button class="ghost grow" onclick="openCalendarEvent('${esc(slot.date)}','${esc(slot.id)}',true)"><strong>${fmtDate(slot.date)}</strong> <span class="item-sub">${esc(slot.start||'Journée entière')} ${slot.end?'– '+esc(slot.end):''}</span></button>${badge(slot.status)}<button class="secondary tiny" aria-label="Supprimer le créneau du ${fmtDate(slot.date)}" onclick="deleteAvailabilitySlot('${esc(slot.id)}')">${mobileIcon('close',16)}</button></div>`).join('')||'<p class="item-sub">Aucun créneau déclaré pour ce mois.</p>'}</div>
      <details class="av2-spaced"><summary>Bloquer une période d’indisponibilité</summary><form class="av2-preferences" onsubmit="event.preventDefault();saveUnavailablePeriod(this)">
        <div class="form-grid"><label>Du<input class="field" type="date" name="from" required></label><label>Au<input class="field" type="date" name="to" required></label></div>
        <p role="alert"></p><button class="secondary" type="submit">Bloquer les journées</button>
      </form></details>
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
      <div><span>Agenda externe</span><strong class="av2-status">${agendaConnectionLabel(state.trainerId)}</strong><small>Vérification des créneaux</small></div>
    </section>
    <section class="av2-calendar">${calendarUI(true)}</section>
    <section class="card av2-pane">
      <div class="av2-cardhead"><div><h2>Prochaines missions</h2><p>Accédez directement au dossier et à la préparation.</p></div><button class="secondary tiny" onclick="go('trainer-missions')">Toutes les missions</button></div>
      ${upcoming.map(s=>`<button class="line-item clickable-row" onclick="state.selectedSession=${Number(s.id)};go('trainer-missions')"><span class="grow"><strong>${esc(clientOf(formOf(s)).name)}</strong><span class="item-sub">${fmtDate(s.date)} · ${esc(s.start)}–${esc(s.end)} · ${esc(s.city)}</span></span>${badge(s.status)}</button>`).join('')||'<p class="item-sub">Aucune mission à venir.</p>'}
    </section>`;
  }
  trainerCalendar=function(){
    const tab=state.agendaV2Tab||'calendar';
    return `<div class="av2-root">
      <header class="av2-hero"><div><span class="av2-eyebrow">PORTAIL FORMATEUR · AGENDA V2</span><h1 class="headline">Mon agenda</h1><p>Vos missions, vos disponibilités et vos calendriers en un seul endroit.</p></div>
      <span class="av2-demo-label">${agendaConnectionLabel(state.trainerId)}</span></header>
      <div class="av2-tabs" role="tablist" aria-label="Sections de l'agenda">
        ${[['calendar','Calendrier'],['availability','Disponibilités'],['connections','Connexions']].map(([key,label])=>`<button type="button" role="tab" aria-selected="${key===tab}" class="${key===tab?'selected':''}" onclick="agendaV2SetTab('${key}')">${label}</button>`).join('')}
      </div>
      ${tab==='calendar'?v2Calendar():tab==='availability'?v2WeekView():v2Connections()}
      <p class="av2-disclaimer">Version de démonstration : données et actions locales. Aucune synchronisation Google/Outlook ni notification externe n'est effectuée.</p>
    </div>`;
  };
  window.trainerAvailabilityPreferences=trainerAvailabilityPreferences;
  window.availabilityPreferenceSummary=availabilityPreferenceSummary;
  window.saveAvailabilityPreferences=saveAvailabilityPreferences;
  window.saveUnavailablePeriod=saveUnavailablePeriod;
  window.deleteAvailabilitySlot=deleteAvailabilitySlot;
  window.agendaConnectionLabel=agendaConnectionLabel;
  window.agendaV2SetTab=v2SetTab;
  window.agendaV2SetWeekday=v2Weekday;
  window.moveAvailabilityWeek=moveAvailabilityWeek;
  window.setAvailabilityScope=setAvailabilityScope;
  window.resetAvailabilityDay=resetAvailabilityDay;
  window.agendaV2DemoConnection=v2DemoConnection;
  window.agendaV2AddException=v2AddException;
  window.agendaV2Check=agendaV2Check;
  // Le premier rendu de hub.js a déjà eu lieu au chargement des scripts différés.
  if(state.role==='formateur'&&state.page==='trainer-calendar')render();
})();
