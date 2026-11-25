// Manual, anonymous full-compiler check. Does not log in, save, or publish.
// Uses the endpoint called by TradingView's public editor; it may change.
// This is separate from translate_light and from chart execution validation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

(async () => {
  const file = process.argv[2] || 'indicators/funded-angler-v6.pine';
  const source = fs.readFileSync(file, 'utf8');
  const payload = new FormData();
  payload.set('source', source);
  payload.set('inputs', '{}');
  const started = Date.now();
  // One attempt only. A timeout must be investigated, never automatically retried.
  const response = await fetch('https://pine-facade.tradingview.com/pine-facade/translate_source/__create_new?is_pine_ex=false', {
    method: 'POST',
    headers: { Origin: 'https://www.tradingview.com', Referer: 'https://www.tradingview.com/' },
    body: payload,
    signal: AbortSignal.timeout(150000),
  });
  const result = await response.json();
  const report = {
    source: file,
    sha256: crypto.createHash('sha256').update(source.replace(/\r\n/g, '\n').trim()).digest('hex'),
    httpStatus: response.status,
    elapsedMs: Date.now() - started,
    fullCompilationPassed: response.ok && result.success === true && !!result.result?.metaInfo?.pine,
    reason: result.reason || null,
    errors: result.reason2?.errors || result.result?.errors || [],
    warnings: result.result?.metaInfo?.warnings || result.reason2?.warnings || [],
    chartExecutionVerified: false,
  };
  const output = 'output/pine-review/full-compiler-report.json';
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (!report.fullCompilationPassed || report.errors.length) process.exitCode = 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
