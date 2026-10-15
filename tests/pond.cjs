const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1600,height:1100},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>anglerState.rafId!==null);
  assert.equal(await page.locator('#quietPondTitle').innerText(),'HỒ CÂU TĨNH TÂM');
  assert.equal(await page.evaluate(()=>document.getElementById('quietPondBackground').naturalWidth),1448);
  assert.equal(await page.locator('#anglerCoinText').count(),0);
  assert.equal(await page.locator('#anglerCastBtnText').innerText(),'Thả câu');
  await page.locator('#btnAnglerCastReel').click();
  await page.waitForFunction(()=>anglerState.castProgress===1,null,{timeout:4000});
  const cast=await page.evaluate(()=>({steps:anglerState.stepCount,cast:anglerState.castProgress,geometry:anglerState.geometry,dpr:devicePixelRatio,canvas:document.getElementById('rusticAnglerCanvas').width}));
  assert.equal(cast.steps,1);assert.equal(cast.cast,1);
  assert.ok(cast.geometry.bobber.x>cast.geometry.tip.x);
  assert.equal(await page.locator('#chk-s1-1').isChecked(),true);
  await page.locator('#btnAnglerCastReel').click();
  await page.locator('#btnAnglerCastReel').click();
  await page.locator('#btnAnglerCastReel').click();
  assert.equal(await page.locator('#anglerCastBtnText').innerText(),'Theo dõi +1R');
  await page.locator('#btnAnglerCastReel').click();assert.equal(await page.locator('#chk-risk-1r').isChecked(),true);
  assert.equal(await page.locator('#chk-risk-2r').isChecked(),false);
  await page.locator('#btnAnglerCastReel').click();assert.equal(await page.locator('#chk-risk-2r').isChecked(),true);
  assert.equal(await page.locator('#chk-risk-tp').isChecked(),false);
  await page.locator('#btnAnglerCastReel').click();assert.equal(await page.locator('#chk-risk-tp').isChecked(),true);
  await page.waitForTimeout(1500);assert.equal(await page.evaluate(()=>anglerState.fish.state),'lifted');
  assert.ok((await page.locator('#anglerStatusText').innerText()).includes('Full TP'));
  await page.locator('#btnAnglerCastReel').click();assert.equal(await page.evaluate(()=>anglerState.stepCount),0);
  console.log('PASS full cast → four setup conditions → +1R → BE → TP → reset');

  await page.locator('#btnToggleAnglerMotion').click();
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  const frozen=await page.evaluate(()=>anglerState.time);await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>anglerState.time),frozen);
  await page.reload();await page.waitForTimeout(150);
  assert.equal(await page.locator('#btnToggleAnglerMotion').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  await page.locator('#btnToggleAnglerMotion').click();
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>anglerState.rafId!==null);
  await page.locator('#btnToggleAnglerCollapse').click();
  assert.equal(await page.locator('#btnToggleAnglerCollapse').getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  await page.locator('#btnToggleAnglerCollapse').click();
  await page.waitForFunction(()=>anglerState.rafId!==null);
  await page.evaluate(()=>switchAppView('dashboard'));
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  await page.evaluate(()=>switchAppView('checklist'));
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>anglerState.rafId!==null);
  console.log('PASS pause persistence, collapse/resume, no animation on dashboard');

  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>anglerState.reducedMotion);
  assert.equal(await page.evaluate(()=>anglerState.rafId),null);
  await page.locator('#btnAnglerCastReel').click();
  assert.equal(await page.evaluate(()=>anglerState.castProgress),1);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>!anglerState.reducedMotion);
  console.log('PASS reduced motion honors OS preference; controls still work');

  await fs.mkdir('output',{recursive:true});
  await page.evaluate(()=>{resetChecklist();triggerCastStep(1);triggerCastStep(2);});
  await page.waitForTimeout(900);
  await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
  const grid=await page.locator('#checklist-section').boundingBox();
  await page.screenshot({path:'output/pond-desktop.png',clip:{x:grid.x,y:grid.y,width:grid.width,height:Math.min(930,grid.height)}});
  for(const theme of ['dark','light']) for(const width of [1600,1280,768,390,320]) {
   await page.setViewportSize({width,height:1000});await page.evaluate(theme=>setTheme(theme),theme);
   await page.locator('.finpoint-workspace').evaluate(e=>{e.scrollTop=0;});
   await page.locator('#rusticAnglerCard').scrollIntoViewIfNeeded();
   const dimensions=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,canvas:document.getElementById('rusticAnglerCanvas').getBoundingClientRect().toJSON(),image:document.getElementById('quietPondBackground').getBoundingClientRect().toJSON()}));
   assert.ok(dimensions.document<=dimensions.width,theme+' overflow at '+width);
   assert.equal(dimensions.canvas.width,dimensions.image.width);
   assert.equal(dimensions.canvas.height,dimensions.image.height);
   assert.ok(dimensions.canvas.width>=Math.min(width-60,width<1180?260:400),'Scene squeezed at '+width);
   if(width<1024) assert.equal(await page.locator('.finpoint-sidebar').isVisible(),false);
   if(width<1180) {
    const order=await page.evaluate(()=>({pond:document.getElementById('rusticAnglerCard').getBoundingClientRect().top,entry:document.getElementById('preTradeChecklistCard').getBoundingClientRect().top,risk:document.getElementById('pondRiskManagement').getBoundingClientRect().top,ai:document.getElementById('aiLensCard').getBoundingClientRect().top}));
    assert.ok(order.pond<order.entry && order.entry<order.risk && order.risk<order.ai,'Mobile order: pond, checklist, risk, AI');
   }
   if(width===390 && theme==='dark') await page.screenshot({path:'output/pond-mobile.png'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS dark/light layout at 1600, 1280, 768, 390, 320px; preview screenshots saved');
 } finally {await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
