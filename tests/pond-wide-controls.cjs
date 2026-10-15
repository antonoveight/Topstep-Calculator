const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning);
  const manual=page.locator('[data-pond-outcome="manual"]');
  const setup=()=>page.evaluate(()=>{PondExecution.newRound();document.getElementById('chk-risk-1r').checked=true;onChecklistChange();});
  const checkControls=async()=>{
   const state=await page.evaluate(()=>{
    const scene=document.getElementById('rusticCanvasContainer').getBoundingClientRect();
    return [...document.querySelectorAll('#btnAnglerCastReel,.pond-manual-close button')].map(b=>{
     const r=b.getBoundingClientRect();
     return {inside:r.left>=scene.left&&r.right<=scene.right+1&&r.top>=scene.top&&r.bottom<=scene.bottom+1,
      hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b||b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};
    });
   });
   assert.deepEqual(state,[{inside:true,hit:true},{inside:true,hit:true}]);
  };
  await setup();await page.locator('#btnPondFullscreen').click();
  await page.waitForFunction(()=>document.fullscreenElement);
  await checkControls();
  await page.keyboard.press('Tab');assert.equal(await manual.evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnAnglerCastReel');
  await page.keyboard.press('Shift+Tab');assert.equal(await manual.evaluate(e=>e===document.activeElement),true);
  await manual.click();await page.waitForFunction(()=>anglerState.catchPose?.deposited);
  assert.equal(await page.locator('#chk-risk-tp').isChecked(),false);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.fullscreenElement);
  await page.evaluate(()=>{document.getElementById('rusticAnglerCard').requestFullscreen=()=>Promise.reject(new Error('Unavailable'));});
  for(const [width,height] of [[844,390],[390,844],[320,720]]){
   await setup();await page.setViewportSize({width,height});await page.locator('#btnPondFullscreen').click();
   await page.waitForFunction(()=>document.querySelector('.pond-fullscreen-fallback')?.open);
   await checkControls();await manual.click();
   assert.equal(await page.evaluate(()=>PondExecution.current().outcome),'manual');
   await page.keyboard.press('Escape');
  }
  await setup();await page.locator('#btnPondStudio').click();
  for(const [width,height] of [[1500,1050],[768,1000],[390,844],[320,720]]){
   await page.setViewportSize({width,height});
   await page.waitForTimeout(100);await manual.scrollIntoViewIfNeeded();await checkControls();
   assert.equal(await manual.isEnabled(),true);
  }
  await manual.click();await page.waitForFunction(()=>anglerState.catchPose?.deposited);
  assert.equal(await page.locator('#chk-risk-tp').isChecked(),false);
  await page.locator('#pondBroadcastFrame').screenshot({path:'output/pond-studio-manual-controls.png'});
  await page.locator('#closePondStudio').click();assert.equal(await manual.isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log('PASS manual landing in native/fallback fullscreen and studio; two keyboard controls; touch targets inside scene at 320/390/768/844/1500px');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
