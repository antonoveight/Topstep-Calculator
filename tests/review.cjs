// Development-only dependency: npm install --prefix .review-tools --no-save playwright
const {chromium} = require('../.review-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

(async () => {
    const html = await fs.readFile('index.html', 'utf8');
    assert.equal(html, await fs.readFile('topstep.html', 'utf8'), 'HTML entry points must match');
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
    const declarations = [...html.matchAll(/^\s*(?:async )?function (\w+)\(/gm)].map(m=>m[1]);
    assert.equal(declarations.length, new Set(declarations).size, 'Duplicate functions');
    const browser = await chromium.launch({
        executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true
    });
    const context = await browser.newContext({acceptDownloads:true, timezoneId:'Asia/Ho_Chi_Minh'});
    const page = await context.newPage();
    const errors=[], dialogs=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('dialog', async d=>{dialogs.push(d.message());await d.accept();});
    // External services are isolated: tests cover app logic without CDN/API availability.
    await page.route('https://**/*', r=>r.abort());
    const url = 'file:///' + path.resolve('index.html').replaceAll('\\','/');
    const load = async () => {await page.goto(url);};
    let checks=0;
    const check = async (name, fn) => {await fn();checks++;console.log('PASS '+name);};
    try {
        await load();
        await check('startup and inline event handlers', async()=>{
            assert.equal(await page.title(),'Finpoint Cockpit · Topstep® Finance Management');
            assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('payoutModal')).display),'none');
            assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('checklist-section')).display),'grid');
            const unknown = await page.evaluate(()=>{
                const globals = [...document.querySelectorAll('[onclick],[onchange],[onsubmit],[oninput]')]
                    .flatMap(e=>['onclick','onchange','onsubmit','oninput'].flatMap(k=>[...(e.getAttribute(k)||'').matchAll(/(?<![.\w])([a-zA-Z_$][\w$]*)\(/g)].map(m=>m[1])));
                return [...new Set(globals.filter(f=>f!=='if'&&typeof window[f]!=='function'))];
            });
            assert.deepEqual(unknown,[]);
        });
        await check('journal sorting, reload persistence and daily EOD MLL',async()=>{
            const ledger=await page.evaluate(()=>{
                const acc=getActiveAccount();
                for(const [date,pnl] of [['2026-10-02',-500],['2026-10-01',1500],['2026-10-01',-1000]]) {
                    document.getElementById('inputDate').value=date;document.getElementById('inputPnl').value=pnl;
                    addJournalEntry({preventDefault(){}});
                }
                return getAccountLedger(acc);
            });
            assert.equal(ledger.balance,50000);assert.equal(ledger.mll,48500);
            await page.reload();
            assert.equal(await page.evaluate(()=>getActiveJournal(getActiveAccount()).length),3);
            assert.deepEqual(await page.evaluate(()=>getActiveJournal(getActiveAccount()).map(e=>e.date)),['2026-10-01','2026-10-01','2026-10-02']);
        });
        await check('risk sizing: insufficient budget, invalid input, round ticks upward',async()=>{
            const result=await page.evaluate(()=>{
                document.getElementById('calcSymbol').value='MGC';slInputMode='ticks';
                document.getElementById('stopLossInput').value=10;document.getElementById('ticksInput').value=20;calculateTradeRisk();
                const zero=document.getElementById('calcMicroLots').innerText;
                document.getElementById('stopLossInput').value=100;document.getElementById('ticksInput').value=20.1;calculateTradeRisk();
                const risk=document.getElementById('calcActualRisk').innerText;
                document.getElementById('ticksInput').value=0;calculateTradeRisk();
                const invalid=document.getElementById('calcMicroLots').innerText;
                document.getElementById('calcSymbol').value='MBT';
                document.getElementById('stopLossInput').value=10000;document.getElementById('ticksInput').value=20;calculateTradeRisk();
                return {zero,risk,invalid,bitcoinMini:document.getElementById('calcMiniLots').innerText};
            });
            assert.equal(result.zero,'0 Micros');assert.equal(result.risk,'$84.00');assert.equal(result.invalid,'0 Micros');
            // MBT has a special product weighting; 50 MBT must not be inferred from 5 minis.
            assert.equal(result.bitcoinMini,'0 Mini');
        });
        await check('checklist restore, setup switch and single pond animation',async()=>{
            await page.evaluate(()=>{switchAppView('checklist');switchChecklistSetup(2);document.getElementById('chk-s2-1').checked=true;document.getElementById('chk-s2-2').checked=true;onChecklistChange();});
            await page.reload();await page.waitForTimeout(150);
            assert.deepEqual(await page.evaluate(()=>({setup:activeChecklistSetup,a:document.getElementById('chk-s2-1').checked,b:document.getElementById('chk-s2-2').checked,steps:anglerState.stepCount})),{setup:2,a:true,b:true,steps:2});
            await page.evaluate(()=>{resetChecklist();handleCastReelButtonClick();toggleAnglerCardCollapse();toggleAnglerCardCollapse();});
            assert.equal(await page.evaluate(()=>anglerState.stepCount),1);
        });
        await check('TopstepX matching account, replacement, idempotence and persistence',async()=>{
            const value=await page.evaluate(()=>{
                const acc=getActiveAccount();
                const payload={date:'2026-10-01',pnl:777,symbol:'MNQ',account:acc.id};
                history.replaceState(null,'','#topstepx='+btoa(encodeURIComponent(JSON.stringify(payload))));
                checkTopstepXSync();checkTopstepXSync();
                return getActiveJournal(acc).filter(e=>e.date===payload.date);
            });
            assert.equal(value.length,1);assert.equal(value[0].pnl,777);
            await page.reload();assert.equal(await page.evaluate(()=>getActiveJournal(getActiveAccount())[0].pnl),777);
            const before=await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3'));
            await page.evaluate(()=>{history.replaceState(null,'','#topstepx='+btoa(encodeURIComponent(JSON.stringify({date:'2026-10-03',pnl:900,account:'UNKNOWN'}))));checkTopstepXSync();history.replaceState(null,'',location.pathname);});
            assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),before);
        });
        await check('CSV download aggregates dates and matches dashboard balance',async()=>{
            const wait=page.waitForEvent('download');await page.evaluate(()=>exportTrackerCSV());
            const download=await wait;const csv=await fs.readFile(await download.path(),'utf8');
            assert.ok(csv.includes('Tong_PnL_Cuoi_Ngay_USD'));
            assert.ok(csv.includes('"777.00","50777.00","48777.00","2000.00"'));
            assert.equal(csv.trim().split('\r\n').length,3);
        });
        await check('XFA starts at zero, caps independent of activation path',async()=>{
            const result=await page.evaluate(()=>{
                const a=getActiveAccount();a.stage='xfa';a.xfaJournalEntries=[];a.payoutHistory=[];a.pricingPath='no_activation';
                loadActiveAccountState();
                const rows=[];
                for(const size of ['50','100','150']) for(const xfaPath of ['standard_payout','consistency_payout']) {
                    a.size=size;a.xfaPath=xfaPath;a.payoutCapDoubled=false;
                    const base=getPayoutCap(a,getAccountRules(a)).val;a.payoutCapDoubled=true;
                    rows.push([base,getPayoutCap(a,getAccountRules(a)).val]);
                }
                a.size='50';a.xfaPath='standard_payout';a.payoutCapDoubled=false;
                return {ledger:getAccountLedger(a),rows,card:document.getElementById('finpointCardBalance').innerText};
            });
            assert.equal(result.ledger.balance,0);assert.equal(result.ledger.mll,-2000);assert.equal(result.card,'$0.00');
            assert.deepEqual(result.rows,[[2000,4000],[3000,6000],[3000,6000],[4000,8000],[5000,10000],[6000,12000]]);
        });
        await check('Standard payout: new cycle, MLL lock, no repeat withdrawal',async()=>{
            const result=await page.evaluate(()=>{
                const a=getActiveAccount();
                a.xfaJournalEntries=[1,2,3,4,5].map(d=>({date:`2026-10-0${d}`,pnl:200,symbol:'MGC',trades:1,contracts:1}));
                const before=getPayoutStatus(a,'2026-10-05');
                document.getElementById('payoutDate').value='2026-10-05';document.getElementById('payoutAmount').value=500;
                submitPayoutRequest({preventDefault(){}});
                const after=getPayoutStatus(a,'2026-10-05');
                submitPayoutRequest({preventDefault(){}});
                return {before,after,count:a.payoutHistory.length};
            });
            assert.equal(result.before.eligible,true);assert.equal(result.after.eligible,false);assert.equal(result.after.winningDays,0);
            assert.equal(result.after.ledger.mll,0);assert.equal(result.after.ledger.balance,500);assert.equal(result.count,1);
        });
        await check('Consistency payout: positive cycle profits, 40%, zero-day reset',async()=>{
            const result=await page.evaluate(()=>{
                const a=getActiveAccount();a.payoutHistory=[];a.xfaPath='consistency_payout';
                a.xfaJournalEntries=[800,1200,1000].map((pnl,i)=>({date:`2026-10-0${i+1}`,pnl,symbol:'MNQ'}));
                const eligible=getPayoutStatus(a,'2026-10-03');
                a.payoutHistory=[{date:'2026-10-03',amount:1500}];
                a.xfaJournalEntries.push(...[-100,0,-100].map((pnl,i)=>({date:`2026-10-0${i+4}`,pnl,symbol:'MNQ'})));
                loadActiveAccountState();
                return {eligible,after:getPayoutStatus(a,'2026-10-06'),hub:document.getElementById('xfaHubDaysCount').innerText};
            });
            assert.equal(result.eligible.eligible,true);assert.equal(result.eligible.bestPct,.4);
            assert.equal(result.after.eligible,false);assert.equal(result.after.tradingDays,3);assert.ok(result.hub.includes('3/3'));
        });
        await check('MLL breach cannot later qualify after recovery',async()=>{
            const result=await page.evaluate(()=>{
                const a=getActiveAccount();a.stage='combine';a.journalEntries=[-2000,6000,2000].map((pnl,i)=>({date:`2026-10-0${i+1}`,pnl,symbol:'MGC'}));
                loadActiveAccountState();return {breached:getAccountLedger(a).breached,badge:document.getElementById('trackerConsistencyBadge').innerText};
            });
            assert.equal(result.breached,true);assert.ok(result.badge.includes('MLL'));
        });
        await check('backup download, atomic invalid import, restore both stages',async()=>{
            await page.evaluate(()=>{saveAccounts();});
            const wait=page.waitForEvent('download');await page.evaluate(()=>exportFullBackupJSON());
            const backup=JSON.parse(await fs.readFile(await (await wait).path(),'utf8'));
            assert.ok(backup.accountsList[0].journalEntries.length);assert.ok(backup.accountsList[0].xfaJournalEntries.length);
            assert.ok(backup.preferences);assert.equal(JSON.stringify(backup).includes('gemini_api_key'),false);
            const result=await page.evaluate(async backup=>{
                const before=JSON.stringify(accountsList);
                const invalid=structuredClone(backup);invalid.accountsList[0].journalEntries[0].pnl='bad';
                importFullBackupJSON({target:{files:[new File([JSON.stringify(invalid)],'invalid.json')]}});
                await new Promise(r=>setTimeout(r,100));
                const unchanged=JSON.stringify(accountsList)===before;
                accountsList[0].name='Changed';
                importFullBackupJSON({target:{files:[new File([JSON.stringify(backup)],'valid.json')]}});
                await new Promise(r=>setTimeout(r,100));
                return {unchanged,name:accountsList[0].name};
            },backup);
            assert.equal(result.unchanged,true);assert.equal(result.name,backup.accountsList[0].name);
        });
        await check('account IDs and AI results render as plain text',async()=>{
            const value=await page.evaluate(()=>{
                const a=getActiveAccount();a.id=`TS-'\"<img src=x onerror=alert(1)>`;a.name='<img src=x onerror=alert(1)>';activeAccountId=a.id;
                renderAllAccountsHub();
                const button=document.querySelector('#allAccountsTableBody button');button.click();
                renderAiAnalysisResult({direction:'LONG',drawingCheck:{status:'CHUA_DUNG',feedback:'<img src=x onerror=alert(1)>'},action:'<script>alert(1)</script>'},'gemini-test');
                return {id:getActiveAccount().id,imgs:document.querySelectorAll('#allAccountsTableBody img,#aiAnalysisResultBox img,#aiAnalysisResultBox script').length,text:document.getElementById('aiAnalysisResultBox').innerText};
            });
            assert.equal(value.imgs,0);assert.ok(value.id.includes('<img'));assert.ok(value.text.includes('<img'));
        });
        await check('Chicago session dates across DST, evening open and weekend',async()=>{
            const dates=await page.evaluate(()=>['2026-10-14T20:30:00Z','2026-10-14T22:00:00Z','2026-10-16T22:00:00Z','2026-12-14T22:30:00Z','2026-12-14T23:00:00Z'].map(d=>getActiveTopstepTradeDate(new Date(d))));
            assert.deepEqual(dates,['2026-10-14','2026-10-15','2026-10-19','2026-12-14','2026-12-15']);
        });
        await check('corrupt storage remains untouched and can restore backup',async()=>{
            const saved=await page.evaluate(()=>JSON.stringify(accountsList));
            await page.evaluate(()=>localStorage.setItem('topstep_multi_accounts_v3','{invalid'));
            await page.reload();
            assert.equal(await page.evaluate(()=>localStorage.getItem('topstep_multi_accounts_v3')),'{invalid');
            await page.evaluate(async saved=>{
                importFullBackupJSON({target:{files:[new File([JSON.stringify({accountsList:JSON.parse(saved)})],'restore.json')]}});
                await new Promise(r=>setTimeout(r,100));
            },saved);
            assert.equal(await page.evaluate(()=>accountStorageInvalid),false);
        });
        assert.deepEqual(errors,[], 'Browser runtime errors');
        console.log(`\n${checks} browser checks passed; no runtime errors. External CDN and Gemini calls were isolated.`);
    } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1;});
