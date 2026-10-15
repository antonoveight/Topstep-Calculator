const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1100},timezoneId:'America/Los_Angeles'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.clock.install({time:new Date('2026-10-15T02:59:30Z')});
  await page.addInitScript(()=>localStorage.setItem('topstep_angler_motion_paused','true'));
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.clock.runFor(150);
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await page.waitForFunction(()=>anglerState.visible && anglerState.clockTimer!==null);
  assert.equal(await page.locator('#pondLocalTime').innerText(),'09:59 GMT+7');
  assert.equal(await page.evaluate(()=>anglerState.clock.part),'morning');
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  assert.equal(await page.evaluate(()=>readPondSchedule().length),6);
  const checklist=await page.evaluate(()=>localStorage.getItem('topstep_checklist_state'));
  await page.locator('#pondTimeMode').selectOption('evening');
  assert.equal(await page.evaluate(()=>anglerState.clock.part),'evening');
  assert.ok((await page.locator('#pondPeriodText').innerText()).includes('Xem thử'));
  assert.ok((await page.locator('#pondActivityBadge').innerText()).includes('Khung sáng'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_checklist_state')),checklist);
  await page.clock.fastForward(31000);
  assert.equal(await page.locator('#pondLocalTime').innerText(),'10:00 GMT+7');
  assert.equal(await page.evaluate(()=>anglerState.clock.part),'evening');
  await page.locator('#pondTimeMode').selectOption('auto');
  assert.equal(await page.evaluate(()=>anglerState.clock.part),'noon');
  console.log('PASS actual minute boundary auto-refresh, timezone independence and preview isolation');

  await page.locator('#pondTimeMode').selectOption('evening');
  await page.reload();await page.clock.runFor(150);
  assert.equal(await page.locator('#pondTimeMode').inputValue(),'evening');
  assert.equal(await page.evaluate(()=>anglerState.clock.part),'evening');
  const frozen=await page.evaluate(()=>({time:anglerState.time,fish:anglerState.world.fish.map(f=>f.age)}));
  await page.clock.fastForward(120000);
  assert.deepEqual(await page.evaluate(()=>({time:anglerState.time,fish:anglerState.world.fish.map(f=>f.age)})),frozen);
  await page.evaluate(()=>switchAppView('dashboard'));assert.equal(await page.evaluate(()=>anglerState.clockTimer),null);
  await page.evaluate(()=>switchAppView('checklist'));
  console.log('PASS saved preview, paused world and clock timer cleanup off-screen');
  await fs.mkdir('output',{recursive:true});
  for(const mode of ['morning','noon','afternoon','evening']) {
   await page.locator('#pondTimeMode').selectOption(mode);
   await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
   await page.locator('#rusticAnglerCard').screenshot({path:`output/pond-${mode}.png`});
   assert.equal(await page.evaluate(()=>anglerState.lighting.brightness),await page.evaluate(mode=>PondClock.palettes[mode].brightness,mode));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS four lighting previews and no browser runtime errors');
 } finally {await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
