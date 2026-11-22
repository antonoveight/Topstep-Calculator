const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const {runCase,validateCase,selectReference}=require('../tools/lib/crt-first-leg-study.cjs');
const {study}=require('../tools/study-crt-first-leg.cjs');
const fixture=JSON.parse(fs.readFileSync('docs/research/crt-first-leg-fixtures.json','utf8')),report=study(fixture);
const pineBefore=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
assert.equal(report.caseCount,64);assert.equal(report.signalCases,14);
for(const k of ['marketData','pineRuntime','romeoModel1Verified','productionChanged','fillsOrPnlEvaluated'])assert.equal(report[k],false);
const get=id=>fixture.cases.find(c=>c.id===id);
for(const c of fixture.cases){
 const before=JSON.stringify(c),r=runCase(c);assert.deepEqual(r.signals.map(s=>s.knownAt),c.expected.signalKnownAt,c.id);assert.equal(r.trace.at(-1).status,c.expected.lastStatus,c.id);assert.equal(JSON.stringify(c),before);
 for(const event of r.signals){assert.ok(event.legKnownAt<event.knownAt);assert.ok(event.zoneKnownAt<=event.barStart);assert.ok(event.barStart>=c.context.confirmedAt&&event.knownAt<=c.context.windowEnd);}
 // Every prefix must be immutable under future OHLC, including invalidation.
 for(let i=1;i<=c.bars.length;i++){
  const bars=c.bars.slice(0,i),gatesByStart=Object.fromEntries(Object.entries(c.gatesByStart||{}).filter(([t])=>bars.some(b=>b.start===+t)));
  assert.deepEqual(runCase({...c,bars,gatesByStart}).trace,r.trace.slice(0,i),c.id+' prefix '+i);
 }
 const late={id:'unavailable-future',tf:c.context.ltf,side:c.context.dir===1?'high':'low',price:105,formedAt:c.context.tsAt,knownAt:c.context.tsAt+1,availableAtTs:true};
 assert.deepEqual(runCase({...c,references:[late,...c.references]}).trace,r.trace,'Late pivot must not change '+c.id);
}
for(const d of ['buy','sell']){
 const c=get('frozen-latest-reference-'+d);assert.equal(selectReference(c).id,'latest-high');
 assert.equal(selectReference({...c,references:[...c.references].reverse()}).id,'latest-high');
 const noZone={...get('valid-'+d),zone:null};assert.equal(runCase(noZone).trace.at(-1).status,'WAIT_ZONE');assert.equal(runCase(noZone).signals.length,0);
 const intrabar=structuredClone(get('valid-'+d));intrabar.zone.knownAt=125;assert.equal(runCase(intrabar).signals.length,0,'No credit for touch before zone publication inside that candle');
 const prior=structuredClone(get('valid-'+d));prior.context.inv+=d==='buy'?-5:5;
 assert.deepEqual(runCase({...prior,bars:prior.bars.slice(0,1)}).trace,runCase({...get('valid-'+d),bars:prior.bars.slice(0,1)}).trace,'Final HTF SL is not consulted before confirmation');
}
// New hypothesis can qualify without another adjacent-candle TS in C3.
const h=require('./helpers/pine-channel-harness.cjs').createHarness(pineBefore);
for(const d of ['buy','sell']){const c=get('valid-'+d),ctx={id:1,kind:1,flags:1,phase:1,dir:c.context.dir,age:0,confirmed:110,resolved:110,inv:c.context.inv,cp:c.context.target},tape=c.bars.map(b=>({t:b.start,o:b.o,h:b.h,l:b.l,c:b.c}));for(const timing of ['Pullback','Confirmation close']){const state=h.state(ctx),events=[];for(let i=1;i<tape.length;i++)events.push(h.step(ctx,state,tape.slice(0,i+1),{timing}));assert.equal(events.some(e=>e.hit),false);}assert.equal(runCase(c).signals.length,1);}
// Source timeframe/context state is isolated; no cache is shared between runs.
const main=get('valid-buy'),higher={...structuredClone(main),id:'h4-independent',context:{...main.context,id:'crt-H4',sourceTf:'H4',windowEnd:320}};
assert.equal(runCase(higher).signals[0].sourceTf,'H4');assert.deepEqual(runCase(main),runCase(main));
const terminal=structuredClone(higher);terminal.bars.at(-1).l=terminal.context.inv;assert.equal(runCase(terminal).signals.length,0);assert.equal(runCase(main).signals.length,1);
for(const mutate of [x=>x.id=1,x=>x.context.id=1,x=>x.references[0].id=1,x=>x.context.tick=0,x=>x.context.dir=0,x=>x.context.gates.bias='yes',x=>x.references[0].knownAt=79,x=>x.zone.low=999,x=>x.bars[1].start=105,x=>x.bars[1].h=0,x=>x.bars[1].closed=undefined,x=>x.gatesByStart={999:{bias:true}}]){const c=structuredClone(main);mutate(c);assert.throws(()=>validateCase(c));}
assert.throws(()=>study({...fixture,kind:'market-data'}));assert.throws(()=>study({...fixture,cases:[main,main]}));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'first-leg-study-')),out=path.join(temp,'report.json');
const cli=spawnSync(process.execPath,['tools/study-crt-first-leg.cjs','docs/research/crt-first-leg-fixtures.json',out],{encoding:'utf8'});assert.equal(cli.status,0,cli.stderr);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).fixtureSha256,report.fixtureSha256);
const protectedInput=path.join(temp,'fixtures.json');fs.writeFileSync(protectedInput,JSON.stringify(fixture));
const sameFile=spawnSync(process.execPath,['tools/study-crt-first-leg.cjs',protectedInput,protectedInput],{encoding:'utf8'});assert.equal(sameFile.status,1);assert.deepEqual(JSON.parse(fs.readFileSync(protectedInput,'utf8')),fixture);
assert.equal(fs.readFileSync('indicators/funded-angler-v6.pine','utf8'),pineBefore);
console.log('PASS 64 symmetric first-leg research cases, supplied zone chronology, frozen pre-TS reference/leg, all prefix invariance, gaps/barriers/gates/expiry, no mandatory second TS, channel isolation and no Pine mutation. Synthetic hypothesis only.');
