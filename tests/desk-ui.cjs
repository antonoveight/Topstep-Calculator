const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  fs.mkdirSync('output/ui-review',{recursive:true});
  const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/'));
  await page.waitForFunction(()=>document.querySelector('.desk-kpis'));
  // The redesign must preserve every source DOM ID used by legacy renderers.
  const ids=[...fs.readFileSync('index.html','utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(await page.evaluate(ids=>ids.filter(id=>!document.getElementById(id)),ids),[]);
  assert.equal(await page.locator('.desk-kpis > .b-stat-card').count(),4);
  assert.equal(await page.locator('.finpoint-virtual-card').count(),0);
  assert.equal(await page.locator('.desk-nav-item').count(),6);
  // Financial values remain driven by the original render path, including account changes.
  await page.evaluate(()=>{
   for(const [date,pnl] of [['2026-10-26',300],['2026-10-27',-100],['2026-10-28',250]]){document.getElementById('inputDate').value=date;document.getElementById('inputPnl').value=pnl;addJournalEntry({preventDefault(){}});}
  });
  await page.waitForFunction(()=>document.getElementById('deskBufferValue').textContent===document.getElementById('todayMllBufferVal').textContent);
  assert.match(await page.locator('#finpointCardBalance').innerText(),/50,450/);
  await page.screenshot({path:'output/ui-review/desk-dashboard-dark.png'});
  await page.locator('.finpoint-sidebar [data-desk-nav="journal"]').click();await page.waitForTimeout(350);
  assert.equal(await page.locator('.finpoint-sidebar [data-desk-nav="journal"]').getAttribute('aria-current'),'page');
  assert.equal(await page.locator('#inputPnl').isVisible(),true);
  await page.locator('.finpoint-sidebar [data-desk-nav="risk"]').click();await page.waitForTimeout(350);
  assert.equal(await page.locator('#calcSymbol').isVisible(),true);
  await page.locator('#calcSymbol').selectOption('MNQ');await page.locator('#stopLossInput').fill('100');await page.locator('#ticksInput').fill('20');
  assert.match(await page.locator('#calcMicroLots').innerText(),/^\d+ Micros$/);
  await page.locator('#calculator-section').screenshot({path:'output/ui-review/desk-calculator.png'});
  await page.locator('.finpoint-sidebar [data-desk-nav="settings"]').click();
  assert.equal(await page.locator('#deskSettings').evaluate(e=>e.open),true);
  await page.locator('#deskSettings [onclick="openAddAccountModal()"]').click();
  assert.equal(await page.locator('#deskSettings').evaluate(e=>e.open),false,'Legacy modals must not be blocked beneath the settings dialog');
  assert.equal(await page.locator('#addAccountModal').isVisible(),true);
  await page.evaluate(()=>closeAddAccountModal());
  await page.locator('.finpoint-sidebar [data-desk-nav="settings"]').click();
  await page.locator('.theme-switch-container').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.keyboard.press('Escape');await page.evaluate(()=>switchAppView('dashboard'));
  await page.locator('.finpoint-workspace').evaluate(e=>{e.scrollTop=0;});await page.waitForTimeout(350);
  await page.screenshot({path:'output/ui-review/desk-dashboard-light.png'});
  for(const theme of ['dark','light'])for(const width of [1920,1280,1024,768,390,320]){
   await page.setViewportSize({width,height:1000});await page.evaluate(theme=>setTheme(theme),theme);
   for(const view of ['dashboard','checklist','market-hours','calendar']){
    await page.evaluate(view=>switchAppView(view),view);await page.waitForTimeout(70);
    await page.locator('.finpoint-workspace').evaluate(e=>{e.scrollTop=0;});
    const layout=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,workspace:document.querySelector('.finpoint-workspace').scrollWidth,available:document.querySelector('.finpoint-workspace').clientWidth}));
    assert.ok(layout.doc<=layout.width+1&&layout.workspace<=layout.available+1,`${theme}/${view}/${width}: ${JSON.stringify(layout)}`);
    if(width===390&&theme==='dark')await page.screenshot({path:`output/ui-review/desk-mobile-${view}.png`});
   }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>switchAppView('dashboard'));
  await page.locator('.desk-mobile-nav button').filter({hasText:'Rủi ro'}).click();
  assert.equal(await page.locator('#calcSymbol').isVisible(),true);
  await page.locator('.desk-mobile-nav button').filter({hasText:'Cài đặt'}).click();assert.equal(await page.locator('#deskSettings').evaluate(e=>e.open),true);
  await page.keyboard.press('Escape');
  await page.reload();await page.waitForFunction(()=>document.querySelector('.desk-kpis'));
  assert.match(await page.locator('#finpointCardBalance').innerText(),/50,450/);
  assert.deepEqual(errors,[]);
  console.log('PASS all legacy IDs preserved; real ledger updates; six navigation actions; settings/modals/theme; calculator; persistence; dark/light four views at six viewport sizes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
