const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.clock.setFixedTime(new Date('2026-11-22T15:30:00Z'));
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#market-hours');
  await page.waitForFunction(()=>document.querySelector('#crtClockState')&&typeof getActiveAccount==='function');
  const finance=await page.evaluate(()=>JSON.stringify(getActiveAccount()));
  assert.equal(await page.locator('[data-session-id]').count(),4);
  assert.equal(await page.locator('[data-macro-id],.qt-track,#marketHoursIctToggle,#marketHoursQuarterlyToggle').count(),0);
  assert.match(await page.locator('#crtClockState').innerText(),/Chưa có mốc/);
  await page.locator('#crtClockZone').selectOption('UTC');
  await page.locator('#crtC3Open').fill('2026-11-22T15:00');await page.locator('#crtC3Open').dispatchEvent('change');
  await page.locator('#crtC3Close').fill('2026-11-22T16:00');await page.locator('#crtC3Close').dispatchEvent('change');
  assert.match(await page.locator('#crtClockState').innerText(),/C3 đang mở.*30:00/);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#crtClockState')?.textContent.includes('30:00'));
  assert.equal(await page.locator('#crtC3Open').inputValue(),'2026-11-22T15:00');
  await page.clock.setFixedTime(new Date('2026-11-22T16:00:00Z'));
  await page.waitForFunction(()=>document.querySelector('#crtClockState').textContent.includes('C3 đã đóng'));
  await page.locator('#marketHoursTzSelect').selectOption('America/New_York');assert.equal(await page.locator('[data-session-id]').count(),4);
  await page.evaluate(()=>{MarketHours.isLive=false;MarketHours.scrubMinuteOfDay=300;MarketHours.renderNeedleAndClocks();});
  assert.equal(await page.locator('#marketHoursNeedle').evaluate(el=>el.style.left),'20.833%');
  await page.evaluate(()=>document.getElementById('marketHoursResetLiveBtn').click());assert.equal(await page.evaluate(()=>MarketHours.isLive),true);
  fs.mkdirSync('output/ui-review',{recursive:true});
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow '+width);
   await page.locator('#crtTimeContext').scrollIntoViewIfNeeded();await page.screenshot({path:`output/ui-review/crt-time-${width}.png`});
  }
  await page.locator('#crtClockClear').click();assert.equal(await page.locator('#crtC3Open').inputValue(),'');
  assert.equal(await page.evaluate(()=>JSON.stringify(getActiveAccount())),finance,'Clock and session controls preserve financial data');
  assert.deepEqual(errors,[]);
  console.log('PASS CRT clock persistence/expiry, timeline sessions, scrub/reset, desktop/mobile geometry and financial-data isolation.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
