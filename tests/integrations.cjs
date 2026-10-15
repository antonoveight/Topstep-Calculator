const {chromium} = require('../.review-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const vm = require('node:vm');
(async()=>{
 const source=await fs.readFile('topstep_google_sheets_setup.js','utf8');
 function sheetRun(approved) {
  const calls=[],formulas=new Map(),range={};
  for(const method of ['merge','setValue','setFontFamily','setFontSize','setFontWeight','setBackground','setFontColor','setHorizontalAlignment','setVerticalAlignment','setNumberFormat','setValues']) range[method]=()=>range;
  const sheet={};
  for(const method of ['setName','clear','setHiddenGridlines','setRowHeight','autoResizeColumn','setColumnWidth']) sheet[method]=(...args)=>{calls.push([method,...args]);return sheet;};
  sheet.getRange=(...args)=>{
   const selected={setFormula:formula=>{formulas.set(args.join(','),formula);return selected;}};
   for(const method of Object.keys(range)) selected[method]=()=>selected;
   return selected;
  };
  const ui={ButtonSet:{YES_NO:1},Button:{YES:'yes'},alert:()=>approved?'yes':'no'};
  const sandbox={SpreadsheetApp:{getActiveSpreadsheet:()=>({getActiveSheet:()=>sheet}),getUi:()=>ui}};
  vm.runInNewContext(source,sandbox);sandbox.setupTopstepTracker();return {calls,formulas};
 }
 assert.equal(sheetRun(false).calls.length,0);
 const result=sheetRun(true);
 assert.ok(result.calls.some(([name,value])=>name==='setHiddenGridlines'&&value===false));
 assert.ok(result.formulas.has('100,10'));assert.ok(result.formulas.get('J6').includes('FILTER'));assert.ok(result.formulas.get('F6').includes('/0.55'));
 console.log('PASS Apps Script: API surface, cancellation, formulas through row 100');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://app.topstepx.com/**',r=>r.fulfill({contentType:'text/html',body:'<div>Balance: $50,000</div><div>RP&amp;L: $0.00</div><div>EXPRESS-V2-DLL-001</div><div>MNQ</div>'}));
  await page.goto('https://app.topstepx.com/');
  await page.evaluate(()=>{window.setInterval=fn=>{fn();return 1;};window.GM_openInTab=url=>window.sentUrl=url;});
  const userscript=await fs.readFile('topstepx_cockpit_sync.user.js','utf8');
  await page.addScriptTag({content:userscript});await page.locator('#ts-cockpit-sync-btn').click();
  assert.equal(await page.locator('#sync-input-pnl').inputValue(),'0');
  await page.locator('#ts-submit-sync-btn').click();
  const payload=await page.evaluate(()=>JSON.parse(decodeURIComponent(atob(new URL(window.sentUrl).hash.split('topstepx=')[1]))));
  assert.equal(payload.pnl,0);assert.equal(payload.account,'EXPRESS-V2-DLL-001');assert.equal(payload.symbol,'MNQ');
  await page.evaluate(()=>document.body.innerHTML='<div>Balance: $50,000</div><div>Realized P&amp;L: -$1,234.50</div><div>TS-50K-001</div><div>MGC</div>');
  await page.addScriptTag({content:userscript});await page.locator('#ts-cockpit-sync-btn').click();
  assert.equal(await page.locator('#sync-input-pnl').inputValue(),'-1234.5');assert.deepEqual(errors,[]);
  console.log('PASS userscript: zero/negative PnL, account, symbol and tab payload');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
