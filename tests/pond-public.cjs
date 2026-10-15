const assert=require('node:assert/strict'),path=require('node:path');
const Public=require('../assets/pond-public.js');
for(let stage=0;stage<=7;stage++)for(const outcome of [null,'manual','tp','be','half','sl','skip']){
 const text=Public.copy(stage,outcome?{outcome}:null);
 assert.ok(text.status.length<=14&&text.action.length<=12,'Public labels stay compact');
 assert.match(text.status,/^[A-Za-z ]+$/);assert.doesNotMatch(text.status,/profit|win|guarantee/i);
}
assert.equal(Public.copy(3,null,false,false,true).status,'Checks pending');
assert.equal(Public.copy(5,null,true).action,'Paused');
assert.equal(Public.copy(7,{outcome:'tp'},true,true).status,'Reeling in');
(async()=>{
 const {chromium}=require('../.review-tools/node_modules/playwright');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning&&typeof PondPublic!=='undefined');
  const manual=page.locator('.pond-manual-close button');
  assert.equal(await page.locator('#pondPublicSource').isVisible(),false);
  assert.equal(await page.locator('#anglerCastBtnText').isVisible(),true);
  await page.locator('#btnPondStudio').click();
  assert.equal(await page.locator('#pondPublicSource').textContent(),'SOURCE NOT CONFIRMED');
  assert.deepEqual(await page.locator('#studioSourceType option').evaluateAll(nodes=>nodes.map(n=>n.value)),['','combine','xfa']);
  const account=await page.evaluate(()=>JSON.stringify(getActiveAccount()));
  await page.locator('#studioSourceType').selectOption('combine');
  assert.equal(await page.locator('#pondPublicSource').textContent(),'COMBINE · SIMULATED');
  await page.locator('#studioSourceType').selectOption('xfa');
  assert.equal(await page.locator('#pondPublicSource').textContent(),'XFA · SIMULATED');
  assert.equal(await page.evaluate(()=>JSON.stringify(getActiveAccount())),account,'Source label must not change the financial account');
  assert.equal(await page.locator('#anglerCastBtnText').isVisible(),false);
  assert.equal(await page.locator('#pondPublicAction').textContent(),'Cast');
  assert.match(await manual.getAttribute('title'),/already closed/);
  // A changed capture source clears the old label; the selector never implies source verification.
  await page.evaluate(()=>{navigator.mediaDevices.getDisplayMedia=async()=>{const c=document.createElement('canvas');c.width=800;c.height=600;return c.captureStream(1);};});
  await page.locator('#capturePondChart').click();await page.waitForFunction(()=>document.getElementById('pondChartVideo').srcObject);
  assert.equal(await page.locator('#pondPublicSource').textContent(),'SOURCE NOT CONFIRMED');
  await page.locator('#studioSourceType').selectOption('xfa');
  await page.locator('#stopPondCapture').click();assert.equal(await page.locator('#pondPublicSource').textContent(),'SOURCE NOT CONFIRMED');
  await page.locator('#studioSourceType').selectOption('combine');
  for(let setup=1;setup<=4;setup++){
   await page.evaluate(setup=>{resetChecklist();switchChecklistSetup(setup);},setup);
   for(let step=1;step<=4;step++){
    await page.evaluate(step=>triggerCastStep(step),step);
    assert.equal(await page.locator('#pondPublicState').textContent(),step<4?'Waiting':'Managing');
   }
   await page.locator('.pond-copy-public').filter({hasText:'Log close'}).click();
   await page.waitForFunction(()=>anglerState.catchProgress===1&&PondExecution.current()?.outcome==='manual');
   assert.equal(await page.locator('#pondPublicState').textContent(),'Close logged');
  }
  for(const [width,height] of [[1500,1050],[768,1000],[390,844],[320,720]]){
   await page.setViewportSize({width,height});await page.locator('#pondLiveScene').scrollIntoViewIfNeeded();
   assert.equal(await page.locator('.pond-live-caption').isVisible(),false);
   const bounds=await page.evaluate(()=>{
    const scene=document.getElementById('rusticCanvasContainer').getBoundingClientRect();
    const a=document.querySelector('.pond-public-caption').getBoundingClientRect(),b=document.querySelector('.pond-controls').getBoundingClientRect(),note=document.querySelector('.pond-public-note').getBoundingClientRect();
    return {caption:a.top>=scene.top&&a.bottom<=b.top,footer:note.bottom<=scene.bottom+1&&note.top>=b.bottom-1};
   });
   assert.deepEqual(bounds,{caption:true,footer:true});
   if(width===390)await page.locator('#pondBroadcastFrame').screenshot({path:'output/pond-public-live.png'});
  }
  await page.locator('#swapPondPanes').click();assert.equal(await page.locator('#pondPublicSource').isVisible(),true);
  await page.locator('#closePondStudio').click();assert.equal(await page.locator('#anglerCastBtnText').isVisible(),true);
  assert.equal(await page.locator('.pond-copy-normal').isVisible(),true);
  await page.evaluate(()=>PondPublic.setSource('xfa'));
  await page.locator('#btnPondFullscreen').click();assert.equal(await page.locator('#pondPublicSource').textContent(),'XFA · SIMULATED');
  assert.equal(await page.locator('#pondPublicAction').isVisible(),true);
  await page.keyboard.press('Escape');
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal(await page.evaluate(()=>PondPublic.source()),'');
  assert.deepEqual(errors,[]);
  console.log('PASS compact copy, four methods, two simulated types, source reset, private controls, geometry at four sizes, fullscreen and unchanged finance data');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
