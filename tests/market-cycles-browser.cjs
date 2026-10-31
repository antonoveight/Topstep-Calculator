const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  fs.mkdirSync('output/ui-review',{recursive:true});
  const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.clock.setFixedTime(new Date('2026-11-02T01:00:00Z')); // 20:00 NY / 08:00 VN, AS2 is active.
  const url='file:///'+path.resolve('index.html').replaceAll('\\','/')+'#market-hours';
  await page.goto(url);await page.waitForFunction(()=>document.querySelector('.desk-timeline-scroll'));
  const finance=await page.evaluate(()=>JSON.stringify(getActiveAccount()));
  assert.equal(await page.locator('#marketHoursIctTableContainer tbody tr').count(),10);
  assert.equal(await page.locator('[data-macro-id="asia_1"]').count(),1);assert.equal(await page.locator('[data-macro-id="asia_2"]').count(),1);
  assert.match(await page.locator('#ictTableRow-asia_1').innerText(),/06:50.*07:10/);
  assert.match(await page.locator('#ictTableRow-asia_2').innerText(),/07:50.*08:10/);
  assert.match(await page.locator('#ictRowStatus-asia_2').innerText(),/ĐANG MỞ CỬA/);
  assert.equal(await page.locator('#quarterlyContext').isVisible(),false);
  await page.locator('#marketHoursQuarterlyToggle').check();
  assert.equal(await page.locator('.qt-track').count(),2);
  assert.equal(await page.locator('[data-qt-open="day"]').count(),1);assert.equal(await page.locator('[data-qt-open="session"]').count(),4);
  assert.match(await page.locator('#qtDayState').innerText(),/Q1.*Asia/);assert.equal(await page.locator('#qtNinetyState').innerText(),'Q2');assert.equal(await page.locator('#qtMicroState').innerText(),'Q2');
  assert.equal(await page.locator('.qt-segment.is-active').count(),2,'Only the current fragment of each row is active, not yesterday\'s wrapped fragment');
  assert.match(await page.locator('#qtTrueOpens').innerText(),/07:30:00/);
  await page.locator('#marketHoursTzSelect').selectOption('America/New_York');
  assert.match(await page.locator('#ictTableRow-asia_1').innerText(),/18:50.*19:10/);
  assert.match(await page.locator('#qtTrueOpens').innerText(),/19:30:00/);
  const track=page.locator('#marketHoursInteractiveTrack'),rect=await track.boundingBox();
  await track.click({position:{x:rect.width*.51,y:70}});
  assert.equal(await page.evaluate(()=>MarketHours.isLive),false);assert.match(await page.locator('#qtClockMode').innerText(),/Xem/);assert.match(await page.locator('#qtDayState').innerText(),/Q4/);
  await page.locator('#marketHoursResetLiveBtn').click();assert.match(await page.locator('#qtDayState').innerText(),/Q1/);
  await page.locator('#marketHoursTzSelect').selectOption('Asia/Bangkok');
  await page.locator('label:has(#marketHoursIctToggle)').click();assert.equal(await page.locator('[data-macro-id]').count(),0);assert.equal(await page.locator('.qt-track').count(),2,'QT can be used independently of macro markers');
  await page.locator('label:has(#marketHoursIctToggle)').click();
  await page.reload();await page.waitForFunction(()=>document.querySelector('.desk-timeline-scroll'));
  assert.equal(await page.locator('#marketHoursQuarterlyToggle').isChecked(),true);assert.equal(await page.locator('.qt-track').count(),2);
  for(const theme of ['dark','light'])for(const width of [1600,768,390,320]){
   await page.setViewportSize({width,height:1050});await page.evaluate(theme=>setTheme(theme),theme);
   await page.locator('.finpoint-workspace').evaluate(el=>{el.scrollTop=0;});
   assert.equal(await page.evaluate(()=>document.querySelector('.finpoint-workspace').scrollWidth<=innerWidth+1),true,`${theme}/${width} overflow`);
   if(width===1600||width===390){await page.screenshot({path:`output/ui-review/market-cycles-${theme}-${width}.png`});await page.locator('#quarterlyContext').screenshot({path:`output/ui-review/quarterly-context-${theme}-${width}.png`});}
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(getActiveAccount())),finance);
  await page.locator('#marketHoursQuarterlyToggle').uncheck();assert.equal(await page.locator('.qt-track').count(),0);assert.equal(await page.locator('#quarterlyContext').isVisible(),false);
  await page.reload();assert.equal(await page.locator('#marketHoursQuarterlyToggle').isChecked(),false);
  await page.keyboard.press('Control+k');await page.locator('#quickSearchInput').fill('Quarterly');await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.getElementById('marketHoursQuarterlyToggle').checked);
  assert.equal(await page.locator('#quarterlyContext').isVisible(),true,'Command search opens the QT tool');
  assert.deepEqual(errors,[]);
  console.log('PASS Asia markers/detail table/active status; opt-in QT; NY/VN conversion; scrub/reset; independent toggles/persistence; dark/light responsive geometry; unchanged account data');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
