import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium, webkit} from 'playwright';

const url=process.env.HUB_URL||'http://127.0.0.1:8787/';
const output=process.env.QA_OUTPUT||'/tmp/certif-phase2-captures';
const engine=process.env.QA_ENGINE==='webkit'?webkit:chromium;
const browser=await engine.launch(engine===chromium?{executablePath:process.env.CHROME_PATH,
  args:['--host-resolver-rules=MAP fonts.googleapis.com ~NOTFOUND, MAP fonts.gstatic.com ~NOTFOUND']}:{});
const button=(page,name)=>page.getByRole('button',{name,exact:typeof name==='string'});
async function newPage(options={}){
  const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce',...options});
  await page.route(/^https:\/\/fonts\./,route=>route.abort());
  page.setDefaultTimeout(7000);
  return page;
}
const go=async (page,path)=>page.goto(url+'#/'+path,{waitUntil:'load'});
const errors=[];
await mkdir(output,{recursive:true});

try{
  const page=await newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.stack);});
  await go(page,'formateur/trainer-home');
  await button(page,'Mes disponibilités').click();
  const monday=page.getByRole('checkbox',{name:/^Lundi /});
  assert.equal(await page.locator('.av2-weekdays time[datetime]').count(),5);
  assert.equal(await page.getByRole('checkbox',{name:/Samedi|Dimanche/}).count(),0);
  await monday.check();
  assert.match(await monday.getAttribute('id'),/^av2-week-\d{4}-\d{2}-\d{2}-on$/);
  await button(page,'Semaine suivante').click();
  assert.equal(await monday.isChecked(),true);
  await monday.uncheck();
  assert.equal(await monday.isChecked(),false);
  await button(page,'Semaine suivante').click();
  assert.equal(await monday.isChecked(),true);
  await button(page,'Semaine précédente').click();
  assert.equal(await monday.isChecked(),false);
  const tuesday=page.getByRole('checkbox',{name:/^Mardi /});
  await tuesday.check();
  await button(page,'Rétablir par défaut').click();
  assert.equal(await monday.isChecked(),true);
  assert.equal(await tuesday.isChecked(),false);
  await button(page,'Semaine précédente').click();
  await button(page,'Chaque semaine').click();
  await monday.uncheck();
  assert.equal(await page.getByRole('heading',{name:'Préférences d’intervention'}).count(),0);
  await page.locator('summary').getByText('Bloquer une période d’indisponibilité').click();
  const d=await page.evaluate(()=>shiftDate(parisToday(),3));
  await page.getByLabel('Du',{exact:true}).fill(d);
  await page.getByLabel('Au',{exact:true}).fill(d);
  await button(page,'Bloquer les journées').click();
  assert.equal(await page.evaluate(date=>agendaV2Check({date,start:'12:00',end:'13:00'},state.trainerId).state,d),'busy');
  const dateLabel=await page.evaluate(date=>fmtDate(date),d);
  await button(page,'Supprimer le créneau du '+dateLabel).click();
  assert.equal(await page.evaluate(date=>agendaV2Check({date,start:'12:00',end:'13:00'},state.trainerId).state,d),'unknown');

  const data=await page.evaluate(()=>{
    const trainerId=state.trainerId, [formation,other]=formations;
    Object.assign(db.agendaV2[trainerId],{monthlyTarget:3,modality:'Hybride'});
    const date=shiftDate(parisToday(),20);
    const session={id:901,formationId:formation.id,date,start:'09:00',end:'17:00',status:'Planifiée',
      city:'Paris',required:2,topic:'IA générative',modality:'Présentiel',people:8};
    db.sessions.push(session,{...session,id:902,formationId:other.id,date:shiftDate(date,3)},{...session,id:903,date:shiftDate(date,-4)});
    db.assignments.push({id:'qa-block',trainerId,sessionId:903,status:'Confirmée'});
    db.availability.push({id:'qa-declared',trainerId:2,date,start:'08:00',end:'18:00',status:'Disponible'});
    const check=entry=>agendaV2Check(entry,trainerId,{sessionId:entry.id});
    const statuses={without:check(session).state,mission:check({...session,date:shiftDate(date,-4)}).state};
    db.agendaV2[trainerId].weekly[new Date(date+'T12:00:00').getDay()].on=false;
    db.agendaV2[trainerId].externalAvailability={status:'connected',validUntil:new Date(Date.now()+3600000).toISOString(),
      windows:[{date,start:'08:00',end:'18:00',status:'free'}]};
    statuses.verified=check(session).state;
    statuses.staffable=staffingAvailable(trainerById(trainerId),session);
    db.agendaV2[trainerId].externalAvailability.status='unavailable';
    statuses.unavailable=check(session).state;
    delete db.agendaV2[trainerId].externalAvailability;
    db.agendaV2[trainerId].demoCalendar=true;
    statuses.simulated=check(session).state;
    statuses.score=compatDetails(trainerById(trainerId),session).total;
    db.agendaV2[trainerId].externalAvailability={status:'connected',validUntil:new Date(Date.now()+3600000).toISOString(),
      windows:[{date,start:'08:00',end:'18:00',status:'free'}]};
    missionRatings.A3.public=false;
    return {statuses,trainerId,formationId:formation.id,date};
  });
  assert.deepEqual(data.statuses,{without:'unknown',mission:'busy',verified:'verified',staffable:true,
    unavailable:'unavailable',simulated:'simulation',score:null});
  assert.equal(await page.evaluate(()=>personalNps(state.trainerId)),'—');
  await page.evaluate(id=>openModal('mission-info',id),902);
  const dialog=page.getByRole('dialog');
  assert.equal(await dialog.getByText('Informations client pour la mission').count(),0);
  await page.keyboard.press('Escape');

  await page.evaluate(()=>{setRole('amo');staffFor(901);});
  const candidates=page.locator('.staffing-profile');
  assert.ok(await candidates.count()>=2);
  await candidates.filter({hasText:'Libre vérifié'}).getByText('Est déjà intervenu chez ce client',{exact:true}).waitFor();
  await candidates.filter({hasText:'Libre vérifié'}).getByText(/Objectif mensuel : 3/).waitFor();
  await page.evaluate(id=>{state.trainerDetailTab='agenda';openTrainer(id);},data.trainerId);
  await page.getByText('Interventions souhaitées / mois',{exact:true}).waitFor();
  assert.equal(await page.getByText('Hybride',{exact:true}).count(),1);

  await page.evaluate(({formationId,trainerId})=>{
    db.assignments.push({id:'qa-confirmed',trainerId,sessionId:901,status:'Confirmée'});
    openAmoScoping(formationId);
  },data);
  let slots=page.locator('.scope-slot');
  assert.equal(await slots.count(),6);
  await button(page,/Voir plus/).click();
  assert.ok(await slots.count()>6);
  await slots.nth(0).click();
  await slots.nth(1).click();
  await page.evaluate(id=>{setRole('trainer-'+id);go('trainer-scoping');},data.trainerId);
  await button(page,'Refuser').first().click();
  await button(page,'Accepter').last().click();
  await page.getByText('Refusé',{exact:true}).waitFor();
  await page.getByText('Accepté',{exact:true}).waitFor();
  const alternate=await page.evaluate(()=>shiftDate(parisToday(),17));
  await page.locator('#scope-alt-date').fill(alternate);
  await button(page,/Soumettre à l.AMO/).click();
  await page.getByText('Créneau alternatif proposé à l’AMO dans la démonstration',{exact:true}).waitFor();
  await page.evaluate(id=>{setRole('amo');openAmoScoping(id);},data.formationId);
  await button(page,'Ajouter aux propositions').click();
  await page.locator('input[name="scope-confirm-choice"]').nth(1).check();
  await button(page,'Valider ce créneau').click();
  assert.equal(await page.evaluate(id=>amoScopingStatus(id),data.formationId),'confirmed');
  await page.evaluate(id=>{setRole('trainer-'+id);go('trainer-scoping');},data.trainerId);
  await page.getByText(/Call confirmé le/).waitFor();
  assert.equal(await page.locator('#scope-alt-date').count(),0);
  assert.doesNotMatch(await page.locator('#main-content').innerText(),/HubSpot|Actions à suivre|Carton/);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('OK disponibilités, capacité, confidentialité, staffing et cadrage');

  for(const width of [1440,1024,768,390,375,320]){
    const screen=await newPage({viewport:{width,height:900}});
    screen.on('pageerror',error=>errors.push(error.message));
    for(const theme of ['light','dark']){
      for(const route of ['trainer-home','trainer-missions','trainer-calendar','trainer-docs','trainer-scoping','trainer-profile']){
        await go(screen,'formateur/'+route);
        await screen.evaluate(theme=>applyHubTheme(theme),theme);
        await screen.locator('#main-content h1').waitFor();
        if(route==='trainer-calendar')await screen.getByRole('tab',{name:'Disponibilités'}).click();
        assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width} ${theme}`);
        if([390,1440].includes(width)&&['trainer-calendar','trainer-scoping','trainer-profile'].includes(route)){
          await screen.screenshot({animations:'disabled',path:`${output}/${route}-${width}-${theme}.png`});
        }
      }
    }
    if(width<=390)assert.equal(await screen.locator('.mobile-dock button:visible').count(),5);
    await screen.close();
    console.log(`OK ${width}px · six parcours Formateur, clair et sombre`);
  }
  assert.deepEqual(errors,[]);
}finally{
  await browser.close();
}
