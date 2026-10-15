const assert=require('node:assert/strict'),path=require('node:path');
const Loss=require('../assets/pond-loss.js');
const hand={x:303,y:439},origin={x:650,y:436};
for(const kind of ['half','sl']){
 let previous=Loss.sample(kind,0,hand,origin);
 for(let t=.001;t<3;t+=.001){
  const pose=Loss.sample(kind,t,hand,origin);
  assert.ok(Number.isFinite(pose.tip.x)&&Number.isFinite(pose.fish.y));
  assert.ok(Math.hypot(pose.fish.x-previous.fish.x,pose.fish.y-previous.fish.y)<2,'Fish cannot teleport');
  if(previous.broken===pose.broken)assert.ok(Math.hypot(pose.tip.x-previous.tip.x,pose.tip.y-previous.tip.y)<2,'Rod motion must be continuous except at fracture');
  previous=pose;
 }
 assert.equal(Loss.sample(kind,99,hand,origin).opacity,0);
}
assert.ok(Loss.sample('half',.3,hand,origin).fish.y<origin.y-140);
assert.equal(Loss.sample('sl',.3,hand,origin).airborne,false);
(async()=>{
 const {chromium}=require('../.review-tools/node_modules/playwright');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>PondScene.ready()&&anglerState.isLoopRunning);
  await page.evaluate(()=>{setAnglerMotionMode('off');setPondTimeMode('afternoon');PondExecution.choose('tp');});
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),1);
  const first=await page.evaluate(()=>PondExecution.current());
  await page.locator('#chk-risk-tp').uncheck();
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),0,'Undo TP removes its catch');
  await page.locator('#chk-risk-tp').check();
  assert.equal(await page.evaluate(()=>PondExecution.current().id),first.id);
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),1,'Retick must not duplicate fish');
  await page.evaluate(()=>{PondExecution.newRound();renderQuietPond();});
  assert.equal(await page.locator('#rusticAnglerCanvas').getAttribute('data-creel-count'),'1');
  await page.reload();await page.waitForFunction(()=>PondScene.ready()&&anglerState.isLoopRunning);
  assert.equal(await page.evaluate(()=>PondExecution.creel()[0].fishSeed),first.fishSeed);
  await page.evaluate(()=>{document.getElementById('chk-risk-1r').checked=true;onChecklistChange();PondExecution.choose('manual');PondExecution.newRound();});
  assert.equal(await page.evaluate(()=>PondExecution.creel().length),2,'Manual close also survives a new round');
  const finance=await page.evaluate(()=>JSON.stringify(getActiveAccount()));
  for(const kind of ['half','sl']){
   await page.evaluate(kind=>{setAnglerMotionMode('on');triggerCastStep(1);triggerCastStep(2);triggerCastStep(3);triggerCastStep(4);PondExecution.choose(kind);},kind);
   await page.waitForFunction(()=>anglerState.lossPose?.broken);
   assert.equal(await page.evaluate(()=>PondExecution.creel().length),2);
   if(kind==='half')assert.equal(await page.evaluate(()=>anglerState.lossPose.airborne),true);
   await page.evaluate(()=>{cancelAnimationFrame(anglerState.rafId);anglerState.time+=.42-PondExecution.age();renderQuietPond();});
   await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-loss-'+kind+'.png'});
   await page.reload();await page.waitForFunction(()=>anglerState.lossPose?.age>=99&&PondScene.ready());
   assert.equal(await page.evaluate(()=>anglerState.lossPose.opacity),0,'Reload never replays the loss');
   await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-loss-'+kind+'-settled.png'});
   await page.evaluate(()=>PondExecution.newRound());
   assert.equal(await page.evaluate(()=>anglerState.lossPose),null,'New round repairs the illustrated rod');
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(getActiveAccount())),finance);
  for(const kind of ['half','sl']){
   const settled=await page.evaluate(kind=>{setAnglerMotionMode('off');PondExecution.choose(kind);return {broken:anglerState.lossPose.broken,opacity:anglerState.lossPose.opacity,count:PondExecution.creel().length};},kind);
   assert.deepEqual(settled,{broken:true,opacity:0,count:2},'Reduced motion renders the settled result');
   await page.evaluate(()=>PondExecution.newRound());
  }
  await page.locator('#btnPondFullscreen').click();
  await page.waitForFunction(()=>document.getElementById('rusticAnglerCard').dataset.fullscreen==='true');
  await page.screenshot({path:'output/pond-creel-persistent-wide.png'});
  assert.equal(await page.locator('#rusticAnglerCanvas').getAttribute('data-creel-count'),'2');
  // Old records, other accounts/stages and losses cannot leak into today's creel.
  const scope=await page.evaluate(()=>{
   const k='topstep_pond_outcomes_v1',d=JSON.parse(localStorage.getItem(k)),r=d.history.find(r=>r.outcome==='tp');
   d.history.push({...r,id:'yesterday',at:new Date(Date.now()-86400000).toISOString()},
    {...r,id:'other-account',account:r.account+'-other'}, {...r,id:'other-stage',stage:r.stage==='combine'?'xfa':'combine'},
    {...r,id:'undone',catchActive:false}, {...r}, {...r,id:'legacy',fishSeed:undefined});
   localStorage.setItem(k,JSON.stringify(d));PondExecution.reload();
   const seeds=PondExecution.creel().map(r=>r.fishSeed);PondExecution.reload();
   return {count:PondExecution.creel().length,stable:JSON.stringify(seeds)===JSON.stringify(PondExecution.creel().map(r=>r.fishSeed)),
    sameDay:PondExecution.dayKey('2026-10-15T16:59:59Z')===PondExecution.dayKey('2026-10-15T17:00:00Z')};
  });
  assert.deepEqual(scope,{count:3,stable:true,sameDay:false});
  assert.deepEqual(errors,[]);
  console.log('PASS persistent TP/manual creel; undo/idempotence/reload; account/day isolation; distinct continuous losses, no replay, new-round repair; unchanged finance/fullscreen');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
