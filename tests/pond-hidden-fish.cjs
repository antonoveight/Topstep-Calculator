const assert=require('node:assert/strict'),path=require('node:path');
const Fish=require('../assets/pond-fish.js'),Catch=require('../assets/pond-catch.js');
let previous=0;
for(let p=0;p<=1;p+=.001){
 const pose=Catch.sample(p),reveal=Fish.reveal(p,435,pose.fish.y);
 assert.ok(reveal>=0&&reveal<=1&&reveal>=previous-1e-9,'Reveal stays visible after leaving water');
 previous=reveal;
}
assert.equal(Fish.reveal(0,435,435),0);
assert.equal(Fish.reveal(.005,435,420),0,'No details before breaching');
assert.equal(Fish.reveal(1,435,504),1,'Do not hide the catch again inside the creel');
(async()=>{
 const {chromium}=require('../.review-tools/node_modules/playwright');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.isLoopRunning&&PondScene.ready());
  await page.evaluate(()=>{
   resetChecklist();setPondTimeMode('afternoon');anglerState.motionPaused=true;syncAnglerMotion();
   window.fishRenderCalls={details:0,shadows:[]};
   const draw=PondFish.draw,shadow=PondFish.drawShadow;
   PondFish.draw=(...args)=>{fishRenderCalls.details++;return draw(...args);};
   PondFish.drawShadow=(...args)=>{fishRenderCalls.shadows.push({size:PondFish.shadow.size,opacity:args[4]});return shadow(...args);};
  });
  for(let step=1;step<=4;step++){
   const calls=await page.evaluate(step=>{
    triggerCastStep(step);fishRenderCalls={details:0,shadows:[]};renderQuietPond();return fishRenderCalls;
   },step);
   assert.equal(calls.details,0,'Entry steps must also hide the reward');
   assert.equal(calls.shadows.length,step>=2?1:0);
  }
  for(const risk of ['1r','2r']){
   await page.locator('#chk-risk-'+risk).check();
   const calls=await page.evaluate(()=>{
    fishRenderCalls={details:0,shadows:[]};renderQuietPond();return fishRenderCalls;
   });
   assert.equal(calls.details,0,'R checkbox must not expose the reward fish');
   assert.deepEqual(calls.shadows,[{size:34,opacity:.24}],'1R and 2R share the same blurred silhouette');
  }
  await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-hidden-fish-underwater.png'});
  await page.locator('#chk-risk-tp').check();
  for(const progress of [0,.12,1]){
   const calls=await page.evaluate(progress=>{
    anglerState.catchProgress=progress;fishRenderCalls={details:0,shadows:[]};renderQuietPond();
    const pose=anglerState.catchPose;
    return {...fishRenderCalls,hookOffset:Math.hypot(pose.mouth.x-pose.fish.x,pose.mouth.y-pose.fish.y),actualOffset:anglerState.fishProfile.size*anglerState.fishProfile.mouth};
   },progress);
   assert.equal(calls.details,progress===0?0:1);
   assert.equal(calls.shadows.length,progress===0?1:0);
   assert.ok(Math.abs(calls.hookOffset-(progress===0?Fish.shadow.size*Fish.shadow.mouth:calls.actualOffset))<1e-8,'Hook must follow the visible mouth during the reveal');
   if(progress===.12)await page.locator('#rusticCanvasContainer').screenshot({path:'output/pond-hidden-fish-revealed.png'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS uniform hidden fish through entry/1R/2R, no reward details underwater, breach reveal, persistent visibility in creel');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
