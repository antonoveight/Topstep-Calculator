const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('indicators/funded-angler-v6.pine','utf8');
const h=require('./helpers/pine-early-c2-harness.cjs').createEarlyHarness(source);
const ref={start:100,finish:112,c1Time:90,c1O:100,c1H:110,c1L:90,c1C:100};
const b=(t,o,hi,l,c)=>({t,o,h:hi,l,c,tc:t+1}),mirror=x=>({...x,o:200-x.o,h:200-x.l,l:200-x.h,c:200-x.c});
const base=[b(100,100,102,89,95),b(101,95,100,94,98),b(102,98,99,93,96),b(103,96,98,94,96),b(104,96,100,95,99),b(105,99,100,94,96),b(106,96,98,95,97)];
let traces=0;
for(const dir of [1,-1]){
 const key=h.make('CrtKey',{kind:3,dir,hi:dir===1?90:110,lo:dir===1?90:110,knownAt:80,beforeTime:90,tf:'60'});
 const opts={bias:dir,...(dir===1?{buyKey:key}:{sellKey:key})};
 const run=(t=base,o={},r={})=>{
  traces++;const state=h.state(),out=[],tape=dir===1?t:t.map(mirror),reference={...ref,...r};
  for(let i=0;i<tape.length;i++){const extra=typeof o==='function'?o(tape[i].t):o;out.push(h.step(reference,state,tape.slice(0,i+1),{...opts,...extra}));}
  return {state,out,hits:out.flatMap((x,i)=>x.hit?[{time:tape[i].t,result:x}]:[])};
 };
 assert.deepEqual(run().hits.map(x=>x.time),[103]);
 assert.deepEqual(run(base,{timing:'Confirmation close'}).hits.map(x=>x.time),[102]);
 assert.deepEqual(run(base,{enabled:false}).hits,[]);
 assert.deepEqual(run(base,{confirmed:false}).hits,[]);
 assert.deepEqual(run(base,{isLtf:false}).hits,[]);
 assert.deepEqual(run(base,{bias:0}).hits,[]);
 assert.deepEqual(run(base,{bias:-dir,allowCrtCounter:false}).hits,[]);
 assert.equal(run(base,{bias:-dir}).hits.length,1);
 assert.deepEqual(run(base,{buyWave:false,sellWave:false}).hits,[]);
 assert.deepEqual(run(base,{confirmedHit:true}).hits,[],'Confirmed C3 takes priority on the same bar');
 const badKey=h.make('CrtKey',{...key,knownAt:91});
 assert.deepEqual(run(base,dir===1?{buyKey:badKey}:{sellKey:badKey}).hits,[]);
 const noKey=h.make('CrtKey');assert.deepEqual(run(base,dir===1?{buyKey:noKey}:{sellKey:noKey}).hits,[]);
 assert.deepEqual(run(base.slice(1)).hits,[],'A truncated C2 must not infer earlier raids');
 assert.deepEqual(run(base.filter(x=>x.t!==101)).hits,[],'Missing a candle inside C2 invalidates the observed path');
 assert.deepEqual(run(base,{}, {finish:104}).hits,[],'Last C2 LTF close is not an Early signal');
 const touch=base.map(x=>({...x,l:Math.max(90,x.l)}));assert.deepEqual(run(touch).hits,[]);
 const double=base.map((x,i)=>i===0?{...x,h:111}:x),doubleRun=run(double);assert.deepEqual(doubleRun.hits,[]);assert.equal(doubleRun.state.status,'E DOUBLE');
 const target=base.map((x,i)=>i===0?{...x,h:110}:x),targetRun=run(target);assert.deepEqual(targetRun.hits,[]);assert.equal(targetRun.state.status,'E TP TAKEN');
 const lost=base.map((x,i)=>i===1?{...x,l:89.5,c:89.75}:x),lostRun=run(lost);assert.deepEqual(lostRun.hits,[]);assert.equal(lostRun.state.status,'E KEY LOST');
 const extension=[...base.slice(0,2),b(102,98,99,88,96),b(103,96,100,94,98),b(104,98,99,93,96),b(105,96,98,94,96)];
 const reset=run(extension);assert.deepEqual(reset.hits.map(x=>x.time),[105]);assert.equal(reset.state.attempts,2);assert.equal(reset.state.lockedSl,dir===1?88:112);
 const post=[...base.slice(0,4),b(104,96,100,88,95)];const frozen=run(post);assert.equal(frozen.hits.length,1);assert.equal(frozen.state.lockedSl,dir===1?89:111);assert.equal(frozen.state.status,'E SL REF');
 const ambiguous=[...base.slice(0,4),b(104,96,111,88,95)];assert.equal(run(ambiguous).state.status,'E AMB');
 const resumed=run(base,t=>t===102?{bias:0}:{});assert.deepEqual(resumed.hits.map(x=>x.time),[106],'Bias recovery requires a new reclaim and TS/retest');assert.equal(resumed.hits[0].result.confirmTime,105);
 for(let n=1;n<=base.length;n++)assert.deepEqual(run(base.slice(0,n)).hits.map(x=>x.time),run().hits.filter(x=>x.time<=base[n-1].t).map(x=>x.time),'Future data cannot insert an earlier E');
 // Switching to a new HTF bucket cannot retain a pending attempt or an emitted lock.
 const state=h.state();for(let i=0;i<3;i++)h.step(ref,state,(dir===1?base:base.map(mirror)).slice(0,i+1),opts);
 const fresh=b(200,100,102,95,98),freshTape=dir===1?[fresh]:[mirror(fresh)];h.step({...ref,start:200,finish:212,c1Time:190},state,freshTape,opts);assert.equal(state.emitted,false);assert.equal(state.reclaimedAt,null);
}
assert.match(source,/enableEarlyC2 = input.bool\(true/);
assert.match(source,/\[open\[1\], high\[1\], low\[1\], close\[1\], time\[1\], time_close\[1\], priorMap\[1\]\]/);
assert.match(source,/f_higherKeyMap\(htf\)/);assert.match(source,/f_higherKeyMap\(biasTf\)/);
assert.match(source,/earlyResult.hit and showEntryTriangles and markLimit > 0/);
assert.match(source,/"E", xloc=xloc.bar_index, yloc=earlyResult.dir == 1 \? yloc.belowbar : yloc.abovebar/);
assert.match(source,/alertcondition\(earlyResult.hit and earlyResult.dir == 1/);
assert.match(source,/if earlyResult.hit and earlyResult.dir == 1\n\s+lastBuyTime := time/);
assert.match(source,/array<ChannelResult> channelResults = array.from\(crtResult\)/,'Early must not enter the confirmed export/drawing channel');
assert.equal(source,fs.readFileSync('chibao.txt','utf8'));
console.log(`PASS ${traces} symmetric actual-source Early C2 traces: closed LTF only, prior key, real raid, later TS/retest, reset/frozen SL, C2 expiry, neutral/CT/wave gates, single event, no backdating and separate confirmed channel. Synthetic only.`);
