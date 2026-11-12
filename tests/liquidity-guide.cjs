const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../.review-tools/node_modules/playwright');

(async () => {
    assert.equal(fs.readFileSync('index.html', 'utf8'), fs.readFileSync('topstep.html', 'utf8'));
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        let request;
        page.on('pageerror', e => errors.push(e.message));
        await page.route('https://**/*', async route => {
            if (route.request().url().includes('generativelanguage.googleapis.com')) {
                request = route.request().postDataJSON();
                return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ direction: 'NO_TRADE', summaryDirective: 'Missing FRVP data', action: 'WAIT', drawingCheck: { status: 'AI_TU_PHAN_TICH', feedback: 'Range needs confirmation' } }) }] } }] }) });
            }
            return route.abort();
        });
        await page.goto('file:///' + path.resolve('index.html').replaceAll('\\', '/') + '#checklist');
        await page.waitForFunction(() => typeof switchChecklistSetup === 'function' && typeof DeskUI !== 'undefined');
        await page.evaluate(() => switchAppView('checklist'));
        const before = await page.evaluate(() => JSON.stringify(localStorage));
        assert.equal(await page.locator('#liquidityGuide').getAttribute('open'), null);
        assert.equal(await page.locator('.setup-liquidity-guide').count(), 3);
        for (const setup of [5,6,7]) {
            await page.evaluate(setup => switchChecklistSetup(setup), setup);
            const guide = page.locator('#checklist-setup-' + setup + ' .setup-liquidity-guide');
            assert.equal(await guide.isVisible(), true);
            await guide.locator('summary').click();
            assert.equal(await guide.locator('p').isVisible(), true);
            assert.equal(await page.locator('#checklist-setup-' + setup + ' input:checked').count(), 0);
        }
        await page.locator('#liquidityGuide summary').click();
        assert.equal(await page.locator('#liquidityGuide a').first().getAttribute('href'), 'docs/CRT-LIQUIDITY-GUIDE.md');
        assert.equal(await page.locator('#liquidityGuide a[download]').getAttribute('href'), 'indicators/funded-angler-v5.pine');
        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 1000 });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
        }
        // Exercise the real prompt construction and renderer without calling Gemini.
        await page.evaluate(async () => {
            localStorage.setItem('topstep_gemini_api_key', 'test-key');
            localStorage.setItem('topstep_gemini_model', 'gemini-test');
            currentChartBase64 = 'data:image/png;base64,aGVsbG8=';
            await runAiChartAnalysis();
        });
        assert.ok(request, 'Mock received the analysis request');
        const prompt = request.contents.flatMap(c => c.parts).map(p => p.text || '').join('\n');
        assert.match(prompt, /IRL|ERL/);
        assert.match(prompt, /NO_TRADE/);
        assert.match(prompt, /Outside Bar/);
        assert.match(prompt, /Turtle Soup/);
        assert.match(await page.locator('#checklist-setup-5').innerText(), /TS/);
        assert.doesNotMatch(prompt, /VÀO LỆNH NGAY/);
        assert.match(await page.locator('#aiAnalysisResultBox').innerText(), /Missing FRVP data/);
        await page.evaluate(() => testSampleAiScan());
        assert.match(await page.locator('#aiAnalysisResultBox').innerText(), /2658/);
        await page.evaluate(() => testSampleAiScan());
        assert.match(await page.locator('#aiAnalysisResultBox').innerText(), /2670/);
        const after = await page.evaluate(() => JSON.stringify(localStorage));
        const ignore = key => /checklist|gemini|active_app_view|pond_outcomes/.test(key);
        const accountsOnly = json => Object.fromEntries(Object.entries(JSON.parse(json)).filter(([key]) => !ignore(key)));
        assert.deepEqual(accountsOnly(after), accountsOnly(before), 'Guides and mock analysis do not change account data');
        for (const field of ['current', 'history']) {
            const pond = json => JSON.parse(JSON.parse(json).topstep_pond_outcomes_v1 || '{}');
            assert.deepEqual(pond(after)[field], pond(before)[field], 'Switching setups does not record an outcome');
        }
        assert.deepEqual(errors, []);
        console.log('PASS liquidity guides, setup switching, responsive layout, mock AI prompt and account isolation');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
