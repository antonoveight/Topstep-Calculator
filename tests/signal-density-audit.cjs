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
  const hit=harness.step(ctx,state,tape.slice(0,j+1),{...options,...options.pivots?.[tape[j].t]});
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
assert.deepEqual(fresh.hits,[102],'Micro color changes without confirmed new structure cannot repeatedly rearm');
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
const twoStructures=[...start,bar(100,105,106,102,103),bar(101,103,107,102,106),bar(102,106,109,106.5,108),bar(103,108,112,108,111),bar(104,111,112,108.5,109),bar(105,109,113,109,112),bar(106,112,113,110.5,111.5),bar(107,111.5,113,110.8,111.6)];
const pendingOld=run(crt,twoStructures,{pivots:{106:{pivotLow:108.5}}});
const laterStructureIsolated=run({...crt,confirmed:104,resolved:104},twoStructures,{pivots:{106:{pivotLow:108.5}}});
assert.deepEqual(pendingOld.hits,[107],'A confirmed new pullback replaces the unfilled earlier reaction, then waits a later retest');
assert.deepEqual(laterStructureIsolated.hits,[106],'Isolated structure can confirm earlier; replacement never backdates to that bar');
const renewed=[...noisy.slice(0,5),bar(103,105.5,110,105,109),bar(104,109,110,106,107),bar(105,107,112,107,111),bar(106,111,112,108,110),bar(107,110,112,108.5,110.5)];
assert.deepEqual(run(crt,renewed,{pivots:{106:{pivotLow:106}}}).hits,[102,107],'A real post-signal pivot and progress permit a fresh entry');
assert.deepEqual(run(crt,renewed,{cadence:'One per model',pivots:{106:{pivotLow:106}}}).hits,[102]);
const mirror=tape=>tape.map(b=>bar(b.t,200-b.o,200-b.l,200-b.h,200-b.c));
const sell={...crt,dir:-1,hi:110,lo:80,inv:110,cp:80};
assert.deepEqual(run(sell,mirror(renewed),{pivots:{106:{pivotHigh:94}}}).hits,[102,107],'Structural rearm is symmetric for Sell');
assert.deepEqual(run(sell,mirror(twoStructures),{pivots:{106:{pivotHigh:91.5}}}).hits,[107],'Pending replacement is symmetric for Sell');
assert.deepEqual(run(crt,renewed,{pivots:{106:{pivotLow:106}},waveAllowed:false}).hits,[],'Wave gating blocks signals before state is consumed');
// Execute the actual global wave predicate around independent channel states.
const waveExpr=source.match(/    bool waveAllowed = (.+)/)[1].replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\b/g,'!');
const allow=Function('ctx','lastBuyTime','lastSellTime','bar_index','lastBuyBar','lastSellBar','lastPivotLowTime','lastPivotHighTime','na','return '+waveExpr);
function runTogether(tape,contexts,pivots={}){
 const states=contexts.map(c=>harness.state(c)),hits=[],statuses=[];let lastBuy=null,lastBuyBar=null,pivotTime=null;
 for(let j=2;j<tape.length;j++){
  if(pivots[tape[j].t])pivotTime=tape[j-2].t;
  for(let k=0;k<contexts.length;k++){
   const gate=allow(contexts[k],lastBuy,null,j,lastBuyBar,null,pivotTime,null,x=>x==null);
   const result=harness.step(contexts[k],states[k],tape.slice(0,j+1),{...pivots[tape[j].t],waveAllowed:gate});
   statuses.push({t:tape[j].t,k,status:result.status});
   if(result.hit){hits.push({t:tape[j].t,k});lastBuy=tape[j].t;lastBuyBar=j;}
  }
 }
 return {hits,statuses,states};
}
const staggered=runTogether(noisy,[crt,{...crt,id:2,confirmed:104,resolved:104}]);
assert.deepEqual(staggered.hits,[{t:102,k:0}],'New model/channel cannot trail a same-direction signal without a later confirmed pivot');
assert.ok(staggered.statuses.some(s=>s.k===1&&s.status==='WAVE WAIT'));
assert.equal(staggered.states[1].sent,false,'Blocked sibling remains pending, not falsely consumed');
const sameBar=runTogether(noisy,[crt,{...crt,id:2}]);
assert.deepEqual(sameBar.hits,[{t:102,k:0},{t:102,k:1}],'Same-bar provenance remains available for one combined triangle');
const nextWave=runTogether(renewed,[crt,{...crt,id:2,confirmed:104,resolved:104}],{106:{pivotLow:106}});
assert.deepEqual(nextWave.hits,[{t:102,k:0},{t:106,k:1}],'New confirmed wave accepts its first valid trigger and suppresses a trailing sibling on the next candle');
console.log(JSON.stringify({syntheticOnly:true,ltfBars:noisy.length-2,oneParentModel:{freshReaction:fresh.hits,onePerModel:once.hits},impulseWithoutRetest:{pullback:pullback.hits,confirmationClose:market.hits},laterStructure:{oldPending:pendingOld.hits,evaluatedAsNewReaction:laterStructureIsolated.hits},sameTapeBlocked:{oppositeBias:biasBlocked.hits.length,egfWithoutIrl:noIrl.hits.length,noHtfModel:noModel.hits.length}},null,2));
