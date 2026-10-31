const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises');
const ambient=require('../assets/pond-ambient.js');
assert.notEqual(ambient.pose(0).breath,ambient.pose(2).breath);
for(let t=0;t<600;t+=.2){const p=ambient.pose(t);assert.ok(Math.abs(p.breath)<=.81);assert.ok(p.leaves.every(l=>l.alpha>=0&&l.alpha<=.6));}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning);
  await page.waitForFunction(()=>PondScene.ready()&&document.getElementById('rusticAnglerCanvas').dataset.layered==='true');
  await page.locator('.pond-scene-settings summary').click();
  await page.locator('#pondMotionLevel').selectOption('gentle');await page.locator('#pondPerformance').selectOption('light');
  assert.equal(await page.evaluate(()=>PondScene.fps()),24);assert.equal(await page.evaluate(()=>PondScene.gain()),.55);
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal(await page.evaluate(()=>PondScene.gain()),.55);
  await page.locator('.pond-scene-settings summary').click();await page.locator('#pondMotionLevel').selectOption('balanced');await page.locator('#pondPerformance').selectOption('auto');
  // Every result is explicit, idempotent and independent of account journal entries.
  const before=await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3'));
  for(const outcome of ['be','half','sl','skip']){
   await page.evaluate(()=>{resetChecklist();for(let i=1;i<=4;i++)triggerCastStep(i);});
   await page.evaluate(outcome=>{PondExecution.choose(outcome);PondExecution.choose(outcome);},outcome);
   assert.equal(await page.evaluate(()=>PondExecution.current().outcome),outcome);
   assert.equal(await page.evaluate(()=>PondExecution.history().filter(r=>r.id===PondExecution.current().id).length),1);
   await page.waitForTimeout(1500);
   assert.notEqual(await page.evaluate(()=>anglerState.fish.state),'basket');
   await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
   assert.equal(await page.evaluate(()=>PondExecution.current().outcome),outcome);
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),before);
  const schedule=await page.evaluate(()=>[PondSchedule.describeSetup(4,new Date('2026-10-14T12:00:00Z')),PondSchedule.describeSetup(4,new Date('2026-12-14T12:00:00Z'))]);
  assert.deepEqual(schedule,['20:15–22:30','21:15–23:30']);
  await page.evaluate(()=>{resetChecklist();PondExecution.choose('tp');onChecklistChange();});
  assert.equal(await page.evaluate(()=>PondExecution.current().outcome),'tp');
  assert.equal(await page.evaluate(()=>PondExecution.history().filter(r=>r.id===PondExecution.current().id).length),1);
  const tpId=await page.evaluate(()=>PondExecution.current().id);
  await page.evaluate(()=>{document.getElementById('chk-risk-tp').checked=false;onChecklistChange();document.getElementById('chk-risk-tp').checked=true;onChecklistChange();});
  assert.equal(await page.evaluate(()=>PondExecution.current().id),tpId,'Correcting the same checkbox does not fabricate a new round');
  await page.evaluate(()=>resetChecklist());
  await page.locator('#btnPondStudio').click();
  assert.equal(await page.locator('#pondStudio').evaluate(e=>e.open),true);
  const geometry=await page.evaluate(()=>{const f=document.getElementById('pondBroadcastFrame').getBoundingClientRect(),s=document.getElementById('pondLiveScene').getBoundingClientRect(),c=document.querySelector('.pond-chart-pane').getBoundingClientRect();return {ratio:f.width/f.height,halves:Math.abs(s.height-c.height)<1};});
  assert.ok(Math.abs(geometry.ratio-9/16)<.01);assert.equal(geometry.halves,true);
  assert.equal(await page.locator('#pondBroadcastFrame button:visible').count(),4);
  await page.locator('#studioSymbol').selectOption('MGC');await page.locator('#studioSetup').selectOption('3');await page.locator('#studioWindow').selectOption('afternoon');
  await page.locator('#studioCommit').check();await page.locator('#pondStudioStart [type=submit]').click();
  assert.equal(await page.evaluate(()=>PondLive.active().setup),3);
  await page.locator('#studioChangeSetup').selectOption('2');
  assert.equal(await page.locator('#pondChangeDialog').evaluate(e=>e.open),true);
  await page.locator('#pondChangeReason').fill('Có cấu trúc mới; ghi nhận điều kiện thay đổi <img src=x>');
  await page.locator('#pondChangeForm [type=submit]').click();
  assert.equal(await page.evaluate(()=>activeChecklistSetup),2);
  assert.equal(await page.evaluate(()=>PondLive.active().changes.length),1);
  assert.equal(await page.locator('#pondStudio img[src=x]').count(),0);
  await page.locator('[data-studio-outcome="sl"]').click();await page.locator('#studioRoundRating').selectOption('yes');
  await page.locator('#btnAnglerCastReel').click();
  await page.locator('[data-studio-outcome="sl"]').click();
  assert.equal(await page.evaluate(()=>PondLive.shouldRest()),true);
  assert.equal(await page.locator('#btnAnglerCastReel').isDisabled(),true);
  await page.locator('#studioAssessment').selectOption('yes');await page.locator('#endPondSession').click();
  assert.equal(await page.evaluate(()=>PondLive.active()),null);
  assert.equal(await page.locator('#btnAnglerCastReel').isEnabled(),true);
  assert.match(await page.locator('#pondStudioNotice').textContent(),/Đúng quy trình/);
  // A session with no orders is valid, and is not fabricated as a winning session.
  await page.locator('#studioCommit').check();
  await page.locator('#pondStudioStart [type=submit]').click();
  const pendingId=await page.evaluate(()=>PondLive.active().id);
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning);
  assert.equal(await page.evaluate(()=>PondLive.active().id),pendingId);
  await page.locator('#btnPondStudio').click();await page.locator('#endPondSession').click();
  assert.match(await page.locator('#pondStudioNotice').textContent(),/Không có lệnh/);
  // Screen capture is opt-in; cancellation and cleanup of real MediaStream-like tracks.
  await page.evaluate(()=>{navigator.mediaDevices.getDisplayMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
  await page.locator('#capturePondChart').click();assert.match(await page.locator('#pondStudioNotice').textContent(),/Chưa chia sẻ/);
  await page.evaluate(()=>{navigator.mediaDevices.getDisplayMedia=async()=>{const c=document.createElement('canvas');c.width=800;c.height=600;const ctx=c.getContext('2d');ctx.fillStyle='#17495a';ctx.fillRect(0,0,800,600);ctx.fillStyle='white';ctx.font='28px sans-serif';ctx.fillText('MOCK CHART · TEST ONLY',70,200);window.mockPondStream=c.captureStream(1);return window.mockPondStream;};});
  await page.locator('#capturePondChart').click();await page.waitForFunction(()=>document.getElementById('pondChartVideo').srcObject!==null);
  await page.locator('#swapPondPanes').click();assert.equal(await page.locator('#pondBroadcastFrame').getAttribute('data-order'),'chart-first');
  await page.locator('#swapPondPanes').click();
  for(const [width,height] of [[1500,1050],[768,1000],[390,844]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(150);
   const layout=await page.evaluate(()=>{const f=document.getElementById('pondBroadcastFrame').getBoundingClientRect();return {ratio:f.width/f.height,right:f.right,viewport:innerWidth,canvas:document.getElementById('rusticAnglerCanvas').width>0};});
   assert.ok(Math.abs(layout.ratio-9/16)<.01);assert.ok(layout.right<=layout.viewport+1);assert.equal(layout.canvas,true);
   await page.locator('#pondBroadcastFrame').screenshot({path:`output/pond-studio-${width}.png`});
  }
  await page.locator('#closePondStudio').click();
  assert.equal(await page.evaluate(()=>mockPondStream.getTracks().every(t=>t.readyState==='ended')),true);
  assert.equal(await page.locator('#rusticAnglerCard').evaluate(e=>!!e.closest('.pond-column')),true);
  const download=page.waitForEvent('download');await page.evaluate(()=>exportFullBackupJSON());
  const backup=JSON.parse(await fs.readFile(await (await download).path(),'utf8'));
  assert.ok(backup.preferences.topstep_pond_outcomes_v1);assert.ok(backup.preferences.topstep_pond_sessions_v1);
  const imported=await page.evaluate(async backup=>{
   const before=localStorage.getItem('topstep_multi_accounts_v3'),notes=localStorage.getItem('topstep_pond_sessions_v1');
   const bad=structuredClone(backup);bad.preferences.topstep_pond_sessions_v1='{"active":{"invalid":{}},"history":[]}';
   importFullBackupJSON({target:{files:[new File([JSON.stringify(bad)],'bad.json')]}});await new Promise(r=>setTimeout(r,100));
   const untouched=localStorage.getItem('topstep_multi_accounts_v3')===before&&localStorage.getItem('topstep_pond_sessions_v1')===notes;
   const quota=structuredClone(backup),set=Storage.prototype.setItem,theme=localStorage.getItem('topstep_theme_mode');
   quota.accountsList[0].name='Must not persist';quota.preferences.topstep_theme_mode=theme==='light'?'dark':'light';
   Storage.prototype.setItem=function(key,value){if(key==='topstep_pond_sessions_v1')throw new DOMException('Full','QuotaExceededError');return set.call(this,key,value);};
   importFullBackupJSON({target:{files:[new File([JSON.stringify(quota)],'quota.json')]}});await new Promise(r=>setTimeout(r,100));
   Storage.prototype.setItem=set;
   const atomicQuota=localStorage.getItem('topstep_multi_accounts_v3')===before&&localStorage.getItem('topstep_theme_mode')===theme;
   localStorage.removeItem('topstep_pond_outcomes_v1');localStorage.removeItem('topstep_pond_sessions_v1');
   importFullBackupJSON({target:{files:[new File([JSON.stringify(backup)],'restore.json')]}});await new Promise(r=>setTimeout(r,100));
   return {untouched,atomicQuota,restored:localStorage.getItem('topstep_pond_sessions_v1')===backup.preferences.topstep_pond_sessions_v1,count:PondExecution.history().length};
  },backup);
  assert.equal(imported.untouched,true);assert.equal(imported.atomicQuota,true);assert.equal(imported.restored,true);assert.ok(imported.count>0);
  assert.deepEqual(errors,[]);
  console.log('PASS ambient bounds; four non-TP outcomes/reload/idempotence; finance isolation; 9:16 split; commitment/change audit; two-loss rest; unrated/no-trade summary; opt-in capture/cancel/track cleanup; 3 viewport sizes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
