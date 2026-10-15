const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning&&PondScene.ready());
  const manual=page.locator('[data-pond-outcome="manual"]');
  assert.equal(await manual.isDisabled(),true);
  await page.evaluate(()=>{for(let step=1;step<=4;step++)triggerCastStep(step);});
  assert.equal(await manual.isDisabled(),true,'Entry alone cannot award a fish');
  const before=await page.evaluate(()=>PondExecution.history().length);
  await page.evaluate(()=>PondExecution.choose('manual'));
  assert.equal(await page.evaluate(()=>PondExecution.current()),null,'Direct calls must obey the same milestone requirement');
  assert.equal(await page.evaluate(()=>PondExecution.history().length),before);
  await page.locator('#chk-risk-1r').check();await page.locator('#chk-risk-1r').uncheck();
  assert.equal(await manual.isDisabled(),true,'Removing 1R disables manual catch again');
  for(const [risk,tier] of [['1r',1],['2r',2]]){
   await page.evaluate(()=>PondExecution.newRound());
   await page.locator('#chk-risk-'+risk).check();
   assert.equal(await manual.isEnabled(),true);
   const seed=await page.evaluate(()=>PondExecution.fishSeed());
   const account=await page.evaluate(()=>JSON.stringify(getActiveAccount()));
   await manual.click();
   await page.waitForFunction(()=>anglerState.catchPose?.phase==='lift');
   assert.equal(await page.evaluate(()=>anglerState.fishProfile.tier),tier);
   assert.equal(await page.locator('#chk-risk-tp').isChecked(),false);
   assert.equal(await manual.isDisabled(),true);
   const record=await page.evaluate(()=>PondExecution.current());
   assert.equal(record.outcome,'manual');assert.equal(record.catchStage,tier===1?5:6);
   assert.equal(await page.evaluate(()=>JSON.stringify(getActiveAccount())),account,'Manual scene result must not modify the financial account');
   await page.waitForFunction(()=>anglerState.catchPose?.deposited);
   assert.equal(await page.evaluate(()=>anglerState.fish.state),'basket');
   assert.match(await page.locator('#anglerStatusText').textContent(),/Đóng thủ công/);
   await page.reload();await page.waitForFunction(()=>anglerState.catchPose?.deposited);
   assert.equal(await page.evaluate(()=>PondExecution.current().id),record.id);
   assert.equal(await page.evaluate(()=>PondExecution.fishSeed()),seed);
   assert.equal(await page.evaluate(()=>anglerState.fishProfile.tier),tier);
   assert.equal(await page.evaluate(()=>anglerState.catchPose.progress),1);
  }
  await page.evaluate(()=>{PondExecution.newRound();triggerCastStep(1);triggerCastStep(2);triggerCastStep(3);triggerCastStep(4);document.getElementById('chk-risk-1r').checked=true;onChecklistChange();toggleAnglerMotion();});
  await manual.click();assert.equal(await page.evaluate(()=>anglerState.catchPose.progress),1);
  await page.locator('#rusticAnglerCard').screenshot({path:'output/pond-manual-creel.png'});
  await page.evaluate(()=>{
   const record=PondExecution.current(),valid={current:{a:record},history:[record]};
   PondExecution.validate(valid);
   let rejected=false;try{PondExecution.validate({current:{a:{...record,catchStage:7}},history:[]});}catch{rejected=true;}
   if(!rejected)throw Error('Invalid manual tier accepted');
  });
  assert.deepEqual(errors,[]);
  console.log('PASS manual 1R/2R landing, unchanged TP, disabled duplicates, persisted tier/no replay, paused completion and metadata validation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
