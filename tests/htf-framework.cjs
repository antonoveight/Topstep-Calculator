const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const Logic=require('../assets/pond-model.js');
assert.deepEqual(Object.keys(Logic.setups),['5','6','7']);
assert.match(Logic.name(2),/Trend/);assert.match(Logic.name(3),/AMD/);
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>typeof PondLive!=='undefined'&&document.getElementById('studioSetup'));
  const financial=await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3'));
  const legacy=await page.evaluate(()=>{
   const a=getActiveAccount(),accountKey=JSON.stringify([a.id,a.stage]);
   const record={id:'old-catch',account:a.id,stage:a.stage,setup:2,outcome:'tp',rating:'yes',at:new Date().toISOString()};
   const old={active:'2',state:{'chk-s2-1':true,'chk-s2-2':true,'chk-risk-tp':true,__riskBySetup:{2:[true,true,true]}}};
   localStorage.setItem('topstep_active_checklist_setup','2');localStorage.setItem('topstep_checklist_state',JSON.stringify(old.state));
   localStorage.setItem('topstep_pond_outcomes_v1',JSON.stringify({current:{[JSON.stringify([a.id,a.stage,2])]:record},history:[record]}));
   localStorage.setItem('topstep_pond_sessions_v1',JSON.stringify({active:{[accountKey]:{id:'old-session',accountKey,symbol:'MGC',setup:2,window:'morning',startedAt:new Date().toISOString(),rounds:['old-catch'],changes:[],assessment:'unrated'}},history:[]}));
   return old;
  });
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning&&document.getElementById('studioSetup'));
  assert.equal(await page.evaluate(()=>activeChecklistSetup),5);
  assert.equal(await page.evaluate(()=>readPondChecklist().stage),0);
  assert.equal(await page.evaluate(()=>PondExecution.current()),null);
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),1);
  assert.equal(await page.evaluate(()=>PondLive.active()),null);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('topstep_checklist_state')));
  assert.deepEqual(saved.__legacy,legacy);
  assert.equal(await page.locator('#frameworkMigrationNotice').isVisible(),true);
  await page.locator('#executionHtf').selectOption('H2');await page.locator('#executionLtf').selectOption('M5');await page.locator('#executionEntry').selectOption('FVG');
  await page.locator('#executionNote').fill('HTF range; close then retest');await page.locator('#executionNote').dispatchEvent('change');
  await page.evaluate(()=>{for(let i=1;i<=4;i++)triggerCastStep(i);});
  await page.locator('#executionEntry').selectOption('OB');
  assert.deepEqual(await page.evaluate(()=>readPondChecklist().steps),[true,true,false,false]);
  await page.evaluate(()=>switchChecklistSetup(6));assert.equal(await page.locator('#executionHtf').inputValue(),'');
  await page.evaluate(()=>switchChecklistSetup(5));assert.equal(await page.locator('#executionHtf').inputValue(),'H2');
  assert.equal(await page.locator('#executionEntry').inputValue(),'OB');
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal(await page.locator('#executionHtf').inputValue(),'H2');
  assert.equal(await page.locator('#executionNote').inputValue(),'HTF range; close then retest');
  await page.evaluate(()=>{triggerCastStep(3);triggerCastStep(4);PondExecution.choose('tp');});
  assert.equal(await page.evaluate(()=>PondExecution.current().context.executionEntry),'OB');
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),2);
  assert.equal(await page.locator('#executionHtf').isDisabled(),true);
  await page.locator('#btnPondStudio').click();
  assert.deepEqual(await page.locator('#studioSetup option').evaluateAll(opts=>opts.map(o=>o.value)),['5','6','7']);
  await page.locator('#studioCommit').check();await page.locator('#pondStudioStart [type=submit]').click();
  const sessions=await page.evaluate(()=>JSON.parse(localStorage.getItem('topstep_pond_sessions_v1')));
  assert.equal(sessions.history[0].id,'old-session');assert.equal(sessions.history[0].setup,2);
  assert.equal(sessions.history[0].outcomes[0].id,'old-catch');
  assert.equal(await page.evaluate(()=>PondLive.active().setup),5);
  await page.locator('#closePondStudio').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),financial);
  // Newly classified trades must survive the journal validator, reload and editor.
  await page.evaluate(()=>{
   switchAppView('dashboard');document.getElementById('inputDate').value='2026-11-10';document.getElementById('inputPnl').value='40';
   document.getElementById('entryKind').value='trade';document.getElementById('entrySetup').value='7';document.getElementById('entryRisk').value='20';
   addJournalEntry({preventDefault(){}});
  });
  assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].setup),'7');
  await page.reload();await page.waitForFunction(()=>document.getElementById('entrySetup'));
  await page.evaluate(()=>editJournalEntry(0));assert.equal(await page.locator('#entrySetup').inputValue(),'7');
  await page.evaluate(()=>{document.getElementById('inputPnl').value='60';addJournalEntry({preventDefault(){}});});
  assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].pnl),60);
  // Old classifications remain editable without being renamed to a new HTF type.
  await page.evaluate(()=>{
   const a=getActiveAccount();a.journalEntries[0].setup='2';editJournalEntry(0);
   document.getElementById('inputPnl').value='50';addJournalEntry({preventDefault(){}});
  });
  assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].setup),'2');
  await page.evaluate(()=>switchAppView('checklist'));
  fs.mkdirSync('output/ui-review',{recursive:true});
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#htfExecutionContext').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/ui-review/htf-framework.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS HTF schema migration, preserved catches/legacy sessions/finance, context isolation/reload, invalidated entry checks, outcome snapshot, studio and responsive');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
