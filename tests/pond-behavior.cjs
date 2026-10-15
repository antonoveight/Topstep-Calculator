const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning);
  const snapshot=()=>page.evaluate(()=>({state:anglerState.snapshot,serial:anglerState.transitionSerial,effect:anglerState.lastEffect,phaseTime:anglerState.phaseTime}));
  await page.evaluate(()=>{document.getElementById('chk-s1-4').checked=true;onChecklistChange();});
  assert.equal((await snapshot()).state.stage,0);assert.equal((await snapshot()).serial,0);
  await page.evaluate(()=>triggerCastStep(1));assert.equal((await snapshot()).state.phase,1);
  await page.evaluate(()=>triggerCastStep(2));assert.equal((await snapshot()).effect,'approach');
  await page.evaluate(()=>triggerCastStep(3));assert.equal((await snapshot()).state.stage,4);
  await page.evaluate(()=>{document.getElementById('chk-risk-2r').checked=true;onChecklistChange();});
  assert.equal((await snapshot()).state.stage,6);
  await page.evaluate(()=>{document.getElementById('chk-risk-1r').checked=true;onChecklistChange();});
  assert.equal((await snapshot()).state.stage,6);
  await page.evaluate(()=>{document.getElementById('chk-risk-tp').checked=true;onChecklistChange();});
  assert.equal((await snapshot()).state.stage,7);
  const completeSerial=(await snapshot()).serial;
  await page.evaluate(()=>onChecklistChange());assert.equal((await snapshot()).serial,completeSerial);
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal((await snapshot()).state.stage,7);assert.equal((await snapshot()).serial,0);
  assert.equal((await snapshot()).effect,null);assert.ok((await snapshot()).phaseTime>=99);
  await page.evaluate(()=>switchChecklistSetup(2));assert.equal((await snapshot()).state.stage,0);
  assert.deepEqual((await snapshot()).state.risk,[false,false,false]);
  await page.evaluate(()=>{for(let i=1;i<=4;i++)triggerCastStep(i);});assert.equal((await snapshot()).state.stage,4);
  await page.evaluate(()=>switchChecklistSetup(1));assert.equal((await snapshot()).state.stage,7);
  assert.equal((await snapshot()).effect,null);
  await page.evaluate(()=>{document.getElementById('chk-s1-2').checked=false;onChecklistChange();});
  assert.equal((await snapshot()).state.phase,1);assert.equal((await snapshot()).state.riskPhase,3);
  assert.equal((await snapshot()).effect,null);
  for(let setup=1;setup<=4;setup++) {
   await page.evaluate(setup=>{resetChecklist();switchChecklistSetup(setup);triggerCastStep(1);triggerCastStep(2);},setup);
   assert.equal((await snapshot()).effect,['approach','pullback','sweep','breakout'][setup-1]);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS out-of-order, rollback, no replay on reload, isolated risk per setup, four effect mappings');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
