const assert=require('node:assert/strict');
const path=require('node:path');
const Fish=require('../assets/pond-fish.js'),Catch=require('../assets/pond-catch.js');
const variants=new Set();
for(let seed=0;seed<200;seed++){
 const normal=Fish.profile(seed,5),big=Fish.profile(seed,6),tp=Fish.profile(seed,7);
 assert.ok(normal.size<big.size&&big.size<tp.size);
 assert.deepEqual(tp,Fish.profile(seed,7));
 variants.add(JSON.stringify([tp.colors,tp.pattern,tp.depth]));
 // The entire landed silhouette, including fins and tail, fits the oval opening.
 const left=tp.size*.8,right=tp.size*.55,vertical=tp.size*.4*tp.depth;
 assert.ok((left/73)**2+(tp.size*.26/31)**2<1);
 assert.ok(right<73&&vertical<31);
 const pose=Catch.sample(.4,{x:630,y:435},tp.size*tp.mouth);
 assert.ok(Math.abs(Math.hypot(pose.mouth.x-pose.fish.x,pose.mouth.y-pose.fish.y)-tp.size*.55)<1e-9);
}
assert.ok(variants.size>=20,'Several species/colour/pattern combinations per tier');
(async()=>{
 const {chromium}=require('../.review-tools/node_modules/playwright');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.waitForFunction(()=>anglerState.fishProfile);
  const seed=await page.evaluate(()=>PondExecution.fishSeed());
  for(const [id,tier] of [['1r',1],['2r',2],['tp',3]]){
   await page.locator('#chk-risk-'+id).check();
   await page.waitForFunction(t=>anglerState.fishProfile.tier===t,tier);
   assert.equal(await page.evaluate(()=>PondExecution.fishSeed()),seed);
  }
  const fish=await page.evaluate(()=>anglerState.fishProfile);
  await page.reload();await page.waitForFunction(()=>anglerState.fishProfile?.tier===3);
  assert.deepEqual(await page.evaluate(()=>anglerState.fishProfile),fish);
  await page.evaluate(()=>PondExecution.newRound());
  assert.notEqual(await page.evaluate(()=>PondExecution.fishSeed()),seed);
  // TP alone must select the highest tier without requiring either R checkbox.
  await page.locator('#chk-risk-tp').check();
  await page.waitForFunction(()=>anglerState.fishProfile?.tier===3);
  assert.equal(await page.locator('#chk-risk-1r').isChecked(),false);
  assert.equal(await page.locator('#chk-risk-2r').isChecked(),false);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 console.log('PASS fish diversity, tier sizes, basket capacity, scaled hook, stable reload, new round and direct TP');
})().catch(e=>{console.error(e);process.exitCode=1;});
