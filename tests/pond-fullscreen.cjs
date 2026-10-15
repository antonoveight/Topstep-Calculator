const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/')+'#checklist');
  await page.locator('#btnPondFullscreen').click();
  await page.waitForFunction(()=>document.fullscreenElement?.id==='rusticAnglerCard');
  await page.waitForFunction(()=>document.getElementById('rusticAnglerCanvas').height/document.getElementById('rusticAnglerCanvas').width<.57);
  assert.equal(await page.locator('#rusticAnglerCard button:visible').count(),4);
  assert.equal(await page.locator('#btnAnglerCastReel').isVisible(),true);
  const geometry=await page.evaluate(()=>{
   const rect=document.getElementById('rusticCanvasContainer').getBoundingClientRect(),canvas=document.getElementById('rusticAnglerCanvas');
   const m=canvas.getContext('2d').getTransform();
   return {ratio:rect.width/rect.height,scaleX:m.a,scaleY:m.d};
  });
  assert.ok(Math.abs(geometry.ratio-16/9)<.01);assert.equal(geometry.scaleX,geometry.scaleY,'Artwork and animation must not stretch');
  await page.screenshot({path:'output/pond-fullscreen-16x9.png'});
  for(let i=0;i<7;i++)await page.locator('#btnAnglerCastReel').click();
  await page.waitForFunction(()=>anglerState.fish.state==='basket',null,{timeout:7000});
  assert.equal(await page.locator('#chk-risk-tp').isChecked(),true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.getElementById('rusticAnglerCard').dataset.fullscreen);
  assert.equal(await page.locator('#pondTimeMode').isVisible(),true);
  assert.equal(await page.locator('#chk-risk-tp').isChecked(),true,'Exit keeps checklist state');
  console.log('PASS native fullscreen, four buttons, uniform 16:9 crop, full catch/basket and Escape restore');
  // Simulate a browser that rejects Fullscreen API, including entering from a collapsed pond.
  await page.evaluate(()=>{document.getElementById('rusticAnglerCard').requestFullscreen=()=>Promise.reject(new Error('Unavailable'));});
  await page.locator('#btnToggleAnglerCollapse').click();
  await page.locator('#btnPondFullscreen').click();
  await page.waitForFunction(()=>document.querySelector('.pond-fullscreen-fallback')?.open);
  assert.equal(await page.locator('#rusticAnglerCard button:visible').count(),4);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'btnAnglerCastReel','Modal focus skips the disabled manual control');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.pond-fullscreen-fallback').count(),0);
  assert.equal(await page.locator('#rusticCanvasContainer').isVisible(),false,'Restore the collapsed preference');
  await page.locator('#btnToggleAnglerCollapse').click();
  for(const [width,height] of [[1920,1080],[1280,800],[844,390],[390,844]]) {
   await page.setViewportSize({width,height});await page.locator('#btnPondFullscreen').click();
   const state=await page.evaluate(()=>{
    const card=document.getElementById('rusticAnglerCard'),r=document.getElementById('rusticCanvasContainer').getBoundingClientRect();
    const b=document.getElementById('btnAnglerCastReel').getBoundingClientRect();
    return {ratio:r.width/r.height,buttons:[...card.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0).length,
     inScene:b.top>=r.top&&b.bottom<=r.bottom+1,hit:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('button')?.id};
   });
   assert.ok(Math.abs(state.ratio-16/9)<.01);assert.equal(state.buttons,4);assert.equal(state.inScene,true);assert.equal(state.hit,'btnAnglerCastReel');
   await page.locator('#rusticCanvasContainer').dblclick({position:{x:40,y:30}});
   assert.equal(await page.locator('.pond-fullscreen-fallback').count(),0);
  }
  console.log('PASS rejected-API fallback, focus trap, collapsed-state restore, double tap exit and four viewport sizes');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
