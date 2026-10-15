const {chromium}=require('../.review-tools/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs/promises');
const rules=require('../assets/trading-rules.js');
const base={id:'T',size:'50',stage:'xfa',pricingPath:'standard',xfaPath:'standard_payout',xfaJournalEntries:[],payoutHistory:[]};
const sample={...base,xfaJournalEntries:[1,2,3,4,5].map(n=>({date:`2026-10-0${n}`,pnl:200,closed:n!==5}))};
assert.equal(rules.payout(sample,'2026-10-05').eligible,false,'Pending EOD cannot qualify');
assert.equal(rules.payout(sample,'2026-10-04').ledger.balance,800,'As-of excludes future balance');
assert.equal(rules.ledger({...base,xfaJournalEntries:[{date:'2026-10-01',pnl:1000,closed:false}]}).mll,-2000,'Pending profit cannot trail MLL');
assert.equal(rules.payout({...sample,xfaJournalEntries:sample.xfaJournalEntries.map(e=>({...e,closed:true}))},'2026-10-05').eligible,true);
assert.equal(rules.payout({...sample,xfaJournalEntries:[...sample.xfaJournalEntries.map(e=>({...e,closed:true})),{date:'2026-10-06',pnl:5000,closed:false}]},'2026-10-06').eligible,false,'Pending profit must not inflate a currently eligible payout');

(async()=>{
    const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.route('https://**/*',r=>r.abort());
    const url='file:///'+path.resolve('index.html').replaceAll('\\','/');
    try {
        await page.goto(url);
        assert.equal(await page.locator('#sessionWorkspace,#planDate,#planRisk,#saveSessionPlan').count(),0);
        assert.equal(await page.locator('#entryKind').isVisible(),false);
        assert.equal(await page.locator('#inputDate').isVisible(),true);
        assert.equal(await page.locator('#inputSymbol').isVisible(),true);
        assert.equal(await page.locator('#inputPnl').isVisible(),true);
        // Basic save needs only the three primary fields.
        await page.locator('#inputDate').fill('2026-10-13');await page.locator('#inputPnl').fill('50');
        await page.locator('#tradeForm [type=submit]').click();
        assert.equal(await page.locator('#entryKind').isVisible(),false);
        assert.equal(await page.locator('#trackerTableBody tr').first().locator('td:visible').count(),5);
        await page.evaluate(()=>deleteEntry(0));
        async function entry(pnl,setup,compliance) {
            await page.locator('#inputDate').fill('2026-10-14');await page.locator('#inputPnl').fill(String(pnl));
            await page.locator('#journalOptions summary').click();
            await page.locator('#entryKind').selectOption('trade');await page.locator('#entrySetup').selectOption(setup);
            await page.locator('#entryRisk').fill('100');await page.locator('#entryCompliance').selectOption(compliance);
            await page.locator('#entryNote').fill('Chart <img src=x onerror=alert(1)>');
            await page.locator('#tradeForm [type=submit]').click();
        }
        await entry(200,'4','yes');await entry(-100,'4','no');
        await page.locator('#setupAnalytics summary').click();
        assert.match(await page.locator('#statsResults').innerText(),/Break/);
        assert.match(await page.locator('#statsResults').innerText(),/1.00R/);
        assert.match(await page.locator('#statsResults').innerText(),/50.0%/);
        assert.equal(await page.locator('#trackerTableBody img').count(),0);
        await page.evaluate(()=>editJournalEntry(0));
        await page.locator('#inputPnl').fill('300');await page.locator('#entryChart').fill('https://example.com/chart');
        await page.locator('#tradeForm [type=submit]').click();
        let journal=await page.evaluate(()=>getActiveJournal(getActiveAccount()));
        assert.equal(journal.length,2);assert.equal(journal[0].pnl,300);assert.equal(journal[0].revisions[0].previous.pnl,200);
        await page.evaluate(()=>showJournalDetails(0));
        assert.equal(await page.locator('#workspaceDialog img').count(),0);assert.match(await page.locator('#workspaceDialog').innerText(),/<img/);
        assert.equal(await page.locator('#workspaceDialog a').getAttribute('href'),'https://example.com/chart');
        await page.locator('#workspaceDialog button').first().click();
        await page.reload();
        assert.equal(await page.locator('#journalOptions').getAttribute('open'),null);
        await page.evaluate(()=>deleteEntry(0));
        assert.equal(await page.evaluate(()=>getActiveJournal(getActiveAccount()).length),1);
        await page.locator('#showRecovery').click();await page.locator('[data-restore="0"]').click();
        assert.equal(await page.evaluate(()=>getActiveJournal(getActiveAccount()).length),2);
        // Size is constrained by remaining budget, confirmed XFA session and optional DLL.
        const sizing=await page.evaluate(()=>{
            const a=getActiveAccount();a.stage='xfa';a.xfaJournalEntries=[];a.dllEnabled=false;loadActiveAccountState();
            const date=getActiveTopstepTradeDate();
            a.sessionPlans={xfa:{[date]:{risk:1,daily:1,setup:'',note:''}}};
            document.getElementById('calcSymbol').value='MGC';document.getElementById('stopLossInput').value=500;
            document.getElementById('ticksInput').value=20;slInputMode='ticks';calculateTradeRisk();
            const unverified=document.getElementById('calcMicroLots').innerText;
            a.confirmedMiniLimit=2;a.limitSession=date;calculateTradeRisk();
            const verified=document.getElementById('calcMicroLots').innerText;
            a.xfaJournalEntries=[{date,pnl:-1990}];calculateTradeRisk();
            const thin=document.getElementById('calcMicroLots').innerText;
            return {unverified,verified,thin};
        });
        assert.deepEqual(sizing,{unverified:'0 Micros',verified:'20 Micros',thin:'0 Micros'});
        await page.locator('#accountLimits summary').click();
        await page.locator('#confirmedMiniLimit').fill('2');await page.locator('#limitSession').fill(await page.evaluate(()=>getActiveTopstepTradeDate()));
        await page.locator('#accountDll').selectOption('no');await page.locator('#saveAccountLimits').click();
        assert.equal(await page.evaluate(()=>getActiveAccount().dllEnabled),false);
        assert.equal(await page.locator('#finpointSyncToast').isVisible(),true);
        await page.locator('#accountLimits summary').click();
        // Forced quota failure: refuse mutation and keep the persisted account bytes.
        const failure=await page.evaluate(()=>{
            const before=localStorage.getItem(AccountStore.key),set=Storage.prototype.setItem;
            Storage.prototype.setItem=function(k,v){if(k==='topstep_recovery_v1')throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};
            getActiveAccount().name='Should not persist';let rejected=false;
            try{saveAccounts();}catch{rejected=true;}finally{Storage.prototype.setItem=set;}
            return {rejected,unchanged:before===localStorage.getItem(AccountStore.key),memoryRestored:getActiveAccount().name!=='Should not persist'};
        });
        assert.deepEqual(failure,{rejected:true,unchanged:true,memoryRestored:true});
        // Cross-tab writes cannot silently overwrite an external update.
        const conflict=await page.evaluate(()=>{
            const old=localStorage.getItem(AccountStore.key),changed=JSON.parse(old);changed[0].name='Other tab';
            localStorage.setItem(AccountStore.key,JSON.stringify(changed));getActiveAccount().name='This tab';
            let rejected=false;try{saveAccounts();}catch{rejected=true;}
            return {rejected,name:JSON.parse(localStorage.getItem(AccountStore.key))[0].name};
        });
        assert.deepEqual(conflict,{rejected:true,name:'Other tab'});
        await page.reload();
        // Legacy enum migration and rejection of invalid optional metadata.
        const validation=await page.evaluate(()=>{
            const a=structuredClone(getActiveAccount());a.pricingPath='no_act_fee';
            const migrated=normalizeAccounts([a])[0].pricingPath;a.confirmedMiniLimit=-1;
            let invalid=false;try{normalizeAccounts([a]);}catch{invalid=true;}
            return {migrated,invalid};
        });
        assert.deepEqual(validation,{migrated:'no_activation',invalid:true});
        const hub=await page.evaluate(()=>{
            const a=getActiveAccount();a.journalEntries=[{date:'2026-10-01',pnl:200},{date:'2026-10-01',pnl:-200}];
            a.xfaJournalEntries=[{date:'2026-10-02',pnl:100}];renderAllAccountsHub();
            return document.getElementById('allAccountsSummaryStats').innerText;
        });
        assert.match(hub,/1 Thắng \/ 0 Thua \/ 1 Hòa/);
        await page.locator('#setupAnalytics summary').click();
        await page.locator('#statsFrom').fill('2026-12-01');await page.locator('#statsTo').fill('2026-10-01');
        assert.match(await page.locator('#statsResults').innerText(),/Ngày bắt đầu/);
        await page.locator('#statsFrom').fill('');await page.locator('#statsTo').fill('');
        await fs.mkdir('output',{recursive:true});
        for(const width of [1440,768,390]) {
            await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
            const overflow=await page.evaluate(()=>({body:document.documentElement.scrollWidth>innerWidth+2,form:document.getElementById('tradeForm').getBoundingClientRect().right>innerWidth+2}));
            assert.deepEqual(overflow,{body:false,form:false},'Layout width '+width);
            await page.locator('#journal-section').screenshot({path:`output/journal-simple-${width}.png`});
        }
        assert.deepEqual(errors,[]);
        console.log('PASS pure policy boundaries; journal editing/history; setup statistics; quick entry and collapsed options; removed planning; legacy budgets ignored; undo; risk constraints; quota rollback; cross-tab protection; migration; responsive 1440/768/390.');
    }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
