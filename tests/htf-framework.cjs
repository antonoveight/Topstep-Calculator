// CRT web migration and manual workflow. Not a market/Pine Replay test.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const Logic=require('../assets/pond-model.js');
assert.deepEqual(Object.keys(Logic.setups),['5']);assert.equal(Logic.schema,'crt-v1');
for(const id of [1,2,3,4,6,7])assert.match(Logic.name(id),/cũ/);
assert.equal(fs.readFileSync('index.html','utf8'),fs.readFileSync('topstep.html','utf8'));
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  const ready=()=>page.waitForFunction(()=>typeof PondLive!=='undefined'&&document.getElementById('studioSetup')&&anglerState.isLoopRunning);
  await ready();
  const seeded=await page.evaluate(()=>{
   const a=getActiveAccount(),record={id:'old-catch',account:a.id,stage:a.stage,setup:6,outcome:'tp',rating:'yes',at:new Date().toISOString(),framework:'htf-v1'};
   const old={__schema:'htf-v1','chk-s5-1':true,'chk-s5-2':true,'chk-s6-1':true,'chk-risk-tp':true,__riskBySetup:{5:[true,true,true],6:[false,false,true]},__contextBySetup:{5:{executionHtf:'H4',executionNote:'Keep old CRT notes'},6:{executionHtf:'H2',executionNote:'Keep EGF notes'}},__legacy:{state:{'chk-s2-1':true},active:'2'}};
   localStorage.setItem('topstep_active_checklist_setup','6');localStorage.setItem('topstep_checklist_state',JSON.stringify(old));
   localStorage.setItem('topstep_pond_outcomes_v1',JSON.stringify({current:{[JSON.stringify([a.id,a.stage,5])]:{...record,setup:5}},history:[record]}));
   localStorage.setItem('topstep_pond_sessions_v1',JSON.stringify({active:{[JSON.stringify([a.id,a.stage])]:{id:'old-session',accountKey:JSON.stringify([a.id,a.stage]),symbol:'MGC',setup:6,window:'morning',framework:'htf-v1',startedAt:new Date().toISOString(),rounds:['old-catch'],changes:[],assessment:'unrated'}},history:[]}));
   return {old,financial:localStorage.getItem('topstep_multi_accounts_v3')};
  });
  await page.reload();await ready();
  assert.equal(await page.evaluate(()=>activeChecklistSetup),5);assert.equal(await page.evaluate(()=>readPondChecklist().stage),0);
  assert.equal(await page.evaluate(()=>PondExecution.current()),null,'Old CRT outcome cannot lock the new workflow');assert.equal(await page.evaluate(()=>PondExecution.creel().length),1);
  assert.equal(await page.evaluate(()=>PondLive.active()),null);
  const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('topstep_checklist_state')));
  assert.equal(migrated.__schema,'crt-v1');assert.deepEqual(migrated.__legacy,{state:seeded.old,active:'6'});
  assert.equal(await page.locator('#frameworkMigrationNotice').isVisible(),true);assert.equal(await page.locator('#checklist-setup-6,#checklist-setup-7').count(),0);
  await page.evaluate(()=>{switchChecklistSetup(6);switchChecklistSetup(7);});assert.equal(await page.evaluate(()=>activeChecklistSetup),5);
  for(const [id,value] of [['executionHtf','H1'],['executionLtf','M5'],['executionEntry','CISD']])await page.locator('#'+id).selectOption(value);
  await page.locator('#executionNote').fill('C1 / prior key; C2 TS; C3 Pullback');await page.locator('#executionNote').dispatchEvent('change');
  await page.evaluate(()=>{for(let i=1;i<=4;i++)triggerCastStep(i);});assert.equal(await page.evaluate(()=>readPondChecklist().stage),4);
  await page.locator('#executionEntry').selectOption('OB');assert.deepEqual(await page.evaluate(()=>readPondChecklist().steps),[true,true,false,false]);
  await page.reload();await ready();assert.equal(await page.locator('#executionNote').inputValue(),'C1 / prior key; C2 TS; C3 Pullback');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('topstep_checklist_state')).__legacy),migrated.__legacy,'Reload must not nest/copy the old snapshot again');
  await page.evaluate(()=>{triggerCastStep(3);triggerCastStep(4);PondExecution.choose('tp');});assert.equal(await page.evaluate(()=>PondExecution.current().framework),'crt-v1');assert.equal(await page.evaluate(()=>PondExecution.creel().length),2);
  await page.evaluate(()=>PondExecution.newRound());assert.equal(await page.evaluate(()=>PondExecution.creel().length),2);
  await page.locator('#btnPondStudio').click();assert.deepEqual(await page.locator('#studioSetup option').evaluateAll(o=>o.map(x=>x.value)),['5']);
  await page.locator('#studioCommit').check();await page.locator('#pondStudioStart [type=submit]').click();
  const sessions=await page.evaluate(()=>JSON.parse(localStorage.getItem('topstep_pond_sessions_v1')));assert.equal(sessions.history[0].id,'old-session');assert.equal(sessions.history[0].setup,6);assert.equal(sessions.history[0].outcomes[0].id,'old-catch');assert.equal(await page.evaluate(()=>PondLive.active().framework),'crt-v1');
  assert.equal(await page.locator('#studioChangeSetup').isVisible(),false);await page.locator('#closePondStudio').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),seeded.financial,'Migration/pond/studio must not modify financial accounts');
  // History can still be edited with its original category, but new EGF/ISB records are blocked.
  await page.evaluate(()=>{switchAppView('dashboard');document.getElementById('inputDate').value='2026-11-20';document.getElementById('inputPnl').value='40';document.getElementById('entryKind').value='trade';document.getElementById('entrySetup').value='5';addJournalEntry({preventDefault(){}});});
  assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].setup),'5');
  await page.evaluate(()=>{const a=getActiveAccount();a.journalEntries[0].setup='7';saveAccounts();});await page.reload();await ready();
  await page.evaluate(()=>{editJournalEntry(0);document.getElementById('inputPnl').value='60';addJournalEntry({preventDefault(){}});});
  assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].setup),'7');assert.equal(await page.evaluate(()=>getActiveAccount().journalEntries[0].pnl),60);
  const finance=await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3'));
  await page.evaluate(()=>{document.getElementById('inputDate').value='2026-11-21';document.getElementById('inputPnl').value='20';document.getElementById('entryKind').value='trade';document.getElementById('entrySetup').value='6';addJournalEntry({preventDefault(){}});});
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),finance,'Programmatic selection cannot create an obsolete method');
  await page.evaluate(()=>switchAppView('checklist'));fs.mkdirSync('output/ui-review',{recursive:true});
  for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow at '+width);}
  await page.setViewportSize({width:1440,height:1000});await page.locator('#htfExecutionContext').scrollIntoViewIfNeeded();await page.screenshot({path:'output/ui-review/crt-v1-web.png'});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/ui-review/crt-v1-mobile.png',fullPage:true});
  // Invalid storage remains byte-for-byte intact even when the user ticks new controls.
  await page.evaluate(()=>localStorage.setItem('topstep_checklist_state','{broken'));await page.reload();await ready();await page.evaluate(()=>triggerCastStep(1));
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_checklist_state')),'{broken');assert.match(await page.locator('#frameworkMigrationNotice').textContent(),/bản gốc/);
  await page.evaluate(saved=>{localStorage.setItem('topstep_checklist_state',JSON.stringify(saved));loadChecklistState();},migrated);
  assert.doesNotMatch(await page.locator('#frameworkMigrationNotice').textContent(),/Chưa đọc được/,'Recovery clears the corrupt-storage notice without a page reload');
  assert.deepEqual(errors,[]);console.log('PASS CRT-only UI, idempotent nested migration, preserved catches/history/finance, isolated old rounds, entry reset/reload, studio, legacy journal editing/new-category guard, corrupt storage and 4 responsive widths. Not market Replay.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
