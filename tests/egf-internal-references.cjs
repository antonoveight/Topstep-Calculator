// HISTORICAL before pure CRT 2026-11-22; excluded from current check runners.
// Superseded by tests/pure-crt.cjs, crt-liquidity.cjs and crt-context.cjs.
// Old EGF workflow: tests/legacy-egf-internal-references.cjs, excluded from CRT runner.
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.doesNotMatch(s,/egfScenario|egfPathReady|egfContext|egfResult|f_trackTrigger/);
assert.match(s,/f_refreshIrl\(m, zones, swings\)/);
assert.match(s,/bool irlVisible = showIrl and hasModel and drawActive/);
assert.match(s,/bool internalZone = z.kind == pass and z.hi <= m.hi and z.lo >= m.lo/);
assert.match(s,/knownAt=time_close, leftTime=time\[2\]/);
console.log('PASS CRT keeps genuine HTF internal references; EGF signal gates are removed.');
