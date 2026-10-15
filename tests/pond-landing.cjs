const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning);
  await page.evaluate(()=>{resetChecklist();setPondTimeMode('afternoon');});
  await fs.mkdir('output',{recursive:true});
  for(const size of [{width:1440,height:1000},{width:1280,height:700},{width:768,height:1000},{width:390,height:850},{width:320,height:720}]) {
   await page.setViewportSize(size);
   await page.locator('#chk-risk-2r').scrollIntoViewIfNeeded();
   await page.locator('#chk-risk-2r').check();
   await page.waitForFunction(()=>anglerState.stage===6);
   const rect=await page.locator('#rusticAnglerCanvas').boundingBox();
   assert.ok(rect.y>=0 && rect.y+rect.height<=size.height,'Pond not visible at '+size.width);
   const unoccluded=await page.evaluate(()=>{
    const c=document.getElementById('rusticAnglerCanvas'),r=c.getBoundingClientRect();
    return [r.top+8,(r.top+r.bottom)/2,r.bottom-8].every(y=>document.elementFromPoint(r.left+r.width/2,y)===c);
   });
   assert.equal(unoccluded,true,'Canvas covered by header at '+size.width);
   const risk=await page.locator('#chk-risk-2r').boundingBox();
   assert.ok(risk.y>=0 && risk.y+risk.height<=size.height,'Risk checkbox not visible');
   assert.equal(await page.locator('#chk-risk-1r').isChecked(),false);
   if(size.width<1180) assert.ok(risk.y>rect.y+rect.height,'Sticky pond covers risk checkbox');
   await page.locator('#chk-risk-2r').uncheck();
  }
  console.log('PASS pond and risk controls remain visible together at five viewport sizes');
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#chk-risk-tp').scrollIntoViewIfNeeded();
  await page.locator('#chk-risk-tp').check();
  assert.equal(await page.locator('#chk-risk-1r').isChecked(),false);
  assert.equal(await page.locator('#chk-risk-2r').isChecked(),false);
  await page.waitForFunction(()=>anglerState.catchPose?.phase==='reel');
  await page.locator('#rusticAnglerCard').screenshot({path:'output/pond-tp-reel.png'});
  await page.waitForFunction(()=>anglerState.catchPose?.phase==='basket');
  await page.locator('#rusticAnglerCard').screenshot({path:'output/pond-tp-basket.png'});
  await page.waitForFunction(()=>anglerState.catchPose?.phase==='done');
  assert.equal(await page.evaluate(()=>anglerState.fish.state),'basket');
  await page.locator('#rusticAnglerCard').screenshot({path:'output/pond-tp-done.png'});
  const serial=await page.evaluate(()=>anglerState.transitionSerial);
  await page.evaluate(()=>onChecklistChange());assert.equal(await page.evaluate(()=>anglerState.transitionSerial),serial);
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal(await page.evaluate(()=>anglerState.catchProgress),1);
  assert.equal(await page.evaluate(()=>anglerState.transitionSerial),0);
  console.log('PASS direct TP, full real-time landing, basket state and no replay on restore');
  await page.setViewportSize({width:390,height:850});
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  await page.locator('#btnPondSize').click();
  assert.equal(await page.locator('#rusticAnglerCard').getAttribute('data-expanded'),'true');
  await page.locator('#btnPondSize').click();
  assert.equal(await page.locator('#rusticAnglerCard').getAttribute('data-expanded'),'false');
  await page.locator('#chk-risk-tp').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/pond-management-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS mobile expand/compact controls and no runtime errors');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
