import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';

const url=process.env.HUB_URL||'http://127.0.0.1:8787/';
const engine=process.env.QA_ENGINE==='webkit'?webkit:chromium;
const output=process.env.QA_OUTPUT||'/tmp/certif-scoping-captures';
const browser=await engine.launch(engine===chromium?{executablePath:process.env.CHROME_PATH,
  args:['--host-resolver-rules=MAP fonts.googleapis.com ~NOTFOUND, MAP fonts.gstatic.com ~NOTFOUND']}:{});
const button=(page,name)=>page.getByRole('button',{name,exact:true});
const locationOf=id=>url+'#/interne/scoping-calls'+(id?'/'+id:'');
const errors=[];
await mkdir(output,{recursive:true});

async function makePage(width, serviceWorkers='block'){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers});
  page.setDefaultTimeout(8000);
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.stack);});
  if(serviceWorkers==='block')await page.route(/^https:\/\/fonts\./,route=>route.abort());
  return page;
}

try{
  const page=await makePage(1440);
  await page.goto(locationOf());
  await page.getByRole('heading',{name:'Calls de cadrage',exact:true}).waitFor();
  const setup=await page.evaluate(()=>{
    const [first,second]=formations, today=parisToday();
    const date=shiftDate(today,11);
    db.sessions.push({id:991,formationId:first.id,date,start:'09:00',end:'17:00',status:'Planifiée',
      city:'Paris',required:1,topic:'IA',modality:'Présentiel'});
    db.assignments.push({id:'QA-scoping',trainerId:1,sessionId:991,status:'Confirmée'});
    db.assignments=db.assignments.filter(a=>sessionById(a.sessionId)?.formationId!==second.id);
    db.scoping={calls:{}};
    const client=clientOf(first);
    const contact=clientDetails[first.clientId];
    for(const field of ['contact','phone','telephone','contactPhone','email','contactEmail'])contact[field]='';
    save();render();
    return {id:first.id,other:second.id,client:client.name,start:shiftDate(today,1)};
  });
  const search=page.getByRole('searchbox',{name:'Rechercher un dossier'});
  await search.fill(setup.client);
  assert.equal(await page.locator('.scope-dossier-card').count(),1);
  const confirmedKpi=page.getByRole('button',{name:/Confirmés/});
  await confirmedKpi.click();
  assert.equal(await confirmedKpi.getAttribute('aria-pressed'),'true');
  await page.getByText('Aucun dossier pour cette recherche et ce filtre.').waitFor();
  await page.getByLabel('Filtrer par statut').selectOption('all');
  await page.locator('.scope-dossier-card').click();
  await page.waitForURL(locationOf(setup.id));
  assert.equal(await page.locator('.scope-dossier-card').count(),0);
  await button(page,'Numéro manquant').waitFor();
  await page.getByText('Agenda non connecté',{exact:true}).waitFor();
  await page.getByLabel('À partir du').fill(setup.start);
  const slots=page.locator('.scope-slot');
  assert.equal(await slots.count(),6);
  await button(page,'Voir plus').click();
  assert.ok(await slots.count()>6);
  await button(page,'Voir moins').click();
  assert.equal(await slots.count(),6);
  for(let i=0;i<4;i++)await slots.nth(i).click();
  assert.equal(await page.locator('.scope-slot.is-selected').count(),4);

  await page.evaluate(()=>{setRole('trainer-1');go('trainer-scoping');});
  assert.equal(await page.locator('.scope-detail').count(),0);
  await page.locator('.scope-dossier-card').filter({hasText:setup.client}).click();
  assert.equal(await button(page,'Accepter').count(),0);
  await page.evaluate(id=>{setRole('amo');openAmoScoping(id);},setup.id);
  await button(page,'Proposer ces créneaux').click();
  let dialog=page.getByRole('dialog',{name:'Proposer ces créneaux'});
  assert.match(await dialog.getByLabel('Message à transmettre au formateur').inputValue(),/Certif-IA/);
  await page.evaluate(()=>{
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('test');}}});
  });
  await button(dialog,'Copier le message').click();
  await dialog.getByText(/Copie automatique indisponible/).waitFor();
  assert.equal(await page.evaluate(id=>db.scoping.calls['F'+id].proposals.filter(s=>s.sentAt).length,setup.id),0);
  await page.evaluate(()=>{
    const set=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      if(key===DEMO_KEY)throw new DOMException('Test','QuotaExceededError');
      return set.call(this,key,value);
    };
    window.restoreScopeStorage=()=>{Storage.prototype.setItem=set;};
  });
  await button(dialog,'J’ai envoyé les propositions').click();
  await dialog.getByText(/Enregistrement impossible/).waitFor();
  assert.equal(await page.evaluate(id=>db.scoping.calls['F'+id].proposals.filter(s=>s.sentAt).length,setup.id),0);
  await page.evaluate(()=>window.restoreScopeStorage());
  await button(dialog,'J’ai envoyé les propositions').click();
  await page.getByText('Dernier envoi déclaré',{exact:true}).waitFor();
  assert.equal(await page.locator('.scope-follow-slot').getByText('En attente',{exact:true}).count(),4);
  await page.screenshot({animations:'disabled',path:`${output}/suivi-transmis-1440.png`});
  await button(page,'Relancer le formateur').click();
  dialog=page.getByRole('dialog',{name:'Relancer le formateur'});
  await dialog.getByText('Notifications push à connecter',{exact:true}).waitFor();
  assert.equal(await button(dialog,'Envoyer la relance').isDisabled(),true);
  await button(dialog,'Annuler').click();
  await page.evaluate(id=>{
    const record=db.scoping.calls['F'+id];
    record.reminders=[{at:new Date().toISOString(),trainerId:1,channel:'push',author:'Test',status:'accepted'}];
    render();
  },setup.id);
  await page.getByText('Relance bloquée pendant le délai de 24 h.').waitFor();
  await page.evaluate(id=>{delete db.scoping.calls['F'+id].reminders;setRole('trainer-1');go('trainer-scoping');},setup.id);
  await page.getByRole('button',{name:/^À répondre/}).click();
  await page.locator('.scope-dossier-card').filter({hasText:setup.client}).click();
  assert.equal(await page.locator('.scope-dossier-card').count(),0);
  await page.reload();
  await page.waitForURL(url+'#/formateur/trainer-scoping/'+setup.id);
  await button(page,'Refuser').first().click();
  await button(page,'Accepter').nth(1).click();
  await button(page,'Accepter').nth(2).click();
  const alternate=await page.evaluate(()=>shiftDate(parisToday(),17));
  await page.getByText('Proposer un autre créneau',{exact:true}).click();
  await page.locator('#scope-alt-date').fill(alternate);
  await page.getByRole('button',{name:/Soumettre à l.AMO/}).click();
  await page.getByText('Créneau alternatif proposé à l’AMO dans la démonstration').waitFor();
  await page.evaluate(id=>{setRole('amo');openAmoScoping(id);},setup.id);
  assert.equal(await button(page,'Confirmer ce créneau').count(),2);
  await page.getByText('Refusé par le formateur',{exact:true}).waitFor();
  await button(page,'Ajouter aux propositions').click();
  assert.equal(await button(page,'Confirmer ce créneau').count(),3);
  await button(page,'Confirmer ce créneau').first().click();
  dialog=page.getByRole('dialog',{name:'Confirmer le créneau'});
  await page.evaluate(id=>{
    const slot=db.scoping.calls['F'+id].proposals[1];
    db.availability.push({id:'QA-conflict-cadrage',trainerId:1,date:slot.date,start:slot.start,end:slot.end,status:'Occupé'});
  },setup.id);
  await button(dialog,'Valider ce créneau').click();
  await dialog.getByText(/Le créneau est désormais occupé/).waitFor();
  await button(dialog,'Annuler').click();
  await button(page,'Confirmer ce créneau').nth(1).click();
  await button(page,'Valider ce créneau').click();
  await page.locator('.scope-success').getByText('Call confirmé',{exact:true}).waitFor();
  await page.setViewportSize({width:390,height:900});
  await page.screenshot({animations:'disabled',path:`${output}/suivi-confirme-390.png`});
  await page.setViewportSize({width:1440,height:900});
  assert.equal(await button(page,'Relancer le formateur').count(),0);
  await page.locator('.scope-timeline').getByText(/Envoi déclaré par l’AMO/).waitFor();
  await button(page,'Préparer le call').click();
  await page.getByRole('heading',{name:'Documents & synthèse du cadrage'}).waitFor();
  await button(page,'Compte rendu').click();
  await page.getByLabel('Compte rendu du cadrage').fill('Observations factuelles et compte rendu testé.');
  await button(page,'Enregistrer le brouillon').click();
  await page.getByText('Compte rendu enregistré dans ce navigateur.').waitFor();

  await page.reload();
  await page.waitForURL(locationOf(setup.id));
  await button(page,'Compte rendu').click();
  assert.match(await page.getByLabel('Compte rendu du cadrage').inputValue(),/compte rendu testé/);
  await page.evaluate(()=>{setRole('trainer-1');go('trainer-scoping');});
  await page.locator('.scope-dossier-card').filter({hasText:setup.client}).click();
  await page.getByText(/Call confirmé le/).waitFor();
  await page.setViewportSize({width:390,height:900});
  await page.screenshot({animations:'disabled',path:`${output}/formateur-confirme-390.png`});
  await page.setViewportSize({width:1440,height:900});
  await button(page,'Retour à mes calls').click();
  await page.getByRole('heading',{name:'Mes calls de cadrage'}).waitFor();

  await page.evaluate(id=>{setRole('amo');openAmoScoping(id);},setup.other);
  await page.getByText('Affectez un formateur avant de préparer les créneaux.').waitFor();
  await page.evaluate(id=>{
    const f=formations.find(f=>f.id===id), date=shiftDate(parisToday(),12);
    db.sessions.push({id:994,formationId:id,date,start:'09:00',end:'17:00',status:'Planifiée',city:'Paris',required:1});
    db.assignments.push({id:'QA-scoping-other',trainerId:4,sessionId:994,status:'Confirmée'});
    for(let offset=0;offset<14;offset++)db.availability.push({id:'QA-busy-'+offset,trainerId:4,date:shiftDate(parisToday(),offset),status:'Occupé'});
    render();
  },setup.other);
  await page.getByText(/Aucun créneau trouvé sur cette période/).waitFor();
  await page.evaluate(id=>{
    db.scoping.calls['F'+id]={status:'pending',duration:30,formationId:id,history:[],proposals:[
      {date:shiftDate(parisToday(),-2),start:'09:00',end:'09:30',recipientId:4,sentAt:new Date(Date.now()-3*86400000).toISOString()}]};
    render();
  },setup.other);
  await button(page,'Suivi').click();
  await page.getByText('Expiré',{exact:true}).waitFor();
  assert.equal(await button(page,'Relancer le formateur').count(),0);
  await button(page,'Retour aux dossiers').click();
  await page.getByRole('heading',{name:'Calls de cadrage',exact:true}).waitFor();
  await page.close();

  for(const width of [1440,1024,768,430,390,375,320]){
    const screen=await makePage(width);
    await screen.goto(locationOf());
    for(const theme of ['light','dark']){
      await screen.evaluate(theme=>applyHubTheme(theme),theme);
      await screen.locator('.scope-dossier-card').first().waitFor();
      assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Cockpit ${width} ${theme}`);
      if([1440,390].includes(width))await screen.screenshot({animations:'disabled',path:`${output}/cockpit-${width}-${theme}.png`});
      await screen.locator('.scope-dossier-card').first().click();
      assert.equal(await screen.locator('.scope-dossier-card').count(),0);
      for(const tab of ['Planification','Suivi','Préparation','Compte rendu']){
        await button(screen,tab).click();
        assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${tab} ${width} ${theme}`);
      }
      if([1440,390].includes(width)){
        await button(screen,'Suivi').click();
        await screen.screenshot({animations:'disabled',path:`${output}/dossier-${width}-${theme}.png`});
      }
      await button(screen,'Retour aux dossiers').click();
      await screen.evaluate(()=>{setRole('trainer-1');go('trainer-scoping');});
      await screen.locator('.scope-dossier-card').first().waitFor();
      assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Formateur liste ${width} ${theme}`);
      await screen.locator('.scope-dossier-card').first().click();
      await button(screen,'Note de cadrage').click();
      assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Formateur dossier ${width} ${theme}`);
      await screen.goto(locationOf());
    }
    if(width<=430)assert.equal(await screen.locator('.mobile-dock button:visible').count(),5);
    await screen.close();
    console.log(`OK ${width}px · cockpit et quatre étapes, clair et sombre`);
  }

  if(engine===chromium){
    const offline=await makePage(390,'allow');
    await offline.goto(locationOf());
    await offline.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    assert.ok(await offline.evaluate(async()=> (await caches.keys()).includes('certifia-hub-demo-v67-trainer-scoping-heading')));
    await offline.context().setOffline(true);
    await offline.reload();
    await offline.locator('.scope-dossier-card').first().click();
    await button(offline,'Suivi').click();
    await offline.getByRole('heading',{name:'Suivi des propositions',exact:true}).waitFor();
    await offline.close();
    console.log('OK PWA · parcours cadrage hors ligne');
  }
  assert.deepEqual(errors,[]);
  console.log('OK propositions, suivi, relance désactivée, confirmation, préparation et compte rendu');
}finally{await browser.close();}
