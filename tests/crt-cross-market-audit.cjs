// Diagnostic counterexamples using actual restricted Pine channel bodies.
// Constructed OHLC, not a multi-market backtest or an emulation of security/pivots.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('indicators/funded-angler-v6.pine', 'utf8');
const h = require('./helpers/pine-channel-harness.cjs').createHarness(source);
const bar = (t,o,h,l,c) => ({t,end:t+1,o,h,l,c});
const sell = [bar(100,104,108,102,106),bar(101,108,111,103,105),bar(102,104,105,99,100),bar(103,99,101,96,97),bar(104,104,107,100,101)];
const mirror = b => ({...b,o:220-b.o,h:220-b.l,l:220-b.h,c:220-b.c});
const evidence = [];
for (const dir of [-1,1]) {
  const key = {kind:2,dir,lo:dir===-1?110:106,hi:dir===-1?114:110,knownAt:80,beforeTime:90,tf:'60'};
  const tape = dir===-1?sell:sell.map(mirror);
  function run(options={},extra={}) {
    const ctx = {id:90,kind:1,flags:1,phase:1,dir,confirmed:100,inv:dir===-1?130:90,cp:dir===-1?80:140,crtKey:key,...extra};
    const state=h.state(ctx),out=[];
    for(let i=2;i<=tape.length;i++) out.push(h.step(ctx,state,tape.slice(0,i),{
      knownHigh:dir===-1?108:118,knownHighAt:dir===-1?95:98,
      knownLow:dir===-1?102:112,knownLowAt:dir===-1?98:95,...options
    }));
    return {state,out,hits:out.filter(x=>x.hit)};
  }
  const counter=run({bias:-dir,allowCrtCounter:true}),disabled=run({bias:-dir,allowCrtCounter:false});
  assert.ok(counter.hits.length>0);
  assert.ok(counter.hits.every(x=>x.counterBias));
  assert.equal(counter.state.biasRole,'KEY REV');
  assert.equal(disabled.hits.length,0);
  const ts=run({branches:'TS close'}),all=run();
  assert.equal(ts.hits.length,1);
  assert.ok(all.hits.length>ts.hits.length,'All can emit more than once within the same TS leg');
  const noStructure=run({structureReady:false});
  assert.ok(noStructure.hits.some(x=>x.tag==='TS_CLOSE'));
  assert.equal(noStructure.state.mpsAt,null,'M15 MPS is not mandatory for TS close');
  const missingKey=run({localKeys:[]},{crtKey:null});
  assert.equal(missingKey.hits.length,0);
  const adjacent=run({knownHigh:null,knownLow:null});
  assert.ok(adjacent.hits.some(x=>x.tag==='TS_CLOSE'),'Adjacent-candle TS may qualify without an ordered swing pair');
  assert.equal(adjacent.state.mpsAt,null);
  const barrier={kind:2,dir:-dir,lo:dir===-1?101:116,hi:dir===-1?104:119,knownAt:80,tf:'60'};
  const delivered=run({localKeys:[key,barrier]});
  assert.equal(delivered.out[0].hit,true,'A small intermediate barrier must not block a valid TS entry');
  assert.equal(delivered.out[0].status,'SIGNAL');
  assert.equal(delivered.out[0].tag,'TS_CLOSE');
  assert.equal(delivered.state.localTargetTaken,false,'No CRT range target was required for KEY DELIVERED');
  evidence.push({direction:dir,counterHits:counter.hits.map(x=>x.tag),counterDisabledHits:disabled.hits.length,
    allBranchHits:all.hits.map(x=>x.tag),tsOnlyHits:ts.hits.map(x=>x.tag),
    withoutM15CloseHits:noStructure.hits.map(x=>x.tag),missingKeyHits:missingKey.hits.length,
    adjacentWithoutSwingHits:adjacent.hits.map(x=>x.tag),intermediateBarrierHits:delivered.hits.length});
}
console.log(JSON.stringify({scope:'Constructed actual-source diagnostics; no market-performance claims',evidence},null,2));
console.log('PASS cross-market policy diagnostics in both directions.');
