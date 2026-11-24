import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium, webkit} from 'playwright';

const url = process.env.HUB_URL || 'http://127.0.0.1:8787/';
const output = process.env.QA_OUTPUT || '/tmp/certif-amo-phase1-qa';
const browser = process.env.QA_ENGINE === 'webkit'
  ? await webkit.launch() : await chromium.launch({executablePath: process.env.CHROME_PATH});
const widths = [1440, 1024, 768, 390, 375, 320];
const button = (page, name) => page.getByRole('button', {name, exact:true});
const storage = 'certifia-hub-html-v1-demo';
const route = (page, path) => page.goto(url + '#/' + path, {waitUntil:'load'});
const main = page => page.locator('#main-content');
const text = (page, value) => main(page).getByText(value, {exact:true});
const clean = page => page.evaluate(() => {
  db.sessions = [];
  db.assignments = [];
  db.deliverables = [];
  db.scoping = {calls:{}};
  for (const f of formations) f.status = 'Annulée';
  render();
});
await mkdir(output, {recursive:true});

try {
  const page = await browser.newPage({viewport:{width:1440,height:900}, serviceWorkers:'block', reducedMotion:'reduce'});
  page.setDefaultTimeout(9000);
  await page.route(/^https:\/\/fonts\./, r => r.abort());
  const errors = [];
  page.on('pageerror', error => {errors.push(error.message); console.error(error.stack);});
  await route(page, 'interne/home');
  await page.locator('.amo-alerts').waitFor();
  const baseline = await page.evaluate(() => structuredClone(db));
  const statuses = await page.evaluate(() => formations.map(f => f.status));
  await clean(page);
  await text(page, 'Aucune intervention prioritaire').waitFor();
  assert.equal(await page.locator('.amo-alert-row').count(), 0);
  assert.doesNotMatch(await main(page).innerText(), /Documents à suivre/);

  const data = await page.evaluate(() => {
    const [first, second, past, closed] = formations;
    const pending = {...closed,id:'QA-PENDING',title:'Formation en attente'};
    formations.push(pending);
    const today = parisToday();
    const addSession = (f, id, offset) => {
      f.status = 'Planifiée';
      db.sessions.push({id,formationId:f.id,date:shiftDate(today,offset),start:'09:00',end:'12:00',
        status:offset < 0 ? 'Réalisée' : 'Planifiée',city:'Paris',required:1});
    };
    addSession(first, 901, 7);
    addSession(second, 902, 10);
    addSession(past, 903, -12);
    addSession(closed, 904, -15);
    addSession(pending, 905, -10);
    db.assignments.push({id:'QA-review',sessionId:902,trainerId:1,status:'À revalider'});
    db.scoping.calls['F'+second.id] = {status:'pending',proposals:[],duration:30,contact:{},checklist:{},history:[],actions:[]};
    const make = (f, id, skip, pending = null) => documentColumns.filter(([key]) => key !== skip).map(([key,label]) => ({
      id:'QA-'+id+'-'+key,formationId:f.id,sessionId:id,title:label,type:key,owner:'interne',
      status:key === pending ? 'En vérification' : 'Validé',versions:[{number:1,filename:'document.pdf'}]
    }));
    db.deliverables = [
      ...make(first,901,'PROGRAMME'), ...make(past,903,'BILANS'),
      ...make(closed,904,null), ...make(pending,905,null,'BILANS')
    ];
    db.deliverables.push({id:'QA-na',formationId:closed.id,sessionId:904,title:'Annexe facultative',
      type:'ANNEXE',status:'Non applicable',versions:[]});
    render();
    return {first:first.title, second:second.id, past:past.title, closed:closed.title, pending:pending.title};
  });
  await page.locator('.amo-more-alerts summary').click();
  for (const title of ['Livrable obligatoire manquant à J-7','Formation imminente sans staffing confirmé',
    'Call de cadrage non planifié','Call en attente de confirmation','Dossier de formation incomplet','Affectation à revalider']) {
    await text(page, title).first().waitFor();
  }
  assert.equal(await text(page,'Livrable obligatoire manquant à J-7').count(),1);
  await button(page,'Ouvrir les livrables').click();
  await page.getByRole('dialog').getByText('Dossier de livrables',{exact:true}).waitFor();
  await page.getByRole('dialog').getByRole('button',{name:'Fermer',exact:true}).last().click();
  await page.locator('.amo-more-alerts summary').click();
  await text(page,'Call en attente de confirmation').locator('../..').getByRole('button').click();
  await page.waitForURL('**/scoping-calls');
  assert.equal(await page.evaluate(() => state.scopingSelected),data.second);
  await route(page,'interne/documents');
  const filter = main(page).getByRole('combobox',{name:'Filtrer'});
  assert.equal(await filter.inputValue(),'open');
  const rows = main(page).locator('.v19-matrix tbody tr');
  const has = (title) => rows.filter({hasText:title}).count();
  assert.equal(await has(data.past),1);
  assert.equal(await has(data.closed),0);
  assert.equal(await has(data.pending),1);
  await filter.selectOption('pending');
  assert.equal(await has(data.pending),1);
  assert.equal(await has(data.past),0);
  await filter.selectOption('completed');
  assert.equal(await has(data.closed),1);
  await filter.selectOption('all');
  assert.equal(await has(data.past),1);
  assert.equal(await has(data.closed),1);
  await page.evaluate(() => {
    const d = db.deliverables.find(d => d.id === 'QA-904-PROGRAMME');
    d.versions[0].filename = 'programme.docx';
    render();
  });
  await filter.selectOption('open');
  assert.equal(await has(data.closed),1);
  await page.evaluate(() => {
    const d = db.deliverables.find(d => d.id === 'QA-904-PROGRAMME');
    d.versions[0].filename = 'programme.pdf';
    db.deliverables.push({id:'QA-extra',formationId:d.formationId,sessionId:d.sessionId,title:'Annexe requise',
      type:'ANNEXE',status:'Refusé',versions:[{number:1,filename:'annexe.pdf'}]});
    render();
  });
  assert.equal(await has(data.closed),1);

  await page.evaluate(({baseline,statuses}) => {
    formations.pop();
    formations.forEach((f,i) => f.status=statuses[i]);
    Object.assign(db,baseline);
    save();
  },{baseline,statuses});
  await route(page,'interne/trainers');
  const cards = page.locator('.amo-trainer-card');
  assert.ok(await cards.count() > 0);
  assert.doesNotMatch(await main(page).innerText(),/Gains estimés/);
  assert.ok(await cards.filter({hasText:'Non renseignée'}).count() > 0);
  const withoutNps = cards.filter({has:page.locator('.hub-v2-kpi strong').getByText('—',{exact:true})}).first();
  await withoutNps.getByRole('button',{name:'Voir la fiche'}).click();
  await button(page,'Performances').click();
  assert.doesNotMatch(await main(page).innerText(),/Gains estimés/);
  await button(page,'Présentation client').click();
  await text(page,'Biographie à compléter').waitFor();
  const preview = page.getByRole('article',{name:'Aperçu client'});
  assert.doesNotMatch(await preview.innerText(),/Carton|Fiabilité|TJM|@/);
  await button(page,'Modifier la présentation').click();
  await page.getByLabel('Fonction ou spécialité').fill('Formation professionnelle');
  await button(page,'Enregistrer et prévisualiser').click();
  await text(page,'Biographie à compléter').waitFor();
  assert.equal(await button(page,'Copier le texte').count(),0);
  await button(page,'Modifier la présentation').click();
  await page.getByLabel('Biographie',{exact:true}).fill('Anime des formations professionnelles.');
  await button(page,'Enregistrer et prévisualiser').click();
  await preview.getByText('Anime des formations professionnelles.',{exact:true}).waitFor();
  const download = page.waitForEvent('download');
  await button(page,'Exporter le texte').click();
  assert.equal((await download).suggestedFilename(),'presentation-formateur.txt');
  await button(page,'Préparer un message').click();
  assert.match(await page.getByLabel('Corps du message').inputValue(),/Anime des formations professionnelles/);
  assert.doesNotMatch(await page.getByLabel('Corps du message').inputValue(),/Carton|Fiabilité|TJM|@/);
  await page.getByRole('dialog').getByRole('button',{name:'Fermer',exact:true}).last().click();
  if (process.env.QA_ENGINE !== 'webkit') {
    await page.context().grantPermissions(['clipboard-read','clipboard-write']);
    await button(page,'Copier le texte').click();
    await page.getByRole('status').getByText('Présentation copiée.').waitFor();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()),/Anime des formations professionnelles/);
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await button(page,'Présentation client').click();
  await preview.getByText('Anime des formations professionnelles.',{exact:true}).waitFor();
  await route(page,'formateur/trainer-profile');
  assert.match(await main(page).innerText(),/Gains estimés/);
  assert.doesNotMatch(await main(page).innerText(),/Présentation client/);
  await page.evaluate(key => localStorage.removeItem(key),storage);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('OK alertes, dossiers, annuaire, biographie, export et portail Formateur');

  for (const width of widths) {
    const screen = await browser.newPage({viewport:{width,height:900}, serviceWorkers:'block', reducedMotion:'reduce'});
    screen.setDefaultTimeout(9000);
    await screen.route(/^https:\/\/fonts\./, r => r.abort());
    const errors = [];
    screen.on('pageerror', error => errors.push(error.message));
    for (const theme of ['light','dark']) {
      for (const name of ['home','documents','trainers','trainer-detail/1','planning']) {
        await route(screen,'interne/'+name);
        await screen.evaluate(theme => {
          localStorage.setItem('certifia-hub-theme',theme);
        }, theme);
        await screen.reload({waitUntil:'domcontentloaded'});
        await main(screen).locator('h1').first().waitFor();
        if (name === 'home') {
          const day = screen.locator('#main-content [data-preview-day]').first();
          await day.click();
          assert.equal(await day.getAttribute('aria-pressed'),'true');
          await button(screen,'Ouvrir le planning').click();
          await screen.waitForURL('**/planning');
          await route(screen,'interne/home');
        }
        if (name.startsWith('trainer-detail')) await button(screen,'Présentation client').click();
        assert.equal(await screen.locator('html').getAttribute('data-hub-tone'),theme);
        const overflow = await screen.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow,false,`Débordement ${width}px / ${theme} / ${name}`);
        if ([1440,390].includes(width)) {
          await screen.screenshot({animations:'disabled',path:`${output}/apres-${name.replace('/','-')}-${width}-${theme}.png`});
        }
      }
    }
    assert.deepEqual(errors,[]);
    await screen.close();
    console.log(`OK ${width}px, cinq écrans et deux thèmes`);
  }
} finally {
  await browser.close();
}
