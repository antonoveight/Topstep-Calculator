const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {study,validate}=require('../tools/study-crt-entry.cjs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),fixture=JSON.parse(fs.readFileSync('docs/research/crt-entry-study-fixtures.json','utf8'));
const report=study(source,fixture);assert.equal(report.cases.length,22);
assert.deepEqual(report.classificationCounts,{both_timings:2,confirmation_only:8,neither_timing:12});
assert.equal(report.marketData,false);assert.equal(report.profitabilityEvaluated,false);assert.equal(report.pineRuntime,false);assert.equal(report.baselineChanged,false);
assert.match(report.sourceSha256,/^[a-f0-9]{64}$/);assert.match(report.fixtureSha256,/^[a-f0-9]{64}$/);
assert.equal(report.assumptions.defaultSweepSize,0.01);assert.match(report.assumptions.defaultBias,/Aligned/);
const get=id=>report.cases.find(c=>c.id===id);
for(const dir of ['buy','sell']){
 assert.deepEqual(get('valid-retest-'+dir).modes.Pullback.signals,[102]);
 assert.deepEqual(get('valid-retest-'+dir).modes['Confirmation close'].signals,[101]);
 assert.equal(get('straight-run-'+dir).classification,'confirmation_only');
 assert.equal(get('window-ended-'+dir).modes.Pullback.trace.at(-1).status,'C3 CLOSED');
 assert.equal(get('target-before-retest-'+dir).modes.Pullback.trace.at(-1).status,'CP TAKEN');
 for(const id of ['neutral-bias','counter-without-key','wave-locked','pre-confirmation-source','double-sweep','unclosed-bars'])assert.equal(get(id+'-'+dir).classification,'neither_timing');
}
// Future bars cannot change previously closed-bar results in the restricted adapter.
for(const c of fixture.cases.filter(c=>c.id.startsWith('straight-run'))){
 const shorter={...c,bars:c.bars.slice(0,-1)},short=study(source,{...fixture,cases:[shorter]}).cases[0],full=get(c.id);
 for(const mode of ['Pullback','Confirmation close'])assert.deepEqual(full.modes[mode].trace.slice(0,-1),short.modes[mode].trace);
}
const clone=()=>structuredClone(fixture);
for(const mutate of [x=>x.kind='market-backtest',x=>x.cases.push(x.cases[0]),x=>x.cases[0].bars[2].t=x.cases[0].bars[1].t,x=>x.cases[0].bars[2].h=-1,x=>x.cases[0].options={timing:'market'},x=>x.cases[0].options={bias:'buy'},x=>x.cases[0].options={sweepSize:0},x=>x.cases[0].ageByTime={999:1}]){const x=clone();mutate(x);assert.throws(()=>validate(x));}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'crt-entry-study-')),output=path.join(temp,'report.json');
const cli=spawnSync(process.execPath,['tools/study-crt-entry.cjs','docs/research/crt-entry-study-fixtures.json',output],{encoding:'utf8'});
assert.equal(cli.status,0,cli.stderr);assert.equal(JSON.parse(fs.readFileSync(output,'utf8')).sourceSha256,report.sourceSha256);
assert.equal(source,fs.readFileSync('indicators/funded-angler-v6.pine','utf8'));
console.log('PASS 22 symmetric synthetic entry study cases, timing differences, unchanged bias/TS/window/wave gates, prefix causality, strict inputs, CLI provenance and no Pine mutation. Not market validation.');
