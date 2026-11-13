// Reproduce density/missing-signal mechanisms on synthetic OHLC using the actual
// Pine channel body. This is not market frequency, a backtest, or a Pine runtime.
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const harness=require('./helpers/pine-channel-harness.cjs').createHarness(source);
const bar=(t,o,h,l,c)=>({t,o,h,l,c});
const crt={id:1,kind:1,flags:1,phase:1,dir:1,confirmed:100,resolved:100,hi:120,lo:90,inv:90,cp:120,irlH:null,irlL:null,irlT:null};
function run(ctx,tape,options={}){
 const state=harness.state(ctx),results=[];
 for(let j=2;j<tape.length;j++){
  const hit=harness.step(ctx,state,tape.slice(0,j+1),options);
  results.push({t:tape[j].t,hit:hit.hit,tag:hit.tag,status:hit.status});
 }
 return {hits:results.filter(r=>r.hit).map(r=>r.t),results};
}
const start=[bar(98,100,103,99,102),bar(99,102,104,101,103)];
// Six small opposing-run/break/retest sequences within a single parent model.
// The same live HTF context is intentionally held constant (no registry emulation).
const noisy=[...start];
for(let i=0;i<6;i++){
 const b=100+i*.2,t=100+i*4;
 noisy.push(bar(t,b+5,b+6,b+2,b+3),bar(t+1,b+3,b+7,b+2,b+6),bar(t+2,b+6,b+7,b+4,b+5.5),bar(t+3,b+5.5,b+8,b+5,b+6.5));
}
const fresh=run(crt,noisy),once=run(crt,noisy,{cadence:'One per model'});
assert.deepEqual(fresh.hits,[102,106,110,114,118,122],'Micro pullbacks can repeatedly rearm one CRT model');
assert.deepEqual(once.hits,[102],'One per model reduces density by suppressing all later reactions, including potentially valid ones');
const impulse=[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,109,106,108),bar(103,108,112,108,111),bar(104,111,115,111,114)];
const pullback=run(crt,impulse),market=run(crt,impulse,{timing:'Confirmation close'});
assert.deepEqual(pullback.hits,[],'A clean impulse without a later retest is intentionally absent in Pullback mode');
assert.deepEqual(market.hits,[101],'Confirmation-close identifies the earlier closed confirmation in that same impulse');
const biasBlocked=run(crt,noisy,{bias:-1});
assert.deepEqual(biasBlocked.hits,[]);assert.ok(biasBlocked.results.every(r=>r.status==='BIAS'));
const egf={...crt,id:2,kind:2,flags:2,phase:0};
const noIrl=run(egf,noisy);
assert.deepEqual(noIrl.hits,[]);assert.ok(noIrl.results.every(r=>r.status==='IRL WAIT'));
const noModel=run({...crt,id:null,dir:0},noisy);
assert.deepEqual(noModel.hits,[]);assert.ok(noModel.results.every(r=>r.status==='NO MODEL'));
// A later distinct C/M + retest may be missed because a first, unfilled pending
// confirmation/OB/FVG remains frozen and freshReaction requires state.sent.
const twoStructures=[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,109,106.5,108),bar(103,108,112,108,111),bar(104,111,112,108.5,109),bar(105,109,113,108.5,112),bar(106,112,113,110.5,111.5)];
const pendingOld=run(crt,twoStructures);
const laterStructureIsolated=run({...crt,confirmed:104,resolved:104},twoStructures);
assert.deepEqual(pendingOld.hits,[],'First unfilled confirmation can keep a later valid structure from being evaluated as a new reaction');
assert.deepEqual(laterStructureIsolated.hits,[106],'The later structure satisfies the same evaluator when not locked behind the earlier pending reaction');
console.log(JSON.stringify({syntheticOnly:true,ltfBars:noisy.length-2,oneParentModel:{freshReaction:fresh.hits,onePerModel:once.hits},impulseWithoutRetest:{pullback:pullback.hits,confirmationClose:market.hits},laterStructure:{oldPending:pendingOld.hits,evaluatedAsNewReaction:laterStructureIsolated.hits},sameTapeBlocked:{oppositeBias:biasBlocked.hits.length,egfWithoutIrl:noIrl.hits.length,noHtfModel:noModel.hits.length}},null,2));
