// Compile once with Tailwind's official browser compiler; no compiler is shipped to app users.
// Cache https://cdn.tailwindcss.com/3.4.17 in .review-tools/tailwind-cdn.js before running.
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('../.review-tools/node_modules/playwright');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const html=await fs.readFile(path.join(root,'index.html'),'utf8');
 const compiler=await fs.readFile(path.join(root,'.review-tools/tailwind-cdn.js'),'utf8');
 // Include utilities assembled in JavaScript as well as those already present in the DOM.
 const safelist=[...new Set(html.match(/[-!a-zA-Z0-9_]+(?:[-:/][a-zA-Z0-9_.%#\[\]-]+)+/g)||[])];
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage();
  await page.route('https://**/*',r=>r.abort());
  // Ignore application scripts: only layout classes are needed during compilation.
  await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
  await page.addScriptTag({content:compiler});
  await page.evaluate(safelist=>{tailwind.config={safelist};},safelist);
  await page.waitForFunction(()=>[...document.querySelectorAll('style')].some(s=>s.textContent.includes('--tw-')));
  await page.waitForTimeout(250);
  const css=await page.evaluate(()=>[...document.querySelectorAll('style')].filter(s=>s.textContent.includes('--tw-')).map(s=>s.textContent).join('\n'));
  if(!css.includes('.hidden')||!css.includes('.grid'))throw new Error('Tailwind compilation incomplete');
  await fs.mkdir(path.join(root,'assets'),{recursive:true});
  await fs.writeFile(path.join(root,'assets/tailwind.css'),css+'\n');
  console.log('Built local Tailwind CSS ('+css.length+' characters)');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
