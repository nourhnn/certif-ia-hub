import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';

const url=process.env.HUB_URL||'http://127.0.0.1:8787/';
const output=process.env.QA_OUTPUT||'/tmp/certif-phase3-captures';
const engine=process.env.QA_ENGINE==='webkit'?webkit:chromium;
const browser=await engine.launch(engine===chromium?{executablePath:process.env.CHROME_PATH,
  args:['--host-resolver-rules=MAP fonts.googleapis.com ~NOTFOUND, MAP fonts.gstatic.com ~NOTFOUND']}:{});
const button=(scope,name)=>scope.getByRole('button',{name,exact:true});
const errors=[];
await mkdir(output,{recursive:true});

try{
  const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1440,height:900}});
  page.setDefaultTimeout(8000);
  page.on('pageerror',error=>{errors.push(error.message);console.error(error.stack);});
  await page.route(/^https:\/\/fonts\./,route=>route.abort());
  await page.goto(url+'#/interne/reporting');
  await page.getByRole('heading',{name:'Reporting AMO.'}).waitFor();
  await page.evaluate(()=>{
    const first=formations[0], second=formations[1];
    const sibling={...first,id:'QA-MULTI',title:'Formation complémentaire'};
    const unknown={...first,id:'QA-NOCLIENT',clientId:null,title:'Client à identifier'};
    formations.push(sibling,unknown);
    const fixtures=[[901,first.id,'2027-01-04',9,4,5],[902,first.id,'2027-01-05',5,null,null],
      [903,sibling.id,'2027-01-11',null,2,null],[904,second.id,'2027-01-15',8,null,3],
      [905,second.id,'2027-02-04',11,6,null],[906,unknown.id,'2027-01-17',null,null,null]];
    for(const [id,formationId,date,nps,formation5,satisfaction5] of fixtures){
      db.sessions.push({id,formationId,date,start:'09:00',end:'17:00',city:'Paris',status:'Réalisée',required:1,people:8});
      db.assignments.push({id:'QA-'+id,sessionId:id,trainerId:1,status:'Réalisée'});
      missionRatings['QA-'+id]={nps,formation5,satisfaction5,public:true};
    }
    state.monthlyMonth='2027-01';
    render();
  });
  const kpi=(label)=>page.locator('.report-stats .metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
  assert.equal(await kpi('Clients distincts').innerText(),'2');
  assert.equal(await kpi('Sessions').innerText(),'5');
  assert.equal(await kpi('Formations').innerText(),'4');
  assert.equal(await kpi('Formateurs mobilisés').innerText(),'1');
  assert.equal(await kpi('NPS moyen /10').innerText(),'7,3');
  assert.equal(await kpi('Formation /5').innerText(),'3');
  assert.equal(await kpi('Satisfaction Formateur /5').innerText(),'4');
  assert.equal(await kpi('Promoteurs').innerText(),'1');
  assert.equal(await kpi('Détracteurs').innerText(),'1');
  assert.equal(await kpi('Réponses NPS exploitables').innerText(),'3');
  const clientRows=page.locator('.report-clients tbody tr');
  assert.ok((await clientRows.allTextContents()).some(line=>line.includes('Non renseigné')));
  const firstClient=await page.evaluate(()=>clientOf(formations[0]).name);
  assert.deepEqual((await clientRows.filter({hasText:firstClient}).locator('td').allTextContents()).slice(1,3),['3','2']);

  await button(page,'Semaine').click();
  await page.getByLabel('Jour de la semaine').fill('2027-01-06');
  await page.locator('.report-period-nav strong').waitFor();
  assert.equal(await kpi('Sessions').innerText(),'2');
  assert.equal(await kpi('NPS moyen /10').innerText(),'7');
  await page.getByLabel('Jour de la semaine').fill('2027-03-11');
  assert.equal(await kpi('Sessions').innerText(),'0');
  assert.equal(await kpi('NPS moyen /10').innerText(),'Non renseigné');
  await button(page,'Trimestre').click();
  await page.locator('.report-fields input').fill('2027');
  await page.locator('.report-fields select').selectOption('1');
  await button(page,'Afficher').click();
  assert.equal(await kpi('Sessions').innerText(),'6');
  assert.equal(await kpi('Réponses NPS exploitables').innerText(),'3');

  await page.evaluate(()=>{setRole('trainer-1');go('trainer-docs');});
  const feedback=page.getByRole('dialog');
  await page.route('**/api/retours-formateur/synthese',async route=>{
    const {day,text}=route.request().postDataJSON();
    assert.equal(day,1);
    assert.ok(text.includes('participants'));
    await route.fulfill({json:{summary:'### Déroulé et participation\nLes exercices ont été réalisés.\n### Ce qui a bien fonctionné\nParticipation active.\n### Difficultés et points de vigilance\nDes questions restent ouvertes.\n### Ajustements proposés pour J2\nReprendre les cas internes.'}});
  });
  const feedbackText='Les participants ont pris en main les outils. Nous avons fait les exercices prévus et consigné les questions soulevées pendant la formation.';
  for(const [id,choice] of [[901,'no'],[904,'yes'],[906,'review']]){
    await page.evaluate(id=>openModal('trainer-feedback',id+':1:1'),id);
    await feedback.getByLabel('Votre retour').fill(feedbackText);
    if(id===901){
      await button(feedback,'Envoyer à l’AMO').click();
      await page.getByText('Répondez à la question sur les besoins complémentaires.').waitFor();
    }
    await feedback.getByLabel('Opportunité d’upsell').selectOption(choice);
    if(choice!=='no'){
      await feedback.getByLabel('Description du besoin').fill('Évaluer un atelier avancé sur les cas internes.');
      await feedback.getByLabel('Commentaire du formateur').fill('Deux participants ont demandé un atelier supplémentaire.');
    }
    if(choice==='yes'){
      await button(feedback,'Générer la synthèse').click();
      await feedback.getByText('Synthèse prête à relire.').waitFor();
      assert.equal(await feedback.locator('[data-feedback-preview] h3').count(),4);
    }
    await button(feedback,'Envoyer à l’AMO').click();
    await feedback.waitFor({state:'hidden'});
  }

  await page.evaluate(()=>{setRole('amo');go('reporting');});
  assert.equal(await kpi('Opportunités d’upsell').innerText(),'2');
  const opportunities=page.locator('.report-opportunity');
  const incomplete=opportunities.filter({hasText:'Client non renseigné'});
  await incomplete.getByText(/À confirmer/).waitFor();
  await incomplete.getByLabel('Statut').selectOption('Transmise aux Sales');
  await button(incomplete,'Lire le retour').click();
  await feedback.getByText('Besoins complémentaires',{exact:true}).waitFor();
  assert.match(await feedback.innerText(),/atelier supplémentaire/);
  await page.keyboard.press('Escape');
  await feedback.waitFor({state:'hidden'});

  const files={};
  for(const action of ['Rapport animé','Tableau détaillé','Exporter le CSV']){
    const event=page.waitForEvent('download');
    await button(page,action).click();
    const download=await event;
    assert.match(download.suggestedFilename(),/2027-01-01_2027-03-31/);
    files[action]=await readFile(await download.path(),'utf8');
  }
  assert.match(files['Rapport animé'],/Sessions dans la période/);
  assert.match(files['Rapport animé'],/NPS moyen \/10<\/span><strong>7,3/);
  assert.match(files['Tableau détaillé'],/Transmise aux Sales/);
  assert.match(files['Exporter le CSV'],/^\uFEFF/);
  assert.match(files['Exporter le CSV'],/"NPS moyen \/10";"7,3"/);
  assert.match(files['Exporter le CSV'],/atelier supplémentaire/);
  assert.match(files['Exporter le CSV'],/Non renseigné/);

  await page.evaluate(()=>{db.internalReviews=db.internalReviews.filter(r=>r.trainerId!==1);state.trainerDetailTab='internal';openTrainer(1);});
  const review=page.locator('.internal-review-form');
  const history=page.locator('.review-history');
  async function add(kind,memo){
    await review.getByLabel('Nature').selectOption(kind);
    await review.getByLabel('Justificatif / contexte').fill(memo);
    await button(review,'Enregistrer').click();
    await history.getByText(memo,{exact:true}).first().waitFor();
  }
  await add('carton','Premier avertissement documenté.');
  assert.equal(await history.locator('.carton-review.jaune').count(),1);
  await add('carton','Deuxième avertissement documenté.');
  assert.equal(await history.locator('.carton-review.rouge').count(),1);
  assert.equal(await history.locator('.carton-review.jaune').count(),0);
  const withdraw=async (summary,reason)=>{
    const details=history.locator('details').filter({has:page.getByText(summary,{exact:true})});
    await details.getByText(summary,{exact:true}).click();
    await details.getByLabel('Motif du retrait').fill(reason);
    await button(details,'Confirmer le retrait').click();
    await history.getByText(reason,{exact:true}).waitFor();
  };
  await withdraw('Retirer le carton','Retrait après revue contradictoire.');
  assert.equal(await history.locator('.carton-review.rouge').count(),0);
  await add('bonus','Excellence pédagogique documentée.');
  assert.equal(await page.evaluate(()=>{state.reportMode='month';state.monthlyMonth=parisToday().slice(0,7);return monthlyReport().bonuses.filter(b=>b.trainerId===1).length;}),1);
  assert.equal(await page.evaluate(()=>reliabilityScore(trainerById(1)).bonuses),1);
  await withdraw('Retirer le bonus','Retrait après contrôle du justificatif.');
  assert.equal(await page.evaluate(()=>monthlyReport().bonuses.filter(b=>b.trainerId===1).length),0);
  assert.equal(await page.evaluate(()=>reliabilityScore(trainerById(1)).bonuses),0);
  await page.evaluate(()=>{setRole('trainer-1');go('trainer-profile');});
  assert.doesNotMatch(await page.locator('#main-content').innerText(),/avertissement documenté|Excellence pédagogique documentée|Transmise aux Sales/);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('OK périodes, KPI, trois exports, cartons, bonus, upsell et visibilité');

  for(const width of [1440,1024,768,390,375,320]){
    const screen=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width,height:900}});
    screen.on('pageerror',error=>errors.push(error.message));
    await screen.route(/^https:\/\/fonts\./,route=>route.abort());
    await screen.goto(url+'#/interne/reporting');
    for(const theme of ['light','dark']){
      await screen.evaluate(theme=>applyHubTheme(theme),theme);
      await screen.locator('.report-clients').waitFor();
      assert.equal(await screen.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px · ${theme}`);
      if([1440,390].includes(width))await screen.screenshot({animations:'disabled',path:`${output}/reporting-${width}-${theme}.png`});
    }
    await screen.close();
    console.log(`OK ${width}px · clair et sombre`);
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();}
