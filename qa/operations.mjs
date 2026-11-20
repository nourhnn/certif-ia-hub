import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit, devices } from 'playwright';

const url = process.env.HUB_URL || 'http://127.0.0.1:8787/';
const output = process.env.QA_OUTPUT || '/tmp/certifia-operations-qa';
const useWebKit = process.env.QA_ENGINE === 'webkit';
const options = useWebKit ? {} : { executablePath: process.env.CHROME_PATH };
const browser = await (useWebKit ? webkit : chromium).launch(options);
const results = [];
const button = (scope, name) => scope.getByRole('button', { name, exact: typeof name === 'string' });
const dialog = page => page.getByRole('dialog');
const inbox = async page => {
  await button(page,/^Notifications/).click();
  await dialog(page).getByRole('heading',{name:'Centre de notifications'}).waitFor();
  return dialog(page);
};
const proposal = page => page.locator('#staff-proposal-P2');
const storage = 'certifia-hub-html-v1-demo';
await mkdir(output,{recursive:true});

async function run(name, test, viewport={width:390,height:844}) {
  const context = await browser.newContext({
    ...(viewport.width<=430?devices['iPhone 13']:{}),
    ...(viewport.width<=430&&!useWebKit?{defaultBrowserType:'chromium'}:{}),
    viewport, reducedMotion:'reduce', serviceWorkers:'block'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on('pageerror', error=>errors.push(error.message));
  try {
    await test(page);
    assert.deepEqual(errors,[]);
    results.push({name,passed:true});
  } catch (error) {
    results.push({name,passed:false,error:String(error),errors});
  } finally {
    console.log(results.at(-1));
    await context.close();
  }
}

async function chooseRole(page, target) {
  if(target==='amo') return page.getByRole('combobox',{name:'Changer d’espace'}).selectOption('amo');
  await button(page,'Plus').click();
  await page.getByLabel('Changer de profil démo').selectOption('trainer-'+target);
  await page.waitForURL('**/#/formateur/trainer-home');
}

async function prepare(page) {
  await page.goto(url+'#/interne/staffing');
  const candidate = page.locator('.staffing-profile').first();
  await candidate.waitFor();
  const action = button(candidate,/Préparer une proposition/);
  const id = Number((await action.getAttribute('onclick')).match(/\d+/)[0]);
  await action.click();
  await button(dialog(page),'Créer le brouillon').click();
  await dialog(page).getByRole('heading',{name:/Brouillon WhatsApp/}).waitFor();
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({state:'hidden'});
  assert.equal(await button(proposal(page),'Simuler l’envoi').count(),0);
  await button(proposal(page),'Autoriser').click();
  await button(dialog(page),'Autoriser la proposition').click();
  await button(proposal(page),'Simuler l’envoi').click();
  return id;
}

try {
  if (!useWebKit) {
    await run('Staffing · autorisation, réponse, confirmation et remplacement', async page=>{
      const trainer = await prepare(page);
      await chooseRole(page,trainer);
      const messages = await inbox(page);
      const notice = messages.locator('li').filter({hasText:'Nouvelle proposition de mission'}).first();
      await button(notice,'Ouvrir').click();
      await page.waitForURL('**/#/formateur/trainer-missions');
      await button(page,'Accepter').first().click();
      await button(page.getByRole('navigation',{name:'Navigation principale sur téléphone'}),'Profil').click();
      await chooseRole(page,'amo');
      const incoming = await inbox(page);
      await button(incoming.locator('li').filter({hasText:'Proposition acceptée'}).first(),'Ouvrir').click();
      await page.waitForURL('**/#/interne/staffing');
      await button(proposal(page),'Confirmer').click();
      await button(dialog(page),'Confirmer l’affectation').click();
      const status = await page.evaluate(storage=>JSON.parse(localStorage.getItem(storage)).data.assignments.find(a=>a.proposalId==='P2')?.status,storage);
      assert.equal(status,'Confirmée');
      await button(page,/^Confirmées/).click();
      await button(page,'Remplacer').last().click();
      await button(dialog(page),'Remplacer le formateur').click();
      const data = await page.evaluate(storage=>JSON.parse(localStorage.getItem(storage)).data,storage);
      assert.equal(data.assignments.find(a=>a.proposalId==='P2').status,'Remplacée');
      assert.equal(data.proposals.find(p=>p.id==='P2').status,'Retirée');
    });

    await run('Staffing · refus archivé et conflit d’agenda bloquant', async page=>{
      const trainer = await prepare(page);
      await chooseRole(page,trainer);
      await button(page,'Missions').click();
      await page.evaluate(()=>{
        const proposal=db.proposals.find(p=>p.id==='P2');
        const session=sessionById(proposal.sessionId);
        db.calendarEvents ||= [];
        db.calendarEvents.push({id:'qa-block',title:'Indisponibilité QA',trainerId:proposal.trainerId,date:session.date,start:session.start,end:session.end});
        save();
      });
      await button(page,'Accepter').first().click();
      await page.getByRole('status').filter({hasText:'Conflit'}).waitFor();
      await button(page,'Refuser').first().click();
      await button(page.getByRole('navigation',{name:'Navigation principale sur téléphone'}),'Profil').click();
      await chooseRole(page,'amo');
      const panel = await inbox(page);
      await button(panel.locator('li').filter({hasText:'Proposition refusée'}).first(),'Ouvrir').click();
      await proposal(page).getByText('Refusée',{exact:true}).waitFor();
    });

    await run('Staffing · absence de réponse et clôture explicite',async page=>{
      await page.goto(url+'#/interne/staffing');
      await button(page,/^Propositions en cours/).click();
      const late = page.locator('#staff-proposal-P1');
      await late.getByText(/Réponse en retard/).waitFor();
      await button(late,'Clôturer sans réponse').click();
      await button(dialog(page),'Clôturer sans réponse').click();
      await page.getByText(/^Historique/).click();
      await late.getByText('Expirée',{exact:true}).waitFor();
      const panel=await inbox(page);
      await panel.getByRole('heading',{name:'Proposition sans réponse'}).waitFor();
    });

    await run('Notifications · filtres, lecture et persistance', async page=>{
      await page.goto(url);
      const panel = await inbox(page);
      await panel.getByLabel('Type',{exact:true}).selectOption('alert');
      const first = panel.locator('li.ops-notice').first();
      await first.getByText('Alerte',{exact:true}).waitFor();
      await button(first,'Marquer comme lue').click();
      await first.getByText(/· Lue/).waitFor();
      await button(panel,'Tout marquer comme lu').click();
      await panel.getByLabel('Non lues uniquement').check();
      await panel.getByText('Aucune notification pour ces filtres.',{exact:true}).waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(()=>document.activeElement.dataset.opsTrigger),'notifications');
      await page.reload();
      assert.equal(await button(page,'Notifications').count(),1);
    });

    await run('Relances · délai 48 h, doublons et annulation après dépôt', async page=>{
      await page.goto(url+'#/interne/documents');
      await page.evaluate(()=>{
        simulatePwaReminder('D2');
        simulatePwaReminder('D2');
        simulatePwaReminder('D6');
        openModal('upload-internal','D6');
      });
      await dialog(page).locator('input[type=file]').setInputFiles({
        name:'programme-qa.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4')
      });
      await button(dialog(page),'Déposer le fichier').click();
      await dialog(page).getByText('programme-qa.pdf',{exact:true}).waitFor();
      const counts = await page.evaluate(()=>{
        const eligible=db.reminders.find(r=>r.deliverableId==='D2');
        eligible.at=new Date(Date.now()-49*3600000).toISOString();
        const first=recordReminderResolution();
        const second=recordReminderResolution();
        return {first,second,pwa:db.reminders.filter(r=>r.channel==='PWA').length,
          whatsapp:db.reminders.filter(r=>r.channel==='WhatsApp').length,cancelled:db.reminders.find(r=>r.deliverableId==='D6').followUp};
      });
      assert.deepEqual(counts,{first:1,second:0,pwa:2,whatsapp:1,cancelled:'Annulée'});
    });

    await run('Fiche Formateur · données professionnelles et confidentialité', async page=>{
      await page.goto(url+'#/interne/trainers');
      await button(page,'Voir la fiche').first().click();
      await button(page,'Expertises').click();
      await page.getByText('LLM et outils maîtrisés',{exact:true}).waitFor();
      await button(page,'Performances').click();
      await page.getByText('Satisfaction 40 %, ponctualité 30 %, incidents vérifiés 20 %, retours de missions 10 %',{exact:true}).waitFor();
      await button(page,'Gestion interne').click();
      await page.locator('#review-kind').selectOption('carton');
      await page.locator('#review-level').selectOption('jaune');
      await page.getByLabel('Justificatif / contexte').fill('Note de démonstration privée pour le test.');
      await button(page,'Enregistrer').click();
      await page.getByText('Note de démonstration privée pour le test.',{exact:true}).waitFor();
      await page.getByText('Actions correctives · 0',{exact:true}).click();
      await page.getByLabel('Nouvelle action corrective').fill('Vérification corrective de démonstration.');
      await button(page,'Ajouter au suivi').click();
      await page.getByText('Actions correctives · 1',{exact:true}).waitFor();
      await button(page,'Proposer une mission').click();
      await dialog(page).getByRole('heading',{name:'Proposer une mission'}).waitFor();
      await button(dialog(page),'Voir la proposition').first().click();
      await page.locator('#staff-proposal-P1').waitFor();
      await button(page,/^À staffer/).click();
      await button(page.locator('.staffing-profile').first(),'Fiche').click();
      await button(page,'Proposer une mission').click();
      await button(dialog(page),'Préparer').first().click();
      await dialog(page).getByRole('heading',{name:'Préparer une proposition'}).waitFor();
      await page.keyboard.press('Escape');
      await chooseRole(page,1);
      await button(page.getByRole('navigation',{name:'Navigation principale sur téléphone'}),'Profil').click();
      await page.getByText('Ponctualité documentaire',{exact:true}).waitFor();
      assert.doesNotMatch(await page.locator('#app').innerHTML(),/Note de démonstration privée|Carton jaune|Vérification corrective de démonstration/);
      await button(page,'Modifier mon profil').click();
      await page.getByLabel('Préférences de déplacement',{exact:true}).fill('Paris et visio');
      await button(page,'Enregistrer').click();
      await page.getByText('Paris et visio',{exact:true}).waitFor();
    });
  }

  const sizes = useWebKit ? [[390,844]] : [[375,667],[390,844],[768,1024],[1440,900]];
  for (const [width,height] of sizes) {
    await run('Rendu des trois modules · '+width+' × '+height,async page=>{
      const capture = async key=>{
        await page.evaluate(()=>document.fonts.ready);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
        await page.screenshot({path:`${output}/${useWebKit?'webkit-':''}${width}-${key}.png`,animations:'disabled',scale:'css'});
      };
      await page.goto(url+'#/interne/staffing');
      await page.getByRole('heading',{level:1}).waitFor();
      await capture('staffing');
      if(width<=430){
        await button(page,'Voir les candidats').click();
        await capture('candidats');
        await page.evaluate(()=>window.scrollTo(0,0));
      }
      await inbox(page);
      await capture('notifications');
      await page.goto(url+'#/interne/trainer-detail');
      await page.getByRole('heading',{level:1}).waitFor();
      await capture('fiche-formateur');
      await page.goto(url+'#/formateur/trainer-profile');
      await page.getByRole('heading',{name:'Mon profil',exact:true}).waitFor();
      await capture('profil-formateur');
    },{width,height});
  }
} finally {
  await writeFile(`${output}/${useWebKit?'webkit':'chromium'}.json`,JSON.stringify(results,null,2));
  await browser.close();
}
assert.ok(results.every(r=>r.passed),'Échec des contrôles Playwright');
