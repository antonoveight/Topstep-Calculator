const assert=require('node:assert/strict'),path=require('node:path');
const Cast=require('../assets/pond-cast.js'),Behavior=require('../assets/pond-behavior.js');
const hand={x:303,y:439},tip={x:477,y:296},signatures=[];
for(let setup=1;setup<=4;setup++){
 const anchor=Behavior.anchor(setup),end=Cast.sample(1,hand,tip,anchor,setup);
 assert.deepEqual(end.tip,tip);assert.deepEqual(end.bobber,anchor);assert.equal(end.landed,true);
 const back=Cast.sample(.28,hand,tip,anchor,setup),release=Cast.sample(.6,hand,tip,anchor,setup);
 assert.ok(back.tip.x<hand.x-60,'Backswing must cross behind the shoulder');
 assert.ok(release.bobber.y<anchor.y-50,'Released float flies in an arc');
 let previous=Cast.sample(0,hand,tip,anchor,setup);
 for(let p=.001;p<=1;p+=.001){
  const pose=Cast.sample(p,hand,tip,anchor,setup);
  for(const point of ['tip','bobber','line']){
   assert.ok(Number.isFinite(pose[point].x+pose[point].y));
   assert.ok(Math.hypot(pose[point].x-previous[point].x,pose[point].y-previous[point].y)<4,'Cast and trailing line must be continuous');
  }
  previous=pose;
 }
 signatures.push([anchor,back.tip,[.7,1,2,5].map(t=>Behavior.motion({setup,stage:2},t,2))]);
}
assert.equal(new Set(signatures.map(JSON.stringify)).size,4,'Methods have separate cast and bait interactions');
(async()=>{
 const {chromium}=require('../.review-tools/node_modules/playwright');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>PondScene.ready()&&anglerState.isLoopRunning);
  await page.evaluate(()=>{
   resetChecklist();setPondTimeMode('afternoon');
   const draw=PondScene.drawActor;PondScene.drawActor=(ctx,pose,filter)=>{window.actualActorPose=pose;return draw(ctx,pose,filter);};
  });
  const checkGrip=async()=>assert.equal(await page.evaluate(()=>{
   const a=actualActorPose.hand,b=anglerState.geometry.hand;return Math.hypot(a.x-b.x,a.y-b.y)<1e-9;
  }),true,'Rod stays in the drawn hand, including after parking');
  await page.evaluate(()=>triggerCastStep(1));
  await page.waitForFunction(()=>anglerState.geometry.castPose?.phase==='backswing');await checkGrip();
  await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-cast-backswing.png'});
  await page.waitForFunction(()=>anglerState.geometry.castPose?.phase==='release');await checkGrip();
  await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-cast-release.png'});
  await page.waitForFunction(()=>anglerState.castProgress===1&&!anglerState.geometry.castPose);await checkGrip();
  await page.evaluate(()=>PondExecution.choose('tp'));
  await page.waitForFunction(()=>anglerState.catchPose?.deposited);await checkGrip();
  await page.waitForFunction(()=>anglerState.catchProgress===1);await checkGrip();
  await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-grip-after-tp.png'});
  await page.reload();await page.waitForFunction(()=>anglerState.isLoopRunning&&anglerState.stage===7);
  assert.equal(await page.evaluate(()=>anglerState.geometry.castPose),null,'Restoring never replays the cast');
  await page.evaluate(()=>{PondExecution.newRound();PondExecution.choose('be');});
  await page.waitForFunction(()=>PondExecution.age()>1.5);
  // Reload removed the inspection wrapper; compare the actual resting pose directly.
  assert.equal(await page.evaluate(()=>{
   const pose=PondScene.pose(anglerState.time,anglerState.stage,true,PondScene.gain());
   return Math.hypot(pose.hand.x-anglerState.geometry.hand.x,pose.hand.y-anglerState.geometry.hand.y)<1e-9;
  }),true);
  const interrupted=await page.evaluate(()=>{
   PondExecution.newRound();triggerCastStep(1);PondExecution.choose('tp');return anglerState.catchOrigin;
  });
  assert.deepEqual(interrupted,{x:650,y:436},'TP during an unfinished cast must lift from water, not from the flying float');
  assert.deepEqual(errors,[]);
  console.log('PASS backswing/release/line continuity, four method interactions, grip during cast/TP/rest and no replay on reload');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
